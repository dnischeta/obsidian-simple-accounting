export type Transaction = {
    date: string;
    amount: number;
    category: string;
    currency: string;
    source: string;
    description: string;
}

export type BalanceEntry = {
    month: string; // Формат: YYYY-MM
    currency: string;
    assets: { name: string; amount: number }[];
    liabilities: { name: string; amount: number }[];
}
