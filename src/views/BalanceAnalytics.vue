<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBalance } from '../composables/useBalance';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'vue-chartjs';
import dayjs from 'dayjs';
import { useSettings } from '../composables/useSettings';
import { getTranslation } from '../translations';

const { settings } = useSettings();
const language = computed(() => settings.language);

const t = (key: string) => getTranslation(key, language.value);

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { getAllBalances } = useBalance();
const labels = ref<string[]>([]);
const balanceData = ref<number[]>([]);
const assetsData = ref<{ [key: string]: number[] }>({});
const liabilitiesData = ref<{ [key: string]: number[] }>({});

const fetchData = async () => {
    const balances = await getAllBalances();

    // Сортируем балансы по месяцу
    balances.sort((a, b) => dayjs(a.month).unix() - dayjs(b.month).unix());

    labels.value = balances.map(balance => balance.month);
    balanceData.value = balances.map(balance => calculateNetBalance(balance.assets, balance.liabilities));

    const tempAssetsData: { [key: string]: number[] } = {};
    const tempLiabilitiesData: { [key: string]: number[] } = {};

    balances.forEach((balance, index) => {
        balance.assets.forEach(asset => {
            if (!tempAssetsData[asset.name]) {
                tempAssetsData[asset.name] = new Array(balances.length).fill(0);
            }
            tempAssetsData[asset.name][index] = asset.amount;
        });

        balance.liabilities.forEach(liability => {
            if (!tempLiabilitiesData[liability.name]) {
                tempLiabilitiesData[liability.name] = new Array(balances.length).fill(0);
            }
            tempLiabilitiesData[liability.name][index] = liability.amount;
        });
    });

    assetsData.value = tempAssetsData;
    liabilitiesData.value = tempLiabilitiesData;
};

const balanceChartData = ref({
    labels: labels.value,
    datasets: [
        {
            label: 'Баланс',
            data: balanceData.value,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
        }
    ]
});

const assetsChartData = ref({
    labels: labels.value,
    datasets: [] as any
});

const liabilitiesChartData = ref({
    labels: labels.value,
    datasets: [] as any
});

const generateChartData = () => {
    assetsChartData.value = {
        labels: labels.value,
        datasets: Object.keys(assetsData.value).map((key, index) => ({
            label: key,
            data: assetsData.value[key],
            borderColor: getColor(index),
            backgroundColor: getColor(index, 0.2),
            fill: false,
            tension: 0.4
        }))
    };

    liabilitiesChartData.value = {
        labels: labels.value,
        datasets: Object.keys(liabilitiesData.value).map((key, index) => ({
            label: key,
            data: liabilitiesData.value[key],
            borderColor: getColor(index + Object.keys(assetsData.value).length),
            backgroundColor: getColor(index + Object.keys(assetsData.value).length, 0.2),
            fill: false,
            tension: 0.4
        }))
    };
};

// Функция для генерации цветов
const getColor = (index: number, opacity: number = 1) => {
    const colors = [
        'rgba(255, 99, 132, OPACITY)',
        'rgba(54, 162, 235, OPACITY)',
        'rgba(255, 206, 86, OPACITY)',
        'rgba(75, 192, 192, OPACITY)',
        'rgba(153, 102, 255, OPACITY)',
        'rgba(255, 159, 64, OPACITY)'
    ];
    return colors[index % colors.length].replace('OPACITY', opacity.toString());
};

// Вычисление общего баланса
const calculateNetBalance = (assets: { name: string; amount: number }[], liabilities: { name: string; amount: number }[]) => {
    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    return totalAssets - totalLiabilities;
};

onMounted(async () => {
    await fetchData();
    generateChartData();
    // Обновляем данные для баланса
    balanceChartData.value = {
        labels: labels.value,
        datasets: [
            {
                label: 'Баланс',
                data: balanceData.value,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };
});
</script>

<template>
    <div>
        <h2>{{ t('balanceAnalytics') }}</h2>

        <div class="chart-container">
            <h3>{{ t('balanceOverTime') }}</h3>
            <Line :data="balanceChartData" />
        </div>

        <div class="chart-container">
            <h3>{{ t('assetsOverTime') }}</h3>
            <Line :data="assetsChartData" />
        </div>

        <div class="chart-container">
            <h3>{{ t('liabilitiesOverTime') }}</h3>
            <Line :data="liabilitiesChartData" />
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    margin-bottom: 2rem;
}
</style>