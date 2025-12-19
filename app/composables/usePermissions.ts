type PermissionMap = Record<string, number>

type PermissionResult = {
  success: boolean
  permissions: PermissionMap
}

export const usePermissions = () => {
  const { proxmoxRequest } = useProxmox()

  const fetchPermissions = async (path = '/'): Promise<PermissionResult> => {
    try {
      const res = await proxmoxRequest(`/access/permissions?path=${encodeURIComponent(path)}`, 'GET')
      if (res && res.success) {
        return { success: true, permissions: (res.data as PermissionMap) || {} }
      }
      return { success: false, permissions: {} }
    } catch (error) {
      console.error('Error fetching permissions', error)
      return { success: false, permissions: {} }
    }
  }

  const has = (perms: PermissionMap, key: string) => Boolean(perms?.[key])

  return { fetchPermissions, has }
}
