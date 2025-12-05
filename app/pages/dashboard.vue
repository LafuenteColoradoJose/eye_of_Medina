<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p v-if="username" class="text-gray-600">Bienvenido, {{ username }}</p>
      </div>
      <button 
        @click="handleLogout"
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Cerrar Sesión
      </button>
    </div>

    <!-- Verificar si está autenticado -->
    <div v-if="!isAuthenticated" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button 
        @click="router.push('/')"
        class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Ir al Login
      </button>
    </div>

    <!-- Contenido del dashboard cuando está autenticado -->
    <div v-else class="space-y-6">
      <!-- Botón para obtener versión de Proxmox -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Información del Servidor</h2>
        <button 
          @click="getVersion"
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 mb-4"
        >
          {{ loading ? 'Cargando...' : 'Obtener Versión de Proxmox' }}
        </button>

        <div v-if="versionInfo" class="bg-gray-50 p-4 rounded-md">
          <pre class="text-sm">{{ JSON.stringify(versionInfo, null, 2) }}</pre>
        </div>

        <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded-md mt-4">
          {{ error }}
        </div>
      </div>

      <!-- Ejemplo de listado de nodos -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Nodos Proxmox</h2>
        <button 
          @click="getNodes"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 mb-4"
        >
          {{ loading ? 'Cargando...' : 'Listar Nodos' }}
        </button>

        <div v-if="nodes.length > 0" class="space-y-2">
          <div 
            v-for="node in nodes" 
            :key="node.node"
            class="bg-gray-50 p-4 rounded-md"
          >
            <h3 class="font-bold">{{ node.node }}</h3>
            <p class="text-sm text-gray-600">Status: {{ node.status }}</p>
            <p class="text-sm text-gray-600">Memoria: {{ formatBytes(node.mem) }} / {{ formatBytes(node.maxmem) }}</p>
            <p class="text-sm text-gray-600">CPU: {{ (node.cpu * 100).toFixed(2) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const { username, isAuthenticated, logout, proxmoxRequest, restoreSession } = useProxmox();

// Estado
const loading = ref(false);
const error = ref('');
const versionInfo = ref<any>(null);
const nodes = ref<any[]>([]);

// Restaurar sesión al montar el componente
onMounted(() => {
  restoreSession();
});

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

// Cerrar sesión
const handleLogout = () => {
  logout();
  router.push('/');
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