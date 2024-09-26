import { readonly, ref, onMounted } from "vue";
import { useObsidian } from "./useObsidian";
import type { Transaction } from "../types";
import { Notice } from "obsidian";

export const useExpense = () => {
    const obsidian = useObsidian();
    const expenses = ref<Transaction[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchExpenses = async () => {
        loading.value = true;
        error.value = null;
        try {
            const expensesFile = obsidian.vault.getFiles().find(file => file.path === 'Расходы.md');
            if (!expensesFile) {
                throw new Error('Файл Расходы.md не найден');
            }
            const content = await obsidian.vault.read(expensesFile);
            expenses.value = parseExpenses(content);
        } catch (err) {
            console.error("Ошибка при загрузке расходов:", err);
            error.value = 'Не удалось загрузить данные о расходах.';
            new Notice(`Ошибка при загрузке расходов: ${(err as Error).message}`);
        } finally {
            loading.value = false;
        }
    };

    const parseExpenses = (content: string): Transaction[] => {
        const lines = content.split('\n');
        const transactions: Transaction[] = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const parts = trimmedLine.split(' ');
                if (parts.length >= 4) {
                    const [date, amountWithCurrency, category, source, ...descriptionParts] = parts;
                    const amountMatch = amountWithCurrency.match(/^(\d+)(\w+)$/);
                    if (amountMatch) {
                        const [, amountStr, currency] = amountMatch;
                        const amount = parseFloat(amountStr);
                        const description = descriptionParts.join(' ');
                        transactions.push({
                            date,
                            amount,
                            category,
                            currency,
                            source,
                            description
                        });
                    }
                }
            }
        });

        return transactions;
    };

    onMounted(() => {
        fetchExpenses();
    });

    return {
        expenses: readonly(expenses),
        loading: readonly(loading),
        error: readonly(error),
        fetchExpenses
    };
};