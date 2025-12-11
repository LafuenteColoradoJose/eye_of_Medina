import { readBody, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { username: string; password: string; host?: string }
    const host = body.host || 'https://192.168.8.240:8006'

    const form = new URLSearchParams()
    form.append('username', body.username)
    form.append('password', body.password)

    // En entorno de desarrollo, si el certificado es autofirmado, el servidor Node
    // respetará la verificación TLS. Para ignorarlo en local se puede usar
    // NODE_TLS_REJECT_UNAUTHORIZED=0 al iniciar el proceso (no recomendado en prod).

    // Si estamos en desarrollo y el host usa HTTPS con certificado autofirmado,
    // permitir conexiones inseguras temporalmente para facilitar pruebas locales.
    // ADVERTENCIA: esto solo debe usarse en desarrollo.
    if (process.env.NODE_ENV !== 'production' && host.startsWith('https')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    const res = await $fetch(`${host}/api2/json/access/ticket`, {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    return res
  } catch (err: any) {
    // Log server-side for debugging
    console.error('Error proxying to Proxmox:', err && err.stack ? err.stack : err)
    // Return a controlled error response with 502 Bad Gateway
    setResponseStatus(event, 502)
    return { success: false, message: err?.message || String(err) }
  }
})
