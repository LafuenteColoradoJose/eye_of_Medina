<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4 bg-card border border-border p-3 rounded-xl shadow-sm">
            <div class="flex-1 relative max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    style="padding-left: 2.5rem;"
                    class="w-full bg-background border border-border rounded-lg pr-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors" 
                    placeholder="Buscar VM por nombre o ID..."
                >
            </div>
            <div class="flex items-center gap-2">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                        v-model="hideOffline" 
                        type="checkbox" 
                        class="rounded border-border text-primary focus:ring-primary bg-background w-4 h-4"
                    >
                    <span class="text-sm text-text font-medium">Ocultar apagadas</span>
                </label>
            </div>
        </div>

        <div class="h-[600px] w-full border border-border rounded-xl overflow-hidden bg-[#1a1a1a] relative">
            <VueFlow
:nodes="nodes" :edges="edges" @node-click="onNodeClick" :class="{ dark: true }" class="basic-flow"
                :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="4" fit-view-on-init>
                <Background pattern-color="#333" :gap="16" />
                <Controls />
                <MiniMap 
                    pannable 
                    zoomable 
                    node-color="#3f3f46"
                    mask-color="rgba(0, 0, 0, 0.7)"
                    class="!bg-card !border-border rounded-lg shadow-lg"
                />

                <!-- Custom Nodes can go here later -->
            </VueFlow>

            <!-- Overlay Loading -->
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                <div class="flex flex-col items-center gap-2">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                    <span class="text-xs text-text-muted font-mono">Generando mapa...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

// Import styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const { proxmoxRequest, getNodeNetworks, listVMResources } = useProxmox()
const { fitView } = useVueFlow()

const props = defineProps<{
    targetNode: string
}>()

const loading = ref(false)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// Raw data state
const fetchedBridges = ref<any[]>([])
const fetchedVms = ref<any[]>([])
const expandedBridges = ref<Record<string, boolean>>({})

// Filters
const searchQuery = ref('')
const hideOffline = ref(false)

// Re-apply layout when filters change
watch([searchQuery, hideOffline], () => {
    updateLayout()
    setTimeout(() => fitView({ duration: 500 }), 50)
})

const onNodeClick = (event: any) => {
    const node = event.node
    if (node.data && node.data.isBridge) {
        const bridgeId = node.data.bridgeId
        expandedBridges.value[bridgeId] = !expandedBridges.value[bridgeId]
        updateLayout()
        setTimeout(() => fitView({ duration: 500 }), 50)
    }
}

// --- Constants ---
const LAYER_WIDTH = 300
const NODE_HEIGHT_SPACING = 80

// --- Logic ---

onMounted(() => {
    if (props.targetNode) buildTopology()
})

watch(() => props.targetNode, () => {
    buildTopology()
})

const buildTopology = async () => {
    if (!props.targetNode) return
    loading.value = true

    // Reset Graph
    nodes.value = []
    edges.value = []

    try {
        // 1. Fetch Node Networks (Bridges & Ports)
        // Domain types
        interface InterfaceInfo { iface: string; type?: string; address?: string }
        interface VMInfo { vmid: string; name?: string; status?: string; type?: string }
        type VMConfig = Record<string, unknown>

        const netRes = await getNodeNetworks(props.targetNode)
        const allIfaces = (netRes.success ? netRes.data : []) as InterfaceInfo[]

        // Identify Bridges and Physical Ports (Standard Linux Bridge OR Open vSwitch Bridge)
        const bridges = allIfaces.filter(n => n.type === 'bridge' || n.type === 'OVSBridge')
        // Physical ports are those that are NOT bridges/bonds/vlans OR are listed as bridge_ports
        // Simplification: We will link Uplink -> Bridge directly if no physical port found, or Uplink -> Phys -> Bridge

        // 2. Fetch VMs/LXC on this node
        const clusterRes = await listVMResources()
        const nodeVms = (clusterRes.success ? clusterRes.data : [])
            .filter((r: unknown) => {
                const item = r as Record<string, unknown>
                return item.node === props.targetNode && (item.type === 'qemu' || item.type === 'lxc')
            }) as VMInfo[]

        // 3. Fetch VM Configs (Parallel Limit could be needed for large clusters, simplified here)
        // We need to know which bridge each VM is connected to.
        const vmConfigs = await Promise.all(
            nodeVms.map(async (vm) => {
                const type = vm.type === 'qemu' ? 'qemu' : 'lxc'
                const configRes = await proxmoxRequest(`/nodes/${props.targetNode}/${type}/${vm.vmid}/config`, 'GET')
                return {
                    vmid: vm.vmid,
                    name: vm.name,
                    status: vm.status,
                    type: vm.type,
                    config: (configRes.success ? configRes.data : {}) as VMConfig
                }
            })
        )

        fetchedBridges.value = bridges
        fetchedVms.value = vmConfigs
        expandedBridges.value = {} // Collapse all by default
        
        updateLayout()
        setTimeout(() => fitView(), 100)

    } catch (e) {
        console.error("Topology Error:", e)
    } finally {
        loading.value = false
    }
}

