import { readBody, setResponseStatus } from 'h3'
import { Agent } from 'undici'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

type ProxmoxRequestBody = {
  endpoint: string
  method?: HttpMethod
  host?: string
  data?: Record<string, unknown> | string | URLSearchParams
  authToken?: string
  csrfToken?: string
}

type FetchErrorLike = {
  response?: { status?: number; statusMessage?: string }
  statusCode?: number
  message?: string
  data?: any
  stack?: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as ProxmoxRequestBody
    const endpoint = body.endpoint || '/'
    const method: HttpMethod = (body.method?.toUpperCase() as HttpMethod) || 'GET'
    const runtimeConfig = useRuntimeConfig()
    const defaultHost = runtimeConfig.proxmoxHost || runtimeConfig.public?.proxmoxHost
    const allowInsecure = runtimeConfig.allowInsecureTLS === true
    const host = body.host || defaultHost

    if (!host) {
      setResponseStatus(event, 400)
      return { success: false, message: 'Host de Proxmox no configurado' }
    }

    const headers: Record<string, string> = {}

    // Attach authentication if provided
    if (body.authToken) {
      if (body.authToken.startsWith('PVE:')) {
        // Encode the ticket to preserve special characters like '+'
        headers['Cookie'] = `PVEAuthCookie=${encodeURIComponent(body.authToken)}`
        if (body.csrfToken && method !== 'GET') {
          headers['CSRFPreventionToken'] = body.csrfToken
        }
      } else {
        // Assume API token or Bearer
        headers['Authorization'] = body.authToken
      }
    }

    const fetchOptions: {
      method: HttpMethod
      headers: Record<string, string>
      body?: string | URLSearchParams
    } = {
      method,
      headers,
    }

    // If sending data and the endpoint expects form-encoded (common in Proxmox),
    // convert plain object to URLSearchParams. We treat POST requests and when
    // body.data is a plain object (not string/Buffer).
    if (method !== 'GET' && body.data !== undefined) {
      if (body.data && typeof body.data === 'object' && !(body.data instanceof String) && !(body.data instanceof URLSearchParams)) {
        const params = new URLSearchParams()
        for (const [key, val] of Object.entries(body.data)) {
          if (val !== undefined && val !== null) params.append(key, String(val))
        }
        fetchOptions.body = params
        fetchOptions.headers = { ...(fetchOptions.headers || {}), 'Content-Type': 'application/x-www-form-urlencoded' }
      } else {
        fetchOptions.body = body.data as string | URLSearchParams
      }
    }

    const dispatcher = allowInsecure ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined

    const res = await $fetch(`${host}/api2/json${endpoint}`, {
      ...fetchOptions,
      dispatcher,
    })

    return res
  } catch (err: unknown) {
    const e = err as FetchErrorLike
    console.error('Error proxying Proxmox request:', e?.stack ?? e)
    const status = e?.response?.status ?? e?.statusCode ?? 502
    setResponseStatus(event, status)

    // Extraer mensaje de Proxmox (errors object o statusMessage)
    const proxmoxDetails = e?.data?.errors ?? e?.data ?? e?.response?.statusMessage

    return {
      success: false,
      message: e?.message ?? String(err),
      details: proxmoxDetails,
    }
  }
})
