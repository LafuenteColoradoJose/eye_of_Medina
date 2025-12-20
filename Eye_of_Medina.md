# Eye of Medina · Integración con Proxmox VE

Guía breve para usar la app con Proxmox VE: autenticación, permisos y las operaciones que cubre la interfaz (dashboard, pools/grupos/roles/ACL y gestión de máquinas virtuales y contenedores).

## Autenticación soportada

### API Token (recomendado)
- No caduca, puede limitarse por permisos.
- Formato del Token ID: `usuario@realm!nombre-token` (ej: `root@pam!eye-token`).
- Formato del Secret: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

Cómo crearlo en Proxmox:
1) Datacenter → Permissions → API Tokens → Add.
2) User: el usuario base (ej: `root@pam`).
3) Token ID: nombre único.
4) Privilege Separation: desmarcar si quieres heredar los permisos del usuario base.
5) Guardar el Secret (no se vuelve a mostrar).

### Usuario y contraseña
- Método clásico vía ticket de sesión (`/access/ticket`).
- Realms frecuentes: `pam` (Linux) y `pve` (Proxmox).

## Configuración rápida de la app
- URL de Proxmox (https://host:8006) accesible desde el servidor que corre la app.
- Token o credenciales con permisos suficientes para leer nodos/recursos, gestionar pools y operar VM/CT.
- Certificado: en desarrollo puedes aceptar el autofirmado; en producción usa un certificado válido o un proxy con TLS.
- CORS: las llamadas se enrutan por el backend Nuxt (`/api/proxmox/login` y `/api/proxmox/request`), por lo que no necesitas tocar CORS en Proxmox.

## Funcionalidades en la UI
- Dashboard
  - KPIs de VMs/CTs, distribución por pools, top CPU/RAM, estado de nodos y últimas tareas/eventos.
- Máquinas (VM/CT)
  - Listar/filtrar, clonar (seleccionando pool destino), renombrar/actualizar hostname, cambiar pool y eliminar.
- Pools, Grupos, Usuarios, Roles y ACL
  - Visualizar pools, roles y ACL existentes; asignar permisos y relacionar recursos con pools.
- Árbol de permisos
  - Vista consolidada para auditar roles/ACL aplicados.

## Composable `useProxmox()` (frontend)
Principales utilidades disponibles:
- `login(user, pass, host)` y `loginWithToken(tokenId, secret, host)`
- `logout()`, `isAuthenticated`, `username`
- `proxmoxRequest(path, method, body?)` (proxy seguro vía backend)
- `listNodes()`, `listPools()`, `listResources()` (VM/CT)
- `updateMachineConfig(node, vmid, payload)` para cambios como nombre/hostname o pool
- `cloneMachine(node, vmid, payload)` y `deleteMachine(node, vmid)`

## Endpoints de Proxmox que utiliza la app
- Autenticación: `/access/ticket`, `/access/users`, `/access/roles`, `/cluster/permissions`.
- Inventario: `/nodes`, `/cluster/resources` (VM/CT), `/pools`.
- Máquinas (QEMU/LXC): `/nodes/{node}/qemu|lxc`, `/nodes/{node}/{type}/{vmid}/status/current`, `/config`, `/status/{start|stop|shutdown}`, clonación y eliminación.
- Pools: `/pools/{poolid}` para asociar recursos.

## Buenas prácticas de permisos
- Para sólo visualizar: rol `PVEAuditor` o equivalentes sobre `/` y los pools necesarios.
- Para operar VM/CT desde la app: añade roles con `VM.PowerMgmt`, `VM.Config.Options`, `Pool.Allocate` y permisos sobre los pools que gestionará el usuario.
- Prefiere tokens dedicados por aplicación/usuario en lugar de compartir `root@pam`.

## Solución de problemas
- 401 Unauthorized: revisa token/secret o realm; confirma que el rol tiene permisos sobre el pool/VM/CT.
- 500 o error de conexión: valida host/puerto 8006 y que `pveproxy` está activo (`systemctl status pveproxy`).
- Certificado inválido: acepta el certificado autofirmado en desarrollo o usa TLS válido en producción.
- Operaciones sobre pools/VM fallan: comprueba que el usuario tiene permisos `Pool.Allocate` y `VM.Config.*` sobre el recurso o pool destino.

## Recursos
- Proxmox VE API: https://pve.proxmox.com/pve-docs/api-viewer/
- Tokens y permisos: https://pve.proxmox.com/pve-docs/pveum-plain.html#pveum_tokens
