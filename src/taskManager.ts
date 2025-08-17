import { App, TFile, moment, Notice } from 'obsidian';
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
     * Process recurring task completion
     * Calculates and sets the next recurrence date/time
     */
    private async processRecurringTask(file: TFile, frontmatter: Partial<TaskFrontmatter>): Promise<void> {
        const { calculateNextRecurrence } = await import('./recurringTaskUtils');
        const nextRecurrence = calculateNextRecurrence(
            {
                recurring_days_of_month: frontmatter.recurring_days_of_month,
                recurring_days_of_week: frontmatter.recurring_days_of_week,
                recurring_scheduled_times: frontmatter.recurring_scheduled_times
            },
            frontmatter.due_date || null,
            frontmatter.scheduled_time || null
        );

        // If next recurrence cannot be determined, show a notice but don't clobber fields
        if (!nextRecurrence.due_date && !nextRecurrence.scheduled_time) {
            new Notice('Warning: Could not determine next recurrence date/time. Please check your recurring task settings.');
            // Mark as complete anyway but keep existing dates
            await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
                fm.done = true;
                if (this.needsDoneAtUpdate(fm.done_at)) {
                    fm.done_at = this.formatNow();
                }
            });
            return;
        }

        await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
            // Keep done as false for recurring tasks
            fm.done = false;
            fm.due_date = nextRecurrence.due_date;
            fm.scheduled_time = nextRecurrence.scheduled_time;
            
            // Clear done_at for recurring tasks
            delete fm.done_at;
        });
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

        const frontmatter = metadata!.frontmatter;
        const attributes = frontmatter.attributes || [];
        const isRecurring = attributes.includes('recurring');

        if (isRecurring) {
            // For recurring tasks, process next occurrence
            await this.processRecurringTask(file, frontmatter);
        } else {
            // For regular tasks, mark as complete
            await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
                fm.done = true;
                // Update done_at if it's null, undefined, or empty
                if (this.needsDoneAtUpdate(fm.done_at)) {
                    fm.done_at = this.formatNow();
                }
            });
        }
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

        const frontmatter = metadata!.frontmatter;
        const attributes = frontmatter.attributes || [];
        const isRecurring = attributes.includes('recurring');
        const wasDone = frontmatter.done === true;

        if (!wasDone && isRecurring) {
            // Toggling to complete for recurring task - process next occurrence
            await this.processRecurringTask(file, frontmatter);
        } else {
            // Normal toggle behavior
            await this.app.fileManager.processFrontMatter(file, (fm: Partial<TaskFrontmatter>) => {
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
        
        const attributes = frontmatter.attributes || [];
        const isRecurring = attributes.includes('recurring');
        
        // If done is set to true for a recurring task, process next occurrence
        if (frontmatter.done === true && isRecurring) {
            await this.processRecurringTask(file, frontmatter);
        }
        // Check if done is true and done_at doesn't exist or is empty (non-recurring)
        else if (frontmatter.done === true && this.needsDoneAtUpdate(frontmatter.done_at)) {
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

	async setRecurringDaysOfMonth(file: TFile): Promise<void> {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
		
		if (!frontmatter || !isTaskFrontmatter(frontmatter)) {
			throw new Error('This file is not a task note');
		}

		const attributes = frontmatter.attributes || [];
		if (!attributes.includes('recurring')) {
			throw new Error('This file is not a recurring task note');
		}

		const currentDays = frontmatter.recurring_days_of_month || [];
		
		const { DaysOfMonthPickerModal } = await import('./modals/DaysOfMonthPickerModal');
		const modal = new DaysOfMonthPickerModal(
			this.app, 
			file, 
			currentDays,
			async (days: number[]) => {
				await this.app.fileManager.processFrontMatter(file, (fm) => {
					fm.recurring_days_of_month = days;
				});
				new Notice(`Recurring days set: ${days.length > 0 ? days.join(', ') : 'none'}`);
			}
		);
		modal.open();
	}

	async setRecurringDaysOfWeek(file: TFile): Promise<void> {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
		
		if (!frontmatter || !isTaskFrontmatter(frontmatter)) {
			throw new Error('This file is not a task note');
		}

		const attributes = frontmatter.attributes || [];
		if (!attributes.includes('recurring')) {
			throw new Error('This file is not a recurring task note');
		}

		const currentDays = frontmatter.recurring_days_of_week || [];
		
		const { DaysOfWeekPickerModal } = await import('./modals/DaysOfWeekPickerModal');
		const modal = new DaysOfWeekPickerModal(
			this.app, 
			file, 
			currentDays,
			async (days: string[]) => {
				await this.app.fileManager.processFrontMatter(file, (fm) => {
					fm.recurring_days_of_week = days;
				});
				new Notice(`Recurring days of week set: ${days.length > 0 ? days.join(', ') : 'none'}`);
			}
		);
		modal.open();
	}

	async setRecurringScheduledTimes(file: TFile): Promise<void> {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
		
		if (!frontmatter || !isTaskFrontmatter(frontmatter)) {
			throw new Error('This file is not a task note');
		}

		const attributes = frontmatter.attributes || [];
		if (!attributes.includes('recurring')) {
			throw new Error('This file is not a recurring task note');
		}

		const currentTimes = frontmatter.recurring_scheduled_times || [];
		
		const { ScheduledTimesPickerModal } = await import('./modals/ScheduledTimesPickerModal');
		const modal = new ScheduledTimesPickerModal(
			this.app, 
			file, 
			currentTimes,
			async (times: string[]) => {
				await this.app.fileManager.processFrontMatter(file, (fm) => {
					fm.recurring_scheduled_times = times;
				});
				new Notice(`Recurring scheduled times set: ${times.length > 0 ? times.join(', ') : 'none'}`);
			}
		);
		modal.open();
	}
}