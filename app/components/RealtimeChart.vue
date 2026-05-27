<template>
    <div class="w-full h-full min-h-[150px] flex flex-col relative">
        <div v-if="series.length > 1" class="flex justify-start gap-4 text-[10px] mb-2 px-3 z-10">
            <div v-for="(s, i) in series" :key="s.name" class="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: chartColors[i] }"></span>
                <span class="text-text-muted font-bold uppercase">{{ s.name }}</span>
            </div>
        </div>
        <ClientOnly>
            <component
:is="apexchart" v-if="apexchart" ref="chartRef" :type="type" :height="height"
                :options="chartOptions" :series="series" class="flex-1" />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef, type PropType } from 'vue'
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
    color: { type: [String, Array] as PropType<string | string[]>, default: '#7c3aed' }, // Default Primary purple
    dataPoint: { type: null as any, default: 0 },
    maxPoints: { type: Number, default: 20 },
    type: { type: String, default: 'area' },
    height: { type: [Number, String], default: 200 }
})

// Historical data buffer: Map of series name -> data points
const multiHistory = ref<Record<string, { x: number; y: number }[]>>({})

// Init with some empty data so chart isn't blank
const initData = () => {
    const now = new Date().getTime()
    const updated = { ...multiHistory.value }
    if (typeof props.dataPoint === 'number') {
        updated['default'] = []
        for (let i = props.maxPoints; i > 0; i--) {
            updated['default'].push({ x: now - i * 1000, y: 0 })
        }
    } else if (props.dataPoint && typeof props.dataPoint === 'object') {
        for (const key in props.dataPoint) {
            updated[key] = []
            for (let i = props.maxPoints; i > 0; i--) {
                updated[key].push({ x: now - i * 1000, y: 0 })
            }
        }
    }
    multiHistory.value = updated
}

// Watch for new incoming data points
watch(() => props.dataPoint, (newVal) => {
    const now = new Date().getTime()
    const updated = { ...multiHistory.value }
    
    if (typeof newVal === 'number') {
        if (!updated['default']) updated['default'] = []
        updated['default'].push({ x: now, y: newVal })
        if (updated['default'].length > props.maxPoints) {
            updated['default'].shift()
        }
    } else if (newVal && typeof newVal === 'object') {
        for (const key in newVal) {
            if (!updated[key]) {
                // Initialize if new key appears
                updated[key] = []
                for (let i = props.maxPoints - 1; i > 0; i--) {
                    updated[key].push({ x: now - i * 1000, y: 0 })
                }
            }
            updated[key].push({ x: now, y: newVal[key] })
            if (updated[key].length > props.maxPoints) {
                updated[key].shift()
            }
        }
    }
    
    multiHistory.value = updated
}, { deep: true })

const series = computed(() => {
    if (typeof props.dataPoint === 'number') {
        return [{ name: props.title, data: [...(multiHistory.value['default'] || [])] }]
    } else {
        // Sort keys to maintain consistent order/colors
        const keys = Object.keys(multiHistory.value).sort()
        if (keys.length === 0) return []
        return keys.map(key => ({
            name: key,
            data: [...multiHistory.value[key]]
        }))
    }
})

const chartColors = computed(() => {
    if (Array.isArray(props.color)) return props.color
    if (typeof props.dataPoint === 'object' && props.dataPoint !== null) {
        const baseColor = typeof props.color === 'string' ? props.color : '#7c3aed'
        const palette = [
            '#3b82f6', // Blue 500
            '#2dd4bf', // Teal 400
            '#facc15', // Yellow 400
            '#f87171', // Red 400
            '#a855f7'  // Purple 500
        ].filter(c => c !== baseColor)
        
        return [baseColor, ...palette]
    }
    return [props.color as string]
})

const chartOptions = computed<ApexOptions>(() => ({
    chart: {
        id: 'realtime',
        animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: { speed: 1000 }
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
            opacityFrom: typeof props.dataPoint === 'number' ? 0.7 : 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100]
        }
    },
    colors: chartColors.value,
    legend: {
        show: false
    },
    xaxis: {
        type: 'datetime',
        range: props.maxPoints * 1000,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
    },
    yaxis: { 
        labels: { show: false },
        max: (max: number) => (max ? max * 1.2 : 10) // Leave 20% headroom above highest peak
    },
    grid: {
        show: true,
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        padding: { top: 20, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
        theme: 'dark',
        x: { format: 'HH:mm:ss' }
    }
}))
</script>
