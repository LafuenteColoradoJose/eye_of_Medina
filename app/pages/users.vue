<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Gestión de Usuarios</h1>
        <p class="text-text-muted text-sm mt-1">Administra el acceso y permisos de la plataforma</p>
      </div>
      <div class="flex gap-3">
        <button
@click="loadUsers"
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
v-if="canCreateUser" @click="openCreateModal"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
          <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Filters & Stats -->
    <div
      class="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
      <div class="flex-1 w-full relative max-w-md flex gap-4">
        <div class="relative flex-grow">
          <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
v-model="search" placeholder="Buscar por ID o nombre..."
            class="w-full pl-14 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            style="padding-left: 3.5rem" />
        </div>

        <select
v-model="filterRealm"
          class="bg-background border border-border rounded-lg text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">Todos los Realms</option>
          <option value="pam">Linux PAM</option>
          <option value="pve">Proxmox VE</option>
        </select>
      </div>
      <div class="text-sm text-text-muted">
        <span class="font-bold text-primary">{{ filteredUsers.length }}</span> usuarios encontrados
      </div>
    </div>

    <!-- Users Grid -->
    <div v-if="loading && users.length === 0" class="py-12 flex justify-center text-text-muted">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <div
v-else-if="filteredUsers.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg
xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="18" y1="8" x2="23" y2="13" />
        <line x1="23" y1="8" x2="18" y2="13" />
      </svg>
      <p class="text-lg font-medium">No se encontraron usuarios</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
v-for="user in filteredUsers" :key="user.userid"
        class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col relative">
        <!-- Actions (visible on hover) -->
        <div
          class="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
@click="changePassword(user)"
            class="p-1.5 rounded-md bg-muted-surface text-text-muted hover:text-primary hover:bg-background border border-transparent hover:border-border transition-all shadow-sm"
            title="Cambiar Contraseña">
            <svg
xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
          <button
v-if="canCreateUser" @click="editUser(user)"
            class="p-1.5 rounded-md bg-muted-surface text-text-muted hover:text-warning hover:bg-background border border-transparent hover:border-border transition-all shadow-sm"
            title="Editar">
            <svg
xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>

        <div class="p-5 flex flex-col items-center flex-grow">
          <!-- Avatar -->
          <div
            class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-3 border-2 border-background shadow-sm">
            {{ getInitials(user.userid) }}
          </div>

          <!-- Identity -->
          <h3 class="text-lg font-bold text-text truncate max-w-full" :title="user.userid">{{ user.userid }}</h3>
          <div class="flex gap-2 mt-1 mb-3">
            <span
class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
              :class="realmOf(user.userid) === 'pam' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'">
              {{ realmOf(user.userid) }}
            </span>
            <span
v-if="user.enable === 0"
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
              Inactivo
            </span>
          </div>

          <!-- Details -->
          <div class="w-full space-y-2 mt-2">
            <div class="text-xs text-text-muted bg-muted-surface/30 p-2 rounded border border-border/50 min-h-[3rem]">
              <span class="font-semibold block text-text text-[10px] uppercase mb-1 opacity-70">Comentario</span>
              <span class="italic">{{ user.comment || 'Sin comentarios' }}</span>
            </div>

            <div class="text-xs text-text-muted">
              <span class="font-semibold block text-text text-[10px] uppercase mb-1 opacity-70">Grupos</span>
              <div class="flex flex-wrap gap-1">
                <span v-if="!user.groups?.length" class="text-text-muted italic">-</span>
                <span
