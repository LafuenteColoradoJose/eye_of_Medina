<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Gestión de Pools</h1>

    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
    </div>

    <div v-else>
      <section class="mb-6 section-card p-4 rounded shadow">
        <h2 class="font-bold mb-2">Crear pool</h2>
        <form @submit.prevent="handleCreate" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm">Pool ID</label>
            <input v-model="form.poolid" required class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm">Descripción</label>
            <input v-model="form.comment" class="w-full p-2 border rounded" />
          </div>

          <div class="col-span-1 md:col-span-2 flex gap-2 justify-end">
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
                  <button @click="startEdit(p)" class="px-2 py-1 rounded mr-2 btn-warning">Editar</button>
                  <button @click="deletePool(p.poolid)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-if="editing" class="fixed inset-0 overlay-backdrop flex items-center justify-center">
        <div class="section-card p-6 rounded shadow w-full max-w-lg">
          <h3 class="font-bold mb-2">Editar pool {{ editing.poolid }}</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm">Descripción</label>
              <input v-model="editing.comment" class="w-full p-2 border rounded" />
            </div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button @click="applyEdit" class="px-4 py-2 rounded btn-positive" :disabled="loading">Guardar</button>
            <button @click="cancelEdit" class="px-4 py-2 rounded btn-muted">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

type Pool = {
  poolid: string
  comment?: string
}

type ProxmoxResponse<T> = {
  success?: boolean
  data?: T
  message?: string
}

const router = useRouter()
const { proxmoxRequest, restoreSession, isAuthenticated } = useProxmox()

const loading = ref<boolean>(false)
const pools = ref<Pool[]>([])
const form = ref<Pool>({ poolid: '', comment: '' })
const editing = ref<Pool | null>(null)

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadPools()
})

watch(isAuthenticated, (val) => {
  if (val && pools.value.length === 0) loadPools()
})

const loadPools = async (): Promise<void> => {
  loading.value = true
  const res = await proxmoxRequest('/pools', 'GET') as ProxmoxResponse<Pool[]>
  loading.value = false
  if (res && res.success) {
    pools.value = res.data || []
  } else {
    alert('Error cargando pools: ' + (res.message || JSON.stringify(res)))
  }
}

const handleCreate = async (): Promise<void> => {
  if (!form.value.poolid) return alert('Pool ID requerido')
  loading.value = true
  const res = await proxmoxRequest('/pools', 'POST', undefined, { poolid: form.value.poolid, comment: form.value.comment }) as ProxmoxResponse<unknown>
  loading.value = false
  if (!res || res.success === false) {
    return alert('Error creando pool: ' + (res?.message || JSON.stringify(res)))
  }
  form.value.poolid = ''
  form.value.comment = ''
  await loadPools()
}

const startEdit = (pool: Pool) => {
  editing.value = { ...pool }
}

const applyEdit = async (): Promise<void> => {
  if (!editing.value) return
  loading.value = true
  const res = await proxmoxRequest(`/pools/${encodeURIComponent(editing.value.poolid)}`, 'PUT', undefined, { comment: editing.value.comment }) as ProxmoxResponse<unknown>
  loading.value = false
  if (!res || res.success === false) {
    return alert('Error actualizando pool: ' + (res?.message || JSON.stringify(res)))
  }
  editing.value = null
  await loadPools()
}

const cancelEdit = () => { editing.value = null }

const deletePool = async (poolid: string): Promise<void> => {
  if (!confirm('Eliminar pool ' + poolid + '?')) return
  loading.value = true
  const res = await proxmoxRequest(`/pools/${encodeURIComponent(poolid)}`, 'DELETE') as ProxmoxResponse<unknown>
  loading.value = false
  if (!res || res.success === false) {
    return alert('Error eliminando pool: ' + (res?.message || JSON.stringify(res)))
  }
  await loadPools()
}
</script>
