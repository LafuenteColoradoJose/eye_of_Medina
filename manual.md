# Manual de Usuario · Eye of Medina

Guía paso a paso para usar el panel de monitoreo y gestión de Proxmox VE.

---

## 📋 Índice

1. [Acceso al panel](#acceso-al-panel)
2. [Menú principal](#menú-principal)
3. [Dashboard](#dashboard)
4. [Gestión de máquinas](#gestión-de-máquinas)
5. [Consola VNC](#consola-vnc)
6. [Gestión de redes](#gestión-de-redes)
7. [Gestión de identidad](#gestión-de-identidad)
8. [Personalización](#personalización)
9. [Errores comunes](#errores-comunes)

---

## Acceso al panel

### Inicio de sesión

1. Abre el navegador y accede a la URL del panel (ej: `http://localhost:3000`)
2. Introduce tus credenciales de Proxmox:

#### Opción A: Con API Token (recomendado)

| Campo | Ejemplo |
|-------|---------|
| Token ID | `admin@pve!eye-token` |
| Secret | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Host | `https://tu-proxmox:8006` |

#### Opción B: Con usuario/contraseña

| Campo | Ejemplo |
|-------|---------|
| Usuario | `admin@pve` |
| Contraseña | `tu-contraseña` |
| Host | `https://tu-proxmox:8006` |

3. Haz clic en **Iniciar sesión**

> 💡 **Tip**: Los API Tokens no caducan y son más seguros para uso en aplicaciones.

---

## Menú principal

El menú lateral izquierdo proporciona acceso a todas las secciones:

| Icono | Sección | Descripción |
|-------|---------|-------------|
| 📊 | Dashboard | Vista general del cluster |
| 🖥️ | Machines | Gestión de VMs y contenedores |
| 🌐 | Redes | Interfaces de red por nodo |
| 📦 | Pools | Grupos de recursos |
| 👥 | Groups | Grupos de usuarios |
| 👤 | Users | Cuentas de usuario |
| 🔐 | Roles | Roles de permisos |
| 📋 | ACL | Listas de control de acceso |
| 🌳 | Permissions | Árbol de permisos |

En la parte inferior del menú encontrarás:
- **Selector de tema** (🌙/☀️): Alterna entre modo oscuro y claro
- **Cerrar sesión**: Termina la sesión actual

---

## Dashboard

El dashboard muestra una vista general del estado del cluster.

### KPIs superiores

Métricas rápidas del cluster:
- **VMs totales**: Número de máquinas virtuales
- **CTs totales**: Número de contenedores
- **En ejecución**: VMs/CTs actualmente activas
- **Bridges activos**: Interfaces de red bridge

### Gráficas

- **Estado de VMs**: Distribución por estado (running, stopped, etc.)
- **CPU por nodo**: Uso de CPU en cada nodo
- **Por pools**: Distribución de VMs/CTs por pool

### Top Consumidores

Listado de VMs ordenadas por consumo de recursos (CPU/memoria).

### Estado de nodos

Estado y métricas de cada nodo del cluster:
- CPU y memoria
- Almacenamiento
- Uptime

### Refrescar datos

Usa el botón **Refresh** en la esquina superior derecha para actualizar los datos.

---

## Gestión de máquinas

Accede desde el menú: **Machines**

### Listado y filtros

Usa los filtros superiores para encontrar VMs/CTs:
- **Búsqueda**: Por nombre o ID
- **Tipo**: VM (QEMU) o CT (LXC)
- **Pool**: Filtrar por pool específico
- **Estado**: Running, stopped, etc.

### Acciones disponibles

| Acción | Descripción |
|--------|-------------|
| ▶️ Start | Encender la VM/CT |
| ⏹️ Stop | Apagar forzosamente |
| ⏸️ Shutdown | Apagado ordenado |
| 🖥️ Console | Abrir consola VNC |
| 📋 Clone | Duplicar la VM/CT |
| ✏️ Edit | Modificar configuración |
| 🗑️ Delete | Eliminar (con confirmación) |

### Clonar una VM

1. Haz clic en el botón **Clone** de la VM
2. Completa el formulario:
   - **Nuevo ID**: ID para el clon
   - **Nombre**: Nombre del clon
   - **Pool destino**: Pool donde crear el clon
3. Haz clic en **Clonar**

### Editar configuración

1. Haz clic en **Edit** en la VM
2. Modifica los campos:
   - **Nombre**: Nombre de la VM
   - **Pool**: Pool asociado
3. Guarda los cambios

### Eliminar una VM

1. Haz clic en **Delete**
2. Confirma escribiendo el nombre de la VM
3. Haz clic en **Eliminar definitivamente**

> ⚠️ **Atención**: Esta acción es irreversible.

---

## Consola VNC

La consola permite acceso remoto a la pantalla de una VM o contenedor.

### Abrir consola

1. En la lista de máquinas, haz clic en el icono 🖥️ de la VM
2. O navega a `/console/{vmid}?node={node}&type={qemu|lxc}`
3. La consola se conectará automáticamente

### Controles de la consola

| Control | Función |
|---------|---------|
| **Send Ctrl-Alt-Del** | Envía la combinación de teclas |
| **Reconectar** | Reinicia la conexión |

### Interacción

- **Teclado**: Escribe directamente, las teclas se envían a la VM
- **Ratón**: Haz clic y mueve el cursor dentro de la consola
- **Portapapeles**: Ctrl+V para pegar texto (si la VM lo soporta)

### Indicador de estado

- 🟢 **Verde**: Conectado correctamente
- 🔴 **Rojo**: Desconectado o error

### Solución de problemas

Si la consola no conecta:
1. Verifica que la VM esté **encendida**
2. Comprueba tu **sesión** en Eye of Medina
3. Usa el botón **Reconectar**

---

## Gestión de redes

Accede desde el menú: **Redes**

### Seleccionar nodo

Usa el selector superior para elegir el nodo a inspeccionar.

### Tipos de interfaces

| Tipo | Descripción |
|------|-------------|
| **Bridge** | Puentes virtuales (vmbr0, vmbr1...) |
| **Ethernet** | Interfaces físicas (eth0, enp0s3...) |
| **Bond** | Agregación de enlaces |
| **VLAN** | Interfaces VLAN |

### Información mostrada

- **Nombre**: Identificador de la interfaz
- **Estado**: Activo/Inactivo
- **Autostart**: Si inicia con el sistema
- **IP/Gateway**: Direccionamiento configurado
- **Puertos**: Interfaces asociadas (en bridges/bonds)

---

## Gestión de identidad

### Pools

Los pools agrupan recursos lógicamente.

1. Ve a **Pools** en el menú
2. Visualiza los pools existentes
3. Haz clic en un pool para ver sus recursos

### Groups

Los grupos agrupan usuarios.

1. Ve a **Groups**
2. Visualiza grupos y miembros

### Users

Gestión de cuentas de usuario.

1. Ve a **Users**
2. Visualiza usuarios y sus roles

### Roles

Los roles definen conjuntos de permisos.

1. Ve a **Roles**
2. Inspecciona los roles disponibles
3. Haz clic en un rol para ver sus privilegios

### ACL

Las ACLs asignan roles a rutas.

1. Ve a **ACL**
2. Visualiza las reglas aplicadas
3. Filtra por usuario, grupo o ruta

### Árbol de permisos

Vista consolidada para auditoría:

1. Ve a **Permissions** (o Permissions Tree)
2. Navega por el árbol jerárquico
3. Identifica qué roles tienen acceso a cada recurso

---

## Personalización

### Modo oscuro/claro

1. En el menú lateral, busca el icono de tema (🌙/☀️)
2. Haz clic para alternar
3. El tema se guarda automáticamente

O bien:
- El sistema detecta automáticamente tu preferencia del SO

---

## Errores comunes

### "401 Unauthorized"

**Causa**: Credenciales inválidas o sin permisos.

**Solución**:
- Verifica token/secret o usuario/contraseña
- Comprueba el realm (pam, pve, ldap)
- Confirma que tienes permisos sobre los recursos

### "Certificado inválido"

**Causa**: Proxmox usa certificado autofirmado.

**Solución**:
- En desarrollo: acepta el certificado en el navegador
- En producción: configura un certificado válido

### "No aparecen datos"

**Causa**: Problemas de conectividad o permisos.

**Solución**:
- Verifica que `PROXMOX_HOST` sea correcto
- Comprueba conectividad al puerto 8006
- Revisa que tu usuario tenga permisos de lectura

### "Consola no conecta"

**Causa**: VM apagada o permisos insuficientes.

**Solución**:
- Asegúrate de que la VM esté encendida
- Verifica permiso `VM.Console` en tu usuario
- Usa el botón **Reconectar**

### "Error al clonar/eliminar"

**Causa**: Permisos insuficientes sobre el recurso.

**Solución**:
- Verifica `Pool.Allocate` sobre el pool destino
- Confirma `VM.Clone` y `VM.Allocate` para clonar
- Confirma `VM.Allocate` para eliminar

---

## Atajos y consejos

| Acción | Consejo |
|--------|---------|
| Navegación | Usa el menú lateral para moverte entre secciones |
| Búsqueda | Los filtros se aplican en tiempo real |
| Refresh | El botón actualiza los datos del servidor |
| Consola | Haz clic dentro de la consola para capturar el teclado |
| Tema | El modo oscuro reduce la fatiga visual |

---

<div align="center">

**¿Necesitas ayuda? Consulta la [guía técnica](Eye_of_Medina.md) o abre un issue.**

</div>
