<template>
    <div class="p-6 max-w-[1920px] mx-auto space-y-8">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-text">Mapa de Calor & Capacidad</h1>
                <p class="text-text-muted text-sm mt-1">Análisis de carga en tiempo real para balanceo de recursos</p>
            </div>
            <button @click="fetchData"
                class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2 shadow-sm text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    :class="{ 'animate-spin': loading }">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                </svg>
                Actualizar Métricas
            </button>
        </div>

        <!-- Heatmap Grid -->
        <div v-if="loading && nodesData.length === 0" class="py-20 flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

            <!-- Node Card -->
            <div v-for="node in nodesData" :key="node.name"
                class="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">

                <!-- Node Header (Capacity) -->
                <div class="p-5 border-b border-border/50 bg-muted-surface/30">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full"
                                :class="node.status === 'online' ? 'bg-positive shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-danger'">
                            </div>
                            <h2 class="text-xl font-bold text-text">{{ node.name }}</h2>
                        </div>
                        <div
                            class="text-xs font-mono text-text-muted bg-background px-2 py-1 rounded border border-border">
                            {{ node.vms.length }} Workloads
                        </div>
                    </div>

                    <!-- Host Metrics -->
                    <div class="space-y-3">
                        <!-- CPU Bar -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-text-muted font-bold">CPU Host</span>
                                <span :class="getLoadColorText(node.cpuUsage)">{{ (node.cpuUsage * 100).toFixed(1)
                                }}%</span>
                            </div>
                            <div class="h-2 w-full bg-background rounded-full overflow-hidden border border-border/30">
                                <div class="h-full rounded-full transition-all duration-500"
                                    :class="getLoadColorBg(node.cpuUsage)"
                                    :style="{ width: `${node.cpuUsage * 100}%` }"></div>
                            </div>
                        </div>
                        <!-- RAM Bar -->
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-text-muted font-bold">RAM Host</span>
                                <span class="text-text">{{ formatBytes(node.memUsed) }} / {{ formatBytes(node.memTotal)
                                }}</span>
                            </div>
                            <div class="h-2 w-full bg-background rounded-full overflow-hidden border border-border/30">
                                <div class="h-full rounded-full bg-blue-500 transition-all duration-500"
                                    :style="{ width: `${(node.memUsed / node.memTotal) * 100}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VMs Heatmap (The Grid) -->
                <div class="p-5 flex-1 bg-[#0a0a0a]">
                    <h3 class="text-[10px] uppercase font-bold text-text-muted mb-3 flex justify-between">
                        <span>Carga Individual de VMs (CPU)</span>
                        <span class="text-[9px] opacity-50">hover para detalles</span>
                    </h3>

                    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        <div v-for="vm in node.vms" :key="vm.vmid"
                            class="aspect-square rounded shadow-sm border border-white/5 relative group cursor-help transition-transform hover:scale-110 hover:z-10"
                            :class="[
                                getVmHeatColor(vm),
                                vm.status !== 'running' ? 'opacity-30 grayscale' : 'opacity-90'
                            ]">
                            <!-- VM Content (Mini ID) -->
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-[10px] font-bold text-white/90 drop-shadow-md">{{ vm.vmid }}</span>
                            </div>

                            <!-- Tooltip with High Contrast -->
                            <div
                                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 rounded-lg p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-left">
                                <div
                                    class="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 dark:border-black/10">
                                    <div class="w-2.5 h-2.5 rounded-full shadow-sm"
                                        :class="vm.status === 'running' ? 'bg-emerald-500' : 'bg-red-500'"></div>
                                    <span class="font-bold text-sm truncate flex-1">{{ vm.name }}</span>
                                </div>
                                <div class="space-y-1.5 text-xs font-mono">
                                    <div class="flex justify-between"><span class="opacity-70">ID:</span> <span>{{
                                            vm.vmid }}</span></div>
                                    <div class="flex justify-between"><span class="opacity-70">Type:</span> <span
                                            class="uppercase font-bold">{{ vm.type }}</span></div>
                                    <div class="flex justify-between items-center">
                                        <span class="opacity-70">CPU:</span>
                                        <span class="px-1.5 rounded bg-white/10 dark:bg-black/10 font-bold">{{ ((vm.cpu
                                            || 0) * 100).toFixed(1) }}%</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="opacity-70">RAM:</span>
                                        <span>{{ formatBytes(vm.mem || 0) }}</span>
                                    </div>
                                </div>
                                <!-- Arrow -->
                                <div
                                    class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-zinc-900 dark:border-t-zinc-100">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="node.vms.length === 0"
                        class="h-full flex items-center justify-center text-text-muted text-xs italic opacity-50">
                        Sin máquinas desplegadas
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

