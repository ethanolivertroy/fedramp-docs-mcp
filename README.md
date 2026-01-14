# FedRAMP Docs MCP Server

> **Disclaimer:** This is an unofficial, community project and is not affiliated with, endorsed by, or associated with FedRAMP or the U.S. federal government. The author is not officially affiliated with FedRAMP. The FedRAMP name and any related marks are property of their respective owners.

Custom Model Context Protocol (MCP) server that makes the FedRAMP/docs repository queryable with FRMR-aware tooling. The server scans FRMR JSON datasets and supporting markdown guidance, exposes structured tools for analysis, and can optionally clone and cache the upstream repository for you.

## Demo

See the FedRAMP Docs MCP Server in action with Claude Desktop:

https://github.com/user-attachments/assets/653c3956-0bfb-46c4-9e72-8a6d75e3a80d

## Documentation

| Resource | Description |
|----------|-------------|
| [**Quick Start Guide**](QUICKSTART.md) | Get running in under 5 minutes |
| [**Full Documentation**](docs/README.md) | Complete guides and reference |
| [**MCP Client Setup**](docs/guides/mcp-clients.md) | Configure Claude Desktop, Cursor, VS Code |
| [**Tools Reference**](docs/reference/tools.md) | All 20 MCP tools with parameters |
| [**Troubleshooting**](docs/guides/troubleshooting.md) | Common issues and solutions |

**Additional resources:**
- [Local Development](docs/setup/local-development.md) - Build from source
- [Docker Setup](docs/setup/docker.md) - Container deployment
- [Security Hardening](docs/setup/security-hardening.md) - Production configurations
- [Contributing](docs/contributing.md) - How to contribute

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher

## Features

- Auto-detects all 12 FRMR JSON document types and builds typed metadata.
- Extracts KSI entries, flattened control mappings, and Significant Change references.
- Fast markdown search via an inverted index backed by Lunr with snippets and line numbers.
- Indexes 62+ markdown files from `tools/site/content/` (Zensical static site content).
- Structured diffing between FRMR versions, including per-item change detection.
- Health check, version listing, and curated Significant Change guidance aggregator.
- **Claude Plugin** with slash commands, agent skills, and compliance analyst agent.
- **Docker support** with security hardening following 2025 best practices.

### Supported Document Types

| Type | Full Name |
|------|-----------|
| KSI | Key Security Indicators |
| MAS | Minimum Assessment Scope |
| VDR | Vulnerability Detection and Response |
| SCN | Significant Change Notifications |
| FRD | FedRAMP Definitions |
| ADS | Authorization Data Sharing |
| CCM | Collaborative Continuous Monitoring |
| FSI | FedRAMP Security Inbox |
| ICP | Incident Communications Procedures |
| PVA | Persistent Validation and Assessment |
| RSC | Recommended Secure Configuration |
| UCM | Using Cryptographic Modules |

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

### CLI Commands

The package includes helpful CLI commands:

```bash
# Show help and usage information
npx fedramp-docs-mcp help

# Install Claude Code plugin
npx fedramp-docs-mcp setup

# Print MCP server configuration for Claude Desktop/Code
npx fedramp-docs-mcp mcp-config

# Start MCP server (used by MCP clients)
npx fedramp-docs-mcp
```

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

