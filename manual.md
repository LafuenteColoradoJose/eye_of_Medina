# User Manual · Eye of Medina

Step-by-step guide to using the Proxmox VE monitoring and management dashboard.

---

## 📋 Table of Contents

1. [Accessing the Dashboard](#accessing-the-dashboard)
2. [Main Menu](#main-menu)
3. [Dashboard](#dashboard)
4. [Machine Management](#machine-management)
5. [VNC Console](#vnc-console)
6. [Network Management](#network-management)
7. [Identity Management](#identity-management)
8. [Customization](#customization)
9. [Common Errors](#common-errors)

---

## Accessing the Dashboard

### Login

1. Open your browser and navigate to the dashboard URL (e.g., `http://localhost:3000`).
2. Enter your Proxmox credentials:

#### Option A: With API Token (Recommended)

| Field | Example |
|-------|---------|
| Token ID | `admin@pve!eye-token` |
| Secret | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Host | `https://your-proxmox:8006` |

#### Option B: With Username/Password

| Field | Example |
|-------|---------|
| User | `admin@pve` |
| Password | `your-password` |
| Host | `https://your-proxmox:8006` |

3. Click **Login**.

> 💡 **Tip**: API Tokens do not expire and are safer for application use.

---

## Main Menu

The left sidebar provides access to all sections:

| Icon | Section | Description |
|------|---------|-------------|
| 📊 | Dashboard | Cluster overview |
| 🖥️ | Machines | VM and Container management |
| 🌐 | Networks | Network interfaces per node |
| 📦 | Pools | Resource groups |
| 👥 | Groups | User groups |
| 👤 | Users | User accounts |
| 🔐 | Roles | Permission roles |
| 📋 | ACL | Access Control Lists |
| 🌳 | Permissions | Permission tree |

At the bottom of the menu you will find:
- **Theme Selector** (🌙/☀️): Toggle between dark and light mode.
- **Logout**: End the current session.

---

## Dashboard

The dashboard displays a general overview of the cluster status.

### Top KPIs

Quick cluster metrics:
- **Total VMs**: Number of virtual machines.
- **Total CTs**: Number of containers.
- **Running**: Currently active VMs/CTs.
- **Active Bridges**: Network bridge interfaces.

### Charts

- **VM Status**: Distribution by status (running, stopped, etc.).
- **CPU per Node**: CPU usage on each node.
- **By Pools**: Distribution of VMs/CTs per pool.

### Top Consumers

List of VMs sorted by resource consumption (CPU/Memory). Includes three view modes selectable via tabs:

- **VM**: Shows usage % relative to the machine's assigned resources. Useful for detecting saturated VMs.
- **POOL**: Shows usage % relative to the total resources of the Pool it belongs to. Useful for spotting "noisy neighbors" in a group.
- **CLUSTER**: Shows usage % relative to the total physical server capacity. Useful for identifying who is consuming real infrastructure.

### Node Health

Status and metrics for each cluster node:
- CPU and Memory.
- Storage.
- Uptime.

### Task Log (Recent Tasks)

Access by clicking the **Recent Tasks** button in the side menu to open a sliding panel.
- Shows the history of cluster operations (backups, stops, starts).
- Updates in real-time while the panel is open.
- If you are not a global admin, you will only see tasks related to your user/accessible nodes.

### Data Refresh

Use the **Refresh** button in the top right corner to update data.

---

## Machine Management

Access via menu: **Machines**

### List and Filters

Use the top filters to find VMs/CTs:
- **Search**: By name or ID.
- **Type**: VM (QEMU) or CT (LXC).
- **Pool**: Filter by specific pool.
- **Status**: Running, stopped, etc.

### Available Actions

| Action | Description |
|--------|-------------|
| ▶️ Start | Power on the VM/CT |
| ⏹️ Stop | Force power off |
| ⏸️ Shutdown | Graceful shutdown |
| 🖥️ Console | Open VNC console |
| 📋 Clone | Duplicate the VM/CT |
| ✏️ Edit | Modify configuration |
| 🗑️ Delete | Delete (with confirmation) |

### Cloning a VM

1. Click the **Clone** button on the VM.
2. Fill out the form:
   - **New ID**: ID for the clone.
   - **Name**: Name of the clone.
   - **Target Pool**: Pool where the clone will be created.
3. Click **Clone**.

### Edit Configuration

1. Click **Edit** on the VM.
2. Modify fields:
   - **Name**: VM name.
   - **Pool**: Associated pool.
3. Save changes.

### Deleting a VM

1. Click **Delete**.
2. Confirm by typing the VM name.
3. Click **Delete Permanently**.

> ⚠️ **Warning**: This action is irreversible.

---

## VNC Console

The console allows remote access to a VM or container screen.

### Opening Console

1. In the machine list, click the 🖥️ icon of the VM.
2. Or navigate to `/console/{vmid}?node={node}&type={qemu|lxc}`.
3. The console will connect automatically.

### Console Controls

| Control | Function |
|---------|----------|
| **Send Ctrl-Alt-Del** | Sends the key combination |
| **Reconnect** | Restarts the connection |

### Interaction

- **Keyboard**: Type directly, keys are sent to the VM.
- **Mouse**: Click and move cursor inside the console.
- **Clipboard**: Ctrl+V to paste text (if VM supports it).

### Status Indicator

- 🟢 **Green**: Connected successfully.
- 🔴 **Red**: Disconnected or error.

### Troubleshooting

If console doesn't connect:
1. Verify VM is **powered on**.
2. Check your **session** in Eye of Medina.
3. Use the **Reconnect** button.

---

## Network Management

Access via menu: **Networks**

### Select Node

Use the top selector to choose the node to inspect.

### Interface Types

| Type | Description |
|------|-------------|
| **Bridge** | Virtual bridges (vmbr0, vmbr1...) |
| **Ethernet** | Physical interfaces (eth0, enp0s3...) |
| **Bond** | Link aggregation |
| **VLAN** | VLAN interfaces |

### Displayed Information

- **Name**: Interface identifier.
- **Status**: Active/Inactive.
- **Autostart**: If starts with system.
- **IP/Gateway**: Configured addressing.
- **Ports**: Associated interfaces (in bridges/bonds).

---

## Identity Management

### Pools

Pools group resources logically.

1. Go to **Pools**.
2. View existing pools.
3. Click a pool to see its resources.

### Groups

Groups group users.

1. Go to **Groups**.
2. View groups and members.

### Users

User account management.

1. Go to **Users**.
2. View users and their roles.

### Roles

Roles define permission sets.

1. Go to **Roles**.
2. Inspect available roles.
3. Click a role to view privileges.

### ACL

ACLs assign roles to paths.

1. Go to **ACL**.
2. View applied rules.
3. Filter by user, group, or path.

### Permission Tree

Consolidated view for auditing:

1. Go to **Permissions** (or Permissions Tree).
2. Navigate the hierarchical tree.
3. Identify which roles have access to each resource.

---

## Customization

### Dark/Light Mode

1. In the side menu, look for the theme icon (🌙/☀️).
2. Click to toggle.
3. Preference is saved automatically.

Or:
- Automatic detection of OS preference.

---

## Common Errors

### "401 Unauthorized"

**Cause**: Invalid credentials or no permissions.

**Solution**:
- Verify token/secret or username/password.
- Check realm (pam, pve, ldap).
- Confirm you have permissions on resources.

### "Invalid Certificate"

**Cause**: Proxmox uses self-signed certificate.

**Solution**:
- In dev: Accept certificate in browser.
- In prod: Use valid certificates.

### "No Data Appearing"

**Cause**: Connectivity or permission issues.

**Solution**:
- Verify `PROXMOX_HOST` is correct.
- Check connectivity to port 8006.
- Check user read permissions.

### "Console Not Connecting"

**Cause**: VM powered off or insufficient permissions.

**Solution**:
- Ensure VM is powered on.
- Verify `VM.Console` permission.
- Use **Reconnect** button.

### "Clone/Delete Error"

**Cause**: Insufficient permissions on resource.

**Solution**:
- Verify `Pool.Allocate` on target pool.
- Confirm `VM.Clone` and `VM.Allocate`.

---

## Shortcuts and Tips

| Action | Tip |
|--------|-----|
| Navigation | Use side menu to move between sections |
| Search | Filters apply in real-time |
| Refresh | Updates data from server |
| Console | Click inside console to capture keyboard |
| Theme | Dark mode reduces eye strain |

---

<div align="center">

**Need help? Check the [technical guide](Eye_of_Medina.md) or open an issue.**

</div>
