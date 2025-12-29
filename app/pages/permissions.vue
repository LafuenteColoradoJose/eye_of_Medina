<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Asignación de Permisos (ACL)</h1>

    <div v-if="!isAuthenticated" class="alert p-4 mb-4">
      <p class="font-bold">No estás autenticado</p>
      <p>Por favor, inicia sesión primero.</p>
      <button @click="router.push('/')" class="mt-2 px-4 py-2 rounded-md btn-primary">Ir al Login</button>
    </div>

    <div v-else>
      <section class="mb-6 section-card p-4 rounded shadow">
        <h2 class="font-bold mb-2">Crear permiso</h2>
        <form @submit.prevent="handleAssign" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm">Path (ej. /vms/100 o /pool/my-pool)</label>
            <input v-model="form.path" class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm">Role</label>
            <select v-model="form.role" class="w-full p-2 border rounded">
              <option v-for="r in roles" :key="r.roleid" :value="r.roleid">{{ r.roleid }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm">Tipo de sujeto</label>
            <select v-model="form.subjectType" class="w-full p-2 border rounded">
              <option value="user">Usuario</option>
              <option value="group">Grupo</option>
              <option value="pool">Pool</option>
              <option value="vm">VM/Resource</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">ID sujeto (userid, groupid, poolid o vmid)</label>
            <input v-model="form.subjectId" class="w-full p-2 border rounded" />
          </div>

          <div class="col-span-1 md:col-span-2 flex gap-2 justify-end">
            <button type="submit" :disabled="loading" class="px-4 py-2 rounded btn-positive">Asignar</button>
          </div>
        </form>
      </section>

      <section class="section-card p-4 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold">ACLs actuales</h2>
          <div class="flex gap-2">
            <button @click="loadACLs" class="px-3 py-2 rounded btn-primary">Refrescar</button>
          </div>
        </div>

        <div v-if="acls.length === 0" class="text-sm muted">No hay entradas ACL.</div>

        <div v-else>
          <!-- Vista en tarjetas para móvil -->
          <div class="md:hidden space-y-3">
            <div v-for="a in acls" :key="a.path + a.roleid + a.ugid" class="p-3 rounded border section-card">
              <div class="text-sm"><span class="font-semibold">Path:</span> {{ a.path }}</div>
              <div class="text-sm"><span class="font-semibold">Role:</span> {{ a.roleid || a.role || '-' }}</div>
              <div class="text-sm"><span class="font-semibold">Type:</span> {{ a.type || (a.ugid?.includes('@') ? 'user'
                : (a.ugid ? 'group' : 'other')) }}</div>
              <div class="text-sm"><span class="font-semibold">ID:</span> {{ a.ugid || '-' }}</div>
              <div class="mt-2 flex justify-end">
                <button @click="removeACL(a)" class="px-3 py-1 rounded btn-danger">Eliminar</button>
              </div>
            </div>
          </div>

          <!-- Tabla para escritorio -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm min-w-full table-fixed">
              <thead>
                <tr class="text-left border-b">
                  <th class="p-2">Path</th>
                  <th class="p-2">Role</th>
                  <th class="p-2">Type</th>
                  <th class="p-2">ID</th>
                  <th class="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in acls" :key="a.path + a.roleid + a.ugid" class="border-b">
                  <td class="p-2 wrap-break-word">{{ a.path }}</td>
                  <td class="p-2 wrap-break-word">{{ a.roleid || a.role || '-' }}</td>
                  <td class="p-2 wrap-break-word">{{ a.type || (a.ugid?.includes('@') ? 'user' : (a.ugid ? 'group' :
                    'other')) }}</td>
                  <td class="p-2 wrap-break-word">{{ a.ugid || '-' }}</td>
                  <td class="p-2">
                    <button @click="removeACL(a)" class="px-2 py-1 rounded btn-danger">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Permisos' })
import { ref, onMounted, watch } from 'vue'
const router = useRouter()
const { listRoles, listACLs, createACL, deleteACL, restoreSession, isAuthenticated } = useProxmox()

type SubjectType = 'user' | 'group' | 'pool' | 'vm' | 'other'

interface Role { roleid: string }

interface ACL {
  path: string
  roleid?: string
  role?: string
  type?: SubjectType
  ugid?: string
  userid?: string
  group?: string
}

interface FormState {
  path: string
  role: string
  subjectType: SubjectType
  subjectId: string
}

const loading = ref<boolean>(false)
const roles = ref<Role[]>([])
const acls = ref<ACL[]>([])

const form = ref<FormState>({ path: '', role: '', subjectType: 'user', subjectId: '' })

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) loadRolesAndACLs()
})

watch(isAuthenticated, (val) => {
  if (val && acls.value.length === 0) loadRolesAndACLs()
})

const loadRolesAndACLs = async () => {
  loading.value = true
  const r = await listRoles()
  if (r.success) roles.value = (r.data as Role[]) || []
  const a = await listACLs()
  if (a.success) acls.value = (a.data as ACL[]) || []
  loading.value = false
}

const loadACLs = async () => {
  loading.value = true
  const res = await listACLs()
  loading.value = false
  if (res.success) acls.value = (res.data as ACL[]) || []
}

const handleAssign = async () => {
  if (!form.value.path || !form.value.role || !form.value.subjectId) return alert('Completa los campos')
  const trimmedPath = form.value.path.trim()
  let path = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`

  // Si el usuario escribe "pool1", normalizamos a "/pool/pool1"
  const poolMatch = path.match(/^\/pool([^/]+)$/)
  if (poolMatch) path = `/pool/${poolMatch[1]}`

  const subject = form.value.subjectId.trim()
  if (!subject) return alert('El ID del sujeto está vacío')

  const opts: { propagate: number; users?: string; groups?: string } = { propagate: 1 }
  if (form.value.subjectType === 'user') opts.users = subject
  if (form.value.subjectType === 'group') opts.groups = subject

  loading.value = true
  const res = await createACL(path, form.value.role, opts)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || '') + (res.details ? ` | Detalles: ${JSON.stringify(res.details)}` : ''))
  await loadACLs()
}

const removeACL = async (a: ACL) => {
  const role = a.roleid || a.role
  if (!role) return alert('No se pudo determinar el rol de la ACL a eliminar')

  const isUser = a.type === 'user' || (a.ugid && a.ugid.includes('@'))
  const opts: { users?: string; groups?: string } = {}
  if (isUser && a.ugid) opts.users = a.ugid
  else if (!isUser && (a.ugid || a.group)) opts.groups = a.ugid || a.group

  if (!confirm(`Eliminar ACL en ${a.path} con rol ${role}?`)) return
  loading.value = true
  const res = await deleteACL(a.path, role, opts)
  loading.value = false
  if (res.success === false) return alert('Error: ' + (res.message || JSON.stringify(res)))
  await loadACLs()
}
</script>
