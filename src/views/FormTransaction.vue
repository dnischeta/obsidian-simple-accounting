<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOptions } from '../composables/useOptions';
import { useTransaction } from '../composables/useTransaction';
import { getTranslation } from '../translations';
import { useSettings } from '../composables/useSettings';

const { settings } = useSettings();
const language = computed(() => settings.language);

const t = (key: string) => getTranslation(key, language.value);

const now = new Date();
const initialForm = {
    date: [
        now.getFullYear(),
        (now.getMonth() + 1).toString().padStart(2, '0'),
        now.getDate().toString().padStart(2, '0')
    ].join('-'),
    amount: 0,
    category: '',
    currency: 'RUB',
    source: '',
    description: '',
};

const { categories, sources } = useOptions();
const { appending, appendTransaction } = useTransaction();

const form = ref({ ...initialForm });
const firstInput = ref<HTMLInputElement | null>(null);

const createTransaction = async () => {
    await appendTransaction(form.value);
    form.value = { ...initialForm };
    firstInput.value?.focus();
};
</script>

<template>
    <div>
        <h2>{{ t('createTransaction') }}</h2>
        <form class="form" :disabled="appending" @submit.prevent="createTransaction">
            <div class="form-item">
                <label for="date">{{ t('date') }}:</label>
                <input type="date" id="date" v-model="form.date" required />
            </div>
            <div class="form-item">
                <label for="amount">{{ t('amount') }}:</label>
                <input ref="firstInput" type="number" id="amount" v-model="form.amount" required />
            </div>
            <div class="form-item">
                <label for="category">{{ t('category') }}:</label>
                <select id="category" v-model="form.category" required>
                    <option v-for="c in categories" :key="c">{{ c }}</option>
                </select>
            </div>
            <div class="form-item">
                <label for="currency">{{ t('currency') }}:</label>
                <input type="text" id="currency" v-model="form.currency" disabled required />
            </div>
            <div class="form-item">
                <label for="source">{{ t('source') }}:</label>
                <select id="source" v-model="form.source" required>
                    <option v-for="s in sources" :key="s">{{ s }}</option>
                </select>
            </div>
            <div class="form-item">
                <label for="description">{{ t('description') }}:</label>
                <input type="text" id="description" v-model="form.description" />
            </div>
            <button type="submit" :disabled="appending">{{ t('create') }}</button>
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
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
}
</style>