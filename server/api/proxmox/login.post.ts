import { readBody, setResponseStatus } from 'h3'
import { Agent } from 'undici'

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

    // En entorno de desarrollo, si el certificado es autofirmado, el servidor Node
    // respetará la verificación TLS. Para ignorarlo en local se puede usar
    // NODE_TLS_REJECT_UNAUTHORIZED=0 al iniciar el proceso (no recomendado en prod).

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

    const dispatcher = allowInsecure ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined

    const res = await $fetch(`${host}/api2/json/access/ticket`, {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      dispatcher,
    })

    return res
  } catch (err: unknown) {
    // Log server-side for debugging
    console.error('Error proxying to Proxmox:', err && err.stack ? err.stack : err)
    const status = err?.response?.status || err?.statusCode || 502
    setResponseStatus(event, status)
    return { success: false, message: err?.message || String(err), details: err?.data || err?.response?.statusMessage }
  }
})
