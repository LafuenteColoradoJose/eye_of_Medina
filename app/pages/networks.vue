<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
    <div class="p-6 max-w-[1920px] mx-auto space-y-6">

        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-text">Gestión de Red</h1>
                <p class="text-text-muted text-sm mt-1">Explorador de stack de red en <span
                        class="text-primary font-mono">{{ selectedNode }}</span></p>
            </div>

            <div class="flex gap-3 items-center">
                <!-- Node Selector -->
                <div class="relative group">
                    <div
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors pointer-events-none">
                        <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                            <line x1="6" y1="6" x2="6" y2="6" />
                            <line x1="6" y1="18" x2="6" y2="18" />
                        </svg>
                    </div>
                    <select
v-model="selectedNode"
                        class="appearance-none pl-12 pr-10 py-2 rounded-lg bg-card border border-border text-text hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer min-w-[170px] font-bold text-sm"
                        style="padding-left: 3.5rem">
                        <option v-for="node in nodes" :key="node.node" :value="node.node">{{ node.node }}</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <svg
xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <button
@click="handleRefresh"
                    class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2 shadow-sm text-sm">
                    <svg
xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        :class="{ 'animate-spin': loading }">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                    </svg>
                    Refrescar
                </button>
            </div>
        </div>

        <!-- TABS Navigation -->
        <div class="border-b border-border flex gap-6">
            <button
@click="activeTab = 'list'" class="pb-3 px-1 text-sm font-bold transition-all relative"
                :class="activeTab === 'list' ? 'text-primary' : 'text-text-muted hover:text-text'">
                Resumen / Diagnóstico
                <div
v-if="activeTab === 'list'"
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
            </button>

            <button
@click="activeTab = 'topology'"
                class="pb-3 px-1 text-sm font-bold transition-all relative flex items-center gap-2"
                :class="activeTab === 'topology' ? 'text-primary' : 'text-text-muted hover:text-text'">
                <svg
xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Mapa de Topología
                <div
v-if="activeTab === 'topology'"
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
            </button>
        </div>

        <!-- Content Area -->
        <div class="min-h-[400px]">
            <Transition name="fade" mode="out-in">
                <!-- VIEW 1: LIST -->
                <div v-if="activeTab === 'list'" key="list">
                    <NetworkList :networks="networks" :loading="loading" />
                </div>

                <!-- VIEW 2: TOPOLOGY -->
                <div v-else key="topology">
                    <NetworkTopology :target-node="selectedNode" />
                </div>
            </Transition>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import NetworkList from '~/components/networks/NetworkList.vue'
import NetworkTopology from '~/components/networks/NetworkTopology.vue'

useHead({ title: 'Topología de Red' })

const { isAuthenticated, restoreSession, listNodes, getNodeNetworks, listVMResources } = useProxmox()

// Types
type NodeInfo = { node: string; status: string }
type NetworkInterface = {
    iface: string
    type: string
    active: boolean
    autostart?: boolean
    address?: string
    address6?: string
    cidr?: string
    gateway?: string
    bridge_ports?: string
    slaves?: string
    comments?: string
}

// State
const nodes = ref<NodeInfo[]>([])
const selectedNode = ref<string>('')
const networks = ref<NetworkInterface[]>([])
const loading = ref(false)
const activeTab = ref<'list' | 'topology'>('list')

onMounted(() => {
    restoreSession()
})

// Watch auth state - only execute on client side
watch(isAuthenticated, async (val) => {
    if (val && import.meta.client) {
        await fetchNodes()
    }
}, { immediate: true })

watch(selectedNode, (val) => {
    if (val && import.meta.client) loadNetworks()
})

async function fetchNodes() {
    try {
        const res = await listNodes()

        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
            nodes.value = res.data as NodeInfo[]
        } else {
            console.warn('Fallback al listar recursos para obtener nodos...')
            const resResources = await listVMResources()
            if (resResources.success && resResources.data) {
                const uniqueNodes = Array.from(new Set(
                    (resResources.data as any[])
                        .filter(r => r.node)
                        .map(r => r.node)
                ))
                nodes.value = uniqueNodes.map(n => ({ node: n, status: 'online' })) as NodeInfo[]
            }
        }

        if (!selectedNode.value && nodes.value.length > 0) {
            const activeNode = nodes.value.find(n => n.status === 'online') || nodes.value[0]
            if (activeNode) {
                selectedNode.value = activeNode.node
            }
        }

        // Safety: ensure networks are loaded
        if (selectedNode.value) {
            await loadNetworks()
        }
    } catch (e) {
        console.error('Error fatal cargando nodos:', e)
    }
}

const loadNetworks = async () => {
    if (!selectedNode.value) return
    loading.value = true
    networks.value = []
    try {
        const res = await getNodeNetworks(selectedNode.value)
        if (res.success && res.data) {
            networks.value = res.data as NetworkInterface[]
        }
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

const handleRefresh = () => {
    loadNetworks()
    // Si la topología tuviera un método de refresh, podríamos llamarlo aquí usando ref o un bus de eventos
    // Por ahora, al cambiar de tab o nodo se refrescará
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
