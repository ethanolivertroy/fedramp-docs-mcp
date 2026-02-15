import { z } from "zod";

import { diffFrmrDocuments } from "../diff.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  left_path: z.string().describe("Path to the older FRMR document version for comparison"),
  right_path: z.string().describe("Path to the newer FRMR document version for comparison"),
  id_key: z.string().optional().describe("JSON key used as the item identifier for diff matching (auto-detected if omitted)"),
});

export const diffFrmrTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof diffFrmrDocuments>
> = {
  name: "diff_frmr",
  title: "Diff FRMR Documents",
  description:
    "Compute a structured diff between two FRMR documents by identifier. Compares versions side-by-side showing added, removed, and modified items with field-level change details. Use list_versions to discover available versions for comparison. [Category: Analysis]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    return diffFrmrDocuments(input.left_path, input.right_path, {
      idKey: input.id_key,
    });
  },
};
