import { FrontMatterCache } from 'obsidian';

export interface TaskFrontmatter {
    done: boolean;
    done_at?: string | null;
    due_date: string | null;
    priority: number;
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