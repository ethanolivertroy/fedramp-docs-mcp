import { z } from "zod";

import { listControlMappings } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  family: z.string().optional().describe("Filter by NIST control family (e.g. AC, SC, IA)"),
  control: z.string().optional().describe("Filter by specific NIST control ID (e.g. AC-2, SC-13)"),
  source: z
    .enum([
      "KSI", "MAS", "VDR", "SCN", "FRD", "ADS",
      "CCM", "FSI", "ICP", "PVA", "SCG", "UCM",
      "unknown",
    ])
    .optional()
    .describe("Filter by FRMR source document type"),
});

export const listControlsTool: ToolDefinition<
  typeof schema,
  { mappings: ReturnType<typeof listControlMappings> }
> = {
  name: "list_controls",
  title: "List Control Mappings",
  description:
    "Return flattened NIST control mappings across all FRMR document sets. Filter by control family (e.g. AC, IA), specific control ID, or source document type. Shows which FedRAMP requirements map to which NIST 800-53 controls. [Category: Controls]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const mappings = listControlMappings({
      family: input.family,
      control: input.control,
      source: input.source,
    });
    return { mappings };
  },
};
