import { afterEach, describe, expect, it } from "vitest";
import { getAllSupportedShortcuts } from "../src/utils";

afterEach(() => {
	document.body.innerHTML = "";
});

describe("getAllSupportedShortcuts", () => {
	it("returns an empty array when nothing has an aria-label", () => {
		document.body.innerHTML = "<div><span>no label here</span></div>";
		expect(getAllSupportedShortcuts()).toEqual([]);
	});

	it("collects one entry per element with an aria-label", () => {
		document.body.innerHTML = `
			<button aria-label="Open settings"></button>
			<div aria-label="Close pane"></div>
		`;
		const result = getAllSupportedShortcuts();
		expect(result).toHaveLength(2);
		expect(result.map((r) => r.name).sort()).toEqual([
			"Close pane",
			"Open settings",
		]);
	});

	it("uses the aria-label as both the action and id, with empty sequence and ARIA type", () => {
		document.body.innerHTML = `<button aria-label="Open settings"></button>`;
		const [entry] = getAllSupportedShortcuts();
		expect(entry).toEqual({
			sequence: [],
			name: "Open settings",
			action: "Open settings",
			id: "Open settings",
			actionType: "ARIA",
		});
	});

	it("only uses the first line of a multi-line aria-label for the name", () => {
		document.body.innerHTML = `<button aria-label="Open settings\nSecond line"></button>`;
		const [entry] = getAllSupportedShortcuts();
		expect(entry.name).toBe("Open settings");
		expect(entry.action).toBe("Open settings\nSecond line");
	});

	it("skips elements with an empty aria-label", () => {
		document.body.innerHTML = `<button aria-label=""></button>`;
		expect(getAllSupportedShortcuts()).toEqual([]);
	});
});
