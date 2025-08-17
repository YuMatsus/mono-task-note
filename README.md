# Mono Task Note

A streamlined Obsidian plugin that transforms individual notes into manageable tasks through structured frontmatter metadata. Perfect for users who prefer a one-note-per-task approach to task management.

## Overview

Mono Task Note treats each note as a single task, automatically managing task metadata through frontmatter fields. This approach integrates seamlessly with Obsidian's existing note-taking workflow while adding powerful task management capabilities.

## Features

### Task Creation
- **Create task note command**: Instantly create a new task note with predefined frontmatter
  - Filename: 13-digit Unix timestamp in milliseconds (e.g., `1734567890123.md`)
  - Task frontmatter fields:
    - `type`: task (identifies the note as a task)
    - `done`: false (completion status)
    - `done_at`: null (completion timestamp)
    - `due_date`: null (deadline for the task)
    - `priority`: 4 (task priority level)
    - `scheduled_time`: null (scheduled time)
  - Automatically opens the created note for immediate editing

### Recurring Tasks
- **Create recurring task note command**: Create a task that repeats on a schedule
  - All standard task fields plus:
    - `attributes`: ['recurring'] (identifies as recurring task)
    - `recurring_days_of_month`: [] (days of month 1-31)
    - `recurring_days_of_week`: [] (days of week: Sun, Mon, Tue, Wed, Thu, Fri, Sat)
    - `recurring_scheduled_times`: [] (times in HH:mm format)
  
- **Configure recurring schedules**: Interactive modals for setting recurrence patterns
  - **Set recurring days of month**: Select specific days (1-31) when task should recur
  - **Set recurring days of week**: Choose weekdays for weekly recurring tasks
  - **Set recurring scheduled times**: Add multiple scheduled times in HH:mm format
  - Commands only available for notes with `attributes: ['recurring']`

### Template System
- **Custom templates**: Create task notes using your own templates
  - Configure template file path in plugin settings
  - **Full compatibility with Obsidian's core Templates plugin variables**:
    - `{{date}}`: Current date (YYYY-MM-DD)
    - `{{time}}`: Current time (HH:mm)
    - `{{title}}`: Task note filename
    - `{{date:FORMAT}}`: Custom date format (e.g., `{{date:YYYY/MM/DD}}`)
    - `{{time:FORMAT}}`: Custom time format (e.g., `{{time:HH:mm:ss}}`)
  - Template selection via user-friendly modal interface
  - Seamlessly works with your existing Obsidian templates

### Task Management
- **Automatic completion tracking**: Smart timestamp management
  - Automatically adds `done_at` timestamp when marking tasks complete
  - Removes `done_at` when marking tasks incomplete
  - Customizable timestamp format (default: ISO 8601)
  - Preserves existing timestamps when appropriate

- **Quick task commands**: Efficient task status management
  - **Complete current task**: Mark active task as done with timestamp
  - **Uncomplete current task**: Mark task as incomplete and clear timestamp
  - **Toggle task completion**: Quick switch between done/undone states
  - Commands only activate for notes with `type: task` frontmatter

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