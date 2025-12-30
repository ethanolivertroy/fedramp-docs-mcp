# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-12-30

### Added

- **Okta/Duo phishing-resistant MFA evidence sources** for KSI-IAM-01
  - 3 new Okta WebAuthn/FIDO2 specific APIs (`/api/v1/users/{userId}/factors`, `/api/v1/authenticators`, `/api/v1/policies`)
  - 5 new Duo WebAuthn/Passkey sources (`/admin/v1/webauthncredentials`, `/admin/v1/policies`, `/admin/v1/users/{user_id}/webauthncredentials`, `/admin/v2/logs/authentication`)
  - Documentation URLs added to all new sources
  - Total: 8 new automation sources for phishing-resistant MFA compliance

### Enhanced

- **`health_check` tool** now returns repository version info and auto-update status
  - New `repoInfo` field with `commitHash`, `commitDate`, and `lastFetchedAt`
  - New `autoUpdate` field with `enabled` status and `checkIntervalHours` interval
  - Users can now verify they have the latest FedRAMP docs at a glance

### Fixed

- README configuration example completeness (Custom Update Frequency section)
- Plugin command documentation with enhanced `health_check` output examples

## [0.2.0] - 2025-12-28

### Added

- **7 new MCP tools** for compliance workflows:
  - `search_definitions` - Search FedRAMP definitions (FRD) by term
  - `filter_by_impact` - Filter KSI items by impact level (low/moderate/high)
  - `get_evidence_examples` - Collect evidence examples for compliance
  - `analyze_control_coverage` - Report NIST control family coverage
  - `get_control_requirements` - Get all requirements for a NIST control
  - `get_theme_summary` - Get comprehensive guidance for a KSI theme
  - `get_requirement_by_id` - Lookup any requirement by ID (KSI, FRR, FRD)

- **Claude Code marketplace support** - Install plugin with:
  ```
  /plugin marketplace add ethanolivertroy/fedramp-docs-mcp
  /plugin install fedramp-docs
  ```

- **CLI setup command** - `npx fedramp-docs-mcp setup` for easy plugin installation

- **7 new slash commands** for the Claude Code plugin matching the new tools

- **Unit tests** for all 7 new tools (30 test cases)

- **Docker support** with security-hardened container configuration

- **Claude Code plugin** with slash commands, agent skills, and custom agents

- **Support for 12 FRMR document types**: KSI, MAS, VDR, SCN, FRD, ADS, CCM, FSI, ICP, PVA, RSC, UCM

- **Unofficial project disclaimer** clarifying this is not affiliated with FedRAMP

### Changed

- Updated indexer for FRMR 2025 JSON structure (nested format with `info`, `FRR`, `KSI`, `FRD` keys)
- Reorganized README with categorized tool documentation
- Improved plugin installation instructions

### Fixed

- Indexer compatibility with new nested FRMR document format
- Docker build by including `src/` directory in build context

## [0.1.0] - 2025-10-10

### Added

- Initial release of FedRAMP Docs MCP server
- Core MCP tools:
  - `list_frmr_documents` - List all FRMR documents
  - `get_frmr_document` - Get a specific FRMR document
  - `list_ksi` - List Key Security Indicators
  - `get_ksi` - Get a specific KSI item
  - `list_controls` - List control mappings
  - `search_markdown` - Search markdown documentation
  - `read_markdown` - Read markdown files
  - `diff_frmr` - Compare document versions
  - `grep_controls_in_markdown` - Search for controls in markdown
  - `get_significant_change_guidance` - Get change guidance
  - `list_versions` - List available versions
  - `health_check` - Check server health
  - `update_repository` - Update FedRAMP docs repository

- Automatic repository cloning and indexing
- Lunr.js full-text search for markdown content
- Support for multiple MCP clients (Claude Desktop, Goose, LM Studio, OpenCode)
- Environment variable configuration for repository paths and update settings
