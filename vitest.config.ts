import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom', // Faster than jsdom
    include: ['tests/unit/**/*.spec.ts'], // Ignorar los de Playwright (E2E)
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['text', 'json', 'html'],
      include: ['**/*.vue', 'composables/**/*.ts', 'utils/**/*.ts', 'server/**/*.ts'],
      exclude: ['node_modules', 'dist', '.nuxt', 'tests']
    }
  }
})
