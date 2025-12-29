<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Máquinas</h1>

    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
    </div>

    <div v-else>
      <section class="mb-6 section-card p-4 rounded shadow">
        <div class="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div>
            <h2 class="font-bold mb-1">Clonar VM/CT existente</h2>
            <p class="text-sm muted">Clona una VM (QEMU) o contenedor (LXC) existente. Debes indicar nodo y VMID origen,
              y un nuevo VMID.</p>
          </div>
          <button @click="loadMachines" class="px-3 py-2 rounded btn-primary">Refrescar lista</button>
        </div>

        <form @submit.prevent="handleClone" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm">Tipo</label>
            <select v-model="cloneForm.type" class="w-full p-2 border rounded">
              <option value="qemu">VM (QEMU)</option>
              <option value="lxc">Contenedor (LXC)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">Nodo origen</label>
            <select v-model="cloneForm.sourceNode" class="w-full p-2 border rounded" required>
              <option value="" disabled>Selecciona nodo</option>
              <option v-for="n in nodes" :key="n.node" :value="n.node">{{ n.node }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">VMID origen (plantilla/base)</label>
            <input v-model.number="cloneForm.sourceId" type="number" min="1" class="w-full p-2 border rounded"
              required />
          </div>
          <div>
            <label class="block text-sm">Nuevo VMID</label>
            <input v-model.number="cloneForm.newId" type="number" min="1" class="w-full p-2 border rounded" required />
          </div>
          <div>
            <label class="block text-sm">Nombre nuevo</label>
            <input v-model="cloneForm.name" class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm">Pool (opcional)</label>
            <select v-model="cloneForm.pool" class="w-full p-2 border rounded">
              <option value="">Sin pool</option>
              <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">Nodo destino (opcional)</label>
            <select v-model="cloneForm.targetNode" class="w-full p-2 border rounded">
              <option value="">Igual que origen</option>
              <option v-for="n in nodes" :key="n.node" :value="n.node">{{ n.node }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">Storage destino (opcional)</label>
            <input v-model="cloneForm.storage" class="w-full p-2 border rounded" placeholder="p.ej. local-lvm" />
          </div>
          <div class="flex items-center gap-2">
            <input id="fullClone" v-model="cloneForm.full" type="checkbox" class="h-4 w-4" />
            <label for="fullClone" class="text-sm">Clonado completo (full copy)</label>
          </div>

          <div class="col-span-1 md:col-span-2 flex justify-end gap-2">
            <button type="button" @click="resetClone" class="px-4 py-2 rounded btn-muted">Limpiar</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded btn-positive">Clonar</button>
          </div>
        </form>
      </section>

      <section class="section-card p-4 rounded shadow">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 class="font-bold">Máquinas existentes</h2>
          <div class="flex flex-wrap gap-2">
            <input v-model="search" placeholder="Buscar por nombre o VMID" class="p-2 border rounded" />
            <select v-model="filterType" class="p-2 border rounded">
              <option value="all">Todos los tipos</option>
              <option value="qemu">VM (QEMU)</option>
              <option value="lxc">Contenedor (LXC)</option>
            </select>
            <select v-model="filterPool" class="p-2 border rounded">
              <option value="all">Todos los pools</option>
              <option value="none">Sin pool</option>
              <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
            </select>
            <button @click="loadMachines" class="px-3 py-2 rounded btn-primary">Refrescar</button>
          </div>
        </div>

        <div v-if="loadingList" class="text-sm muted">Cargando...</div>
        <div v-else-if="filteredMachines.length === 0" class="text-sm muted">No hay máquinas que coincidan con el
          filtro.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">VMID</th>
              <th class="p-2">Nombre</th>
              <th class="p-2">Tipo</th>
              <th class="p-2">Nodo</th>
              <th class="p-2">Estado</th>
              <th class="p-2">Pool</th>
              <th class="p-2">Uptime</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredMachines" :key="m.vmid + '-' + m.node" class="border-b">
              <td class="p-2">{{ m.vmid }}</td>
              <td class="p-2">{{ m.name || '-' }}</td>
              <td class="p-2 uppercase">{{ m.type }}</td>
              <td class="p-2">{{ m.node }}</td>
              <td class="p-2">{{ m.status || '-' }}</td>
              <td class="p-2">{{ m.pool || '—' }}</td>
              <td class="p-2">{{ formatUptime(m.uptime) }}</td>
              <td class="p-2 flex flex-wrap gap-2">
                <button @click="openEdit(m)" class="px-2 py-1 rounded btn-warning">Editar/Asignar</button>
                <button @click="removeMachine(m)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div v-if="editing" class="fixed inset-0 overlay-backdrop flex items-center justify-center">
        <div class="section-card p-6 rounded shadow w-full max-w-xl">
          <h3 class="font-bold mb-3">Editar máquina {{ editing.vmid }} ({{ editing.type.toUpperCase() }})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm">Nombre / Hostname</label>
              <input v-model="editing.name" class="w-full p-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm">Pool</label>
              <select v-model="editing.pool" class="w-full p-2 border rounded">
                <option value="">Sin pool</option>
                <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button @click="applyEdit" :disabled="saving" class="px-4 py-2 rounded btn-positive">Guardar</button>
            <button @click="closeEdit" class="px-4 py-2 rounded btn-muted">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Máquinas' })
import { ref, computed, onMounted, watch } from 'vue'

type Machine = {
  vmid: number
  name?: string
  node: string
  type: 'qemu' | 'lxc'
  status?: string
  pool?: string
  uptime?: number
}

type NodeInfo = { node: string; status?: string }

type CloneForm = {
  type: 'qemu' | 'lxc'
  sourceNode: string
  sourceId: number | null
  targetNode: string
  newId: number | null
  name: string
  pool: string
  storage: string
  full: boolean
}

type EditableMachine = {
  vmid: number
  node: string
  type: 'qemu' | 'lxc'
  name: string
  pool: string
  originalPool: string
}

type ProxmoxResponse<T> = {
  success?: boolean
  data?: T
  message?: string
  error?: unknown
}

const router = useRouter()
const {
  isAuthenticated,
  restoreSession,
  listVMResources,
  listPools,
  listNodes,
  updateMachineConfig,
  deleteMachine,
  cloneMachine,
  addVmToPool,
} = useProxmox()

const loadingList = ref(false)
const saving = ref(false)
const machines = ref<Machine[]>([])
const pools = ref<string[]>([])
const nodes = ref<NodeInfo[]>([])

const search = ref('')
const filterType = ref<'all' | 'qemu' | 'lxc'>('all')
const filterPool = ref<'all' | 'none' | string>('all')

const editing = ref<EditableMachine | null>(null)

const cloneForm = ref<CloneForm>({
  type: 'qemu',
  sourceNode: '',
  sourceId: null,
  targetNode: '',
  newId: null,
  name: '',
  pool: '',
  storage: '',
  full: true,
})

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) {
    loadInitial()
  }
})

