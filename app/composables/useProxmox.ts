export const useProxmox = () => {
  const runtimeConfig = useRuntimeConfig()
  const defaultHost = runtimeConfig.public?.proxmoxHost || (import.meta.server ? runtimeConfig.proxmoxHost : '')

  // Estado de autenticación
  const authToken = useState<string | null>('proxmox-auth-token', () => null)
  const csrfToken = useState<string | null>('proxmox-csrf-token', () => null)
  const username = useState<string | null>('proxmox-username', () => null)
  const isAuthenticated = computed(() => !!authToken.value)

  /**
   * Login a Proxmox usando usuario y contraseña
   * @param user - Usuario (formato: username@realm, ej: root@pam)
   * @param password - Contraseña
   * @param proxmoxHost - Host de Proxmox (ej: https://192.168.8.2400:8006)
   */
  type ProxmoxLoginResponse = {
    data?: {
      ticket: string
      CSRFPreventionToken: string
      username: string
    }
  }
  const login = async (user: string, password: string, proxmoxHost: string) => {
    try {
      const hostToUse = proxmoxHost || defaultHost

      if (!hostToUse) {
        throw new Error('Host de Proxmox no configurado')
      }

      // Enviar como form-urlencoded (Proxmox espera form data)
      const form = new URLSearchParams()
      form.append('username', user)
      form.append('password', password)

      let response: ProxmoxLoginResponse

      // Si estamos en el cliente, hacemos la petición al endpoint local que actúa
      // como proxy para evitar problemas de CORS y certificados autofirmados.
      if (typeof window !== 'undefined') {
        response = await $fetch('/api/proxmox/login', {
          method: 'POST',
          body: {
            username: user,
            password,
            host: hostToUse,
          },
        })
      } else {
        response = await $fetch(`${hostToUse}/api2/json/access/ticket`, {
          method: 'POST',
          body: form,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      }

      if (response && response.data) {
        authToken.value = response.data.ticket
        csrfToken.value = response.data.CSRFPreventionToken
        username.value = response.data.username

        // Guardar en localStorage para persistencia
        if (import.meta.client) {
          localStorage.setItem('proxmox-auth-token', response.data.ticket)
          localStorage.setItem('proxmox-csrf-token', response.data.CSRFPreventionToken)
          localStorage.setItem('proxmox-username', response.data.username)
          localStorage.setItem('proxmox-host', hostToUse)
        }

        return {
          success: true,
          message: 'Login exitoso',
          data: response.data,
        }
      }

      return {
        success: false,
        message: 'Error en la respuesta del servidor',
      }
    } catch (error: unknown) {
      console.error('Error en login de Proxmox:', error)
      const message = error instanceof Error ? error.message : 'Error al conectar con Proxmox'
      return {
        success: false,
        message,
        error,
      }
    }
  }


  /**
   * Hacer una petición autenticada a la API de Proxmox
   */
  const proxmoxRequest = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    host?: string,
    body?: BodyInit | Record<string, unknown> | null
  ) => {
    const proxmoxHost = host || (typeof window !== 'undefined' ? localStorage.getItem('proxmox-host') : null) || defaultHost

    if (!proxmoxHost) {
      throw new Error('Host de Proxmox no configurado')
    }

    if (!authToken.value) {
      throw new Error('No autenticado')
    }

    try {
      const headers: Record<string, string> = {}

      // Si usamos ticket (cookie)
      if (authToken.value.startsWith('PVE:')) {
        headers['Cookie'] = `PVEAuthCookie=${authToken.value}`
        if (csrfToken.value && method !== 'GET') {
          headers['CSRFPreventionToken'] = csrfToken.value
        }
      } else {
        // Si usamos API Token
        headers['Authorization'] = authToken.value
      }

      let response: { data?: unknown }

      // If in browser, use server proxy to avoid CORS and TLS issues
      if (typeof window !== 'undefined') {
        response = await $fetch('/api/proxmox/request', {
          method: 'POST',
          body: {
            endpoint,
            method,
            host: proxmoxHost,
            data: body,
            authToken: authToken.value,
            csrfToken: csrfToken.value,
          },
        })
      } else {
        response = await $fetch(`${proxmoxHost}/api2/json${endpoint}`, {
          method,
          headers,
          body,
        })
      }

      return {
        success: true,
        data: response.data,
      }
    } catch (error: unknown) {
      console.error('Error en petición Proxmox:', error)

      const maybeError = error as { data?: { message?: string; errors?: unknown }; details?: unknown }
      const message =
        (maybeError.data && typeof maybeError.data.message === 'string' && maybeError.data.message) ||
        (error instanceof Error ? error.message : 'Error en la petición')

      const details = maybeError.data?.errors ?? maybeError.details ?? maybeError.data

      return {
        success: false,
        message,
        details,
        error,
      }
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    authToken.value = null
    csrfToken.value = null
    username.value = null

    if (import.meta.client) {
      localStorage.removeItem('proxmox-auth-token')
      localStorage.removeItem('proxmox-csrf-token')
      localStorage.removeItem('proxmox-username')
      localStorage.removeItem('proxmox-host')
    }
  }

  /**
   * Restaurar sesión desde localStorage
   */
  const restoreSession = () => {
    if (import.meta.client) {
      const token = localStorage.getItem('proxmox-auth-token')
      const csrf = localStorage.getItem('proxmox-csrf-token')
      const user = localStorage.getItem('proxmox-username')

      if (token) {
        authToken.value = token
        csrfToken.value = csrf
        username.value = user
        // Refresh permissions
        getUserPermissions()
      }
    }
  }

  // Permisos del usuario actual (RBAC)
  // Estructura: { "/": { "Sys.Audit": 1 }, "/vms/100": { ... } }
  const userPermissions = useState<Record<string, Record<string, number>>>('proxmox-permissions', () => ({}))

  /**
   * Obtener permisos del usuario logueado desde la API
   */
  const getUserPermissions = async () => {
    try {
      const res = await proxmoxRequest('/access/permissions', 'GET')
      if (res.success && res.data) {
        userPermissions.value = res.data
      }
      return res
    } catch (e) {
      console.error('Error fetching permissions', e)
      return { success: false }
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico (RBAC Check)
   * Si no se especifica path, busca en la raíz ('/') o cualquiera.
   * @param permission - Ej: 'Sys.Audit', 'VM.Allocate'
   * @param path - (Opcional) Path específico, ej: '/vms/100'
   */
  /**
   * Verificar si el usuario tiene un permiso específico (RBAC Check)
   * Soporta herencia simple: Root -> Pool -> VM
   * @param permission - Ej: 'Sys.Audit', 'VM.Allocate'
   * @param path - (Opcional) Path específico, ej: '/vms/100'
   * @param pool - (Opcional) ID del pool si el recurso pertenece a uno, ej: 'my-pool'
   */
  const hasPermission = (permission: string, path: string = '/', pool?: string) => {
    if (!userPermissions.value) return false

    // 1. Check Admin Global (Root)
    if (userPermissions.value['/'] && userPermissions.value['/'][permission]) return true

    // 2. Check Path Específico (ej. /vms/100)
    if (path !== '/' && userPermissions.value[path] && userPermissions.value[path][permission]) return true

    // 3. Check Herencia de Pool (si aplica)
    if (pool) {
      const poolPath = `/pool/${pool}`
      if (userPermissions.value[poolPath] && userPermissions.value[poolPath][permission]) return true
    }

    return false
  }

  /**
   * Verificar si el usuario tiene un permiso en CUALQUIER path.
   * Útil para mostrar menús generales (ej: "Máquinas" si tienes acceso a alguna VM).
   */
  const hasPermissionAnywhere = (permission: string) => {
    if (!userPermissions.value) return false
    return Object.values(userPermissions.value).some(perms => perms[permission])
  }

  /**
   * Helper simple para saber si es Admin de facto (tiene permisos en /)
   */
  const isClusterAdmin = computed(() => {
    return hasPermission('Sys.Audit', '/') || username.value === 'root@pam'
  })

  // ... (resto del return)

  return {
    // Estado
    authToken,
    csrfToken,
    username,
    isAuthenticated,
    userPermissions,
    isClusterAdmin,

    // Métodos
    login: async (user: string, pass: string, host: string) => {
      const res = await login(user, pass, host)
      if (res.success) {
        await getUserPermissions()
      }
      return res
    },
    getUserPermissions,
    hasPermission,
    hasPermissionAnywhere,
    proxmoxRequest,
    // ... rest of methods
    // CRUD helpers
    createUser: async (userid: string, password: string, realm = 'pve', comment?: string, groups?: string | string[]) => {
      // 1. Sanitize input
      let cleanUser = userid.trim()

      // 2. Smartly append realm if missing
      // If user typed "pepe@pve", keep it. If "pepe", transform to "pepe@pve".
      // We check if it ENDS with the realm to be precise, or has any @realm part.
      if (!cleanUser.includes('@')) {
        cleanUser = `${cleanUser}@${realm}`
      }

      // 3. Prepare payload for Proxmox API
      const payload: Record<string, unknown> = {
        userid: cleanUser,
        password: password,
        comment: comment || undefined,
      }

      // 4. Handle Groups safely
      if (groups) {
        if (Array.isArray(groups) && groups.length > 0) {
          payload.groups = groups.join(',')
        } else if (typeof groups === 'string' && groups.trim().length > 0) {
          payload.groups = groups.trim()
        }
      }

      return await proxmoxRequest('/access/users', 'POST', undefined, payload)
    },
    deleteUser: async (userid: string) => {
      // DELETE /access/users/{userid}
      return await proxmoxRequest(`/access/users/${encodeURIComponent(userid)}`, 'DELETE')
    },
    updateUser: async (userid: string, data: Record<string, unknown>) => {
      // PUT /access/users/{userid} with form data (e.g., comment)
      return await proxmoxRequest(`/access/users/${encodeURIComponent(userid)}`, 'PUT', undefined, data)
    },
    // Group management
    listGroups: async () => {
      return await proxmoxRequest('/access/groups', 'GET')
    },
    createGroup: async (groupid: string, comment?: string) => {
      return await proxmoxRequest('/access/groups', 'POST', undefined, { groupid, comment })
    },
    updateGroup: async (groupid: string, data: Record<string, unknown>) => {
      return await proxmoxRequest(`/access/groups/${encodeURIComponent(groupid)}`, 'PUT', undefined, data)
    },
    deleteGroup: async (groupid: string) => {
      return await proxmoxRequest(`/access/groups/${encodeURIComponent(groupid)}`, 'DELETE')
    },
    // Pool management
    listPools: async () => proxmoxRequest('/pools', 'GET'),

    // Nodes and VM/CT resources
    listNodes: async () => proxmoxRequest('/nodes', 'GET'),
    listVMResources: async () => proxmoxRequest('/cluster/resources', 'GET'),
    // Network management
    getNodeNetworks: async (node: string) => proxmoxRequest(`/nodes/${encodeURIComponent(node)}/network`, 'GET'),

    // Storage & Content
    listStorages: async (node: string) => proxmoxRequest(`/nodes/${encodeURIComponent(node)}/storage`, 'GET'),

    listStorageContent: async (node: string, storage: string, content?: 'iso' | 'vztmpl') => {
      let url = `/nodes/${encodeURIComponent(node)}/storage/${encodeURIComponent(storage)}/content`
      if (content) url += `?content=${content}`
      return proxmoxRequest(url, 'GET')
    },

    // Create Machine from scratch
    createQemu: async (node: string, data: Record<string, unknown>) =>
      proxmoxRequest(`/nodes/${encodeURIComponent(node)}/qemu`, 'POST', undefined, data),

    createLxc: async (node: string, data: Record<string, unknown>) =>
      proxmoxRequest(`/nodes/${encodeURIComponent(node)}/lxc`, 'POST', undefined, data),

    // VM/CT config helpers
    updateMachineConfig: async (
      node: string,
      type: 'qemu' | 'lxc',
      vmid: number | string,
      data: Record<string, unknown>
    ) => proxmoxRequest(`/nodes/${encodeURIComponent(node)}/${type}/${vmid}/config`, 'PUT', undefined, data),

    // Power Management
    setMachineStatus: async (
      node: string,
      type: 'qemu' | 'lxc',
      vmid: number | string,
      action: 'start' | 'stop' | 'shutdown' | 'reboot'
    ) => proxmoxRequest(`/nodes/${encodeURIComponent(node)}/${type}/${vmid}/status/${action}`, 'POST'),

    deleteMachine: async (node: string, type: 'qemu' | 'lxc', vmid: number | string) =>
      proxmoxRequest(`/nodes/${encodeURIComponent(node)}/${type}/${vmid}`, 'DELETE'),

    getVncTicket: async (node: string, type: 'qemu' | 'lxc', vmid: number | string) =>
      proxmoxRequest(`/nodes/${encodeURIComponent(node)}/${type}/${vmid}/vncproxy`, 'POST', undefined, { websocket: 1 }),

    cloneMachine: async (
      node: string,
      type: 'qemu' | 'lxc',
      vmid: number | string,
      data: Record<string, unknown>
    ) => proxmoxRequest(`/nodes/${encodeURIComponent(node)}/${type}/${vmid}/clone`, 'POST', undefined, data),

    // Pool membership helpers
    addVmToPool: async (poolid: string, vmid: number | string) =>
      proxmoxRequest(`/pools/${encodeURIComponent(poolid)}`, 'PUT', undefined, { vms: String(vmid) }),
    // Role management
    listRoles: async () => {
      return await proxmoxRequest('/access/roles', 'GET')
    },
    createRole: async (roleid: string, privs?: string) => {
      // privs: comma-separated privileges
      return await proxmoxRequest('/access/roles', 'POST', undefined, { roleid, privs })
    },
    deleteRole: async (roleid: string) => {
      return await proxmoxRequest(`/access/roles/${encodeURIComponent(roleid)}`, 'DELETE')
    },

    // ACL / Permissions management
    listACLs: async () => {
      return await proxmoxRequest('/access/acl', 'GET')
    },
    createACL: async (path: string, role: string, options?: Record<string, unknown>) => {
      // Proxmox ACL API expects PUT with roles and users/groups/pool/vmid
      const cleanPath = (path || '').trim()
      let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
      // Normalizar paths de pool escritos como "/pool1" -> "/pool/pool1"
      const poolMatch = normalizedPath.match(/^\/pool([^/]+)$/)
      if (poolMatch) normalizedPath = `/pool/${poolMatch[1]}`

      const body: Record<string, unknown> = { path: normalizedPath, roles: role }

      // Propagate por defecto activado salvo que se indique 0/false
      if (options && 'propagate' in options) {
        body.propagate = options.propagate ? 1 : 0
      } else {
        body.propagate = 1
      }

      // Normalizar claves permitidas por Proxmox
      if (options) {
        if (options.user) body.users = options.user
        if (options.users) body.users = options.users
        if (options.group) body.groups = options.group
        if (options.groups) body.groups = options.groups
        if (options.tokens) body.tokens = options.tokens
      }

      if (!body.users && !body.groups && !body.tokens) {
        throw new Error('Debes especificar al menos un usuario o grupo para la ACL')
      }

      // Quitar undefined/null
      const cleanedBody = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )

      return await proxmoxRequest('/access/acl', 'PUT', undefined, cleanedBody)
    },
    deleteACL: async (path: string, role?: string, options?: Record<string, unknown>) => {
      const cleanPath = (path || '').trim()
      let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
      const poolMatch = normalizedPath.match(/^\/pool([^/]+)$/)
      if (poolMatch) normalizedPath = `/pool/${poolMatch[1]}`
      const body: Record<string, unknown> = { path: normalizedPath, delete: 1 }
      if (role) body.roles = role

      if (options) {
        if (options.user) body.users = options.user
        if (options.users) body.users = options.users
        if (options.group) body.groups = options.group
        if (options.groups) body.groups = options.groups
      }

      const cleanedBody = Object.fromEntries(
        Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== '')
      )

      return await proxmoxRequest('/access/acl', 'PUT', undefined, cleanedBody)
    },

    // Cluster Logs / Tasks
    getClusterLog: async (limit = 50, userFilter?: string) => {
      let url = `/cluster/tasks?limit=${limit}`
      if (userFilter) {
        url += `&userfilter=${encodeURIComponent(userFilter)}`
      }
      return await proxmoxRequest(url, 'GET')
    },

    // Node Logs (Fallback if Cluster Log fails)
    getNodeTasks: async (node: string, limit = 50, userFilter?: string) => {
      let url = `/nodes/${encodeURIComponent(node)}/tasks?limit=${limit}`
      if (userFilter) {
        url += `&userfilter=${encodeURIComponent(userFilter)}`
      }
      return await proxmoxRequest(url, 'GET')
    },

    changeUserPassword: async (userid: string, password: string) => {
      return await proxmoxRequest('/access/password', 'PUT', undefined, { userid, password })
    },
    logout,
    restoreSession,
  }
}
