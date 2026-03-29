// Minimal global declarations to satisfy TypeScript until .nuxt types are used

declare function defineNuxtConfig<T = Record<string, unknown>>(config: T): T
declare function defineEventHandler<T = unknown>(handler: (event: unknown) => T | Promise<T>): (event: unknown) => T | Promise<T>
declare function defineWebSocketHandler(handler: (socket: unknown) => unknown): unknown
declare function defineMcpTool(tool: unknown): unknown
declare function defineNuxtPlugin(plugin: (ctx: unknown) => unknown): unknown
declare function defineNuxtRouteMiddleware(handler: (ctx: unknown) => unknown): (ctx: unknown) => unknown

declare function useRuntimeConfig(): Record<string, unknown>
declare function useState<T = unknown>(key: string, init?: () => T): { value: T }
declare function useFetch<T = unknown>(...args: unknown[]): Promise<T>
declare function useAsyncData<T = unknown>(...args: unknown[]): Promise<T>
declare function useHead(meta: Record<string, unknown>): void
declare function useSeoMeta(meta: Record<string, unknown>): void

declare const $fetch: (...args: unknown[]) => Promise<unknown>

declare function navigateTo(path: string): Promise<unknown> | unknown

declare function useRouter(): unknown
declare function useRoute(): unknown

declare function useProxmox(): unknown

declare function useUI(): unknown

declare function usePermissions(): unknown

declare function defineProps<T = unknown>(): T
declare function defineEmits<T = Record<string, unknown>>(): (e: T) => void

declare interface ImportMeta {
	client?: boolean
	server?: boolean
}

declare const import_meta: ImportMeta

// Vue helpers (auto-imported in Nuxt)
declare function computed<T = unknown>(fn: () => T): { value: T }
declare function ref<T = unknown>(value?: T): { value: T }
declare function shallowRef<T = unknown>(value?: T): { value: T }

// h3 / Nitro helpers
declare function getRequestURL(event: unknown): string
