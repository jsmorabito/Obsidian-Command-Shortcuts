export const Platform = {
	isMacOS: false,
	isWin: false,
	isLinux: false,
	isMobile: false,
	isDesktop: true,
};

// Minimal stub so modules that `extends PluginSettingTab` can be imported.
export class PluginSettingTab {
	app: unknown;
	plugin: unknown;
	containerEl: unknown = null;
	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
	}
}
