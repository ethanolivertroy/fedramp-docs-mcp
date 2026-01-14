# Keeping Data Current

This guide explains how fedramp-docs-mcp stays updated with the latest FedRAMP documentation.

## Automatic Updates

By default, fedramp-docs-mcp automatically checks for updates to the FedRAMP/docs repository.

### How It Works

1. On server startup, checks time since last update
2. If more than `FEDRAMP_DOCS_UPDATE_CHECK_HOURS` (default: 24), runs `git pull`
3. Reindexes any changed files
4. Continues serving queries

### Configure Auto-Update

**Enable/Disable:**
```bash
# Disable auto-updates
export FEDRAMP_DOCS_AUTO_UPDATE=false

# Enable (default)
export FEDRAMP_DOCS_AUTO_UPDATE=true
```

**Change frequency:**
```bash
# Check every 12 hours
export FEDRAMP_DOCS_UPDATE_CHECK_HOURS=12

# Check every hour
export FEDRAMP_DOCS_UPDATE_CHECK_HOURS=1
```

## Manual Updates

### Using the MCP Tool

The `update_repository` tool forces an immediate update:

**Via AI assistant:**
> "Call the update_repository tool from fedramp-docs"

**Response includes:**
- Previous commit hash
- New commit hash
- Files changed
- Update status

### Using Git Directly

```bash
# Navigate to cache directory
cd ~/.cache/fedramp-docs

# Pull latest changes
git pull origin main

# Verify update
git log -1 --oneline
```

### Force Full Refresh

Delete the cache to force a complete re-clone:

```bash
rm -rf ~/.cache/fedramp-docs
npx fedramp-docs-mcp  # Will re-clone from GitHub
```

## Update Strategies

### Development Environment

Frequent updates to catch the latest changes:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_UPDATE_CHECK_HOURS": "4"
      }
    }
  }
}
```

### Production Environment

Controlled updates with testing:

```json
{
  "mcpServers": {
    "fedramp-docs": {
      "command": "npx",
      "args": ["-y", "fedramp-docs-mcp"],
      "env": {
        "FEDRAMP_DOCS_AUTO_UPDATE": "false"
      }
    }
  }
}
```

Then schedule manual updates during maintenance windows.

### Air-Gapped Environment

See [Security Hardening - Air-Gapped Operation](../setup/security-hardening.md#air-gapped--offline-operation) for offline update procedures.

## Checking Current Version

### health_check Tool

Run `health_check` to see current data status:

```json
{
  "repoPath": "/Users/you/.cache/fedramp-docs",
  "currentCommit": "abc1234",
  "commitDate": "2024-01-15T10:30:00Z",
  "filesIndexed": 145,
  "autoUpdate": true,
  "lastUpdateCheck": "2024-01-15T12:00:00Z"
}
```

### Git Log

```bash
cd ~/.cache/fedramp-docs
git log -5 --oneline
```

## FedRAMP Update Frequency

The official [FedRAMP/docs repository](https://github.com/FedRAMP/docs) is updated:
- **Major releases:** Quarterly or when policies change
- **Minor fixes:** As needed (typos, clarifications)
- **FRMR documents:** Updated with each FedRAMP 20x revision

Check the repository's commit history for recent changes:
```bash
cd ~/.cache/fedramp-docs
git log --oneline --since="1 month ago"
```

## Version Diffing

Use the `diff_frmr` tool to compare document versions:

**Example:**
> "Use diff_frmr to compare the KSI documents between versions"

This helps track what changed between FedRAMP document releases.

## Troubleshooting Updates

### Update fails with merge conflict

```bash
cd ~/.cache/fedramp-docs
git reset --hard origin/main
git pull origin main
```

### Network errors during update

If behind a proxy:
```bash
cd ~/.cache/fedramp-docs
git config http.proxy http://proxy:8080
git pull origin main
```

### Updates don't seem to apply

1. Verify the update ran:
   ```bash
   cd ~/.cache/fedramp-docs
   git log -1
   ```

2. Force reindex by restarting the server

3. Check for errors in MCP client logs

## Notifications

To be notified of FedRAMP/docs updates:

1. Visit [github.com/FedRAMP/docs](https://github.com/FedRAMP/docs)
2. Click "Watch" > "Custom" > "Releases"
3. You'll receive email notifications for new releases

Or use GitHub Actions to automate checks in your own workflows.
