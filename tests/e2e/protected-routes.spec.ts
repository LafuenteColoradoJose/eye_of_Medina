import { test, expect } from '@nuxt/test-utils/playwright'

test.describe('Protección de rutas (Rutas Privadas)', () => {
  test('Redirige a login al visitar /dashboard sin sesión', async ({ page, goto }) => {
    // Navigate to a protected route
    await goto('/dashboard', { waitUntil: 'hydration' })
    await page.waitForURL('**/') // Ensure we end up on the index page

    // Check we see the login component
    await expect(page.locator('h1')).toHaveText('Welcome to Eye of Medina')
  })

  test('Redirige a login al visitar /machines sin sesión', async ({ page, goto }) => {
    // Navigate to a protected route
    await goto('/machines', { waitUntil: 'hydration' })
    await page.waitForURL('**/')
  })

  test('Redirige a login al visitar /storage sin sesión', async ({ page, goto }) => {
    // Navigate to a protected route
    await goto('/storage', { waitUntil: 'hydration' })
    await page.waitForURL('**/')
  })
})
