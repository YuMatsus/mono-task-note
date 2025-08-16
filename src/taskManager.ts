import { App, TFile, moment } from 'obsidian';
import { MonoTaskNoteSettings } from './settings';
import { TaskFrontmatter, isTaskFrontmatter } from './types';

export class TaskManager {
    constructor(
        private readonly app: App,
        private readonly settings: MonoTaskNoteSettings
    ) {}

    /**
     * Get the current timestamp in the configured format
     */
    private formatNow(): string {
        const format = this.settings.doneAtFormat || 'YYYY-MM-DDTHH:mm:ssZ';
        return moment().format(format);
    }


    /**
     * Check if done_at field needs to be updated
     * Returns true if done_at is null, undefined, or empty string
     */
    private needsDoneAtUpdate(doneAt: TaskFrontmatter['done_at']): boolean {
        return doneAt === null || doneAt === undefined || doneAt === '';
    }

    /**
     * Mark a task as complete by setting done: true and adding done_at timestamp
     */
    async completeTask(file: TFile): Promise<void> {
        // Check if this is a task note
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!isTaskFrontmatter(metadata?.frontmatter)) {
            return;
        }

        await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
            fm.done = true;
            // Update done_at if it's null, undefined, or empty
            if (this.needsDoneAtUpdate(fm.done_at)) {
                fm.done_at = this.formatNow();
            }
        });
    }

    /**
     * Mark a task as incomplete by setting done: false and removing done_at
     */
    async uncompleteTask(file: TFile): Promise<void> {
        // Check if this is a task note
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!isTaskFrontmatter(metadata?.frontmatter)) {
            return;
        }

        await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
            fm.done = false;
            delete fm.done_at;
        });
    }

    /**
     * Toggle task completion status (atomic operation)
     */
    async toggleTaskCompletion(file: TFile): Promise<void> {
        // Check if this is a task note before processing
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!isTaskFrontmatter(metadata?.frontmatter)) {
            return;
        }

        await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
            const wasDone = fm.done === true;
            fm.done = !wasDone;
            
            if (fm.done) {
                // Mark as complete - update done_at if needed
                if (this.needsDoneAtUpdate(fm.done_at)) {
                    fm.done_at = this.formatNow();
                }
            } else {
                // Mark as incomplete - remove done_at
                delete fm.done_at;
            }
        });
    }

    /**
     * Handle automatic done_at timestamp when done is set to true
     * Also removes done_at when done is set to false
     */
    async handleDoneStatusChange(file: TFile): Promise<void> {
        const metadata = this.app.metadataCache.getFileCache(file);
        const frontmatter = metadata?.frontmatter;
        
        // Only process task notes
        if (!isTaskFrontmatter(frontmatter)) return;
        
        // Check if done is true and done_at doesn't exist or is empty
        if (frontmatter.done === true && this.needsDoneAtUpdate(frontmatter.done_at)) {
            await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
                fm.done_at = this.formatNow();
            });
        } 
        // Remove done_at if done is false but done_at exists
        else if (frontmatter.done !== true && frontmatter.done_at) {
            await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
                delete fm.done_at;
            });
        }
    }
}