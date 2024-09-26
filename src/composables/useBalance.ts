import { readonly, ref } from "vue";
import { Notice, TFile } from "obsidian";
import { useObsidian } from "./useObsidian";
import type { BalanceEntry } from "../types";
import dayjs from "dayjs";

export const useBalance = () => {
    const obsidian = useObsidian();
    const submitting = ref(false);

    const submitBalance = async (balance: BalanceEntry) => {
        submitting.value = true;
        const vault = obsidian.vault;

        await getOrCreateBalanceDirectory(vault);
        const balanceFileName = `${balance.month}.md`;
        const balanceFilePath = `Баланс/${balanceFileName}`;
        const balanceFile = vault.getFiles().find(file => file.path === balanceFilePath);

        const formattedAssets = balance.assets.map(entry => `${entry.amount}${balance.currency} ${entry.name}`).join('\n');
        const formattedLiabilities = balance.liabilities.map(entry => `-${entry.amount}${balance.currency} ${entry.name}`).join('\n');

        const content = `
${formattedAssets}
${formattedLiabilities}

${calculateNetBalance(balance.assets, balance.liabilities)}${balance.currency}
`.trim();

        try {
            if (balanceFile) {
                await vault.modify(balanceFile, content);
                new Notice(`Баланс за ${balance.month} успешно обновлен`);
            } else {
                await vault.create(balanceFilePath, content);
                new Notice("Баланс успешно записан");
            }
        } catch (error) {
            new Notice("Ошибка при сохранении баланса");
            throw error;
        } finally {
            submitting.value = false;
        }
    };

    const getBalance = async (month: string): Promise<BalanceEntry | null> => {
        const vault = obsidian.vault;
        const filePath = `Баланс/${month}.md`;
        const file = vault.getFiles().find((f: TFile) => f.path === filePath);

        if (!file) {
            return null;
        }

        try {
            const content = await vault.read(file);
            return parseBalanceContent(content, month);
        } catch (error) {
            console.error(`Ошибка при чтении файла ${filePath}:`, error);
            return null;
        }
    };

    const getAllBalances = async (): Promise<BalanceEntry[]> => { // Новая функция для получения всех балансов
        const vault = obsidian.vault;
        const balanceDir = vault.getAbstractFileByPath('Баланс');
        const files = balanceDir ? vault.getFiles().filter(file => file.path.startsWith('Баланс/') && file.extension === 'md') : [];

        const balances: BalanceEntry[] = [];

        for (const file of files) {
            const month = file.name.replace('.md', '');
            const balance = await getBalance(month);
            if (balance) {
                balances.push(balance);
            }
        }

        return balances;
    };

    const parseBalanceContent = (content: string, month: string): BalanceEntry => {
        const lines = content.split('\n');
        const balance: BalanceEntry = {
            month,
            currency: '',
            assets: [],
            liabilities: []
        };

        lines.forEach(line => {
            line = line.trim();
            if (line) {
                const match = line.match(/^([+-]?)(\d+(?:\.\d+)?)(\w+)\s+(.+)$/);
                if (match) {
                    const [, sign, amountStr, currency, name] = match;
                    const amount = parseFloat(amountStr);
                    if (sign === '-') {
                        balance.liabilities.push({ name, amount });
                    } else {
                        balance.assets.push({ name, amount });
                    }
                    balance.currency = currency;
                } else if (line.startsWith('-') || line.startsWith('+')) {
                    const totalMatch = line.match(/^([+-])(\d+(?:\.\d+)?)(\w+)$/);
                    if (totalMatch) {
                        const [, , , currency] = totalMatch;
                        balance.currency = currency;
                    }
                }
            }
        });

        // Удаление пустых записей
        balance.assets = balance.assets.filter(asset => asset.name && asset.amount !== 0);
        balance.liabilities = balance.liabilities.filter(liability => liability.name && liability.amount !== 0);

        return balance;
    };

    const calculateNetBalance = (assets: { amount: number }[], liabilities: { amount: number }[]) => {
        const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
        return totalAssets - totalLiabilities;
    };

    const getOrCreateBalanceDirectory = async (vault: any) => {
        const balanceDir = vault.getAbstractFileByPath('Баланс');
        if (!balanceDir) {
            await vault.createFolder('Баланс');
        }
        return vault.getAbstractFileByPath('Баланс');
    };

    const getPreviousMonthBalance = async (month: string): Promise<BalanceEntry | null> => {
        const previousMonth = dayjs(month).subtract(1, 'month').format('YYYY-MM');
        return getBalance(previousMonth);
    };

    return { submitting: readonly(submitting), submitBalance, getBalance, getAllBalances, getPreviousMonthBalance };
};
