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
    allowInsecureTLS: process.env.ALLOW_INSECURE_TLS === 'true',
    public: {
      proxmoxHost: process.env.NUXT_PUBLIC_PROXMOX_HOST || process.env.PROXMOX_HOST || 'https://your-proxmox-host:8006',
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: {
        overlay: false,
        port: 24680,
      },
    },
    // Deshabilita overlay de errores en cliente
    css: {
      devSourcemap: false,
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      title: 'Eye of Medina',
      charset: 'utf-8',
      meta: [
        { name: 'description', content: 'Eye of Medina - Monitorización y gestión de Proxmox' }
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/Logo_Eye_of_Medina.svg' }]
    }
  },
})
