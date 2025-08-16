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

- **Template support**: Use custom templates for task notes
  - Configure template file in plugin settings
  - Supports the same template variables as Obsidian's core Templates plugin:
    - `{{date}}`: Current date (YYYY-MM-DD)
    - `{{time}}`: Current time (HH:mm)
    - `{{title}}`: Task note filename (timestamp)
    - `{{date:FORMAT}}`: Custom date format (e.g., `{{date:YYYY/MM/DD}}`)
    - `{{time:FORMAT}}`: Custom time format (e.g., `{{time:HH:mm:ss}}`)

- **Automatic done_at timestamp**: Automatically adds completion timestamp when task is marked as done
  - When `done` is changed to `true`, automatically adds `done_at` field
  - When `done` is changed to `false`, automatically removes `done_at` field
  - Configurable timestamp format in plugin settings
  - Default format: `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601)
  - Uses moment.js format strings for customization
  - Updates `done_at` if it's null, undefined, or empty when marking as complete

- **Task completion commands**: Quick commands to manage task completion status (only works with `type: task` notes)
  - **Complete current task**: Marks the active task as done and adds/updates `done_at` timestamp
  - **Uncomplete current task**: Marks the task as incomplete and removes `done_at`
  - **Toggle task completion**: Quickly switch between done/undone states

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