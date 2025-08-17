# Release Process

This document describes the standard process for releasing new versions of the Mono Task Note plugin.

## Prerequisites

- Ensure all changes are merged to the master branch
- All tests pass and the build is successful
- GitHub CLI (`gh`) is installed and authenticated

## Step-by-Step Release Process

### 1. Update Version Numbers

Update the version in three files:

1. **manifest.json**: Update the `"version"` field
2. **package.json**: Update the `"version"` field to match
3. Run the version bump script to update **versions.json**:

```bash
npm run version
```

This command will automatically:
- Update versions.json with the new version
- Stage manifest.json and versions.json for commit

### 2. Update package-lock.json

After updating package.json, regenerate the lock file to ensure version consistency:

```bash
npm install
```

This will update package-lock.json with the new version number.

### 3. Commit Version Changes

Stage and commit all version-related files:

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to X.X.X"
```

### 4. Create and Push Version Tag

Create a git tag for the release:

```bash
git tag vX.X.X
git push origin master --tags
```

**Note**: Always use the `v` prefix for version tags (e.g., `v0.1.1`, not `0.1.1`)

### 5. Build Release Assets

Build the production version of the plugin:

```bash
npm run build
```

This creates the distributable files:
- `main.js` - The compiled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles

### 6. Create GitHub Release

Use GitHub CLI to create the release and upload assets:

```bash
gh release create vX.X.X \
  --title "vX.X.X" \
  --notes "<release notes>" \
  main.js manifest.json styles.css
```

**Important**: Do NOT create zip files. Upload the three files individually.

## Release Notes Template

Use this template for release notes:

```markdown
## What's Changed

### ✨ New Features
- Feature description (#PR_NUMBER)
  - Additional details about the feature

### 🐛 Bug Fixes
- Fix description (#PR_NUMBER)

### 🔧 Technical Improvements
- Improvement description (#PR_NUMBER)

### 📝 Documentation
- Documentation updates (#PR_NUMBER)

## Installation

1. Download the following files from the Assets below:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Create a new folder in your vault's plugins directory:
   `VaultFolder/.obsidian/plugins/mono-task-note/`
3. Place the downloaded files in this folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community plugins

## Compatibility

- Requires Obsidian v1.8.0 or higher

**Full Changelog**: https://github.com/YuMatsus/obsidian-mono-task-note/compare/vPREVIOUS...vCURRENT
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.0.X): Bug fixes, backwards compatible

Examples:
- `0.1.0` → `0.1.1`: Bug fix or small improvement
- `0.1.1` → `0.2.0`: New feature added
- `0.2.0` → `1.0.0`: Major release or breaking change

## Troubleshooting

### Version Mismatch Errors

If you encounter version mismatch errors:

1. Ensure all three files have the same version:
   ```bash
   grep '"version"' manifest.json package.json
   ```

2. Verify versions.json contains the new version:
   ```bash
   cat versions.json
   ```

3. If needed, manually edit the files and re-run the process

### Failed Release Upload

If the GitHub release fails:

1. Check your GitHub CLI authentication:
   ```bash
   gh auth status
   ```

2. Verify the tag exists:
   ```bash
   git tag -l
   ```

3. Create the release manually through GitHub web interface if needed

## Post-Release Checklist

- [ ] Verify the release appears on GitHub
- [ ] Download and test the released files
- [ ] Update README.md if needed
- [ ] Announce the release if applicable