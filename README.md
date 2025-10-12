# FedRAMP Docs MCP Server

Custom Model Context Protocol (MCP) server that makes the FedRAMP/docs repository queryable with FRMR-aware tooling. The server scans FRMR JSON datasets and supporting markdown guidance, exposes structured tools for analysis, and can optionally clone and cache the upstream repository for you.

## Demo

See the FedRAMP Docs MCP Server in action with Claude Desktop:

https://github.com/user-attachments/assets/6c96ace6-cbd8-4479-9aa9-4474643362c4

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher

## Features

- Auto-detects FRMR JSON files (KSI, MAS, VDR, SCN, FRD, ADS) and builds typed metadata.
- Extracts KSI entries, flattened control mappings, and Significant Change references.
- Fast markdown search via an inverted index backed by Lunr with snippets and line numbers.
- Structured diffing between FRMR versions, including per-item change detection.
- Health check, version listing, and curated Significant Change guidance aggregator.

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
node dist/index.js
```

### Global Installation

To install globally and use the `fedramp-docs-mcp` command:

```bash
npm install -g .
fedramp-docs-mcp
```

**Note:** Global installation is required if you want to use `fedramp-docs-mcp` as the command in MCP client configurations (Claude Desktop, Goose, etc.). Alternatively, you can use the full path to the built server: `node /path/to/fedramp-docs-mcp/dist/index.js`

During startup the server ensures a FedRAMP/docs repository is available, indexes FRMR JSON and markdown content, then begins serving requests on MCP stdio.

## Configuration

Environment variables control repository discovery and indexing behaviour:

| Variable | Default | Description |
| --- | --- | --- |
| `FEDRAMP_DOCS_PATH` | `~/.cache/fedramp-docs` | Path to an existing FedRAMP/docs checkout. |
| `FEDRAMP_DOCS_REMOTE` | `https://github.com/FedRAMP/docs` | Remote used when cloning. |
| `FEDRAMP_DOCS_BRANCH` | `main` | Branch to checkout when cloning. |
| `FEDRAMP_DOCS_ALLOW_AUTO_CLONE` | `true` | Clone automatically when the path is missing. |
| `FEDRAMP_DOCS_AUTO_UPDATE` | `true` | Automatically check for and fetch repository updates. |
| `FEDRAMP_DOCS_UPDATE_CHECK_HOURS` | `24` | Hours between automatic update checks (when auto-update is enabled). |
| `FEDRAMP_DOCS_INDEX_PERSIST` | `true` | Persist the in-memory index under `~/.cache/fedramp-docs/index-v1.json`. |

Set `FEDRAMP_DOCS_PATH` if you maintain a local clone. Otherwise leave it unset and allow the server to create a shallow cached copy.

### Keeping Data Up-to-Date

The server includes automatic update checking to keep the FedRAMP docs current:

**Automatic Updates (Default Behavior):**
- Every 24 hours (configurable), the server checks if the cached repository needs updating
- If updates are available, they're fetched automatically on server startup
- This ensures you always have recent FedRAMP data without manual intervention

**Manual Updates:**
- Use the `update_repository` tool to force an immediate update
- Example query in Claude Desktop: "Update the FedRAMP docs repository"
- Useful when you know new requirements or guidance has been published

