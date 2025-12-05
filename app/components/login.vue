<script setup lang="ts">
import { select } from '#build/ui';

</script>

<template>
    <section>
        <h2 class="text-2xl font-bold">Login</h2>
    <form class="mt-4">
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input type="text" id="username" name="username" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div class="mb-4">
        <label for="authentication" class="block text-sm font-medium text-gray-700">Autentication</label>
        <select type="text" id="authentication" name="authentication" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="Linux Pam">Linux PAM standard authentication</option>
          <option value="Linux Pam">Proxmox VE authentication server</option>
      </select>
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" name="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Login</button>
    </form>

    </section>
</template>