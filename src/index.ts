#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { existsSync, mkdirSync, cpSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { buildIndex } from "./indexer.js";
import { ensureRepoReady } from "./repo.js";
import { registerTools } from "./tools/register.js";
import { startTimer } from "./util.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Handle CLI commands before starting MCP server
const command = process.argv[2];
if (command === "setup" || command === "mcp-config" || command === "help" || command === "--help") {
  handleCliCommand(command);
  process.exit(0);
}

function handleCliCommand(cmd: string): void {
  if (cmd === "setup") {
    setupPlugin();
  } else if (cmd === "mcp-config") {
    printMcpConfig();
  } else {
    printHelp();
  }
}

function setupPlugin(): void {
  const home = homedir();
  const installDir = join(home, ".fedramp-docs-mcp");
  const pluginDir = join(installDir, "plugin");

  console.log("\n🔧 FedRAMP Docs MCP Plugin Setup\n");

  // Create install directory
  if (!existsSync(installDir)) {
    mkdirSync(installDir, { recursive: true });
    console.log(`✓ Created ${installDir}`);
  }

  // Find the plugin source directory
  const packageRoot = join(__dirname, "..");
  const sourcePluginDir = join(packageRoot, "plugin");

  if (!existsSync(sourcePluginDir)) {
    console.error(`✗ Plugin source not found at ${sourcePluginDir}`);
    console.error("  Make sure the package was installed correctly.");
    process.exit(1);
  }

  // Copy plugin files
  try {
    cpSync(sourcePluginDir, pluginDir, { recursive: true });
    console.log(`✓ Installed plugin to ${pluginDir}`);
  } catch (err) {
    console.error(`✗ Failed to copy plugin files: ${err}`);
    process.exit(1);
  }

  // Update .mcp.json to use npx for the command
  const mcpJsonPath = join(pluginDir, ".mcp.json");
  const mcpConfig = {
    mcpServers: {
      "fedramp-docs": {
        command: "npx",
        args: ["fedramp-docs-mcp"],
        env: {
          FEDRAMP_DOCS_AUTO_UPDATE: "true",
        },
      },
    },
  };
  writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + "\n");
  console.log(`✓ Updated MCP configuration`);

  console.log(`
✅ Installation complete!

To use the plugin with Claude Code:

  claude --plugin-dir ${pluginDir}

Or add an alias to your shell profile (.bashrc, .zshrc):

  alias claude-fedramp='claude --plugin-dir ${pluginDir}'

Available slash commands:
  /search           - Search FedRAMP documentation
  /list-documents   - List all FRMR documents
  /list-ksi         - List Key Security Indicators
  /list-controls    - List NIST control mappings
  /compare-versions - Compare document versions
  /health           - Check MCP server status
`);
}

function printMcpConfig(): void {
  const config = {
    mcpServers: {
      "fedramp-docs": {
        command: "npx",
        args: ["fedramp-docs-mcp"],
        env: {
          FEDRAMP_DOCS_AUTO_UPDATE: "true",
        },
      },
    },
  };

  console.log(`
Add this to your MCP settings:

${JSON.stringify(config, null, 2)}

File locations:
  Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json
  Claude Code:    ~/.claude.json (mcpServers section)
`);
}

function printHelp(): void {
  console.log(`
FedRAMP Docs MCP Server

Usage:
  npx fedramp-docs-mcp            Start the MCP server (for MCP clients)
  npx fedramp-docs-mcp setup      Install Claude Code plugin
  npx fedramp-docs-mcp mcp-config Print MCP server configuration
  npx fedramp-docs-mcp help       Show this help message

Examples:
  # Install plugin and use with Claude Code
  npx fedramp-docs-mcp setup
  claude --plugin-dir ~/.fedramp-docs-mcp/plugin

  # Add to Claude Desktop config
  npx fedramp-docs-mcp mcp-config

Learn more: https://github.com/ethanolivertroy/fedramp-docs-mcp
`);
}

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
