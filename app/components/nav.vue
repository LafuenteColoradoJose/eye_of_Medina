<template>
  <nav class="flex flex-col items-center border-r-2 border-[#354647] p-4 bg-[#14BBCA] min-h-full">
    <ul class="flex flex-col items-center gap-6 p-4">
      <Logo />
      <li><NuxtLink to="/" class="hover:underline">Home</NuxtLink></li>
      <li><NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink></li>
      <li><NuxtLink to="/users" class="hover:underline">Usuarios</NuxtLink></li>
      <li><NuxtLink to="/groups" class="hover:underline">Grupos</NuxtLink></li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>