**Custom Update Frequency (check every 6 hours):**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "fedramp-docs-mcp",
      "env": {
        "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "6"
      }
    }
  }
}
```

## Available Tools

The server provides 20 tools organized into categories. All tools follow the error model and respond with JSON payloads.

### Document Discovery
| Tool | Description |
|------|-------------|
| `list_frmr_documents` | Enumerate indexed FRMR JSON documents |
| `get_frmr_document` | Return full JSON and summary for a document |
| `list_versions` | Collate version metadata by FRMR document type |

### KSI (Key Security Indicators)
| Tool | Description |
|------|-------------|
| `list_ksi` | Filter and inspect Key Security Indicators |
| `get_ksi` | Get a specific KSI item by ID |
| `filter_by_impact` | Filter KSI items by impact level (low/moderate/high) |
| `get_theme_summary` | Get comprehensive guidance for a KSI theme (IAM, CNA, etc.) |
| `get_evidence_examples` | Get automation-friendly evidence suggestions for KSI compliance (community suggestions, not official FedRAMP) |

### Control Mapping
| Tool | Description |
|------|-------------|
| `list_controls` | Flatten FRMR → control mappings |
| `get_control_requirements` | Get all requirements mapped to a specific control |
| `analyze_control_coverage` | Report which control families have FedRAMP requirements |

### Search & Lookup
| Tool | Description |
|------|-------------|
| `search_markdown` | Full-text search across documentation |
| `read_markdown` | Read specific markdown file contents |
| `search_definitions` | Search FedRAMP definitions (FRD) by term |
| `get_requirement_by_id` | Get any FRMR requirement by ID (KSI-*, FRR-*, FRD-*) |

### Analysis
| Tool | Description |
|------|-------------|
| `diff_frmr` | Structured diff of two FRMR datasets |
| `grep_controls_in_markdown` | Locate control references in markdown |
| `get_significant_change_guidance` | Curated Significant Change references |

### System
| Tool | Description |
|------|-------------|
| `health_check` | Confirm the server indexed successfully |
| `update_repository` | Force update the cached FedRAMP docs |

## Evidence Collection Suggestions

The `get_evidence_examples` tool provides **community-suggested** evidence examples for each KSI. These are automation-friendly suggestions showing how to programmatically collect compliance evidence via APIs, CLI commands, and security tools.

**Important:** These are NOT official FedRAMP guidance. Always verify requirements with [official FedRAMP documentation](https://fedramp.gov).

### What's Included

For each of the 72 KSI indicators, we provide:
- **Evidence types**: API calls, reports, scans, logs, configurations, documentation
- **Automation sources**: AWS, Azure, GCP, Okta, Splunk, Terraform, GitHub Actions, etc.
- **Example commands**: Ready-to-use CLI commands and API endpoints

### Example Evidence Sources by Theme

| Theme | Example Sources |
|-------|----------------|
| **IAM** | Okta/Entra MFA policies, AWS IAM credential reports, PAM tools (CyberArk, Vault) |
| **CNA** | AWS Security Groups, VPC Flow Logs, Container scans (Trivy), CSPM (Wiz, Prisma) |
| **MLA** | SIEM config (Splunk, Sentinel), CloudTrail, IaC scans (Checkov, tfsec) |
| **CMT** | Git history, CI/CD pipelines (GitHub Actions), Change tickets (ServiceNow, Jira) |
| **SVC** | TLS scans (SSL Labs), Secrets Manager rotation, Patch compliance (SSM) |
| **INR** | PagerDuty incidents, Post-mortems (Blameless), ServiceNow tickets |
| **RPL** | AWS Backup reports, DR test logs, Chaos engineering results |
| **TPR** | Vendor ratings (SecurityScorecard), Dependency scans (Dependabot, Snyk) |

### Usage Example

```
"What evidence do I need for KSI-IAM-01 (Phishing-Resistant MFA)?"
→ Returns suggested API calls, CLI commands, and artifacts to collect

"Get evidence checklist for the CNA theme"
→ Returns automation sources for all Cloud Native Architecture indicators
```

See `src/tools/` for the precise schemas implemented with Zod. Each tool returns either a successful object or an `error` payload containing `code`, `message`, and optional `hint`.

### Usage Examples

When using the MCP server with Claude Desktop or other MCP clients, here are some example queries:

**Getting KSI Information:**
```
"List all available FedRAMP documents"
→ Uses list_frmr_documents

"Show me all KSI items for moderate impact systems"
→ Uses filter_by_impact with impact='moderate'

"Give me a summary of the IAM theme requirements"
→ Uses get_theme_summary with theme='IAM'

"What evidence do I need for IAM compliance?"
→ Uses get_evidence_examples with theme='IAM'
```

**Searching Documentation:**
```
"Search for information about continuous monitoring"
→ Uses search_markdown with query 'continuous monitoring'

"What does 'federal customer data' mean in FedRAMP?"
→ Uses search_definitions with term='federal customer data'

"Get the details for requirement KSI-IAM-01"
→ Uses get_requirement_by_id with id='KSI-IAM-01'
```

**Working with Controls:**
```
"What FedRAMP requirements map to control AY-01?"
→ Uses get_control_requirements with control='AY-01'

"Which control families have the most FedRAMP coverage?"
→ Uses analyze_control_coverage

"Find all markdown files that reference AC-2"
→ Uses grep_controls_in_markdown with control='AC-2'
```

**Analyzing Changes:**
```
"What's new in the latest KSI release?"
→ Uses list_versions then diff_frmr to compare versions

"Show significant change guidance"
→ Uses get_significant_change_guidance
```

### Advanced Queries: Dashboard & Architecture Insights

These prompts combine FedRAMP data with Claude's analytical capabilities to help you design compliance dashboards and features:

**Dashboard Architecture:**
```
"Using the FedRAMP KSI data, design a compliance dashboard architecture.
What components would I need? How should I structure the data for real-time monitoring?"

