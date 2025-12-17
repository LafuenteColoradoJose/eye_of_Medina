<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Pools</h1>

    <section class="mb-6 section-card p-4 rounded shadow">
      <h2 class="font-bold mb-2">Crear pool</h2>
      <form @submit.prevent="handleCreate" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm">Pool ID</label>
          <input v-model="form.poolid" required class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm">Descripción</label>
          <input v-model="form.comment" class="w-full p-2 border rounded" />
        </div>

        <div class="col-span-2 flex gap-2 justify-end">
          <button type="submit" :disabled="loading" class="px-4 py-2 rounded btn-positive">Crear</button>
        </div>
      </form>
    </section>

    <section class="section-card p-4 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold">Pools existentes</h2>
        <div class="flex gap-2">
          <button @click="loadPools" class="px-3 py-2 rounded btn-primary">Refrescar</button>
        </div>
      </div>

      <div v-if="loading" class="text-sm muted">Cargando...</div>
      <div v-else>
        <div v-if="pools.length === 0" class="text-sm muted">No hay pools.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">Pool ID</th>
              <th class="p-2">Descripción</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pools" :key="p.poolid" class="border-b">
              <td class="p-2">{{ p.poolid }}</td>
              <td class="p-2">{{ p.comment || '-' }}</td>
              <td class="p-2">
                <button @click="deletePool(p.poolid)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { proxmoxRequest, restoreSession } = useProxmox()

const loading = ref(false)
const pools = ref<any[]>([])
const form = ref({ poolid: '', comment: '' })

onMounted(() => {
  restoreSession()
  loadPools()
})

const loadPools = async () => {
  loading.value = true
  const res = await proxmoxRequest('/pools', 'GET')
  loading.value = false
  if (res && res.success) {
    pools.value = res.data || []
  } else {
    alert('Error cargando pools: ' + (res.message || JSON.stringify(res)))
  }
}

const handleCreate = async () => {
  if (!form.value.poolid) return alert('Pool ID requerido')
  loading.value = true
  const res = await proxmoxRequest('/pools', 'POST', undefined, { poolid: form.value.poolid, comment: form.value.comment })
  loading.value = false
  if (!res || res.success === false) {
    return alert('Error creando pool: ' + (res?.message || JSON.stringify(res)))
  }
  form.value.poolid = ''
  form.value.comment = ''
  await loadPools()
}

const deletePool = async (poolid: string) => {
  if (!confirm('Eliminar pool ' + poolid + '?')) return
  loading.value = true
  const res = await proxmoxRequest(`/pools/${encodeURIComponent(poolid)}`, 'DELETE')
  loading.value = false
  if (!res || res.success === false) {
    return alert('Error eliminando pool: ' + (res?.message || JSON.stringify(res)))
  }
  await loadPools()
}
</script>
