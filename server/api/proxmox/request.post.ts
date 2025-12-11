import { readBody, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { endpoint: string; method?: string; host?: string; data?: any }
    const endpoint = body.endpoint || '/'
    const method = (body.method || 'GET').toUpperCase()
    const host = body.host || 'https://192.168.8.240:8006'

    // Allow insecure TLS in development only
    if (process.env.NODE_ENV !== 'production' && host.startsWith('https')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    const res = await $fetch(`${host}/api2/json${endpoint}`, {
      method: method as any,
      body: body.data,
    })

    return res
  } catch (err: any) {
    console.error('Error proxying Proxmox request:', err && err.stack ? err.stack : err)
    setResponseStatus(event, 502)
    return { success: false, message: err?.message || String(err) }
  }
})
