# Manual de usuario · Eye of Medina

Guia rapida para operar el panel.

## Acceso
1) Abre http://localhost:3000 (o la URL desplegada).
2) Inicia sesion con token o usuario/clave de Proxmox.
   - Token ID: formato `user@realm!token-name`.
   - Secret: valor del token.
   - Host: URL de Proxmox (https://host:8006).
3) Si usas certificado autofirmado en desarrollo, acepta el aviso del navegador.

## Menu principal
- Dashboard: vista general con KPI, graficas, Top Consumidores y estado de nodos.
- Machines: lista VMs y contenedores (CT) con acciones rapidas.
- Pools, Groups, Users, Roles, ACL: gestion de identidades y permisos.
- Permissions Tree: auditoria visual de permisos aplicados.
- Apariencia: botón en el menú para alternar entre Modo Claro y Oscuro.

## Dashboard
- KPI superiores: resumen de VMs/CTs y estado.
- Graficas: estado de VMs, carga de CPU por nodo y distribucion por pools.
- Top Consumidores: listado de VMs con mayor uso de recursos.
- Boton Refresh: recarga datos bajo demanda.

## Machines (VM/CT)
- Filtros: busca por nombre o ID, tipo (VM/CT), pool.
- Acciones por fila:
  - Clone: clona una VM/CT y permite elegir pool destino.
  - Edit: cambia nombre/hostname y pool asociado.
  - Delete: elimina la VM/CT.
- Detalles: ver estado actual y nodo donde corre.

## Pools, Groups, Users, Roles, ACL
- Pools: consulta pools existentes y recursos asociados.
- Groups/Users: revisa pertenencias y roles vinculados.
- Roles: inspecciona roles disponibles.
- ACL: revisa reglas aplicadas a rutas/pools.

## Permissions Tree
- Muestra en arbol los permisos efectivos sobre recursos.
- Usa esta vista para auditar rapidamente que rol/aplicacion tiene acceso.

## Consejos de permisos
- Lectura solo: rol `PVEAuditor` sobre `/` y los pools requeridos.
- Operacion de VMs/CTs: incluye `VM.PowerMgmt`, `VM.Config.Options` y `Pool.Allocate` en los pools que vaya a gestionar.
- Prefiere tokens dedicados por usuario/aplicacion.

## Errores comunes
- 401 Unauthorized: verifica token/secret o realm y permisos sobre el pool/VM.
- Certificado invalido: acepta el certificado autofirmado o usa TLS valido.
- No aparecen datos: revisa que `PROXMOX_HOST` apunte al servidor correcto y que haya conectividad al puerto 8006.

## Donde se guarda la configuracion
- Host y politicas TLS via variables de entorno (`PROXMOX_HOST`, `NUXT_PUBLIC_PROXMOX_HOST`, `ALLOW_INSECURE_TLS`).
- Las llamadas a Proxmox pasan por el backend (no necesitas habilitar CORS en Proxmox para la UI).
