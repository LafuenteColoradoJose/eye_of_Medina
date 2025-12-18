<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p v-if="username" class="muted">Bienvenido, {{ username }}</p>
      </div>
    </div>

    <!-- Verificar si está autenticado -->
    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button 
        @click="router.push('/')"
        class="mt-2 px-4 py-2 rounded-md btn-primary"
      >
        Ir al Login
      </button>
    </div>

    <!-- Contenido del dashboard cuando está autenticado -->
    <div v-else class="space-y-6">
      <div class="flex gap-4">
        <button @click="getUsers" :disabled="loading" class="px-3 py-2 rounded btn-primary">{{ loading ? 'Cargando...' : 'Usuarios' }}</button>
        <button @click="getVMs" :disabled="loading" class="px-3 py-2 rounded btn-primary">{{ loading ? 'Cargando...' : 'Máquinas (VMs)' }}</button>
        <button @click="getPools" :disabled="loading" class="px-3 py-2 rounded btn-primary">{{ loading ? 'Cargando...' : 'Pools' }}</button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="section-card p-4 rounded shadow">
          <h3 class="font-bold mb-2">Usuarios</h3>
          <div v-if="users.length === 0" class="text-sm muted">No hay usuarios cargados.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="u in users" :key="u.userid">{{ u.userid }} — {{ u.email || u.comment || '' }}</li>
          </ul>
        </div>

        <div class="section-card p-4 rounded shadow">
          <h3 class="font-bold mb-2">Máquinas (VMs)</h3>
          <div v-if="vms.length === 0" class="text-sm muted">No hay VMs cargadas.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="vm in vms" :key="vm.vmid">{{ vm.name || vm.vmid }} — Nodo: {{ vm.node }} — Status: {{ vm.status }}</li>
          </ul>
        </div>

        <div class="section-card p-4 rounded shadow">
          <h3 class="font-bold mb-2">Pools</h3>
          <div v-if="pools.length === 0" class="text-sm muted">No hay pools cargados.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="p in pools" :key="p.poolid">{{ p.poolid }} — {{ p.comment || '' }}</li>
          </ul>
        </div>
      </div>
      <!-- Botón para obtener versión de Proxmox -->
      <div class="section-card p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Información del Servidor</h2>
        <button 
          @click="getVersion"
          :disabled="loading"
          class="px-4 py-2 rounded-md btn-primary mb-4"
        >
          {{ loading ? 'Cargando...' : 'Obtener Versión de Proxmox' }}
        </button>

        <div v-if="versionInfo" class="p-4 rounded-md section-card">
          <pre class="text-sm">{{ JSON.stringify(versionInfo, null, 2) }}</pre>
        </div>

        <div v-if="error" class="status-error p-4 rounded-md mt-4">
          {{ error }}
        </div>
      </div>

      <!-- Ejemplo de listado de nodos -->
      <div class="section-card p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Nodos Proxmox</h2>
        <button 
          @click="getNodes"
          :disabled="loading"
          class="px-4 py-2 rounded-md btn-positive mb-4"
        >
          {{ loading ? 'Cargando...' : 'Listar Nodos' }}
        </button>

        <div v-if="nodes.length > 0" class="space-y-2">
          <div 
            v-for="node in nodes" 
            :key="node.node"
            class="p-4 rounded-md section-card"
          >
            <h3 class="font-bold">{{ node.node }}</h3>
            <p class="text-sm muted">Status: {{ node.status }}</p>
            <p class="text-sm muted">Memoria: {{ formatBytes(node.mem) }} / {{ formatBytes(node.maxmem) }}</p>
            <p class="text-sm muted">CPU: {{ (node.cpu * 100).toFixed(2) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const { username, isAuthenticated, proxmoxRequest, restoreSession } = useProxmox();

// Estado
const loading = ref(false);
const error = ref('');
const versionInfo = ref<any>(null);
const nodes = ref<any[]>([]);
const hasLoaded = ref(false);

// Restaurar sesión al montar el componente
onMounted(() => {
  restoreSession();
  if (isAuthenticated.value) loadAllDashboard();
});

watch(isAuthenticated, (val) => {
  if (val && !hasLoaded.value) loadAllDashboard();
});

// Carga inicial para evitar clicks manuales
const loadAllDashboard = async () => {
  if (hasLoaded.value) return;
  loading.value = true;
  error.value = '';

  const [usersRes, vmsRes, poolsRes, nodesRes, versionRes] = await Promise.all([
    proxmoxRequest('/access/users', 'GET'),
    proxmoxRequest('/cluster/resources?type=vm', 'GET'),
    proxmoxRequest('/pools', 'GET'),
    proxmoxRequest('/nodes', 'GET'),
    proxmoxRequest('/version', 'GET'),
  ]);

  if (usersRes.success) users.value = usersRes.data || [];
  if (vmsRes.success) vms.value = vmsRes.data || [];
  if (poolsRes.success) pools.value = poolsRes.data || [];
  if (nodesRes.success) nodes.value = nodesRes.data || [];
  if (versionRes.success) versionInfo.value = versionRes.data || null;

  if (!usersRes.success || !vmsRes.success || !poolsRes.success || !nodesRes.success || !versionRes.success) {
    error.value = 'Algunos datos no se pudieron cargar. Intenta refrescar.';
  }

  hasLoaded.value = true;
  loading.value = false;
};

// Obtener versión de Proxmox
const getVersion = async () => {
  loading.value = true;
  error.value = '';
  versionInfo.value = null;

  const result = await proxmoxRequest('/version', 'GET');
  
  loading.value = false;

  if (result.success) {
    versionInfo.value = result.data;
  } else {
    error.value = result.message || 'Error al obtener la versión';
  }
};

// Obtener usuarios
const users = ref<any[]>([])
const getUsers = async () => {
  loading.value = true
  error.value = ''
  users.value = []

  const result = await proxmoxRequest('/access/users', 'GET')
  loading.value = false

  if (result.success) {
    users.value = result.data || []
  } else {
    error.value = result.message || 'Error al obtener usuarios'
  }
}

// Obtener VMs (cluster resources type=vm)
const vms = ref<any[]>([])
const getVMs = async () => {
  loading.value = true
  error.value = ''
  vms.value = []

  const result = await proxmoxRequest('/cluster/resources?type=vm', 'GET')
  loading.value = false

  if (result.success) {
    vms.value = result.data || []
  } else {
    error.value = result.message || 'Error al obtener VMs'
  }
}

// Obtener pools
const pools = ref<any[]>([])
const getPools = async () => {
  loading.value = true
  error.value = ''
  pools.value = []

  const result = await proxmoxRequest('/pools', 'GET')
  loading.value = false

  if (result.success) {
    pools.value = result.data || []
  } else {
    error.value = result.message || 'Error al obtener pools'
  }
}

// Obtener lista de nodos
const getNodes = async () => {
  loading.value = true;
  error.value = '';
  nodes.value = [];

  const result = await proxmoxRequest('/nodes', 'GET');
  
  loading.value = false;

  if (result.success) {
    nodes.value = result.data || [];
  } else {
    error.value = result.message || 'Error al obtener los nodos';
  }
};

// Formatear bytes
const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
</script>

<style>
</style>    