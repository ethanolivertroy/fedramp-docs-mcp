# FRMR Document Types Reference

The FedRAMP Machine-Readable (FRMR) format provides structured JSON data for FedRAMP requirements. This reference explains each document type.

## Overview

FRMR documents are JSON files in the official [FedRAMP/docs](https://github.com/FedRAMP/docs) repository that encode:
- Key Security Indicators (KSIs)
- Control mappings
- Definitions
- Version information

## Document Types

### KSI (Key Security Indicators)

**Description:** The core of FedRAMP 20x. KSIs are measurable security requirements that CSPs must demonstrate compliance with.

**File pattern:** `frmr/*ksi*.json`

**Structure:**
```json
{
  "id": "KSI-IAM-01",
  "theme": "IAM",
  "title": "Multi-Factor Authentication",
  "description": "MFA is required for all privileged access...",
  "impact_levels": ["low", "moderate", "high"],
  "status": "active"
}
```

**Related tools:**
- `list_ksi` - List and filter KSIs
- `get_ksi` - Get a specific KSI
- `filter_by_impact` - Filter by impact level
- `get_theme_summary` - Get all KSIs for a theme

---

### MAS (Mapping and Alignment Set)

**Description:** Maps FedRAMP requirements to NIST SP 800-53 controls and other frameworks.

**File pattern:** `frmr/*mas*.json`

**Purpose:**
- Shows which NIST controls satisfy FedRAMP requirements
- Enables crosswalks between frameworks
- Supports inherited controls tracking

**Related tools:**
- `list_controls` - Browse control mappings
- `get_control_requirements` - Get FedRAMP requirements for a NIST control
- `analyze_control_coverage` - Coverage report

---

### VDR (Validation and Determination Rules)

**Description:** Rules for validating CSP compliance with requirements.

**File pattern:** `frmr/*vdr*.json`

**Purpose:**
- Defines how compliance is measured
- Specifies evidence requirements
- Provides assessment criteria

**Related tools:**
- `get_frmr_document` with type "VDR"
- `list_frmr_documents` to discover VDR files

---

### SCN (Significant Change Notification)

**Description:** Requirements and procedures for significant change requests.

**File pattern:** `frmr/*scn*.json`

**Purpose:**
- Defines what constitutes a significant change
- Specifies notification requirements
- Outlines approval process

**Related tools:**
- `get_significant_change_guidance`
- `search_markdown` with "significant change"

---

### FRD (FedRAMP Definitions)

**Description:** Official definitions of FedRAMP-specific terms and concepts.

**File pattern:** `frmr/*frd*.json`, `frmr/*definitions*.json`

**Structure:**
```json
{
  "id": "FRD-001",
  "term": "Authorization Boundary",
  "definition": "The set of all cloud resources..."
}
```

**Related tools:**
- `search_definitions` - Search terms
- `get_requirement_by_id` - Get specific definition

---

### ADS (Additional Data Sets)

**Description:** Supplementary structured data supporting the primary document types.

**File pattern:** `frmr/*ads*.json`

**Purpose:**
- Evidence examples
- Implementation guidance
- Supporting metadata

**Related tools:**
- `get_evidence_examples`
- `get_frmr_document` with type "ADS"

---

## KSI Themes

KSIs are organized into 11 thematic categories:

| Code | Theme | Description |
|------|-------|-------------|
| AFR | Audit and Forensics | Logging, audit trails, forensic capabilities |
| CED | Cryptographic Enforcement of Data | Encryption, key management, crypto standards |
| CMT | Configuration Management and Transparency | CM processes, baseline configurations |
| CNA | Continuous Assurance | Ongoing monitoring, assessment activities |
| IAM | Identity and Access Management | Authentication, authorization, identity |
| INR | Incident Response | IR procedures, reporting, containment |
| MLA | Malware Analysis | Anti-malware, threat detection |
| PIY | Privacy | PII protection, privacy controls |
| RPL | Resilience and Planning | DR, BCP, availability |
| SVC | Service Protection | Service security, boundary protection |
| TPR | Third-Party Risk | Supply chain, vendor management |

Use `get_theme_summary` to get all KSIs and guidance for a specific theme.

---

## Impact Levels

FedRAMP defines three impact levels based on FIPS 199:

| Level | Description | Example Systems |
|-------|-------------|-----------------|
| **Low** | Limited adverse effect | Public websites, non-sensitive data |
| **Moderate** | Serious adverse effect | Most federal systems, PII |
| **High** | Severe or catastrophic effect | National security, law enforcement |

KSIs specify which impact levels they apply to. Use `filter_by_impact` to find requirements for a specific level.

---

## Version Tracking

FRMR documents include version metadata:

```json
{
  "version": "1.0.0",
  "effective_date": "2024-01-01",
  "supersedes": "0.9.0"
}
```

Use `list_versions` to see all detected versions and `diff_frmr` to compare document versions.

---

## Document Discovery

To explore available FRMR documents:

1. **List all documents:**
   > "List all FRMR documents"

   Uses `list_frmr_documents`

2. **Check health and index:**
   > "Run health check"

   Uses `health_check`

3. **Get specific document:**
   > "Get the KSI document"

   Uses `get_frmr_document`

---

## Data Freshness

FRMR documents are sourced from the official [FedRAMP/docs](https://github.com/FedRAMP/docs) repository. Updates depend on:

1. FedRAMP program office releases
2. Your `FEDRAMP_DOCS_AUTO_UPDATE` setting
3. Manual `update_repository` calls

See [Keeping Data Current](../guides/updating.md) for update procedures.
