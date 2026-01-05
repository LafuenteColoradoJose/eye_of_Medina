# Eye of Medina

Panel Nuxt 4 para monitoreo y gestion de Proxmox VE: dashboard con graficas, control de pools/grupos/roles/ACL y operaciones sobre VMs y contenedores.

## Caracteristicas
- Dashboard con KPI (incluyendo Bridges Activos), graficas, Top Consumidores y salud de nodos.
- Gestión de Redes: visualización de interfaces de red (Bridges, Ethernet, VLANs) y su estado por nodo.
- Listado de VMs/CTs con filtros, clonado con seleccion de pool, renombrado/hostname, cambio de pool y eliminacion.
- Gestion de pools, grupos, usuarios, roles y ACL alineada con permisos de Proxmox; vista arbol de permisos.
- Soporte nativo para Modo Oscuro y Claro.
- Autenticacion via token o usuario/clave; proxy seguro a Proxmox desde el backend Nuxt.

## Requisitos
- Node.js 20+.
- Acceso HTTPS al host de Proxmox (puerto 8006).
- Variables de entorno basicas:
	- `PROXMOX_HOST` o `NUXT_PUBLIC_PROXMOX_HOST`: URL base de Proxmox (ej: https://pve.local:8006).
	- `ALLOW_INSECURE_TLS=true` si aceptas certificado autofirmado en desarrollo.

## Instalacion
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```
Abre http://localhost:3000.

## Produccion
```bash
npm run build
npm run preview  # para probar el build localmente
```

## Notas de arquitectura
- Configuracion y metadatos en [nuxt.config.ts](nuxt.config.ts); CSS principal en [app/assets/css/main.css](app/assets/css/main.css).
- API proxy a Proxmox en [server/api/proxmox/login.post.ts](server/api/proxmox/login.post.ts) y [server/api/proxmox/request.post.ts](server/api/proxmox/request.post.ts).
- Dashboard y modulos principales en [app/pages](app/pages), composables en [app/composables](app/composables).
- Documentacion funcional en [Eye_of_Medina.md](Eye_of_Medina.md).
