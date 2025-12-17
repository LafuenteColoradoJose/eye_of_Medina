<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="flex flex-col justify-center items-center w-full">
      <h2 class="text-2xl font-bold mb-4">Login to Proxmox</h2>
    
      <!-- Formulario de login con usuario/contraseña -->
      <form class="mt-4 w-full max-w-md" @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="proxmox-host" class="block text-sm font-medium">Proxmox Host</label>
          <input 
            type="text" 
            id="proxmox-host" 
            v-model="proxmoxHost"
            :placeholder="defaultHost"
            class="mt-1 block w-full border rounded-md shadow-sm p-2" 
          />
        </div>

        <div class="mb-4">
          <label for="username" class="block text-sm font-medium">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username"
            placeholder="root"
            class="mt-1 block w-full border rounded-md shadow-sm p-2" 
          />
        </div>

        <div class="mb-4">
          <label for="realm" class="block text-sm font-medium">Método de Autenticación</label>
          <select 
            id="realm" 
            v-model="realm"
            class="mt-1 block w-full border rounded-md shadow-sm p-2"
          >
            <option value="pam">Linux PAM - Usuarios del Sistema</option>
            <option value="pve">Proxmox VE - Usuarios de Proxmox</option>
          </select>
          <p class="text-xs muted mt-1">
            Selecciona "Linux PAM" para usuarios del sistema operativo o "Proxmox VE" para usuarios creados en Proxmox
          </p>
        </div>

        <div class="mb-4">
          <label for="password" class="block text-sm font-medium">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            class="mt-1 block w-full border rounded-md shadow-sm p-2" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full px-4 py-2 rounded-md btn-primary"
        >
          {{ loading ? 'Conectando...' : 'Login' }}
        </button>
      </form>

      <!-- Mensajes de error/éxito -->
      <div v-if="message" :class="['mt-4 p-4 rounded-md', messageType === 'error' ? 'status-error' : 'status-success']">
        {{ message }}
      </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const router = useRouter();
const { login } = useProxmox();
const runtimeConfig = useRuntimeConfig();
const defaultHost = runtimeConfig.public.proxmoxHost || 'https://your-proxmox-host:8006';

// Estado del formulario
const proxmoxHost = ref(defaultHost);
const username = ref('root');
const realm = ref('pam');
const password = ref('');
const loading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Login con usuario y contraseña
const handleLogin = async () => {
  loading.value = true;
  message.value = '';
  
  const fullUsername = `${username.value}@${realm.value}`;
  const result = await login(fullUsername, password.value, proxmoxHost.value);
  
  loading.value = false;
  
  if (result.success) {
    messageType.value = 'success';
    message.value = '¡Login exitoso! Redirigiendo...';
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  } else {
    messageType.value = 'error';
    message.value = result.message || 'Error al iniciar sesión';
  }
};
</script>