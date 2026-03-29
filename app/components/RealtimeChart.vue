<template>
    <div class="w-full h-full min-h-[150px]">
        <ClientOnly>
            <component
:is="apexchart" v-if="apexchart" ref="chartRef" :type="type" :height="height"
                :options="chartOptions" :series="series" />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import type { ApexOptions } from 'apexcharts'
import type { Component } from 'vue'

const apexchart = shallowRef<Component | null>(null)

onMounted(async () => {
    if (typeof window !== 'undefined') {
        const module = await import('vue3-apexcharts')
        apexchart.value = module.default
        initData()
    }
})

const props = defineProps({
    title: { type: String, default: '' },
    color: { type: String, default: '#7c3aed' }, // Default Primary purple
    dataPoint: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 20 },
    type: { type: String, default: 'area' },
    height: { type: [Number, String], default: 200 }
})

// Historical data buffer
const history = ref<{ x: number; y: number }[]>([])

// Init with some empty data so chart isn't blank
const initData = () => {
    const now = new Date().getTime()
    for (let i = props.maxPoints; i > 0; i--) {
        history.value.push({ x: now - i * 1000, y: 0 })
    }
}

// Watch for new incoming data points
watch(() => props.dataPoint, (newVal) => {
    const now = new Date().getTime()
    history.value.push({ x: now, y: newVal })

    // Keep only the last N points
    if (history.value.length > props.maxPoints) {
        history.value.shift()
    }
})

const series = computed(() => [{
    name: props.title,
    data: history.value
}])

const chartOptions = computed<ApexOptions>(() => ({
    chart: {
        id: 'realtime',
        animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
                speed: 1000
            }
        },
        toolbar: { show: false },
        zoom: { enabled: false },
        background: 'transparent',
        foreColor: 'var(--color-text-muted)'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.1,
            stops: [0, 90, 100]
        }
    },
    colors: [props.color],
    xaxis: {
        type: 'datetime',
        range: props.maxPoints * 1000, // Show exactly N seconds window
        labels: { show: false }, // Hide time labels for cleaner look
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
    },
    yaxis: {
        // Dynamic scaling
        labels: { show: false }, // Minimalist
    },
    grid: {
        show: true,
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
        theme: 'dark',
        x: { format: 'HH:mm:ss' }
    }
}))

onMounted(() => {
    initData()
})
</script>
