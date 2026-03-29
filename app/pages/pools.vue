<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Gestión de Pools</h1>
        <p class="text-text-muted text-sm mt-1">Organiza tus recursos en grupos lógicos</p>
      </div>
      <div class="flex gap-3">
        <button
@click="loadPools"
          class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2">
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
        <button
v-if="canCreatePool" @click="openCreateModal"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
          <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Crear Pool
        </button>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div
      class="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
      <div class="flex-1 w-full relative max-w-md">
        <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
v-model="search" placeholder="Buscar pools..."
          class="w-full pl-14 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          style="padding-left: 3.5rem" />
      </div>
      <div class="text-sm text-text-muted">
        <span class="font-bold text-primary">{{ filteredPools.length }}</span> pools encontrados
      </div>
    </div>

    <!-- Pools Grid -->
    <div v-if="loading && pools.length === 0" class="py-12 flex justify-center text-text-muted">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div
v-else-if="filteredPools.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg
xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
      <p class="text-lg font-medium">No se encontraron pools</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
v-for="pool in filteredPools" :key="pool.poolid"
        class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
        <div class="p-5 flex flex-col gap-2 flex-grow">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-primary/10 rounded-lg text-primary">
                <svg
xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-text truncate" :title="pool.poolid">{{ pool.poolid }}</h3>
            </div>

            <!-- Actions Dropdown or simple buttons? Keeping it simple with hover icons for now -->
            <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
v-if="canManagePool(pool.poolid)" @click="startEdit(pool)"
                class="p-1.5 rounded-lg hover:bg-muted-surface text-text-muted hover:text-primary transition-colors"
                title="Editar">
                <svg
xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-2 text-sm text-text-muted">
            <p v-if="pool.comment" class="line-clamp-2">{{ pool.comment }}</p>
            <p v-else class="italic opacity-50">Sin descripción</p>
          </div>
        </div>

        <!-- Footer Info -->
        <div
          class="px-5 py-3 bg-muted-surface/30 border-t border-border flex justify-between items-center text-xs text-text-muted">
          <span>ID: {{ pool.poolid }}</span>
          <!-- Delete Action stays visible if needed, or moved to edit modal for safety like VMs -->
          <!-- Let's put Delete in the edit modal to be consistent with VMs and safer -->
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div
v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showCreateModal = false">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <h2 class="text-xl font-bold text-text">Crear Nuevo Pool</h2>
          <button @click="showCreateModal = false" class="text-text-muted hover:text-text"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>
        <form @submit.prevent="handleCreate" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Pool ID</label>
            <input
v-model="form.poolid" placeholder="Ej. production-web" required
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50" />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Descripción</label>
            <textarea
v-model="form.comment" rows="3" placeholder="Descripción opcional..."
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
type="button" @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
            <button
type="submit" :disabled="loading"
              class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="cancelEdit">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <div>
            <h2 class="text-xl font-bold text-text">Editar Pool</h2>
            <p class="text-xs text-text-muted mt-0.5">{{ editing.poolid }}</p>
          </div>
          <button @click="cancelEdit" class="text-text-muted hover:text-text"><svg
xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Descripción</label>
            <textarea
v-model="editing.comment" rows="3"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"></textarea>
          </div>

          <div v-if="canDeletePool" class="pt-4 border-t border-border/50">
            <h3 class="text-xs font-bold text-danger uppercase mb-2">Zona de Peligro</h3>
            <div class="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between gap-4">
              <div class="text-sm text-text-muted">
                <p class="font-medium text-text">Eliminar este pool</p>
                <p class="text-xs">Esta acción es irreversible.</p>
              </div>
              <button
@click="handleDelete"
                class="px-3 py-1.5 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded shadow-sm transition-colors">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
          <button
@click="cancelEdit"
            class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
          <button
@click="applyEdit" :disabled="loading"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Guardar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
useHead({ title: 'Gestión de Pools' })

type Pool = { poolid: string; comment?: string }
type ProxmoxResponse<T> = { success?: boolean; data?: T; message?: string }

const { proxmoxRequest, restoreSession, isAuthenticated, hasPermission, isClusterAdmin } = useProxmox()

const canCreatePool = computed(() => isClusterAdmin.value || hasPermission('Pool.Allocate', '/'))
const canManagePool = (poolid: string) => isClusterAdmin.value || hasPermission('Pool.Allocate', `/pool/${poolid}`) || hasPermission('Pool.Allocate', '/')
const canDeletePool = computed(() => isClusterAdmin.value || hasPermission('Pool.Allocate', '/')) // Solo admins globales borran pools

const loading = ref<boolean>(false)
const pools = ref<Pool[]>([])
const search = ref('')

// Create State
const showCreateModal = ref(false)
const form = ref<Pool>({ poolid: '', comment: '' })

// Edit State
const editing = ref<Pool | null>(null)

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadPools()
})

watch(isAuthenticated, (val) => { if (val && pools.value.length === 0) loadPools() })

const loadPools = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await proxmoxRequest('/pools', 'GET') as ProxmoxResponse<Pool[]>
    if (res && res.success) {
      pools.value = res.data || []
    } else {
      // Silent fail or non-critical error
      console.warn('Cannot load pools', res)
      pools.value = []
    }
  } catch (e) {
    console.error('Error loading pools (auth?)', e)
    pools.value = []
  } finally {
    loading.value = false
  }
}

const filteredPools = computed(() => {
  if (!search.value) return pools.value
  const term = search.value.toLowerCase()
  return pools.value.filter(p => p.poolid.toLowerCase().includes(term) || (p.comment && p.comment.toLowerCase().includes(term)))
})

const openCreateModal = () => { form.value = { poolid: '', comment: '' }; showCreateModal.value = true }

const handleCreate = async (): Promise<void> => {
  if (!form.value.poolid) return alert('Pool ID requerido')
  loading.value = true
  const res = await proxmoxRequest('/pools', 'POST', undefined, { poolid: form.value.poolid, comment: form.value.comment }) as ProxmoxResponse<unknown>
  loading.value = false
  if (!res || res.success === false) return alert('Error creando pool: ' + (res?.message || JSON.stringify(res)))

  showCreateModal.value = false
  await loadPools()
}

const startEdit = (pool: Pool) => { editing.value = { ...pool } }
const cancelEdit = () => { editing.value = null }

const applyEdit = async (): Promise<void> => {
  if (!editing.value) return
  loading.value = true
  const res = await proxmoxRequest(`/pools/${encodeURIComponent(editing.value.poolid)}`, 'PUT', undefined, { comment: editing.value.comment }) as ProxmoxResponse<unknown>
  loading.value = false
  if (!res || res.success === false) return alert('Error actualizando pool: ' + (res?.message || JSON.stringify(res)))

  editing.value = null
  await loadPools()
}

const handleDelete = async (): Promise<void> => {
  if (!editing.value || !confirm('Eliminar pool ' + editing.value.poolid + '?')) return
  const poolid = editing.value.poolid // capture before nulling
  loading.value = true
  const res = await proxmoxRequest(`/pools/${encodeURIComponent(poolid)}`, 'DELETE') as ProxmoxResponse<unknown>
  loading.value = false

  if (!res || res.success === false) return alert('Error eliminando pool: ' + (res?.message || JSON.stringify(res)))

  editing.value = null // Close modal
  await loadPools()
}
</script>
