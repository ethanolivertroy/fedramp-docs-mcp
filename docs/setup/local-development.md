# Local Development Setup

This guide covers setting up fedramp-docs-mcp for local development, including building from source, running tests, and debugging.

## Prerequisites

- **Node.js** 18.0.0 or later (22.7.5+ for MCP Inspector)
- **npm** 9.0.0 or later
- **git** 2.0.0 or later

Verify your versions:

```bash
node --version   # v18.0.0+
npm --version    # 9.0.0+
git --version    # 2.0.0+
```

## Clone and Build

```bash
# Clone the repository
git clone https://github.com/ethanolivertroy/fedramp-docs-mcp.git
cd fedramp-docs-mcp

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Run the Server

```bash
# Run the built server
node dist/index.js

# Or use npm script
npm start
```

The server will:
1. Clone the FedRAMP/docs repository to `~/.cache/fedramp-docs` (first run only)
2. Index all FRMR documents and markdown files
3. Start listening for MCP protocol messages on stdio

## Development Mode

For active development with automatic rebuilds:

```bash
# Watch mode - rebuilds on file changes
npm run dev
```

This uses `tsx` to run TypeScript directly with hot reloading.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format with Prettier
npm run format
```

## Debugging with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) provides a visual UI for testing tools.

**Requirements:** Node.js 22.7.5 or later

```bash
# Interactive UI mode
npx @modelcontextprotocol/inspector node dist/index.js

# Open http://localhost:6274 in your browser
```

From the UI, you can:
- Browse all 20 available tools
- Call tools with custom parameters
- Inspect responses and errors
- Export configurations for MCP clients

**CLI Mode (Quick Testing):**

```bash
# List all tools
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list

# Call health_check
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call --tool-name health_check

# Call list_ksi with parameters
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call --tool-name list_ksi --tool-arg theme=IAM
```

## Project Structure

```
fedramp-docs-mcp/
├── src/
│   ├── index.ts           # Server entry point
│   ├── tools/             # MCP tool implementations
│   ├── utils/             # Shared utilities
│   └── types/             # TypeScript type definitions
├── dist/                  # Compiled JavaScript (generated)
├── tests/                 # Test files
├── docs/                  # Documentation (you are here)
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

For development, you can set these in a `.env` file or export them:

```bash
# Use a custom FedRAMP docs location (optional)
export FEDRAMP_DOCS_PATH=/path/to/fedramp/docs

# Disable auto-updates during development
export FEDRAMP_DOCS_AUTO_UPDATE=false
```

See [Environment Variables Reference](../reference/environment-variables.md) for all options.

## Debugging Tips

### Enable Debug Logging

```bash
DEBUG=fedramp:* node dist/index.js
```

### Inspect the FedRAMP Data Cache

```bash
# View cached repository
ls -la ~/.cache/fedramp-docs

# Check git status
cd ~/.cache/fedramp-docs && git log -1 --oneline
```

### Force Reindex

Delete the cache to force a fresh clone and index:

```bash
rm -rf ~/.cache/fedramp-docs
node dist/index.js  # Will re-clone and reindex
```

## Contributing

See [Contributing Guide](../contributing.md) for guidelines on submitting changes.
