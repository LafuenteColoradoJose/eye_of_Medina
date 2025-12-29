export default defineNuxtPlugin(() => {
    const { restoreSession } = useProxmox()
    restoreSession()
})
