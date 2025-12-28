import { z } from "zod";

import { getKsiItems } from "../indexer.js";
import type { KsiItem } from "../types.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  impact: z
    .enum(["low", "moderate", "high"])
    .describe("Filter KSI items by impact level"),
  limit: z.number().int().min(1).max(200).default(100),
  offset: z.number().int().min(0).default(0),
});

export const filterByImpactTool: ToolDefinition<
  typeof schema,
  { total: number; items: KsiItem[] }
> = {
  name: "filter_by_impact",
  description:
    "Filter Key Security Indicators (KSI) by impact level. Returns all KSI items that apply to the specified impact level (low, moderate, or high).",
  schema,
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
