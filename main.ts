import { Plugin, Notice, moment } from 'obsidian';

export default class MonoTaskNotePlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'create-task-note',
			name: 'Create task note',
			callback: async () => {
				await this.createTaskNote();
			}
		});
	}

	async createTaskNote() {
		// Use Unix timestamp as filename
		const timestamp = moment().unix();
		const fileName = `${timestamp}.md`;
		
		// Create file with empty content
		const content = '';
		
		try {
			const file = await this.app.vault.create(fileName, content);
			
			// Add frontmatter using processFrontMatter API
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				frontmatter.done = false;
				frontmatter.due_date = null;
				frontmatter.priority = 4;
				frontmatter.scheduled_time = null;
				frontmatter.type = 'task';
			});
			
			new Notice(`Task note created: ${fileName}`);
			
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		} catch (error) {
			new Notice(`Failed to create task note: ${error.message}`);
		}
	}
}