v-for="g in user.groups" :key="g"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-muted-surface border border-border text-text">
                  {{ g }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Create User Modal -->
    <div
v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showCreateModal = false">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <h2 class="text-xl font-bold text-text">Nuevo Usuario</h2>
          <button @click="showCreateModal = false" class="text-text-muted hover:text-text"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar space-y-4">
          <!-- Alert Info -->
          <div class="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex gap-3">
            <svg
class="w-5 h-5 text-primary flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div class="text-text-muted">
              Solo se pueden crear usuarios en el realm <span class="font-mono text-primary">pve</span> aquí. Para <span
                class="font-mono">pam</span>, usa el sistema operativo.
            </div>
          </div>

          <form id="createUserForm" @submit.prevent="handleCreate" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre Usuario</label>
                <input
v-model="form.userid" placeholder="ej. juan" required
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
              </div>
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Contraseña</label>
                <input
v-model="form.password" type="password" required
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-text-muted uppercase mb-1">Grupos</label>
              <div
                class="border border-border rounded-lg bg-background p-2 max-h-32 overflow-y-auto grid grid-cols-2 gap-2">
                <label
v-for="g in groupsOptions" :key="g"
                  class="flex items-center gap-2 p-1.5 hover:bg-muted-surface rounded cursor-pointer transition-colors">
                  <input
type="checkbox" :value="g" v-model="form.groups"
                    class="rounded border-border bg-card text-primary focus:ring-primary/50">
                  <span class="text-sm text-text">{{ g }}</span>
                </label>
                <div v-if="groupsOptions.length === 0" class="col-span-2 text-center text-text-muted text-sm py-2">No
                  hay grupos disponibles</div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-text-muted uppercase mb-1">Comentario</label>
              <textarea
v-model="form.comment" rows="2"
                class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"></textarea>
            </div>
          </form>
        </div>

        <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
          <button
@click="showCreateModal = false"
            class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
          <button
type="submit" form="createUserForm" :disabled="loading"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Crear
            Usuario</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="cancelEdit">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
          <div>
            <h2 class="text-xl font-bold text-text">Editar Usuario</h2>
            <p class="text-xs text-text-muted mt-0.5">{{ editing.userid }}</p>
          </div>
          <button @click="cancelEdit" class="text-text-muted hover:text-text"><svg
xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Comentario</label>
            <textarea
v-model="editing.comment" rows="2"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Grupos Asignados</label>
            <div
              class="border border-border rounded-lg bg-background p-2 max-h-32 overflow-y-auto grid grid-cols-2 gap-2">
              <label
v-for="g in groupsOptions" :key="g"
                class="flex items-center gap-2 p-1.5 hover:bg-muted-surface rounded cursor-pointer transition-colors">
                <input
type="checkbox" :value="g" v-model="editing.groups"
                  class="rounded border-border bg-card text-primary focus:ring-primary/50">
                <span class="text-sm text-text">{{ g }}</span>
              </label>
            </div>
          </div>

          <!-- PVE Realm users can change password via separate modal, removing 'danger zone' for password here to keep it clean. 
                Instead, we put DELETE in danger zone -->
          <div class="pt-4 border-t border-border/50">
            <h3 class="text-xs font-bold text-danger uppercase mb-2">Zona de Peligro</h3>
            <div class="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between gap-4">
              <div class="text-sm text-text-muted">
                <p class="font-medium text-text">Eliminar Usuario</p>
                <p class="text-xs">Revoca todo acceso permanentemente.</p>
              </div>
              <button
@click="removeUser(editing)"
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
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Guardar
            Cambios</button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div
v-if="pwdUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="pwdUser = null">
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div class="p-5 border-b border-border bg-muted-surface/30">
          <h2 class="text-lg font-bold text-text">Cambiar Contraseña</h2>
          <p class="text-xs text-text-muted mt-1">{{ pwdUser.userid }}</p>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nueva Contraseña</label>
            <input
v-model="pwdForm.password" type="password"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Confirmar</label>
            <input
v-model="pwdForm.confirm" type="password"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="••••••••" />
          </div>
        </div>
        <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
          <button
@click="pwdUser = null"
            class="px-3 py-1.5 rounded-lg border border-border text-text hover:bg-muted-surface text-sm transition-colors">Cancelar</button>
          <button
@click="applyPasswordChange" :disabled="loading"
            class="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-strong text-sm font-bold transition-colors">Actualizar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
useHead({ title: 'Gestión de Usuarios' })

// Types
type Realm = 'pam' | 'pve'
type User = { userid: string; comment?: string; groups?: string[]; enable?: number; email?: string }
type ProxmoxResponse<T> = { success?: boolean; data?: T; message?: string }
type FormState = { userid: string; password: string; realm: Realm; comment?: string; groups: string[] }
type EditableUser = User & { groups: string[] } // Ensure groups is array for logic

const { proxmoxRequest, createUser, deleteUser, updateUser, restoreSession, isAuthenticated, listGroups, username, hasPermission, isClusterAdmin } = useProxmox()

// Permissions
const canCreateUser = computed(() => {
  return isClusterAdmin.value || hasPermission('User.Modify', '/access/users') || hasPermission('User.Modify', '/')
})

// State
const loading = ref<boolean>(false)
const users = ref<User[]>([])
const groupsOptions = ref<string[]>([])
const search = ref('')
const filterRealm = ref<'all' | Realm>('all')

// Modals State
const showCreateModal = ref(false)
const editing = ref<EditableUser | null>(null)
const pwdUser = ref<User | null>(null)
const pwdForm = ref({ password: '', confirm: '' })

const form = ref<FormState>({ userid: '', password: '', realm: 'pve', comment: '', groups: [] })

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) {
    loadUsers()
    loadGroups()
  }
})

watch(isAuthenticated, (val) => {
  if (val && users.value.length === 0) loadUsers()
  if (val && groupsOptions.value.length === 0) loadGroups()
})

