<script setup lang="ts">
useHead({ title: 'Acceso' })
import Login from '~/components/login.vue';

const { isAuthenticated, restoreSession, username } = useProxmox();
const router = useRouter();

const handleRedirect = () => {
  const user = username.value || ''
  // Logic: Admins (root) and Professors go to Dashboard. Others (Alumnos) go to simplified view.
  if (user === 'root@pam' || user.toLowerCase().startsWith('profesor') || user.includes('profesor')) {
    router.replace('/dashboard')
  } else {
    router.replace('/my-resources')
  }
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
