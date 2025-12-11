<template>
  <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white p-4 rounded shadow">
      <h1 class="text-xl font-bold mb-3">Árbol por Recursos</h1>
      <p class="text-sm text-gray-500 mb-4">Explora recursos (pools, VMs, nodes) y ve qué sujetos tienen roles asignados.</p>
      <div v-if="loading" class="text-sm text-gray-500">Cargando...</div>
      <PermissionTree v-else :nodes="resourcesTree" />
    </div>

    <div class="bg-white p-4 rounded shadow">
      <h1 class="text-xl font-bold mb-3">Árbol por Sujetos</h1>
      <p class="text-sm text-gray-500 mb-4">Explora usuarios y grupos y ve a qué recursos están asignados.</p>
      <div v-if="loading" class="text-sm text-gray-500">Cargando...</div>
      <PermissionTree v-else :nodes="subjectsTree" />
    </div>

    <div class="col-span-2 mt-2 flex gap-2">
      <button @click="reloadAll" class="bg-blue-600 text-white px-3 py-2 rounded">Refrescar</button>
      <button @click="showRaw" class="bg-gray-200 px-3 py-2 rounded">Ver raw ACLs</button>
    </div>

    <pre v-if="raw" class="col-span-2 mt-2 bg-black text-white p-2 rounded max-h-64 overflow-auto text-xs">{{ JSON.stringify(acls, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// `PermissionTree` está en `app/components` y Nuxt importa componentes automáticamente.
// Usamos `proxmoxRequest` para peticiones que no tienen helper directo.
const { listACLs, listRoles, listGroups, proxmoxRequest, restoreSession } = useProxmox()

const loading = ref(true)
const acls = ref<any[]>([])
const roles = ref<any[]>([])
const users = ref<any[]>([])
const groups = ref<any[]>([])
const pools = ref<any[]>([])
const vms = ref<any[]>([])

const raw = ref(false)

const resourcesTree = ref<any[]>([])
const subjectsTree = ref<any[]>([])

onMounted(async () => {
  restoreSession()
  await loadAll()
})

const reloadAll = async () => await loadAll()
const showRaw = () => (raw.value = !raw.value)

function addChild(parent: any, child: any) {
  parent.children = parent.children || []
  parent.children.push(child)
}

function ensureNode(map: Map<string, any>, key: string, nodeFactory: () => any) {
  if (!map.has(key)) {
    map.set(key, nodeFactory())
  }
  return map.get(key)
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

  acls.value = rACLs.success ? rACLs.data || [] : []
  roles.value = rRoles.success ? rRoles.data || [] : []
  users.value = rUsers.success ? rUsers.data || [] : []
  groups.value = rGroups.success ? rGroups.data || [] : []
  pools.value = rPools.success ? rPools.data || [] : []
  vms.value = rVMs.success ? rVMs.data || [] : []

  buildResourceTree()
  buildSubjectsTree()

  loading.value = false
}

function buildResourceTree() {
  // resource -> role -> [subjects]
  const resMap = new Map<string, any>()

  acls.value.forEach((acl: any) => {
    const path = acl.path || '/'
    const role = acl.role || 'unknown'
    const subject = acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType = acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other'

    const resNode = ensureNode(resMap, path, () => ({ id: 'res:' + path, label: path, meta: '', children: [] }))
    const roleKey = path + '::' + role
    const roleNode = ensureNode(new Map(resNode.__roleMap = resNode.__roleMap || new Map()), roleKey, () => ({ id: 'role:' + roleKey, label: role, meta: '', children: [] }))

    // add subject under role
    if (subject) {
      const subjLabel = `${subject} (${subjectType})`
      roleNode.children.push({ id: 'subj:' + roleKey + ':' + subjLabel, label: subjLabel, meta: subjectType })
    }

    // ensure the role node is attached to resource node's children only once
    if (!resNode.children.includes(roleNode)) resNode.children.push(roleNode)
  })

  // convert map to array
  resourcesTree.value = Array.from(resMap.values()).map((n: any) => {
    // clean internal maps
    if (n.__roleMap) delete n.__roleMap
    return n
  })
}

function buildSubjectsTree() {
  // subject -> role -> [resources]
  const subMap = new Map<string, any>()

  acls.value.forEach((acl: any) => {
    const path = acl.path || '/'
    const role = acl.role || 'unknown'
    const subject = acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType = acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other'
    const subjKey = (subjectType || 'other') + '::' + (subject || 'unknown')

    const subjNode = ensureNode(subMap, subjKey, () => ({ id: 'sub:' + subjKey, label: `${subject || 'unknown'} (${subjectType})`, children: [] }))

    const roleKey = subjKey + '::' + role
    const roleNode = ensureNode(new Map(subjNode.__roleMap = subjNode.__roleMap || new Map()), roleKey, () => ({ id: 'srole:' + roleKey, label: role, children: [] }))

    roleNode.children.push({ id: 'r:' + roleKey + ':' + path, label: path })

    if (!subjNode.children.includes(roleNode)) subjNode.children.push(roleNode)
  })

  subjectsTree.value = Array.from(subMap.values()).map((n: any) => {
    if (n.__roleMap) delete n.__roleMap
    return n
  })
}
</script>
