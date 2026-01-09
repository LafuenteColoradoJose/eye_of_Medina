<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Gestión de Grupos</h1>
        <p class="text-text-muted text-sm mt-1">Organiza usuarios y permisos de forma colectiva</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadGroups"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Grupo
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
        <input v-model="search" placeholder="Buscar grupos..."
          class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div class="text-sm text-text-muted">
        <span class="font-bold text-primary">{{ filteredGroups.length }}</span> grupos encontrados
      </div>
    </div>

    <!-- Groups Grid -->
    <div v-if="loading && groups.length === 0" class="py-12 flex justify-center text-text-muted">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div v-else-if="filteredGroups.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <p class="text-lg font-medium">No se encontraron grupos</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="group in filteredGroups" :key="group.groupid"
        class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
        <div class="p-5 flex flex-col gap-2 flex-grow">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-primary/10 rounded-lg text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-text truncate max-w-[150px]" :title="group.groupid">{{ group.groupid }}
              </h3>
            </div>

            <!-- Actions Dropdown -->
            <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editGroup(group)"
                class="p-1.5 rounded-lg hover:bg-muted-surface text-text-muted hover:text-primary transition-colors"
                title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-3 bg-muted-surface/30 p-2 rounded border border-border/50">
            <span class="text-[10px] uppercase font-bold text-text-muted block mb-1">Descripción</span>
            <p v-if="group.comment" class="text-sm text-text line-clamp-2">{{ group.comment }}</p>
            <p v-else class="text-sm text-text-muted italic">Sin descripción</p>
          </div>
        </div>

        <div
          class="px-5 py-3 border-t border-border flex justify-between items-center text-xs text-text-muted bg-muted-surface/10">
          <!-- Placeholder for member count if API supported it efficiently -->
          <span>Grupo del sistema</span>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showCreateModal = false">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <h2 class="text-xl font-bold text-text">Nuevo Grupo</h2>
          <button @click="showCreateModal = false" class="text-text-muted hover:text-text"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <form @submit.prevent="handleCreate" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">ID del Grupo</label>
            <input v-model="form.groupid" placeholder="Ej. dev-team" required
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Comentario</label>
            <textarea v-model="form.comment" rows="3" placeholder="Descripción del grupo..."
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
            <button type="submit" :disabled="loading"
              class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="cancelEdit">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <div>
            <h2 class="text-xl font-bold text-text">Editar Grupo</h2>
            <p class="text-xs text-text-muted mt-0.5">{{ editing.groupid }}</p>
          </div>
          <button @click="cancelEdit" class="text-text-muted hover:text-text"><svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Comentario</label>
            <textarea v-model="editing.comment" rows="3"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"></textarea>
          </div>

          <div class="pt-4 border-t border-border/50">
            <h3 class="text-xs font-bold text-danger uppercase mb-2">Zona de Peligro</h3>
            <div class="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between gap-4">
              <div class="text-sm text-text-muted">
                <p class="font-medium text-text">Eliminar Grupo</p>
                <p class="text-xs">Esta acción es irreversible.</p>
              </div>
              <button @click="removeGroup(editing)"
                class="px-3 py-1.5 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded shadow-sm transition-colors">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
          <button @click="cancelEdit"
            class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
          <button @click="applyEdit" :disabled="loading"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Guardar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
useHead({ title: 'Gestión de Grupos' })

const router = useRouter()
const { listGroups, createGroup, updateGroup, deleteGroup, restoreSession, isAuthenticated } = useProxmox()

const loading = ref(false)
const groups = ref<any[]>([])
const search = ref('')

// State
const showCreateModal = ref(false)
const form = ref({ groupid: '', comment: '' })
const editing = ref<any | null>(null)

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadGroups()
})

watch(isAuthenticated, (val) => {
  if (val && groups.value.length === 0) loadGroups()
})

const loadGroups = async () => {
  loading.value = true
  groups.value = []
  const res = await listGroups()
  loading.value = false
  if (res.success) groups.value = res.data || []
}

const filteredGroups = computed(() => {
  if (!search.value) return groups.value
  const term = search.value.toLowerCase()
  return groups.value.filter(g => g.groupid.toLowerCase().includes(term) || (g.comment && g.comment.toLowerCase().includes(term)))
})

// Create
const openCreateModal = () => { form.value = { groupid: '', comment: '' }; showCreateModal.value = true }

const handleCreate = async () => {
  if (!form.value.groupid) return alert('GroupID es requerido')
  loading.value = true
  const res = await createGroup(form.value.groupid, form.value.comment)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  showCreateModal.value = false
  await loadGroups()
}

// Edit
const editGroup = (g: any) => { editing.value = { groupid: g.groupid, comment: g.comment || '' } }
const cancelEdit = () => { editing.value = null }

const applyEdit = async () => {
  if (!editing.value) return
  loading.value = true
  const res = await updateGroup(editing.value.groupid, { comment: editing.value.comment })
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  editing.value = null
  await loadGroups()
}

// Delete
const removeGroup = async (g: any) => {
  if (!confirm('Eliminar grupo ' + g.groupid + '?')) return
  loading.value = true
  const res = await deleteGroup(g.groupid)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  if (editing.value?.groupid === g.groupid) editing.value = null
  await loadGroups()
}
</script>
