<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useExpense } from '../composables/useExpense';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Line, Bar } from 'vue-chartjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Использование composable для получения расходов
const { expenses, loading, error, fetchExpenses } = useExpense();

// Выбор месяца
const selectedMonth = ref('');

// Получение уникальных месяцев из расходов
const months = computed(() => {
    const uniqueMonths = new Set<string>();
    expenses.value.forEach(expense => {
        const month = getMonth(expense.date);
        uniqueMonths.add(month);
    });
    return Array.from(uniqueMonths);
});

// Фильтрация расходов по выбранному месяцу
const filteredExpenses = computed(() => {
    if (!selectedMonth.value) return expenses.value;
    return expenses.value.filter(expense => getMonth(expense.date) === selectedMonth.value);
});

// Вычисление расходов по категориям
const categoryData = computed(() => {
    const data: { [key: string]: number } = {};
    filteredExpenses.value.forEach(expense => {
        const category = expense.category;
        if (!data[category]) {
            data[category] = 0;
        }
        data[category] += expense.amount;
    });
    return data;
});

// Вычисление ежемесячных расходов
const monthlyExpenses = computed(() => {
    const data: { [key: string]: number } = {};
    expenses.value.forEach(expense => {
        const month = getMonth(expense.date);
        if (!data[month]) {
            data[month] = 0;
        }
        data[month] += expense.amount;
    });
    return data;
});

// Подготовка данных для Pie Chart
const pieChartData = ref({
    labels: Object.keys(categoryData.value),
    datasets: [
        {
            label: 'Распределение расходов по категориям',
            data: Object.values(categoryData.value),
            backgroundColor: generateColors(Object.keys(categoryData.value).length),
            hoverOffset: 4
        }
    ]
});

// Подготовка данных для Line Chart
const lineChartData = ref({
    labels: Object.keys(monthlyExpenses.value),
    datasets: [
        {
            label: 'Ежемесячные расходы',
            data: Object.values(monthlyExpenses.value),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
        }
    ]
});

// Подготовка данных для Bar Chart
const barChartData = ref({
    labels: Object.keys(categoryData.value),
    datasets: [
        {
            label: 'Расходы по категориям',
            data: Object.values(categoryData.value),
            backgroundColor: generateColors(Object.keys(categoryData.value).length)
        }
    ]
});

// Получение уникальных категорий из расходов
const categories = computed(() => {
    const uniqueCategories = new Set<string>();
    expenses.value.forEach(expense => {
        uniqueCategories.add(expense.category);
    });
    return Array.from(uniqueCategories);
});

// Выбор категорий
const selectedCategories = ref<string[]>([]);

// Подготовка данных для Line Chart по категориям
const categoryLineChartData = ref({
    labels: Array.from(months.value),
    datasets: [] as any[]
});

watchEffect(() => {
    updateChartData();
});

watchEffect(() => {
    updateCategoryLineChartData();
});

function getMonth(date: string) {
    const [y, m] = date.split('-');
    return `${y}-${m}`;
}

function generateColors(count: number, opacity: number = 0.6): string[] {
    const colors = [
        'rgba(255, 99, 132, OPACITY)',
        'rgba(54, 162, 235, OPACITY)',
        'rgba(255, 206, 86, OPACITY)',
        'rgba(75, 192, 192, OPACITY)',
        'rgba(153, 102, 255, OPACITY)',
        'rgba(255, 159, 64, OPACITY)'
    ];
    return Array.from({ length: count }, (_, i) => 
        colors[i % colors.length].replace('OPACITY', opacity.toString())
    );
}

function updateChartData() {
    pieChartData.value = {
        labels: Object.keys(categoryData.value),
        datasets: [
            {
                label: 'Распределение расходов по категориям',
                data: Object.values(categoryData.value),
                backgroundColor: generateColors(Object.keys(categoryData.value).length),
                hoverOffset: 4
            }
        ]
    };

    lineChartData.value = {
        labels: Object.keys(monthlyExpenses.value),
        datasets: [
            {
                label: 'Ежемесячные расходы',
                data: Object.values(monthlyExpenses.value),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    barChartData.value = {
        labels: Object.keys(categoryData.value),
        datasets: [
            {
                label: 'Расходы по категориям',
                data: Object.values(categoryData.value),
                backgroundColor: generateColors(Object.keys(categoryData.value).length)
            }
        ]
    };
}

function updateCategoryLineChartData() {
    const allMonths = Array.from(months.value);
    const datasets = selectedCategories.value.map((category) => {
        const data: { [key: string]: number } = {};
        expenses.value.forEach(expense => {
            if (expense.category === category) {
                const month = getMonth(expense.date);
                if (!data[month]) {
                    data[month] = 0;
                }
                data[month] += expense.amount;
            }
        });

        // Ensure all months are present in the data
        const completeData = allMonths.map(month => data[month] || 0);

        return {
            label: category,
            data: completeData,
            borderColor: generateColors(1, 1)[0],
            backgroundColor: generateColors(1, 0.2)[0],
            fill: false,
            tension: 0.4
        };
    });

    categoryLineChartData.value = {
        labels: allMonths,
        datasets
    };
}

onMounted(() => {
    fetchExpenses();
});
</script>

<template>
    <div>
        <h2>Аналитика Расходов</h2>

        <div v-if="loading" class="loading">Загрузка данных...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
            <div class="chart-container">
                <h3>Ежемесячные расходы</h3>
                <Line :data="lineChartData" />
            </div>

            <div class="chart-container">
                <label for="month-select">Выберите месяц:</label>
                <select id="month-select" v-model="selectedMonth">
                    <option value="">Все месяцы</option>
                    <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
                </select>
            </div>

            <div class="chart-container">
                <h3>Распределение расходов по категориям</h3>
                <Pie :data="pieChartData" />
            </div>

            <div class="chart-container">
                <h3>Расходы по категориям</h3>
                <Bar :data="barChartData" />
            </div>

            <div class="chart-container">
                <h3>Зависимость расходов по категориям от месяца</h3>
                <label for="category-select">Выберите категории:</label>
                <select id="category-select" v-model="selectedCategories" multiple>
                    <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                </select>
                <Line :data="categoryLineChartData" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    margin-bottom: 2rem;
}

.loading {
    font-size: 1.2rem;
    color: #555;
}

.error {
    color: red;
    font-weight: bold;
    font-size: 1.2rem;
}
</style>