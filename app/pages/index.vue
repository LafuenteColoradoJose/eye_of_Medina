<script setup lang="ts">
import Login from '~/components/login.vue';
useHead({ title: 'Acceso' })

const { isAuthenticated, restoreSession } = useProxmox();
const router = useRouter();

const handleRedirect = () => {
  // Logic: Everyone goes to Dashboard now.
  router.replace('/dashboard')
}

onMounted(() => {
  restoreSession();
  if (isAuthenticated.value) {
    handleRedirect();
  }
});

watch(isAuthenticated, (isAuth) => {
  if (isAuth) handleRedirect();
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
