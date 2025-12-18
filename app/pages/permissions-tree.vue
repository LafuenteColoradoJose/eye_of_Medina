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
        <PermissionTree v-else :nodes="resourcesTree" />
      </div>

      <div class="section-card p-4 rounded shadow w-full overflow-hidden">
        <h1 class="text-xl font-bold mb-3">Árbol por Sujetos</h1>
        <p class="text-sm muted mb-4">Explora usuarios y grupos y ve a qué recursos están asignados.</p>
        <div v-if="loading" class="text-sm muted">Cargando...</div>
        <PermissionTree v-else :nodes="subjectsTree" />
      </div>

      <div class="col-span-1 md:col-span-2 mt-2 flex flex-col sm:flex-row gap-2">
        <button @click="reloadAll" class="px-3 py-2 rounded btn-primary w-full sm:w-auto">Refrescar</button>
        <button @click="showRaw" class="px-3 py-2 rounded btn-muted w-full sm:w-auto">Ver raw ACLs</button>
      </div>

      <pre
        v-if="raw"
        class="col-span-1 md:col-span-2 mt-2 code-surface p-2 rounded max-h-64 overflow-auto text-xs whitespace-pre-wrap wrap-break-word"
      >{{ JSON.stringify(acls, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
const router = useRouter()
// `PermissionTree` está en `app/components` y Nuxt importa componentes automáticamente.
// Usamos `proxmoxRequest` para peticiones que no tienen helper directo.
const { listACLs, listRoles, listGroups, proxmoxRequest, restoreSession, isAuthenticated } = useProxmox()

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
  if (isAuthenticated.value) await loadAll()
})

watch(isAuthenticated, async (val) => {
  if (val && acls.value.length === 0) await loadAll()
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
    const role = acl.roleid || acl.role || 'unknown'
    const subject = acl.ugid || acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType = acl.type || (acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other')

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
    const role = acl.roleid || acl.role || 'unknown'
    const subject = acl.ugid || acl.userid || acl.group || acl.pool || acl.vmid || null
    const subjectType = acl.type || (acl.userid ? 'user' : acl.group ? 'group' : acl.pool ? 'pool' : acl.vmid ? 'vm' : 'other')
    const subjLabel = subject || 'unknown'
    const subjKey = (subjectType || 'other') + '::' + (subjLabel || 'unknown')

    const subjNode = ensureNode(subMap, subjKey, () => ({ id: 'sub:' + subjKey, label: `${subjLabel} (${subjectType})`, children: [] }))

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
