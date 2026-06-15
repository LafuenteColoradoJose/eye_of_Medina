# Eye of Medina · Integración con Proxmox VE

Guía técnica para la integración de la aplicación con Proxmox VE: autenticación, permisos, API y arquitectura del sistema.

---

## 📋 Tabla de Contenidos

1. [Autenticación Soportada](#autenticación-soportada)
2. [Configuración Rápida](#configuración-rápida)
3. [Características de la Interfaz](#características-de-la-interfaz)
4. [Consola VNC Integrada](#consola-vnc-integrada)
5. [Composable useProxmox()](#composable-useproxmox)
6. [Endpoints de Proxmox Utilizados](#endpoints-de-proxmox-utilizados)
7. [Mejores Prácticas de Permisos](#mejores-prácticas-de-permisos)
8. [Arquitectura de Pruebas](#arquitectura-de-pruebas)
9. [Resolución de Problemas](#resolución-de-problemas)
10. [Recursos](#recursos)

---

## Autenticación Soportada

### API Token (Recomendado)

Los tokens son la forma más segura de autenticar aplicaciones:

- **No expiran** (a diferencia de los tickets de sesión).
- **Se pueden limitar (scope)** con permisos específicos.
- **Son auditables** desde la interfaz de Proxmox.

**Formato del Token:**
```
Token ID: usuario@realm!nombre-token
Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Cómo crear un token en Proxmox:**

1. Ve a: `Datacenter → Permissions → API Tokens → Add`.
2. **User**: El usuario base (por ejemplo, `root@pam` o un usuario dedicado).
3. **Token ID**: Nombre único para el token.
4. **Privilege Separation**: 
   - ✅ Activado (Checked): El token tendrá permisos separados (más seguro).
   - ❌ Desactivado (Unchecked): Hereda los permisos del usuario base.
5. **Guarda el Secret** - no se volverá a mostrar.

### Nombre de Usuario y Contraseña

Método clásico a través del ticket de sesión (`/access/ticket`):

- **Realms Comunes**: `pam` (Linux) y `pve` (Proxmox Interno).
- Los tickets caducan después de 2 horas de inactividad.
- Requiere renovación periódica.

---

## Configuración Rápida

### Variables de Entorno Requeridas

```env
# URL base de Proxmox (con protocolo y puerto)
NUXT_PUBLIC_PROXMOX_HOST=https://proxmox.example.com:8006

# Solo para desarrollo con certificado autofirmado
ALLOW_INSECURE_TLS=true
```

### Requisitos de Red

- **Puerto 8006** accesible desde el servidor que ejecuta Eye of Medina.
- **WebSocket** habilitado para la consola VNC (mismo puerto 8006 de la API).
- **Certificado TLS**: En desarrollo se pueden aceptar certificados autofirmados; en producción, utiliza certificados válidos.

### Sobre CORS

Las llamadas a Proxmox se enrutan a través del backend de Nuxt:
- `/api/proxmox/login` - Autenticación
- `/api/proxmox/request` - Llamadas generales a la API
- `/_ws/vnc` - Proxy WebSocket para la consola VNC

**NO necesitas modificar la configuración de CORS en Proxmox.**

---

## Características de la Interfaz

### Panel de Control 2.2
- **Diseño de Alta Densidad**: Rejilla responsiva de 4 columnas (`Estado`, `Almacenamiento`, `CPU`, `Red`) para pantallas grandes.
- **Monitoreo en Tiempo Real**:
  - **Red**: Tráfico agregado del cluster (Mbps) calculado a partir de las diferencias de los nodos.
  - **Almacenamiento**: Uso de capacidad de los discos locales por nodo (vista Equalizer).
  - **CPU**: Gráfico de carga de CPU del cluster en tiempo real.
- **Top Consumidores**: Análisis detallado del consumo de recursos (CPU/RAM).
- **Cajón de Tareas (Tasks Drawer)**: Panel deslizable con logs agregados de las operaciones del cluster.
- **Salud del Nodo**: Vista en rejilla de todos los nodos con indicadores de estado.

### Gestión de Almacenamiento
- **Explorador Unificado**: Visualiza archivos (ISOs, Plantillas, Respaldos, Discos de VM) en todos los nodos/almacenamientos.
- **Descarga Directa**: Función para descargar archivos (por ejemplo, ISOs) desde una URL directamente al almacenamiento del nodo de Proxmox.
- **Análisis de Capacidad**: Visualización específica del uso del almacenamiento.

### Gestión de Máquinas (VM/CT)
- **Listar/Filtrar**: Por nombre, ID, tipo (VM/CT), pool.
- **Clonar**: Duplica VMs/CTs seleccionando el pool de destino.
- **Editar**: Cambia nombre, nombre de host y pool asociado.
- **Eliminar**: Con confirmación de seguridad.
- **Consola**: Acceso directo VNC desde el navegador.

### Gestión de Red
- **Direccionamiento Inteligente**: Nuevo panel centrado en "Zonas" (L3) en lugar de cables en bruto.
- **Topología Visual**: Visualización jerárquica `[Físico] -> [Bond/Bridge] -> [IP]`.
- **Mejoras de UX**: "Clic para copiar" para IPs, distinción visual entre v4/v6.

### Mapa de Calor de Recursos y Capacidad
- **Capacidad en Tiempo Real**: Visualiza el uso de CPU/RAM del Host.
- **Arquitectura con Caída Inteligente (Smart Fallback)**: Si el usuario carece de permisos de `Sys.Audit` (viendo 0% de uso del host), el sistema **agrega automáticamente** la CPU/RAM de todas las VMs visibles para calcular una "Carga Virtual", asegurando que siempre se muestren datos útiles.
- **Mapa de Calor Granular**: Rejilla interactiva que muestra la carga de VMs individuales (CPU) con alertas codificadas por colores (Verde -> Rojo).

### Topología de Red
- **Mapa Interactivo Vue Flow**: Gráfico visual avanzado `[Nodo Físico] -> [Bridge/Bond] -> [CT/VM]`.
- **Minimapa y Zoom**: Control visual para explorar redes grandes de forma fluida.
- **Nodos Colapsables (Grid Layout)**: Agrupación inteligente de VMs por puente con un layout en cuadrícula para evitar la saturación visual.
- **Filtros en Tiempo Real**: Búsqueda por nombre/ID y ocultación de máquinas apagadas directamente en el lienzo.
- **Indicadores Visuales de Estado**: Semáforos y cables animados que muestran al instante la actividad de red en los puentes sin necesidad de expandirlos.

### Gestión de Identidad
- **Pools**: Recursos agrupados lógicamente.
- **Grupos**: Conjuntos de usuarios.
- **Usuarios**: Cuentas de acceso.
- **Roles**: Conjuntos de permisos.
- **ACL**: Reglas de control de acceso en rutas específicas.

---

## Consola VNC Integrada

### Arquitectura

```
┌─────────────┐     WebSocket      ┌─────────────────┐     WebSocket     ┌─────────────┐
│  Navegador  │ ◄─────────────────► │  Servidor Nuxt  │ ◄────────────────► │   Proxmox   │
│   (noVNC)   │                    │  (Proxy VNC)    │                    │   (VNC)     │
└─────────────┘                    └─────────────────┘                    └─────────────┘
```

### Flujo de Conexión

1. **El usuario hace clic** en el icono de consola de una VM.
2. **El cliente obtiene un ticket VNC** de Proxmox a través de la API.
3. **Se conecta al proxy WebSocket** en el servidor Nuxt (`/_ws/vnc`).
4. **El proxy se conecta a Proxmox** utilizando el ticket.
5. **noVNC renderiza** la salida gráfica en el navegador.

### Ventajas del Proxy del Lado del Servidor

- ✅ **Sin sesión independiente de Proxmox**: El usuario solo necesita iniciar sesión en Eye of Medina.
- ✅ **Sin problemas de CORS/Certificados**: El servidor maneja la conexión.
- ✅ **Seguro**: Las credenciales nunca se exponen al navegador.

### Características de la Consola

- Soporte completo para **Teclado/Mouse**.
- **Enviar Ctrl-Alt-Del** con un solo clic.
- **Escalado automático** de la resolución.
- **Reconexión automática** tras una desconexión.

---

## Composable `useProxmox()`

Utilidades disponibles en el frontend:

### Autenticación

```typescript
const { login, loginWithToken, logout, isAuthenticated, username } = useProxmox()

// Login con credenciales
await login('admin@pve', 'password', 'https://proxmox:8006')

// Login con token (recomendado)
await loginWithToken('admin@pve!mi-token', 'secret-uuid', 'https://proxmox:8006')

// Cerrar sesión
logout()
```

### Operaciones de la API

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

// Obtener ticket de VNC
const ticket = await getVncTicket('pve1', 'qemu', '100')

// Actualizar configuración
await updateMachineConfig('pve1', '100', { name: 'nuevo-nombre' })

// Clonar VM
await cloneMachine('pve1', '100', { newid: 200, pool: 'produccion' })

// Eliminar VM
await deleteMachine('pve1', '100')
```

---

## Endpoints de Proxmox Utilizados

### Autenticación y Permisos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/access/ticket` | POST | Obtener ticket de sesión |
| `/access/users` | GET | Listar usuarios |
| `/access/roles` | GET | Listar roles |
| `/access/acl` | GET | Listar ACLs |
| `/cluster/permissions` | GET | Permisos del usuario actual |

### Inventario

| Endpoint | Método | Description |
|----------|--------|-------------|
| `/nodes` | GET | Listar nodos del cluster |
| `/cluster/resources` | GET | Recursos (VMs, CTs, almacenamiento) |
| `/pools` | GET | Listar pools |
| `/pools/{poolid}` | GET/PUT | Gestionar un pool específico |

### Máquinas Virtuales/Contenedores

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes/{node}/qemu` | GET | Listar VMs en un nodo |
| `/nodes/{node}/lxc` | GET | Listar CTs en un nodo |
| `/nodes/{node}/{type}/{vmid}/config` | GET/PUT | Configuración de VM/CT |
| `/nodes/{node}/{type}/{vmid}/status/{action}` | POST | Iniciar/Detener/Apagar |
| `/nodes/{node}/{type}/{vmid}/clone` | POST | Clonar VM/CT |
| `/nodes/{node}/{type}/{vmid}` | DELETE | Eliminar VM/CT |
| `/nodes/{node}/{type}/{vmid}/vncproxy` | POST | Obtener ticket VNC |
| `/nodes/{node}/{type}/{vmid}/vncwebsocket` | WebSocket | Conexión VNC |

### Redes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes/{node}/network` | GET | Interfaces de red del nodo |

### Almacenamiento

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/nodes/{node}/storage` | GET | Listar almacenamientos en un nodo |
| `/nodes/{node}/storage/{storage}/content` | GET | Listar archivos (ISOs, Plantillas VZ) |
| `/nodes/{node}/storage/{storage}/download-url` | POST | Descargar archivo desde URL |

---

## Mejores Prácticas de Permisos

### Solo Lectura (Monitoreo)

```
Rol: PVEAuditor
Ruta: /
Propagar: Sí
```

### Operaciones de VM/CT

```
Roles Requeridos:
- VM.PowerMgmt (iniciar/detener/apagar)
- VM.Config.Options (renombrar, opciones)
- Pool.Allocate (cambiar pool)

Rutas: /pool/{nombre-pool} para cada pool gestionado
```

### Consola VNC

```
Roles Requeridos:
- VM.Console (acceso a consola)
- VM.Audit (ver estado)

Ruta: /pool/{nombre-pool} o /vms/{vmid}
```

### Recomendaciones

1. **Prefiere tokens dedicados** por aplicación/usuario.
2. **Evita usar `root@pam`** en producción.
3. **Habilita la Separación de Privilegios** en los tokens para limitar el alcance.
4. **Documenta los permisos otorgados** para auditorías.

---

## Arquitectura de Pruebas

Para mantener una alta estabilidad, Eye of Medina está equipado con un entorno de pruebas integrado. Las pruebas se dividen en dos capas principales que permiten validar tanto operaciones lógicas aisladas como flujos completos de Proxmox de manera segura.

### 1. Extremo a Extremo (E2E) con Playwright
Valida los flujos de usuario completos, interactuando con el DOM real y simulando acciones de usuario.
- Ubicación: `tests/e2e/`
- **Rutas Protegidas**: Probamos continuamente que los usuarios no autenticados que intenten acceder a paneles protegidos (como `/dashboard`, `/machines`) sean capturados correctamente por el Middleware de Nuxt y redirigidos al login (`/`).
- **Nuxt Test Utils**: Utiliza `@nuxt/test-utils/playwright` para iniciar automáticamente el servidor y manejar el contexto de enrutamiento de manera transparente.

### 2. Pruebas Unitarias y Cobertura con Vitest
Prueba componentes individuales, formateadores y el composable `useProxmox` en un entorno aislado.
- Ubicación: `tests/unit/`
- Entorno: `happy-dom` proporciona una simulación ligera del navegador.
- **Cobertura (V8)**: Genera informes (`npm run test:coverage`) indicando con precisión qué ramas/funciones de tus archivos `.vue` y `.ts` aún necesitan pruebas.
- *Nota:* La configuración de Vitest (`vitest.config.ts`) excluye explícitamente los archivos de E2E para evitar colisiones de entorno.

---

## Resolución de Problemas

### Error 401 Unauthorized

- ✅ Verifica que el token/secret sean correctos.
- ✅ Comprueba el realm (pam, pve, ldap, etc.).
- ✅ Confirma que el rol tiene permisos sobre el recurso.

### Error de Certificado

- ✅ En desarrollo: establece `ALLOW_INSECURE_TLS=true`.
- ✅ En producción: utiliza certificados válidos (Let's Encrypt, etc.).

### No aparecen VMs ni datos

- ✅ Verifica la conectividad al puerto 8006.
- ✅ Comprueba si `pveproxy` está activo: `systemctl status pveproxy`.
- ✅ Revisa los permisos de lectura del usuario/token sobre los recursos.

### Métricas del Host Faltantes (CPU/RAM 0%)
- **Causa**: Es probable que el usuario carezca del permiso `Sys.Audit` en `/nodes/{nodo}`.
- **Solución**: Otorga `Sys.Audit` O confía en la función de **Smart Fallback** (Eye of Medina sumará automáticamente el uso de las VMs en su lugar).

### La consola VNC no se conecta

- ✅ Verifica que la VM esté **encendida**.
- ✅ Comprueba que el usuario tenga el permiso `VM.Console`.
- ✅ Revisa los logs del servidor Nuxt en busca de errores del proxy.

### Las operaciones de Pool fallan

- ✅ Confirma el permiso `Pool.Allocate` en el pool de destino.
- ✅ Verifica `VM.Config.*` para los cambios de configuración.

---

## Recursos

- **Referencia de la API de Proxmox VE**: https://pve.proxmox.com/pve-docs/api-viewer/
- **Gestión de Tokens**: https://pve.proxmox.com/pve-docs/pveum-plain.html#pveum_tokens
- **Roles y Permisos**: https://pve.proxmox.com/wiki/User_Management
- **noVNC**: https://novnc.com/

---

<div align="center">

**¿Encontraste un problema? Abre un issue en el repositorio.**

</div>
