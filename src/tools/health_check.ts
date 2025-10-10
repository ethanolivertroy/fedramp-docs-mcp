import { z } from "zod";

import { healthCheck } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const healthCheckTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof healthCheck>
> = {
  name: "health_check",
  description:
    "Verify the index is ready and report repository path plus file counts.",
  schema,
  execute: async () => healthCheck(),
};
