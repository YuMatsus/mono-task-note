import { App, Notice, moment, TFile } from 'obsidian';
import { MonoTaskNoteSettings } from './settings';
import { TaskFrontmatter, Commands } from './types';
import { TemplateProcessor } from './templateProcessor';

declare module 'obsidian' {
	interface App {
		commands: Commands;
	}
}

export class TaskNoteCreator {
	private app: App;
	private settings: MonoTaskNoteSettings;
	private templateProcessor: TemplateProcessor;

	constructor(app: App, settings: MonoTaskNoteSettings) {
		this.app = app;
		this.settings = settings;
		this.templateProcessor = new TemplateProcessor();
	}

	async createTaskNote(): Promise<void> {
		const timestamp = moment().unix();
		const fileName = `${timestamp}.md`;
		
		const filePath = this.getFilePath(fileName);
		
		try {
			const file = await this.createFile(filePath, fileName);
			await this.initializeFrontmatter(file);
			
			new Notice(`Task note created: ${file.basename}`);
			
			await this.openAndFocusFile(file);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			new Notice(`Failed to create task note: ${msg}`);
		}
	}

	private getFilePath(fileName: string): string {
		if (!this.settings.taskNoteDirectory) {
			return fileName;
		}

		const normalizedDir = this.settings.taskNoteDirectory.replace(/\/+$/, '');
		return normalizedDir ? `${normalizedDir}/${fileName}` : fileName;
	}

	private async createFile(filePath: string, fileName: string): Promise<TFile> {
		await this.ensureDirectoryExists();

		if (this.settings.templatePath) {
			return await this.createFromTemplate(filePath, fileName);
		}
		
		return await this.createDefaultTaskNote(filePath);
	}

	private async ensureDirectoryExists(): Promise<void> {
		if (!this.settings.taskNoteDirectory) {
			return;
		}

		const normalizedDir = this.settings.taskNoteDirectory.replace(/\/+$/, '');
		const folder = this.app.vault.getAbstractFileByPath(normalizedDir);
		
		if (!folder) {
			try {
				await this.app.vault.createFolder(normalizedDir);
			} catch (error) {
				if (error instanceof Error && !error.message.includes('already exists')) {
					throw error;
				}
			}
		}
	}

	private async createFromTemplate(filePath: string, fileName: string): Promise<TFile> {
		const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath);
		
		if (!(templateFile instanceof TFile)) {
			return await this.createDefaultTaskNote(filePath);
		}

		const templateContent = await this.app.vault.read(templateFile);
		const processedContent = this.templateProcessor.processTemplateVariables(templateContent, fileName);
		return await this.app.vault.create(filePath, processedContent);
	}

	private async createDefaultTaskNote(filePath: string): Promise<TFile> {
		const content = '';
		return this.app.vault.create(filePath, content);
	}

	private async initializeFrontmatter(file: TFile): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (frontmatter: Partial<TaskFrontmatter>) => {
			frontmatter.done ??= false;
			frontmatter.due_date ??= null;
			frontmatter.priority ??= 4;
			frontmatter.scheduled_time ??= null;
			frontmatter.type ??= 'task';
		});
	}

	private async openAndFocusFile(file: TFile): Promise<void> {
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);
		
		setTimeout(() => {
			this.app.commands.executeCommandById('workspace:edit-file-title');
		}, 100);
	}
}