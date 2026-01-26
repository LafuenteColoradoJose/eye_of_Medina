<template>
    <div class="p-6 max-w-[1920px] mx-auto space-y-6 h-[calc(100vh-4rem)] flex flex-col">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-text">Almacenamiento e ISOs</h1>
                <p class="text-text-muted text-sm mt-1">Gestiona imágenes de disco y plantillas para tus máquinas</p>
            </div>
            <div class="flex gap-3">
                <div class="relative">
                    <select v-model="selectedNode" @change="loadStorages"
                        class="appearance-none bg-card border border-border text-text px-4 py-2 pr-8 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/50 focus:outline-none min-w-[150px]">
                        <option v-for="node in nodes" :key="node" :value="node">{{ node }}</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <button @click="refreshCurrent"
                    class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        :class="{ 'animate-spin': loading }">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                    </svg>
                    Refrescar
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

            <!-- Sidebar: Storage List -->
            <div class="w-full lg:w-1/4 xl:w-1/5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                <div v-if="loadingStorages" class="py-10 text-center text-text-muted">
                    <svg class="animate-spin h-6 w-6 mx-auto text-primary mb-2" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Cargando...
                </div>
                <div v-else-if="storages.length === 0"
                    class="p-4 border border-dashed border-border rounded-lg text-center text-sm text-text-muted">
                    No se encontraron almacenamientos en este nodo.
                </div>

                <button v-for="store in storages" :key="store.storage" @click="selectStorage(store)"
                    class="group p-4 rounded-xl border transition-all text-left relative overflow-hidden" :class="selectedStorage?.storage === store.storage
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.1)]'
                        : 'bg-card border-border hover:border-primary/50'">

                    <div class="flex items-center gap-3 mb-3 relative z-10">
                        <!-- Icon -->
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            :class="selectedStorage?.storage === store.storage ? 'bg-primary text-white' : 'bg-muted-surface text-text-muted group-hover:text-primary transition-colors'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V8" />
                                <path d="M2 8h20" />
                                <path d="M12 16v.01" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-bold text-text truncate leading-tight">{{ store.storage }}</h3>
                            <p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">{{
                                store.type }}</p>
                        </div>

                        <!-- Type Badge (ISO/VZTMPL support) -->
                        <div class="ml-auto flex gap-1">
                            <span v-if="supportsContent(store, 'iso')" class="w-2 h-2 rounded-full bg-blue-500"
                                title="Soporta ISOs"></span>
                            <span v-if="supportsContent(store, 'vztmpl')" class="w-2 h-2 rounded-full bg-orange-500"
                                title="Soporta Templates"></span>
                        </div>
                    </div>

                    <!-- Usage Bar -->
                    <div class="relative z-10">
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-text-muted">{{ formatBytes(store.used || 0) }} usados</span>
                            <span class="font-mono text-text">{{ formatBytes(store.total || 0) }}</span>
                        </div>
                        <div class="h-1.5 w-full bg-background rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500"
                                :class="getUsageColor(store.used || 0, store.total || 1)"
                                :style="{ width: `${Math.min(((store.used || 0) / (store.total || 1)) * 100, 100)}%` }">
                            </div>
                        </div>
                    </div>

                </button>
            </div>

            <!-- Right Panel: Content Browser -->
            <div class="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">

                <div v-if="!selectedStorage"
                    class="flex-1 flex flex-col items-center justify-center p-10 text-text-muted opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                        class="mb-4">
                        <path
                            d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V8" />
                        <path d="M2 8h20" />
                    </svg>
                    <p class="text-lg font-medium">Selecciona un disco para ver su contenido</p>
                </div>

                <template v-else>
                    <!-- Toolbar -->
                    <div class="p-4 border-b border-border bg-muted-surface/30 flex justify-between items-center">
                        <div class="flex gap-1 bg-background p-1 rounded-lg border border-border">
                            <button @click="contentType = 'iso'; loadContent()"
                                class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                                :class="contentType === 'iso' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text hover:bg-muted-surface'">
                                Archivos ISO
                            </button>
                            <button @click="contentType = 'vztmpl'; loadContent()"
                                class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                                :class="contentType === 'vztmpl' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text hover:bg-muted-surface'">
                                Plantillas CT
                            </button>
                        </div>

                        <div class="flex gap-2">
                            <button v-if="canDownload" @click="showDownloadModal = true"
                                class="px-3 py-1.5 rounded-md bg-white text-black hover:bg-gray-100 font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-sm transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                                Descargar desde URL
                            </button>
                        </div>
                    </div>

                    <!-- Content Table -->
                    <div class="flex-1 overflow-auto custom-scrollbar p-0">
                        <div v-if="loadingContent" class="py-20 flex justify-center text-text-muted">
                            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </div>

                        <div v-else-if="files.length === 0"
                            class="py-20 flex flex-col items-center justify-center text-text-muted opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"
                                stroke-linejoin="round" class="mb-2">
                                <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                                <path d="M14 2v6h6" />
                                <path d="m3 12.5 5 5" />
                                <path d="m8 12.5-5 5" />
                            </svg>
                            <p>Carpeta vacía</p>
                            <p v-if="!supportsContent(selectedStorage, contentType)"
                                class="text-xs text-orange-500 mt-2">Este almacenamiento no soporta {{ contentType }}
                            </p>
                        </div>

                        <table v-else class="w-full text-left border-collapse">
                            <thead
                                class="bg-muted-surface/50 text-xs font-bold text-text-muted uppercase sticky top-0 backdrop-blur-md z-10 border-b border-border">
                                <tr>
                                    <th class="p-4 w-12"></th>
                                    <th class="p-4">Nombre Archivo</th>
                                    <th class="p-4">Formato</th>
                                    <th class="p-4">Tamaño</th>
                                    <th class="p-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border/30 text-sm">
                                <tr v-for="file in files" :key="file.volid"
                                    class="hover:bg-muted-surface/20 transition-colors group">
                                    <td class="p-4 text-center">
                                        <svg v-if="contentType === 'iso'" xmlns="http://www.w3.org/2000/svg" width="20"
                                            height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="text-blue-500">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                    </td>
                                    <td class="p-4 font-medium text-text select-all">{{ parseVolidName(file.volid) }}
                                    </td>
                                    <td class="p-4 text-text-muted">{{ file.format }}</td>
                                    <td class="p-4 font-mono text-text-muted">{{ formatBytes(file.size) }}</td>
                                    <td class="p-4 text-right">
                                        <!-- Delete Button (Simulated placeholder for safety) -->
                                        <button
                                            class="p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Eliminar (No implementado)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>

        </div>

        <!-- Download Modal -->
        <div v-if="showDownloadModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="showDownloadModal = false">
            <div class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg">
                <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
                    <h2 class="text-xl font-bold text-text">Descargar a {{ selectedStorage?.storage }}</h2>
                    <button @click="showDownloadModal = false" class="text-text-muted hover:text-text"><svg
                            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL del Archivo</label>
                        <input v-model="dlUrl"
                            placeholder="https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso"
                            class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text font-mono text-sm" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre de Archivo</label>
                        <input v-model="dlFilename" placeholder="ubuntu-22.04.iso"
                            class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
                        <p class="text-[10px] text-text-muted mt-1">Debe terminar en .iso (o .tar.gz para templates)</p>
                    </div>
                </div>
                <div class="p-5 border-t border-border flex justify-end gap-3 rounded-b-xl bg-muted-surface/30">
                    <button @click="showDownloadModal = false"
                        class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
                    <button @click="executeDownload" :disabled="downloading"
                        class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors flex items-center gap-2">
                        <svg v-if="downloading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ downloading ? 'Iniciando...' : 'Iniciar Descarga' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Almacenamiento' })
