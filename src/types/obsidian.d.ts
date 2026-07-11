import { SelectionRange } from "@codemirror/state";
import "obsidian";
import { Command, Editor, EventRef, Menu, Scope } from "obsidian";

declare module "obsidian" {
	interface App {
		commands: {
			executeCommandById(id: string): void;
			listCommands(): Command[];

			app: App;
			editorCommands: Record<string, Command>;
			commands: Record<string, Command>;
		};

		/**
		 * Private, undocumented Obsidian internal (the settings modal controller,
		 * a Modal subclass — hence the public `scope`).
		 */
		setting: {
			open(): void;
			openTabById(id: string): void;
			scope: Scope;
		};
	}

	interface View {
		setSortOrder(order: string): void;
		onTabMenu(menu: Menu): void;
	}

	interface Workspace {
		/**
		 * Triggered when the editor focus changes.
		 * @public
		 */
		on(
			name: "shortcuts:editor-focus-change",
			callback: ({
				focusing,
				editor,
				pos,
			}: {
				focusing: boolean;
				editor: Editor;
				pos: SelectionRange;
			}) => unknown,
			ctx?: unknown
		): EventRef;

		/**
		 * Triggered when the input focus changes.
		 * @public
		 */
		on(
			name: "shortcuts:input-focus-change",
			callback: ({
				focusing,
				input,
			}: {
				focusing: boolean;
				input: HTMLInputElement | HTMLTextAreaElement;
			}) => unknown,
			ctx?: unknown
		): EventRef;

		/**
		 * Triggered when the contenteditable focus changes.
		 * @public
		 */
		on(
			name: "shortcuts:contenteditable-focus-change",
			callback: ({
				focusing,
				element,
			}: {
				focusing: boolean;
				element: HTMLElement;
			}) => unknown,
			ctx?: unknown
		): EventRef;

		/**
		 * Triggered when the status bar shortcut indicator is clicked.
		 * @public
		 */
		on(
			name: "shortcuts:status-bar-click",
			callback: () => unknown,
			ctx?: unknown
		): EventRef;
	}
}
