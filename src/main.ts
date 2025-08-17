import { Plugin, Notice, moment, TFile } from 'obsidian';
import { MonoTaskNoteSettings, DEFAULT_SETTINGS, MonoTaskNoteSettingTab } from './settings';
import { TaskManager } from './taskManager';

import { TaskFrontmatter, Commands } from './types';

// Extend the App interface to include commands
declare module 'obsidian' {
    interface App {
        commands: Commands;
    }
}

export default class MonoTaskNotePlugin extends Plugin {
	settings: MonoTaskNoteSettings;
	taskManager: TaskManager;

	async onload() {
		await this.loadSettings();
		this.taskManager = new TaskManager(this.app, this.settings);

		this.addCommand({
			id: 'create-task-note',
			name: 'Create task note',
			callback: async () => {
				await this.createTaskNote();
			}
		});

		this.addCommand({
			id: 'complete-current-task',
			name: 'Complete current task',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
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

		this.addCommand({
			id: 'uncomplete-current-task',
			name: 'Uncomplete current task',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
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

		this.addCommand({
			id: 'toggle-task-completion',
			name: 'Toggle task completion',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
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

		this.addSettingTab(new MonoTaskNoteSettingTab(this.app, this));

		// Register metadata change event
		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				this.handleMetadataChange(file);
			})
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createTaskNote() {
		const timestamp = moment().unix();
		const fileName = `${timestamp}.md`;
		
		// Construct the full path with directory if specified
		let filePath = fileName;
		if (this.settings.taskNoteDirectory) {
			// Normalize the directory path (remove trailing slashes)
			const normalizedDir = this.settings.taskNoteDirectory.replace(/\/+$/, '');
			
			// Ensure the directory exists
			const folder = this.app.vault.getAbstractFileByPath(normalizedDir);
			if (!folder) {
				try {
					await this.app.vault.createFolder(normalizedDir);
				} catch (error) {
					// Only show error if it's not about the folder already existing
					if (error instanceof Error && !error.message.includes('already exists')) {
						new Notice(`Failed to create directory: ${error.message}`);
						// Fall back to root directory
						filePath = fileName;
					}
				}
			}
			
			// Only use the directory if we confirmed it exists or created it successfully
			if (filePath !== fileName || folder) {
				filePath = normalizedDir ? `${normalizedDir}/${fileName}` : fileName;
			}
		}
		
		try {
			let file: TFile;
			
			if (this.settings.templatePath) {
				const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath);
				
				if (templateFile instanceof TFile) {
					const templateContent = await this.app.vault.read(templateFile);
					const processedContent = this.processTemplateVariables(templateContent, fileName);
					file = await this.app.vault.create(filePath, processedContent);
				} else {
					file = await this.createDefaultTaskNote(filePath);
				}
			} else {
				file = await this.createDefaultTaskNote(filePath);
			}
			
			await this.app.fileManager.processFrontMatter(file, (frontmatter: Partial<TaskFrontmatter>) => {
				frontmatter.done ??= false;
				frontmatter.due_date ??= null;
				frontmatter.priority ??= 4;
				frontmatter.scheduled_time ??= null;
				frontmatter.type ??= 'task';
			});
			
			new Notice(`Task note created: ${file.basename}`);
			
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
			
			// Trigger rename command to focus on filename input
			setTimeout(() => {
				this.app.commands.executeCommandById('workspace:edit-file-title');
			}, 100);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			new Notice(`Failed to create task note: ${msg}`);
		}
	}

	async createDefaultTaskNote(filePath: string): Promise<TFile> {
		const content = '';
		return this.app.vault.create(filePath, content);
	}

	processTemplateVariables(content: string, fileName: string): string {
		const now = moment();
		
		let processedContent = content;
		
		// Default replacements
		processedContent = processedContent.replace(/\{\{date\}\}/g, now.format('YYYY-MM-DD'));
		processedContent = processedContent.replace(/\{\{time\}\}/g, now.format('HH:mm'));
		processedContent = processedContent.replace(/\{\{title\}\}/g, fileName.replace('.md', ''));
		
		// Custom format replacements - directly pass format to moment
		processedContent = processedContent.replace(/\{\{date:([^}]+)\}\}/g, (match, format) => {
			try {
				return now.format(format);
			} catch {
				return match;
			}
		});
		
		processedContent = processedContent.replace(/\{\{time:([^}]+)\}\}/g, (match, format) => {
			try {
				return now.format(format);
			} catch {
				return match;
			}
		});
		
		return processedContent;
	}

	async handleMetadataChange(file: TFile) {
		// Only process markdown files
		if (file.extension !== 'md') return;
		
		// Delegate to TaskManager with error handling
		try {
			await this.taskManager.handleDoneStatusChange(file);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			new Notice(`Failed to update done_at: ${msg}`);
		}
	}
}
