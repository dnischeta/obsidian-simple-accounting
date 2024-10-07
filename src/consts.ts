import { InjectionKey } from 'vue';
import { App as ObsidianApp } from 'obsidian';

export const OBSIDIAN_INJECTION_KEY: InjectionKey<{ obsidianApp: ObsidianApp, settings: any }> = Symbol('obsidianApp');