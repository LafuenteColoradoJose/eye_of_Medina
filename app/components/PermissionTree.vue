<template>
  <div v-if="isRoot" class="flex gap-2 mb-3 px-2">
    <button @click="toggleGlobalState"
      class="text-xs px-2.5 py-1.5 bg-card border border-border text-text hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
      :title="areAllExpanded ? 'Replegar todo' : 'Desplegar todo'">
      <svg v-if="!areAllExpanded" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="opacity-70">
        <path d="m7 20 5-5 5 5" />
        <path d="m7 4 5 5 5-5" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70">
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5-5" />
      </svg>
      <span class="font-medium">{{ areAllExpanded ? 'Replegar todo' : 'Desplegar todo' }}</span>
    </button>
  </div>

  <ul class="flex flex-col gap-0.5">
    <li v-for="node in nodes" :key="node.id" class="relative">
      <details class="group section-details" :open="node.open">
        <summary class="flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 
                 hover:bg-primary/5 select-none list-none marker:hidden
                 bg-card border border-transparent hover:border-border/50" @click.prevent="toggleNode(node)">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <!-- Icono de estado -->
            <div
              class="w-5 h-5 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary/20">
              <svg v-if="node.children && node.children.length" xmlns="http://www.w3.org/2000/svg" width="12"
                height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder">
                <path
                  d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-file-key">
                <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                <path d="M14 2v6h6" />
                <circle cx="10" cy="16" r="4" />
                <path d="m10.7 13.7-2.43 2.43a2.12 2.12 0 0 0 3 3L13.7 16.7" />
              </svg>
            </div>

            <div class="flex flex-col min-w-0 text-left">
              <span class="text-sm font-semibold text-text truncate leading-tight">{{ node.label }}</span>
              <span v-if="node.meta" class="text-[10px] text-text-muted truncate leading-tight mt-0.5">{{ node.meta
                }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Chevron animado -->
            <div v-if="node.children && node.children.length"
              class="text-text-muted transition-transform duration-300 ease-out group-open:rotate-90 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </summary>

        <!-- Contenido Hijos con Línea Guía -->
        <div v-if="(node.children && node.children.length) || node.details"
          class="relative ml-[1.1rem] pl-4 border-l border-border/40 my-1">
          <div v-if="node.details"
            class="mb-2 text-xs text-text-muted bg-neutral-50/50 dark:bg-white/5 p-2 rounded italic selection:bg-primary/20">
            {{ node.details }}
          </div>
          <PermissionTree v-if="node.children && node.children.length" :nodes="node.children" />
        </div>
      </details>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  nodes: Array<any>,
  isRoot?: boolean
}>(), {
  isRoot: false
})

const nodes = props.nodes || []
const areAllExpanded = ref(false)

const toggleNode = (node: any) => {
  node.open = !node.open
}

const toggleGlobalState = () => {
  areAllExpanded.value = !areAllExpanded.value
  toggleAll(areAllExpanded.value)
}

const toggleAll = (expand: boolean) => {
  const traverse = (list: any[]) => {
    list.forEach(node => {
      node.open = expand
      if (node.children && node.children.length) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
}
</script>

<style scoped>
/* Eliminar el triángulo por defecto de details en navegadores */
details>summary {
  list-style: none;
}

details>summary::-webkit-details-marker {
  display: none;
}
</style>
