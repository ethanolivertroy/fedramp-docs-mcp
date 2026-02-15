import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

import { getKsiItems } from "../indexer.js";
import type { EvidenceExamplesData, EvidenceItem, KsiItem, KsiRetiredInfo } from "../types.js";
import type { ToolDefinition } from "./base.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface EvidenceExampleItem {
  ksiId: string;
  ksiName: string;
  ksiStatement?: string;
  theme: string;
  impact?: { low?: boolean; moderate?: boolean; high?: boolean };
  evidence: EvidenceItem[];
  retired?: KsiRetiredInfo;
}

interface EvidenceExamplesResult {
  disclaimer: string;
  total: number;
  items: EvidenceExampleItem[];
  themes: string[];
}

// Load evidence examples from data file
function loadEvidenceExamples(): EvidenceExamplesData | null {
  try {
    // Look for evidence-examples.json in data directory (relative to package root)
    const dataPath = join(__dirname, "..", "..", "data", "evidence-examples.json");
    const content = readFileSync(dataPath, "utf-8");
    return JSON.parse(content) as EvidenceExamplesData;
  } catch {
    // If file doesn't exist or can't be parsed, return null
    return null;
  }
}

const schema = z.object({
  theme: z
    .string()
    .optional()
    .describe("Filter by KSI theme (e.g., IAM, CNA, AFR)"),
  id: z.string().optional().describe("Get evidence for a specific KSI item ID (e.g. KSI-IAM-AAM)"),
  includeRetired: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include retired KSIs in results (default: true for backwards compatibility)"),
});

export const getEvidenceExamplesTool: ToolDefinition<
  typeof schema,
  EvidenceExamplesResult
> = {
  name: "get_evidence_examples",
  title: "Get Evidence Examples",
  description:
    "Get suggested evidence examples for KSI compliance. Returns automation-friendly evidence collection sources (APIs, CLI commands, artifacts) for each KSI. Useful for building compliance automation, audit preparation, and evidence collection checklists. NOTE: These are community suggestions, not official FedRAMP guidance. [Category: KSI]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const evidenceData = loadEvidenceExamples();
    const ksiItems = getKsiItems();

    const disclaimer = evidenceData?.disclaimer ??
      "These evidence examples are community suggestions to help with FedRAMP compliance automation. They are NOT official FedRAMP guidance. Always verify requirements with official FedRAMP documentation at https://fedramp.gov";

    // Filter KSI items based on input
    let filtered: KsiItem[] = ksiItems;

    if (input.theme) {
      const themeLower = input.theme.toLowerCase();
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === themeLower,
      );
    }

    if (input.id) {
      const idUpper = input.id.toUpperCase();
      filtered = filtered.filter((item) => item.id.toUpperCase() === idUpper);
    }

    // Build example items with evidence examples
    let items: EvidenceExampleItem[] = filtered.map((ksi) => {
      // Get evidence examples for this KSI from our data file
      const evidenceExample = evidenceData?.examples[ksi.id];

      return {
        ksiId: ksi.id,
        ksiName: ksi.title ?? evidenceExample?.name ?? ksi.id,
        ksiStatement: ksi.statement ?? ksi.description,
        theme: ksi.category ?? ksi.theme ?? "",
        impact: ksi.impact,
        evidence: evidenceExample?.evidence ?? [],
        retired: evidenceExample?.retired,
      };
    });

    // Filter out retired KSIs if requested
    if (input.includeRetired === false) {
      items = items.filter((item) => !item.retired);
    }

    // Get unique themes
    const themes = [...new Set(items.map((item) => item.theme).filter(Boolean))].sort();

    return {
      disclaimer,
      total: items.length,
      items,
      themes,
    };
  },
};
