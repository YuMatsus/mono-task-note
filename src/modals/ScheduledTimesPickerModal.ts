import { App, Modal, ButtonComponent, TFile, TextComponent, Notice } from 'obsidian';

export class ScheduledTimesPickerModal extends Modal {
	private scheduledTimes: string[];
	private file: TFile;
	private onSave: (times: string[]) => void;
	private timeInputs: TextComponent[] = [];

	constructor(app: App, file: TFile, currentTimes: string[], onSave: (times: string[]) => void) {
		super(app);
		this.file = file;
		this.scheduledTimes = [...currentTimes];
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Set Recurring Scheduled Times' });

		const description = contentEl.createEl('p', { 
			text: 'Add scheduled times for this recurring task in HH:mm format (e.g., 09:00, 14:30).',
			cls: 'setting-item-description'
		});
		description.style.marginBottom = '1em';

		const timesContainer = contentEl.createDiv({ cls: 'times-container' });
		timesContainer.style.display = 'flex';
		timesContainer.style.flexDirection = 'column';
		timesContainer.style.gap = '8px';
		timesContainer.style.marginBottom = '1em';

		const renderTimeInputs = () => {
			timesContainer.empty();
			this.timeInputs = [];

			this.scheduledTimes.forEach((time, index) => {
				const timeItem = timesContainer.createDiv({ cls: 'time-item' });
				timeItem.style.display = 'flex';
				timeItem.style.alignItems = 'center';
				timeItem.style.gap = '8px';

				const timeInput = new TextComponent(timeItem);
				timeInput.setValue(time);
				timeInput.setPlaceholder('HH:mm');
				timeInput.inputEl.style.width = '100px';
				timeInput.onChange((value) => {
					this.scheduledTimes[index] = value;
				});
				this.timeInputs.push(timeInput);

				new ButtonComponent(timeItem)
					.setButtonText('Remove')
					.onClick(() => {
						this.scheduledTimes.splice(index, 1);
						renderTimeInputs();
					});
			});

			// Add new time input
			const addTimeItem = timesContainer.createDiv({ cls: 'add-time-item' });
			addTimeItem.style.display = 'flex';
			addTimeItem.style.alignItems = 'center';
			addTimeItem.style.gap = '8px';
			addTimeItem.style.marginTop = '8px';

			const newTimeInput = new TextComponent(addTimeItem);
			newTimeInput.setPlaceholder('HH:mm');
			newTimeInput.inputEl.style.width = '100px';

			new ButtonComponent(addTimeItem)
				.setButtonText('Add Time')
				.onClick(() => {
					const value = newTimeInput.getValue().trim();
					if (value && this.isValidTimeFormat(value)) {
						this.scheduledTimes.push(value);
						renderTimeInputs();
					} else if (value) {
						new Notice('Please enter time in HH:mm format (e.g., 09:00, 14:30)');
					}
				});
		};

		renderTimeInputs();

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
				const validTimes = this.scheduledTimes
					.filter(time => time && this.isValidTimeFormat(time))
					.sort();
				
				if (this.scheduledTimes.some(time => time && !this.isValidTimeFormat(time))) {
					new Notice('Some times are invalid. Please use HH:mm format.');
					return;
				}

				this.onSave(validTimes);
				this.close();
			});
	}

	private isValidTimeFormat(time: string): boolean {
		const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		return regex.test(time);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}