# Rule for Agents

## Build & Test Commands

### Dependency Management

- Install dependencies: `npm install`
- Run in development mode: `npm run dev`
- Build for production: `npm run build`
- Version bump: `npm run version`

### Testing and Linting

- TypeScript type checking: `tsc -noEmit -skipLibCheck`
- Run ESLint: `npx eslint . --ext .ts`
- Fix ESLint issues: `npx eslint . --ext .ts --fix`

## Technical Stack

- **TypeScript version**: TypeScript 4.7.4
- **Runtime**: Obsidian API (Electron environment)
- **Build tool**: esbuild
- **Project config**: `package.json`, `tsconfig.json`, `manifest.json`
- **Linter**: ESLint with @typescript-eslint
- **Module system**: ESNext modules (bundled as CJS)
- **Development environment**: Node.js 16+

## Code Style Guidelines

- **Language**: TypeScript (`.ts` files)
- **Use English**: All code comments, commit messages, pull requests, and documentation must be in English
- **Formatting**: Follow ESLint rules configured in `.eslintrc`
- **Imports**: Import Obsidian API from `obsidian` package
- **Type annotations**: Use TypeScript types extensively
- **Naming conventions**: camelCase for variables/functions, PascalCase for classes
- **Function length**: Keep functions under 30 lines with single responsibility
- **Comments**: Minimal comments, let code be self-documenting

## Obsidian Plugin Best Practices

- **Obsidian API**: Use only official public APIs, avoid undocumented internals
  - API Reference: https://docs.obsidian.md/Reference
- **Plugin class**: Extend `Plugin` class, implement `onload()` and `onunload()`
- **Settings management**: Persist settings with `loadData()` and `saveData()`
- **Event handling**: Register events with `registerEvent()` for automatic cleanup
- **UI components**: Use Obsidian's Modal, ItemView, and other UI classes
- **Commands**: Add commands to command palette with `addCommand()`
- **Ribbon icons**: Add sidebar icons with `addRibbonIcon()`
- **Error handling**: Use `Notice` class for user notifications
- **File operations**: Use Vault API methods for file CRUD operations
- **Workspace**: Access workspace via `this.app.workspace`

## Development Patterns & Best Practices

- **Favor simplicity**: Choose the simplest solution that meets requirements
- **DRY principle**: Avoid code duplication; reuse existing functionality
- **Configuration management**: Use plugin settings for user-configurable options
- **Focused changes**: Only implement explicitly requested or fully understood changes
- **Preserve patterns**: Follow existing code patterns when fixing bugs
- **File size**: Keep files under 300 lines; refactor when exceeding this limit
- **Testing approach**: Manual testing in Obsidian sandbox vault
- **Modular design**: Create reusable, modular components
- **Logging**: Use `console.log` for debugging (remove before production)
- **Error handling**: Implement robust error handling with try-catch blocks
- **Security best practices**: Validate user inputs and file paths
- **Performance**: Optimize for Obsidian's file indexing and caching
- **Dependency management**: Add npm packages only when essential
  - When adding dependencies, update `package.json`
  - Run `npm install` to update `package-lock.json`
  - Ensure dependencies are marked as external in `esbuild.config.mjs`

## Development Workflow

- **Version control**: Commit frequently with clear messages
- **Versioning**: Update version in `manifest.json`, `versions.json`, and `package.json`
  - Use semantic versioning (e.g., 1.2.3)
  - Run `npm run version` to automate version bumping
- **Impact assessment**: Evaluate how changes affect other codebase areas
- **Documentation**: Keep README.md up-to-date with features and usage
- **Dependencies**: When adding dependencies, always update `package-lock.json`
- **Testing**: Test in a dedicated Obsidian vault before release
- **Release process**: Build with `npm run build`, then package `main.js`, `manifest.json`, and `styles.css`
