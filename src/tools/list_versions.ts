import { z } from "zod";

import { listVersions } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const listVersionsTool: ToolDefinition<
  typeof schema,
  { versions: ReturnType<typeof listVersions> }
> = {
  name: "list_versions",
  description:
    "List detected FRMR versions and associated metadata from documents.",
  schema,
  execute: async () => {
    return { versions: listVersions() };
  },
};
