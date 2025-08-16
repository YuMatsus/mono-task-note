# Mono Task Note

An Obsidian plugin for managing tasks by adding metadata (frontmatter) to notes. This plugin treats notes with specific frontmatter fields as tasks, enabling structured task management within Obsidian.

## Features

### Current Implementation

- **Create task note command**: Creates a new note with task-specific frontmatter fields
  - Filename: Unix timestamp (e.g., `1734567890.md`)
  - Automatically adds the following frontmatter:
    - `done`: false
    - `due_date`: null
    - `priority`: 4
    - `scheduled_time`: null
    - `type`: task
  - Opens the created note automatically

## Installation

1. Copy `main.js`, `styles.css`, and `manifest.json` to your vault `VaultFolder/.obsidian/plugins/mono-task-note/`
2. Reload Obsidian
3. Enable the plugin in Settings → Community plugins

## Development

### Prerequisites

- Node.js 16+
- npm

### Setup

```bash
npm install
```

### Commands

- `npm run dev` - Start compilation in watch mode
- `npm run build` - Build for production
- `npm run version` - Bump version
- `npx eslint . --ext .ts` - Run linter
- `npx tsc -noEmit -skipLibCheck` - Type check

## License

MIT