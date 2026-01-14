# FedRAMP Docs MCP Documentation

Welcome to the FedRAMP Docs MCP documentation. This MCP server provides 20 tools for querying FedRAMP 20x Key Security Indicators (KSIs), NIST controls, and compliance documentation.

## Quick Links

- [Quick Start Guide](../QUICKSTART.md) - Get up and running in minutes
- [GitHub Repository](https://github.com/ethanolivertroy/fedramp-docs-mcp)
- [npm Package](https://www.npmjs.com/package/fedramp-docs-mcp)

## Documentation Sections

### Setup

| Guide | Description |
|-------|-------------|
| [Local Development](setup/local-development.md) | Clone, build, and run from source |
| [Docker](setup/docker.md) | Run via Docker and docker-compose |
| [Security Hardening](setup/security-hardening.md) | Secure configurations for production |

### Guides

| Guide | Description |
|-------|-------------|
| [MCP Clients](guides/mcp-clients.md) | Configure Claude Desktop, Cursor, VS Code, and more |
| [Troubleshooting](guides/troubleshooting.md) | Common issues and solutions |
| [Updating](guides/updating.md) | Keep FedRAMP data current |

### Reference

| Reference | Description |
|-----------|-------------|
| [Tools](reference/tools.md) | All 20 MCP tools with parameters |
| [Environment Variables](reference/environment-variables.md) | Configuration options |
| [FRMR Document Types](reference/frmr-document-types.md) | KSI, MAS, VDR, SCN, FRD, ADS explained |

### Contributing

| Guide | Description |
|-------|-------------|
| [Contributing](contributing.md) | How to contribute to this project |

## What is FedRAMP 20x?

FedRAMP 20x is the modernized Federal Risk and Authorization Management Program framework that introduces Key Security Indicators (KSIs) as a streamlined approach to cloud security assessment. This MCP server indexes the official FedRAMP documentation and provides programmatic access to:

- **Key Security Indicators (KSI)** - 80+ security requirements organized by theme
- **NIST Control Mappings** - How FedRAMP requirements map to NIST SP 800-53
- **Compliance Documentation** - Official guidance, definitions, and procedures
- **Version Tracking** - Monitor changes across FRMR document versions

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   MCP Client        │     │   FedRAMP/docs      │
│  (Claude, Cursor)   │────▶│   (GitHub repo)     │
└─────────────────────┘     └─────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  fedramp-docs-mcp   │────▶│  ~/.cache/fedramp-  │
│   (MCP Server)      │     │       docs          │
└─────────────────────┘     └─────────────────────┘
          │
          ▼
    20 MCP Tools
    (list_ksi, get_control_requirements, etc.)
```

The server automatically clones and indexes the official [FedRAMP/docs](https://github.com/FedRAMP/docs) repository, providing full-text search and structured queries across all FRMR document types.
