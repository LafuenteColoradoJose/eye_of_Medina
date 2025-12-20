export default defineNuxtRouteMiddleware(async (to) => {
  // No ejecutar en SSR para evitar errores de hidratación
  if (import.meta.server) return

  // Permitir libremente la página de login/landing
  if (to.path === '/' || to.path === '/index') return

  const { isAuthenticated, username } = useProxmox()
  if (!isAuthenticated.value) return navigateTo('/')

  // root@pam y miembros del grupo Profesores tienen acceso completo
  // Nota: en Proxmox los grupos se reflejan en el username como userid@realm (no incluye grupo),
  // así que para efectos prácticos de la UI tratamos a "profesor" (pve o pam) como superuser.
  const isProfessor = username.value?.startsWith('Profesor') || username.value?.includes('@profesores')
  if (username.value === 'root@pam' || isProfessor) return

  // Rutas con requisitos de privilegios mínimos
  const routeNeeds: Record<string, string[]> = {
    '/permissions': ['Sys.Modify'],
    '/roles': ['Sys.Audit'],
    '/groups': ['Sys.Audit'],
    '/users': ['User.Audit', 'Sys.Audit'],
    '/pools': ['Pool.Audit'],
    '/machines': ['VM.Audit'],
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