import { ref, onMounted, computed, watch } from 'vue'

type Storage = {
    storage: string
    type: string
    content: string // comma separated "iso,vztmpl,backup"
    active: number
    total?: number
    used?: number
}

type StorageFile = {
    volid: string
    format: string
    size: number
}

const { restoreSession, isAuthenticated, listNodes, listStorages, listStorageContent, downloadUrlToStorage, hasPermission } = useProxmox()

// State
const nodes = ref<string[]>([])
const selectedNode = ref<string>('')
const storages = ref<Storage[]>([])
const selectedStorage = ref<Storage | null>(null)
const files = ref<StorageFile[]>([])

const contentType = ref<'iso' | 'vztmpl'>('iso')
const loading = ref(false)
const loadingStorages = ref(false)
const loadingContent = ref(false)

// Download State
const showDownloadModal = ref(false)
const dlUrl = ref('')
const dlFilename = ref('')
const downloading = ref(false)

// Init
onMounted(async () => {
    restoreSession()
    if (isAuthenticated.value) {
        await loadNodes()
    }
})

// Permissions logic
const canDownload = computed(() => {
    // If not using strict perms, assume true or check basic roles.
    // Ideally we check 'Datastore.AllocateTemplate' on /storage/{id}
    return true
})

async function loadNodes() {
    loading.value = true
    const res = await listNodes()
    if (res.success && res.data) {
        // Filter online nodes only
        const online = (res.data as any[]).filter(n => n.status === 'online').map(n => n.node)
        nodes.value = online
        if (online.length > 0) {
            selectedNode.value = online[0]
            await loadStorages()
        }
    }
    loading.value = false
}

