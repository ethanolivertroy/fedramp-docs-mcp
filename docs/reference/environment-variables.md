# Environment Variables Reference

fedramp-docs-mcp can be configured using environment variables.

## Available Variables

### FEDRAMP_DOCS_PATH

**Description:** Path to an existing FedRAMP/docs checkout. If not set, the server automatically clones the repository to the default cache location.

**Default:** `~/.cache/fedramp-docs`

**Usage:**
```bash
export FEDRAMP_DOCS_PATH=/path/to/fedramp/docs
```

**Use cases:**
- Use a pre-cloned repository
- Share a repository across multiple instances
- Point to a read-only mount in air-gapped environments

**Example configurations:**

```json
// Claude Desktop config
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_PATH": "/opt/fedramp/docs"
      }
    }
  }
}
```

```bash
# Docker with mounted volume
docker run -it \
  -v /host/fedramp-docs:/data/fedramp:ro \
  -e FEDRAMP_DOCS_PATH=/data/fedramp \
  fedramp-docs-mcp
```

---

### FEDRAMP_DOCS_AUTO_UPDATE

**Description:** Automatically check for and fetch repository updates on server startup.

**Default:** `true`

**Values:** `true` or `false`

**Usage:**
```bash
export FEDRAMP_DOCS_AUTO_UPDATE=false
```

**Use cases:**
- Disable in air-gapped environments
- Disable during development for consistent testing
- Disable in production for controlled updates

**Example:**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "false"
      }
    }
  }
}
```

---

### FEDRAMP_DOCS_UPDATE_CHECK_HOURS

**Description:** Hours between automatic update checks. Only applies when `FEDRAMP_DOCS_AUTO_UPDATE` is `true`.

**Default:** `24`

**Values:** Positive integer (hours)

**Usage:**
```bash
export FEDRAMP_DOCS_UPDATE_CHECK_HOURS=12
```

**Use cases:**
- More frequent updates in development
- Less frequent updates to reduce network traffic
- Daily updates in production

**Example:**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true",
        "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "6"
      }
    }
  }
}
```

---

## Node.js Environment Variables

These standard Node.js variables can also affect the server:

### DEBUG

**Description:** Enable debug logging for troubleshooting.

**Usage:**
```bash
# All debug output
DEBUG=* npx fedramp-docs-mcp

# FedRAMP-specific debugging
DEBUG=fedramp:* npx fedramp-docs-mcp
```

---

### NODE_OPTIONS

**Description:** Pass options to the Node.js runtime.

**Usage:**
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npx fedramp-docs-mcp

# Enable inspector for debugging
NODE_OPTIONS="--inspect" npx fedramp-docs-mcp
```

---

## Configuration Examples

### Development Setup

Frequent updates, debug logging enabled:

```bash
export FEDRAMP_DOCS_AUTO_UPDATE=true
export FEDRAMP_DOCS_UPDATE_CHECK_HOURS=1
export DEBUG=fedramp:*
npx fedramp-docs-mcp
```

### Production Setup

Controlled updates, minimal logging:

```bash
export FEDRAMP_DOCS_AUTO_UPDATE=false
export FEDRAMP_DOCS_PATH=/opt/fedramp/docs
npx fedramp-docs-mcp
```

### Air-Gapped Setup

No network access, pre-cloned repository:

```bash
export FEDRAMP_DOCS_AUTO_UPDATE=false
export FEDRAMP_DOCS_PATH=/mnt/secure/fedramp-docs
npx fedramp-docs-mcp
```

### Docker Setup

```bash
docker run -it \
  -e FEDRAMP_DOCS_AUTO_UPDATE=true \
  -e FEDRAMP_DOCS_UPDATE_CHECK_HOURS=24 \
  -v fedramp-cache:/root/.cache/fedramp-docs \
  ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest
```

### Claude Desktop Complete Config

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_PATH": "",
        "FEDRAMP_DOCS_AUTO_UPDATE": "true",
        "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "24"
      }
    }
  }
}
```

Note: Empty string for `FEDRAMP_DOCS_PATH` uses the default cache location.

## Precedence

Environment variables take precedence in this order:
1. Explicitly set environment variables
2. MCP client configuration (`env` block)
3. Default values

Variables set in the shell override those in MCP client configs.