**Disabling Auto-Update:**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "fedramp-docs-mcp",
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "false"
      }
    }
  }
}
```

**Custom Update Frequency:**
```json
{
  "env": {
    "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "6"
  }
}
```

## Available Tools

All tools follow the error model described in the product spec and respond with JSON payloads. Key tools include:

- `list_frmr_documents` — enumerate indexed FRMR JSON documents.
- `get_frmr_document` — return full JSON and summary for a document.
- `list_ksi` / `get_ksi` — filter and inspect Key Security Indicators.
- `list_controls` — flatten FRMR → NIST control mappings.
- `search_markdown` / `read_markdown` — full-text search and retrieval with digests.
- `list_versions` — collate version metadata by FRMR document type.
- `diff_frmr` — structured diff of two FRMR datasets using ID-aware comparison.
- `grep_controls_in_markdown` — locate control references inside markdown guidance.
- `get_significant_change_guidance` — curated Significant Change references across FRMR + markdown.
- `health_check` — confirm the server indexed successfully and expose repo path.
- `update_repository` — force update the cached FedRAMP docs to the latest version.

See `src/tools/` for the precise schemas implemented with Zod. Each tool returns either a successful object or an `error` payload containing `code`, `message`, and optional `hint`.

### Usage Examples

When using the MCP server with Claude Desktop or other MCP clients, here are some example queries:

**Getting KSI Information:**
```
"List all available FedRAMP documents"
→ Uses list_frmr_documents

"Show me the Key Security Indicators"
→ Uses get_frmr_document with path 'FRMR.KSI.key-security-indicators.json'

"What are the KSI categories?"
→ Parses KSI document to show categories like IAM, CNA, MLA, etc.
```

**Searching Documentation:**
```
"Search for information about continuous monitoring"
→ Uses search_markdown with query 'continuous monitoring'

"Find guidance on incident response"
→ Uses search_markdown with query 'incident response'
```

**Working with Controls:**
```
"List all controls mapped in the MAS"
→ Uses list_controls

"Find all markdown files that reference AC-2"
→ Uses grep_controls_in_markdown with control 'AC-2'
```

**Analyzing Changes:**
```
"What's new in the latest KSI release?"
→ Uses list_versions then diff_frmr to compare versions

"Show significant change guidance"
→ Uses get_significant_change_guidance
```

## MCP Client Configuration

The FedRAMP Docs MCP server works with any MCP-compatible client. Below are setup instructions for the most popular and reliable clients.

**Recommended clients:**
- **Claude Desktop** - Most mature MCP integration, excellent tool discovery
- **LM Studio** - Native MCP support, works with local models for privacy
- **Goose** - Experimental support, may have tool discovery issues

### Claude Desktop

Add the server to your Claude Desktop configuration file:

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "fedramp-docs-mcp",
      "env": {
        "FEDRAMP_DOCS_PATH": "/path/to/FedRAMP/docs"
      }
    }
  }
}
```

After updating the config, restart Claude Desktop. The FedRAMP Docs tools will appear in your conversations.

### Goose

[Goose](https://github.com/block/goose) is Block's open-source AI agent. You can add the FedRAMP Docs MCP server using any of these methods:

#### Method 1: Via Goose CLI (Recommended)

```bash
goose configure
```

Then select:
1. `Add Extension`
2. `Command-line Extension`
3. Enter the following details:
   - **Name:** `FedRAMP Docs`
   - **Command:** `fedramp-docs-mcp`
   - **Timeout:** `300`

#### Method 2: Via Goose Desktop App

1. Open Goose Desktop
2. Click **Extensions** in the sidebar
3. Click **Add custom extension**
4. Fill in the form:
   - **Extension Name:** `FedRAMP Docs`
   - **Type:** `STDIO`
   - **Command:** `fedramp-docs-mcp`
   - **Timeout:** `300`
   - **Environment Variables:** (optional)
     - `FEDRAMP_DOCS_PATH`: `/path/to/FedRAMP/docs`
     - `FEDRAMP_DOCS_AUTO_UPDATE`: `true`

#### Method 3: Via Config File

Edit `~/.config/goose/config.yaml` (Linux/macOS) or `%USERPROFILE%\.config\goose\config.yaml` (Windows):

```yaml
extensions:
  fedramp-docs:
    name: FedRAMP Docs
    cmd: fedramp-docs-mcp
    enabled: true
    type: stdio
    timeout: 300
    envs:
      FEDRAMP_DOCS_PATH: "/path/to/FedRAMP/docs"  # optional
      FEDRAMP_DOCS_AUTO_UPDATE: "true"            # optional
```

After configuration, restart Goose or reload extensions. You can test by asking: "What FedRAMP tools are available?"

**Note:** Goose's MCP support is still maturing and may have issues discovering tools from stdio servers. If you experience problems with tool discovery, consider using Claude Desktop or LM Studio instead.

### LM Studio

[LM Studio](https://lmstudio.ai/) (v0.3.17+) has native MCP support and works great with local models for privacy-focused workflows.

#### Setup Instructions

1. **Open LM Studio** and click the **Program** tab (terminal icon >_) in the right sidebar
2. **Click "Edit mcp.json"** under the Install section
3. **Add the FedRAMP Docs configuration:**

**Config file location:**
- macOS/Linux: `~/.lmstudio/mcp.json`
- Windows: `%USERPROFILE%\.lmstudio\mcp.json`

**Basic configuration:**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "fedramp-docs-mcp",
      "args": [],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true"
      }
    }
  }
}
```

**Using full path (recommended if command not found):**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "/path/to/node/bin/fedramp-docs-mcp",
      "args": [],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true",
        "FEDRAMP_DOCS_PATH": "/path/to/FedRAMP/docs"
      }
    }
  }
}
```

