# Automated Release Process

This repository uses an automated release process that triggers on every push to the `main` branch.

## How It Works

### Version Bump Strategy

The automation determines the version bump type based on commit message patterns:

- **MAJOR** version bump (breaking changes):
  - `BREAKING CHANGE` in commit message
  - `breaking:` prefix
  - `!:` prefix

- **MINOR** version bump (new features):
  - `feat:` prefix
  - `feature:` prefix

- **PATCH** version bump (bug fixes, improvements):
  - All other commits (default)

### Release Workflow

When you push/merge to `main`:

1. **Auto Release Workflow** (`.github/workflows/auto-release.yml`):
   - Runs tests and builds the package
   - Analyzes commit messages to determine version bump type
   - Updates `package.json` version
   - Creates a git tag
   - Generates a changelog from commit messages
   - Creates a GitHub release
   - Pushes the version bump commit and tag

2. **Release Workflow** (`.github/workflows/release.yml`):
   - Automatically triggers when a GitHub release is published
   - Publishes the package to npm with provenance

## Usage Examples

### For Bug Fixes (Patch Release)
```bash
git commit -m "fix: resolve parsing issue with nested expressions"
# Results in: 1.0.2 → 1.0.3
```

### For New Features (Minor Release)
```bash
git commit -m "feat: add support for array filtering"
# Results in: 1.0.2 → 1.1.0
```

### For Breaking Changes (Major Release)
```bash
git commit -m "feat!: change API signature for parse function"
# or
git commit -m "feat: rewrite parser

BREAKING CHANGE: The parse function now returns a different object structure"
# Results in: 1.0.2 → 2.0.0
```

## Manual Override

If you need to create a manual release:

1. Create a GitHub release manually through the web interface
2. The npm publishing will still happen automatically

## Skip Release

To skip the automated release (for documentation changes, etc.), the workflow already ignores:
- Markdown files (`**.md`)
- GitHub workflows (`.github/**`)
- Git ignore files

Additionally, version bump commits (starting with "chore: bump version") are automatically skipped to prevent infinite loops.

## Requirements

Make sure the following secrets are configured in your repository:

- `NPM_TOKEN`: Your npm authentication token for publishing packages
- `GITHUB_TOKEN`: Automatically provided by GitHub (no setup needed)

## Troubleshooting

- Check the Actions tab for workflow run details
- Ensure your npm token has publish permissions
- Verify that the package name in `package.json` is available on npm
- Make sure your repository has write permissions for the GitHub token 