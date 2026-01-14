# Docker Setup

This guide covers running fedramp-docs-mcp using Docker and docker-compose.

## Quick Start

```bash
# Pull and run the latest image
docker run -it ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest

# Or build locally
docker build -t fedramp-docs-mcp .
docker run -it fedramp-docs-mcp
```

## Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fedramp-docs-mcp:
    image: ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest
    # Or build from source:
    # build: .
    stdin_open: true
    tty: true
    volumes:
      # Persist the FedRAMP docs cache between runs
      - fedramp-cache:/root/.cache/fedramp-docs
    environment:
      - FEDRAMP_DOCS_AUTO_UPDATE=true
      - FEDRAMP_DOCS_UPDATE_CHECK_HOURS=24

volumes:
  fedramp-cache:
```

Run with:

```bash
docker-compose up
```

## Build from Source

```bash
# Clone the repository
git clone https://github.com/ethanolivertroy/fedramp-docs-mcp.git
cd fedramp-docs-mcp

# Build the Docker image
docker build -t fedramp-docs-mcp:local .

# Run
docker run -it fedramp-docs-mcp:local
```

## Dockerfile Explained

The included `Dockerfile` uses a multi-stage build:

```dockerfile
# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]
```

Key points:
- Uses Node.js 20 LTS
- Installs git (required for cloning FedRAMP/docs)
- Multi-stage build keeps image size small
- Production dependencies only in final image

## Volume Mounts

### Persist FedRAMP Cache

Mount a volume to persist the cloned FedRAMP docs repository:

```bash
docker run -it \
  -v fedramp-cache:/root/.cache/fedramp-docs \
  fedramp-docs-mcp
```

This avoids re-cloning the repository on each container start.

### Use Local FedRAMP Docs

If you have a local checkout of FedRAMP/docs:

```bash
docker run -it \
  -v /path/to/fedramp/docs:/fedramp-docs:ro \
  -e FEDRAMP_DOCS_PATH=/fedramp-docs \
  fedramp-docs-mcp
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FEDRAMP_DOCS_PATH` | `~/.cache/fedramp-docs` | Path to FedRAMP docs repository |
| `FEDRAMP_DOCS_AUTO_UPDATE` | `true` | Auto-check for updates |
| `FEDRAMP_DOCS_UPDATE_CHECK_HOURS` | `24` | Hours between update checks |

Example with environment variables:

```bash
docker run -it \
  -e FEDRAMP_DOCS_AUTO_UPDATE=false \
  -e FEDRAMP_DOCS_PATH=/data/fedramp \
  fedramp-docs-mcp
```

## Using with MCP Clients

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### Cursor

Add to Cursor MCP settings:

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

## Health Check

Add a health check to your docker-compose:

```yaml
services:
  fedramp-docs-mcp:
    image: ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Troubleshooting

### Container exits immediately

MCP servers communicate via stdio. Ensure you're running with `-it` flags:

```bash
docker run -it fedramp-docs-mcp  # Interactive mode
```

### Git clone fails

The container needs network access to clone FedRAMP/docs on first run:

```bash
# Check network connectivity
docker run -it fedramp-docs-mcp ping -c 1 github.com
```

### Permission denied on volume mount

On Linux, you may need to set proper permissions:

```bash
docker run -it \
  --user $(id -u):$(id -g) \
  -v fedramp-cache:/home/node/.cache/fedramp-docs \
  fedramp-docs-mcp
```

See [Security Hardening](security-hardening.md) for secure Docker configurations.
