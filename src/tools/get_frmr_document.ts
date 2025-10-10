import { z } from "zod";

import { getFrmrDocument } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  type: z
    .enum(["KSI", "MAS", "VDR", "SCN", "FRD", "ADS"])
    .optional(),
  path: z.string(),
});

export const getFrmrDocumentTool: ToolDefinition<
  typeof schema,
  {
    meta: ReturnType<typeof getFrmrDocument>["meta"];
    raw_json: string;
    summary: ReturnType<typeof getFrmrDocument>["summary"];
  }
> = {
  name: "get_frmr_document",
  description: "Retrieve a FRMR document with metadata, raw JSON, and summary. Use this to get KSI categories (like KSI-IAM, KSI-CNA), MAS requirements, or other FRMR content. First use list_frmr_documents to find available documents, then use this tool with the path. For KSI, use path 'FRMR.KSI.key-security-indicators.json'.",
  schema,
  execute: async (input) => {
    const { meta, rawJson, summary } = getFrmrDocument(
      input.type as never,
      input.path,
    );
    return {
      meta,
      raw_json: rawJson,
      summary,
    };
  },
};