4. **Save the file** - LM Studio will automatically load the server
5. **Start chatting** - Open a chat with any local model
6. **Test it** - Ask: "List all FedRAMP FRMR documents"
7. **Approve tool calls** - LM Studio will show a confirmation dialog before executing each tool

**Note:** Requires global installation (`npm install -g .`) or use the full path to the executable. Find your path with: `which fedramp-docs-mcp`

### MCP Inspector (Debugging)

For debugging and testing the server directly:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Development

### Running in Development Mode

Use `tsx` for rapid iteration without building:

```bash
npm run dev
```

This runs the TypeScript source directly, automatically recompiling on changes.

### Running Tests

The repository includes Vitest-based unit and contract tests with small fixtures:

```bash
npm test
```

Tests set `FEDRAMP_DOCS_PATH` to `tests/fixtures/repo`, ensuring the indexer, search, and diff logic run deterministically without needing the real FedRAMP repo.

### Code Structure

The codebase uses:
- **TypeScript 5.4+** with strict mode enabled
- **ES Modules** (`"type": "module"` in package.json)
- **Node.js module resolution** (`moduleResolution: "NodeNext"`)
- **Zod** for runtime schema validation
- **MCP SDK v1.20+** for server implementation

## Project Structure

```
src/
  index.ts                 # MCP bootstrap
  repo.ts                  # repo discovery and cloning
  indexer.ts               # FRMR + markdown indexing logic
  frmr.ts                  # FRMR-centric helpers
  search.ts                # markdown search + aggregations
  diff.ts                  # structured FRMR diff engine
  tools/                   # individual MCP tool handlers
```

Fixtures live under `tests/fixtures`, while Vitest specs reside in `tests/`.

## Troubleshooting

### Build Errors

**Error: `Cannot find module '@modelcontextprotocol/sdk'`**

Ensure you have the correct SDK version installed:
```bash
npm install @modelcontextprotocol/sdk@^1.20.0
```

**Error: `Module not found` or import errors**

The project uses ES modules with NodeNext resolution. Make sure you're using Node.js 18+ and that your TypeScript configuration matches:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

### Runtime Errors

**Error: `REPO_CLONE_FAILED`**

The server couldn't clone the FedRAMP docs repository. Check:
- Network connectivity
- Set `FEDRAMP_DOCS_PATH` to an existing local clone, or
- Ensure `FEDRAMP_DOCS_ALLOW_AUTO_CLONE=true` (default)

**Server starts but no tools appear**

Verify the build completed successfully:
```bash
npm run build
ls dist/  # Should contain index.js, tools/, etc.
```

### Development Issues

**TypeScript errors about missing types**

Install all development dependencies:
```bash
npm install
```

Required type packages:
- `@types/node`
- `@types/fs-extra`
- `@types/lunr`
- `@types/glob`
