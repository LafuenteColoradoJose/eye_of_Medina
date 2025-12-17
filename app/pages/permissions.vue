<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Asignación de Permisos (ACL)</h1>

    <section class="mb-6 section-card p-4 rounded shadow">
      <h2 class="font-bold mb-2">Crear permiso</h2>
      <form @submit.prevent="handleAssign" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm">Path (ej. /vms/100 o /pool/my-pool)</label>
          <input v-model="form.path" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Role</label>
          <select v-model="form.role" class="w-full p-2 border rounded">
            <option v-for="r in roles" :key="r.roleid" :value="r.roleid">{{ r.roleid }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm">Tipo de sujeto</label>
          <select v-model="form.subjectType" class="w-full p-2 border rounded">
            <option value="user">Usuario</option>
            <option value="group">Grupo</option>
            <option value="pool">Pool</option>
            <option value="vm">VM/Resource</option>
          </select>
        </div>
        <div>
          <label class="block text-sm">ID sujeto (userid, groupid, poolid o vmid)</label>
          <input v-model="form.subjectId" class="w-full p-2 border rounded" />
        </div>

        <div class="col-span-2 flex gap-2 justify-end">
          <button type="submit" :disabled="loading" class="px-4 py-2 rounded btn-positive">Asignar</button>
        </div>
      </form>
    </section>

    <section class="section-card p-4 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold">ACLs actuales</h2>
        <div class="flex gap-2">
          <button @click="loadACLs" class="px-3 py-2 rounded btn-primary">Refrescar</button>
        </div>
      </div>

      <div v-if="acls.length === 0" class="text-sm muted">No hay entradas ACL.</div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">Path</th>
            <th class="p-2">Role</th>
            <th class="p-2">Type</th>
            <th class="p-2">ID</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in acls" :key="a.path + a.roleid + a.ugid" class="border-b">
            <td class="p-2">{{ a.path }}</td>
            <td class="p-2">{{ a.roleid || a.role || '-' }}</td>
            <td class="p-2">{{ a.type || (a.ugid?.includes('@') ? 'user' : (a.ugid ? 'group' : 'other')) }}</td>
            <td class="p-2">{{ a.ugid || '-' }}</td>
            <td class="p-2">
              <button @click="removeACL(a)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { listRoles, listACLs, createACL, deleteACL, restoreSession } = useProxmox()

const loading = ref(false)
const roles = ref<any[]>([])
const acls = ref<any[]>([])

const form = ref({ path: '', role: '', subjectType: 'user', subjectId: '' })

onMounted(() => {
  restoreSession()
  loadRolesAndACLs()
})

const loadRolesAndACLs = async () => {
  loading.value = true
  const r = await listRoles()
  if (r.success) roles.value = r.data || []
  const a = await listACLs()
  if (a.success) acls.value = a.data || []
  loading.value = false
}

const loadACLs = async () => {
  loading.value = true
  const res = await listACLs()
  loading.value = false
  if (res.success) acls.value = res.data || []
}

const handleAssign = async () => {
  if (!form.value.path || !form.value.role || !form.value.subjectId) return alert('Completa los campos')
  const trimmedPath = form.value.path.trim()
  let path = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`

  // Si el usuario escribe "pool1", normalizamos a "/pool/pool1"
  const poolMatch = path.match(/^\/pool([^/]+)$/)
  if (poolMatch) path = `/pool/${poolMatch[1]}`

  const subject = form.value.subjectId.trim()
  if (!subject) return alert('El ID del sujeto está vacío')

  const opts: any = { propagate: 1 }
  if (form.value.subjectType === 'user') opts.users = subject
  if (form.value.subjectType === 'group') opts.groups = subject

  loading.value = true
  const res = await createACL(path, form.value.role, opts)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || '') + (res.details ? ` | Detalles: ${JSON.stringify(res.details)}` : ''))
  await loadACLs()
}

const removeACL = async (a: any) => {
  if (!confirm('Eliminar ACL en ' + a.path + ' role ' + a.role + '?')) return
  loading.value = true
  const res = await deleteACL(a.path, a.roleid || a.role, { users: a.userid || a.ugid, groups: a.group })
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  await loadACLs()
}
</script>
