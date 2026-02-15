# MCP Tools Reference

fedramp-docs-mcp provides 21 tools for querying FedRAMP documentation. This reference covers all tools with their parameters and usage examples.

## Discovery Tools

### list_frmr_documents

List available FRMR JSON documents and metadata. This is usually the first tool to call to discover what FedRAMP data is available.

**Parameters:** None

**Returns:** Array of available documents with paths and types

**Example prompt:**
> "List all available FRMR documents"

---

### health_check

Verify the server is ready. Returns indexed file count, repository path, commit info, and auto-update settings.

**Parameters:** None

**Returns:**
```json
{
  "repoPath": "~/.cache/fedramp-docs",
  "currentCommit": "abc1234",
  "filesIndexed": 145,
  "autoUpdate": true
}
```

**Example prompt:**
> "Run a health check on the FedRAMP docs server"

---

### list_versions

List detected FRMR versions and associated metadata from documents.

**Parameters:** None

**Returns:** Version information across document types

---

## KSI (Key Security Indicator) Tools

### list_ksi

List individual KSI requirement entries with optional filters.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Filter by KSI ID (e.g., "KSI-IAM") |
| `text` | string | Full-text search |
| `category` | string | Filter by theme/category |
| `status` | string | Filter by status |
| `limit` | number | Max results (1-200, default 100) |
| `offset` | number | Pagination offset |

**Example prompts:**
> "List all KSIs related to identity and access management"
> "Search KSIs for 'multifactor authentication'"
> "Show KSIs in the IAM category"

---

### get_ksi

Retrieve a single KSI entry by ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | KSI item ID (e.g., KSI-IAM-01) |

**Example prompt:**
> "Get details for KSI-IAM-01"

---

### filter_by_impact

Filter Key Security Indicators by impact level.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `impact` | string | Yes | Impact level: low, moderate, or high |
| `limit` | number | No | Max results (1-200, default 100) |
| `offset` | number | No | Pagination offset |

**Example prompt:**
> "Show all high-impact KSIs"

---

### get_theme_summary

Get comprehensive guidance for a KSI theme with indicators, impact breakdown, and related docs.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `theme` | string | Yes | Theme code (see below) |

**Theme codes:**
- `AFR` - Audit and Forensics
- `CED` - Cryptographic Enforcement of Data
- `CMT` - Configuration Management and Transparency
- `CNA` - Continuous Assurance
- `IAM` - Identity and Access Management
- `INR` - Incident Response
- `MLA` - Malware Analysis
- `PIY` - Privacy
- `RPL` - Resilience and Planning
- `SVC` - Service Protection
- `TPR` - Third-Party Risk

**Example prompt:**
> "Get a summary of the IAM theme with all related KSIs"

---

### get_evidence_examples

Get suggested evidence examples for KSI compliance. These are community suggestions, not official FedRAMP guidance.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `theme` | string | Filter by KSI theme |
| `id` | string | Get evidence for specific KSI ID |
| `includeRetired` | boolean | Include retired KSIs |

**Example prompt:**
> "What evidence examples are suggested for KSI-IAM-01?"

---

## Control Mapping Tools

### list_controls

Return flattened control mappings across FRMR sets.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `family` | string | Filter by control family (e.g., AC, SC) |
| `control` | string | Filter by specific control |
| `source` | string | Filter by source document type |

**Example prompt:**
> "List all controls in the AC (Access Control) family"

---

### get_control_requirements

Get all FedRAMP requirements mapped to a specific NIST control.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `control` | string | Yes | NIST control ID (e.g., AC-2, SC-13, IA-5) |

**Example prompt:**
> "What FedRAMP requirements map to NIST control AC-2?"

---

### analyze_control_coverage

Analyze which NIST control families have FedRAMP requirements with coverage report.

**Parameters:** None

**Returns:** Coverage analysis by control family showing which have requirements defined

**Example prompt:**
> "Analyze the coverage of NIST controls by FedRAMP requirements"

---

### grep_controls_in_markdown

Search markdown files for occurrences of a control identifier.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `control` | string | Yes | Control ID to search for |
| `with_enhancements` | boolean | No | Include control enhancements |

**Example prompt:**
> "Find all mentions of SC-13 in the FedRAMP documentation"

---

## Document Tools

### get_frmr_document

Retrieve a FRMR document with metadata, raw JSON, and summary.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Document type (KSI, MAS, VDR, SCN, FRD, ADS) |
| `path` | string | Yes | Document path from list_frmr_documents |

**Example prompt:**
> "Get the KSI document at path frmr/ksi.json"

---

### search_markdown

Full-text search across FedRAMP markdown documentation and guidance.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `limit` | number | No | Max results (1-100, default 20) |
| `offset` | number | No | Pagination offset |

**Example prompt:**
> "Search the FedRAMP docs for 'continuous monitoring'"

---

### read_markdown

Read a markdown file and return its contents and digest.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | Yes | Path to markdown file |

**Example prompt:**
> "Read the authorization boundary guidance document"

---

### search_definitions

Search FedRAMP definitions (FRD document) by term.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `term` | string | Yes | Search term |
| `limit` | number | No | Max results (1-100, default 20) |

**Example prompt:**
> "Search for the definition of 'authorization boundary'"

---

### get_requirement_by_id

Get any FedRAMP requirement by its ID.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Requirement ID (KSI-*, FRR-*, FRD-*) |

**Example prompt:**
> "Get the requirement FRR-001"

---

### diff_frmr

Compute a structured diff between two FRMR documents by identifier.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `left_path` | string | Yes | Path to first document |
| `right_path` | string | Yes | Path to second document |
| `id_key` | string | No | Key to use for matching items |

**Example prompt:**
> "Compare the two KSI document versions to see what changed"

---

### get_significant_change_guidance

Aggregate markdown sections and FRMR references related to Significant Change.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `limit` | number | Max results (1-100, default 50) |

**Example prompt:**
> "Get all guidance related to significant changes"

---

## Server Management Tools

### search_tools

Search and discover available FedRAMP MCP tools by keyword or category. Use this to find the right tool for your task.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search query (empty to browse all tools) |
| `category` | string | No | Filter by category: Discovery, KSI, Controls, Search, Analysis, System |
| `limit` | number | No | Max results (1-21, default 5) |

**Example prompts:**
> "Search FedRAMP tools for 'control'"
> "What tools are available for KSI analysis?"
> "List all FedRAMP MCP tools"

---

### update_repository

Force update the cached FedRAMP docs repository to get the latest data from GitHub.

**Parameters:** None

**Returns:** Update status with commit information

**Example prompt:**
> "Update the FedRAMP docs repository to get the latest data"

---

## Usage Patterns

### Start a FedRAMP Research Session

1. Run `health_check` to verify server status
2. Use `list_frmr_documents` to see available data
3. Query specific KSIs or controls as needed

### Understand a Specific Control

1. `get_control_requirements` for the control ID
2. `grep_controls_in_markdown` for additional context
3. `search_definitions` for related terms

### Review KSI Requirements by Theme

1. `get_theme_summary` for the theme overview
2. `list_ksi` filtered by category for details
3. `get_evidence_examples` for compliance guidance
