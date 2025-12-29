<script setup lang="ts">
useHead({
  // Dynamic title template: "Page Name - Eye of Medina"
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Eye of Medina` : 'Eye of Medina'
  },
  htmlAttrs: {
    lang: 'es' // Reinforce Spanish language
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/Logo_Eye_of_Medina.svg' }
  ]
})

useSeoMeta({
  title: 'Monitorización Proxmox',
  ogTitle: 'Eye of Medina - Gestión Proxmox VE',
  description: 'Panel de control avanzado para clusters Proxmox VE. Gestión de permisos ACL, monitorización de recursos y administración de máquinas virtuales con interfaz moderna.',
  ogDescription: 'Panel de control avanzado para clusters Proxmox VE. Gestión de permisos ACL, monitorización de recursos y administración de máquinas virtuales.',
  ogImage: '/Logo_Eye_of_Medina.svg',
  twitterCard: 'summary',
  twitterTitle: 'Eye of Medina',
  twitterDescription: 'Gestión Proxmox VE Avanzada',
  themeColor: '#a855f7' // Matching Cyber Theme Primary
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>