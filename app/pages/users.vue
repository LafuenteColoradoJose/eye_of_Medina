<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

    <section class="mb-6 section-card p-4 rounded shadow">
      <h2 class="font-bold mb-2">Crear usuario</h2>
      <form @submit.prevent="handleCreate" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm">ID (sin realm)</label>
          <input v-model="form.userid" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Password</label>
          <input v-model="form.password" type="password" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Realm</label>
          <select v-model="form.realm" class="w-full p-2 border rounded">
            <option value="pam">pam (Sistema)</option>
            <option value="pve">pve (Proxmox)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm">Rol</label>
          <select v-model="form.role" class="w-full p-2 border rounded">
            <option value="alumno">Alumno</option>
            <option value="profesor">Profesor</option>
          </select>
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
          <select v-model="filterRole" class="p-2 border rounded">
            <option value="all">Todos los roles</option>
            <option value="alumno">Alumno</option>
            <option value="profesor">Profesor</option>
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
            <th class="p-2">Rol</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.userid" class="border-b">
            <td class="p-2">{{ u.userid }}</td>
            <td class="p-2">{{ realmOf(u.userid) }}</td>
            <td class="p-2">{{ getRole(u.userid) || '-' }}</td>
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
          <div>
            <label class="block text-sm">Rol</label>
            <select v-model="editing.role" class="w-full p-2 border rounded">
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="applyEdit" class="px-4 py-2 rounded btn-positive">Guardar</button>
          <button @click="cancelEdit" class="px-4 py-2 rounded btn-muted">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const { proxmoxRequest, createUser, deleteUser, updateUser, restoreSession, username, isAuthenticated } = useProxmox()

const loading = ref(false)
const users = ref<any[]>([])

const form = ref({ userid: '', password: '', realm: 'pam', role: 'alumno', comment: '' })
const filterRealm = ref('all')
const filterRole = ref('all')

const editing = ref<any | null>(null)

onMounted(() => {
  restoreSession()
  loadUsers()
})

const realmOf = (userid: string) => {
  const parts = userid.split('@')
  return parts[1] || ''
}

// store role mapping locally (for demo purposes). In production use a persistent store.
const ROLE_KEY = 'app:userRoles:v1'
const loadRoles = () => {
  try {
    const raw = localStorage.getItem(ROLE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) { return {} }
}
const saveRoles = (map: Record<string,string>) => localStorage.setItem(ROLE_KEY, JSON.stringify(map))

const getRole = (userid: string) => {
  const map = loadRoles()
  return map[userid]
}
const setRole = (userid: string, role: string) => {
  const map = loadRoles(); map[userid] = role; saveRoles(map)
}
const removeRole = (userid: string) => { const map = loadRoles(); delete map[userid]; saveRoles(map) }

const loadUsers = async () => {
  loading.value = true
  users.value = []
  const res = await proxmoxRequest('/access/users', 'GET')
  loading.value = false
  if (res.success) users.value = res.data || []
}

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const realm = realmOf(u.userid)
    if (filterRealm.value !== 'all' && realm !== filterRealm.value) return false
    const role = getRole(u.userid)
    if (filterRole.value !== 'all' && role !== filterRole.value) return false
    return true
  })
})

const resetForm = () => { form.value = { userid: '', password: '', realm: 'pam', role: 'alumno', comment: '' } }

const handleCreate = async () => {
  if (!form.value.userid || !form.value.password) return alert('Userid y password son requeridos')
  loading.value = true
  const useridFull = `${form.value.userid}@${form.value.realm}`
  const r = await createUser(form.value.userid, form.value.password, form.value.realm, form.value.comment)
  loading.value = false
  if (r.success === false) return alert('Error: ' + (r.message || JSON.stringify(r)))
  // save role locally
  setRole(useridFull, form.value.role)
  resetForm()
  await loadUsers()
}

const editUser = (u: any) => {
  editing.value = { userid: u.userid, comment: u.comment || '', role: getRole(u.userid) || 'alumno' }
}

const applyEdit = async () => {
  if (!editing.value) return
  loading.value = true
  const userid = editing.value.userid
  const res = await updateUser(userid, { comment: editing.value.comment })
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  setRole(userid, editing.value.role)
  editing.value = null
  await loadUsers()
}

const cancelEdit = () => { editing.value = null }

const removeUser = async (u: any) => {
  if (!confirm('Eliminar usuario ' + u.userid + '?')) return
  loading.value = true
  const res = await deleteUser(u.userid)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  removeRole(u.userid)
  await loadUsers()
}
</script>