const updateLayout = () => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []

        // LEVEL 0: Internet / Uplink
        newNodes.push({
            id: 'uplink',
            type: 'input', // Input node
            label: 'Internet / Uplink',
            position: { x: 0, y: 0 },
            style: { background: '#2563eb', color: 'white', borderColor: '#1d4ed8', width: '150px' }
        })

        // LEVEL 1: Bridges & VMs (Dynamic Grid Layout)
        let currentY = 0
        const COLS = 3
        const NODE_WIDTH_SPACING = 220
        const NODE_HEIGHT_SPACING = 100

        fetchedBridges.value.forEach((br) => {
            // Find VMs connected to this bridge
            let connectedVms = fetchedVms.value.filter(vm => {
                const config = vm.config
                if (!config) return false
                return Object.keys(config).some(key => {
                    if (key.startsWith('net')) {
                        return String(config[key]).includes(`bridge=${br.iface}`)
                    }
                    return false
                })
            })

            const totalVms = connectedVms.length
            const activeVmsCount = connectedVms.filter(vm => vm.status === 'running').length
            const hasActivity = activeVmsCount > 0

            // Apply filters
            if (hideOffline.value) {
                connectedVms = connectedVms.filter(vm => vm.status === 'running')
            }
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase()
                connectedVms = connectedVms.filter(vm => 
                    (vm.name || '').toLowerCase().includes(query) || 
                    String(vm.vmid).includes(query)
                )
            }

            const isExpanded = !!expandedBridges.value[br.iface] || searchQuery.value.length > 0

            // Calculate bounding box for this bridge's cluster
            let clusterHeight = 100 // Minimum height
            if (isExpanded && connectedVms.length > 0) {
                const rows = Math.ceil(connectedVms.length / COLS)
                clusterHeight = Math.max(rows * NODE_HEIGHT_SPACING, 100) 
            }
            
            // Center the bridge vertically relative to its VMs
            const bridgeY = currentY + (clusterHeight / 2) - 25

            // Bridge Node
            const expandIcon = isExpanded ? '[-]' : '[+]'
            const statusIcon = hasActivity ? '🟢' : '⚪'

            newNodes.push({
                id: br.iface,
                label: `${br.iface} ${expandIcon}\n(${statusIcon} ${activeVmsCount}/${totalVms} activas)`,
                position: { x: LAYER_WIDTH, y: bridgeY },
                data: { isBridge: true, bridgeId: br.iface },
                style: { 
                    background: '#1e293b', 
                    color: '#e2e8f0', 
                    borderColor: hasActivity ? '#10b981' : '#475569', 
                    width: '180px', 
                    cursor: 'pointer' 
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            })

            // Connect Uplink -> Bridge
            newEdges.push({
                id: `e-uplink-${br.iface}`,
                source: 'uplink',
                target: br.iface,
                animated: hasActivity,
                style: { stroke: hasActivity ? '#3b82f6' : '#475569' }
            })

            // Place VMs in a grid ONLY if expanded
            if (isExpanded) {
                const startVmY = currentY
                
                connectedVms.forEach((vm, index) => {
                    const col = index % COLS
                    const row = Math.floor(index / COLS)
                    
                    const vmX = (LAYER_WIDTH * 2.5) + (col * NODE_WIDTH_SPACING)
                    const vmY = startVmY + (row * NODE_HEIGHT_SPACING)

                    const isRunning = vm.status === 'running'
                    const isLxc = vm.type === 'lxc'

                    newNodes.push({
                        id: `vm-${vm.vmid}`,
                        label: `${isLxc ? '📦' : '🖥️'} ${vm.name}\n${isLxc ? '(CT)' : '(VM)'} ${vm.vmid}`,
                        position: { x: vmX, y: vmY },
                        sourcePosition: Position.Left,
                        targetPosition: Position.Left,
                        data: { isVm: true },
                        style: {
                            background: isRunning ? (isLxc ? '#0e7490' : '#064e3b') : '#3f3f46',
                            color: '#f0f9ff',
                            borderColor: isRunning ? (isLxc ? '#22d3ee' : '#059669') : '#52525b',
                            opacity: isRunning ? 1 : 0.6,
                            width: '180px',
                            borderRadius: isLxc ? '12px' : '2px',
                            borderStyle: isLxc ? 'dashed' : 'solid'
                        },
                    })

                    newEdges.push({
                        id: `e-${br.iface}-${vm.vmid}`,
                        source: br.iface,
                        target: `vm-${vm.vmid}`,
                        type: 'default', // Bezier curves instead of smoothstep
                        animated: isRunning,
                        style: { stroke: isRunning ? (isLxc ? '#22d3ee' : '#10b981') : '#52525b' }
                    })
                })
            }

            // Push Y cursor down for the next bridge cluster
            currentY += clusterHeight + 80 
        })

        // Finally, position the uplink node vertically in the center of all bridges
        const uplinkNode = newNodes.find(n => n.id === 'uplink')
        if (uplinkNode) {
            uplinkNode.position.y = (currentY / 2) - 50
        }

        nodes.value = newNodes
        edges.value = newEdges
}

</script>

<style>
/* Vue Flow Dark Theme Overrides */
.vue-flow__node {
    background: var(--color-card);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.vue-flow__edge-path {
    stroke: var(--color-text-muted);
}
</style>
