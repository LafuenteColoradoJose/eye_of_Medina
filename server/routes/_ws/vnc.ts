/**
 * VNC WebSocket Proxy - Server Route
 * 
 * Este endpoint maneja conexiones WebSocket del navegador y las retransmite
 * a Proxmox, eliminando la necesidad de que el usuario tenga sesión abierta
 * en Proxmox directamente.
 * 
 * Ruta: /_ws/vnc
 * Query params: node, type, vmid, port, vncticket, authToken
 * 
 * El cliente obtiene el ticket VNC previamente y lo pasa aquí.
 * El proxy solo retransmite los datos WebSocket.
 */

import { WebSocket } from 'ws'

// Store for Proxmox WebSocket connections indexed by peer id
const proxmoxConnections = new Map<string, WebSocket>()

export default defineWebSocketHandler({
    async open(peer) {
        // Get URL from peer.request
        const reqUrl = (peer as any).request?.url || ''

        if (!reqUrl) {
            peer.close(1008, 'Cannot parse request URL')
            return
        }

        const fullUrl = new URL(reqUrl, 'http://localhost')

        const node = fullUrl.searchParams.get('node')
        const type = fullUrl.searchParams.get('type') || 'qemu'
        const vmid = fullUrl.searchParams.get('vmid')
        const port = fullUrl.searchParams.get('port')
        const vncticket = fullUrl.searchParams.get('vncticket')
        const authToken = fullUrl.searchParams.get('authToken')

        if (!node || !vmid || !port || !vncticket || !authToken) {
            peer.close(1008, 'Missing required parameters')
            return
        }

        try {
            // Get runtime config
            const config = useRuntimeConfig()
            const proxmoxHost = (config.proxmoxHost || config.public?.proxmoxHost) as string

            if (!proxmoxHost) {
                throw new Error('Proxmox host not configured')
            }

            // Build Proxmox WebSocket URL
            const proxmoxUrl = new URL(proxmoxHost)
            const wsProtocol = proxmoxUrl.protocol === 'https:' ? 'wss:' : 'ws:'
            const proxmoxWsUrl = `${wsProtocol}//${proxmoxUrl.host}/api2/json/nodes/${node}/${type}/${vmid}/vncwebsocket?port=${port}&vncticket=${encodeURIComponent(vncticket)}`

            // Create WebSocket to Proxmox
            const proxmoxWs = new WebSocket(proxmoxWsUrl, {
                headers: {
                    'Cookie': `PVEAuthCookie=${encodeURIComponent(authToken)}`,
                    'Origin': proxmoxHost
                },
                rejectUnauthorized: false
            })

            // Store the connection
            proxmoxConnections.set(peer.id, proxmoxWs)

            // Handle Proxmox -> Client messages
            proxmoxWs.on('message', (data: Buffer) => {
                try {
                    peer.send(data)
                } catch {
                    // Client disconnected
                }
            })

            proxmoxWs.on('error', () => {
                peer.close(1011, 'Proxmox connection error')
            })

            proxmoxWs.on('close', () => {
                proxmoxConnections.delete(peer.id)
                peer.close()
            })

            // Wait for Proxmox connection
            await new Promise<void>((resolve, reject) => {
                proxmoxWs.on('open', resolve)
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            })

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            peer.close(1011, message)
        }
    },

    message(peer, message) {
        // Forward message from client to Proxmox
        const proxmoxWs = proxmoxConnections.get(peer.id)
        if (proxmoxWs && proxmoxWs.readyState === WebSocket.OPEN) {
            proxmoxWs.send(message.rawData as Buffer)
        }
    },

    close(peer) {
        const proxmoxWs = proxmoxConnections.get(peer.id)
        if (proxmoxWs) {
            proxmoxWs.close()
            proxmoxConnections.delete(peer.id)
        }
    },

    error(peer) {
        const proxmoxWs = proxmoxConnections.get(peer.id)
        if (proxmoxWs) {
            proxmoxWs.close()
            proxmoxConnections.delete(peer.id)
        }
    }
})
