<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Centro de Permisos</h1>
        <p class="text-text-muted text-sm mt-1">Control de Acceso (ACL) jerárquico</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadACLs"
          class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            :class="{ 'animate-spin': loading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Refrescar
        </button>
        <button @click="openCreateModal"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Asignar Permiso
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div class="flex-1 w-full relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" placeholder="Buscar por usuario, grupo o ruta..."
          class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div class="text-sm text-text-muted">
        <span class="font-bold text-primary">{{ flatACLs.length }}</span> reglas activas
      </div>
    </div>

    <!-- Permissions Grid (Grouped by Path) -->
    <div v-if="loading && aclGroups.length === 0" class="py-12 flex justify-center text-text-muted">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div v-else-if="aclGroups.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p class="text-lg font-medium">No se encontraron permisos</p>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- Each Group is a Path Card -->
      <div v-for="group in aclGroups" :key="group.path"
        class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div class="p-4 bg-muted-surface/30 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <svg v-if="group.path === '/'" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <svg v-else-if="group.path.includes('/vms/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <svg v-else-if="group.path.includes('/pool/')" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <folder class="w-5 h-5" />
              </svg>
            </div>
            <h3 class="font-mono text-lg font-bold text-text truncate" :title="group.path">{{ group.path }}</h3>
          </div>
          <button @click="openCreateModal(group.path)"
            class="text-xs px-2 py-1 rounded bg-background border border-border text-text-muted hover:text-primary transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Añadir
          </button>
        </div>

        <div class="divide-y divide-border">
          <div v-for="acl in group.items" :key="acl.ugid + acl.roleid"
            class="p-3 flex items-center justify-between hover:bg-muted-surface/10 transition-colors">
            <div class="flex items-center gap-3">
              <div
                class="flex flex-col items-center justify-center w-8 h-8 rounded bg-background border border-border text-text-muted text-xs font-bold uppercase">
                {{ acl.type === 'user' ? 'U' : (acl.type === 'group' ? 'G' : 'T') }}
              </div>
              <div>
                <div class="font-bold text-sm text-text">{{ acl.ugid }}</div>
                <div class="text-xs flex gap-2 mt-0.5">
                  <span
                    class="px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold tracking-wider text-[10px]">{{
                    acl.roleid }}</span>
                  <span class="text-text-muted">{{ acl.type === 'user' ? 'Usuario' : 'Grupo' }}</span>
                </div>
              </div>
            </div>

            <button @click="handleRemoveACL(acl)"
              class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
              title="Revocar permiso">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Create Permissions Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showModal = false">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <h2 class="text-xl font-bold text-text">Asignar Permiso</h2>
          <button @click="showModal = false" class="text-text-muted hover:text-text"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <form @submit.prevent="handleAssign" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Ruta (Path)</label>
            <input v-model="form.path" placeholder="Ej. /vms/100 o /" required
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text font-mono" />
            <p class="text-[10px] text-text-muted mt-1">Usa '/' para acceso raíz, o '/vms/ID' para máquinas.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-text-muted uppercase mb-1">Tipo Sujeto</label>
              <select v-model="form.subjectType"
                class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
                <option value="user">Usuario</option>
                <option value="group">Grupo</option>
                <option value="token">API Token</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-text-muted uppercase mb-1">Rol</label>
              <select v-model="form.role" required
                class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
                <option value="" disabled>Selecciona rol...</option>
                <option v-for="r in roles" :key="r.roleid" :value="r.roleid">{{ r.roleid }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">ID del Sujeto</label>
            <input v-model="form.subjectId" :placeholder="form.subjectType === 'group' ? 'my-group' : 'user@realm'"
              required
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
          </div>

          <!-- Propagate toggle could go here, propagate=1 is default and safest assumption for basic UI -->

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false"
              class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
            <button type="submit" :disabled="loading"
              class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Asignar</button>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
useHead({ title: 'Permisos ACL' })

// Types
interface FormState { path: string; role: string; subjectType: 'user' | 'group' | 'token'; subjectId: string }
interface ACL { path: string; roleid?: string; role?: string; type?: string; ugid?: string; userid?: string; group?: string; propagate?: number }
interface Role { roleid: string }

const router = useRouter()
const { listRoles, listACLs, createACL, deleteACL, restoreSession, isAuthenticated } = useProxmox()

const loading = ref(false)
const roles = ref<Role[]>([])
const acls = ref<ACL[]>([]) // Flat list
const search = ref('')

const showModal = ref(false)
const form = ref<FormState>({ path: '', role: '', subjectType: 'user', subjectId: '' })

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadData()
})

watch(isAuthenticated, (val) => { if (val && acls.value.length === 0) loadData() })

const loadData = async () => {
  loading.value = true
  const [rData, aData] = await Promise.all([listRoles(), listACLs()])

  if (rData.success) roles.value = (rData.data as Role[]) || []
  if (aData.success) acls.value = (aData.data as ACL[]) || []

  loading.value = false
}

const loadACLs = async () => {
  loading.value = true
  const res = await listACLs()
  loading.value = false
  if (res.success) acls.value = res.data as ACL[]
}

// Derived State
const flatACLs = computed(() => {
  // Normalize ACL objects for easier filtering
  return acls.value.map(a => {
    const ugid = a.ugid || a.userid || a.group || 'unknown'
    const type = a.type || (ugid.includes('@') ? 'user' : 'group')
    const roleid = a.roleid || a.role || 'unknown'
    return { ...a, ugid, type, roleid }
  }).filter(a => {
    if (!search.value) return true
    const term = search.value.toLowerCase()
    return a.path.toLowerCase().includes(term) || a.ugid.toLowerCase().includes(term) || a.roleid.toLowerCase().includes(term)
  })
})

const aclGroups = computed(() => {
  // Group by Path
  const groups: Record<string, any[]> = {}
  flatACLs.value.forEach(acl => {
    if (!groups[acl.path]) groups[acl.path] = []
    groups[acl.path].push(acl)
  })

  // Sort keys alphabetically but put '/' first usually? Or sort by path length.
  return Object.keys(groups).sort().map(path => ({
    path,
    items: groups[path]
  }))
})

// Actions
const openCreateModal = (pathPreselect?: string) => {
  form.value = {
    path: pathPreselect || '',
    role: '',
    subjectType: 'user',
    subjectId: ''
  }
  showModal.value = true
}

const handleAssign = async () => {
  const { path, role, subjectId, subjectType } = form.value
  if (!path || !role || !subjectId) return alert('Todos los campos son obligatorios')

  let normalizedPath = path.trim()
  if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath

  // Simple propagate default
  const opts: any = { propagate: 1 }
  if (subjectType === 'user') opts.users = subjectId
  else if (subjectType === 'group') opts.groups = subjectId
  else if (subjectType === 'token') opts.tokens = subjectId

  loading.value = true
  const res = await createACL(normalizedPath, role, opts)
  loading.value = false

  if (res.success === false) return alert('Error al asignar: ' + (res.message || JSON.stringify(res)))

  showModal.value = false
  await loadACLs()
}

const handleRemoveACL = async (acl: any) => {
  if (!confirm(`¿Revocar acceso ${acl.roleid} para ${acl.ugid} en ${acl.path}?`)) return

  const opts: any = {}
  if (acl.type === 'user') opts.users = acl.ugid
  else if (acl.type === 'group') opts.groups = acl.ugid

  loading.value = true
  const res = await deleteACL(acl.path, acl.roleid, opts)
  loading.value = false

  if (res.success === false) return alert('Error al eliminar: ' + (res.message || JSON.stringify(res)))
  await loadACLs()
}

</script>
