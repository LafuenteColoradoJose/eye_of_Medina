<template>
    <div class="h-screen w-screen bg-black flex flex-col overflow-hidden">
        <!-- Aviso de Localhost para Cookies -->
        <div v-if="isLocalhost" class="bg-yellow-600 text-white px-4 py-2 text-center font-bold z-50">
            ⚠️ Estás usando 'localhost'. Para que la conexión funcione, debes usar la IP 127.0.0.1
            <a :href="currentUrlIp" class="underline ml-2 text-white bg-black/20 px-2 py-1 rounded">Cambiar a
                127.0.0.1</a>
        </div>

        <!-- Header simple -->
        <header class="h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
            <h1 class="text-gray-200 font-bold text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'"></span>
                Consola VM {{ $route.params.id }}
            </h1>
            <div class="flex gap-2">
                <button @click="sendCtrlAltDel"
                    class="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded">
                    Send Ctrl-Alt-Del
                </button>
                <button @click="reconnect"
                    class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded">
                    Reconectar
                </button>
            </div>
        </header>

        <!-- Contenedor VNC -->
        <div ref="vncContainer" class="flex-1 bg-black relative flex items-center justify-center">
            <div v-if="error"
                class="absolute inset-0 flex flex-col gap-4 items-center justify-center text-red-500 bg-black/80 z-10">
                <p class="text-xl font-bold">{{ error }}</p>
                <div class="text-sm text-gray-400 max-w-md text-center">
                    Es posible que falte el certificado o la <b>sesión iniciada</b>.
                </div>

                <!-- Input para corregir Host -->
                <div class="flex gap-2 items-center bg-gray-800 p-2 rounded">
                    <span class="text-gray-400 text-sm">Host Proxmox:</span>
                    <input v-model="customHost"
                        class="bg-black text-white px-2 py-1 rounded border border-gray-600 w-48"
                        placeholder="ej: 127.0.0.1:8006" />
                </div>

                <div class="flex gap-2">
                    <button @click="openProxmoxCert"
                        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold text-center leading-tight">
                        1. Aceptar Certificado<br><span class="text-xs text-yellow-300">¡E INICIAR SESIÓN!</span>
                    </button>
                    <button @click="retryWithNewHost"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">
                        2. Reintentar Conexión
                    </button>
                </div>
            </div>
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-indigo-400">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                <span class="ml-2">Conectando a VNC...</span>
            </div>
            <!-- Canvas target for RFB -->
            <div id="vnc-canvas" class="w-full h-full"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useProxmox } from '@/composables/useProxmox'

definePageMeta({
    layout: false
})

const route = useRoute()
const router = useRouter()
const { getVncTicket } = useProxmox()

const vmid = route.params.id as string
const node = route.query.node as string || 'pve'
const type = (route.query.type as 'qemu' | 'lxc') || 'qemu'

const loading = ref(true)
const connected = ref(false)
const error = ref('')
const customHost = ref('') // Para override manual
let rfb: any = null

// Detectar localhost para sugerir cambio a 127.0.0.1 (Cookies)
const isLocalhost = computed(() => {
    if (import.meta.server) return false
    return window.location.hostname === 'localhost'
})

const currentUrlIp = computed(() => {
    if (import.meta.server) return ''
    return window.location.href.replace('localhost', '127.0.0.1')
})

const connectVNC = async () => {
    loading.value = true
    error.value = ''

    try {
        // 1. Obtener Ticket
        const res = await getVncTicket(node, type, vmid)
        if (!res.success || !res.data) {
            throw new Error('No se pudo obtener el ticket VNC: ' + res.message)
        }

        // Forzamos el tipo 'any' para que TS no se queje de ticket/port
        const data = res.data as any
        const tick = data.ticket
        const port = data.port
        // const cert = res.data.cert // Usually not needed for WS connection from browser if trusted, or managed by browser

        // Determinar host: Usar override manual si existe, si no el del storage
        let rawHost = customHost.value || localStorage.getItem('proxmox-host') || ''
        let host = rawHost.replace('https://', '').replace('http://', '')

        // Si no tenemos host, avisar
        if (!host) {
            error.value = "No hay Host de Proxmox configurado."
            loading.value = false
            return
        }

        // Si es desarrollo local y estamos en VirtualBox forwarding, sugerir 127.0.0.1 si falla
        // Construir URL WebSocket segura (WSS) o insegura (WS)
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'wss' // Proxmox usa WSS por defecto en 8006
        // URL Path mágico de Proxmox
        const path = `api2/json/nodes/${node}/${type}/${vmid}/vncwebsocket?port=${port}&vncticket=${encodeURIComponent(tick)}`
        const url = `${protocol}://${host}/${path}`

        // 2. Importar RFB dinámicamente desde esm.sh
        // @ts-ignore
        const module = await import('https://esm.sh/@novnc/novnc@1.5.0/lib/rfb.js?bundle')
        const RFB = module.default

        // 3. Iniciar RFB
        const container = document.getElementById('vnc-canvas')
        if (!container) return

        rfb = new RFB(container, url, {
            credentials: { password: tick }
        })

        // ... (rest of listeners) ...

        rfb.addEventListener("disconnect", (e: any) => {
            // ... existing disconnect logic ...
            let reason = "Conexión perdida."
            if (e.detail?.clean) reason = "Desconectado voluntariamente."
            else reason = "Error de conexión."

            error.value = `${reason} Intentando conectar a: ${host}`
            // Pre-llenar input
            if (!customHost.value) customHost.value = host
        })
        // ...


        rfb.addEventListener("connect", () => {
            connected.value = true
            loading.value = false
            // Auto resize
            rfb.scaleViewport = true
            rfb.resizeSession = true
            rfb.focus()
        })

        rfb.addEventListener("disconnect", (e: any) => {
            connected.value = false
            loading.value = false
            console.error('VNC Disconnect:', e)

            // Diagnóstico detallado
            let reason = "Conexión perdida."
            if (e.detail?.clean) {
                reason = "Desconectado voluntariamente."
            } else {
                reason = "Error de conexión."
            }

            // Intentar sacar más info
            if (rfb && rfb._sock) {
                // Acceso interno al socket para debug si es posible (depende de versión)
            }

            error.value = `${reason} Intentando conectar a: ${host}`
            // Pre-llenar el input con el host que falló para que lo editen
            if (!customHost.value) customHost.value = host
        })

    } catch (e: any) {
        error.value = 'Error JS: ' + (e.message || 'Desconocido')
        loading.value = false
    }
}

// Helper para abrir la URL de Proxmox y aceptar certificado
const openProxmoxCert = () => {
    let host = customHost.value || localStorage.getItem('proxmox-host') || ''
    if (host && !host.startsWith('http')) host = 'https://' + host
    if (host) window.open(host, '_blank')
}

const retryWithNewHost = async () => {
    if (rfb) {
        try {
            rfb.disconnect()
        } catch (e) { }
        rfb = null
    }
    // Pequeño delay para asegurar limpieza
    await new Promise(r => setTimeout(r, 200))
    connectVNC()
}


const sendCtrlAltDel = () => {
    if (rfb) rfb.sendCtrlAltDel()
}

const reconnect = () => {
    if (rfb) rfb.disconnect()
    connectVNC()
}

onMounted(() => {
    connectVNC()
})

onUnmounted(() => {
    if (rfb) rfb.disconnect()
})
</script>

<style>
/* Reset scrollbars/margins for full screen console */
html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #000;
}
</style>
