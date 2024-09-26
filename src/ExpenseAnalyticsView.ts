import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, App as VueApp } from 'vue';
import ExpenseAnalytics from './views/ExpenseAnalytics.vue';
import obsidianAppPlugin from './vue-plugin';

export const VIEW_EXPENSE_ANALYTICS = "expense-analytics-view";

export class ExpenseAnalyticsView extends ItemView {
  private vueApp?: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getIcon() {
    return "coins";
  }

  getViewType() {
    return VIEW_EXPENSE_ANALYTICS;
  }

  getDisplayText() {
    return "Аналитика Расходов";
  }

  async onOpen() {
    const container = this.containerEl.children[1];

    this.vueApp = createApp(ExpenseAnalytics);
    this.vueApp.use(obsidianAppPlugin, { obsidianApp: this.app });
    this.vueApp.mount(container);
  }

  async onClose() {
    this.vueApp?.unmount();
  }
}