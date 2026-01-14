# Quick Start Guide

Get fedramp-docs-mcp running in under 5 minutes.

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ (included with Node.js)

```bash
node --version  # Should be v18.0.0 or later
```

## Installation

Choose one method:

### Option 1: npx (Recommended)

No installation needed. Run directly:

```bash
npx fedramp-docs-mcp
```

### Option 2: npm Global Install

```bash
npm install -g fedramp-docs-mcp
fedramp-docs-mcp
```

### Option 3: Docker

```bash
docker run -it ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest
```

## Configure Your MCP Client

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"]
    }
  }
}
```

Restart Claude Desktop.

### Cursor

Add to MCP settings:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"]
    }
  }
}
```

## Verify It Works

Ask your AI assistant:

> "Run the health_check tool from fedramp-docs"

You should see a response with repository path and indexed file counts.

## First Queries

Try these prompts:

> "List all Key Security Indicators related to identity management"

> "What FedRAMP requirements map to NIST control AC-2?"

> "Search the FedRAMP docs for continuous monitoring guidance"

> "Get a summary of the IAM theme with all related KSIs"

## Available Tools

| Tool | Purpose |
|------|---------|
| `health_check` | Verify server status |
| `list_ksi` | Browse Key Security Indicators |
| `get_ksi` | Get specific KSI details |
| `get_theme_summary` | All KSIs for a theme |
| `get_control_requirements` | FedRAMP requirements for a NIST control |
| `search_markdown` | Full-text search of docs |

See [Tools Reference](docs/reference/tools.md) for all 20 tools.

## What's Next?

- [Full Documentation](docs/README.md) - Complete guides and reference
- [MCP Client Setup](docs/guides/mcp-clients.md) - Configure other clients
- [Docker Setup](docs/setup/docker.md) - Container deployment
- [Security Hardening](docs/setup/security-hardening.md) - Production configs

## Troubleshooting

**First run is slow?** The server clones FedRAMP/docs (~50MB) on first run.

**Server not appearing in client?** Check JSON syntax in config file, then restart the client.

**Need help?** See [Troubleshooting Guide](docs/guides/troubleshooting.md) or [open an issue](https://github.com/ethanolivertroy/fedramp-docs-mcp/issues).
