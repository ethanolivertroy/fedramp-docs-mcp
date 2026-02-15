import { z } from "zod";

import { listKsiItems } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  id: z.string().optional().describe("Filter by KSI item ID (e.g. KSI-IAM-AAM)"),
  text: z.string().optional().describe("Free-text search within KSI titles and descriptions"),
  category: z.string().optional().describe("Filter by KSI theme category (e.g. IAM, CNA, MLA)"),
  status: z.string().optional().describe("Filter by KSI status (e.g. active, retired)"),
  limit: z.number().int().min(1).max(200).default(100).describe("Maximum number of results to return"),
  offset: z.number().int().min(0).default(0).describe("Number of results to skip for pagination"),
});

export const listKsiTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof listKsiItems>
> = {
  name: "list_ksi",
  title: "List Key Security Indicators",
  description:
    "List individual KSI indicator entries (like KSI-IAM-AAM, KSI-CNA-CIC) with optional filters for id, text search, category, and status. To see full KSI theme data, use get_frmr_document with path `FRMR.documentation.json#KSI`. Supports pagination via limit and offset. [Category: KSI]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
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
