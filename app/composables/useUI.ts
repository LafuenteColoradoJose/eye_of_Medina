export const useUI = () => {
    const isTasksDrawerOpen = useState('ui-tasks-drawer-open', () => false)

    const toggleTasksDrawer = () => {
        isTasksDrawerOpen.value = !isTasksDrawerOpen.value
    }

    const openTasksDrawer = () => {
        isTasksDrawerOpen.value = true
    }

    const closeTasksDrawer = () => {
        isTasksDrawerOpen.value = false
    }

    return {
        isTasksDrawerOpen,
        toggleTasksDrawer,
        openTasksDrawer,
        closeTasksDrawer
    }
}
