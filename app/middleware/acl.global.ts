export default defineNuxtRouteMiddleware(async (to) => {
  // No ejecutar en SSR para evitar errores de hidratación
  if (import.meta.server) return

  // Permitir libremente la página de login/landing
  if (to.path === '/' || to.path === '/index') return

  const { isAuthenticated, username } = useProxmox()
  if (!isAuthenticated.value) return navigateTo('/')

  // root@pam tiene acceso completo a todas las vistas
  if (username.value === 'root@pam') return

  // Rutas con requisitos de privilegios mínimos
  const routeNeeds: Record<string, string[]> = {
    '/permissions': ['Sys.Modify'],
    '/roles': ['Sys.Audit'],
    '/groups': ['Sys.Audit'],
    '/users': ['User.Audit', 'Sys.Audit'],
    '/pools': ['Pool.Audit'],
  }

  // Caso especial: solo root@pam puede ver árbol de permisos
  if (to.path === '/permissions-tree') {
    if (username.value !== 'root@pam') return navigateTo('/dashboard')
    return
  }

  const required = routeNeeds[to.path]
  if (!required) return

  try {
    const { fetchPermissions, has } = usePermissions()
    const { success, permissions } = await fetchPermissions('/')
    if (!success) return navigateTo('/dashboard')

    const allowed = required.some((priv) => has(permissions, priv))
    if (!allowed) return navigateTo('/dashboard')
  } catch (error) {
    console.error('ACL middleware error', error)
    return navigateTo('/dashboard')
  }
})
