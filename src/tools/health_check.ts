import { z } from "zod";

import { healthCheck } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const healthCheckTool: ToolDefinition<
  typeof schema,
  Awaited<ReturnType<typeof healthCheck>>
> = {
  name: "health_check",
  description:
    "Verify the index is ready and report status. Returns: indexed file count, repository path, FedRAMP docs commit hash and date, last update check time, and auto-update settings.",
  schema,
  execute: async () => healthCheck(),
};
