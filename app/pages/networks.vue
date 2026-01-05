<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Gestión de Redes</h1>

        <div v-if="!isAuthenticated" class="alert p-4 mb-4">
            <p class="font-bold">No estás autenticado</p>
            <p>Por favor, inicia sesión primero.</p>
            <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
        </div>

        <div v-else>
            <!-- Selector de Nodo -->
            <section class="mb-6 section-card p-4 rounded shadow">
                <label class="block text-sm font-bold mb-2">Selecciona un Nodo:</label>
                <div class="flex gap-4 items-center">
                    <select v-model="selectedNode" class="p-2 border rounded w-full md:w-auto min-w-[200px]"
                        @change="loadNetworks">
                        <option v-for="node in nodes" :key="node.node" :value="node.node">
                            {{ node.node }} ({{ node.status }})
                        </option>
                    </select>
                    <button @click="loadNetworks" class="px-3 py-2 rounded btn-primary" :disabled="!selectedNode">
                        Refrescar
                    </button>
                </div>
            </section>

            <!-- Tabla de Redes -->
            <section v-if="networks.length > 0" class="section-card p-4 rounded shadow">
                <h2 class="font-bold mb-4">Interfaces de red en {{ selectedNode }}</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left border-b">
                                <th class="p-2">Interfaz</th>
                                <th class="p-2">Tipo</th>
                                <th class="p-2">Estado</th>
                                <th class="p-2">Autostart</th>
                                <th class="p-2">Dirección IPv4/CIDR</th>
                                <th class="p-2">Gateway</th>
                                <th class="p-2">Puertos/Slaves</th>
                                <th class="p-2">Comentarios</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="net in networks" :key="net.iface"
                                class="border-b hover:bg-white/5 transition-colors">
                                <td class="p-2 font-mono font-bold">{{ net.iface }}</td>
                                <td class="p-2">
                                    <span :class="getTypeBadgeClass(net.type)">{{ net.type }}</span>
                                </td>
                                <td class="p-2">
                                    <span :class="net.active ? 'text-green-400' : 'text-gray-400'">
                                        {{ net.active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="p-2">{{ net.autostart ? 'Sí' : 'No' }}</td>
                                <td class="p-2 font-mono">{{ net.address }} {{ net.cidr ? '/' + net.cidr : '' }}</td>
                                <td class="p-2 font-mono">{{ net.gateway || '-' }}</td>
                                <td class="p-2 text-xs max-w-[200px] truncate" :title="net.bridge_ports || net.slaves">
                                    {{ net.bridge_ports || net.slaves || '-' }}
                                </td>
                                <td class="p-2 italic text-gray-400">{{ net.comments || '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div v-else-if="selectedNode && !loading" class="text-center p-8 text-gray-400">
                No se encontraron interfaces de red para este nodo.
            </div>

            <div v-if="loading" class="text-center p-8">
                Cargando redes...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

useHead({ title: 'Redes - Eye of Medina' })

const router = useRouter()
const {
    isAuthenticated,
    restoreSession,
    listNodes,
    getNodeNetworks
} = useProxmox()

type NodeInfo = {
    node: string
    status: string
    // otros campos...
}

type NetworkInterface = {
    iface: string
    type: string // eth, bridge, bond, vlan, etc.
    active: boolean
    autostart?: boolean
    address?: string
    cidr?: string
    gateway?: string
    bridge_ports?: string // para bridges
    slaves?: string // para bonds
    comments?: string
    // otros campos...
}

// Estado
const nodes = ref<NodeInfo[]>([])
const selectedNode = ref<string>('')
const networks = ref<NetworkInterface[]>([])
const loading = ref(false)

onMounted(async () => {
    restoreSession()
    if (isAuthenticated.value) {
        await loadNodes()
    }
})

// Recargar si cambia autenticación
watch(isAuthenticated, (val) => {
    if (val) loadNodes()
})

const loadNodes = async () => {
    try {
        const res = await listNodes()
        if (res.success && res.data) {
            nodes.value = res.data as NodeInfo[]
            // Seleccionar el primer nodo online por defecto si no hay seleccionado
            if (!selectedNode.value && nodes.value.length > 0) {
                const activeNode = nodes.value.find(n => n.status === 'online') || nodes.value[0]
                if (activeNode) {
                    selectedNode.value = activeNode.node
                    loadNetworks()
                }
            }
        }
    } catch (e) {
        console.error('Error cargando nodos:', e)
    }
}

const loadNetworks = async () => {
    if (!selectedNode.value) return

    loading.value = true
    networks.value = [] // Limpiar anterior

    try {
        const res = await getNodeNetworks(selectedNode.value)
        if (res.success && res.data) {
            networks.value = res.data as NetworkInterface[]
            // Ordenar: Bridges primero, luego activos, luego por nombre
            networks.value.sort((a, b) => {
                if (a.type === 'bridge' && b.type !== 'bridge') return -1
                if (a.type !== 'bridge' && b.type === 'bridge') return 1
                return a.iface.localeCompare(b.iface)
            })
        } else {
            console.error('Error al cargar redes:', res.message)
        }
    } catch (error) {
        console.error('Excepción al cargar redes:', error)
    } finally {
        loading.value = false
    }
}

// Utilidades de UI
const getTypeBadgeClass = (type: string) => {
    switch (type) {
        case 'bridge': return 'px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs uppercase font-bold border border-blue-500/30'
        case 'bond': return 'px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs uppercase font-bold border border-purple-500/30'
        case 'eth': return 'px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-xs uppercase font-bold border border-green-500/30'
        case 'vlan': return 'px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs uppercase font-bold border border-orange-500/30'
        default: return 'px-2 py-0.5 rounded bg-gray-500/20 text-gray-300 text-xs uppercase font-bold border border-gray-500/30'
    }
}
</script>
