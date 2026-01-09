<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
    </div>

    <div v-else>
      <section class="mb-6 section-card p-4 rounded shadow">
        <h2 class="font-bold mb-2">Crear usuario</h2>
        <p class="text-sm muted mb-3">Solo se pueden crear usuarios en el realm <code class="font-mono">pve</code>. Para
          <code class="font-mono">pam</code>, crea primero el usuario en el sistema y luego asígnale permisos.
        </p>
        <form @submit.prevent="handleCreate" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm">ID (sin realm)</label>
            <input v-model="form.userid" class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm">Password</label>
            <input v-model="form.password" type="password" class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm">Grupos</label>
            <select v-model="form.groups" multiple class="w-full p-2 border rounded min-h-[2.5rem]">
              <option v-for="g in groupsOptions" :key="g" :value="g">{{ g }}</option>
            </select>
            <p class="text-xs muted mt-1">Ctrl/⌘+clic para elegir varios</p>
          </div>

          <div class="col-span-2">
            <label class="block text-sm">Comentario (opcional)</label>
            <input v-model="form.comment" class="w-full p-2 border rounded" />
          </div>

          <div class="col-span-2 flex gap-2 justify-end">
            <button type="submit" :disabled="loading" class="px-4 py-2 rounded btn-positive">Crear</button>
            <button type="button" @click="resetForm" class="px-4 py-2 rounded btn-muted">Limpiar</button>
          </div>
        </form>
      </section>

      <section class="section-card p-4 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold">Lista de usuarios</h2>
          <div class="flex gap-2">
            <select v-model="filterRealm" class="p-2 border rounded">
              <option value="all">Todos los realms</option>
              <option value="pam">pam</option>
              <option value="pve">pve</option>
            </select>
            <select v-model="filterGroup" class="p-2 border rounded">
              <option value="all">Todos los grupos</option>
              <option v-for="g in groupsOptions" :key="g" :value="g">{{ g }}</option>
            </select>
            <button @click="loadUsers" class="px-3 py-2 rounded btn-primary">Refrescar</button>
          </div>
        </div>

        <div v-if="users.length === 0" class="text-sm muted">No hay usuarios.</div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">Usuario</th>
              <th class="p-2">Realm</th>
              <th class="p-2">Grupos</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.userid" class="border-b">
              <td class="p-2">{{ u.userid }}</td>
              <td class="p-2">{{ realmOf(u.userid) }}</td>
              <td class="p-2">{{ groupsOf(u) }}</td>
              <td class="p-2">
                <button @click="editUser(u)" class="px-2 py-1 rounded mr-2 btn-warning">Editar</button>
                <button @click="removeUser(u)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Modal simple de edición -->
      <div v-if="editing" class="fixed inset-0 overlay-backdrop flex items-center justify-center">
        <div class="section-card p-6 rounded shadow w-1/2">
          <h3 class="font-bold mb-2">Editar usuario {{ editing.userid }}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm">Comentario</label>
              <input v-model="editing.comment" class="w-full p-2 border rounded" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm">Grupos</label>
              <select v-model="editing.groups" multiple class="w-full p-2 border rounded min-h-[2.5rem]">
                <option v-for="g in groupsOptions" :key="g" :value="g">{{ g }}</option>
              </select>
              <p class="text-xs muted mt-1">Ctrl/⌘+clic para elegir varios</p>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button @click="applyEdit" class="px-4 py-2 rounded btn-positive">Guardar</button>
            <button @click="cancelEdit" class="px-4 py-2 rounded btn-muted">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Usuarios' })
import { ref, computed, onMounted, watch } from 'vue'

type Realm = 'pam' | 'pve'
type User = {
  userid: string
  comment?: string
  groups?: string[]
}

type ProxmoxResponse<T> = {
  success?: boolean
  data?: T
  message?: string
}

type FormState = {
  userid: string
  password: string
  realm: Realm
  comment?: string
  groups: string[]
}

type EditableUser = {
  userid: string
  comment: string
  groups: string[]
}

