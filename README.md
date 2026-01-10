# Eye of Medina

<div align="center">

![Eye of Medina](public/Logo_Eye_of_Medina.svg)

**Panel web moderno para monitoreo y gestión de Proxmox VE**

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Características

### Dashboard
- **KPIs en tiempo real**: VMs, contenedores, bridges activos y estado de nodos
- **Gráficas interactivas**: estado de VMs, carga CPU por nodo, distribución por pools
- **Top Consumidores**: VMs con mayor uso de recursos
- **Estado de nodos**: salud y métricas de cada nodo del cluster

### Gestión de Máquinas Virtuales
- Listado con **filtros avanzados** (nombre, ID, tipo, pool)
- **Clonación** de VMs/CTs con selección de pool destino
- **Edición** de nombre/hostname y cambio de pool
- **Start/Stop/Shutdown** con confirmación
- Eliminación segura con doble confirmación

### 🖥️ Consola VNC Integrada (NEW!)
- **Acceso directo a consola** de VMs y contenedores desde el navegador
- **Proxy WebSocket server-side**: conexión segura sin necesidad de sesión Proxmox separada
- Basado en **noVNC** con soporte completo de teclado/ratón
- **Send Ctrl-Alt-Del** con un clic
- Reconexión automática

### Gestión de Redes
- Visualización por nodo: Bridges, Ethernet, Bonds, VLANs
- Estado de interfaces (activo/inactivo, autostart)
- Direccionamiento IP y gateways
- Puertos asociados y esclavos

### Identidad y Accesos
- Gestión de **Pools**, **Grupos**, **Usuarios**, **Roles** y **ACL**
- **Árbol de permisos**: auditoría visual de permisos efectivos
- Alineado con el modelo de permisos de Proxmox

### Experiencia de Usuario
- **Modo Oscuro y Claro** con detección automática
- Diseño responsive para desktop y tablets
- Transiciones fluidas entre páginas

---

## 🚀 Instalación

### Requisitos
- Node.js 20+
- Acceso HTTPS al host de Proxmox (puerto 8006)

### Variables de entorno

```env
# URL de tu servidor Proxmox
PROXMOX_HOST=https://tu-proxmox:8006
NUXT_PUBLIC_PROXMOX_HOST=https://tu-proxmox:8006

# Solo en desarrollo con certificado autofirmado
ALLOW_INSECURE_TLS=true
```

### Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

Abre [http://localhost:3000](http://localhost:3000) para acceder al panel.

---

## 🏗️ Arquitectura

```
eye_of_Medina/
├── app/
│   ├── pages/           # Páginas de la aplicación
│   │   ├── console/     # Consola VNC integrada
│   │   ├── machines/    # Gestión de VMs/CTs
│   │   └── ...
│   ├── components/      # Componentes reutilizables
│   ├── composables/     # Lógica compartida (useProxmox, etc.)
│   └── assets/          # CSS y recursos estáticos
├── server/
│   ├── api/proxmox/     # API proxy a Proxmox
│   └── routes/_ws/      # WebSocket proxy para VNC
└── nuxt.config.ts       # Configuración de Nuxt
```

### Tecnologías clave
- **Nuxt 4** con Nitro server
- **Vue 3** Composition API
- **TypeScript** para tipado estático
- **TailwindCSS 4** para estilos
- **noVNC** para consola remota
- **WebSocket nativo** de Nitro para proxy VNC

---

## 📖 Documentación

- [Guía de integración con Proxmox](Eye_of_Medina.md) - Autenticación, permisos y API
- [Manual de usuario](manual.md) - Guía de uso del panel

---

## 🔐 Autenticación

### API Token (recomendado)
```
Token ID: usuario@realm!nombre-token
Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Usuario/Contraseña
```
Usuario: usuario@pam or usuario@pve
Contraseña: tu-contraseña
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Proxmox**

</div>
