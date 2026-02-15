import { z } from "zod";

import { listFrmrDocuments } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const listFrmrDocumentsTool: ToolDefinition<
  typeof schema,
  { documents: ReturnType<typeof listFrmrDocuments> }
> = {
  name: "list_frmr_documents",
  title: "List FRMR Documents",
  description:
    "List available FRMR documents and metadata. This is usually the first tool to call to discover available virtual sections from `FRMR.documentation.json` (for example `#KSI`, `#FRD`, and `#FRR.MAS`). Returns document types, paths, item counts, and top-level keys. [Category: Discovery]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async () => {
    const documents = listFrmrDocuments();
    return { documents };
  },
};
