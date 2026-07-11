import { Component, Menu, MenuItem, setIcon } from "obsidian";
import ShortcutsPlugin from "./main";

export class TooltipObserver extends Component {
	private mutationObserver: MutationObserver;
	private plugin: ShortcutsPlugin;

	private tooltipsToModify = new Set<HTMLElement>();

	constructor(plugin: ShortcutsPlugin) {
		super();
		this.mutationObserver = new MutationObserver((mutations) => {
			this.handleMutations(mutations);
		});
		this.plugin = plugin;
	}

	onload() {
		super.onload();
		this.mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["class"],
		});

		const plugin = this.plugin;

		this.registerDomEvent(document, "contextmenu", (event) => {
			if (
				event.target instanceof HTMLElement &&
				event.target.closest("[aria-label]") &&
				!event.target.closest(".workspace-tab-header")
			) {
				event.preventDefault();
				event.stopPropagation();
				const menu = new Menu();
				menu.addItem((item: MenuItem) => {
					item.setTitle("Set shortcut").setIcon("scissors");
					item.onClick(() => {
						plugin.app.setting.open();
						plugin.app.setting.openTabById("shortcuts");

						if (
							event.target instanceof HTMLElement &&
							event.target.getAttribute("aria-label")
						) {
							const ariaLabel =
								event.target.getAttribute("aria-label") || "";
							this.plugin.settingTab.updateSearchQuery(ariaLabel);
						}
					});
				});
				menu.showAtPosition({ x: event.clientX, y: event.clientY });
			}
		});
	}

	onunload() {
		super.onunload();
		this.mutationObserver.disconnect();
	}

	private handleMutations(mutations: MutationRecord[]) {
		if (!mutations.find((m) => m.type === "childList")) {
			return;
		}

		mutations.forEach((mutation) => {
			if (mutation.type === "childList") {
				mutation.addedNodes.forEach((node) => {
					if (
						node.instanceOf(HTMLElement) &&
						node.hasClass("tooltip")
					) {
						this.tooltipsToModify.add(node);
					}
				});
				mutation.removedNodes.forEach((node) => {
					// Prevent removed tooltips from being modified
					if (
						node.instanceOf(HTMLElement) &&
						node.hasClass("shortcuts-hotkey-label")
					) {
						const mutationTarget = mutation.target;
						if (
							mutationTarget.instanceOf(HTMLElement) &&
							mutationTarget.hasClass("tooltip")
						) {
							this.tooltipsToModify.add(mutationTarget);
						}
					}
				});
			} else if (
				mutation.type === "characterData" ||
				mutation.type === "attributes"
			) {
				const target = mutation.target;
				if (
					target.instanceOf(HTMLElement) &&
					target.hasClass("tooltip")
				) {
					this.tooltipsToModify.add(target);
				}
			}
		});

		if (this.tooltipsToModify.size > 0) {
			this.checkAndModifyAllTooltips();
		}
	}

	private checkAndModifyAllTooltips() {
		const tooltips = Array.from(this.tooltipsToModify);
		tooltips.forEach((tooltip) => this.modifyTooltipContent(tooltip));
	}

	private modifyTooltipContent(tooltipElement: HTMLElement) {
		const originalContent = tooltipElement.textContent || "";
		tooltipElement.toggleClass("shortcuts-tooltip", true);

		const hotkey = this.plugin.settings.sequences
			.flatMap((s) => s.configs)
			.find((c) => c.id === originalContent);

		if (hotkey) {
			if (hotkey.sequence.length > 0) {
				tooltipElement.createDiv({
						cls: "shortcuts-hotkey-label",
					}, (el) => {
						const iconEl = el.createSpan({
							cls: "shortcuts-hotkey-label-icon",
						});
						setIcon(iconEl, "scissors");
						hotkey.sequence.forEach((s, index) => {
							el.createSpan({
								text: s.join(" + "),
								cls: "shortcuts-hotkey-label-item",
							});
							if (index < hotkey.sequence.length - 1) {
								el.createSpan({
									text: " then ",
									cls: "shortcuts-hotkey-label-separator",
								});
							}
						});
					});
			}
		}

		this.tooltipsToModify.clear();
	}
}
