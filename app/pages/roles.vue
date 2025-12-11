<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Roles</h1>

    <section class="mb-6 bg-white p-4 rounded shadow">
      <h2 class="font-bold mb-2">Crear rol</h2>
      <form @submit.prevent="handleCreate" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm">Role ID</label>
          <input v-model="form.roleid" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Privilegios (coma-separados)</label>
          <input v-model="form.privs" class="w-full p-2 border rounded" placeholder="VM.Audit,VM.Config.CPU,..." />
        </div>
        <div class="col-span-2 flex gap-2 justify-end">
          <button type="submit" :disabled="loading" class="bg-green-500 text-white px-4 py-2 rounded">Crear</button>
          <button type="button" @click="resetForm" class="bg-gray-200 px-4 py-2 rounded">Limpiar</button>
        </div>
      </form>
    </section>

    <section class="bg-white p-4 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold">Lista de roles</h2>
        <div class="flex gap-2">
          <button @click="loadRoles" class="bg-blue-500 text-white px-3 py-2 rounded">Refrescar</button>
        </div>
      </div>

      <div v-if="roles.length === 0" class="text-sm text-gray-500">No hay roles.</div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">Role</th>
            <th class="p-2">Privilegios</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in roles" :key="r.roleid" class="border-b">
            <td class="p-2">{{ r.roleid }}</td>
            <td class="p-2">{{ (r.privs || []).join(', ') }}</td>
            <td class="p-2">
              <button @click="editRole(r)" class="bg-yellow-400 px-2 py-1 rounded mr-2">Editar</button>
              <button @click="removeRole(r)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="editing" class="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow w-1/2">
        <h3 class="font-bold mb-2">Editar rol {{ editing.roleid }}</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm">Privilegios (coma-separados)</label>
            <input v-model="editing.privsStr" class="w-full p-2 border rounded" />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="applyEdit" class="bg-green-500 text-white px-4 py-2 rounded">Guardar</button>
          <button @click="cancelEdit" class="bg-gray-200 px-4 py-2 rounded">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { listRoles, createRole, deleteRole, restoreSession } = useProxmox()

const loading = ref(false)
const roles = ref<any[]>([])

const form = ref({ roleid: '', privs: '' })
const editing = ref<any | null>(null)

onMounted(() => {
  restoreSession()
  loadRoles()
})

const resetForm = () => { form.value = { roleid: '', privs: '' } }

const handleCreate = async () => {
  if (!form.value.roleid) return alert('RoleID es requerido')
  loading.value = true
  const res = await createRole(form.value.roleid, form.value.privs)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  resetForm()
  await loadRoles()
}

const loadRoles = async () => {
  loading.value = true
  roles.value = []
  const res = await listRoles()
  loading.value = false
  if (res.success) roles.value = res.data || []
}

const editRole = (r: any) => { editing.value = { roleid: r.roleid, privsStr: (r.privs || []).join(',') } }
const applyEdit = async () => {
  if (!editing.value) return
  loading.value = true
  // Proxmox API may require a PUT to update role privs; call createRole as fallback
  const res = await createRole(editing.value.roleid, editing.value.privsStr)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  editing.value = null
  await loadRoles()
}
const cancelEdit = () => { editing.value = null }

const removeRole = async (r: any) => {
  if (!confirm('Eliminar rol ' + r.roleid + '?')) return
  loading.value = true
  const res = await deleteRole(r.roleid)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  await loadRoles()
}
</script>
