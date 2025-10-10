import { z } from "zod";

import { listFrmrDocuments } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const listFrmrDocumentsTool: ToolDefinition<
  typeof schema,
  { documents: ReturnType<typeof listFrmrDocuments> }
> = {
  name: "list_frmr_documents",
  description: "List available FRMR JSON documents and metadata. This is usually the first tool to call to discover what FedRAMP data is available. Returns KSI (Key Security Indicators), MAS (Minimum Assessment Standard), VDR (Vulnerability Detection), SCN (Significant Change Notifications), FRD (Definitions), and ADS (Authorization Data Sharing) documents.",
  schema,
  execute: async () => {
    const documents = listFrmrDocuments();
    return { documents };
  },
};
