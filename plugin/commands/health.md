---
description: Check FedRAMP MCP server health status
---

# Health Check

Check the health status of the FedRAMP Docs MCP server.

Use the fedramp-docs MCP server health_check tool to verify index readiness, file counts, repository version, and auto-update status.

## Example Output

```json
{
  "ok": true,
  "indexedFiles": 156,
  "repoPath": "/Users/you/.cache/fedramp-docs",
  "repoInfo": {
    "commitHash": "95e4187",
    "commitDate": "2025-12-29T17:31:38-05:00",
    "lastFetchedAt": "2025-12-30T00:06:17.351Z"
  },
  "autoUpdate": {
    "enabled": true,
    "checkIntervalHours": 24
  }
}
```

## Fields

- `ok` - Whether the server is healthy (no indexing errors)
- `indexedFiles` - Total number of indexed files
- `repoPath` - Location of the FedRAMP docs cache
- `repoInfo` - Repository version information
  - `commitHash` - Current FedRAMP docs commit (short hash)
  - `commitDate` - When that commit was made
  - `lastFetchedAt` - Last time the repo was updated
- `autoUpdate` - Auto-update configuration
  - `enabled` - Whether automatic updates are enabled
  - `checkIntervalHours` - Hours between update checks
