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
		this.registerCompleteTaskCommand();
		this.registerUncompleteTaskCommand();
		this.registerToggleTaskCommand();
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
}