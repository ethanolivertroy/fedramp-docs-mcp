# Security Hardening

This guide covers secure configurations for running fedramp-docs-mcp in production environments.

## Overview

fedramp-docs-mcp is a read-only tool that:
- Clones the public FedRAMP/docs GitHub repository
- Indexes and queries JSON/Markdown files
- Does NOT make external API calls beyond git operations
- Does NOT store credentials or sensitive data

However, when deploying in security-sensitive environments, apply defense-in-depth principles.

## Docker Security

### Non-Root User

Run the container as a non-root user:

```dockerfile
FROM node:20-slim

# Create non-root user
RUN groupadd -r fedramp && useradd -r -g fedramp fedramp

WORKDIR /app
COPY --chown=fedramp:fedramp . .

USER fedramp
CMD ["node", "dist/index.js"]
```

Or at runtime:

```bash
docker run -it --user 1000:1000 fedramp-docs-mcp
```

### Read-Only Filesystem

Mount the root filesystem as read-only, with explicit writable paths:

```bash
docker run -it \
  --read-only \
  --tmpfs /tmp \
  -v fedramp-cache:/home/fedramp/.cache/fedramp-docs \
  fedramp-docs-mcp
```

### Resource Limits

Prevent resource exhaustion:

```bash
docker run -it \
  --memory=512m \
  --memory-swap=512m \
  --cpus=1.0 \
  --pids-limit=100 \
  fedramp-docs-mcp
```

### Network Isolation

After initial clone, the server doesn't need network access:

```bash
# First run - allow network for git clone
docker run -it fedramp-docs-mcp

# Subsequent runs - disable network
docker run -it \
  --network=none \
  -v fedramp-cache:/root/.cache/fedramp-docs \
  fedramp-docs-mcp
```

### Drop Capabilities

Remove all Linux capabilities:

```bash
docker run -it \
  --cap-drop=ALL \
  fedramp-docs-mcp
```

### Security Options

Enable security profiles:

```bash
docker run -it \
  --security-opt=no-new-privileges:true \
  --security-opt=seccomp=default \
  fedramp-docs-mcp
```

### Complete Hardened Example

```bash
docker run -it \
  --user 1000:1000 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid \
  --memory=512m \
  --cpus=1.0 \
  --pids-limit=100 \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  -v fedramp-cache:/home/fedramp/.cache/fedramp-docs:rw \
  fedramp-docs-mcp
```

### Docker Compose (Hardened)

```yaml
version: '3.8'

services:
  fedramp-docs-mcp:
    image: ghcr.io/ethanolivertroy/fedramp-docs-mcp:latest
    user: "1000:1000"
    read_only: true
    stdin_open: true
    tty: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    volumes:
      - fedramp-cache:/home/fedramp/.cache/fedramp-docs:rw
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true

volumes:
  fedramp-cache:
```

## Air-Gapped / Offline Operation

For environments without internet access:

### 1. Pre-Clone Repository

On a connected system:

```bash
git clone https://github.com/FedRAMP/docs.git fedramp-docs
tar -czf fedramp-docs.tar.gz fedramp-docs
```

### 2. Transfer to Air-Gapped System

Use approved file transfer methods (USB, secure file transfer).

### 3. Configure Server

```bash
# Extract the pre-cloned repository
tar -xzf fedramp-docs.tar.gz -C /opt/

# Run with explicit path and no auto-update
docker run -it \
  --network=none \
  -v /opt/fedramp-docs:/fedramp-docs:ro \
  -e FEDRAMP_DOCS_PATH=/fedramp-docs \
  -e FEDRAMP_DOCS_AUTO_UPDATE=false \
  fedramp-docs-mcp
```

### 4. Update Procedure

When updates are needed:

1. Clone latest FedRAMP/docs on connected system
2. Create tarball
3. Transfer via approved mechanism
4. Replace mounted directory
5. Restart container

## npm Installation Security

### Verify Package Integrity

```bash
# Check package checksum
npm view fedramp-docs-mcp dist.integrity

# Install with integrity verification
npm install fedramp-docs-mcp --strict-peer-deps
```

### Use npx Safely

```bash
# Verify the package before running
npm view fedramp-docs-mcp

# Run with specific version
npx fedramp-docs-mcp@0.2.2
```

## File Permissions

The server needs:
- **Read access** to FedRAMP docs (can be read-only mount)
- **Write access** to cache directory (first-run clone only)

Minimal permissions:

```bash
# Create cache directory with restricted permissions
mkdir -p ~/.cache/fedramp-docs
chmod 700 ~/.cache/fedramp-docs
```

## Audit Logging

Enable debug logging to track server activity:

```bash
DEBUG=fedramp:* node dist/index.js 2>&1 | tee /var/log/fedramp-docs-mcp.log
```

Or in Docker:

```bash
docker run -it \
  -e DEBUG=fedramp:* \
  -v /var/log/fedramp:/var/log \
  fedramp-docs-mcp \
  2>&1 | tee /var/log/fedramp/mcp.log
```

## Supply Chain Security

### Verify Source

```bash
# Clone from official repository
git clone https://github.com/ethanolivertroy/fedramp-docs-mcp.git

# Verify commits are signed (if GPG signing is configured)
git log --show-signature -1
```

### Pin Dependencies

Use `package-lock.json` to pin exact dependency versions:

```bash
npm ci  # Uses package-lock.json exactly
```

### Build from Source

For maximum control, build from verified source:

```bash
git clone https://github.com/ethanolivertroy/fedramp-docs-mcp.git
cd fedramp-docs-mcp
npm ci
npm run build
npm pack  # Creates local tarball
npm install ./fedramp-docs-mcp-*.tgz
```

## Security Contacts

To report security vulnerabilities:
- Open a private security advisory on GitHub
- Email the maintainer (see repository)

Do NOT open public issues for security vulnerabilities.
