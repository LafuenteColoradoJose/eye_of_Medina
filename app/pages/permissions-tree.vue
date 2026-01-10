<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="p-4 md:p-6 max-w-full overflow-x-hidden">
    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
      <div class="section-card p-4 rounded shadow w-full overflow-hidden">
        <h1 class="text-xl font-bold mb-3">Árbol por Recursos</h1>
        <p class="text-sm muted mb-4">Explora recursos (pools, VMs, nodes) y ve qué sujetos tienen roles asignados.</p>
        <div v-if="loading" class="text-sm muted">Cargando...</div>
        <PermissionTree v-else :nodes="resourcesTree" is-root />
      </div>

      <div class="section-card p-4 rounded shadow w-full overflow-hidden">
        <h1 class="text-xl font-bold mb-3">Árbol por Sujetos</h1>
        <p class="text-sm muted mb-4">Explora usuarios y grupos y ve a qué recursos están asignados.</p>
        <div v-if="loading" class="text-sm muted">Cargando...</div>
        <PermissionTree v-else :nodes="subjectsTree" is-root />
      </div>

      <div class="col-span-1 md:col-span-2 mt-2 flex flex-col sm:flex-row gap-2">
        <button @click="reloadAll" class="px-3 py-2 rounded btn-primary w-full sm:w-auto">Refrescar</button>
        <button @click="showRaw" class="px-3 py-2 rounded btn-muted w-full sm:w-auto">Ver raw ACLs</button>
      </div>

      <pre v-if="raw"
        class="col-span-1 md:col-span-2 mt-2 code-surface p-2 rounded max-h-64 overflow-auto text-xs whitespace-pre-wrap wrap-break-word">{{ JSON.stringify(acls, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

type SubjectType = 'user' | 'group' | 'pool' | 'vm' | 'other'

interface ACL {
  path?: string
  roleid?: string
  role?: string
  ugid?: string
  userid?: string
  group?: string
  pool?: string
  vmid?: string
  type?: SubjectType
}

interface TreeNode {
  id: string
  label: string
  meta?: string
  children: TreeNode[]
  __roleMap?: Map<string, TreeNode>
}

const router = useRouter()
// `PermissionTree` está en `app/components` y Nuxt importa componentes automáticamente.
// Usamos `proxmoxRequest` para peticiones que no tienen helper directo.
const { listACLs, listRoles, listGroups, proxmoxRequest, restoreSession, isAuthenticated } = useProxmox()

const loading = ref<boolean>(true)
const acls = ref<ACL[]>([])
const roles = ref<Record<string, unknown>[]>([])
const users = ref<Record<string, unknown>[]>([])
const groups = ref<Record<string, unknown>[]>([])
const pools = ref<Record<string, unknown>[]>([])
const vms = ref<Record<string, unknown>[]>([])

const raw = ref(false)

const resourcesTree = ref<TreeNode[]>([])
const subjectsTree = ref<TreeNode[]>([])

onMounted(async () => {
  restoreSession()
  if (isAuthenticated.value && import.meta.client) await loadAll()
})

watch(isAuthenticated, async (val) => {
  if (val && acls.value.length === 0 && import.meta.client) await loadAll()
})

const reloadAll = async () => await loadAll()
const showRaw = () => (raw.value = !raw.value)

function ensureNode<T>(map: Map<string, T>, key: string, nodeFactory: () => T): T {
  if (!map.has(key)) {
    map.set(key, nodeFactory())
  }
  return map.get(key) as T
}

async function loadAll() {
  loading.value = true
  const [rACLs, rRoles, rUsers, rGroups, rPools, rVMs] = await Promise.all([
    listACLs(),
    listRoles(),
    proxmoxRequest('/access/users', 'GET'),
    listGroups(),
    proxmoxRequest('/pools', 'GET'),
    proxmoxRequest('/cluster/resources?type=vm', 'GET'),
  ])

  acls.value = rACLs.success ? (rACLs.data as ACL[]) || [] : []
  roles.value = rRoles.success ? (rRoles.data as Record<string, unknown>[]) || [] : []
  users.value = rUsers.success ? (rUsers.data as Record<string, unknown>[]) || [] : []
  groups.value = rGroups.success ? (rGroups.data as Record<string, unknown>[]) || [] : []
  pools.value = rPools.success ? (rPools.data as Record<string, unknown>[]) || [] : []
  vms.value = rVMs.success ? (rVMs.data as Record<string, unknown>[]) || [] : []

  buildResourceTree()
  buildSubjectsTree()

  loading.value = false
}

function buildResourceTree() {
  // resource -> role -> [subjects]
  const resMap = new Map<string, TreeNode>()

  acls.value.forEach((acl) => {
    const path = acl.path || '/'
    const role = acl.roleid || acl.role || 'unknown'
    const subject = acl.ugid || acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType: SubjectType = acl.type || (acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other')

    const resNode = ensureNode(resMap, path, () => ({ id: 'res:' + path, label: path, meta: '', children: [] }))
    resNode.__roleMap = resNode.__roleMap || new Map<string, TreeNode>()
    const roleKey = path + '::' + role
    const roleNode = ensureNode(resNode.__roleMap, roleKey, () => ({ id: 'role:' + roleKey, label: role, meta: '', children: [] }))

    // add subject under role
    if (subject) {
      const subjLabel = `${subject} (${subjectType})`
      roleNode.children.push({ id: 'subj:' + roleKey + ':' + subjLabel, label: subjLabel, meta: subjectType, children: [] })
    }

    // ensure the role node is attached to resource node's children only once
    if (!resNode.children.includes(roleNode)) resNode.children.push(roleNode)
  })

  // convert map to array
  resourcesTree.value = Array.from(resMap.values()).map((n) => {
    if (n.__roleMap) delete n.__roleMap
    return n
  })
}

function buildSubjectsTree() {
  // subject -> role -> [resources]
  const subMap = new Map<string, TreeNode>()

  acls.value.forEach((acl) => {
    const path = acl.path || '/'
    const role = acl.roleid || acl.role || 'unknown'
    const subject = acl.ugid || acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType: SubjectType = acl.type || (acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other')
    const subjLabel = subject || 'unknown'
    const subjKey = (subjectType || 'other') + '::' + (subjLabel || 'unknown')

    const subjNode = ensureNode(subMap, subjKey, () => ({ id: 'sub:' + subjKey, label: `${subjLabel} (${subjectType})`, children: [] }))
    subjNode.__roleMap = subjNode.__roleMap || new Map<string, TreeNode>()

    const roleKey = subjKey + '::' + role
    const roleNode = ensureNode(subjNode.__roleMap, roleKey, () => ({ id: 'srole:' + roleKey, label: role, children: [] }))

    roleNode.children.push({ id: 'r:' + roleKey + ':' + path, label: path, children: [] })

    if (!subjNode.children.includes(roleNode)) subjNode.children.push(roleNode)
  })

  subjectsTree.value = Array.from(subMap.values()).map((n) => {
    if (n.__roleMap) delete n.__roleMap
    return n
  })
}
</script>
