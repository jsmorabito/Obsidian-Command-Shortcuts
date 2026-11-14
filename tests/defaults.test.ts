import { describe, expect, it } from "vitest";
import { DEFAULT_KEY_SEQUENCE_SETTINGS } from "../src/shortcutsSettingTab";
import { AVAILABLE_CONFIGS } from "../src/keySequence";

// What a user gets the first time they enable the plugin.
describe("default settings", () => {
	const s = DEFAULT_KEY_SEQUENCE_SETTINGS;

	it("enables auto-shortcuts mode and uses Esc as the trigger", () => {
		expect(s.autoShortcutMode).toBe(true);
		expect(s.shortcutModeTrigger).toBe("esc");
	});

	it("disables editor auto-focus on open", () => {
		expect(s.disableAutoFocusOnFileOpen).toBe(true);
	});

	it("turns the on-screen helpers off", () => {
		expect(s.showKeyPressNotice).toBe(false);
		expect(s.showShortcutActivatedNotice).toBe(false);
		expect(s.showCurrentSequence).toBe(false);
		expect(s.showStatusBarIcon).toBe(false);
	});
});

describe("default shortcuts", () => {
	// updateKeySequences keeps the first config for a given id, so mirror that.
	const byId = new Map<string, (typeof AVAILABLE_CONFIGS)[number]>();
	for (const config of AVAILABLE_CONFIGS) {
		if (!byId.has(config.id)) byId.set(config.id, config);
	}

	const expected: Record<string, string[][]> = {
		"app:open-vault": [["o"], ["v"]],
		"app:toggle-right-sidebar": [["]"]],
		"app:toggle-left-sidebar": [["["]],
		"file-explorer:new-file": [["c"], ["n"]],
		"shortcuts:open-settings": [["g"], ["s"]],
		"graph:open": [["o"], ["g"]],
		"switcher:open": [["o"], ["f"]],
	};

	for (const [id, sequence] of Object.entries(expected)) {
		it(`binds ${id}`, () => {
			expect(byId.get(id)?.sequence).toEqual(sequence);
		});
	}

	it("has no duplicate or prefix-colliding sequences", () => {
		const keyed = [...byId.values()]
			.filter((c) => c.sequence.length > 0)
			.map((c) => ({
				id: c.id,
				key: c.sequence.map((step) => step.join("+")).join(" "),
			}));

		for (const a of keyed) {
			for (const b of keyed) {
				if (a.id === b.id) continue;
				const collides =
					a.key === b.key || b.key.startsWith(a.key + " ");
				expect(
					collides,
					`"${a.key}" (${a.id}) collides with "${b.key}" (${b.id})`,
				).toBe(false);
			}
		}
	});
});
