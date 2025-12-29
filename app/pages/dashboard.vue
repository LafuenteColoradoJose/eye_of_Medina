<template>
  <div class="p-6 space-y-8 max-w-[1920px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Dashboard</h1>
        <p v-if="username" class="text-text-muted text-sm mt-1">Conectado como <span class="font-medium text-primary">{{
            username }}</span></p>
      </div>
      <div class="flex gap-3 items-center">
        <span v-if="lastRefreshed" class="text-xs text-text-muted hidden sm:inline-block">
          Actualizado: {{ lastRefreshed.toLocaleTimeString() }}
        </span>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="loading" @click="loadDashboard">
          <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          {{ loading ? 'Actualizando...' : 'Refrescar' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="bg-danger/10 border border-danger/20 text-danger p-4 rounded-lg flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard label="CPU Cluster" :value="kpiCpu" subtext="Media de uso en nodos">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 14v4" />
            <path d="M15 14v4" />
            <path d="M9 10H7" />
            <path d="M9 6H7" />
            <path d="M15 6h2" />
            <path d="M15 10h2" />
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="RAM Cluster" :value="kpiRam" subtext="Memoria total asignada">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 19v-3" />
            <path d="M10 19v-3" />
            <path d="M14 19v-3" />
            <path d="M18 19v-3" />
            <path d="M8 11V9" />
            <path d="M16 11V9" />
            <path d="M12 11V9" />
            <path d="M2 15h20" />
            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="VMs Activas" :value="String(runningVms)" :subtext="`De un total de ${totalVms}`">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
            <line x1="6" x2="6.01" y1="6" y2="6" />
            <line x1="6" x2="6.01" y1="18" y2="18" />
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="Pools" :value="String(pools.length)" subtext="Grupos de recursos">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
        </template>
      </StatsCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- VM Status -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-lg text-text">Estado de VMs</h3>
          <span class="text-xs bg-muted-surface px-2 py-1 rounded-full text-text-muted border border-border">Total {{
            totalVms }}</span>
        </div>
        <div class="min-h-[260px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="totalVms > 0" type="donut" height="260" :options="chartVmState.options"
              :series="chartVmState.series" />
            <div v-else class="text-center text-text-muted">
              <p>Sin datos de máquinas virtuales</p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- CPU Nodes -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-lg text-text">Carga de CPU (Nodos)</h3>
        </div>
        <div class="min-h-[260px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="nodes.length > 0" type="bar" height="260" :options="chartNodeCpu.options"
              :series="chartNodeCpu.series" />
            <div v-else class="text-center text-text-muted">
              <p>Sin información de nodos</p>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Secondary Charts & Lists -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Pool Distro -->
      <div class="lg:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-text">Distribución por Pool</h3>
        </div>
        <div class="min-h-[200px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="chartPool.series.length > 0" type="pie" height="240" :options="chartPool.options"
              :series="chartPool.series" />
            <div v-else class="text-center text-text-muted py-8">
              <p>No hay pools activos</p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Top Consumers -->
      <div class="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-text">Top Consumidores</h3>
          <div class="flex gap-2 text-xs">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span> CPU</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-accent"></span> RAM</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          <!-- CPU List -->
          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Mayor uso de CPU</h4>
            <div v-if="topCpuVms.length === 0" class="text-sm text-text-muted italic">Sin datos</div>
            <ul v-else class="space-y-2">
              <li v-for="(vm, i) in topCpuVms" :key="vm.vmid"
                class="flex items-center justify-between p-2 rounded hover:bg-muted-surface transition-colors cursor-default group">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-text-muted w-4">{{ i + 1 }}</span>
                  <div class="flex flex-col">
                    <span class="font-medium text-sm text-text group-hover:text-primary transition-colors">{{
                      vmDisplay(vm)
                      }}</span>
                    <span class="text-[10px] text-text-muted">{{ vm.node }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                    <div class="h-full bg-primary" :style="{ width: toPercent(vm.cpu || 0, 1) }"></div>
                  </div>
                  <span class="text-xs font-bold text-primary w-10 text-right">{{ toPercent(vm.cpu || 0, 1) }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- RAM List -->
          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Mayor uso de RAM</h4>
            <div v-if="topMemVms.length === 0" class="text-sm text-text-muted italic">Sin datos</div>
            <ul v-else class="space-y-2">
              <li v-for="(vm, i) in topMemVms" :key="vm.vmid"
                class="flex items-center justify-between p-2 rounded hover:bg-muted-surface transition-colors cursor-default group">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-text-muted w-4">{{ i + 1 }}</span>
                  <div class="flex flex-col">
                    <span class="font-medium text-sm text-text group-hover:text-primary transition-colors">{{
                      vmDisplay(vm)
                      }}</span>
                    <span class="text-[10px] text-text-muted">{{ vm.node }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                    <div class="h-full bg-accent" :style="{ width: toPercent(vm.mem || 0, vm.maxmem || 1) }"></div>
                  </div>
                  <span class="text-xs font-bold text-accent w-10 text-right">{{ toPercent(vm.mem || 0, vm.maxmem || 1)
                    }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Node Health Grid -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg text-text px-1">Estado de Nodos</h3>
      <div v-if="nodes.length === 0" class="text-text-muted px-1">No hay nodos disponibles</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="n in nodes" :key="n.node"
          class="bg-card border border-border p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <!-- Status Indicator Line -->
          <div class="absolute left-0 top-0 bottom-0 w-1" :class="n.status === 'online' ? 'bg-positive' : 'bg-danger'">
          </div>

          <div class="p-2 rounded-full bg-muted-surface shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text">
              <rect width="8" height="18" x="3" y="3" rx="1" />
              <rect width="8" height="18" x="13" y="3" rx="1" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <h4 class="font-bold text-sm truncate" :title="n.node">{{ n.node }}</h4>
              <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border"
                :class="n.status === 'online' ? 'bg-positive-soft text-positive-strong border-positive/20' : 'bg-danger-soft text-danger-strong border-danger/20'">
                {{ n.status }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-text-muted mt-2">
              <div class="flex flex-col">
                <span class="text-[10px] uppercase">CPU</span>
                <span class="font-mono text-text">{{ toPercent(n.cpu || 0, 1) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] uppercase">RAM</span>
                <span class="font-mono text-text">{{ toPercent(n.mem || 0, n.maxmem || 1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import type { ApexOptions } from 'apexcharts'
import StatsCard from '~/components/StatsCard.vue'

// -- Types --
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

// -- Async Components --
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

// -- Composables --
const { username, isAuthenticated, proxmoxRequest, restoreSession } = useProxmox()

// -- State --
const loading = ref(false)
const hasLoaded = ref(false)
const error = ref('')
const lastRefreshed = ref<Date | null>(null)

const nodes = ref<NodeResource[]>([])
const vms = ref<VmResource[]>([])
const pools = ref<Pool[]>([])

// -- Lifecycle --
onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadDashboard()
})

watch(isAuthenticated, (val) => {
  if (val && !hasLoaded.value) loadDashboard()
})

// -- Actions --
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
      error.value = 'Algunos datos no se pudieron cargar parcial o totalmente.'
    }

    lastRefreshed.value = new Date()
    hasLoaded.value = true
  } catch (err: unknown) {
    error.value = 'Error crítico cargando el dashboard.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// -- Computed Metrics --
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

const poolCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  vms.value.forEach((vm) => {
    const key = vm.pool || 'Sin pool'
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
})

// -- Helpers --
const vmDisplay = (vm: VmResource) => vm.name || `VM ${vm.vmid}`

const toPercent = (value: number, max: number) => {
  if (!max) return '—'
  return `${((value / max) * 100).toFixed(1)}%`
}

// -- Charts Config --
// Mapped colors from our CSS variables (hardcoded hex matches for Apex)
const COLORS = {
  primary: '#547792',
  accent: '#94B4C1',
  positive: '#5c9f87',
  warning: '#c3a04b',
  danger: '#b85c5c',
  muted: '#EAE0CF'
}

const chartVmState = computed(() => {
  const running = vms.value.filter((vm) => vm.status === 'running').length
  const stopped = vms.value.filter((vm) => vm.status !== 'running').length
  return {
    series: [running, stopped],
    options: {
      chart: { fontFamily: 'inherit', background: 'transparent' },
      labels: ['Running', 'Stopped'],
      legend: { position: 'bottom', labels: { colors: 'var(--color-text)' } },
      colors: [COLORS.positive, COLORS.muted],
      plotOptions: { pie: { donut: { size: '65%' } } },
      dataLabels: { enabled: false },
      stroke: { show: false },
      tooltip: { theme: 'light' }
    } satisfies ApexOptions,
  }
})

const chartNodeCpu = computed(() => {
  const labels = nodes.value.map((n) => n.node)
  const data = nodes.value.map((n) => Number(((n.cpu || 0) * 100).toFixed(1)))
  return {
    series: [{ name: 'CPU (%)', data }],
    options: {
      chart: { toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
      xaxis: {
        categories: labels,
        labels: { style: { colors: 'var(--color-text-muted)' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { style: { colors: 'var(--color-text-muted)' } } },
      grid: { borderColor: 'var(--color-border)', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
      colors: [COLORS.primary],
      fill: { opacity: 0.9 },
      tooltip: { theme: 'light' }
    } satisfies ApexOptions,
  }
})

const chartPool = computed(() => {
  const entries = Object.entries(poolCounts.value)
  return {
    series: entries.length ? entries.map(([, count]) => count) : [],
    options: {
      chart: { fontFamily: 'inherit', background: 'transparent' },
      labels: entries.map(([name]) => name),
      legend: { position: 'bottom', labels: { colors: 'var(--color-text)' } },
      colors: [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.positive, COLORS.danger],
      dataLabels: { enabled: true, style: { fontSize: '10px' } },
      stroke: { width: 0 },
      tooltip: { theme: 'light' }
    } satisfies ApexOptions,
  }
})
</script>