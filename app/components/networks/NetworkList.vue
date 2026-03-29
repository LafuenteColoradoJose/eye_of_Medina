<template>
    <div v-if="loading && networks.length === 0" class="py-20 flex justify-center text-text-muted">
        <svg
class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path
class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
    </div>

    <div v-else class="space-y-12">

        <!-- SECTION 1: L3 ADDRESSING (Las IPs son lo importante) -->
        <section v-if="ipInterfaces.length > 0" class="space-y-4">
            <h2
                class="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="text-blue-500">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Zonas de Red & Direccionamiento (L3)
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div
v-for="net in ipInterfaces" :key="net.iface"
                    class="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

                    <!-- Active indicator stripe -->
                    <div class="absolute top-0 left-0 w-1.5 h-full" :class="net.active ? 'bg-positive' : 'bg-danger'"/>

                    <div class="p-5 space-y-4 pl-7">
                        <!-- Header with Name & Comment -->
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-lg text-text flex items-center gap-2">
                                    {{ net.comments || 'Red Sin Nombre' }}
                                    <span
v-if="!net.comments"
                                        class="text-xs font-normal text-text-muted font-mono bg-muted-surface px-1.5 py-0.5 rounded">{{
                                            net.iface }}</span>
                                </h3>
                                <p v-if="net.comments" class="font-mono text-xs text-text-muted mt-1">{{ net.iface
                                }}</p>
                            </div>
                            <span
                                class="text-[10px] items-center gap-1 bg-background border border-border px-2 py-1 rounded-full uppercase font-bold tracking-wide flex text-text-muted">
                                {{ net.type }}
                            </span>
                        </div>

                        <!-- IP Addresses (The Hero Element) -->
                        <div class="space-y-3">
                            <!-- IPv4 -->
                            <div
v-if="net.address" class="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 cursor-pointer hover:bg-blue-500/20 transition-colors group/ip relative gap-3"
                                @click="copyToClipboard(net.address)">
                                <div class="flex items-center gap-3 w-full overflow-hidden">
                                    <div
                                        class="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-500/20">
                                        v4</div>
                                    <div class="min-w-0 flex-1">
                                        <div
class="font-mono font-bold text-lg text-text relative z-10 w-full truncate"
                                            :title="net.address">
                                            {{ net.address.split('/')[0] }}<span
                                                v-if="net.address.includes('/')"
                                                class="text-text-muted/70 text-base font-normal">/{{ net.address.split('/')[1]
                                                }}</span><span
v-else-if="net.cidr && net.cidr.includes('/')"
                                                class="text-text-muted/70 text-base font-normal">/{{
                                                    net.cidr.split('/')[1] }}</span><span
                                                v-else-if="net.cidr && !net.cidr.includes('.')"
                                                class="text-text-muted/70 text-base font-normal">/{{ net.cidr
                                                }}</span>
                                        </div>
                                        <div
v-if="net.gateway"
                                            class="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                            <svg
xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round" class="opacity-70">
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                            Gw: {{ net.gateway }}
                                        </div>
                                    </div>
                                </div>
                                <svg
xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-text-muted opacity-0 group-hover/ip:opacity-100 transition-opacity shrink-0 hidden sm:block">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                            </div>

                            <!-- IPv6 -->
                            <div
v-if="net.address6" class="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 cursor-pointer hover:bg-purple-500/20 transition-colors group/ip gap-3"
                                @click="copyToClipboard(net.address6)">
                                <div class="flex items-center gap-3 w-full overflow-hidden">
                                    <div
                                        class="w-8 h-8 rounded bg-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-purple-500/20">
                                        v6</div>
                                    <div class="min-w-0 flex-1">
                                        <div
class="font-mono font-bold text-sm text-text truncate"
                                            :title="net.address6">
                                            {{ net.address6 }}
                                        </div>
                                    </div>
                                </div>
                                <svg
xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-text-muted opacity-0 group-hover/ip:opacity-100 transition-opacity shrink-0 hidden sm:block">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                            </div>
                        </div>

                        <!-- Physical Hierarchy / Plumbing -->
                        <div class="pt-3 border-t border-border/50">
                            <span class="text-[10px] uppercase font-bold text-text-muted mb-2 block">Ruta
                                Física</span>
                            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                <!-- Physical Ports -->
                                <template v-if="getDeepPorts(net).length > 0">
                                    <div
v-for="port in getDeepPorts(net)" :key="port"
                                        class="flex items-center gap-1 bg-muted-surface border border-border rounded px-1.5 py-0.5 whitespace-nowrap">
                                        <div
