import { z } from "zod";

import { forceUpdateRepo } from "../repo.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({});

export const updateRepositoryTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof forceUpdateRepo>
> = {
  name: "update_repository",
  title: "Update Repository",
  description:
    "Force update the cached FedRAMP docs repository to get the latest data. This fetches and resets to the latest version from GitHub. The server automatically checks for updates every 24 hours by default, but you can use this tool to update immediately. After updating, you may need to restart the MCP server or rebuild the index to see changes. [Category: System]",
  schema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  execute: async () => {
    return await forceUpdateRepo();
  },
};
