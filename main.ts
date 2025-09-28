import { Plugin, TFile, MarkdownView, Editor } from 'obsidian';

export default class DeleteOnCheckPlugin extends Plugin {
	async onload() {
		console.log('Loading Delete on Check plugin');

		// Listen for file modifications (more reliable than editor-change)
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile) {
					this.handleFileModify(file);
				}
			})
		);

		// Also listen to editor changes as backup
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor, info) => {
				this.handleEditorChange(editor, info);
			})
		);
	}

	onunload() {
		console.log('Unloading Delete on Check plugin');
	}

	private async handleFileModify(file: TFile) {
		const fileContent = await this.app.vault.read(file);

		// Check if the modified file itself has the #deleteoncheck tag
		if (fileContent.includes('#deleteoncheck')) {
			// Handle direct file modifications
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile && activeFile.path === file.path) {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = activeView.editor;
					this.processCheckedTasks(editor, fileContent);
					return;
				}
			}

			// Handle modifications when file is not active (like from dataview)
			this.processCheckedTasksInFile(file, fileContent);
		}
	}

	private async handleEditorChange(editor: Editor, info: any) {
		// Get the active file
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;

		// Check if file has the #deleteoncheck tag
		const fileContent = editor.getValue();
		if (!fileContent.includes('#deleteoncheck')) return;

		// Small delay to let the checkbox change complete
		setTimeout(() => {
			this.processCheckedTasks(editor, fileContent);
		}, 50);
	}

	private processCheckedTasks(editor: Editor, content: string) {
		const lines = content.split('\n');
		const checkedTaskRegex = /^(\s*)-\s+\[x\]\s+(.*)$/i;
		
		// Process from bottom to top to avoid line number shifts
		for (let i = lines.length - 1; i >= 0; i--) {
			if (checkedTaskRegex.test(lines[i])) {
				console.log(`Deleting checked task on line ${i + 1}: ${lines[i]}`);
				this.deleteTaskLine(editor, i);
			}
		}
	}

	private async processCheckedTasksInFile(file: TFile, content: string) {
		const lines = content.split('\n');
		const checkedTaskRegex = /^(\s*)-\s+\[x\]\s+(.*)$/i;

		let hasChanges = false;
		const newLines: string[] = [];

		// Process all lines, excluding checked tasks
		for (let i = 0; i < lines.length; i++) {
			if (checkedTaskRegex.test(lines[i])) {
				console.log(`Deleting checked task in ${file.path}: ${lines[i]}`);
				hasChanges = true;
				// Skip this line (don't add to newLines)
			} else {
				newLines.push(lines[i]);
			}
		}

		// Write back to file if changes were made
		if (hasChanges) {
			const newContent = newLines.join('\n');
			await this.app.vault.modify(file, newContent);
		}
	}

	private deleteTaskLine(editor: Editor, lineNumber: number) {
		const currentLine = editor.getLine(lineNumber);
		const checkedTaskRegex = /^(\s*)-\s+\[x\]\s+(.*)$/i;

		if (checkedTaskRegex.test(currentLine)) {
			const lineStart = { line: lineNumber, ch: 0 };
			let lineEnd = { line: lineNumber + 1, ch: 0 };

			// Handle case where it's the last line
			if (lineNumber === editor.lastLine()) {
				lineEnd = { line: lineNumber, ch: currentLine.length };

				// If there's a previous line, remove the newline from previous line
				if (lineNumber > 0) {
					const prevLine = editor.getLine(lineNumber - 1);
					lineStart.line = lineNumber - 1;
					lineStart.ch = prevLine.length;
				}
			}

			editor.replaceRange('', lineStart, lineEnd);
		}
	}
}