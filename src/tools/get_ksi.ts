import { z } from "zod";

import { getKsiItem } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  id: z.string().describe("KSI item ID (e.g. KSI-IAM-AAM, KSI-CNA-CIC)"),
});

export const getKsiTool: ToolDefinition<
  typeof schema,
  { item: ReturnType<typeof getKsiItem> }
> = {
  name: "get_ksi",
  title: "Get KSI Item",
  description:
    "Retrieve a single Key Security Indicator entry by its ID. Returns the full KSI item including title, description, statement, impact levels, control mappings, and evidence examples. Use list_ksi to discover available IDs. [Category: KSI]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const item = getKsiItem(input.id);
    return { item };
  },
};
