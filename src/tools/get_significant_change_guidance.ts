import { z } from "zod";

import { getSignificantChangeGuidance } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
});

export const significantChangeTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof getSignificantChangeGuidance>
> = {
  name: "get_significant_change_guidance",
  description:
    "Aggregate markdown sections and FRMR references related to Significant Change.",
  schema,
  execute: async (input) => {
    return getSignificantChangeGuidance(input.limit ?? 50);
  },
};
