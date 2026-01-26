<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Main Container -->
  <nav class="group fixed z-40 md:sticky md:top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out
           w-64 md:w-20 md:hover:w-64"
    :class="{ '-translate-x-full md:translate-x-0': !isOpen, 'translate-x-0 shadow-2xl': isOpen }">
    <!-- Header / Logo -->
    <div
      class="h-16 flex items-center justify-between px-4 shrink-0 transition-all duration-300 border-b border-white/5">
      <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <!-- Icono Logo (Siempre visible) -->
        <div class="w-10 h-10 shrink-0 flex items-center justify-center text-primary ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <!-- Texto Logo (Visible en Hover/Mobile) -->
        <div
          class="font-bold text-lg tracking-tight opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
          Eye of Medina
        </div>
      </div>

      <!-- Close Button (MOBILE ONLY - Hidden on md+) -->
      <button class="md:hidden text-text-muted hover:text-text p-2 bg-surface-strong rounded-md"
        @click="isOpen = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="M6 6 18 18" />
        </svg>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 flex flex-col py-4 overflow-y-auto overflow-x-hidden gap-1 custom-scrollbar">

      <!-- Menu Items -->
      <ul class="flex flex-col gap-1 px-2">
        <li v-for="item in items" :key="item.to">
          <NuxtLink :to="item.to"
            class="flex items-center h-12 px-3 rounded-lg text-text-muted hover:bg-white/5 hover:text-primary transition-colors relative group/item"
            active-class="bg-primary/10 text-primary font-medium" @click="closeOnNavigate">
            <!-- Icon Wrappper -->
            <div class="w-6 h-6 shrink-0 flex items-center justify-center">
              <component :is="item.icon" />
            </div>

            <!-- Label -->
            <span
              class="ml-3 whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
              {{ item.label }}
            </span>

            <!-- Tooltip (Visible ONLY when collapsed on Desktop) -->
            <div
              class="hidden md:block group-hover:hidden absolute left-full ml-2 px-2 py-1 bg-surface-strong text-white text-xs rounded opacity-0 group-hover/item:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-white/10">
              {{ item.label }}
            </div>
          </NuxtLink>
        </li>
      </ul>

      <div class="mt-auto px-2 flex flex-col gap-1">
        <!-- Divider -->
        <div class="h-px bg-white/10 mx-2 my-2 w-full opacity-50"></div>

        <!-- Tasks Button -->
        <button
          class="flex items-center h-12 px-3 rounded-lg text-text-muted hover:bg-white/5 hover:text-primary transition-colors w-full relative group/item"
          @click="openTasksDrawer" title="Tareas Recientes">
          <div class="w-6 h-6 shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </div>
          <span
            class="ml-3 whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            Tareas
          </span>
          <div
            class="hidden md:block group-hover:hidden absolute left-full ml-2 px-2 py-1 bg-surface-strong text-white text-xs rounded opacity-0 group-hover/item:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-white/10">
            Tareas Recientes
          </div>
        </button>

        <!-- Theme Toggle -->
        <button
          class="flex items-center h-12 px-3 rounded-lg text-text-muted hover:bg-white/5 hover:text-primary transition-colors w-full relative group/item"
          @click="toggleTheme">
          <div class="w-6 h-6 shrink-0 flex items-center justify-center">
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
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
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <span
            class="ml-3 whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            {{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}
          </span>
          <div
            class="hidden md:block group-hover:hidden absolute left-full ml-2 px-2 py-1 bg-surface-strong text-white text-xs rounded opacity-0 group-hover/item:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-white/10">
            Cambiar Tema
          </div>
        </button>

        <!-- Logout -->
        <button
          class="flex items-center h-12 px-3 rounded-lg text-danger hover:bg-danger/10 transition-colors mt-1 w-full relative group/item"
          @click="handleLogout">
          <div class="w-6 h-6 shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </div>
          <span
            class="ml-3 whitespace-nowrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            Salir
          </span>
          <div
            class="hidden md:block group-hover:hidden absolute left-full ml-2 px-2 py-1 bg-surface-strong text-white text-xs rounded opacity-0 group-hover/item:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-lg border border-white/10">
            Cerrar Sesión
          </div>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Overlay & Toggle -->
  <div class="md:hidden">
    <!-- Overlay -->
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
      @click="isOpen = false"></div>

    <!-- Toggle Button (Visible only when closed) -->
    <button v-if="!isOpen"
      class="fixed top-4 left-4 z-30 p-2 bg-surface border border-border rounded-md shadow-lg text-text"
      @click="isOpen = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" x2="21" y1="6" y2="6" />
        <line x1="3" x2="21" y1="12" y2="12" />
        <line x1="3" x2="21" y1="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, h, watch } from 'vue'

