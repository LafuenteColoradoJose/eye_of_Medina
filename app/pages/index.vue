<script setup lang="ts">
useHead({ title: 'Acceso' })
import Login from '~/components/login.vue';

const { isAuthenticated, restoreSession } = useProxmox();
const router = useRouter();

onMounted(() => {
  restoreSession();
  if (isAuthenticated.value) {
    router.replace('/dashboard');
  }
});

watch(isAuthenticated, (isAuth) => {
  if (isAuth) router.replace('/dashboard');
});
</script>

<template>
  <section class="flex flex-col justify-center items-center p-6">
    <h1 class="text-3xl font-bold underline mb-4">
      Welcome to Eye of Medina
    </h1>

    <Login />
  </section>
</template>
