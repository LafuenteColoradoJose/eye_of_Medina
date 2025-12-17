<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Grupos</h1>

    <section class="mb-6 section-card p-4 rounded shadow">
      <h2 class="font-bold mb-2">Crear grupo</h2>
      <form @submit.prevent="handleCreate" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm">Group ID</label>
          <input v-model="form.groupid" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Comentario</label>
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
        <h2 class="font-bold">Lista de grupos</h2>
        <div class="flex gap-2">
          <button @click="loadGroups" class="px-3 py-2 rounded btn-primary">Refrescar</button>
        </div>
      </div>

      <div v-if="groups.length === 0" class="text-sm muted">No hay grupos.</div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">Group ID</th>
            <th class="p-2">Comentario</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in groups" :key="g.groupid" class="border-b">
            <td class="p-2">{{ g.groupid }}</td>
            <td class="p-2">{{ g.comment || '-' }}</td>
            <td class="p-2">
              <button @click="editGroup(g)" class="px-2 py-1 rounded mr-2 btn-warning">Editar</button>
              <button @click="removeGroup(g)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="editing" class="fixed inset-0 overlay-backdrop flex items-center justify-center">
      <div class="section-card p-6 rounded shadow w-1/2">
        <h3 class="font-bold mb-2">Editar grupo {{ editing.groupid }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm">Comentario</label>
            <input v-model="editing.comment" class="w-full p-2 border rounded" />
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
import { ref, onMounted } from 'vue'
const { listGroups, createGroup, updateGroup, deleteGroup, restoreSession } = useProxmox()

const loading = ref(false)
const groups = ref<any[]>([])

const form = ref({ groupid: '', comment: '' })
const editing = ref<any | null>(null)

onMounted(() => {
  restoreSession()
  loadGroups()
})

const resetForm = () => { form.value = { groupid: '', comment: '' } }

const handleCreate = async () => {
  if (!form.value.groupid) return alert('GroupID es requerido')
  loading.value = true
  const res = await createGroup(form.value.groupid, form.value.comment)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  resetForm()
  await loadGroups()
}

const loadGroups = async () => {
  loading.value = true
  groups.value = []
  const res = await listGroups()
  loading.value = false
  if (res.success) groups.value = res.data || []
}

const editGroup = (g: any) => { editing.value = { groupid: g.groupid, comment: g.comment || '' } }
const applyEdit = async () => {
  if (!editing.value) return
  loading.value = true
  const res = await updateGroup(editing.value.groupid, { comment: editing.value.comment })
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  editing.value = null
  await loadGroups()
}
const cancelEdit = () => { editing.value = null }

const removeGroup = async (g: any) => {
  if (!confirm('Eliminar grupo ' + g.groupid + '?')) return
  loading.value = true
  const res = await deleteGroup(g.groupid)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  await loadGroups()
}
</script>
