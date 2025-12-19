import { readBody, setResponseStatus } from 'h3'
import { Agent } from 'undici'

type FetchErrorLike = {
  stack?: string
  message?: string
  response?: { status?: number; statusMessage?: string }
  statusCode?: number
  data?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { username: string; password: string; host?: string }
    const runtimeConfig = useRuntimeConfig()
    const defaultHost = runtimeConfig.proxmoxHost || runtimeConfig.public?.proxmoxHost
    const allowInsecure = runtimeConfig.allowInsecureTLS === true
    const host = body.host || defaultHost

    if (!host) {
      setResponseStatus(event, 400)
      return { success: false, message: 'Host de Proxmox no configurado' }
    }

    const form = new URLSearchParams()
    form.append('username', body.username)
    form.append('password', body.password)

    const dispatcher = allowInsecure ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined

    const res = await $fetch(`${host}/api2/json/access/ticket`, {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      dispatcher,
    })

    return res
  } catch (err: unknown) {
    const error = err as FetchErrorLike
    console.error('Error proxying to Proxmox:', error.stack ?? error)
    const status = error.response?.status ?? error.statusCode ?? 502
    setResponseStatus(event, status)
    return {
      success: false,
      message: error.message ?? String(err),
      details: error.data ?? error.response?.statusMessage,
    }
  }
})
