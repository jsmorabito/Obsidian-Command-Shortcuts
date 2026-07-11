// Obsidian's runtime patches these helper methods onto Element.prototype.
// jsdom doesn't know about them, so polyfill just enough for tests.
const proto = Element.prototype as unknown as {
	findAll?: (selector: string) => Element[];
};
if (!proto.findAll) {
	proto.findAll = function (this: Element, selector: string) {
		return Array.from(this.querySelectorAll(selector));
	};
}
