<template>
  <ul class="pl-4">
    <li v-for="node in nodes" :key="node.id" class="mb-1">
      <details class="group" :open="node.open">
        <summary class="cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ node.label }}</span>
            <span class="text-xs muted">{{ node.meta || '' }}</span>
          </div>
          <div class="text-xs muted-secondary group-open:rotate-90 transition-transform">▸</div>
        </summary>

        <div class="mt-2 pl-4">
          <div v-if="node.details" class="mb-2 text-xs muted">{{ node.details }}</div>
          <PermissionTree v-if="node.children && node.children.length" :nodes="node.children" />
        </div>
      </details>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{ nodes: Array<any> }>()
const nodes = props.nodes || []
</script>
