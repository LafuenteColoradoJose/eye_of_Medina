import { test, expect } from '@nuxt/test-utils/playwright'

test('La página principal de login carga y muestra el título correcto', async ({ page, goto }) => {
  // Vamos a la ruta raíz `/` y esperamos a que cargue Vue (hydration)
  await goto('/', { waitUntil: 'hydration' })
  
  // Comprobamos que el título H1 que acabo de ver en tu index.vue aparece correctamente
  await expect(page.locator('h1')).toHaveText('Welcome to Eye of Medina')
  
  // También comprobamos que el meta-título de la pestaña sea el correcto ('Acceso' o contenga 'Eye')
  await expect(page).toHaveTitle(/.*Acceso.*/i)
})
