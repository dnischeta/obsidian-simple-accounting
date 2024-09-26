<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBalance } from '../composables/useBalance';
import { Notice } from 'obsidian';

const initialForm = {
    month: '',
    currency: 'RUB',
    assets: [
        { name: '', amount: 0 }
    ],
    liabilities: [
        { name: '', amount: 0 }
    ]
};

const { submitting, submitBalance, getBalance, getPreviousMonthBalance } = useBalance();

const form = ref({ ...initialForm });
const errorMessage = ref('');

const addAsset = () => {
    form.value.assets.push({ name: '', amount: 0 });
};

const removeAsset = (index: number) => {
    form.value.assets.splice(index, 1);
};

const addLiability = () => {
    form.value.liabilities.push({ name: '', amount: 0 });
};

const removeLiability = (index: number) => {
    form.value.liabilities.splice(index, 1);
};

const loadBalance = async (selectedMonth: string) => {
    if (!selectedMonth) return;

    const balance = await getBalance(selectedMonth);

    if (balance) {
        form.value = {
            ...balance,
            assets: balance.assets.map(asset => ({ ...asset })),
            liabilities: balance.liabilities.map(liability => ({ ...liability }))
        };
        new Notice(`Баланс за ${selectedMonth} загружен`);
    } else {
        const previousBalance = await getPreviousMonthBalance(selectedMonth);
        if (previousBalance) {
            form.value = {
                ...previousBalance,
                month: selectedMonth,
                assets: previousBalance.assets.map(asset => ({ ...asset })),
                liabilities: previousBalance.liabilities.map(liability => ({ ...liability }))
            };
            new Notice(`Баланс за ${selectedMonth} не найден. Загружен баланс за предыдущий месяц.`);
        } else {
            form.value = { ...initialForm, month: selectedMonth };
            new Notice(`Баланс за ${selectedMonth} и предыдущий месяц не найден. Создается новый баланс.`);
        }
    }
};

watch(
    () => form.value.month,
    (newMonth, oldMonth) => {
        if (newMonth && oldMonth !== newMonth) {
            loadBalance(newMonth);
        }
    }
);

const submitForm = async () => {
    // Валидация: сумма активов и пассивов должна быть положительной
    form.value.assets = form.value.assets.map(asset => ({
        ...asset,
        amount: Math.abs(asset.amount)
    }));
    form.value.liabilities = form.value.liabilities.map(liability => ({
        ...liability,
        amount: Math.abs(liability.amount)
    }));

    try {
        await submitBalance(form.value);
        new Notice(`Баланс за ${form.value.month} успешно сохранен`);
        form.value = { ...initialForm, assets: [{ name: '', amount: 0 }], liabilities: [{ name: '', amount: 0 }] };
    } catch (error) {
        errorMessage.value = 'Ошибка при сохранении баланса.';
    }
};
</script>

<template>
    <div>
        <h2>Создать баланс</h2>
        <form class="form" :disabled="submitting" @submit.prevent="submitForm">
            <div class="form-item">
                <label for="month">Месяц:</label>
                <input type="month" id="month" v-model="form.month" required />
            </div>
            <div class="form-item">
                <label for="currency">Валюта:</label>
                <input type="text" id="currency" v-model="form.currency" required />
            </div>
            <div class="form-item">
                <h3>Активы</h3>
                <div v-for="(asset, index) in form.assets" :key="index" class="nested-form-item">
                    <input type="text" v-model="asset.name" placeholder="Название актива" required />
                    <input type="number" v-model="asset.amount" placeholder="Сумма" min="0" required />
                    <button type="button" @click="removeAsset(index)">Удалить</button>
                </div>
                <button type="button" @click="addAsset">Добавить актив</button>
            </div>
            <div class="form-item">
                <h3>Пассивы</h3>
                <div v-for="(liability, index) in form.liabilities" :key="index" class="nested-form-item">
                    <input type="text" v-model="liability.name" placeholder="Название пассива" required />
                    <input type="number" v-model="liability.amount" placeholder="Сумма" min="0" required />
                    <button type="button" @click="removeLiability(index)">Удалить</button>
                </div>
                <button type="button" @click="addLiability">Добавить пассив</button>
            </div>
            <button type="submit" :disabled="submitting">Сохранить баланс</button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nested-form-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
}

button {
    cursor: pointer;
}

.error {
    color: red;
    font-weight: bold;
}
</style>
