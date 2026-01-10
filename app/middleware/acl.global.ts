export default defineNuxtRouteMiddleware(async (to) => {
  // No ejecutar en SSR para evitar errores de hidratación
  if (import.meta.server) return

  // Permitir libremente la página de login/landing
  if (to.path === '/' || to.path === '/index') return

  const { isAuthenticated, username, hasPermission, hasPermissionAnywhere, getUserPermissions, isClusterAdmin } = useProxmox()

  if (!isAuthenticated.value) return navigateTo('/')

  // Asegurarnos de que tenemos los permisos más recientes
  // (Aunque restoreSession ya lo hace, mejor asegurar antes de navegar)
  await getUserPermissions()

  // Dashboard accesible para todos los logueados
  if (to.path === '/dashboard') return

  // Superusuarios
  if (isClusterAdmin.value) return

  const path = to.path

  // MÁQUINAS: Permitir si se tiene VM.Audit en CUALQUIER sitio
  if (path === '/machines') {
    if (!hasPermissionAnywhere('VM.Audit')) {
      return navigateTo('/dashboard')
    }
    return
  }

  // REDES: Permitir si tiene Sys.Audit o SDN.Audit en cualquier sitio
  if (path === '/networks') {
    if (!hasPermissionAnywhere('Sys.Audit') && !hasPermissionAnywhere('SDN.Audit')) {
      return navigateTo('/dashboard')
    }
    return
  }

  // USUARIOS: Permitir si tiene User.Audit o User.Modify en cualquier sitio
  if (path === '/users') {
    if (!hasPermissionAnywhere('User.Audit') && !hasPermissionAnywhere('User.Modify')) {
      return navigateTo('/dashboard')
    }
    return
  }

  // POOLS: Permitir si tiene Pool.Audit o VM.Allocate en cualquier sitio
  if (path === '/pools') {
    if (!hasPermissionAnywhere('Pool.Audit') && !hasPermissionAnywhere('VM.Allocate')) {
      return navigateTo('/dashboard')
    }
    return
  }

  // PERMISOS: Permitir si tiene Sys.Audit o Permissions.Modify en cualquier sitio
  if (path === '/permissions') {
    if (!hasPermissionAnywhere('Sys.Audit') && !hasPermissionAnywhere('Permissions.Modify')) {
      return navigateTo('/dashboard')
    }
    return
  }

  // ROLES
  if (path === '/roles') {
    if (!hasPermissionAnywhere('Sys.Audit') && !hasPermissionAnywhere('Permissions.Modify')) return navigateTo('/dashboard')
    return
  }

  // GRUPOS
  if (path === '/groups') {
    if (!hasPermissionAnywhere('User.Audit') && !hasPermissionAnywhere('Group.Allocate')) return navigateTo('/dashboard')
    return
  }

  // Rutas de Infraestructura Global (requieren permisos en Root)
  const rootRoutes = {
    // '/networks': 'Sys.Audit',
    // '/pools': 'Pool.Audit', // Ya manejado arriba
    // '/permissions': 'Sys.Audit', // Ya manejado arriba
    '/permissions-tree': 'Sys.Audit',
    // '/roles': 'Sys.Audit', // Ya manejado arriba
    // '/groups': 'User.Audit', // Ya manejado arriba
    // '/users': 'User.Audit' // Ya manejado arriba
  }

  if (path in rootRoutes) {
    const required = rootRoutes[path as keyof typeof rootRoutes]
    // Check estricto en '/'
    if (!hasPermission(required, '/')) {
      // Excepción: Users puede ser en /access/users
      if (path === '/users' && hasPermission('User.Audit', '/access/users')) return
      if (path === '/groups' && hasPermission('User.Audit', '/access/groups')) return

      return navigateTo('/dashboard')
    }
  }

})
