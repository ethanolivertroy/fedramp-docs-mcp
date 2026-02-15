import { z } from "zod";

import { getSignificantChangeGuidance } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of guidance entries to return"),
});

export const significantChangeTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof getSignificantChangeGuidance>
> = {
  name: "get_significant_change_guidance",
  title: "Get Significant Change Guidance",
  description:
    "Aggregate markdown sections and FRMR references related to FedRAMP Significant Change. Returns curated guidance on what constitutes a significant change, notification requirements, and assessment implications. Essential for understanding when changes to a cloud system require FedRAMP re-assessment. [Category: Analysis]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    return getSignificantChangeGuidance(input.limit ?? 50);
  },
};
