import { Plugin, WorkspaceLeaf } from "obsidian";
import { TransactionView, VIEW_TRANSACTION } from './TransactionView';
import { BalanceView, VIEW_BALANCE } from './BalanceView';
import { AnalyticsView, VIEW_ANALYTICS } from './AnalyticsView';
import { ExpenseAnalyticsView, VIEW_EXPENSE_ANALYTICS } from './ExpenseAnalyticsView';

export default class SimpleAccountingPlugin extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.initFiles();
    });

    this.registerView(
      VIEW_TRANSACTION,
      (leaf) => new TransactionView(leaf)
    );
    this.registerView(
      VIEW_BALANCE,
      (leaf) => new BalanceView(leaf)
    );
    this.registerView(
      VIEW_ANALYTICS,
      (leaf) => new AnalyticsView(leaf)
    );

    this.registerView(
      VIEW_EXPENSE_ANALYTICS,
      (leaf) => new ExpenseAnalyticsView(leaf)
    );

    this.addRibbonIcon("receipt", "Транзакции", () => {
      this.activateView(VIEW_TRANSACTION);
    });

    this.addRibbonIcon("scale", "Баланс", () => {
      this.activateView(VIEW_BALANCE);
    });

    this.addRibbonIcon("piggy-bank", "Аналитика", () => {
      this.activateView(VIEW_ANALYTICS);
    });

    this.addRibbonIcon("coins", "Аналитика Расходов", () => {
      this.activateView(VIEW_EXPENSE_ANALYTICS);
    });
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TRANSACTION);
    this.app.workspace.detachLeavesOfType(VIEW_BALANCE);
    this.app.workspace.detachLeavesOfType(VIEW_ANALYTICS);
    this.app.workspace.detachLeavesOfType(VIEW_EXPENSE_ANALYTICS);
  }

  async activateView(viewType: string) {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(viewType);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf!.setViewState({ type: viewType, active: true });
    }

    workspace.revealLeaf(leaf!);
  }

  private async initFiles() {
    const vault = this.app.vault;

    const balanceDir = vault.getAbstractFileByPath('Баланс');
    if (!balanceDir) {
      await vault.createFolder('Баланс');
    }

    const transactionFile = vault.getFiles().find(file => file.name === 'Расходы.md');

    if (!transactionFile) {
      await vault.create('Расходы.md', '');
    }
  }
}