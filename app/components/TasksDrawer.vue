<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

const props = defineProps<{
    isOpen: boolean
}>()

// using template's $emit; no need to capture `emit` here
const { getClusterLog, getNodeTasks, listNodes, username, isClusterAdmin } = useProxmox()

// Domain types
interface Task {
    upid?: string
    starttime?: number
    endtime?: number
    status?: string
    type?: string
    id?: string
    user?: string
    node?: string
}

interface NodeInfo { node: string }

type ApiResponse<T> = { success: boolean; data?: T }

const tasks = ref<Task[]>([])
const loading = ref(false)
const isFirstLoad = ref(true)
let interval: NodeJS.Timeout | null = null

const loadTasks = async () => {
    if (isFirstLoad.value) loading.value = true

    const userFilter = isClusterAdmin.value ? undefined : username.value || undefined

    // 1. Try Cluster Log ONLY if Admin (avoids 403/400 errors for students)
    let res: ApiResponse<unknown[]> = { success: false, data: [] }

    if (isClusterAdmin.value) {
        res = await getClusterLog(50)
    }

    // 2. Fallback / Default for Non-Admins: Fetch from Nodes
    if (!res.success) {
        const nodesRes = await listNodes()
        if (nodesRes.success && nodesRes.data) {
            const nodes = nodesRes.data as NodeInfo[]

            // Fetch tasks from ALL nodes in parallel
            const promises = nodes.map(n => getNodeTasks(n.node, 50, userFilter))
            const results = await Promise.all(promises)

            // Combine all tasks
            let allNodeTasks: Task[] = []
            results.forEach(r => {
                if (r.success && Array.isArray(r.data)) {
                    allNodeTasks = [...allNodeTasks, ...r.data]
                }
            })

            // Sort by starttime descending
            if (allNodeTasks.length > 0) {
                allNodeTasks.sort((a, b) => b.starttime - a.starttime)
                res = { success: true, data: allNodeTasks }
            }
        }
    }

    if (res.success && Array.isArray(res.data)) {
        tasks.value = res.data
    }
    loading.value = false
    isFirstLoad.value = false
}

// Auto-refresh when open
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        loadTasks()
        interval = setInterval(loadTasks, 5000)
    } else {
        if (interval) clearInterval(interval)
    }
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})

// Format helpers
const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const getStatusColor = (status: string) => {
    if (status === 'OK') return 'text-green-500'
    if (status.includes('Error')) return 'text-red-500'
    return 'text-blue-500'
}

// removed unused helper `getTaskIcon`

</script>

<template>
    <div class="fixed inset-0 z-50 flex justify-end pointer-events-none">
        <!-- Overlay (Click to close) -->
        <Transition
enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div
v-if="isOpen" class="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                @click="$emit('close')"/>
        </Transition>

        <!-- Drawer Panel -->
        <Transition
enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full"
            enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
            leave-from-class="translate-x-0" leave-to-class="translate-x-full">
            <div
v-if="isOpen"
                class="relative w-full max-w-md h-full bg-surface border-l border-border shadow-2xl pointer-events-auto flex flex-col">

                <!-- Header -->
                <div class="p-4 border-b border-border flex items-center justify-between bg-surface-header">
                    <div>
                        <h2 class="text-lg font-bold text-text-primary">Registro de Tareas</h2>
                        <p class="text-xs text-text-muted">Últimas operaciones del clúster</p>
                    </div>
                    <button
class="p-2 hover:bg-background rounded-lg text-text-muted transition-colors"
                        @click="$emit('close')">
                        <svg
xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Content List -->
                <div class="flex-1 overflow-y-auto p-2 space-y-2">

                    <div v-if="loading && tasks.length === 0" class="p-8 text-center text-text-muted">
                        <div
                            class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"/>
                        Cargando tareas...
                    </div>

                    <div
v-for="task in tasks" :key="task.upid"
                        class="p-3 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-xs font-mono text-text-muted flex items-center gap-1">
                                <span class="opacity-70">{{ formatDate(task.starttime) }}</span>
                                <span class="font-bold text-text-primary">{{ formatTime(task.starttime) }}</span>
                            </span>
                            <span
:class="getStatusColor(task.status)"
                                class="text-xs font-bold flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border">
                                <span v-if="!task.endtime" class="animate-pulse">● Running</span>
                                <span v-else>{{ task.status }}</span>
                            </span>
                        </div>

                        <div class="text-sm font-medium text-text-primary mb-0.5 break-words">
                            {{ task.type }} <span v-if="task.id" class="opacity-70">: {{ task.id }}</span>
                        </div>

                        <div class="flex justify-between items-center text-xs text-text-muted">
                            <span class="flex items-center gap-1">
                                <svg
class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                {{ task.user }}
                            </span>
                            <span
v-if="task.node"
                                class="bg-surface px-1.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                {{ task.node }}
                            </span>
                        </div>
                    </div>

                </div>

            </div>
        </Transition>
    </div>
</template>
