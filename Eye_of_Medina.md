# Eye of Medina · Proxmox VE Integration

Technical guide for integrating the application with Proxmox VE: authentication, permissions, API, and system architecture.

---

## 📋 Table of Contents

1. [Supported Authentication](#supported-authentication)
2. [Quick Setup](#quick-setup)
3. [UI Features](#ui-features)
4. [Integrated VNC Console](#integrated-vnc-console)
5. [Composable useProxmox()](#composable-useproxmox)
6. [Used Proxmox Endpoints](#used-proxmox-endpoints)
7. [Permission Best Practices](#permission-best-practices)
8. [Testing Architecture](#testing-architecture)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Supported Authentication

### API Token (Recommended)

Tokens are the most secure way to authenticate applications:

- **Do not expire** (unlike session tickets).
- **Can be scoped** with specific permissions.
- **Auditable** from the Proxmox interface.

**Token Format:**
```
Token ID: user@realm!token-name
Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**How to create a token in Proxmox:**

1. Go to: `Datacenter → Permissions → API Tokens → Add`.
2. **User**: The base user (e.g., `root@pam` or a dedicated user).
3. **Token ID**: Unique name for the token.
4. **Privilege Separation**: 
   - ✅ Checked: The token will have separated permissions (safer).
   - ❌ Unchecked: Inherits base user permissions.
5. **Save the Secret** - it is never shown again.

### Username and Password

Classic method via session ticket (`/access/ticket`):

- **Common Realms**: `pam` (Linux) and `pve` (Internal Proxmox).
- Tickets expire after 2 hours of inactivity.
- Requires periodic renewal.

---

## Quick Setup

### Required Environment Variables

```env
# Proxmox base URL (with protocol and port)
NUXT_PUBLIC_PROXMOX_HOST=https://proxmox.example.com:8006

# Only for development with self-signed certificate
ALLOW_INSECURE_TLS=true
```

### Network Requirements

- **Port 8006** accessible from the server running Eye of Medina.
- **WebSocket** enabled for VNC console (port 8006, same as API).
- **TLS Certificate**: In development, self-signed certs can be accepted; in production, use valid certificates.

### About CORS

Calls to Proxmox are routed through the Nuxt backend:
- `/api/proxmox/login` - Authentication
- `/api/proxmox/request` - General API calls
- `/_ws/vnc` - WebSocket proxy for VNC console

**You do NOT need to modify CORS configuration in Proxmox.**

---

## UI Features

### Dashboard 2.2
- **High Density Layout**: 4-column responsive grid (`State`, `Storage`, `CPU`, `Network`) for large screens.
- **Real-time Monitoring**:
  - **Network**: Aggregate cluster traffic (Mbps) calculated from node deltas.
  - **Storage**: Capacity usage of local disks per node (Equalizer view).
  - **CPU**: Real-time cluster load chart.
- **Top Consumers**: Detailed resource consumption analysis (CPU/RAM).
- **Tasks Drawer**: Slide-out panel with aggregated operation logs.
- **Node Health**: Grid view of all nodes with status indicators.

### Storage Management
- **Unified Browser**: View files (ISOs, Templates, Backups, VM Disks) across all nodes/storages.
- **Direct Download**: Feature to download files (e.g., ISOs) from a URL directly to the Proxmox node storage.
- **Capacity Analysis**: specific visualization of storage usage.

### Machine Management (VM/CT)

- **List/Filter**: By name, ID, type (VM/CT), pool.
- **Clone**: Duplicate VMs/CTs selecting destination pool.
- **Edit**: Change name, hostname, and associated pool.
- **Delete**: With safety confirmation.
- **Console**: Direct VNC access from the browser.

### Network Management

- **Smart Addressing**: New dashboard focusing on "Zones" (L3) rather than raw cables.
- **Visual Topology**: Hierarchical visualization `[Physical] -> [Bond/Bridge] -> [IP]`.
- **UX Improvements**: "Click-to-Copy" for IPs, visual distinction between v4/v6.

### Resources Heatmap & Capacity
- **Real-time Capacity**: Visualizes Host CPU/RAM usage.
- **Smart Fallback Architecture**: If the user lacks `Sys.Audit` permissions (seeing 0% host usage), the system **automatically aggregates** the CPU/RAM of all visible VMs to calculate a "Virtual Load", ensuring useful data is always displayed.
- **Granular Heatmap**: Interactive grid showing individual VM load (CPU) with color-coded alerts (Green -> Red).

### Network Topology
- **Interactive Map**: Visual graph `[Physical Node] -> [Bridge/Bond] -> [IP/CIDR]`.
- **Smart Addressing**: Focuses on Layer 3 (IP Zones) rather than raw interfaces.
- **Visual Aids**: Distinction between IPv4/IPv6, click-to-copy IPs, and intuitive tree layout.

### Identity Management
- **Pools**: Logically grouped resources.
- **Groups**: User sets.
- **Users**: Access accounts.
- **Roles**: Permission sets.
- **ACL**: Access control rules on paths.

---

## Integrated VNC Console

### Architecture

```
┌─────────────┐     WebSocket      ┌─────────────────┐     WebSocket     ┌─────────────┐
│   Browser   │ ◄─────────────────► │  Nuxt Server    │ ◄────────────────► │   Proxmox   │
│   (noVNC)   │                    │  (VNC Proxy)    │                    │   (VNC)     │
└─────────────┘                    └─────────────────┘                    └─────────────┘
```

### Connection Flow

1. **User clicks** console icon for a VM.
2. **Client fetches VNC ticket** from Proxmox via API.
3. **Connects to WebSocket proxy** on Nuxt server (`/_ws/vnc`).
4. **Proxy connects to Proxmox** using the ticket.
5. **noVNC renders** graphic output in the browser.

### Proxy Server-Side Advantages

- ✅ **No separate Proxmox session**: User only needs Eye of Medina login.
- ✅ **No CORS/Certificate issues**: Server handles the connection.
- ✅ **Secure**: Credentials are never exposed to the browser.

### Console Features

- Full **Keyboard/Mouse** support.
- **Send Ctrl-Alt-Del** with one click.
- **Automatic scaling** of resolution.
- **Auto-reconnect** after disconnection.

---

## Composable `useProxmox()`

Utilities available in the frontend:

### Authentication

```typescript
const { login, loginWithToken, logout, isAuthenticated, username } = useProxmox()

// Login with credentials
await login('admin@pve', 'password', 'https://proxmox:8006')

// Login with token (recommended)
await loginWithToken('admin@pve!my-token', 'secret-uuid', 'https://proxmox:8006')

// Logout
logout()
```

### API Operations

```typescript
const { proxmoxRequest, listNodes, listPools, listVMResources } = useProxmox()

// Generic request
const result = await proxmoxRequest('/cluster/resources', 'GET')

// List nodes
const nodes = await listNodes()

// List VMs/CTs
const vms = await listVMResources()
```

### VM Management

```typescript
const { getVncTicket, updateMachineConfig, cloneMachine, deleteMachine } = useProxmox()

// Get VNC Ticket
const ticket = await getVncTicket('pve1', 'qemu', '100')

// Update configuration
await updateMachineConfig('pve1', '100', { name: 'new-name' })

// Clone VM
await cloneMachine('pve1', '100', { newid: 200, pool: 'production' })

// Delete VM
await deleteMachine('pve1', '100')
```

---

## Used Proxmox Endpoints

### Authentication and Permissions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/access/ticket` | POST | Get session ticket |
| `/access/users` | GET | List users |
| `/access/roles` | GET | List roles |
| `/access/acl` | GET | List ACLs |
| `/cluster/permissions` | GET | Current user permissions |

### Inventory

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes` | GET | List cluster nodes |
| `/cluster/resources` | GET | Resources (VMs, CTs, storage) |
| `/pools` | GET | List pools |
| `/pools/{poolid}` | GET/PUT | Manage specific pool |

### Virtual Machines/Containers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/qemu` | GET | List VMs on a node |
| `/nodes/{node}/lxc` | GET | List CTs on a node |
| `/nodes/{node}/{type}/{vmid}/config` | GET/PUT | VM/CT Configuration |
| `/nodes/{node}/{type}/{vmid}/status/{action}` | POST | Start/Stop/Shutdown |
| `/nodes/{node}/{type}/{vmid}/clone` | POST | Clone VM/CT |
| `/nodes/{node}/{type}/{vmid}` | DELETE | Delete VM/CT |
| `/nodes/{node}/{type}/{vmid}/vncproxy` | POST | Get VNC Ticket |
| `/nodes/{node}/{type}/{vmid}/vncwebsocket` | WebSocket | VNC Connection |

### Networks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/network` | GET | Node network interfaces |

### Storage

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/nodes/{node}/storage` | GET | List storages on a node |
| `/nodes/{node}/storage/{storage}/content` | GET | List files (ISOs, VZTemplates) |
| `/nodes/{node}/storage/{storage}/download-url` | POST | Download file from URL |

---

## Permission Best Practices

### Read-Only (Monitoring)

```
Role: PVEAuditor
Path: /
Propagate: Yes
```

### VM/CT Operations

```
Required Roles:
- VM.PowerMgmt (start/stop/shutdown)
- VM.Config.Options (rename, options)
- Pool.Allocate (change pool)

Paths: /pool/{pool-name} for each managed pool
```

### VNC Console

```
Required Roles:
- VM.Console (console access)
- VM.Audit (view status)

Path: /pool/{pool-name} or /vms/{vmid}
```

### Recommendations

1. **Prefer dedicated tokens** per application/user.
2. **Avoid using `root@pam`** in production.
3. **Enable Privilege Separation** on tokens to limit scope.
4. **Document granted permissions** for auditing.

---

## Testing Architecture

To maintain high stability, Eye of Medina is equipped with an integrated testing environment. 
Tests are split into two main layers that allow validating both isolated logic operations and complete Proxmox flows safely.

### 1. End-to-End (E2E) with Playwright
Validates full user journeys, interacting with the real DOM and mimicking user actions.
- Located in: `tests/e2e/`
- **Protected Routes**: We continuously test that unauthenticated users attempting to access protected dashboards (like `/dashboard`, `/machines`) are properly caught by the Nuxt Middleware and redirected to `/login`.
- **Nuxt Test Utils**: Leveraging `@nuxt/test-utils/playwright` to automatically boot the server and handle the routing context transparently.

### 2. Unit & Coverage with Vitest
Tests individual components, formatters, and `useProxmox` composables in an isolated environment.
- Located in: `tests/unit/`
- Environment: `happy-dom` provides a lightweight browser simulation.
- **Coverage (V8)**: Generates reports (`npm run test:coverage`) pointing accurately out of all your `.vue` and `.ts` files which branches/functions still need tests.
- *Note:* The Vitest configuration (`vitest.config.ts`) explicitly excludes E2E files to avoid environment collisions.

---

## Troubleshooting

### Error 401 Unauthorized

- ✅ Verify that token/secret are correct.
- ✅ Check the realm (pam, pve, ldap, etc.).
- ✅ Confirm the role has permissions on the resource.

### Certificate Error

- ✅ In development: set `ALLOW_INSECURE_TLS=true`.
- ✅ In production: use valid certificates (Let's Encrypt, etc.).

### No VMs/Data appearing

- ✅ Verify connectivity to port 8006.
- ✅ Check if `pveproxy` is active: `systemctl status pveproxy`.
- ✅ Check if `pveproxy` is active: `systemctl status pveproxy`.
- ✅ Review user/token permissions on the resources.

### Missing Host Metrics (CPU/RAM 0%)
- **Cause**: The user likely lacks `Sys.Audit` permission on `/nodes/{node}`.
- **Solution**: Grant `Sys.Audit` OR rely on the **Smart Fallback** feature (Eye of Medina will automatically sum VM usage instead).

### VNC Console not connecting

- ✅ Verify the VM is powered on.
- ✅ Check user has `VM.Console` permission.
- ✅ Review Nuxt server logs for proxy errors.

### Pool operations fail

- ✅ Confirm `Pool.Allocate` permission on target pool.
- ✅ Verify `VM.Config.*` for configuration changes.

---

## Resources

- **Proxmox VE API Reference**: https://pve.proxmox.com/pve-docs/api-viewer/
- **Token Management**: https://pve.proxmox.com/pve-docs/pveum-plain.html#pveum_tokens
- **Roles and Permissions**: https://pve.proxmox.com/wiki/User_Management
- **noVNC**: https://novnc.com/

---

<div align="center">

**Found an issue? Open an issue in the repository.**

</div>
