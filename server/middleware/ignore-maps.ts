export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    // Ignorar peticiones de sourcemaps de extensiones que causan ruido o errores
    if (url.pathname.endsWith('.map') || url.pathname.includes('installHook.js')) {
        event.node.res.statusCode = 404
        event.node.res.end()
        return
    }
})
