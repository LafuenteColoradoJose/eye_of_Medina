import { readBody, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { endpoint: string; method?: string; host?: string; data?: any; authToken?: string; csrfToken?: string }
    const endpoint = body.endpoint || '/'
    const method = (body.method || 'GET').toUpperCase()
    const runtimeConfig = useRuntimeConfig()
    const defaultHost = runtimeConfig.proxmoxHost || runtimeConfig.public?.proxmoxHost
    const host = body.host || defaultHost

    if (!host) {
      setResponseStatus(event, 400)
      return { success: false, message: 'Host de Proxmox no configurado' }
    }

    // Nota: anteriormente se deshabilitaba la verificación TLS global con
    // `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` para facilitar pruebas
    // con certificados autofirmados. Eso genera la advertencia de Node y es
    // inseguro porque afecta a todas las conexiones TLS del proceso.
    //
    // Alternativas seguras:
    // - Añadir el certificado CA autofirmado al sistema o usar
    //   `NODE_EXTRA_CA_CERTS=/path/to/ca.pem` en desarrollo.
    // - Crear un https.Agent con la CA y usar una petición dirigida desde
    //   aquí en lugar de deshabilitar la verificación global.
    //
    // No establecemos `NODE_TLS_REJECT_UNAUTHORIZED` desde el código.

    const headers: Record<string, string> = {}

    // Attach authentication if provided
    if (body.authToken) {
      if (body.authToken.startsWith('PVE:')) {
        headers['Cookie'] = `PVEAuthCookie=${body.authToken}`
        if (body.csrfToken && method !== 'GET') {
          headers['CSRFPreventionToken'] = body.csrfToken
        }
      } else {
        // Assume API token or Bearer
        headers['Authorization'] = body.authToken
      }
    }

    const fetchOptions: any = {
      method: method as any,
      headers,
    }

    // If sending data and the endpoint expects form-encoded (common in Proxmox),
    // convert plain object to URLSearchParams. We treat POST requests and when
    // body.data is a plain object (not string/Buffer).
    if (method !== 'GET' && body.data !== undefined) {
      if (body.data && typeof body.data === 'object' && !(body.data instanceof String)) {
        // Use form encoding for compatibility with Proxmox endpoints
        const params = new URLSearchParams()
        for (const key of Object.keys(body.data)) {
          const val = body.data[key]
          if (val !== undefined && val !== null) params.append(key, String(val))
        }
        fetchOptions.body = params
        fetchOptions.headers = { ...(fetchOptions.headers || {}), 'Content-Type': 'application/x-www-form-urlencoded' }
      } else {
        fetchOptions.body = body.data
      }
    }

    const res = await $fetch(`${host}/api2/json${endpoint}`, fetchOptions)

    return res
  } catch (err: any) {
    console.error('Error proxying Proxmox request:', err && err.stack ? err.stack : err)
    const status = err?.response?.status || err?.statusCode || 502
    setResponseStatus(event, status)

    // Extraer mensaje de Proxmox (errors object o statusMessage)
    const proxmoxDetails = err?.data?.errors || err?.data || err?.response?.statusMessage

    return {
      success: false,
      message: err?.message || String(err),
      details: proxmoxDetails,
    }
  }
})