async function loadStorages() {
    if (!selectedNode.value) return
    loadingStorages.value = true
    const res = await listStorages(selectedNode.value)
    if (res.success && res.data) {
        // Filter only storages that are active/enabled
        storages.value = (res.data as Storage[]).filter(s => s.active === 1).sort((a, b) => a.storage.localeCompare(b.storage))

        // Auto select first local storage usually
        if (!selectedStorage.value && storages.value.length > 0) {
            // Prefer 'local' or first one
            const local = storages.value.find(s => s.storage === 'local')
            if (local) selectStorage(local)
            else if (storages.value.length > 0) selectStorage(storages.value[0])
        }
    }
    loadingStorages.value = false
}

function selectStorage(store: Storage) {
    selectedStorage.value = store
    // Auto switch tab based on support
    if (supportsContent(store, 'iso') && !supportsContent(store, 'vztmpl')) contentType.value = 'iso'
    if (!supportsContent(store, 'iso') && supportsContent(store, 'vztmpl')) contentType.value = 'vztmpl'

    loadContent()
}

async function loadContent() {
    if (!selectedNode.value || !selectedStorage.value) return

    // Check support first to avoid error calls
    if (!supportsContent(selectedStorage.value, contentType.value)) {
        files.value = []
        return
    }

    loadingContent.value = true
    files.value = []

    const res = await listStorageContent(selectedNode.value, selectedStorage.value.storage, contentType.value)
    if (res.success && res.data) {
        files.value = res.data as StorageFile[]
    }

    loadingContent.value = false
}

function refreshCurrent() {
    loadStorages()
    loadContent()
}

// Helpers
function supportsContent(store: Storage | null, type: string) {
    if (!store || !store.content) return false
    return store.content.split(',').includes(type)
}

function parseVolidName(volid: string) {
    // local:iso/ubuntu.iso -> ubuntu.iso
    return volid.split('/').pop() || volid
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getUsageColor = (used: number, total: number) => {
    const p = used / total
    if (p > 0.9) return 'bg-danger'
    if (p > 0.75) return 'bg-warning'
    return 'bg-blue-500' // Neutral storage color
}

// Download Action
async function executeDownload() {
    if (!dlUrl.value || !dlFilename.value || !selectedNode.value || !selectedStorage.value) return

    downloading.value = true
    try {
        const res = await downloadUrlToStorage(
            selectedNode.value,
            selectedStorage.value.storage,
            dlUrl.value,
            dlFilename.value,
            contentType.value
        )

        if (res.success) {
            // Task started!
            alert('¡Descarga iniciada! Puedes ver el progreso en el panel de Tareas.')
            showDownloadModal.value = false
            dlUrl.value = ''
            dlFilename.value = ''
            // Open task drawer? (Future improvement)
        } else {
            alert('Error al iniciar descarga: ' + res.message)
        }
    } catch (e) {
        console.error(e)
        alert('Exception: ' + e)
    } finally {
        downloading.value = false
    }
}

// Auto cleanup modal inputs when opening
watch(showDownloadModal, (val) => {
    if (val) {
        dlUrl.value = ''
        dlFilename.value = ''
    }
})

</script>
