import { App, Modal, ButtonComponent, TFile } from 'obsidian';

export class DaysOfWeekPickerModal extends Modal {
	private selectedDays: Set<string>;
	private file: TFile;
	private onSave: (days: string[]) => void;
	private readonly daysOfWeek = [
		{ short: 'Mon', full: 'Monday' },
		{ short: 'Tue', full: 'Tuesday' },
		{ short: 'Wed', full: 'Wednesday' },
		{ short: 'Thu', full: 'Thursday' },
		{ short: 'Fri', full: 'Friday' },
		{ short: 'Sat', full: 'Saturday' },
		{ short: 'Sun', full: 'Sunday' }
	];

	constructor(app: App, file: TFile, currentDays: string[], onSave: (days: string[]) => void) {
		super(app);
		this.file = file;
		this.selectedDays = new Set(currentDays);
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Select Days of Week for Recurring Task' });

		const description = contentEl.createEl('p', { 
			text: 'Select the days of the week when this task should recur.',
			cls: 'setting-item-description'
		});
		description.style.marginBottom = '1em';

		const daysContainer = contentEl.createDiv({ cls: 'days-container' });
		daysContainer.style.display = 'flex';
		daysContainer.style.flexDirection = 'column';
		daysContainer.style.gap = '8px';
		daysContainer.style.marginBottom = '1em';

		this.daysOfWeek.forEach(day => {
			const dayItem = daysContainer.createDiv({ cls: 'day-item' });
			dayItem.style.display = 'flex';
			dayItem.style.alignItems = 'center';
			dayItem.style.padding = '8px';
			dayItem.style.border = '1px solid var(--background-modifier-border)';
			dayItem.style.borderRadius = '4px';
			dayItem.style.cursor = 'pointer';
			dayItem.style.backgroundColor = this.selectedDays.has(day.short) 
				? 'var(--interactive-accent)' 
				: 'var(--background-secondary)';
			dayItem.style.color = this.selectedDays.has(day.short)
				? 'var(--text-on-accent)'
				: 'var(--text-normal)';

			const checkbox = dayItem.createEl('input', { type: 'checkbox' });
			checkbox.checked = this.selectedDays.has(day.short);
			checkbox.style.marginRight = '8px';

			const label = dayItem.createEl('span', { text: `${day.full} (${day.short})` });
			label.style.flex = '1';

			const toggleSelection = () => {
				if (this.selectedDays.has(day.short)) {
					this.selectedDays.delete(day.short);
					checkbox.checked = false;
					dayItem.style.backgroundColor = 'var(--background-secondary)';
					dayItem.style.color = 'var(--text-normal)';
				} else {
					this.selectedDays.add(day.short);
					checkbox.checked = true;
					dayItem.style.backgroundColor = 'var(--interactive-accent)';
					dayItem.style.color = 'var(--text-on-accent)';
				}
			};

			dayItem.addEventListener('click', toggleSelection);
			checkbox.addEventListener('click', (e) => {
				e.stopPropagation();
				toggleSelection();
			});
		});

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
				// Preserve the order of days as they appear in the week
				const orderedDays = this.daysOfWeek
					.filter(day => this.selectedDays.has(day.short))
					.map(day => day.short);
				this.onSave(orderedDays);
				this.close();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}