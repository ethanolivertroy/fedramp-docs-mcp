import { z } from "zod";

import { listControlMappings } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  family: z.string().optional(),
  control: z.string().optional(),
  source: z
    .enum([
      "KSI", "MAS", "VDR", "SCN", "FRD", "ADS",
      "CCM", "FSI", "ICP", "PVA", "RSC", "UCM",
      "unknown",
    ])
    .optional(),
});

export const listControlsTool: ToolDefinition<
  typeof schema,
  { mappings: ReturnType<typeof listControlMappings> }
> = {
  name: "list_controls",
  description: "Return flattened control mappings across FRMR sets.",
  schema,
  execute: async (input) => {
    const mappings = listControlMappings({
      family: input.family,
      control: input.control,
      source: input.source,
    });
    return { mappings };
  },
};
