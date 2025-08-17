import { Plugin, Notice } from 'obsidian';
import { TaskManager } from './taskManager';
import { TaskNoteCreator } from './taskNoteCreator';

export class CommandManager {
	private plugin: Plugin;
	private taskManager: TaskManager;
	private taskNoteCreator: TaskNoteCreator;

	constructor(plugin: Plugin, taskManager: TaskManager, taskNoteCreator: TaskNoteCreator) {
		this.plugin = plugin;
		this.taskManager = taskManager;
		this.taskNoteCreator = taskNoteCreator;
	}

	registerCommands(): void {
		this.registerCreateTaskNoteCommand();
		this.registerCreateRecurringTaskNoteCommand();
		this.registerCompleteTaskCommand();
		this.registerUncompleteTaskCommand();
		this.registerToggleTaskCommand();
		this.registerSetRecurringDaysOfMonthCommand();
		this.registerSetRecurringDaysOfWeekCommand();
		this.registerSetRecurringScheduledTimesCommand();
	}

	private registerCreateTaskNoteCommand(): void {
		this.plugin.addCommand({
			id: 'create-task-note',
			name: 'Create task note',
			callback: async () => {
				await this.taskNoteCreator.createTaskNote();
			}
		});
	}

	private registerCreateRecurringTaskNoteCommand(): void {
		this.plugin.addCommand({
			id: 'create-recurring-task-note',
			name: 'Create recurring task note',
			callback: async () => {
				try {
					await this.taskNoteCreator.createRecurringTaskNote();
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : String(err);
					console.error('Failed to create recurring task note:', err);
					new Notice(`Failed to create recurring task note: ${msg}`);
				}
			}
		});
	}

	private registerCompleteTaskCommand(): void {
		this.plugin.addCommand({
			id: 'complete-current-task',
			name: 'Complete current task',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.completeTask(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to complete task: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}

	private registerUncompleteTaskCommand(): void {
		this.plugin.addCommand({
			id: 'uncomplete-current-task',
			name: 'Uncomplete current task',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.uncompleteTask(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to uncomplete task: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}

	private registerToggleTaskCommand(): void {
		this.plugin.addCommand({
			id: 'toggle-task-completion',
			name: 'Toggle task completion',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.toggleTaskCompletion(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to toggle task: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}

	private registerSetRecurringDaysOfMonthCommand(): void {
		this.plugin.addCommand({
			id: 'set-recurring-days-of-month',
			name: 'Set recurring days of month',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.setRecurringDaysOfMonth(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to set recurring days: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}

	private registerSetRecurringDaysOfWeekCommand(): void {
		this.plugin.addCommand({
			id: 'set-recurring-days-of-week',
			name: 'Set recurring days of week',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.setRecurringDaysOfWeek(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to set recurring days: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}

	private registerSetRecurringScheduledTimesCommand(): void {
		this.plugin.addCommand({
			id: 'set-recurring-scheduled-times',
			name: 'Set recurring scheduled times',
			checkCallback: (checking: boolean) => {
				const activeFile = this.plugin.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === 'md') {
					if (!checking) {
						void this.taskManager
							.setRecurringScheduledTimes(activeFile)
							.catch((err: unknown) => {
								const msg = err instanceof Error ? err.message : String(err);
								new Notice(`Failed to set recurring times: ${msg}`);
							});
					}
					return true;
				}
				return false;
			}
		});
	}
}