// Helpers
const realmOf = (userid: string): Realm | '' => {
  const parts = userid.split('@')
  return (parts[parts.length - 1] as Realm) || ''
}
const getInitials = (id: string) => id.substring(0, 2).toUpperCase()

// Data Loading
const loadUsers = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await proxmoxRequest('/access/users', 'GET') as ProxmoxResponse<User[]>

    if (res.success && res.data) {
      users.value = res.data
    } else {
      throw new Error("No se pudo listar usuarios globalmente")
    }
  } catch (e) {
    console.warn('Acceso restringido a lista de usuarios. Mostrando usuario actual.', e)
    // Fallback: Si no puedo ver a todos, al menos me veo a mí mismo
    if (username.value) {
      users.value = [{
        userid: username.value,
        realm: 'pve', // Asumido o extraido
        enable: 1,
        expire: 0,
        role: 'User', // Placeholder
        groups: [],
        comment: 'Usuario Actual (Vista Restringida)'
      } as unknown as User]
    }
  }

  // Also refresh groups to be sure (quiet fail)
  await loadGroups()

  loading.value = false
}

const loadGroups = async (): Promise<void> => {
  try {
    const res = await listGroups()
    if (res.success && res.data) {
      groupsOptions.value = (res.data as { groupid: string }[]).map((g) => g.groupid)
    }
  } catch (e) {
    console.error(e)
  }
}

// Filtering
const filteredUsers = computed<User[]>(() => {
  const term = search.value.toLowerCase()
  return users.value.filter((u) => {
    // Search
    if (term && !u.userid.toLowerCase().includes(term) && !u.comment?.toLowerCase().includes(term)) return false

    // Realm Filter
    const realm = realmOf(u.userid)
    if (filterRealm.value !== 'all' && realm !== filterRealm.value) return false

    return true
  })
})

// Create Logic
const openCreateModal = () => { form.value = { userid: '', password: '', realm: 'pve', comment: '', groups: [] }; showCreateModal.value = true }

const handleCreate = async (): Promise<void> => {
  if (!form.value.userid || !form.value.password) return alert('Usuario y contraseña requeridos')
  loading.value = true

  // Clone array to avoid reactivity issues
  const cleanGroups = JSON.parse(JSON.stringify(form.value.groups))

  // Note: We always create in 'pve' realm from UI for simplicity, as PAM requires OS level creation first usually.
  // Ideally userid should explicitly not include @pve, function adds it or we add it. 
  // Let's assume input is just username, we append @pve if missing or force it.
  let targetId = form.value.userid
  if (!targetId.includes('@')) targetId += '@pve'

  const r = await createUser(targetId, form.value.password, 'pve', form.value.comment, cleanGroups) as ProxmoxResponse<unknown>

  loading.value = false
  if (r.success === false) return alert('Error: ' + (r.message || JSON.stringify(r)))

  showCreateModal.value = false
  await loadUsers()
}

// Edit Logic
const editUser = (u: User) => {
  // Normalize groups
  let g: string[] = []
  if (Array.isArray(u.groups)) g = u.groups
  else if (typeof u.groups === 'string') g = [u.groups]

  editing.value = {
    ...u,
    groups: g
  }
}
const cancelEdit = () => { editing.value = null }

const applyEdit = async (): Promise<void> => {
  if (!editing.value) return
  loading.value = true
  const userid = editing.value.userid
  const res = await updateUser(userid, {
    comment: editing.value.comment,
    groups: editing.value.groups?.length ? editing.value.groups.join(',') : '', // Proxmox API expects CSV string usually, useProxmox might handle it depending on implementation. Let's send CSV.
  }) as ProxmoxResponse<unknown>

  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  editing.value = null
  await loadUsers()
}

const removeUser = async (u: User | EditableUser): Promise<void> => {
  // If called from modal, u might be editing.value
  if (!confirm('¿Eliminar usuario ' + u.userid + ' permanentemente?')) return
  loading.value = true
  const res = await deleteUser(u.userid) as ProxmoxResponse<unknown>
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))

  if (editing.value?.userid === u.userid) editing.value = null // Close modal if open
  await loadUsers()
}

// Password Logic
const changePassword = (u: User) => {
  pwdUser.value = u
  pwdForm.value = { password: '', confirm: '' }
}
const applyPasswordChange = async () => {
  if (!pwdUser.value || !pwdForm.value.password) return
  if (pwdForm.value.password !== pwdForm.value.confirm) return alert('Las contraseñas no coinciden')

  loading.value = true
  const res = await updateUser(pwdUser.value.userid, { password: pwdForm.value.password }) as ProxmoxResponse<unknown>
  loading.value = false

  if (res.success === false) return alert('Error cambiando contraseña: ' + (res.message || JSON.stringify(res)))

  alert('Contraseña actualizada correctamente')
  pwdUser.value = null
}

</script>
