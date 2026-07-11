import { describe, expect, it } from "vitest";
import { KeyParser } from "../../../src/core/keyboard/KeyParser";

function makeEvent(init: Partial<KeyboardEvent> & { key: string; keyCode: number }): KeyboardEvent {
	return {
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		...init,
	} as KeyboardEvent;
}

describe("KeyParser.parseKeyEvent", () => {
	const parser = new KeyParser();

	it("uppercases a single plain character key", () => {
		const event = makeEvent({ key: "a", keyCode: 65 });
		expect(parser.parseKeyEvent(event)).toBe("A");
	});

	it("prefixes modifiers in ctrl, alt, shift, meta order", () => {
		const event = makeEvent({
			key: "a",
			keyCode: 65,
			ctrlKey: true,
			shiftKey: true,
		});
		expect(parser.parseKeyEvent(event)).toBe("ctrl+shift+A");
	});

	it("normalizes a lone modifier keypress to its short name", () => {
		const event = makeEvent({ key: "Control", keyCode: 17, ctrlKey: true });
		expect(parser.parseKeyEvent(event)).toBe("ctrl");
	});

	it("maps Command to the same modifier name as Meta", () => {
		const event = makeEvent({ key: "Command", keyCode: 91, metaKey: true });
		expect(parser.parseKeyEvent(event)).toBe("meta");
	});

	it("does not duplicate a modifier that is already in the modifiers list", () => {
		const event = makeEvent({ key: "Shift", keyCode: 16, shiftKey: true });
		expect(parser.parseKeyEvent(event)).toBe("shift");
	});

	it("passes through non-character keys like Escape via keycode lookup", () => {
		const event = makeEvent({ key: "Escape", keyCode: 27 });
		expect(parser.parseKeyEvent(event)).toBe("esc");
	});
});

describe("KeyParser.convertToMacModifier", () => {
	it("leaves the key unchanged when not on macOS", () => {
		const parser = new KeyParser();
		expect(parser.convertToMacModifier("meta+alt+A")).toBe("meta+alt+A");
	});
});

describe("KeyParser.isModifierKey", () => {
	const parser = new KeyParser();

	it("recognizes known modifier names", () => {
		expect(parser.isModifierKey("ctrl")).toBe(true);
		expect(parser.isModifierKey("alt")).toBe(true);
		expect(parser.isModifierKey("shift")).toBe(true);
		expect(parser.isModifierKey("meta")).toBe(true);
	});

	it("rejects non-modifier keys", () => {
		expect(parser.isModifierKey("A")).toBe(false);
		expect(parser.isModifierKey("esc")).toBe(false);
	});
});
