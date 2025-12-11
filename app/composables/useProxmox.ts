export const useProxmox = () => {
  
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
  const login = async (user: string, password: string, proxmoxHost: string) => {
    try {
      // Enviar como form-urlencoded (Proxmox espera form data)
      const form = new URLSearchParams()
      form.append('username', user)
      form.append('password', password)

      let response: any

      // Si estamos en el cliente, hacemos la petición al endpoint local que actúa
      // como proxy para evitar problemas de CORS y certificados autofirmados.
      if (typeof window !== 'undefined') {
        response = await $fetch('/api/proxmox/login', {
          method: 'POST',
          body: {
            username: user,
            password,
            host: proxmoxHost,
          },
        })
      } else {
        response = await $fetch(`${proxmoxHost}/api2/json/access/ticket`, {
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
        if (process.client) {
          localStorage.setItem('proxmox-auth-token', response.data.ticket)
          localStorage.setItem('proxmox-csrf-token', response.data.CSRFPreventionToken)
          localStorage.setItem('proxmox-username', response.data.username)
          localStorage.setItem('proxmox-host', proxmoxHost)
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
    } catch (error: any) {
      console.error('Error en login de Proxmox:', error)
      return {
        success: false,
        message: error.message || 'Error al conectar con Proxmox',
        error,
      }
    }
  }

  
  /**
   * Hacer una petición autenticada a la API de Proxmox
   */
  const proxmoxRequest = async (endpoint: string, method: string = 'GET', host?: string, body?: any) => {
    const proxmoxHost = host || (typeof window !== 'undefined' ? localStorage.getItem('proxmox-host') : null)
    
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

      let response: any

      // If in browser, use server proxy to avoid CORS and TLS issues
      if (typeof window !== 'undefined') {
        response = await $fetch('/api/proxmox/request', {
          method: 'POST',
          body: {
            endpoint,
            method,
            host: proxmoxHost,
            data: body,
          },
        })
      } else {
        response = await $fetch(`${proxmoxHost}/api2/json${endpoint}`, {
          method: method as any,
          headers,
          body,
        })
      }

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error('Error en petición Proxmox:', error)
      return {
        success: false,
        message: error.message || 'Error en la petición',
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

    if (process.client) {
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
    if (process.client) {
      const token = localStorage.getItem('proxmox-auth-token')
      const csrf = localStorage.getItem('proxmox-csrf-token')
      const user = localStorage.getItem('proxmox-username')

      if (token) {
        authToken.value = token
        csrfToken.value = csrf
        username.value = user
      }
    }
  }

  return {
    // Estado
    authToken,
    csrfToken,
    username,
    isAuthenticated,
    
    // Métodos
    login,
    proxmoxRequest,
    logout,
    restoreSession,
  }
}
