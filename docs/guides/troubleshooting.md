# Troubleshooting Guide

Common issues and solutions for fedramp-docs-mcp.

## Installation Issues

### npm install fails

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Fix npm permissions (recommended)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then install
npm install -g fedramp-docs-mcp
```

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
npm install -g fedramp-docs-mcp --legacy-peer-deps
```

### npx fails to run

**Error:** `npx: command not found`

**Solution:** Ensure Node.js is installed correctly:
```bash
# Check Node.js installation
node --version
npm --version

# Reinstall if needed (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## First Run Issues

### Git clone fails

**Error:** `fatal: unable to access 'https://github.com/FedRAMP/docs.git/'`

**Causes & Solutions:**

1. **Network issue:**
   ```bash
   # Test connectivity
   curl -I https://github.com

   # Check proxy settings
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   ```

2. **Firewall blocking:**
   - Ensure outbound HTTPS (port 443) is allowed to github.com

3. **Corporate proxy:**
   ```bash
   git config --global http.proxy http://proxy.company.com:8080
   ```

### Slow first startup

**Expected behavior:** First run clones the FedRAMP/docs repository (~50MB), which may take 1-2 minutes on slower connections.

**Solution:** Use a pre-cloned repository:
```bash
# Clone manually
git clone https://github.com/FedRAMP/docs.git ~/.cache/fedramp-docs

# Verify
ls ~/.cache/fedramp-docs
```

## Runtime Issues

### health_check returns 0 files indexed

**Cause:** Repository clone failed or path is incorrect.

**Solution:**
```bash
# Check if cache exists
ls -la ~/.cache/fedramp-docs

# If empty or missing, delete and re-run
rm -rf ~/.cache/fedramp-docs
npx fedramp-docs-mcp
```

### "Tool not found" errors

**Cause:** Server may not be properly initialized.

**Solution:**
1. Run `health_check` first to initialize
2. Verify server is running (check MCP client logs)
3. Restart the MCP client application

### Search returns no results

**Cause:** Index may be corrupted or query syntax issue.

**Solutions:**
```bash
# Force reindex
rm -rf ~/.cache/fedramp-docs
npx fedramp-docs-mcp
```

**Query tips:**
- Use simple keywords, not complex regex
- Try broader searches first
- Check spelling of FedRAMP-specific terms

### Out of memory errors

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npx fedramp-docs-mcp
```

## MCP Client Issues

### Server not appearing in Claude Desktop

1. **Check config file location:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Validate JSON syntax:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```

3. **Check for typos** in the server name and command

4. **Restart Claude Desktop** completely (quit from menu bar)

### Server crashes immediately

**Check logs:**
- Claude Desktop: View > Developer > Developer Tools > Console
- Cursor: Help > Toggle Developer Tools > Console

**Common causes:**
- Node.js not in PATH
- Missing dependencies
- Corrupted cache

### Connection timeout

**Error:** `MCP server failed to respond`

**Solution:**
```bash
# Test server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx fedramp-docs-mcp
```

If this fails, check:
- Node.js version (18+ required)
- npm installation
- Network connectivity for first-run clone

## Docker Issues

### Container exits immediately

**Cause:** MCP uses stdio, not HTTP.

**Solution:** Run with `-it` flags:
```bash
docker run -it fedramp-docs-mcp  # Not just 'docker run'
```

### Permission denied on volume mount

**Solution:**
```bash
# Create volume with correct permissions
docker volume create fedramp-cache

# Or run with user mapping
docker run -it --user $(id -u):$(id -g) fedramp-docs-mcp
```

### Network errors in container

**Solution:**
```bash
# Ensure network access for git clone
docker run -it --network=bridge fedramp-docs-mcp
```

## Data Issues

### Outdated FedRAMP data

**Solution:** Force an update:
```bash
# Option 1: Use the update_repository tool
# Ask your AI: "Call update_repository from fedramp-docs"

# Option 2: Manual update
cd ~/.cache/fedramp-docs
git pull origin main
```

### Missing documents

**Cause:** FedRAMP/docs repository may have changed structure.

**Solution:**
1. Run `list_frmr_documents` to see what's available
2. Check the [FedRAMP/docs repo](https://github.com/FedRAMP/docs) for changes
3. Report issues on GitHub if documents are missing

## Debug Mode

Enable verbose logging:

```bash
# Full debug output
DEBUG=* npx fedramp-docs-mcp

# FedRAMP-specific debug
DEBUG=fedramp:* npx fedramp-docs-mcp
```

## Getting Help

If these solutions don't resolve your issue:

1. **Check existing issues:** [GitHub Issues](https://github.com/ethanolivertroy/fedramp-docs-mcp/issues)

2. **Open a new issue** with:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
   - Error message (full text)
   - Steps to reproduce

3. **Include debug output:**
   ```bash
   DEBUG=* npx fedramp-docs-mcp 2>&1 | head -100
   ```
