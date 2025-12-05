# Integración con Proxmox API

Este proyecto incluye integración completa con la API de Proxmox VE para autenticación y gestión.

## 🔑 Métodos de Autenticación

### 1. API Token (Recomendado para aplicaciones)

El método más seguro para aplicaciones. No expira automáticamente y puede tener permisos específicos.

#### Cómo crear un API Token en Proxmox:

1. Accede a tu Proxmox web UI
2. Ve a **Datacenter → Permissions → API Tokens**
3. Click en **"Add"**
4. Configura:
   - **User**: Selecciona el usuario (ej: root@pam)
   - **Token ID**: Dale un nombre único (ej: myapp-token)
   - **Privilege Separation**: Desmarca esta opción para heredar los permisos del usuario
5. Click en **"Add"**
6. **IMPORTANTE**: Guarda el Secret que se muestra. No se puede recuperar después.

#### Formato del Token ID:
```
usuario@realm!nombre-token
```

Ejemplo:
```
root@pam!myapp-token
```

#### Formato del Secret:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. Usuario y Contraseña

Método tradicional usando credenciales de usuario.

#### Realms disponibles:
- **pam**: Linux PAM (usuarios del sistema)
- **pve**: Proxmox VE (usuarios de Proxmox)

## 🚀 Uso en el código

### Composable `useProxmox()`

El proyecto incluye un composable que facilita la interacción con Proxmox:

```typescript
const { 
  login, 
  loginWithToken, 
  proxmoxRequest, 
  logout, 
  isAuthenticated,
  username 
} = useProxmox();
```

### Ejemplos de uso:

#### Login con Token:
```typescript
const result = await loginWithToken(
  'root@pam!mytoken',
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  'https://192.168.1.100:8006'
);

if (result.success) {
  console.log('Login exitoso!');
  router.push('/dashboard');
}
```

#### Login con Usuario/Contraseña:
```typescript
const result = await login(
  'root@pam',
  'mi-contraseña',
  'https://192.168.1.100:8006'
);
```

#### Hacer peticiones a la API:
```typescript
// Obtener versión
const version = await proxmoxRequest('/version', 'GET');

// Listar nodos
const nodes = await proxmoxRequest('/nodes', 'GET');

// Listar VMs de un nodo
const vms = await proxmoxRequest('/nodes/pve/qemu', 'GET');

// Obtener estado de una VM
const vmStatus = await proxmoxRequest('/nodes/pve/qemu/100/status/current', 'GET');
```

## 🔒 Seguridad

### CORS y Certificados SSL

Proxmox usa certificados auto-firmados por defecto. Para desarrollo:

1. **Opción 1**: Aceptar el certificado en el navegador visitando la URL de Proxmox
2. **Opción 2**: Usar un certificado válido en Proxmox
3. **Opción 3**: Configurar un proxy reverso (nginx) con certificado válido

### CORS Headers

Si obtienes errores de CORS, necesitas configurar Proxmox o usar un proxy:

#### Configurar CORS en Proxmox:
```bash
# En el servidor Proxmox
echo "Access-Control-Allow-Origin: *" >> /etc/default/pveproxy
systemctl restart pveproxy
```

## 📚 Endpoints útiles de la API

### Información del sistema:
- `GET /version` - Versión de Proxmox
- `GET /nodes` - Lista de nodos
- `GET /nodes/{node}/status` - Estado de un nodo

### Máquinas Virtuales (QEMU):
- `GET /nodes/{node}/qemu` - Lista de VMs
- `GET /nodes/{node}/qemu/{vmid}/status/current` - Estado de VM
- `POST /nodes/{node}/qemu/{vmid}/status/start` - Iniciar VM
- `POST /nodes/{node}/qemu/{vmid}/status/stop` - Detener VM
- `POST /nodes/{node}/qemu/{vmid}/status/shutdown` - Apagar VM

### Contenedores (LXC):
- `GET /nodes/{node}/lxc` - Lista de contenedores
- `GET /nodes/{node}/lxc/{vmid}/status/current` - Estado de contenedor

### Storage:
- `GET /storage` - Lista de storages
- `GET /nodes/{node}/storage/{storage}/content` - Contenido de storage

### Cluster:
- `GET /cluster/resources` - Recursos del cluster
- `GET /cluster/backup` - Tareas de backup

## 🐛 Troubleshooting

### Error 500 - Internal Server Error
- Verifica que el host de Proxmox sea correcto
- Verifica que el servicio pveproxy esté corriendo: `systemctl status pveproxy`

### Error 401 - Unauthorized
- Verifica las credenciales o el token
- Para tokens, asegúrate de desmarcar "Privilege Separation"
- Verifica que el usuario tenga los permisos necesarios

### Error de CORS
- Configura los headers CORS en Proxmox
- Considera usar un proxy reverso

### Error de certificado SSL
- Acepta el certificado en el navegador
- O instala un certificado válido en Proxmox

## 📖 Documentación oficial

- [Proxmox VE API Documentation](https://pve.proxmox.com/pve-docs/api-viewer/)
- [API Tokens](https://pve.proxmox.com/pve-docs/pveum-plain.html#pveum_tokens)