"Get all KSI themes and their indicators. Then recommend how to organize
them into a dashboard with drill-down navigation."
```

**Visualization Design:**
```
"Analyze the FedRAMP control coverage data. What would be the best
chart types to visualize control family coverage? Suggest a color
scheme for compliance status."

"List the KSIs filtered by impact level. Design a risk heat map
visualization showing low/moderate/high impact requirements."
```

**Feature Planning:**
```
"Get the evidence checklist from FedRAMP. How would you build a
feature that tracks evidence collection progress with percentage
completion per KSI theme?"

"What are the requirements for AC-2 (Account Management)? Design a
feature that helps users track their implementation status against
these requirements."
```

**Data Modeling:**
```
"Analyze the structure of KSI indicators and their control mappings.
What database schema would you recommend for a compliance tracking app?"

"Get a theme summary for IAM. How would you model the relationship
between KSIs, NIST controls, and evidence in a graph database?"
```

**Executive Reporting:**
```
"Using the control coverage analysis, design an executive summary
dashboard that shows compliance posture at a glance."

"Analyze all high-impact KSI requirements and create a prioritized
remediation roadmap template."
```

## MCP Client Configuration

The FedRAMP Docs MCP server works with any MCP-compatible client. Below are setup instructions for the most popular and reliable clients.

**Recommended clients:**
- **Claude Desktop** - Most mature MCP integration, excellent tool discovery
- **Claude Code CLI** - Official Anthropic CLI tool, great for terminal workflows
- **LM Studio** - Native MCP support, works with local models for privacy
- **OpenCode** - Terminal-based coding agent with MCP support
- **Goose** - Experimental support, may have tool discovery issues

### Claude Desktop

Add the server to your Claude Desktop configuration file:

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

**Option 1: Using npx (Recommended - no install required)**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true"
      }
    }
  }
}
```

**Option 2: Global installation**
```bash
npm install -g fedramp-docs-mcp
```

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

### Claude Code CLI

