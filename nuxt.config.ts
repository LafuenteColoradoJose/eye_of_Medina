// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils'
  ],
  runtimeConfig: {
    proxmoxHost: process.env.PROXMOX_HOST || process.env.NUXT_PUBLIC_PROXMOX_HOST || 'https://your-proxmox-host:8006',
    public: {
      proxmoxHost: process.env.NUXT_PUBLIC_PROXMOX_HOST || process.env.PROXMOX_HOST || 'https://your-proxmox-host:8006',
    },
  },
  vite: {
    plugins: [tailwindcss()]
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Eye of Medina',
      charset: 'utf-8',
      meta: [
        { name: 'description', content: 'Eye of Medina - Monitoring and gestion of Proxmox' }
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  },
})