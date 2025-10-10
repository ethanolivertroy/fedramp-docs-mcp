import { z } from "zod";

import { diffFrmrDocuments } from "../diff.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  left_path: z.string(),
  right_path: z.string(),
  id_key: z.string().optional(),
});

export const diffFrmrTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof diffFrmrDocuments>
> = {
  name: "diff_frmr",
  description:
    "Compute a structured diff between two FRMR documents by identifier.",
  schema,
  execute: async (input) => {
    return diffFrmrDocuments(input.left_path, input.right_path, {
      idKey: input.id_key,
    });
  },
};
