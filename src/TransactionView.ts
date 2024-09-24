import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, App as VueApp } from 'vue'
import FormTransaction from './views/FormTransaction.vue'
import obsidianAppPlugin from './vue-plugin'

export const VIEW_TRANSACTION = "transaction-view";

export class TransactionView extends ItemView {
  private vueApp?: VueApp;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getIcon() {
    return "receipt";
  }
  getViewType() {
    return VIEW_TRANSACTION;
  }

  getDisplayText() {
    return "Транзакции";
  }

  async onOpen() {
    const container = this.containerEl.children[1];

    this.vueApp = createApp(FormTransaction);
    this.vueApp.use(obsidianAppPlugin, { obsidianApp: this.app });
    this.vueApp.mount(container);
  }

  async onClose() {
    this.vueApp?.unmount();
  }
}