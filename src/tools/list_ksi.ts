import { z } from "zod";

import { listKsiItems } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(100),
  offset: z.number().int().min(0).default(0),
});

export const listKsiTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof listKsiItems>
> = {
  name: "list_ksi",
  description: "List individual KSI requirement entries (like KSI-IAM-01, KSI-CNA-02) with optional filters. To see all KSI categories and their descriptions, use get_frmr_document with path 'FRMR.KSI.key-security-indicators.json' instead. This tool filters specific requirements within categories.",
  schema,
  execute: async (input) => {
    const result = listKsiItems({
      id: input.id,
      text: input.text,
      category: input.category,
      status: input.status,
      limit: input.limit ?? 100,
      offset: input.offset ?? 0,
    });
    return result;
  },
};
