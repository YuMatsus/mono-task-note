import { Plugin, Notice, TFile } from 'obsidian';
import { MonoTaskNoteSettings, DEFAULT_SETTINGS, MonoTaskNoteSettingTab } from './settings';
import { TaskManager } from './taskManager';
import { CommandManager } from './commands';
import { TaskNoteCreator } from './taskNoteCreator';

export default class MonoTaskNotePlugin extends Plugin {
	settings: MonoTaskNoteSettings;
	taskManager: TaskManager;
	commandManager: CommandManager;
	taskNoteCreator: TaskNoteCreator;

	async onload() {
		await this.loadSettings();
		
		// Initialize managers
		this.taskManager = new TaskManager(this.app, this.settings);
		this.taskNoteCreator = new TaskNoteCreator(this.app, this.settings);
		this.commandManager = new CommandManager(this, this.taskManager, this.taskNoteCreator);
		
		// Register commands
		this.commandManager.registerCommands();

		// Add settings tab
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

	private async handleMetadataChange(file: TFile) {
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
