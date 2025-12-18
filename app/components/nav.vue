<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav class="sidebar-nav border-b md:border-b-0 md:border-r-2 w-full md:w-64 bg-surface shrink-0 flex flex-col">
    <div class="flex items-center justify-between p-4 md:flex-col md:gap-4">
      <Logo />
      <button
        class="hamburger-btn md:hidden inline-flex flex-col items-center justify-center w-11 h-11 rounded border"
        @click="toggle"
        :aria-expanded="isOpen"
        aria-label="Abrir menú"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <div class="flex-1 flex flex-col">
      <ul
        :class="[
          'flex flex-col md:flex md:flex-col md:items-center gap-4 px-4 pb-4 md:pb-0 transition-all duration-200',
          isOpen ? 'flex' : 'hidden md:flex'
        ]"
      >
        <li v-for="item in items" :key="item.to" class="w-full md:w-auto">
          <NuxtLink
            :to="item.to"
            class="hover:underline block"
            @click="closeOnNavigate"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <div
        :class="[
          'mt-auto px-4 pb-4 md:pb-6 text-center text-xs text-gray-600 flex flex-col gap-1',
          isOpen ? 'flex' : 'hidden md:flex'
        ]"
      >
        <a
          href="https://www.iesmedinaazahara.es/"
          target="_blank"
          rel="noreferrer noopener"
          class="hover:underline"
        >
          IES Medina Azahara
        </a>
        <span>© 2025</span>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
const route = useRoute()
const isOpen = ref(false)

const items = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pools', label: 'Pools' },
  { to: '/users', label: 'Usuarios' },
  { to: '/groups', label: 'Grupos' },
  { to: '/roles', label: 'Roles' },
  { to: '/permissions', label: 'Permisos' },
  { to: '/permissions-tree', label: 'Árbol permisos' },
]

const toggle = () => {
  isOpen.value = !isOpen.value
}

const closeOnNavigate = () => {
  if (window.innerWidth < 768) isOpen.value = false
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

@media (min-width: 768px) {
  .sidebar-nav {
    min-height: 100%;
  }
}

.hamburger-btn {
  background-color: var(--card);
  color: var(--text);
}

.hamburger-line {
  display: block;
  width: 1.5rem;
  height: 2px;
  background-color: currentColor;
  border-radius: 9999px;
}

.hamburger-line + .hamburger-line {
  margin-top: 5px;
}
</style>