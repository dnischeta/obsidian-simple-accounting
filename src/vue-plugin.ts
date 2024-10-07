import { App as VueApp } from 'vue';
import { App as ObsidianApp } from 'obsidian';
import { OBSIDIAN_INJECTION_KEY } from './consts';

export default {
    install(app: VueApp, options: { obsidianApp: ObsidianApp }) {
        app.provide(OBSIDIAN_INJECTION_KEY, {
            obsidianApp: options.obsidianApp,
            // @ts-expect-error ???
            settings: options.obsidianApp.plugins.getPlugin('accounting-helper').settings,
        });
    }
}