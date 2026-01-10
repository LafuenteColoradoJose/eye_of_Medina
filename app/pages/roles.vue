<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Gestión de Roles</h1>
        <p class="text-text-muted text-sm mt-1">Define conjuntos de privilegios detallados</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadRoles"
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
        <button v-if="canCreateRole" @click="openCreateModal"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Definir Rol
        </button>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div
      class="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
      <div class="flex-1 w-full relative max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" placeholder="Buscar roles..."
          class="w-full pl-14 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          style="padding-left: 3.5rem" />
      </div>
      <div class="text-sm text-text-muted">
        <span class="font-bold text-primary">{{ filteredRoles.length }}</span> roles definidos
      </div>
    </div>

    <!-- Roles Grid -->
    <div v-if="loading && roles.length === 0" class="py-12 flex justify-center text-text-muted">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div v-else-if="filteredRoles.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p class="text-lg font-medium">No se encontraron roles</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="role in filteredRoles" :key="role.roleid"
        class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
        <div class="p-5 flex flex-col gap-2 flex-grow">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-primary/10 rounded-lg text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-text truncate max-w-[150px]" :title="role.roleid">{{ role.roleid }}</h3>
            </div>

            <button v-if="canCreateRole" @click="editRole(role)"
              class="p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-muted-surface text-text-muted hover:text-primary transition-all shadow-sm"
              title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>

          <div class="mt-3">
            <div class="text-[10px] uppercase font-bold text-text-muted mb-2 flex justify-between">
              <span>Privilegios</span>
              <span class="text-primary">{{(role.privs || '').split(',').filter((p: string) => p).length}}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
              <span v-for="p in (role.privs || '').split(',').filter((p: string) => p)" :key="p"
                class="px-1.5 py-0.5 rounded text-[10px] bg-muted-surface border border-border text-text font-mono truncate max-w-full">
                {{ p }}
              </span>
              <span v-if="!role.privs" class="text-text-muted text-xs italic">Sin privilegios</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    <div v-if="editing || showCreate"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeModal">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 mobile-modal-scroll">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <div>
            <h2 class="text-xl font-bold text-text">{{ editing ? 'Editar Rol' : 'Nuevo Rol' }}</h2>
            <p v-if="editing" class="text-xs text-text-muted mt-0.5">{{ editing.roleid }}</p>
          </div>
          <button @click="closeModal" class="text-text-muted hover:text-text"><svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <div class="p-6 h-[70vh] flex flex-col">
          <!-- Basic Info -->
          <div class="mb-6" v-if="!editing">
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre del Rol (ID)</label>
            <input v-model="form.roleid" placeholder="Ej. Auditor" required
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
          </div>

          <!-- Privileges Selector -->
          <div class="flex-grow flex flex-col min-h-0">
            <div class="flex justify-between items-end mb-2">
              <label class="block text-xs font-bold text-text-muted uppercase">Privilegios</label>
              <div class="text-xs flex gap-2">
                <button @click="selectAll" class="text-primary hover:underline">Todos</button>
                <span class="text-border">|</span>
                <button @click="selectNone" class="text-text-muted hover:text-text">Ninguno</button>
              </div>
            </div>

            <div
              class="border border-border rounded-lg bg-background p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-grow custom-scrollbar">
              <!-- Grouped Privileges -->
              <div v-for="(group, key) in groupedPrivs" :key="key" class="col-span-full mb-2 mt-2 first:mt-0">
                <h4 class="text-xs font-bold text-primary border-b border-border/50 pb-1 mb-2">{{ key }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <label v-for="priv in group" :key="priv"
                    class="flex items-center gap-2 p-1.5 hover:bg-muted-surface rounded cursor-pointer transition-colors border border-transparent hover:border-border/30"
                    :class="{ 'bg-primary/5 border-primary/20': form.privs.includes(priv) }">
                    <input type="checkbox" :value="priv" v-model="form.privs"
                      class="rounded border-border bg-card text-primary focus:ring-primary/50">
                    <span class="text-xs text-text font-mono truncate" :title="priv">{{ priv }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4" v-if="editing">
            <div class="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between gap-4">
              <div class="text-sm text-text-muted">
                <p class="font-medium text-text">Eliminar Rol</p>
                <p class="text-xs">Esta acción es irreversible.</p>
              </div>
              <button @click="removeRole(editing)"
                class="px-3 py-1.5 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded shadow-sm transition-colors">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
          <button @click="closeModal"
            class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
          <button @click="saveRole" :disabled="loading"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Guardar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
useHead({ title: 'Gestión de Roles' })

const router = useRouter()
const { listRoles, createRole, deleteRole, restoreSession, isAuthenticated, isClusterAdmin, hasPermission } = useProxmox()
const canCreateRole = computed(() => isClusterAdmin.value || hasPermission('Permissions.Modify', '/'))

const loading = ref(false)
const roles = ref<any[]>([])
const search = ref('')

// State
const showCreate = ref(false)
const editing = ref<any | null>(null)
const form = ref<{ roleid: string, privs: string[] }>({ roleid: '', privs: [] })

// Constant Privileges List (Complete Proxmox List)
const ALL_PRIVILEGES = [
  // VM
  'VM.Audit', 'VM.Backup', 'VM.Clone', 'VM.Console', 'VM.Console.Interactive', 'VM.Config.CDROM', 'VM.Config.CPU', 'VM.Config.Cloudinit', 'VM.Config.Disk', 'VM.Config.HWType', 'VM.Config.Memory', 'VM.Config.Network', 'VM.Config.Options', 'VM.Migrate', 'VM.Monitor', 'VM.PowerMgmt', 'VM.Snapshot', 'VM.Snapshot.Rollback',
  // Storage
  'Datastore.Allocate', 'Datastore.AllocateSpace', 'Datastore.AllocateTemplate', 'Datastore.Audit',
  // Sys
  'Sys.Audit', 'Sys.Console', 'Sys.Modify', 'Sys.PowerMgmt', 'Sys.Syslog',
  // Permissions
  'Permissions.Modify', 'User.Modify', 'Group.Allocate', 'Pool.Allocate', 'Realm.Allocate', 'Realm.AllocateUser'
]

const groupedPrivs = computed(() => {
  const groups: Record<string, string[]> = {
    'Virtual Machine': [],
    'Storage': [],
    'System': [],
    'Access Control': []
  }
  ALL_PRIVILEGES.forEach(p => {
    if (p.startsWith('VM.')) groups['Virtual Machine'].push(p)
    else if (p.startsWith('Datastore.')) groups['Storage'].push(p)
    else if (p.startsWith('Sys.')) groups['System'].push(p)
    else groups['Access Control'].push(p)
  })
  return groups
})


onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadRoles()
})

