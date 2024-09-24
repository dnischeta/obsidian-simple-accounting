import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, App as VueApp } from 'vue';
import FormAnalytics from './views/BalanceAnalytics.vue';
import obsidianAppPlugin from './vue-plugin';

export const VIEW_ANALYTICS = "analytics-view";

export class AnalyticsView extends ItemView {
  private vueApp?: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getIcon() {
    return "file-chart-column";
  }

  getViewType() {
    return VIEW_ANALYTICS;
  }

  getDisplayText() {
    return "Аналитика";
  }

  async onOpen() {
    const container = this.containerEl.children[1];

    this.vueApp = createApp(FormAnalytics);
    this.vueApp.use(obsidianAppPlugin, { obsidianApp: this.app });
    this.vueApp.mount(container);
  }

  async onClose() {
    this.vueApp?.unmount();
  }
}