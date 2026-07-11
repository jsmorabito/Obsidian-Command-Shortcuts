import { describe, expect, it, vi } from "vitest";
import { SequenceMatcher } from "../../../src/core/keyboard/SequenceMatcher";
import type { KeySequenceConfig } from "../../../src/types/key";

function shortcut(sequence: string[][], id = "test"): KeySequenceConfig {
	return {
		sequence,
		name: id,
		id,
		action: id,
		actionType: "ID",
	};
}

describe("SequenceMatcher.addKey / getCurrentSequenceString", () => {
	it("starts a single-step sequence for one key", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("A");
		expect(matcher.getCurrentSequenceString()).toBe("a");
	});

	it("keeps a fully-combined modifier+key string (as produced by KeyParser) as one step", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("ctrl+A");
		expect(matcher.getCurrentSequence()).toEqual([["ctrl+A"]]);
	});

	it("appends a second plain key onto the same step within the combo threshold", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("a");
		matcher.addKey("b");
		expect(matcher.getCurrentSequence()).toEqual([["a", "b"]]);
	});

	it("starts a new step when a key arrives after the combo threshold", async () => {
		const matcher = new SequenceMatcher(20);
		matcher.addKey("A");
		await new Promise((resolve) => setTimeout(resolve, 30));
		matcher.addKey("B");
		expect(matcher.getCurrentSequence()).toEqual([["A"], ["B"]]);
	});

	it("does not duplicate a modifier already present in the current combo", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("ctrl");
		matcher.addKey("ctrl");
		expect(matcher.getCurrentSequence()).toEqual([["ctrl"]]);
	});

	it("replaces a lone modifier placeholder once the full combo string arrives", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("ctrl");
		matcher.addKey("ctrl+A");
		expect(matcher.getCurrentSequence()).toEqual([["ctrl+A"]]);
	});
});

describe("SequenceMatcher.findMatch", () => {
	it("finds an exact match for a combined modifier+key combo", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("shift+A");
		const shortcuts = [shortcut([["shift+a"]], "shift-a")];
		const result = matcher.findMatch(shortcuts);
		expect(result.matched?.id).toBe("shift-a");
	});

	it("returns null matched and lists possible matches for a prefix", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("o");
		const shortcuts = [
			shortcut([["o"], ["l"]], "toggle-left"),
			shortcut([["o"], ["r"]], "toggle-right"),
			shortcut([["g"]], "open-graph"),
		];
		const result = matcher.findMatch(shortcuts);
		expect(result.matched).toBeNull();
		expect(result.possibleMatches.map((s) => s.id).sort()).toEqual([
			"toggle-left",
			"toggle-right",
		]);
	});

	it("returns no matches when the sequence diverges from all shortcuts", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("z");
		const shortcuts = [shortcut([["o"], ["l"]], "toggle-left")];
		const result = matcher.findMatch(shortcuts);
		expect(result.matched).toBeNull();
        expect(result.possibleMatches).toEqual([]);
	});
});

describe("SequenceMatcher.reset", () => {
	it("clears the current sequence", () => {
		const matcher = new SequenceMatcher(200);
		matcher.addKey("A");
		matcher.reset();
		expect(matcher.getCurrentSequence()).toEqual([]);
		expect(matcher.getCurrentSequenceString()).toBe("");
	});
});

describe("SequenceMatcher timers", () => {
	it("invokes the timeout callback and resets after the given duration", () => {
		vi.useFakeTimers();
		const matcher = new SequenceMatcher(200);
		matcher.addKey("A");
		const onTimeout = vi.fn();
		matcher.startTimer(100, onTimeout);

		vi.advanceTimersByTime(100);

		expect(onTimeout).toHaveBeenCalledOnce();
		expect(matcher.getCurrentSequence()).toEqual([]);
		vi.useRealTimers();
	});

	it("resetTimer cancels a pending timeout before it fires", () => {
		vi.useFakeTimers();
		const matcher = new SequenceMatcher(200);
		const onTimeout = vi.fn();
		matcher.startTimer(100, onTimeout);
		matcher.resetTimer();

		vi.advanceTimersByTime(200);

		expect(onTimeout).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});