useHead({ title: 'Heatmap de Recursos' })

const { isAuthenticated, restoreSession, listVMResources, listNodes } = useProxmox()

// Types
type ClusterResource = {
    id: string
    type: 'node' | 'qemu' | 'lxc'
    node: string
    vmid?: number
    name?: string
    status?: string
    maxcpu?: number
    cpu?: number // 0.0 to 1.0 (ratio of maxcpu? or total? Proxmox sends ratio usually)
    maxmem?: number
    mem?: number
    uptime?: number
}

type NodeAggregated = {
    name: string
    status: 'online' | 'offline' | 'unknown'
    cpuUsage: number // 0-1
    memUsed: number
    memTotal: number
    vms: ClusterResource[]
}

const loading = ref(false)
const rawResources = ref<ClusterResource[]>([])

onMounted(() => {
    restoreSession()
    fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        const res = await listVMResources()
        if (res.success && res.data) {
            rawResources.value = res.data as ClusterResource[]
        }
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

// Transform raw flat list into Node-grouped data
const nodesData = computed<NodeAggregated[]>(() => {
    const nodesMap = new Map<string, NodeAggregated>()

    // 1. First Pass: Find all nodes
    rawResources.value.forEach(r => {
        if (r.type === 'node') {
            nodesMap.set(r.node, {
                name: r.node,
                status: r.status === 'online' ? 'online' : 'offline',
                cpuUsage: r.cpu || 0,
                memUsed: r.mem || 0,
                memTotal: r.maxmem || 0,
                vms: []
            })
        }
    })

    // If no nodes found in resources (weird privilege issue), fallback could be added here, 
    // but usually user can see nodes if they can see VMs.

    // 2. Second Pass: Distribute VMs to Nodes
    rawResources.value.forEach(r => {
        if (r.type === 'qemu' || r.type === 'lxc') {
            const node = nodesMap.get(r.node)
            if (node) {
                node.vms.push(r)
            } else {
                // VM on a node we didn't see? Add node placeholder
                // This happens in clusters where you see the VM but node status is separate
                nodesMap.set(r.node, {
                    name: r.node,
                    status: 'unknown',
                    cpuUsage: 0,
                    memUsed: 0,
                    memTotal: 0,
                    vms: [r]
                })
            }
        }
    })

    // Sort nodes by name
    return Array.from(nodesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})


// --- Style Helpers ---

const getLoadColorBg = (load: number) => {
    if (load < 0.3) return 'bg-emerald-500' // Cool
    if (load < 0.7) return 'bg-amber-500'   // Warm
    return 'bg-rose-600'                    // Hot
}

const getLoadColorText = (load: number) => {
    if (load < 0.3) return 'text-emerald-500'
    if (load < 0.7) return 'text-amber-500'
    return 'text-rose-500 shadow-rose-500/20 drop-shadow-sm font-bold'
}

const getVmHeatColor = (vm: ClusterResource) => {
    if (vm.status !== 'running') return 'bg-zinc-800' // Stopped

    // Calculate heat based on CPU and Memory pressure? 
    // Usually CPU is the "heat", Memory is "capacity". Let's stick to CPU heat.
    const load = vm.cpu || 0
    // Proxmox sends CPU as ratio of used cores? Wait, API sends 0.05 for 5% of assigned cores usually.
    // Let's assume 0-1 range.

    if (load < 0.1) return 'bg-emerald-900/80 border-emerald-700/50' // Very Idle
    if (load < 0.3) return 'bg-emerald-600 border-emerald-400/50'   // Working
    if (load < 0.6) return 'bg-amber-500 border-amber-300/50'       // Busy
    if (load < 0.8) return 'bg-orange-600 border-orange-400/50'     // Heavy
    return 'bg-rose-600 border-rose-400 animate-pulse'              // Critical
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

</script>
