<template>
  <ul class="pl-4">
    <li v-for="node in nodes" :key="node.id" class="mb-1">
      <details class="group" :open="node.open">
        <summary class="cursor-pointer flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ node.label }}</span>
            <span class="text-xs text-gray-500">{{ node.meta || '' }}</span>
          </div>
          <div class="text-xs text-gray-400 group-open:rotate-90 transition-transform">▸</div>
        </summary>

        <div class="mt-2 pl-4">
          <div v-if="node.details" class="mb-2 text-xs text-gray-600">{{ node.details }}</div>
          <PermissionTree v-if="node.children && node.children.length" :nodes="node.children" />
        </div>
      </details>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps<{ nodes: Array<any> }>()
const nodes = props.nodes || []
</script>