[Claude Code](https://docs.claude.com/en/docs/claude-code) is Anthropic's official CLI tool with built-in MCP support.

#### Method 1: Using CLI (Recommended)

```bash
# Add the FedRAMP Docs MCP server
claude mcp add --transport stdio fedramp-docs fedramp-docs-mcp

# With full path
claude mcp add --transport stdio fedramp-docs /path/to/node/bin/fedramp-docs-mcp

# List configured servers
claude mcp list

# Remove if needed
claude mcp remove fedramp-docs
```

#### Method 2: Configuration File

Claude Code supports three configuration scopes:

1. **Project-scoped** (recommended for teams): `.mcp.json` in project root
2. **User-scoped**: `~/.claude/settings.local.json`
3. **Project-local**: `.claude/settings.local.json` in project root

**Example `.mcp.json` (project-scoped, can be version-controlled):**
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

**With environment variable expansion:**
```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "fedramp-docs-mcp",
      "args": [],
      "env": {
        "FEDRAMP_DOCS_PATH": "${HOME}/fedramp-docs",
        "FEDRAMP_DOCS_AUTO_UPDATE": "true"
      }
    }
  }
}
```

**Testing:**
- Restart Claude Code after configuration changes
- Use `/mcp` command for interactive management
- Use `--mcp-debug` flag for troubleshooting: `claude --mcp-debug`
- Verify with: `claude mcp list`

**Note:** Project-scoped configurations in `.mcp.json` enable team collaboration by ensuring all team members have access to the same MCP tools.

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

### OpenCode

[OpenCode](https://opencode.ai/) is a powerful AI coding agent built for the terminal with native MCP support.

#### Setup Instructions

1. **Create or edit your OpenCode configuration file:**

**Config file location:**
- Global: `~/.config/opencode/opencode.json`
- Project: `opencode.json` (in your project root)

2. **Add the FedRAMP Docs MCP server:**

**Basic configuration:**
```json
{
  "mcp": {
    "fedramp-docs": {
      "type": "local",
      "command": ["fedramp-docs-mcp"],
      "enabled": true
    }
  }
}
```

**With full path:**
```json
{
  "mcp": {
    "fedramp-docs": {
      "type": "local",
      "command": ["/path/to/node/bin/fedramp-docs-mcp"],
      "enabled": true
    }
  }
}
```

**With environment variables:**
```json
{
  "mcp": {
    "fedramp-docs": {
      "type": "local",
      "command": ["fedramp-docs-mcp"],
      "enabled": true,
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "true",
        "FEDRAMP_DOCS_PATH": "/path/to/FedRAMP/docs"
      }
    }
  }
}
```

3. **Restart OpenCode** to load the MCP server
4. **Test it** - The FedRAMP tools will be automatically available alongside built-in tools

**Note:** MCP servers add to your context, so enable only the ones you need. Use `"enabled": false` to temporarily disable a server without removing it.

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

**Note:** Goose's MCP support is still maturing and may have issues discovering tools from stdio servers. If you experience problems with tool discovery, consider using Claude Desktop, Claude Code CLI, LM Studio, or OpenCode instead.

### MCP Inspector (Debugging)

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an official tool for testing and debugging MCP servers. It provides a visual UI to interactively call tools and explore resources.

**Requirements:** Node.js 22.7.5 or later

**Interactive UI:**
```bash
# Start the inspector with fedramp-docs-mcp
npx @modelcontextprotocol/inspector node dist/index.js

# Or if installed globally
npx @modelcontextprotocol/inspector fedramp-docs-mcp
```

Open `http://localhost:6274` to access the UI, then test tools like:
- `health_check` - Verify the server is working
- `list_frmr_documents` - See all indexed FedRAMP documents
- `list_ksi` - Browse Key Security Indicators

**CLI Mode (Quick Testing):**
```bash
# List all available tools
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call --tool-name health_check
```

**Export Configuration:**
The Inspector UI includes buttons to copy server configurations for Claude Desktop, Cursor, and other MCP clients.

## Claude Plugin

The repository includes a Claude Code plugin that provides slash commands, agent skills, and a specialized compliance analyst agent.

### Quick Install

In Claude Code, run:

```
/plugin marketplace add ethanolivertroy/fedramp-docs-mcp
/plugin install fedramp-docs
```

That's it! The plugin is ready to use.

<details>
<summary>Alternative: Manual Installation</summary>

```bash
# One-command setup
npx fedramp-docs-mcp setup

# Then start Claude Code with the plugin
claude --plugin-dir ~/.fedramp-docs-mcp/plugin
```

Or add an alias to your shell profile:

```bash
alias claude-fedramp='claude --plugin-dir ~/.fedramp-docs-mcp/plugin'
```

</details>

### Available Commands

| Command | Description |
|---------|-------------|
| `/fedramp-docs:search <query>` | Search FedRAMP documentation |
| `/fedramp-docs:search-definitions <term>` | Search FedRAMP definitions |
| `/fedramp-docs:list-controls [family]` | List NIST controls |
| `/fedramp-docs:control-requirements <control>` | Get requirements for a NIST control |
| `/fedramp-docs:control-coverage` | Analyze NIST control coverage |
| `/fedramp-docs:list-ksi [filter]` | List Key Security Indicators |
| `/fedramp-docs:filter-impact <level>` | Filter KSI by impact level |
| `/fedramp-docs:theme-summary <theme>` | Get theme guidance |
| `/fedramp-docs:evidence-checklist [theme]` | Get evidence checklist |
| `/fedramp-docs:get-requirement <id>` | Get requirement by ID |
| `/fedramp-docs:list-documents` | List all FRMR documents |
| `/fedramp-docs:compare <doc1> <doc2>` | Compare document versions |
| `/fedramp-docs:health` | Check MCP server status |

### Agent Skills

- **frmr-analysis** - Automatically invoked when analyzing FRMR documents or control mappings
- **control-mapping** - Automatically invoked when mapping NIST controls to FedRAMP requirements

See [plugin/README.md](plugin/README.md) for full documentation.

## Docker

Run the MCP server in a security-hardened Docker container.

### Quick Start

```bash
# Build the image
docker build -t fedramp-docs-mcp .

# Run interactively (for MCP stdio)
docker run --rm -i \
  --security-opt no-new-privileges:true \
  --cap-drop ALL \
  --read-only \
  --memory 512m \
  -v fedramp-cache:/home/mcpuser/.cache/fedramp-docs \
  fedramp-docs-mcp
```

### Docker Compose

```bash
# Start with docker-compose (security hardening included)
docker compose up -d
```

### Claude Desktop with Docker

Configure Claude Desktop to use the Docker container:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--security-opt", "no-new-privileges:true",
        "--cap-drop", "ALL",
        "--read-only",
        "--memory", "512m",
        "-v", "fedramp-cache:/home/mcpuser/.cache/fedramp-docs",
        "fedramp-docs-mcp:latest"
      ]
    }
  }
}
```

### Security Features

The Docker setup follows 2025 MCP security best practices:

- **Non-root user**: Runs as `mcpuser` (UID 1001)
- **Read-only filesystem**: Prevents unauthorized modifications
- **Dropped capabilities**: `--cap-drop ALL` removes all Linux capabilities
- **No new privileges**: Prevents privilege escalation
- **Resource limits**: Memory and CPU constraints
- **Network isolation**: Internal network with no external access by default

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
- **MCP SDK v1.24+** for server implementation

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