const router = useRouter()
const { proxmoxRequest, createUser, deleteUser, updateUser, restoreSession, isAuthenticated, listGroups } = useProxmox()

const loading = ref<boolean>(false)
const users = ref<User[]>([])
const groupsOptions = ref<string[]>([])

const form = ref<FormState>({ userid: '', password: '', realm: 'pve', comment: '', groups: [] })
const filterRealm = ref<'all' | Realm>('all')
const filterGroup = ref<'all' | string>('all')

const editing = ref<EditableUser | null>(null)

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

const realmOf = (userid: string): Realm | '' => {
  const parts = userid.split('@')
  return (parts[1] as Realm) || ''
}

// store role mapping locally (for demo purposes). In production use a persistent store.
// Persistencia local de grupos (para filtros y edición rápida)
const GROUPS_KEY = 'app:userGroups:v1'
const loadGroupsLocal = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
const saveGroupsLocal = (map: Record<string, string[]>) => localStorage.setItem(GROUPS_KEY, JSON.stringify(map))

const _setGroupsLocal = (userid: string, groups: string[]) => {
  const map = loadGroupsLocal(); map[userid] = groups; saveGroupsLocal(map)
}
const _removeGroupsLocal = (userid: string) => {
  const map = loadGroupsLocal()
  const { [userid]: _removed, ...rest } = map
  saveGroupsLocal(rest)
}

const loadUsers = async (): Promise<void> => {
  loading.value = true
  users.value = []
  const res = await proxmoxRequest('/access/users', 'GET') as ProxmoxResponse<User[]>
  loading.value = false
  if (res.success) users.value = res.data || []
}

const loadGroups = async (): Promise<void> => {
  try {
    const res = await listGroups()
    if (res.success && res.data) {
      groupsOptions.value = (res.data as { groupid: string }[]).map((g) => g.groupid)
    }
  } catch (error) {
    console.error('Error cargando grupos', error)
  }
}

const filteredUsers = computed<User[]>(() => {
  return users.value.filter((u) => {
    const realm = realmOf(u.userid)
    if (filterRealm.value !== 'all' && realm !== filterRealm.value) return false
    if (filterGroup.value !== 'all') {
      const inGroup = (u.groups || []).includes(filterGroup.value)
      if (!inGroup) return false
    }
    return true
  })
})

const resetForm = () => { form.value = { userid: '', password: '', realm: 'pve', comment: '', groups: [] } }

const groupsOf = (u: User): string => (u.groups && u.groups.length > 0 ? u.groups.join(', ') : '-')

const handleCreate = async (): Promise<void> => {
  if (!form.value.userid || !form.value.password) return alert('Userid y password son requeridos')
  loading.value = true
  // Ensure groups is a plain array of strings, stripping Vue reactivity
  const cleanGroups = form.value.groups ? JSON.parse(JSON.stringify(form.value.groups)) : []

  const r = await createUser(
    form.value.userid,
    form.value.password,
    'pve',
    form.value.comment,
    cleanGroups
  ) as ProxmoxResponse<unknown>
  loading.value = false
  if (r.success === false) return alert('Error: ' + (r.message || JSON.stringify(r)))
  resetForm()
  await loadUsers()
}

const editUser = (u: User) => {
  editing.value = {
    userid: u.userid,
    comment: u.comment || '',
    groups: u.groups || [],
  }
}

const applyEdit = async (): Promise<void> => {
  if (!editing.value) return
  loading.value = true
  const userid = editing.value.userid
  const res = await updateUser(userid, {
    comment: editing.value.comment,
    groups: editing.value.groups?.length ? editing.value.groups.join(',') : undefined,
  }) as ProxmoxResponse<unknown>
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  editing.value = null
  await loadUsers()
}

const cancelEdit = () => { editing.value = null }

const removeUser = async (u: User): Promise<void> => {
  if (!confirm('Eliminar usuario ' + u.userid + '?')) return
  loading.value = true
  const res = await deleteUser(u.userid) as ProxmoxResponse<unknown>
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  await loadUsers()
}
</script>
