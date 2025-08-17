import { App, PluginSettingTab, Setting, TFile, TFolder, FuzzySuggestModal } from 'obsidian';
import type MonoTaskNotePlugin from './main';

export interface MonoTaskNoteSettings {
	templatePath: string;
	doneAtFormat: string;
	taskNoteDirectory: string;
}

export const DEFAULT_SETTINGS: MonoTaskNoteSettings = {
	templatePath: '',
	doneAtFormat: '',
	taskNoteDirectory: ''
};

export class MonoTaskNoteSettingTab extends PluginSettingTab {
	plugin: MonoTaskNotePlugin;

	constructor(app: App, plugin: MonoTaskNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Mono Task Note Settings' });

		new Setting(containerEl)
			.setName('Template')
			.setDesc('Select a template file for creating task notes')
			.addText(text => {
				text
					.setPlaceholder('Template path')
					.setValue(this.plugin.settings.templatePath)
					.onChange(async (value) => {
						this.plugin.settings.templatePath = value;
						await this.plugin.saveSettings();
					});
				
				text.inputEl.style.width = '300px';
			})
			.addButton(button => {
				button
					.setButtonText('Select')
					.onClick(() => {
						new TemplateSearchModal(this.app, async (file: TFile) => {
							this.plugin.settings.templatePath = file.path;
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});

		new Setting(containerEl)
			.setName('Task Note Directory')
			.setDesc('Select the directory where task notes will be created')
			.addText(text => {
				text
					.setPlaceholder('Directory path (leave empty for vault root)')
					.setValue(this.plugin.settings.taskNoteDirectory)
					.onChange(async (value) => {
						this.plugin.settings.taskNoteDirectory = value;
						await this.plugin.saveSettings();
					});
				
				text.inputEl.style.width = '300px';
			})
			.addButton(button => {
				button
					.setButtonText('Select')
					.onClick(() => {
						new FolderSearchModal(this.app, async (folder: TFolder) => {
							this.plugin.settings.taskNoteDirectory = folder.path;
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});

		new Setting(containerEl)
			.setName('Done Timestamp Format')
			.setDesc('Format for the done_at timestamp (uses moment.js format). Default: YYYY-MM-DDTHH:mm:ssZ')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DDTHH:mm:ssZ')
				.setValue(this.plugin.settings.doneAtFormat)
				.onChange(async (value) => {
					this.plugin.settings.doneAtFormat = value;
					await this.plugin.saveSettings();
				}));
	}
}

class TemplateSearchModal extends FuzzySuggestModal<TFile> {
	onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getItems(): TFile[] {
		const files = this.app.vault.getMarkdownFiles();
		return files.filter(file => {
			const path = file.path.toLowerCase();
			return path.includes('template');
		});
	}

	getItemText(file: TFile): string {
		return file.path;
	}

	onChooseItem(file: TFile): void {
		this.onChoose(file);
	}
}

class FolderSearchModal extends FuzzySuggestModal<TFolder> {
	onChoose: (folder: TFolder) => void;

	constructor(app: App, onChoose: (folder: TFolder) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getItems(): TFolder[] {
		const folders: TFolder[] = [];
		const rootFolder = this.app.vault.getRoot();
		
		const collectFolders = (folder: TFolder): void => {
			folders.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) {
					collectFolders(child);
				}
			}
		};
		
		collectFolders(rootFolder);
		return folders
			.filter(f => f.path !== '.obsidian')
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	getItemText(folder: TFolder): string {
		return folder.path || '/';
	}

	onChooseItem(folder: TFolder): void {
		this.onChoose(folder);
	}
}