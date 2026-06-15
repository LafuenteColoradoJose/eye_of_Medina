# Manual de Usuario · Eye of Medina

Guía paso a paso para utilizar el panel de control de monitoreo y gestión de Proxmox VE.

---

## 📋 Tabla de Contenidos

1. [Acceso al Panel de Control](#acceso-al-panel-de-control)
2. [Menú Principal](#menú-principal)
3. [Panel de Control (Dashboard)](#panel-de-control-dashboard)
4. [Gestión de Máquinas](#gestión-de-máquinas)
5. [Consola VNC](#consola-vnc)
6. [Gestión de Red](#gestión-de-red)
7. [Gestión de Identidad](#gestión-de-identidad)
8. [Gestión de Almacenamiento](#gestión-de-almacenamiento)
9. [Personalización](#personalización)
10. [Errores Comunes](#errores-comunes)

---

## Acceso al Panel de Control

### Iniciar Sesión

1. Abre tu navegador y navega a la URL del panel de control (por ejemplo, `http://localhost:3000`).
2. Introduce tus credenciales de Proxmox:

#### Opción A: Con Token de API (Recomendado)

| Campo | Ejemplo |
|-------|---------|
| Token ID | `admin@pve!eye-token` |
| Secret | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Host | `https://tu-proxmox:8006` |

#### Opción B: Con Usuario/Contraseña

| Campo | Ejemplo |
|-------|---------|
| Usuario | `admin@pve` |
| Contraseña | `tu-contraseña` |
| Host | `https://tu-proxmox:8006` |

3. Haz clic en **Login**.

> 💡 **Consejo**: Los Tokens de API no expiran y son más seguros para el uso de aplicaciones.

---

## Menú Principal

La barra lateral izquierda proporciona acceso a todas las secciones:

| Icono | Sección | Descripción |
|-------|---------|-------------|
| 📊 | Dashboard | Resumen general del cluster |
| 🖥️ | Máquinas | Gestión de VMs y Contenedores |
| 💾 | Almacenamiento | Gestión de ISOs y Respaldos |
| 🌐 | Redes | Interfaces de red por nodo |
| 📦 | Pools | Grupos de recursos |
| 👥 | Grupos | Grupos de usuarios |
| 👤 | Usuarios | Cuentas de usuario |
| 🔐 | Roles | Roles de permisos |
| 📋 | ACL | Listas de Control de Acceso |
| 🌳 | Permisos | Árbol de permisos |

En la parte inferior del menú encontrarás:
- **Selector de Tema** (🌙/☀️): Cambia entre modo claro y oscuro.
- **Logout**: Cierra la sesión actual.

---

## Panel de Control (Dashboard)

El panel de control muestra una visión general del estado del cluster con información de alta densidad.

### Métricas Principales (Fila Superior)
1. **Estado de VMs**: Gráfico circular que muestra las VMs en ejecución vs detenidas.
2. **Almacenamiento Local**: Barras de capacidad para cada nodo (solo almacenamiento local).
3. **CPU en Tiempo Real**: Gráfico de carga de CPU de todo el cluster.
4. **Tráfico de Red**: Uso de ancho de banda agregado en tiempo real (Mbps).

### Métricas Secundarias
- **Top Consumidores**: Lista de VMs ordenadas por consumo de recursos (CPU/Memoria).
- **Zonas IP Activas**: Interfaces con direcciones IP asignadas (L3).
- **Salud del Nodo**: Rejilla que muestra el estado (En línea/Desconectado) y uso de recursos de cada nodo.

### Registro de Tareas (Tareas Recientes)

Accede haciendo clic en el botón de **Tareas Recientes** en el menú lateral para abrir un panel deslizante.
- Muestra el historial de operaciones del cluster (respaldos, detenciones, arranques).
- Se actualiza en tiempo real mientras el panel está abierto.
- Si no eres un administrador global, solo verás las tareas relacionadas con tu usuario/nodos accesibles.

### Actualización de Datos

Utiliza el botón de **Actualizar** en la esquina superior derecha para refrescar los datos.

---

## Gestión de Máquinas

Acceso a través del menú: **Máquinas**

### Lista y Filtros

Utiliza los filtros superiores para encontrar VMs/CTs:
- **Buscar**: Por nombre o ID.
- **Tipo**: VM (QEMU) o CT (LXC).
- **Pool**: Filtrar por un pool específico.
- **Estado**: En ejecución, detenida, etc.

### Acciones Disponibles

| Acción | Descripción |
|--------|-------------|
| ▶️ Iniciar | Enciende la VM/CT |
| ⏹️ Detener | Fuerza el apagado |
| ⏸️ Apagar | Apagado ordenado (ACPI) |
| 🖥️ Consola | Abre la consola VNC |
| 📋 Clonar | Duplica la VM/CT |
| ✏️ Editar | Modifica la configuración |
| 🗑️ Eliminar | Elimina (con confirmación) |

### Clonar una VM

1. Haz clic en el botón **Clonar** en la VM.
2. Rellena el formulario:
   - **Nuevo ID**: ID para el clon.
   - **Nombre**: Nombre del clon.
   - **Pool de Destino**: Pool donde se creará el clon.
3. Haz clic en **Clonar**.

### Editar Configuración

1. Haz clic en **Editar** en la VM.
2. Modifica los campos:
   - **Nombre**: Nombre de la VM.
   - **Pool**: Pool asociado.
3. Guarda los cambios.

### Eliminar una VM

1. Haz clic en **Eliminar**.
2. Confirma escribiendo el nombre de la VM.
3. Haz clic en **Eliminar Permanentemente**.

> ⚠️ **Advertencia**: Esta acción es irreversible.

---

## Consola VNC

La consola permite el acceso remoto a la pantalla de una VM o contenedor.

### Abrir Consola

1. En la lista de máquinas, haz clic en el icono 🖥️ de la VM.
2. O navega a `/console/{vmid}?node={nodo}&type={qemu|lxc}`.
3. La consola se conectará automáticamente.

### Controles de la Consola

| Control | Función |
|---------|----------|
| **Enviar Ctrl-Alt-Del** | Envía la combinación de teclas |
| **Reconectar** | Reinicia la conexión |

### Interacción

- **Teclado**: Escribe directamente, las teclas se envían a la VM.
- **Mouse**: Haz clic y mueve el cursor dentro de la consola.
- **Portapapeles**: Usa Ctrl+V para pegar texto (si la VM lo soporta).

### Indicador de Estado

- 🟢 **Verde**: Conectado con éxito.
- 🔴 **Rojo**: Desconectado o error.

### Resolución de Problemas

Si la consola no se conecta:
1. Verifica que la VM esté **encendida**.
2. Comprueba tu **sesión** en Eye of Medina.
3. Utiliza el botón **Reconectar**.

---

## Gestión de Red

Acceso a través del menú: **Redes**

### Seleccionar Nodo

Utiliza el selector superior para elegir el nodo a inspeccionar.

### Visualización Inteligente (Zonas IP)
La nueva interfaz prioriza la conectividad lógica sobre el cableado:

1. **Zonas IP (L3)**:
   - Tarjetas que destacan las redes configuradas.
   - **Clic para copiar**: Haz clic en cualquier IP (v4 o v6) para copiarla al portapapeles.
   - **Jerarquía Visual**: Muestra la ruta desde el cable físico -> Bridge -> IP.

2. **Infraestructura (L2/L1)**:
   - Sección separada para interfaces puras (cables sin asignar, bridges puros).
   - Indicadores de estado (Activo/Inactivo).

### Tipos de Interfaz

| Tipo | Descripción |
|------|-------------|
| **Bridge** | Puentes virtuales (vmbr0, vmbr1...) |
| **Ethernet** | Interfaces físicas (eth0, enp0s3...) |
| **Bond** | Agregación de enlaces (LACP) |
| **VLAN** | Interfaces de VLAN |

---

## Gestión de Almacenamiento

Acceso a través del menú: **Almacenamiento**

### Explorar Contenido

1. Selecciona el **Nodo** en el menú desplegable.
2. Selecciona el **Almacenamiento** específico (por ejemplo, `local`, `local-lvm`).
3. Utiliza las pestañas para filtrar por tipo:
   - **ISO**: Imágenes de instalación.
   - **Plantillas**: Plantillas de contenedores LXC.
   - **Respaldos**: Archivos de respaldo VZDump.
   - **Discos de VM**: Archivos de disco virtual (Raw/Qcow2).

### Descargar Contenido (URL)

Puedes descargar ISOs directamente al servidor:

1. Haz clic en el botón **Descargar desde URL**.
2. Introduce el enlace directo al archivo ISO.
3. Introduce el nombre del archivo de destino.
4. Haz clic en **Descargar**.

> La descarga se realiza en segundo plano en el nodo de Proxmox.

---

## Gestión de Identidad

### Pools

Los pools agrupan recursos lógicamente.

1. Ve a **Pools**.
2. Visualiza los pools existentes.
3. Haz clic en un pool para ver sus recursos asociados.

### Grupos

Los grupos agrupan usuarios.

1. Ve a **Grupos**.
2. Visualiza los grupos y sus miembros.

### Usuarios

Gestión de cuentas de usuario.

1. Ve a **Usuarios**.
2. Visualiza los usuarios y sus roles asignados.

### Roles

Los roles definen conjuntos de permisos.

1. Ve a **Roles**.
2. Inspecciona los roles disponibles.
3. Haz clic en un rol para ver sus privilegios.

### ACL

Las ACLs asignan roles a rutas específicas.

1. Ve a **ACL**.
2. Visualiza las reglas aplicadas.
3. Filtra por usuario, grupo o ruta.

### Árbol de Permisos

Vista consolidada para auditorías:

1. Ve a **Permisos** (o **Permissions Tree**).
2. Navega por el árbol jerárquico.
3. Identifica qué roles tienen acceso a cada recurso.

---

## Personalización

### Modo Claro/Oscuro

1. En el menú lateral, busca el icono del tema (🌙/☀️).
2. Haz clic para cambiarlo.
3. La preferencia se guarda automáticamente.

O:
- Detección automática de la preferencia del sistema operativo.

---

## Errores Comunes

### "401 Unauthorized"

**Causa**: Credenciales inválidas o falta de permisos.

**Solución**:
- Verifica el token/secret o el usuario/contraseña.
- Comprueba el realm (pam, pve, ldap).
- Confirma que tienes permisos sobre los recursos.

### "Certificado Inválido" (Invalid Certificate)

**Causa**: Proxmox utiliza un certificado autofirmado.

**Solución**:
- En desarrollo: Acepta el certificado en el navegador.
- En producción: Utiliza certificados válidos.

### "No aparecen datos"

**Causa**: Problemas de conectividad o de permisos.

**Solución**:
- Verifica que `NUXT_PUBLIC_PROXMOX_HOST` sea correcto.
- Comprueba la conectividad al puerto 8006.
- Comprueba los permisos de lectura del usuario.

### "La consola no se conecta"

**Causa**: VM apagada o permisos insuficientes.

**Solución**:
- Asegúrate de que la VM esté encendida.
- Verifica el permiso `VM.Console`.
- Utiliza el botón **Reconectar**.

### "Error al Clonar/Eliminar"

**Causa**: Permisos insuficientes en el recurso.

**Solución**:
- Verifica `Pool.Allocate` en el pool de destino.
- Confirma `VM.Clone` y `VM.Allocate`.

---

## Atajos y Consejos

| Acción | Consejo |
|--------|-----|
| Navigation | Utiliza el menú lateral para moverte entre secciones |
| Search | Los filtros se aplican en tiempo real |
| Refresh | Refresca los datos desde el servidor |
| Console | Haz clic dentro de la consola para capturar el teclado |
| Theme | El modo oscuro reduce la fatiga visual |

---

<div align="center">

**¿Necesitas ayuda? Consulta la [guía técnica](Eye_of_Medina.ES.md) o abre un issue.**

</div>