watch(isAuthenticated, (val) => {
  if (val && machines.value.length === 0) loadInitial()
})

const loadInitial = async () => {
  await Promise.all([loadMachines(), loadPoolsList(), loadNodesList()])
}

const loadMachines = async () => {
  loadingList.value = true
  const res = (await listVMResources()) as ProxmoxResponse<Machine[]>
  loadingList.value = false
  if (res.success && res.data) {
    machines.value = res.data as Machine[]
  }
}

const loadPoolsList = async () => {
  const res = await listPools()
  if (res.success && res.data) pools.value = (res.data as { poolid: string }[]).map((p) => p.poolid)
}

const loadNodesList = async () => {
  const res = await listNodes()
  if (res.success && res.data) nodes.value = res.data as NodeInfo[]
}

const filteredMachines = computed<Machine[]>(() => {
  return machines.value.filter((m) => {
    if (filterType.value !== 'all' && m.type !== filterType.value) return false
    if (filterPool.value === 'none' && m.pool) return false
    if (filterPool.value !== 'all' && filterPool.value !== 'none' && m.pool !== filterPool.value) return false
    if (!search.value) return true
    const term = search.value.toLowerCase()
    return (
      m.name?.toLowerCase().includes(term) ||
      String(m.vmid).includes(term) ||
      m.node.toLowerCase().includes(term)
    )
  })
})

const formatUptime = (uptime?: number) => {
  if (!uptime) return '—'
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const openEdit = (m: Machine) => {
  editing.value = {
    vmid: m.vmid,
    node: m.node,
    type: m.type,
    name: m.name || '',
    pool: m.pool || '',
    originalPool: m.pool || '',
  }
}

const closeEdit = () => { editing.value = null }

const applyEdit = async () => {
  if (!editing.value) return
  saving.value = true
  const config: Record<string, unknown> = {}
  if (editing.value.type === 'qemu') config.name = editing.value.name || undefined
  else config.hostname = editing.value.name || undefined

  // Aplicar cambios de nombre/hostname si procede
  if (config.name !== undefined || config.hostname !== undefined) {
    const res = await updateMachineConfig(
      editing.value.node,
      editing.value.type,
      editing.value.vmid,
      config
    ) as ProxmoxResponse<unknown>
    if (res.success === false) {
      saving.value = false
      return alert('Error guardando: ' + (res.message || JSON.stringify(res)))
    }
  }

  // Asignar pool si cambió
  if (editing.value.pool && editing.value.pool !== editing.value.originalPool) {
    const resPool = await addVmToPool(editing.value.pool, editing.value.vmid) as ProxmoxResponse<unknown>
    if (resPool.success === false) {
      saving.value = false
      return alert('Error asignando pool: ' + (resPool.message || JSON.stringify(resPool)))
    }
  }

  saving.value = false
  closeEdit()
  await loadMachines()
}

const removeMachine = async (m: Machine) => {
  if (!confirm(`Eliminar ${m.type.toUpperCase()} ${m.vmid}? Esto es destructivo.`)) return
  saving.value = true
  const res = await deleteMachine(m.node, m.type, m.vmid) as ProxmoxResponse<unknown>
  saving.value = false
  if (res.success === false) return alert('Error al eliminar: ' + (res.message || JSON.stringify(res)))
  await loadMachines()
}

const handleClone = async () => {
  if (!cloneForm.value.sourceNode || !cloneForm.value.sourceId || !cloneForm.value.newId) {
    return alert('Nodo origen, VMID origen y nuevo VMID son obligatorios')
  }
  saving.value = true
  const payload: Record<string, unknown> = {
    newid: cloneForm.value.newId,
    name: cloneForm.value.name || undefined,
    pool: cloneForm.value.pool || undefined,
    full: cloneForm.value.full ? 1 : 0,
    target: cloneForm.value.targetNode || undefined,
    storage: cloneForm.value.storage || undefined,
  }

  const res = await cloneMachine(
    cloneForm.value.sourceNode,
    cloneForm.value.type,
    cloneForm.value.sourceId,
    payload
  ) as ProxmoxResponse<unknown>
  saving.value = false

  if (res.success === false) return alert('Error al clonar: ' + (res.message || JSON.stringify(res)))
  resetClone()
  await loadMachines()
}

const resetClone = () => {
  cloneForm.value = {
    type: 'qemu',
    sourceNode: '',
    sourceId: null,
    targetNode: '',
    newId: null,
    name: '',
    pool: '',
    storage: '',
    full: true,
  }
}
</script>
