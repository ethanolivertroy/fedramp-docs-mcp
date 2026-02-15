import { z } from "zod";

import { getFrmrDocument } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  type: z
    .enum([
      "KSI",
      "MAS",
      "VDR",
      "SCN",
      "FRD",
      "ADS",
      "CCM",
      "FSI",
      "ICP",
      "PVA",
      "SCG",
      "UCM",
      "unknown",
    ])
    .optional()
    .describe("FRMR document type code"),
  path: z.string().describe("Virtual path to the FRMR document (e.g. FRMR.documentation.json#KSI)"),
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
  title: "Get FRMR Document",
  description:
    "Retrieve a FRMR document with metadata, raw JSON, and summary. First use list_frmr_documents to find available virtual paths (for example `FRMR.documentation.json#KSI` or `FRMR.documentation.json#FRR.MAS`). Returns full document content for KSI, MAS, VDR, SCN, FRD, and other FRMR types. [Category: Discovery]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
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
