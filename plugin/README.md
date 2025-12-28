# FedRAMP Docs Claude Plugin

A Claude Code plugin for FedRAMP compliance, documentation search, and control mapping.

## Features

### Slash Commands

| Command | Description |
|---------|-------------|
| `/fedramp-docs:search <query>` | Search FedRAMP documentation |
| `/fedramp-docs:list-controls [family]` | List NIST controls |
| `/fedramp-docs:list-ksi [filter]` | List Key Security Indicators |
| `/fedramp-docs:list-documents` | List all FRMR documents |
| `/fedramp-docs:compare <doc1> <doc2>` | Compare document versions |
| `/fedramp-docs:health` | Check MCP server status |

### Agent Skills

- **frmr-analysis** - Automatically invoked when analyzing FRMR documents or control mappings
- **control-mapping** - Automatically invoked when mapping NIST controls to FedRAMP requirements

### Custom Agent

- **compliance-analyst** - Specialized agent for FedRAMP compliance analysis

## Installation

### Prerequisites

Install the FedRAMP Docs MCP server:

```bash
npm install -g fedramp-docs-mcp
```

### Using the Plugin

```bash
# Load plugin during Claude Code session
claude --plugin-dir /path/to/fedramp-docs-mcp/plugin

# Or add to your Claude Code settings
```

## Supported Document Types

The plugin works with all 12 FedRAMP FRMR document types:

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

## Examples

```
# Search for continuous monitoring guidance
/fedramp-docs:search continuous monitoring

# List all Access Control family controls
/fedramp-docs:list-controls AC

# Find KSI entries by category
/fedramp-docs:list-ksi vulnerability

# Check server health
/fedramp-docs:health
```

## License

MIT
