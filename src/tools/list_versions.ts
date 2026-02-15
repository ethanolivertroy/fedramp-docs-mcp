import { z } from "zod";

import { listVersions } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const listVersionsTool: ToolDefinition<
  typeof schema,
  { versions: ReturnType<typeof listVersions> }
> = {
  name: "list_versions",
  title: "List FRMR Versions",
  description:
    "List detected FRMR versions and associated metadata from documents. Use this to discover available dataset versions for comparison with diff_frmr. Returns version strings, document types, and timestamps. [Category: Discovery]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async () => {
    return { versions: listVersions() };
  },
};
