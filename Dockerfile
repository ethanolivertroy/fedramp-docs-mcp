# Multi-stage build for FedRAMP Docs MCP Server
# Security-hardened following 2025 Docker + MCP best practices

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install git for potential repo operations
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S mcpuser && \
    adduser -u 1001 -S mcpuser -G mcpuser

# Install git (needed for repository operations)
RUN apk add --no-cache git

# Create cache directory with proper permissions
RUN mkdir -p /home/mcpuser/.cache/fedramp-docs && \
    chown -R mcpuser:mcpuser /home/mcpuser

# Copy production dependencies and built files
COPY --from=builder --chown=mcpuser:mcpuser /app/node_modules ./node_modules
COPY --from=builder --chown=mcpuser:mcpuser /app/dist ./dist
COPY --from=builder --chown=mcpuser:mcpuser /app/package.json ./

# Switch to non-root user
USER mcpuser

# Environment configuration
ENV NODE_ENV=production
ENV FEDRAMP_DOCS_AUTO_UPDATE=true
ENV FEDRAMP_DOCS_ALLOW_AUTO_CLONE=true
ENV HOME=/home/mcpuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD node -e "console.log('healthy')" || exit 1

# Stdio transport for MCP
ENTRYPOINT ["node", "dist/index.js"]