const route = useRoute()
const router = useRouter()

const { logout, isAuthenticated, hasPermissionAnywhere, isClusterAdmin } = useProxmox()
const { openTasksDrawer } = useUI()
const isOpen = ref(false)
const isDark = ref(false)

// -- ICON COMPONENTS (Inline SVGs) --
const IconDashboard = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { width: 7, height: 9, x: 3, y: 3, rx: 1 }), h('rect', { width: 7, height: 5, x: 14, y: 3, rx: 1 }), h('rect', { width: 7, height: 9, x: 14, y: 12, rx: 1 }), h('rect', { width: 7, height: 5, x: 3, y: 16, rx: 1 })])
const IconMachines = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { width: 20, height: 8, x: 2, y: 2, rx: 2, ry: 2 }), h('rect', { width: 20, height: 8, x: 2, y: 14, rx: 2, ry: 2 }), h('line', { x1: 6, x2: 6.01, y1: 6, y2: 6 }), h('line', { x1: 6, x2: 6.01, y1: 18, y2: 18 })])
const IconNetworks = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }), h('circle', { cx: 12, cy: 12, r: 10 }), h('path', { d: 'M2 12h20' })])
const IconPools = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z' })])
const IconUsers = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }), h('circle', { cx: 9, cy: 7, r: 4 }), h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })])
const IconGroups = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), h('circle', { cx: 9, cy: 7, r: 4 }), h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })]) // Using similar icon for groups
const IconRoles = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' }), h('path', { d: 'm9 12 2 2 4-4' })])
const IconACL = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { width: 18, height: 11, x: 3, y: 11, rx: 2, ry: 2 }), h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })])
const IconTree = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('rect', { width: 20, height: 8, x: 2, y: 2, rx: 2, ry: 2 }), h('path', { d: 'M2 14h20' }), h('path', { d: 'M12 10v12' }), h('path', { d: 'M12 14h6' }), h('rect', { width: 6, height: 6, x: 18, y: 18, rx: 1 })])
const IconActivity = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2' })])


interface MenuItem {
  to: string
  label: string
  icon: any
}

const items = computed(() => {
  if (!isAuthenticated.value) return []

  const menu: MenuItem[] = []

  // 1. Dashboard
  menu.push({ to: '/dashboard', label: 'Dashboard', icon: IconDashboard })

  // 2. Core Resources
  if (isClusterAdmin.value || hasPermissionAnywhere('VM.Audit')) {
    menu.push({ to: '/machines', label: 'Máquinas', icon: IconMachines })
  }

  // 3. Infrastructure
  if (isClusterAdmin.value || hasPermissionAnywhere('Sys.Audit') || hasPermissionAnywhere('SDN.Audit')) {
    menu.push({ to: '/networks', label: 'Redes', icon: IconNetworks })
    menu.push({ to: '/resources', label: 'Métricas & Calor', icon: IconActivity })
  }

  if (isClusterAdmin.value || hasPermissionAnywhere('Pool.Audit') || hasPermissionAnywhere('VM.Allocate')) {
    menu.push({ to: '/pools', label: 'Pools', icon: IconPools })
  }

  // 4. IAM - Users & Groups
  if (isClusterAdmin.value || hasPermissionAnywhere('User.Modify') || hasPermissionAnywhere('User.Audit')) {
    menu.push({ to: '/users', label: 'Usuarios', icon: IconUsers })
  }

  if (isClusterAdmin.value || hasPermissionAnywhere('User.Audit') || hasPermissionAnywhere('Group.Allocate') || hasPermissionAnywhere('User.Modify')) {
    menu.push({ to: '/groups', label: 'Grupos', icon: IconGroups })
  }

  // 5. IAM - Permissions (Strict visibility)
  // Only show if user can actually MANAGE or AUDIT permissions globally.
  // Regular users with just VM access should NOT see this.
  const canManagePermissions = isClusterAdmin.value || hasPermissionAnywhere('Permissions.Modify') || hasPermissionAnywhere('Sys.Audit')

  if (canManagePermissions) {
    menu.push({ to: '/roles', label: 'Roles', icon: IconRoles })
    menu.push({ to: '/permissions', label: 'ACLs', icon: IconTree })
  }

  return menu
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

// Mobile Toggle (kept for completeness if needed by template)
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

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})

watch(
  () => route.fullPath,
  () => {
    if (window.innerWidth < 768) isOpen.value = false
  }
)
</script>

<style scoped>
/* Scrollbar personalizado para el menú en navegadores basados en WebKit */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>