import { readonly, ref } from "vue";
import { useObsidian } from "./useObsidian";
import type { Transaction } from "../types";

export const useTransaction = () => {
    const obsidian = useObsidian();

    const appending = ref(false);

    async function appendTransaction(transaction: Transaction) {
        appending.value = true;
        const vault = obsidian.vault;
        const expensesFile = vault.getFiles().find((file) => file.name === 'Расходы.md');
        const trString = [
            transaction.date,
            `${transaction.amount}${transaction.currency}`,
            transaction.category,
            transaction.source,
        ];

        if (transaction.description) {
            trString.push(transaction.description);
        }

        try {
            if (expensesFile) {
                await vault.append(expensesFile, trString.join(" ").concat("\n"));
            } else {
                throw new Error("Файл для записи раходов не найден");
            }
        } catch (error) {
            throw error;
        } finally {
            appending.value = false;
        }
    }

    return { appending: readonly(appending), appendTransaction };
}