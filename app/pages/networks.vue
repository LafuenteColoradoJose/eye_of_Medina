<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
    <div class="p-6 max-w-[1920px] mx-auto space-y-6">

        <!-- Header & Node Selector -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-text">Topología de Red</h1>
                <p class="text-text-muted text-sm mt-1">Visualización del stack de red en <span
                        class="text-primary font-mono">{{ selectedNode }}</span></p>
            </div>
            <div class="flex gap-3">
                <div class="relative group">
                    <div
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                            <line x1="6" y1="6" x2="6" y2="6" />
                            <line x1="6" y1="18" x2="6" y2="18" />
                        </svg>
                    </div>
                    <select v-model="selectedNode" @change="loadNetworks"
                        class="appearance-none pl-16 pr-10 py-2.5 rounded-lg bg-card border border-border text-text hover:border-primary/50 transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer min-w-[170px] font-bold"
                        style="padding-left: 3.5rem;">
                        <option v-for="node in nodes" :key="node.node" :value="node.node">{{ node.node }}</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <button @click="loadNetworks"
                    class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
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


        <div v-if="loading && networks.length === 0" class="py-20 flex justify-center text-text-muted">
            <svg class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </div>

        <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

            <!-- Logical Layer (Bridges, Bonds, VLANs) -->
            <div class="col-span-1 xl:col-span-2 space-y-6">
                <h2 class="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="text-primary">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6" y2="6" />
                        <line x1="6" y1="18" x2="6" y2="18" />
                    </svg>
                    Capa Lógica & Puentes
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="net in logicalNetworks" :key="net.iface"
                        class="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative group">
                        <!-- Status Line -->
                        <div class="absolute top-0 left-0 w-1 h-full" :class="net.active ? 'bg-positive' : 'bg-muted'">
                        </div>

                        <div class="p-5">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-text font-mono flex items-center gap-2">
                                        {{ net.iface }}
                                    </h3>
                                    <div class="flex gap-2 mt-2">
                                        <span
                                            class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">{{
                                                net.type }}</span>
                                        <span v-if="net.autostart"
                                            class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-border bg-muted-surface text-text-muted">Autostart</span>
                                    </div>
                                </div>
                                <!-- IP Address Chip -->
                                <div v-if="net.address || net.address6"
                                    class="w-full sm:w-auto text-left sm:text-right mt-1 sm:mt-0">
                                    <div v-if="net.address"
                                        class="inline-block text-sm font-mono text-text bg-muted-surface/50 px-2 py-1 rounded border border-border/50 break-all">
                                        {{ net.address }}{{ net.cidr ? '/' + net.cidr : '' }}
                                    </div>
                                    <div v-if="net.address6" class="text-xs font-mono text-text-muted mt-1 break-all"
                                        :title="net.address6">
                                        {{ net.address6 }}
                                    </div>
                                </div>
                            </div>

                            <!-- Bridge Ports Visualization -->
                            <div v-if="net.bridge_ports || net.slaves"
                                class="mt-4 p-3 bg-background rounded-lg border border-border/50 relative">
                                <div
                                    class="absolute -top-2 left-3 px-1 bg-card text-[10px] font-bold text-text-muted uppercase">
                                    Puertos Conectados</div>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    <div v-for="port in splitPorts(net.bridge_ports || net.slaves)" :key="port"
                                        class="flex items-center gap-1.5 px-2 py-1 rounded border bg-muted-surface text-text text-xs font-mono">
                                        <div class="w-1.5 h-1.5 rounded-full"
                                            :class="isPortActive(port) ? 'bg-positive' : 'bg-danger'"></div>
                                        {{ port }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="net.comments"
                                class="mt-3 text-sm text-text-muted italic border-t border-border/30 pt-2">
                                {{ net.comments }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="logicalNetworks.length === 0"
                    class="p-8 border-2 border-dashed border-border rounded-xl text-center text-text-muted">
                    No hay interfaces lógicas (bridges/bonds) configuradas.
                </div>
            </div>

            <!-- Physical Layer -->
            <div class="col-span-1 space-y-6">
                <h2 class="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="text-warning">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    Interfaces Físicas
                </h2>

                <div class="space-y-3">
                    <div v-for="net in physicalNetworks" :key="net.iface"
                        class="bg-card border border-border rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
                        <div class="flex items-center gap-4">
                            <!-- Icon Status -->
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                :class="net.active ? 'bg-positive/10 text-positive' : 'bg-danger/10 text-danger'">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-text font-mono text-lg leading-tight">{{ net.iface }}</h3>
                                <p class="text-xs text-text-muted mt-0.5">{{ net.active ? 'Link Up' : 'No Link' }} <span
                                        v-if="net.type !== 'eth'" class="text-xs opacity-75">({{ net.type }})</span></p>
                            </div>
                        </div>

                        <!-- Connection Chip -->
                        <div v-if="getUpstream(net.iface)"
                            class="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20 font-bold flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                            {{ getUpstream(net.iface) }}
                        </div>
                        <div v-else
                            class="text-xs px-2 py-1 rounded bg-muted-surface text-text-muted border border-border">
                            Unassigned
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
useHead({ title: 'Topología de Red' })

const router = useRouter()
const { isAuthenticated, restoreSession, listNodes, getNodeNetworks } = useProxmox()

// Types
type NodeInfo = { node: string; status: string }
type NetworkInterface = {
    iface: string
    type: string // eth, bridge, bond, vlan, etc.
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

onMounted(async () => {
    restoreSession()
    if (isAuthenticated.value) await loadNodes()
})

watch(isAuthenticated, (val) => { if (val) loadNodes() })

const loadNodes = async () => {
    try {
        const res = await listNodes()
        if (res.success && res.data) {
            nodes.value = res.data as NodeInfo[]
            if (!selectedNode.value && nodes.value.length > 0) {
                const activeNode = nodes.value.find(n => n.status === 'online') || nodes.value[0]
                if (activeNode) {
                    selectedNode.value = activeNode.node
                    loadNetworks()
                }
            }
        }
    } catch (e) {
        console.error(e)
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

// Computeds for Organization
const logicalNetworks = computed(() => {
    return networks.value.filter(n => ['bridge', 'bond', 'vlan', 'OVSBridge', 'OVSBond'].includes(n.type)).sort((a, b) => a.iface.localeCompare(b.iface))
})

const physicalNetworks = computed(() => {
    return networks.value.filter(n => ['eth', 'unknown', 'loopback'].includes(n.type) || !['bridge', 'bond', 'vlan', 'OVSBridge', 'OVSBond'].includes(n.type)).sort((a, b) => a.iface.localeCompare(b.iface))
})

// Helpers
const splitPorts = (portsStr?: string) => {
    if (!portsStr) return []
    return portsStr.split(/\s+/).filter(p => p)
}

const isPortActive = (portName: string) => {
    const net = networks.value.find(n => n.iface === portName)
    return net ? net.active : false
}

const getUpstream = (iface: string) => {
    // Find which bridge/bond has this interface as a member
    for (const net of logicalNetworks.value) {
        const ports = splitPorts(net.bridge_ports || net.slaves)
        if (ports.includes(iface)) return net.iface
    }
    return null
}

</script>
