import { z } from "zod";

import { getKsiItems } from "../indexer.js";
import { searchMarkdown } from "../search.js";
import type { KsiItem } from "../types.js";
import type { ToolDefinition } from "./base.js";

// KSI theme names for better descriptions
const THEME_NAMES: Record<string, string> = {
  AFR: "Authorization & FedRAMP Requirements",
  CED: "Customer Environment & Data",
  CMT: "Change Management & Testing",
  CNA: "Cloud Native Architecture",
  IAM: "Identity & Access Management",
  INR: "Incident Response",
  MLA: "Monitoring, Logging & Alerting",
  PIY: "Privacy & PII",
  RPL: "Resiliency & Planning",
  SVC: "Service Configuration",
  TPR: "Third Party Risk",
};

interface ThemeSummary {
  theme: string;
  themeName: string;
  indicatorCount: number;
  indicators: KsiItem[];
  impactBreakdown: {
    low: number;
    moderate: number;
    high: number;
  };
  relatedControls: string[];
  relatedDocs: Array<{ path: string; snippet: string }>;
}

const schema = z.object({
  theme: z
    .enum(["AFR", "CED", "CMT", "CNA", "IAM", "INR", "MLA", "PIY", "RPL", "SVC", "TPR"])
    .describe("KSI theme code"),
});

export const getThemeSummaryTool: ToolDefinition<typeof schema, ThemeSummary> =
  {
    name: "get_theme_summary",
    description:
      "Get comprehensive guidance for a KSI theme. Returns all indicators in the theme, impact breakdown, related NIST controls, and links to relevant documentation.",
    schema,
    execute: async (input) => {
      const all = getKsiItems();
      const indicators = all.filter(
        (item) => item.category?.toUpperCase() === input.theme,
      );

      // Count impact levels
      const impactBreakdown = { low: 0, moderate: 0, high: 0 };
      for (const item of indicators) {
        if (item.impact?.low) impactBreakdown.low++;
        if (item.impact?.moderate) impactBreakdown.moderate++;
        if (item.impact?.high) impactBreakdown.high++;
      }

      // Collect related controls
      const controlSet = new Set<string>();
      for (const item of indicators) {
        if (item.controlMapping) {
          for (const control of item.controlMapping) {
            controlSet.add(control);
          }
        }
      }

      // Search markdown for related guidance
      const themeName = THEME_NAMES[input.theme] ?? input.theme;
      const searchTerms = [themeName, input.theme];
      const relatedDocs: Array<{ path: string; snippet: string }> = [];

      for (const term of searchTerms) {
        try {
          const results = searchMarkdown(term, 5, 0);
          for (const hit of results.hits) {
            if (!relatedDocs.some((d) => d.path === hit.path)) {
              relatedDocs.push({ path: hit.path, snippet: hit.snippet });
            }
          }
        } catch {
          // Search might fail for some terms, continue
        }
      }

      return {
        theme: input.theme,
        themeName,
        indicatorCount: indicators.length,
        indicators,
        impactBreakdown,
        relatedControls: [...controlSet].sort(),
        relatedDocs: relatedDocs.slice(0, 5),
      };
    },
  };
