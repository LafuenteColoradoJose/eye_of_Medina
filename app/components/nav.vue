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

        <!-- Tasks Button -->
        <button
          class="flex items-center justify-center gap-2 w-full py-2 rounded border border-white/20 bg-white/5 text-text-on-strong hover:bg-white/10 transition-colors"
          @click="openTasksDrawer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="m9 16 2 2 4-4" />
          </svg>
          Tareas Recientes
        </button>

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

const { logout, isAuthenticated, username, hasPermission, hasPermissionAnywhere, isClusterAdmin } = useProxmox()
const { openTasksDrawer } = useUI()
const isOpen = ref(false)
const isDark = ref(false)

interface MenuItem {
  to: string
  label: string
  // If true, requires full cluster admin (Sys.Audit on /).
  adminOnly?: boolean
  // If defined, checks hasPermission(perm, path)
  permission?: { name: string, path?: string }
  // Special condition function
  condition?: () => boolean
}

const items = computed(() => {
  const menu: MenuItem[] = []

  // 1. Home logic unificada
  menu.push({ to: '/dashboard', label: 'Dashboard' })

  // 2. Core Resources (Access if can view nodes or allocate VMs typically)
  // Mostramos Máquinas si tienes permiso global de auditar VMs o gestionarlas en CUALQUIER sitio
  if (isClusterAdmin.value || hasPermissionAnywhere('VM.Audit')) {
    menu.push({ to: '/machines', label: 'Máquinas' })
  }

  // 3. Infrastructure
  if (isClusterAdmin.value || hasPermissionAnywhere('Sys.Audit') || hasPermissionAnywhere('SDN.Audit')) {
    menu.push({ to: '/networks', label: 'Redes' })
  }

  if (isClusterAdmin.value || hasPermissionAnywhere('Pool.Audit') || hasPermissionAnywhere('VM.Allocate')) {
    menu.push({ to: '/pools', label: 'Pools' })
  }

  // 4. Identity & Access Management
  if (isClusterAdmin.value || hasPermissionAnywhere('User.Modify') || hasPermissionAnywhere('User.Audit')) {
    menu.push({ to: '/users', label: 'Usuarios' })
  }

  if (isClusterAdmin.value || hasPermissionAnywhere('User.Audit') || hasPermissionAnywhere('Group.Allocate') || hasPermissionAnywhere('User.Modify')) {
    menu.push({ to: '/groups', label: 'Grupos' })
  }

  if (hasPermissionAnywhere('Permissions.Modify') || isClusterAdmin.value || hasPermissionAnywhere('Sys.Audit')) {
    menu.push({ to: '/roles', label: 'Roles' })
  }

  if (isClusterAdmin.value || hasPermissionAnywhere('Permissions.Modify') || hasPermissionAnywhere('Sys.Audit')) {
    menu.push({ to: '/permissions', label: 'Permisos' })
    menu.push({ to: '/permissions-tree', label: 'Árbol permisos' })
  }

  return menu
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