# Contributing Guide

Thank you for your interest in contributing to fedramp-docs-mcp! This guide covers how to contribute effectively.

## Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fedramp-docs-mcp.git
   cd fedramp-docs-mcp
   ```

3. **Set up development environment:**
   ```bash
   npm install
   npm run build
   ```

See [Local Development Setup](setup/local-development.md) for detailed instructions.

## Ways to Contribute

### Report Bugs

Found a bug? Open an issue with:
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

### Suggest Features

Have an idea? Open an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Alternative approaches considered

### Improve Documentation

Documentation improvements are always welcome:
- Fix typos or unclear wording
- Add examples
- Improve guides
- Update outdated information

### Submit Code

Code contributions should:
- Include tests for new functionality
- Pass existing tests
- Follow the code style
- Include documentation updates

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

```bash
# Run in development mode
npm run dev

# Run tests as you work
npm test
```

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Build to check for TypeScript errors
npm run build
```

### 4. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Open http://localhost:6274 and test your changes interactively.

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new functionality"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Tests only
- `refactor:` - Code refactoring
- `chore:` - Build/tooling changes

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Open a Pull Request on GitHub with:
- Clear description of changes
- Reference to related issues
- Test results

## Code Style

### TypeScript

- Use TypeScript strict mode
- Add types for all function parameters and returns
- Prefer `interface` over `type` for object shapes
- Use meaningful variable names

### Formatting

The project uses ESLint and Prettier:

```bash
# Check formatting
npm run lint

# Auto-fix issues
npm run lint:fix
npm run format
```

### Testing

- Write tests for new functionality
- Keep tests focused and readable
- Mock external dependencies

## Project Structure

```
fedramp-docs-mcp/
├── src/
│   ├── index.ts           # Entry point
│   ├── tools/             # MCP tool implementations
│   │   ├── ksi.ts         # KSI-related tools
│   │   ├── controls.ts    # Control mapping tools
│   │   └── ...
│   ├── utils/             # Shared utilities
│   └── types/             # TypeScript types
├── tests/                 # Test files
├── docs/                  # Documentation
└── dist/                  # Build output (generated)
```

## Adding a New Tool

1. **Create tool implementation** in `src/tools/`:

```typescript
export async function myNewTool(params: MyToolParams): Promise<MyToolResult> {
  // Implementation
}
```

2. **Register the tool** in `src/index.ts`:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools
    {
      name: 'my_new_tool',
      description: 'What this tool does',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: '...' }
        }
      }
    }
  ]
}));
```

3. **Add tests** in `tests/`:

```typescript
describe('myNewTool', () => {
  it('should do something', async () => {
    const result = await myNewTool({ param1: 'value' });
    expect(result).toBeDefined();
  });
});
```

4. **Update documentation** in `docs/reference/tools.md`

## Review Process

Pull requests are reviewed for:
- **Functionality** - Does it work correctly?
- **Tests** - Are there adequate tests?
- **Code quality** - Is it readable and maintainable?
- **Documentation** - Is it documented?
- **Compatibility** - Does it work with existing features?

Expect feedback and iteration. This is normal and helps ensure quality.

## Release Process

Maintainers handle releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Publish to npm
5. Update MCP Registry

## Questions?

- **GitHub Issues** - For bugs and features
- **GitHub Discussions** - For questions and ideas

## Code of Conduct

Be respectful and constructive. We're all here to make FedRAMP compliance easier.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
