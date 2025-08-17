import { FrontMatterCache } from 'obsidian';

// Custom type definitions for Obsidian Commands API
export interface Command {
    id: string;
    name: string;
    callback: () => void;
}

export interface Commands {
    commands: { [commandId: string]: Command };
    executeCommandById(commandId: string): boolean;
    listCommands(): Command[];
}

export interface TaskFrontmatter {
    attributes?: string[]; // For recurring tasks
    done: boolean;
    done_at?: string | null;
    due_date: string | null;
    priority: number;
    recurring_days_of_month?: number[]; // Days of month for recurring tasks (1-31)
    recurring_days_of_week?: string[]; // Days of week for recurring tasks (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
    recurring_scheduled_times?: string[]; // Scheduled times for recurring tasks (HH:mm format)
    scheduled_time: string | null;
    type: 'task';
    [key: string]: unknown; // Allow additional properties
}

/**
 * Type guard to check if frontmatter is a TaskFrontmatter
 */
export function isTaskFrontmatter(
    frontmatter: FrontMatterCache | undefined
): frontmatter is FrontMatterCache & Partial<TaskFrontmatter> {
    return (
        frontmatter !== undefined &&
        typeof frontmatter.type === 'string' &&
        frontmatter.type === 'task'
    );
}