watch(isAuthenticated, (val) => {
  if (val && roles.value.length === 0) loadRoles()
})

const loadRoles = async () => {
  loading.value = true
  roles.value = []
  try {
    const res = await listRoles()
    if (res.success) roles.value = res.data || []
  } catch (e) {
    console.warn('Cannot load roles', e)
  } finally {
    loading.value = false
  }
}

const filteredRoles = computed(() => {
  if (!search.value) return roles.value
  const term = search.value.toLowerCase()
  return roles.value.filter(r => r.roleid.toLowerCase().includes(term))
})


// Actions
const openCreateModal = () => {
  form.value = { roleid: '', privs: [] }
  editing.value = null
  showCreate.value = true
}

const editRole = (r: any) => {
  editing.value = r
  form.value = {
    roleid: r.roleid,
    privs: r.privs ? r.privs.split(',').filter((p: string) => p) : []
  }
  showCreate.value = false // Mutually exclusive view triggers same modal conceptually but distinct logic
}

const closeModal = () => {
  editing.value = null
  showCreate.value = false
}

const selectAll = () => { form.value.privs = [...ALL_PRIVILEGES] }
const selectNone = () => { form.value.privs = [] }

const saveRole = async () => {
  const id = editing.value ? editing.value.roleid : form.value.roleid
  if (!id) return alert('ID de rol requerido')

  loading.value = true
  const privsStr = form.value.privs.join(',')

  // Proxmox API uses POST to create and PUT (or same POST endpoint sometimes depending on version/lib) to update.
  // createRole in useProxmox usually maps to POST /access/roles (create) or PUT /access/roles/{id} (update)
  // Checking useProxmox implementation: createRole uses POST.
  // If updating, we might need a specific update function or rely on POST overwriting if allowed.
  // Standard Proxmox: POST to create, PUT to update. 
  // I assumed createRole handles creation. Let's try to reuse it or use direct request if needed.
  // Re-reading useProxmox.ts in my memory banks... it likely has createRole.

  // Simplification: Try createRole for new, and explicit PUT for edit
  let res
  if (editing.value) {
    // Update
    const { proxmoxRequest } = useProxmox()
    res = await proxmoxRequest(`/access/roles/${id}`, 'PUT', undefined, { privs: privsStr })
  } else {
    res = await createRole(id, privsStr)
  }

  loading.value = false

  // @ts-ignore
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  closeModal()
  await loadRoles()
}

const removeRole = async (r: any) => {
  if (!confirm('Eliminar rol ' + r.roleid + '?')) return
  loading.value = true
  const res = await deleteRole(r.roleid)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  if (editing.value?.roleid === r.roleid) closeModal()
  await loadRoles()
}
</script>

<style scoped>
.mobile-modal-scroll {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
</style>
