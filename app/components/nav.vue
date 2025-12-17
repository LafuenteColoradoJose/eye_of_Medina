<template>
  <nav class="flex flex-col items-center border-r-2 min-h-full sidebar-nav">
    <ul class="flex flex-col items-center gap-6 p-4">
      <Logo />
      <li><NuxtLink to="/" class="hover:underline">Home</NuxtLink></li>
      <li><NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink></li>
      <li><NuxtLink to="/pools" class="hover:underline">Pools</NuxtLink></li>
      <li><NuxtLink to="/users" class="hover:underline">Usuarios</NuxtLink></li>
      <li><NuxtLink to="/groups" class="hover:underline">Grupos</NuxtLink></li>
      <li><NuxtLink to="/roles" class="hover:underline">Roles</NuxtLink></li>
      <li><NuxtLink to="/permissions" class="hover:underline">Permisos</NuxtLink></li>
      <li><NuxtLink to="/permissions-tree" class="hover:underline">Árbol permisos</NuxtLink></li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>