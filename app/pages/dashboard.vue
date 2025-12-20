<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-3xl font-bold mb-1">Dashboard</h1>
        <p v-if="username" class="muted">Bienvenido, {{ username }}</p>
      </div>
      <div class="flex gap-2 items-center">
        <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
        <button class="px-4 py-2 rounded btn-primary" :disabled="loading" @click="loadDashboard">
          {{ loading ? 'Actualizando...' : 'Refrescar' }}
        </button>
      </div>
    </div>

    <div v-if="!isAuthenticated" class="alert p-4 rounded">
      <p class="font-bold">No estás autenticado</p>
      <p class="mb-3">Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="px-4 py-2 rounded btn-primary">Ir al Login</button>
    </div>

    <div v-else class="space-y-6">
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="kpi-card">
          <p class="muted text-xs">CPU cluster</p>
          <div class="flex items-end justify-between">
            <span class="text-2xl font-bold">{{ kpiCpu }}</span>
            <span class="text-xs muted">media nodos</span>
          </div>
        </div>
        <div class="kpi-card">
          <p class="muted text-xs">RAM cluster</p>
          <div class="flex items-end justify-between">
            <span class="text-2xl font-bold">{{ kpiRam }}</span>
            <span class="text-xs muted">usado</span>
          </div>
        </div>
        <div class="kpi-card">
          <p class="muted text-xs">VMs encendidas</p>
          <div class="flex items-end justify-between">
            <span class="text-2xl font-bold">{{ runningVms }}</span>
            <span class="text-xs muted">de {{ totalVms }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <p class="muted text-xs">Pools</p>
          <div class="flex items-end justify-between">
            <span class="text-2xl font-bold">{{ pools.length }}</span>
            <span class="text-xs muted">activos</span>
          </div>
        </div>
      </div>

      <!-- Gráficas principales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="section-card p-4 rounded shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">Estado de VMs</h3>
            <span class="muted text-xs">Total {{ totalVms }}</span>
          </div>
          <ClientOnly>
            <ApexChart type="donut" height="260" :options="chartVmState.options" :series="chartVmState.series" />
          </ClientOnly>
          <p v-if="totalVms === 0" class="text-sm muted mt-2">No hay datos para mostrar.</p>
        </div>

        <div class="section-card p-4 rounded shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">CPU por nodo</h3>
            <span class="muted text-xs">% uso actual</span>
          </div>
          <ClientOnly>
            <ApexChart type="bar" height="260" :options="chartNodeCpu.options" :series="chartNodeCpu.series" />
          </ClientOnly>
          <p v-if="nodes.length === 0" class="text-sm muted mt-2">No hay nodos cargados.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="section-card p-4 rounded shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">VMs por pool</h3>
            <span class="muted text-xs">Distribución</span>
          </div>
          <ClientOnly>
            <ApexChart type="donut" height="260" :options="chartPool.options" :series="chartPool.series" />
          </ClientOnly>
          <p v-if="chartPool.series.length === 0" class="text-sm muted mt-2">No hay pools con VMs.</p>
        </div>

        <div class="section-card p-4 rounded shadow space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold">Top consumo</h3>
            <span class="muted text-xs">CPU / RAM</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p class="text-sm font-semibold mb-1">CPU</p>
              <ul class="space-y-1 text-sm">
                <li v-for="vm in topCpuVms" :key="vm.vmid" class="flex justify-between">
                  <span>{{ vmDisplay(vm) }}</span>
                  <span class="muted">{{ toPercent(vm.cpu || 0, 1) }}</span>
                </li>
                <li v-if="topCpuVms.length === 0" class="muted">Sin datos</li>
              </ul>
            </div>
            <div>
              <p class="text-sm font-semibold mb-1">RAM</p>
              <ul class="space-y-1 text-sm">
                <li v-for="vm in topMemVms" :key="vm.vmid" class="flex justify-between">
                  <span>{{ vmDisplay(vm) }}</span>
                  <span class="muted">{{ toPercent(vm.mem || 0, vm.maxmem || 1) }}</span>
                </li>
                <li v-if="topMemVms.length === 0" class="muted">Sin datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="section-card p-4 rounded shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">Salud de nodos</h3>
            <span class="muted text-xs">Estado y recursos</span>
          </div>
          <div v-if="nodes.length === 0" class="text-sm muted">No hay nodos cargados.</div>
          <div v-else class="space-y-3">
            <div v-for="n in nodes" :key="n.node" class="border rounded p-3 flex flex-col gap-1">
              <div class="flex justify-between items-center">
                <span class="font-semibold">{{ n.node }}</span>
                <span :class="n.status === 'online' ? 'text-green-600' : 'text-red-500'" class="text-xs uppercase">{{ n.status }}</span>
              </div>
              <div class="flex justify-between text-xs muted">
                <span>CPU: {{ toPercent(n.cpu || 0, 1) }}</span>
                <span>RAM: {{ toPercent(n.mem || 0, n.maxmem || 1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card p-4 rounded shadow">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">Detalle de pools</h3>
            <span class="muted text-xs">VMs por pool</span>
          </div>
          <div v-if="pools.length === 0" class="text-sm muted">No hay pools configurados.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="p in pools" :key="p.poolid" class="flex justify-between items-center border rounded p-2">
              <span>{{ p.poolid }}</span>
              <span class="muted">{{ poolCounts[p.poolid] || 0 }} VMs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import type { ApexOptions } from 'apexcharts'

type VmResource = {
  vmid: number
  name?: string
  node: string
  type: 'qemu' | 'lxc'
  status?: string
  cpu?: number
  mem?: number
  maxmem?: number
  pool?: string
}

type NodeResource = {
  node: string
  status?: string
  cpu?: number
  mem?: number
  maxmem?: number
}

type Pool = { poolid: string; comment?: string }

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

const router = useRouter()
const { username, isAuthenticated, proxmoxRequest, restoreSession } = useProxmox()

const loading = ref(false)
const error = ref('')
const nodes = ref<NodeResource[]>([])
const vms = ref<VmResource[]>([])
const pools = ref<Pool[]>([])

const hasLoaded = ref(false)

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadDashboard()
})

watch(isAuthenticated, (val) => {
  if (val && !hasLoaded.value) loadDashboard()
})

const loadDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    const [vmsRes, poolsRes, nodesRes] = await Promise.all([
      proxmoxRequest('/cluster/resources?type=vm', 'GET'),
      proxmoxRequest('/pools', 'GET'),
      proxmoxRequest('/nodes', 'GET'),
    ])

    if (vmsRes.success) vms.value = (vmsRes.data || []) as VmResource[]
    if (poolsRes.success) pools.value = (poolsRes.data || []) as Pool[]
    if (nodesRes.success) nodes.value = (nodesRes.data || []) as NodeResource[]

    if (!vmsRes.success || !poolsRes.success || !nodesRes.success) {
      error.value = 'Algunos datos no se pudieron cargar.'
    }
    hasLoaded.value = true
  } catch (err: unknown) {
    error.value = 'Error cargando el dashboard'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const totalVms = computed(() => vms.value.length)
const runningVms = computed(() => vms.value.filter((vm) => vm.status === 'running').length)

const kpiCpu = computed(() => {
  if (!nodes.value.length) return '—'
  const avg = nodes.value.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodes.value.length
  return `${(avg * 100).toFixed(1)}%`
})

const kpiRam = computed(() => {
  const total = nodes.value.reduce((sum, n) => sum + (n.maxmem || 0), 0)
  const used = nodes.value.reduce((sum, n) => sum + (n.mem || 0), 0)
  if (!total) return '—'
  return `${((used / total) * 100).toFixed(1)}%`
})

const chartVmState = computed(() => {
  const running = vms.value.filter((vm) => vm.status === 'running').length
  const stopped = vms.value.filter((vm) => vm.status !== 'running').length
  return {
    series: totalVms.value ? [running, stopped] : [],
    options: {
      labels: ['Running', 'Paradas'],
      legend: { position: 'bottom' as const },
      colors: ['#10b981', '#f97316'],
      dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
    } satisfies ApexOptions,
  }
})

const chartNodeCpu = computed(() => {
  const labels = nodes.value.map((n) => n.node)
  const data = nodes.value.map((n) => Number(((n.cpu || 0) * 100).toFixed(1)))
  return {
    series: [{ name: 'CPU %', data }],
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      plotOptions: { bar: { distributed: true, borderRadius: 4 } },
      colors: ['#0ea5e9', '#6366f1', '#f97316', '#10b981', '#ef4444'],
    } satisfies ApexOptions,
  }
})

const poolCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  vms.value.forEach((vm) => {
    const key = vm.pool || 'Sin pool'
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
})

const chartPool = computed(() => {
  const entries = Object.entries(poolCounts.value)
  return {
    series: entries.map(([, count]) => count),
    options: {
      labels: entries.map(([name]) => name),
      legend: { position: 'bottom' as const },
      colors: ['#6366f1', '#0ea5e9', '#10b981', '#f97316', '#ef4444', '#8b5cf6'],
      dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
    } satisfies ApexOptions,
  }
})

const topCpuVms = computed(() =>
  [...vms.value]
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, 5)
)

const topMemVms = computed(() =>
  [...vms.value]
    .filter((vm) => vm.maxmem)
    .sort((a, b) => (b.mem || 0) / (b.maxmem || 1) - (a.mem || 0) / (a.maxmem || 1))
    .slice(0, 5)
)

const vmDisplay = (vm: VmResource) => vm.name || `VM ${vm.vmid}`

const toPercent = (value: number, max: number) => {
  if (!max) return '—'
  return `${((value / max) * 100).toFixed(1)}%`
}
</script>

<style scoped>
.kpi-card {
  background-color: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 6px 20px rgba(33, 52, 72, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>