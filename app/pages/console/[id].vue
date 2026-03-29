<template>
    <div class="h-screen w-screen bg-black flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
            <h1 class="text-gray-200 font-bold text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'"/>
                Consola VM {{ $route.params.id }}
            </h1>
            <div class="flex gap-2">
                <button
class="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                    @click="sendCtrlAltDel">
                    Send Ctrl-Alt-Del
                </button>
                <button
class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded"
                    @click="reconnect">
                    Reconectar
                </button>
            </div>
        </header>

        <!-- VNC Container -->
        <div ref="vncContainer" class="flex-1 bg-black relative flex items-center justify-center">
            <div
v-if="error"
                class="absolute inset-0 flex flex-col gap-4 items-center justify-center text-red-400 bg-black/90 z-10">
                <p class="text-xl font-bold">{{ error }}</p>
                <p class="text-sm text-gray-400">Verifica tu sesión e intenta reconectar.</p>
                <button
class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                    @click="reconnect">
                    Reconectar
                </button>
            </div>
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-indigo-400">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-current"/>
                <span class="ml-2">Conectando a VNC...</span>
            </div>
            <!-- Canvas target for RFB -->
            <div id="vnc-canvas" class="w-full h-full"/>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false
})

const route = useRoute()
const { getVncTicket } = useProxmox()

const vmid = route.params.id as string
const node = route.query.node as string || 'pve'
const type = (route.query.type as 'qemu' | 'lxc') || 'qemu'

const loading = ref(true)
const connected = ref(false)
const error = ref('')
type RFBLike = {
    disconnect?: () => void
    sendCtrlAltDel?: () => void
    addEventListener?: (ev: string, cb: (...args: unknown[]) => void) => void
    scaleViewport?: boolean
    resizeSession?: boolean
    focus?: () => void
}
let rfb: RFBLike | null = null

const connectVNC = async () => {
    loading.value = true
    error.value = ''

    try {
        // 1. Get VNC ticket from Proxmox
        const res = await getVncTicket(node, type, vmid)
        if (!res.success || !res.data) {
            throw new Error('No se pudo obtener el ticket VNC: ' + res.message)
        }

        const data = res.data as Record<string, unknown>
        const ticket = String(data.ticket)
        const port = Number(data.port)

        // 2. Build proxy WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const authToken = localStorage.getItem('proxmox-auth-token') || ''

        if (!authToken) {
            throw new Error('No hay sesión activa. Por favor, inicia sesión.')
        }

        const params = new URLSearchParams({
            node,
            type,
            vmid,
            port: String(port),
            vncticket: ticket,
            authToken
        })
        const url = `${protocol}://${window.location.host}/_ws/vnc?${params.toString()}`

        // 3. Import noVNC dynamically
        // @ts-expect-error dynamic import of CDN bundle
        const module = await import('https://esm.sh/@novnc/novnc@1.5.0/lib/rfb.js?bundle')
        const RFB = module.default

        // 4. Initialize RFB
        const container = document.getElementById('vnc-canvas')
        if (!container) return

        rfb = new RFB(container, url, {
            credentials: { password: ticket }
        })

        rfb.addEventListener("connect", () => {
            connected.value = true
            loading.value = false
            rfb.scaleViewport = true
            rfb.resizeSession = true
            rfb.focus()
        })

        rfb.addEventListener?.("disconnect", (e: unknown) => {
            connected.value = false
            loading.value = false
            const detail = (e as Record<string, unknown>)?.detail as Record<string, unknown> | undefined
            error.value = detail?.clean ? "Desconectado." : "Conexión perdida."
        })

    } catch (err: unknown) {
        if (err instanceof Error) error.value = err.message
        else error.value = 'Error de conexión'
        loading.value = false
    }
}

const sendCtrlAltDel = () => {
    if (rfb) rfb.sendCtrlAltDel()
}

const reconnect = () => {
    if (rfb) {
        try { rfb.disconnect?.() } catch (err) { console.debug('rfb.disconnect failed', err) }
    }
    rfb = null
    connectVNC()
}

onMounted(() => {
    connectVNC()
})

onUnmounted(() => {
    if (rfb) {
        try { rfb.disconnect?.() } catch (err) { console.debug('rfb.disconnect failed', err) }
    }
})
</script>

<style>
html,
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #000;
}
</style>
