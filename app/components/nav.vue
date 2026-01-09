<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="sidebar-nav border-b md:border-b-0 md:border-r-2 w-full md:w-64 bg-surface shrink-0 flex flex-col">
    <div class="flex items-center justify-between p-4 md:flex-col md:gap-4">
      <Logo />
      <button
        class="btn-hamburger md:hidden inline-flex flex-col items-center justify-center w-11 h-11 rounded hover:bg-white/10 transition-colors"
        @click="toggle" :aria-expanded="isOpen" aria-label="Abrir menú">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <div class="flex-1 flex flex-col">
      <ul :class="[
        'flex flex-col md:flex md:flex-col md:items-center gap-3 md:gap-5 px-4 pb-4 md:pb-0 transition-all duration-200',
        isOpen ? 'flex' : 'hidden md:flex'
      ]">
        <li v-for="item in items" :key="item.to" class="w-full md:w-auto">
          <NuxtLink :to="item.to" class="hover:underline block" @click="closeOnNavigate">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <div v-if="isAuthenticated" :class="[
        'px-4 pb-4 md:pb-6 flex flex-col gap-3 md:mt-4',
        isOpen ? 'flex' : 'hidden md:flex'
      ]">
        <button
          class="flex items-center justify-center gap-2 w-full py-2 rounded border border-white/20 bg-white/10 text-text-on-strong hover:bg-white/20 transition-colors"
          @click="toggleTheme">
          <span v-if="isDark" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2" />
              <path d="M12 21v2" />
              <path d="M4.22 4.22l1.42 1.42" />
              <path d="M18.36 18.36l1.42 1.42" />
              <path d="M1 12h2" />
              <path d="M21 12h2" />
              <path d="M4.22 19.78l1.42-1.42" />
              <path d="M18.36 5.64l1.42-1.42" />
            </svg>
            Modo Claro
          </span>
          <span v-else class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Modo Oscuro
          </span>
        </button>
        <button class="btn-warning w-full py-2 rounded flex-shrink-0" @click="handleLogout">Cerrar sesión</button>
      </div>

      <div :class="[
        'mt-auto px-4 pb-4 md:pb-6 text-center text-xs text-gray-300 flex flex-col gap-1',
        isOpen ? 'flex' : 'hidden md:flex'
      ]">
        <a href="https://www.iesmedinaazahara.es/" target="_blank" rel="noreferrer noopener" class="hover:underline">
          IES Medina Azahara
        </a>
        <span>© 2025</span>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
import { computed } from 'vue'

const { logout, isAuthenticated, username } = useProxmox()
const isOpen = ref(false)
const isDark = ref(false)

const allItems = [
  { to: '/', label: 'Home', roles: ['all'] },
  { to: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { to: '/my-resources', label: 'Mis Recursos', roles: ['student'] },
  { to: '/machines', label: 'Máquinas', roles: ['admin'] },
  { to: '/networks', label: 'Redes', roles: ['admin'] },
  { to: '/pools', label: 'Pools', roles: ['admin'] },
  { to: '/users', label: 'Usuarios', roles: ['admin'] },
  { to: '/groups', label: 'Grupos', roles: ['admin'] },
  { to: '/roles', label: 'Roles', roles: ['admin'] },
  { to: '/permissions', label: 'Permisos', roles: ['admin'] },
  { to: '/permissions-tree', label: 'Árbol permisos', roles: ['admin'] },
]

const items = computed(() => {
  const user = username.value || ''
  const isAdmin = user === 'root@pam' || user.toLowerCase().startsWith('profesor') || user.includes('profesor')

  return allItems.filter(item => {
    if (item.roles.includes('all')) return true
    if (isAdmin && item.roles.includes('admin')) return true
    if (!isAdmin && item.roles.includes('student')) return true
    return false
  })
})

onMounted(() => {
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

const closeOnNavigate = () => {
  if (window.innerWidth < 768) isOpen.value = false
}

const handleLogout = () => {
  logout()
  router.push('/')
}

watch(
  () => route.fullPath,
  () => {
    if (window.innerWidth < 768) isOpen.value = false
  }
)
</script>

<style scoped>
.sidebar-nav {
  min-height: auto;
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 9999px;
}

.hamburger-line+.hamburger-line {
  margin-top: 6px;
}

@media (min-width: 768px) {
  .sidebar-nav {
    min-height: 100%;
  }

  /* Force hide hamburger on desktop to prevent interactions */
  .btn-hamburger {
    display: none !important;
  }
}
</style>