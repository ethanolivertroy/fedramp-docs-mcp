---
description: Get evidence examples for FedRAMP compliance
---

# Evidence Examples

Get evidence examples for FedRAMP compliance automation.

Filter by theme or KSI ID: "$ARGUMENTS" (optional)

Use the fedramp-docs MCP server's get_evidence_examples tool to collect all evidence examples needed for compliance. Show examples of required evidence organized by KSI theme.

## What's Included

The evidence examples database contains **830+ automation sources** from **50+ providers** including:

- **Cloud Platforms**: AWS, Azure, GCP, Oracle Cloud
- **Identity & Access**: Okta (with WebAuthn/FIDO2), Duo, Entra ID, CrowdStrike Identity
- **Security Tools**: Splunk, Sentinel, Palo Alto, CrowdStrike, Veracode
- **Collaboration**: Google Workspace, Microsoft 365, Webex, Zoom, Box
- **DevOps**: GitHub, GitLab, Terraform, Docker, Kubernetes

Each source includes:
- Provider and service name
- API endpoints or CLI commands
- Specific evidence collection guidance
- Official documentation links
- Compliance tips and gotchas

## Example Use Cases

**Phishing-Resistant MFA (KSI-IAM-01):**
- Okta WebAuthn factor verification
- Duo passkey enrollment checks
- Entra ID authentication strength policies

**Network Security (KSI-CNA-01):**
- AWS Security Group rules
- Kubernetes NetworkPolicy configs
- GCP VPC firewall rules

**Vulnerability Management (KSI-VUL-*):**
- Container image scanning (Snyk, Aqua)
- Dependency scanning (Dependabot)
- Infrastructure scanning (Prowler, ScoutSuite)

## Disclaimer

These are community-suggested automation approaches, not official FedRAMP guidance. Always verify with your 3PAO and FedRAMP PMO.
