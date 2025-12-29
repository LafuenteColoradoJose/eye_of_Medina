<template>
    <div
        class="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
        <div class="flex items-start justify-between">
            <div>
                <h2 class="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{{ label }}</h2>
                <p class="text-2xl font-bold text-text tracking-tight">{{ value }}</p>
            </div>
            <div class="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <!-- Slot para icono dinámico -->
                <slot name="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-activity">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </slot>
            </div>
        </div>
        <div class="mt-4 flex items-center text-xs">
            <span class="text-text-muted font-medium">{{ subtext }}</span>
        </div>

        <!-- Decoración de fondo abstracta -->
        <div
            class="absolute -right-6 -bottom-6 opacity-[0.03] text-primary rotate-12 pointer-events-none group-hover:opacity-[0.06] transition-opacity">
            <slot name="icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor"
                    stroke="none">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string
    value: string | number
    subtext?: string
}>()
</script>
