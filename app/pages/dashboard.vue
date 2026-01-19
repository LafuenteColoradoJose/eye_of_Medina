<template>
  <div class="p-4 space-y-4 max-w-[1920px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Dashboard</h1>
        <p v-if="username" class="text-text text-sm mt-1">Conectado como <span class="font-bold text-primary">{{
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <StatsCard label="Bridges Activos" :value="String(totalBridges)" subtext="Puentes de red en nodos">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="9" width="20" height="6" rx="2" ry="2"></rect>
            <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"></path>
            <path d="M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"></path>
          </svg>
        </template>
      </StatsCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- VM Status -->
      <div class="bg-card border border-border rounded-xl p-3 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold text-base text-text">Estado de VMs</h2>
          <span class="text-[10px] bg-muted-surface px-2 py-0.5 rounded-full text-text-muted border border-border">Total
            {{
              totalVms }}</span>
        </div>
        <div class="min-h-[140px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="totalVms > 0" type="donut" height="140" :options="chartVmState.options"
              :series="chartVmState.series" />
            <div v-else class="text-center text-text-muted text-xs">
              <p>Sin datos</p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- CPU Nodes -->
      <div class="bg-card border border-border rounded-xl p-3 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold text-base text-text">Carga de CPU (Nodos)</h2>
        </div>
        <div class="min-h-[140px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="nodes.length > 0" type="bar" height="140" :options="chartNodeCpu.options"
              :series="chartNodeCpu.series" />
            <div v-else class="text-center text-text-muted text-xs">
              <p>Sin datos</p>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Secondary Charts & Lists -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Pool Distro -->
      <div class="lg:col-span-1 bg-card border border-border rounded-xl p-3 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold text-base text-text">Distribución por Pool</h2>
        </div>
        <div class="min-h-[150px] flex items-center justify-center">
          <ClientOnly>
            <ApexChart v-if="chartPool.series.length > 0" type="pie" height="160" :options="chartPool.options"
              :series="chartPool.series" />
            <div v-else class="text-center text-text-muted text-xs py-4">
              <p>Sin pools</p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Top Consumers -->
      <div class="lg:col-span-2 bg-card border border-border rounded-xl p-3 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-base text-text">Top Consumidores</h2>
            <NuxtLink to="/machines" class="text-[10px] text-primary hover:underline cursor-pointer"
              title="Ver tabla completa de máquinas">
              (Analizar todo)
            </NuxtLink>
          </div>

          <!-- Mode Toggles -->
          <div class="flex bg-muted-surface p-0.5 rounded-lg border border-border">
            <button v-for="mode in ['vm', 'pool', 'cluster']" :key="mode" @click="consumerMode = mode as any"
              class="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-all"
              :class="consumerMode === mode ? 'bg-background text-primary shadow-sm' : 'text-text-muted hover:text-text'">
              {{ mode }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <!-- CPU List -->
          <div class="space-y-2">
            <h3 class="text-[10px] font-semibold text-text-muted uppercase tracking-wider flex justify-between">
              <span>Mayor uso de CPU</span>
              <span class="text-[9px] opacity-70 normal-case">
                {{ consumerMode === 'vm' ? '% Asignado' : consumerMode === 'pool' ? '% del Pool' : '% del Cluster' }}
              </span>
            </h3>
            <div v-if="topCpuVms.length === 0" class="text-xs text-text-muted italic">Sin datos</div>
            <ul v-else class="space-y-1">
              <li v-for="(vm, i) in topCpuVms" :key="vm.vmid"
                class="flex items-center justify-between p-1.5 rounded hover:bg-muted-surface transition-colors cursor-default group">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono text-text-muted w-3">{{ i + 1 }}</span>
                  <div class="flex flex-col">
                    <span
                      class="font-medium text-xs text-text group-hover:text-primary transition-colors truncate max-w-[100px]">{{
                        vmDisplay(vm)
                      }}</span>
                    <span class="text-[10px] text-text-muted leading-none">{{ vm.node }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-12 h-1 bg-border rounded-full overflow-hidden">
                    <div class="h-full bg-primary" :style="{ width: getVmMetric(vm, 'cpu') + '%' }"></div>
                  </div>
                  <span class="text-[10px] font-bold text-primary w-8 text-right">{{ formatMetric(getVmMetric(vm,
                    'cpu'))
                    }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- RAM List -->
          <div class="space-y-2">
            <h3 class="text-[10px] font-semibold text-text-muted uppercase tracking-wider flex justify-between">
              <span>Mayor uso de RAM</span>
              <span class="text-[9px] opacity-70 normal-case">
                {{ consumerMode === 'vm' ? '% Asignado' : consumerMode === 'pool' ? '% del Pool' : '% del Cluster' }}
              </span>
            </h3>
            <div v-if="topMemVms.length === 0" class="text-xs text-text-muted italic">Sin datos</div>
            <ul v-else class="space-y-1">
              <li v-for="(vm, i) in topMemVms" :key="vm.vmid"
                class="flex items-center justify-between p-1.5 rounded hover:bg-muted-surface transition-colors cursor-default group">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono text-text-muted w-3">{{ i + 1 }}</span>
                  <div class="flex flex-col">
                    <span
                      class="font-medium text-xs text-text group-hover:text-primary transition-colors truncate max-w-[100px]">{{
                        vmDisplay(vm)
                      }}</span>
                    <span class="text-[10px] text-text-muted leading-none">{{ vm.node }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-12 h-1 bg-border rounded-full overflow-hidden">
                    <div class="h-full bg-accent" :style="{ width: getVmMetric(vm, 'mem') + '%' }"></div>
                  </div>
                  <span class="text-[10px] font-bold text-accent w-8 text-right">{{ formatMetric(getVmMetric(vm, 'mem'))
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
      <h2 class="font-bold text-lg text-text px-1">Estado de Nodos</h2>
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
useHead({ title: 'Dashboard' })
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
  maxcpu?: number
  mem?: number
  maxmem?: number
  pool?: string
}

type NodeResource = {
  node: string
  status?: string
  cpu?: number
  maxcpu?: number
  mem?: number
  maxmem?: number
}

type Pool = { poolid: string; comment?: string }

// -- Async Components --
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))

// -- Composables --
const { username, isAuthenticated, proxmoxRequest, restoreSession, getNodeNetworks } = useProxmox()

// -- State --
const loading = ref(false)
const hasLoaded = ref(false)
const error = ref('')
const lastRefreshed = ref<Date | null>(null)
const consumerMode = ref<'vm' | 'pool' | 'cluster'>('vm')

const nodes = ref<NodeResource[]>([])
const vms = ref<VmResource[]>([])
const pools = ref<Pool[]>([])
const totalBridges = ref(0) // -- Lifecycle --
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

    // Cargar redes de forma asíncrona para no bloquear
    if (nodes.value.length > 0) {
      const netPromises = nodes.value
        .filter(n => n.status === 'online')
        .map(async (n) => {
          const res = await getNodeNetworks(n.node)
          if (res.success && Array.isArray(res.data)) {
            // Contar bridges activos
            return res.data.filter((net: any) => net.type === 'bridge' && net.active).length
          }
          return 0
        })

      const results = await Promise.all(netPromises)
      totalBridges.value = results.reduce((sum, count) => sum + count, 0)
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

// Calculations for View Modes
const clusterTotals = computed(() => {
  return {
    cpu: nodes.value.reduce((sum, n) => sum + (n.maxcpu || 0), 0),
    mem: nodes.value.reduce((sum, n) => sum + (n.maxmem || 0), 0),
  }
})

const poolTotals = computed(() => {
  const map = new Map<string, { cpu: number, mem: number }>()

  // Initialize pools
  pools.value.forEach(p => map.set(p.poolid, { cpu: 0, mem: 0 }))
  map.set('Sin Pool', { cpu: 0, mem: 0 })

  // Sum max capacities of all VMs in each pool
  vms.value.forEach(vm => {
    const key = vm.pool || 'Sin Pool'
    if (!map.has(key)) map.set(key, { cpu: 0, mem: 0 })
    const entry = map.get(key)!
    entry.cpu += (vm.maxcpu || 1)
    entry.mem += (vm.maxmem || 0)
  })

  return map
})

const getVmMetric = (vm: VmResource, type: 'cpu' | 'mem') => {
  // Raw usage values
  // vm.cpu is ratio (0..1) relative to vm.maxcpu. Actual cores used = vm.cpu * vm.maxcpu
  const rawCpu = (vm.cpu || 0) * (vm.maxcpu || 1)
  const rawMem = (vm.mem || 0)

  if (consumerMode.value === 'vm') {
    if (type === 'cpu') return (vm.cpu || 0) * 100 // Already ratio
    return (rawMem / (vm.maxmem || 1)) * 100
  }

  if (consumerMode.value === 'pool') {
    const key = vm.pool || 'Sin Pool'
    const totals = poolTotals.value.get(key)
    if (!totals) return 0

    if (type === 'cpu') return totals.cpu ? (rawCpu / totals.cpu) * 100 : 0
    return totals.mem ? (rawMem / totals.mem) * 100 : 0
  }

  if (consumerMode.value === 'cluster') {
    if (type === 'cpu') return clusterTotals.value.cpu ? (rawCpu / clusterTotals.value.cpu) * 100 : 0
    return clusterTotals.value.mem ? (rawMem / clusterTotals.value.mem) * 100 : 0
  }

  return 0
}

const formatMetric = (val: number) => {
  if (val < 0.1 && val > 0) return '<0.1%'
  return `${val.toFixed(1)}%`
}

const topCpuVms = computed(() =>
  [...vms.value]
    .sort((a, b) => getVmMetric(b, 'cpu') - getVmMetric(a, 'cpu'))
    .slice(0, 5)
)

const topMemVms = computed(() =>
  [...vms.value]
    .filter((vm) => vm.maxmem)
    .sort((a, b) => getVmMetric(b, 'mem') - getVmMetric(a, 'mem'))
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

// OLD helper replaced by getVmMetric logic
const toPercent = (value: number, max: number) => {
  if (!max) return '—'
  return `${((value / max) * 100).toFixed(1)}%`
}

// -- Charts Config --
// Mapped colors from our CSS variables (hardcoded hex matches for Apex)
const COLORS = {
  primary: '#1371C2',
  accent: '#D85676',
  positive: '#4FA866',
  warning: '#ffd900',
  danger: '#D85676',
  muted: '#94a3b8' // Visible gray for "Stopped" state
}

const chartVmState = computed(() => {
  const running = vms.value.filter((vm) => vm.status === 'running').length
  const stopped = vms.value.filter((vm) => vm.status !== 'running').length
  return {
    series: [running, stopped],
    options: {
      chart: { fontFamily: 'inherit', background: 'transparent', foreColor: 'var(--color-text)' },
      labels: ['Running', 'Stopped'],
      legend: { position: 'bottom', labels: { colors: 'var(--color-text)' } },
      colors: [COLORS.positive, COLORS.muted],
      plotOptions: { pie: { donut: { size: '65%' } } },
      dataLabels: { enabled: false },
      stroke: { show: false },
      tooltip: { theme: 'dark', style: { fontSize: '12px' } }
    } satisfies ApexOptions,
  }
})

const chartNodeCpu = computed(() => {
  const labels = nodes.value.map((n) => n.node)
  const data = nodes.value.map((n) => Number(((n.cpu || 0) * 100).toFixed(1)))
  return {
    series: [{ name: 'CPU (%)', data }],
    options: {
      chart: { toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent', foreColor: 'var(--color-text)' },
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
      tooltip: { theme: 'dark', style: { fontSize: '12px' } }
    } satisfies ApexOptions,
  }
})

const chartPool = computed(() => {
  const allEntries = Object.entries(poolCounts.value)
  // Ordenar por cantidad de VMs (mayor a menor)
  allEntries.sort((a, b) => b[1] - a[1])

  let finalEntries = []
  if (allEntries.length > 5) {
    const top5 = allEntries.slice(0, 5)
    const others = allEntries.slice(5)
    const othersCount = others.reduce((sum, [, count]) => sum + count, 0)
    finalEntries = [...top5, ['Otros', othersCount]]
  } else {
    finalEntries = allEntries
  }

  return {
    series: finalEntries.length ? finalEntries.map(([, count]) => count) : [],
    options: {
      chart: { fontFamily: 'inherit', background: 'transparent', foreColor: 'var(--color-text)' },
      labels: finalEntries.map(([name]) => String(name)),
      legend: { position: 'bottom', labels: { colors: 'var(--color-text)' }, fontSize: '11px' },
      colors: [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.positive, COLORS.danger, COLORS.muted],
      dataLabels: { enabled: true, style: { fontSize: '10px' } },
      stroke: { width: 0 },
      tooltip: { theme: 'dark', style: { fontSize: '12px' } }
    } satisfies ApexOptions,
  }
})
</script>