# MCP Client Configuration

This guide covers configuring various MCP clients to use fedramp-docs-mcp.

## Claude Desktop

### macOS

1. Open your Claude Desktop config file:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Add the fedramp-docs-mcp server:

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

3. Restart Claude Desktop

### Windows

1. Open config at `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration (same JSON as above)

3. Restart Claude Desktop

### Verify Installation

In Claude Desktop, type:
> "Use the fedramp-docs MCP server to run a health check"

You should see a response showing indexed file counts and repository information.

## Cursor

1. Open Cursor Settings > MCP

2. Add server configuration:

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

3. Restart Cursor

## VS Code with Continue

1. Install the [Continue extension](https://marketplace.visualstudio.com/items?itemName=Continue.continue)

2. Open Continue config (`~/.continue/config.json`)

3. Add MCP server:

```json
{
  "mcpServers": [
    {
      "name": "fedramp-docs",
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"]
    }
  ]
}
```

## Zed

1. Open Zed settings

2. Add to the `language_servers` section:

```json
{
  "language_servers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"]
    }
  }
}
```

## LM Studio

If LM Studio supports MCP servers:

1. Navigate to the MCP/Tools configuration
2. Add server with command: `npx -y fedramp-docs-mcp`

## Generic MCP Client Configuration

For any MCP client that supports stdio transport:

| Field | Value |
|-------|-------|
| Command | `npx` |
| Arguments | `-y fedramp-docs-mcp` |
| Transport | stdio |

Or if globally installed:

| Field | Value |
|-------|-------|
| Command | `fedramp-docs-mcp` |
| Arguments | (none) |
| Transport | stdio |

## Docker-Based Configuration

For clients that support Docker:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "fedramp-cache:/root/.cache/fedramp-docs",
        "ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest"
      ]
    }
  }
}
```

## With Environment Variables

To customize behavior:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true",
        "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "12"
      }
    }
  }
}
```

## Using a Local Build

If you've built from source:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "node",
      "args": ["/path/to/fedramp-docs-mcp/dist/index.js"]
    }
  }
}
```

## Troubleshooting Client Issues

### Server not appearing in client

1. Check the config file syntax (valid JSON)
2. Ensure the command path is correct
3. Restart the MCP client application

### "Command not found" errors

Ensure Node.js and npm are in your PATH:

```bash
which node
which npx
```

For Docker-based setup, ensure Docker is running:

```bash
docker info
```

### Permission denied

On Unix systems:

```bash
# Ensure npm global bin is in PATH
export PATH="$PATH:$(npm config get prefix)/bin"
```

### First run is slow

The first run clones the FedRAMP/docs repository (~50MB). Subsequent runs use the cached copy.

### Tools not working

Run a health check to verify the server is properly initialized:

1. Ask your AI assistant: "Call the health_check tool from fedramp-docs"
2. Verify the response shows indexed files > 0

See [Troubleshooting Guide](troubleshooting.md) for more solutions.
