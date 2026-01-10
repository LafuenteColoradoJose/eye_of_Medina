# Eye of Medina · Integración con Proxmox VE

Guía técnica para integrar la aplicación con Proxmox VE: autenticación, permisos, API y arquitectura del sistema.

---

## 📋 Índice

1. [Autenticación soportada](#autenticación-soportada)
2. [Configuración rápida](#configuración-rápida)
3. [Funcionalidades de la UI](#funcionalidades-de-la-ui)
4. [Consola VNC integrada](#consola-vnc-integrada)
5. [Composable useProxmox()](#composable-useproxmox)
6. [Endpoints de Proxmox utilizados](#endpoints-de-proxmox-utilizados)
7. [Buenas prácticas de permisos](#buenas-prácticas-de-permisos)
8. [Solución de problemas](#solución-de-problemas)
9. [Recursos](#recursos)

---

## Autenticación soportada

### API Token (recomendado)

Los tokens son la forma más segura de autenticar aplicaciones:

- **No caducan** (a diferencia de los tickets de sesión)
- **Pueden limitarse** con permisos específicos
- **Auditables** desde la interfaz de Proxmox

**Formato del Token:**
```
Token ID: usuario@realm!nombre-token
Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Cómo crear un token en Proxmox:**

1. Ve a: `Datacenter → Permissions → API Tokens → Add`
2. **User**: el usuario base (ej: `root@pam` o un usuario dedicado)
3. **Token ID**: nombre único para el token
4. **Privilege Separation**: 
   - ✅ Marcado: el token tendrá permisos separados (más seguro)
   - ❌ Desmarcado: hereda los permisos del usuario base
5. **Guarda el Secret** - no se vuelve a mostrar

### Usuario y contraseña

Método clásico vía ticket de sesión (`/access/ticket`):

- **Realms frecuentes**: `pam` (Linux) y `pve` (Proxmox interno)
- Los tickets expiran tras 2 horas de inactividad
- Requiere renovación periódica

---

## Configuración rápida

### Variables de entorno requeridas

```env
# URL base de Proxmox (con protocolo y puerto)
PROXMOX_HOST=https://proxmox.ejemplo.com:8006
NUXT_PUBLIC_PROXMOX_HOST=https://proxmox.ejemplo.com:8006

# Solo en desarrollo con certificado autofirmado
ALLOW_INSECURE_TLS=true
```

### Requisitos de red

- **Puerto 8006** accesible desde el servidor donde corre Eye of Medina
- **WebSocket** habilitado para la consola VNC (puerto 8006, mismo que la API)
- **Certificado TLS**: en desarrollo se pueden aceptar autofirmados; en producción usa certificados válidos

### Sobre CORS

Las llamadas a Proxmox se enrutan a través del backend Nuxt:
- `/api/proxmox/login` - Autenticación
- `/api/proxmox/request` - Llamadas API generales
- `/_ws/vnc` - WebSocket proxy para consola VNC

**No necesitas modificar la configuración de CORS en Proxmox.**

---

## Funcionalidades de la UI

### Dashboard

| Componente | Descripción |
|------------|-------------|
| KPIs | VMs/CTs totales, en ejecución, bridges activos |
| Gráficas | Estado de VMs, CPU por nodo, distribución por pools |
| Top Consumidores | VMs ordenadas por uso de CPU/memoria |
| Salud de nodos | Estado y métricas de cada nodo del cluster |

### Gestión de Máquinas (VM/CT)

- **Listar/Filtrar**: por nombre, ID, tipo (VM/CT), pool
- **Clonar**: duplicar VMs/CTs seleccionando pool destino
- **Editar**: cambiar nombre, hostname y pool asociado
- **Eliminar**: con confirmación de seguridad
- **Consola**: acceso VNC directo desde el navegador

### Gestión de Redes

- Interfaces por nodo: Bridges (`vmbr*`), Ethernet, Bonds, VLANs
- Estado: activo/inactivo, autostart
- Direccionamiento: IPs, gateways, máscaras
- Relaciones: puertos en bridges, esclavos en bonds

### Gestión de Identidad

- **Pools**: recursos agrupados lógicamente
- **Grupos**: conjuntos de usuarios
- **Usuarios**: cuentas de acceso
- **Roles**: conjuntos de privilegios
- **ACL**: reglas de permisos sobre rutas

---

## Consola VNC integrada

### Arquitectura

```
┌─────────────┐     WebSocket      ┌─────────────────┐     WebSocket     ┌─────────────┐
│   Browser   │ ◄─────────────────► │  Nuxt Server    │ ◄────────────────► │   Proxmox   │
│   (noVNC)   │                    │  (VNC Proxy)    │                    │   (VNC)     │
└─────────────┘                    └─────────────────┘                    └─────────────┘
```

### Flujo de conexión

1. **Usuario hace clic** en el icono de consola de una VM
2. **Cliente obtiene ticket VNC** de Proxmox vía API
3. **Conecta al proxy WebSocket** del servidor Nuxt (`/_ws/vnc`)
4. **El proxy conecta a Proxmox** usando el ticket
5. **noVNC renderiza** la salida gráfica en el navegador

### Ventajas del proxy server-side

- ✅ **Sin sesión Proxmox separada**: el usuario solo necesita estar logueado en Eye of Medina
- ✅ **Sin problemas de CORS/certificados**: el servidor maneja la conexión
- ✅ **Seguro**: las credenciales nunca se exponen al navegador

### Características de la consola

- **Teclado/ratón** completo
- **Send Ctrl-Alt-Del** con un clic
- **Escalado automático** de resolución
- **Reconexión** automática tras desconexión

---

## Composable `useProxmox()`

Utilidades disponibles en el frontend:

### Autenticación

```typescript
const { login, loginWithToken, logout, isAuthenticated, username } = useProxmox()

// Login con credenciales
await login('admin@pve', 'password', 'https://proxmox:8006')

// Login con token (recomendado)
await loginWithToken('admin@pve!my-token', 'secret-uuid', 'https://proxmox:8006')

// Cerrar sesión
logout()
```

### Operaciones API

```typescript
const { proxmoxRequest, listNodes, listPools, listVMResources } = useProxmox()

// Petición genérica
const result = await proxmoxRequest('/cluster/resources', 'GET')

// Listar nodos
const nodes = await listNodes()

// Listar VMs/CTs
const vms = await listVMResources()
```

### Gestión de VMs

```typescript
const { getVncTicket, updateMachineConfig, cloneMachine, deleteMachine } = useProxmox()

// Obtener ticket VNC
const ticket = await getVncTicket('pve1', 'qemu', '100')

// Actualizar configuración
await updateMachineConfig('pve1', '100', { name: 'nuevo-nombre' })

// Clonar VM
await cloneMachine('pve1', '100', { newid: 200, pool: 'produccion' })

// Eliminar VM
await deleteMachine('pve1', '100')
```

---

## Endpoints de Proxmox utilizados

### Autenticación y permisos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/access/ticket` | POST | Obtener ticket de sesión |
| `/access/users` | GET | Listar usuarios |
| `/access/roles` | GET | Listar roles |
| `/access/acl` | GET | Listar ACLs |
| `/cluster/permissions` | GET | Permisos del usuario actual |

### Inventario

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes` | GET | Listar nodos del cluster |
| `/cluster/resources` | GET | Recursos (VMs, CTs, storage) |
| `/pools` | GET | Listar pools |
| `/pools/{poolid}` | GET/PUT | Gestionar pool específico |

### Máquinas virtuales/contenedores

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes/{node}/qemu` | GET | Listar VMs de un nodo |
| `/nodes/{node}/lxc` | GET | Listar CTs de un nodo |
| `/nodes/{node}/{type}/{vmid}/config` | GET/PUT | Configuración de VM/CT |
| `/nodes/{node}/{type}/{vmid}/status/{action}` | POST | Start/Stop/Shutdown |
| `/nodes/{node}/{type}/{vmid}/clone` | POST | Clonar VM/CT |
| `/nodes/{node}/{type}/{vmid}` | DELETE | Eliminar VM/CT |
| `/nodes/{node}/{type}/{vmid}/vncproxy` | POST | Obtener ticket VNC |
| `/nodes/{node}/{type}/{vmid}/vncwebsocket` | WebSocket | Conexión VNC |

### Redes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes/{node}/network` | GET | Interfaces de red del nodo |

---

## Buenas prácticas de permisos

### Solo lectura (monitoreo)

```
Rol: PVEAuditor
Ruta: /
Propagar: Sí
```

### Operación de VMs/CTs

```
Roles necesarios:
- VM.PowerMgmt (start/stop/shutdown)
- VM.Config.Options (cambiar nombre, opciones)
- Pool.Allocate (cambiar pool)

Rutas: /pool/{pool-name} para cada pool a gestionar
```

### Consola VNC

```
Roles necesarios:
- VM.Console (acceso a consola)
- VM.Audit (ver estado)

Ruta: /pool/{pool-name} o /vms/{vmid}
```

### Recomendaciones

1. **Prefiere tokens dedicados** por aplicación/usuario
2. **Evita usar `root@pam`** en producción
3. **Habilita Privilege Separation** en tokens para limitar alcance
4. **Documenta los permisos** otorgados para auditoría

---

## Solución de problemas

### Error 401 Unauthorized

- ✅ Verifica que el token/secret sean correctos
- ✅ Comprueba el realm (pam, pve, ldap, etc.)
- ✅ Confirma que el rol tiene permisos sobre el recurso

### Error de certificado

- ✅ En desarrollo: configura `ALLOW_INSECURE_TLS=true`
- ✅ En producción: usa certificados válidos (Let's Encrypt, etc.)

### No aparecen VMs/datos

- ✅ Verifica conectividad al puerto 8006
- ✅ Comprueba que `pveproxy` está activo: `systemctl status pveproxy`
- ✅ Revisa permisos del usuario/token sobre los recursos

### Consola VNC no conecta

- ✅ Verifica que la VM esté encendida
- ✅ Comprueba que el usuario tiene permiso `VM.Console`
- ✅ Revisa los logs del servidor Nuxt para errores de proxy

### Operaciones sobre pools fallan

- ✅ Confirma permiso `Pool.Allocate` sobre el pool destino
- ✅ Verifica `VM.Config.*` para cambiar configuración

---

## Recursos

- **Proxmox VE API Reference**: https://pve.proxmox.com/pve-docs/api-viewer/
- **Gestión de tokens**: https://pve.proxmox.com/pve-docs/pveum-plain.html#pveum_tokens
- **Roles y permisos**: https://pve.proxmox.com/wiki/User_Management
- **noVNC**: https://novnc.com/

---

<div align="center">

**¿Encontraste un problema? Abre un issue en el repositorio.**

</div>
