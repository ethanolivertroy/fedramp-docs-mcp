import { z } from "zod";

import { getKsiItems } from "../indexer.js";
import type { KsiItem } from "../types.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  impact: z
    .enum(["low", "moderate", "high"])
    .describe("Impact level to filter by: low, moderate, or high"),
  limit: z.number().int().min(1).max(200).default(100).describe("Maximum number of results to return"),
  offset: z.number().int().min(0).default(0).describe("Number of results to skip for pagination"),
});

export const filterByImpactTool: ToolDefinition<
  typeof schema,
  { total: number; items: KsiItem[] }
> = {
  name: "filter_by_impact",
  title: "Filter KSI by Impact Level",
  description:
    "Filter Key Security Indicators (KSI) by FIPS 199 impact level. Returns all KSI items that apply to the specified impact level (low, moderate, or high). Useful for scoping compliance requirements to your system's authorization level. [Category: KSI]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const all = getKsiItems();
    const filtered = all.filter((item) => {
      if (!item.impact) return false;
      return item.impact[input.impact] === true;
    });

    return {
      total: filtered.length,
      items: filtered.slice(input.offset, input.offset + input.limit),
    };
  },
};
