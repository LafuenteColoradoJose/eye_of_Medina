<template>
  <section>
    <h1 class="text-3xl font-bold underline">
      Login Page
    </h1>

    <form class="mt-4">
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input type="text" id="username" name="username" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" name="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Login</button>
    </form>

    </section>
    
  
</template>

<script lang="ts" setup>

</script>

<style scoped>

</style>