#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { buildIndex } from "./indexer.js";
import { ensureRepoReady } from "./repo.js";
import { registerTools } from "./tools/register.js";
import { startTimer } from "./util.js";

async function main(): Promise<void> {
  const timer = startTimer();
  await ensureRepoReady();
  await buildIndex();
  const indexMs = timer.stop();

  const server = new McpServer({
    name: "fedramp-docs-mcp",
    version: "0.1.0",
  });

  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(
    `fedramp-docs-mcp server ready (index built in ${indexMs.toFixed(0)}ms)`,
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
