import { z } from "zod";

import { listControlMappings } from "../frmr.js";
import { getKsiItems } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

interface ControlRequirement {
  sourceId: string;
  source: string;
  control: string;
  enhancements: string[];
  path: string;
  title?: string;
  description?: string;
  theme?: string;
}

const schema = z.object({
  control: z
    .string()
    .describe("NIST control ID (e.g., AC-2, SC-13, IA-5)"),
});

export const getControlRequirementsTool: ToolDefinition<
  typeof schema,
  { control: string; total: number; requirements: ControlRequirement[] }
> = {
  name: "get_control_requirements",
  description:
    "Get all FedRAMP requirements mapped to a specific NIST control. Returns KSI items and FRMR requirements that reference the control.",
  schema,
  execute: async (input) => {
    const mappings = listControlMappings({ control: input.control });
    const ksiItems = getKsiItems();

    // Create a lookup for KSI items
    const ksiLookup = new Map(ksiItems.map((item) => [item.id, item]));

    const requirements: ControlRequirement[] = mappings.map((mapping) => {
      const ksiItem = ksiLookup.get(mapping.sourceId);
      return {
        sourceId: mapping.sourceId,
        source: mapping.source,
        control: mapping.control,
        enhancements: mapping.controlEnhancements,
        path: mapping.path,
        title: ksiItem?.title,
        description: ksiItem?.description,
        theme: ksiItem?.category,
      };
    });

    // Deduplicate by sourceId
    const seen = new Set<string>();
    const unique = requirements.filter((req) => {
      if (seen.has(req.sourceId)) return false;
      seen.add(req.sourceId);
      return true;
    });

    return {
      control: input.control.toUpperCase(),
      total: unique.length,
      requirements: unique,
    };
  },
};
