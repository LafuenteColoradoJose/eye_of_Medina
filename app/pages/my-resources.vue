<template>
    <div class="p-6">
        <header class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Mis Recursos
                </h1>
                <p class="muted mt-2">Bienvenido, {{ username }}. Aquí están tus máquinas asignadas.</p>
            </div>
            <button @click="loadResources"
                class="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
                <!-- Inline SVG: Refresh/Arrow Path -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" class="w-5 h-5" :class="{ 'animate-spin': loading }">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Refrescar</span>
            </button>
        </header>

        <!-- Loading State -->
        <div v-if="loading && resources.length === 0" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="resources.length === 0" class="text-center py-20 section-card rounded-xl">
            <div class="i-heroicons-computer-desktop w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-xl font-semibold mb-2">No tienes recursos asignados</h3>
            <p class="muted">Contacta con tu profesor si crees que esto es un error.</p>
        </div>

        <!-- Grid de Máquinas -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article v-for="vm in resources" :key="vm.vmid"
                class="section-card rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-800 flex flex-col">
                <!-- Card Header / Status -->
                <div class="p-4 border-b border-gray-800 flex justify-between items-center"
                    :class="statusColorBg(vm.status)">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" :class="statusColorDot(vm.status)"></div>
                        <span class="font-bold text-white tracking-wide">{{ vm.name }}</span>
                    </div>
                    <span class="text-xs font-mono opacity-80 text-white">#{{ vm.vmid }}</span>
                </div>

                <!-- Card Body -->
                <div class="p-6 flex-grow">
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="muted">Estado:</span>
                            <span class="font-medium capitalize" :class="statusColorText(vm.status)">{{ vm.status
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="muted">CPU:</span>
                            <span class="font-medium">{{ (vm.cpu * 100).toFixed(1) }}% de {{ vm.maxcpu }} vCores</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="muted">RAM:</span>
                            <span class="font-medium">{{ formatBytes(vm.mem) }} / {{ formatBytes(vm.maxmem) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="muted">Uptime:</span>
                            <span class="font-medium">{{ formatUptime(vm.uptime) }}</span>
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-800/50">
                        <p class="text-xs muted mb-1">Nota:</p>
                        <p class="text-sm italic ">{{ vm.tags ? 'Tags: ' + vm.tags : 'Sin etiquetas' }}</p>
                    </div>
                </div>

                <!-- Card Actions -->
                <!-- Card Actions -->
                <div class="p-3 bg-gray-900/30">
                    <!-- Power Controls -->
                    <div v-if="vm.status === 'stopped'" class="w-full">
                        <button @click="changePower(vm, 'start')" :disabled="actionLoading === vm.vmid"
                            class="w-full h-9 btn-positive rounded text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                            title="Encender Máquina">
                            <!-- Inline SVG: Play -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                            <span>INICIAR</span>
                        </button>
                    </div>

                    <div v-else class="grid grid-cols-3 gap-2 w-full">
                        <!-- Botón CONSOLA (Monitor) -->
                        <button @click="openConsole(vm)"
                            class="h-9 w-full !bg-indigo-600 hover:!bg-indigo-500 text-white rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide flex !items-center !justify-center gap-2 shadow-sm hover:shadow hover:brightness-110 transition-all"
                            title="Abrir Consola">
                            <!-- SVG: Computer Desktop (Siempre visible) -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                            <!-- Texto (Solo visible en Pantallas Grandes) -->
                            <span class="hidden lg:block">Consola</span>
                        </button>

                        <!-- Botón APAGAR (Power Button) -->
                        <button @click="changePower(vm, 'shutdown')" :disabled="actionLoading === vm.vmid"
                            class="h-9 w-full !bg-amber-600 hover:!bg-amber-500 text-white rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide flex !items-center !justify-center gap-2 shadow-sm hover:shadow hover:brightness-110 transition-all"
                            title="Apagar ordenadamente">
                            <!-- SVG: Power (Siempre visible) -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                            </svg>
                            <!-- Texto (Solo visible en Pantallas Grandes) -->
                            <span class="hidden lg:block">Apagar</span>
                        </button>

                        <!-- Botón KILL (Calavera) -->
                        <button @click="changePower(vm, 'stop')" :disabled="actionLoading === vm.vmid"
                            class="h-9 w-full !bg-rose-700 hover:!bg-rose-600 text-white rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide flex !items-center !justify-center gap-2 shadow-sm hover:shadow hover:brightness-110 transition-all border border-red-800"
                            title="Forzar Apagado">
                            <!-- SVG: Skull (Siempre visible) -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <!-- Texto (Solo visible en Pantallas Grandes) -->
                            <span class="hidden lg:block">Kill</span>
                        </button>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { listVMResources, proxmoxRequest, username, restoreSession } = useProxmox()
const resources = ref<any[]>([])
const loading = ref(false)
const actionLoading = ref<string | number | null>(null)

// Formatters
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUptime = (seconds: number) => {
    if (!seconds) return '-'
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${d}d ${h}h ${m}m`
}

const statusColorDot = (status: string) => {
    if (status === 'running') return 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
    return 'bg-gray-400'
}

const statusColorBg = (status: string) => {
    if (status === 'running') return 'bg-gradient-to-r from-green-600 to-emerald-600'
    return 'bg-gray-800'
}

const statusColorText = (status: string) => {
    if (status === 'running') return 'text-green-400'
    return 'text-gray-400'
}

// Logic
const loadResources = async () => {
    loading.value = true
    try {
        const res = await listVMResources()
        if (res.success && Array.isArray(res.data)) {
            // Filter out templates properly if needed, usually type 'qemu' or 'lxc'
            resources.value = res.data.filter((vm: any) => vm.type === 'qemu' || vm.type === 'lxc')
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const changePower = async (vm: any, action: 'start' | 'stop' | 'shutdown' | 'reset') => {
    if (action === 'stop' && !confirm(`¿Seguro que quieres forzar el apagado de ${vm.name}? Podrías perder datos.`)) return

    actionLoading.value = vm.vmid
    try {
        // POST /nodes/{node}/{type}/{vmid}/status/{action}
        const res = await proxmoxRequest(`/nodes/${vm.node}/${vm.type}/${vm.vmid}/status/${action}`, 'POST')
        if (!res.success) {
            alert(`Error al ejecutar ${action}: ` + res.message)
        } else {
            // Small delay then refresh
            setTimeout(() => loadResources(), 2000)
        }
    } catch (e) {
        alert('Error de conexión')
    } finally {
        actionLoading.value = null
    }
}

const openConsole = (vm: any) => {
    const consoleType = vm.type === 'lxc' ? 'lxc' : 'qemu'
    // Abrir ruta interna de nuestra app
    const url = `/console/${vm.vmid}?node=${vm.node}&type=${consoleType}`

    // Abrir en ventana popup limpia
    window.open(url, `console-${vm.vmid}`, 'width=1024,height=768,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no')
}

onMounted(() => {
    restoreSession()
    loadResources()

    // Auto-refresh every 10s for live status
    const interval = setInterval(loadResources, 10000)
    onUnmounted(() => clearInterval(interval))
})
</script>
