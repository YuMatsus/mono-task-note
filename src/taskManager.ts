import { App, TFile, moment } from 'obsidian';
import { MonoTaskNoteSettings } from '../settings';

export class TaskManager {
    constructor(
        private app: App,
        private settings: MonoTaskNoteSettings
    ) {}

    /**
     * Mark a task as complete by setting done: true and adding done_at timestamp
     */
    async completeTask(file: TFile): Promise<void> {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            fm.done = true;
            const format = this.settings.doneAtFormat || 'YYYY-MM-DDTHH:mm:ssZ';
            fm.done_at = moment().format(format);
        });
    }

    /**
     * Mark a task as incomplete by setting done: false and removing done_at
     */
    async uncompleteTask(file: TFile): Promise<void> {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            fm.done = false;
            delete fm.done_at;
        });
    }

    /**
     * Toggle task completion status
     */
    async toggleTaskCompletion(file: TFile): Promise<void> {
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata || !metadata.frontmatter) {
            // If no frontmatter exists, mark as complete
            await this.completeTask(file);
            return;
        }

        const isDone = metadata.frontmatter.done === true;
        if (isDone) {
            await this.uncompleteTask(file);
        } else {
            await this.completeTask(file);
        }
    }

    /**
     * Handle automatic done_at timestamp when done is set to true
     */
    async handleDoneStatusChange(file: TFile): Promise<void> {
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata || !metadata.frontmatter) return;

        const frontmatter = metadata.frontmatter;
        
        // Check if done is true and done_at doesn't exist
        if (frontmatter.done === true && !frontmatter.done_at) {
            await this.app.fileManager.processFrontMatter(file, (fm) => {
                const format = this.settings.doneAtFormat || 'YYYY-MM-DDTHH:mm:ssZ';
                fm.done_at = moment().format(format);
            });
        }
    }
}