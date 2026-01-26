<template>
    <div class="h-[600px] w-full border border-border rounded-xl overflow-hidden bg-[#1a1a1a] relative">
        <VueFlow v-model:nodes="nodes" v-model:edges="edges" :class="{ dark: true }" class="basic-flow"
            :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="4" fit-view-on-init>
            <Background pattern-color="#333" :gap="16" />
            <Controls />

            <!-- Custom Nodes can go here later -->
        </VueFlow>

        <!-- Overlay Loading -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="text-xs text-text-muted font-mono">Generando mapa...</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

// Import styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

const { proxmoxRequest, getNodeNetworks, listVMResources } = useProxmox()
const { fitView } = useVueFlow()

const props = defineProps<{
    targetNode: string
}>()

const loading = ref(false)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

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
        const netRes = await getNodeNetworks(props.targetNode)
        const allIfaces = (netRes.success ? netRes.data : []) as any[]

        // Identify Bridges and Physical Ports
        const bridges = allIfaces.filter(n => n.type === 'bridge')
        // Physical ports are those that are NOT bridges/bonds/vlans OR are listed as bridge_ports
        // Simplification: We will link Uplink -> Bridge directly if no physical port found, or Uplink -> Phys -> Bridge

        // 2. Fetch VMs/LXC on this node
        const clusterRes = await listVMResources()
        const nodeVms = (clusterRes.success ? clusterRes.data : [])
            .filter((r: any) => r.node === props.targetNode && (r.type === 'qemu' || r.type === 'lxc')) as any[]

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
                    config: (configRes.success ? configRes.data : {}) as Record<string, any>
                }
            })
        )

        // --- GRAPH CONSTRUCTION ---

        const newNodes: Node[] = []
        const newEdges: Edge[] = []
        let yCounter = 0

        // LEVEL 0: Internet / Uplink
        newNodes.push({
            id: 'uplink',
            type: 'input', // Input node
            label: 'Internet / Uplink',
            position: { x: 0, y: 0 },
            style: { background: '#2563eb', color: 'white', borderColor: '#1d4ed8', width: '150px' }
        })

        // LEVEL 1: Bridges (Vertical Stack)
        // We position bridges in a column.

        let bridgeY = -50

        bridges.forEach((br, idx) => {
            bridgeY += 150 // Spacing between bridges

            // Bridge Node
            newNodes.push({
                id: br.iface,
                label: `${br.iface}\n(${br.address || 'L2'})`,
                position: { x: LAYER_WIDTH, y: bridgeY },
                style: { background: '#1e293b', color: '#e2e8f0', borderColor: '#475569', width: '180px' },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            })

            // Connect Uplink -> Bridge (Conceptually)
            newEdges.push({
                id: `e-uplink-${br.iface}`,
                source: 'uplink',
                target: br.iface,
                animated: true,
                style: { stroke: '#64748b' }
            })

            // Find VMs connected to this bridge
            const connectedVms = vmConfigs.filter(vm => {
                // Check net0, net1, net2...
                const config = vm.config
                if (!config) return false
                return Object.keys(config).some(key => {
                    if (key.startsWith('net')) {
                        const val = String(config[key])
                        return val.includes(`bridge=${br.iface}`)
                    }
                    return false
                })
            })

            // LEVEL 2: VMs (Fan out from Bridge)
            let vmY = bridgeY - ((connectedVms.length * NODE_HEIGHT_SPACING) / 2) + 20

            connectedVms.forEach(vm => {
                vmY += NODE_HEIGHT_SPACING

                const isRunning = vm.status === 'running'

                newNodes.push({
                    id: `vm-${vm.vmid}`,
                    label: `${vm.vmid} - ${vm.name}`,
                    position: { x: LAYER_WIDTH * 2.5, y: vmY },
                    sourcePosition: Position.Left,
                    targetPosition: Position.Left, // Connect left-to-left looks odd, default is good
                    style: {
                        background: isRunning ? '#064e3b' : '#3f3f46', // Green vs Gray
                        color: isRunning ? '#a7f3d0' : '#a1a1aa',
                        borderColor: isRunning ? '#059669' : '#52525b',
                        opacity: isRunning ? 1 : 0.7,
                        width: '200px'
                    },
                })

                newEdges.push({
                    id: `e-${br.iface}-${vm.vmid}`,
                    source: br.iface,
                    target: `vm-${vm.vmid}`,
                    type: 'smoothstep', // Orthogonal lines
                    animated: isRunning, // Only animate active traffic lines
                    style: { stroke: isRunning ? '#10b981' : '#52525b' }
                })
            })
        })

        nodes.value = newNodes
        edges.value = newEdges

        // Center graph after rendering
        setTimeout(() => fitView(), 100)

    } catch (e) {
        console.error("Topology Error:", e)
    } finally {
        loading.value = false
    }
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
