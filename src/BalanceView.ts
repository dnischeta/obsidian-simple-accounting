import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, App as VueApp } from 'vue';
import FormBalance from './views/FormBalance.vue';
import obsidianAppPlugin from './vue-plugin';

export const VIEW_BALANCE = "balance-view";

export class BalanceView extends ItemView {
  private vueApp?: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getIcon() {
    return "scale";
  }

  getViewType() {
    return VIEW_BALANCE;
  }

  getDisplayText() {
    return "Баланс";
  }

  async onOpen() {
    const container = this.containerEl.children[1];

    this.vueApp = createApp(FormBalance);
    this.vueApp.use(obsidianAppPlugin, { obsidianApp: this.app });
    this.vueApp.mount(container);
  }

  async onClose() {
    this.vueApp?.unmount();
  }
}
