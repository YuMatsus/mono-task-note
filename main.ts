import { Plugin, Notice, moment, TFile } from 'obsidian';
import { MonoTaskNoteSettings, DEFAULT_SETTINGS, MonoTaskNoteSettingTab } from './settings';

export default class MonoTaskNotePlugin extends Plugin {
	settings: MonoTaskNoteSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'create-task-note',
			name: 'Create task note',
			callback: async () => {
				await this.createTaskNote();
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
		
		try {
			let file: TFile;
			
			if (this.settings.templatePath) {
				const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath);
				
				if (templateFile instanceof TFile) {
					const templateContent = await this.app.vault.read(templateFile);
					const processedContent = this.processTemplateVariables(templateContent, fileName);
					file = await this.app.vault.create(fileName, processedContent);
				} else {
					file = await this.createDefaultTaskNote(fileName);
				}
			} else {
				file = await this.createDefaultTaskNote(fileName);
			}
			
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				if (!frontmatter.done) frontmatter.done = false;
				if (!frontmatter.due_date) frontmatter.due_date = null;
				if (!frontmatter.priority) frontmatter.priority = 4;
				if (!frontmatter.scheduled_time) frontmatter.scheduled_time = null;
				if (!frontmatter.type) frontmatter.type = 'task';
			});
			
			new Notice(`Task note created: ${fileName}`);
			
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		} catch (error) {
			new Notice(`Failed to create task note: ${error.message}`);
		}
	}

	async createDefaultTaskNote(fileName: string): Promise<TFile> {
		const content = '';
		return await this.app.vault.create(fileName, content);
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

		const metadata = this.app.metadataCache.getFileCache(file);
		if (!metadata || !metadata.frontmatter) return;

		const frontmatter = metadata.frontmatter;
		
		// Check if done is true and done_at doesn't exist
		if (frontmatter.done === true && !frontmatter.done_at) {
			await this.app.fileManager.processFrontMatter(file, (fm) => {
				// Add done_at timestamp using configured format or default
				const format = this.settings.doneAtFormat || 'YYYY-MM-DDTHH:mm:ssZ';
				fm.done_at = moment().format(format);
			});
		}
	}
}
