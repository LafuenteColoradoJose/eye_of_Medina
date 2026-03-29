export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    // Ignorar peticiones de sourcemaps de extensiones que causan ruido o errores
    if (url.pathname.includes('/map/tiles')) return
    return
})
