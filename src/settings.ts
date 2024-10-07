import { App, PluginSettingTab, Setting } from "obsidian";
import SimpleAccountingPlugin from "./main";

export interface SimpleAccountingPluginSettings {
  language: "RU" | "EN";
}

export const DEFAULT_SETTINGS: SimpleAccountingPluginSettings = {
  language: "RU",
};

export class SimpleAccountingSettingTab extends PluginSettingTab {
  plugin: SimpleAccountingPlugin;

  constructor(app: App, plugin: SimpleAccountingPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Language")
      .setDesc("Choose the plugin language")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("RU", "Russian")
          .addOption("EN", "English")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as "RU" | "EN";
            await this.plugin.saveSettings();
          })
      );
  }
}