class="w-1.5 h-1.5 rounded-full"
                                            :class="isPortActive(port) ? 'bg-positive' : 'bg-danger'"/>
                                        <span class="font-mono text-xs text-text">{{ port }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <span class="text-xs text-text-muted italic">Virtual / Internal</span>
                                </template>

                                <!-- Arrow -->
                                <svg
xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="text-text-muted shrink-0">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>

                                <!-- The Interface Itself -->
                                <div
                                    class="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                                    {{ net.iface }}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION 2: L2 & RAW INTERFACES (Cables sueltos) -->
        <section class="space-y-4">
            <h2
                class="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                <svg
xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="text-warning">
                    <path d="M4 14a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4v7m7-4-3 4-3-4" />
                </svg>
                Infraestructura de Red (L2/L1)
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div
v-for="net in nonIpInterfaces" :key="net.iface"
                    class="bg-card/50 border border-border rounded-lg p-4 flex flex-col justify-between hover:bg-card transition-colors">

                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-3">
                            <div
class="w-2 h-2 rounded-full" :class="net.active ? 'bg-positive' : 'bg-danger'"
                                :title="net.active ? 'Active' : 'Down'"/>
                            <h4 class="font-bold text-text font-mono">{{ net.iface }}</h4>
                        </div>
                        <span
                            class="text-[10px] uppercase text-text-muted font-bold border border-border px-1.5 rounded">{{
                                net.type }}</span>
                    </div>

                    <!-- Details for Bridge/Bond -->
                    <div v-if="net.bridge_ports || net.slaves" class="mt-2">
                        <span class="text-[10px] text-text-muted mb-1 block">Puertos:</span>
                        <div class="flex flex-wrap gap-1">
                            <span
v-for="port in splitPorts(net.bridge_ports || net.slaves)" :key="port"
                                class="text-xs font-mono bg-muted-surface px-1 rounded border border-border/50 text-text">
                                {{ port }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="text-xs text-text-muted mt-2">
                        {{ net.active ? 'Enlace activo' : 'Desconectado' }}
                    </div>

                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type NetworkInterface = {
    iface: string
    type: string // eth, bridge, bond, vlan, etc.
    active: boolean
    autostart?: boolean
    address?: string
    address6?: string
    cidr?: string
    gateway?: string
    bridge_ports?: string
    slaves?: string
    comments?: string
}

const props = defineProps<{
    networks: NetworkInterface[]
    loading: boolean
}>()

// Computeds for Smart UI organization
const ipInterfaces = computed(() => {
    // Interfaces que tienen una identidad L3 (IP)
    return props.networks.filter(n => n.address || n.address6).sort((a, b) => a.iface.localeCompare(b.iface))
})

const nonIpInterfaces = computed(() => {
    // Resto de cables e infraestructura sin IP directa
    return props.networks.filter(n => !n.address && !n.address6).sort((a, b) => {
        // Priorizar bridges/bonds sobre eths vacíos
        if (a.type !== b.type) {
            if (['bridge', 'bond'].includes(a.type)) return -1
            if (['bridge', 'bond'].includes(b.type)) return 1
        }
        return a.iface.localeCompare(b.iface)
    })
})


// Helpers
const splitPorts = (portsStr?: string) => {
    if (!portsStr) return []
    return portsStr.split(/\s+/).filter(p => p)
}

const isPortActive = (portName: string) => {
    const net = props.networks.find(n => n.iface === portName)
    return net ? net.active : false
}

// Recursively find real physical ports for a logical interface
const getDeepPorts = (net: NetworkInterface): string[] => {
    const directPorts = splitPorts(net.bridge_ports || net.slaves)
    if (directPorts.length === 0) return []

    // Si los puertos son físicos (eth), devolverlos. Si son logical (bonds), profundizar.
    let result: string[] = []

    directPorts.forEach(portName => {
        const childNet = props.networks.find(n => n.iface === portName)
        if (childNet && (childNet.type === 'bond' || childNet.type === 'OVSBond')) {
            result = result.concat(getDeepPorts(childNet))
        } else {
            result.push(portName)
        }
    })

    return result
}

const copyToClipboard = async (text: string) => {
    if (!text) return
    const cleanText = text.split('/')[0] // copy just the IP, usually more useful
    try {
        await navigator.clipboard.writeText(cleanText)
        alert('IP copiada: ' + cleanText)
    } catch (err) {
        console.error('Failed to copy', err)
    }
}
</script>
