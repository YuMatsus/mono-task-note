import { FrontMatterCache } from 'obsidian';

export interface TaskFrontmatter {
    done: boolean;
    done_at?: string;
    due_date: string | null;
    priority: number;
    scheduled_time: string | null;
    type: 'task' | string;
    [key: string]: any; // Allow additional properties
}

/**
 * Type guard to check if frontmatter is a TaskFrontmatter
 */
export function isTaskFrontmatter(frontmatter: FrontMatterCache | undefined): frontmatter is Partial<TaskFrontmatter> {
    return frontmatter !== undefined &&
           frontmatter.type === 'task';
}