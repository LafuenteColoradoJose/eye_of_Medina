# Eye of Medina

<div align="center">

![Eye of Medina](public/Logo_Eye_of_Medina.svg)

**Modern Web Dashboard for Proxmox VE Monitoring and Management**

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Features

### Dashboard 2.0
- **High Density Layout**: 4-column grid optimized for large screens (`KPIs` + `State` + `Storage` + `CPU` + `Network`).
- **Real-time Metrics**: Live monitoring of **CPU Cluster**, **Global Storage**, and **Network Traffic** (Mbps).
- **Interactive Charts**: VM status donut, storage capacity, and historical trends.
- **Top Consumers**: Detailed resource consumption analysis (CPU/RAM) with **VM**, **Pool**, and **Cluster** views.
- **Node Health**: Health status and metrics for each cluster node.
- **Task Log (Tasks Drawer)**: Sliding side panel with real-time cluster task history.

### Storage Management (NEW!)
- **ISO & Templates**: Browse and manage content across all cluster storage.
- **Download from URL**: Directly download ISOs/Images to Proxmox storage nodes.
- **Visual Browsing**: Filter by content type (ISO, Backup, CT Template, Snippet).

### Virtual Machine Management
- **Advanced Filtering**: By name, ID, type, and pool.
- **Cloning**: Clone VMs/CTs with destination pool selection.
- **Editing**: Modify names, hostname, and pool assignment.
- **Start/Stop/Shutdown**: With safety confirmation.
- **Secure Deletion**: With double confirmation.

### 🖥️ Integrated VNC Console (NEW!)
- **Direct Console Access**: Connect to VMs and containers directly from the browser.
- **Server-side WebSocket Proxy**: Secure connection without requiring a separate Proxmox session.
- **noVNC based**: Full keyboard and mouse support.
- **Send Ctrl-Alt-Del**: One-click action.
- **Auto-reconnect**: Semantic handling of connection drops.

### Network Management
- **Smart IP Zones**: Visualization of L3 Networks with active IPs.
- **Visual IP Cards**: interactive cards for IPv4/IPv6 with "Click-to-Copy".
- **Physical Hierarchy**: Visual path from logical interface to physical cable.
- **Node Visualization**: Separation between Addressing (L3) and Infrastructure (L2/L1).

### Identity & Access Management (IAM)
- **Pools, Groups, Users, Roles, and ACLs Management**.
- **Permission Tree**: Visual audit of effective permissions.
- **Proxmox Alignment**: Fully aligned with the PVE permission model.

### User Experience
- **Dark/Light Mode**: With automatic detection.
- **Responsive Design**: Optimized for desktop and tablets.
- **Smooth Transitions**: Fluid page navigation.

---

## 🚀 Installation

### Prerequisites
- Node.js 20+
- HTTPS access to the Proxmox host (port 8006)

### Environment Variables

```env
# URL of your Proxmox server
NUXT_PUBLIC_PROXMOX_HOST=https://your-proxmox:8006

# Development only (for self-signed certificates)
ALLOW_INSECURE_TLS=true
```

### Setup

```bash
# Install dependencies
npm install

# Development Server
npm run dev

# Production Build
npm run build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## 🏗️ Architecture

```
eye_of_Medina/
├── app/
│   ├── pages/           # Application pages
│   │   ├── console/     # Integrated VNC Console
│   │   ├── machines/    # VM/CT Management
│   │   └── ...
│   ├── components/      # Reusable components
│   ├── composables/     # Shared logic (useProxmox, etc.)
│   └── assets/          # CSS and static assets
├── server/
│   ├── api/proxmox/     # Proxmox API Proxy
│   └── routes/_ws/      # VNC WebSocket Proxy
└── nuxt.config.ts       # Nuxt Configuration
```

### Key Technologies
- **Nuxt 4** with Nitro server
- **Vue 3** Composition API
- **TypeScript** for static typing
- **TailwindCSS 4** for styling
- **noVNC** for remote console
- **Native WebSocket** (Nitro) for VNC proxying

---

## 📖 Documentation

- [Proxmox Integration Guide](Eye_of_Medina.md) - Authentication, permissions, and API.
- [User Manual](manual.md) - Dashboard usage guide.

---

## 🔐 Authentication

### API Token (Recommended)
```
Token ID: user@realm!token-name
Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Username/Password
```
User: user@pam or user@pve
Password: your-password
```

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'feat: Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Developed with ❤️ for the Proxmox community**

</div>
