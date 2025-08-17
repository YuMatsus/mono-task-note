import { App, Modal, ButtonComponent, TFile } from 'obsidian';

export class DaysOfMonthPickerModal extends Modal {
	private selectedDays: Set<number>;
	private file: TFile;
	private onSave: (days: number[]) => void;

	constructor(app: App, file: TFile, currentDays: number[], onSave: (days: number[]) => void) {
		super(app);
		this.file = file;
		this.selectedDays = new Set(currentDays);
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Select Days of Month for Recurring Task' });

		const description = contentEl.createEl('p', { 
			text: 'Select the days of the month when this task should recur.',
			cls: 'setting-item-description'
		});
		description.style.marginBottom = '1em';

		const daysContainer = contentEl.createDiv({ cls: 'days-grid' });
		daysContainer.style.display = 'grid';
		daysContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
		daysContainer.style.gap = '8px';
		daysContainer.style.marginBottom = '1em';

		for (let day = 1; day <= 31; day++) {
			const dayButton = daysContainer.createEl('button', {
				text: day.toString(),
				cls: 'day-button'
			});

			dayButton.style.padding = '8px';
			dayButton.style.border = '1px solid var(--background-modifier-border)';
			dayButton.style.borderRadius = '4px';
			dayButton.style.cursor = 'pointer';
			dayButton.style.backgroundColor = this.selectedDays.has(day) 
				? 'var(--interactive-accent)' 
				: 'var(--background-secondary)';
			dayButton.style.color = this.selectedDays.has(day)
				? 'var(--text-on-accent)'
				: 'var(--text-normal)';

			dayButton.addEventListener('click', () => {
				if (this.selectedDays.has(day)) {
					this.selectedDays.delete(day);
					dayButton.style.backgroundColor = 'var(--background-secondary)';
					dayButton.style.color = 'var(--text-normal)';
				} else {
					this.selectedDays.add(day);
					dayButton.style.backgroundColor = 'var(--interactive-accent)';
					dayButton.style.color = 'var(--text-on-accent)';
				}
			});
		}

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		buttonContainer.style.display = 'flex';
		buttonContainer.style.justifyContent = 'flex-end';
		buttonContainer.style.gap = '8px';
		buttonContainer.style.marginTop = '1em';

		new ButtonComponent(buttonContainer)
			.setButtonText('Cancel')
			.onClick(() => {
				this.close();
			});

		new ButtonComponent(buttonContainer)
			.setButtonText('Save')
			.setCta()
			.onClick(() => {
				const days = Array.from(this.selectedDays).sort((a, b) => a - b);
				this.onSave(days);
				this.close();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}