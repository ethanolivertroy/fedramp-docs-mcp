import { z } from "zod";

import { getKsiItems } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

interface EvidenceItem {
  ksiId: string;
  ksiTitle: string;
  theme: string;
  evidenceExamples: string[];
}

const schema = z.object({
  theme: z
    .string()
    .optional()
    .describe("Filter by KSI theme (e.g., IAM, CNA, AFR)"),
  id: z.string().optional().describe("Get evidence for a specific KSI item ID"),
});

export const getEvidenceChecklistTool: ToolDefinition<
  typeof schema,
  { total: number; items: EvidenceItem[]; allEvidence: string[] }
> = {
  name: "get_evidence_checklist",
  description:
    "Collect evidence examples from KSI requirements. Returns a checklist of what evidence is needed for compliance. Filter by theme or specific KSI ID.",
  schema,
  execute: async (input) => {
    const all = getKsiItems();
    let filtered = all.filter((item) => item.evidenceExamples?.length);

    if (input.theme) {
      const themeLower = input.theme.toLowerCase();
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === themeLower,
      );
    }

    if (input.id) {
      filtered = filtered.filter((item) => item.id === input.id);
    }

    const items: EvidenceItem[] = filtered.map((item) => ({
      ksiId: item.id,
      ksiTitle: item.title ?? "",
      theme: item.category ?? "",
      evidenceExamples: item.evidenceExamples ?? [],
    }));

    // Collect all unique evidence examples
    const allEvidence = [
      ...new Set(items.flatMap((item) => item.evidenceExamples)),
    ].sort();

    return {
      total: items.length,
      items,
      allEvidence,
    };
  },
};
