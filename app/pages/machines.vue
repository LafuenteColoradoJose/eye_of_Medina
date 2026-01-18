<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/attributes-order -->
<template>
  <div class="p-6 max-w-[1920px] mx-auto space-y-6">

    <!-- Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-text">Máquinas Virtuales</h1>
        <p class="text-text-muted text-sm mt-1">Gestión y monitorización de instancias QEMU y LXC</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadInitial"
          class="px-4 py-2 rounded-lg bg-card border border-border text-text hover:bg-muted-surface transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            :class="{ 'animate-spin': loadingList }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Refrescar
        </button>
        <!-- Protected Action: Only if VM.Allocate or Admin -->
        <button v-if="canCreate" @click="openCreateModal"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong transition-colors flex items-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Nueva / Clonar
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4">
      <div class="flex-1 relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" placeholder="Buscar por nombre, ID o IP..."
          class="w-full pl-14 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          style="padding-left: 3.5rem" />
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="filterType"
          class="px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">Todos los tipos</option>
          <option value="qemu">VM (QEMU)</option>
          <option value="lxc">Container (LXC)</option>
        </select>
        <select v-model="filterStatus"
          class="px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">Todos los estados</option>
          <option value="running">Ejecutando</option>
          <option value="stopped">Detenido</option>
        </select>
        <select v-model="filterPool"
          class="px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">Todos los pools</option>
          <option value="none">Sin pool</option>
          <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
    </div>

    <!-- Machines Grid / Cards -->
    <div v-if="loadingList" class="py-12 flex justify-center text-text-muted">
      <!-- Loading Spinner -->
      <div class="flex flex-col items-center gap-2">
        <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-sm">Cargando máquinas...</span>
      </div>
    </div>

    <div v-else-if="filteredMachines.length === 0"
      class="py-12 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <p class="text-lg font-medium">No se encontraron máquinas</p>
      <p class="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <div v-for="m in filteredMachines" :key="m.vmid"
        class="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
        <!-- Card Header -->
        <div class="px-4 py-3 border-b border-border bg-muted-surface/30 flex justify-between items-center">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="relative shrink-0">
              <span class="block w-3 h-3 rounded-full"
                :class="m.status === 'running' ? 'bg-positive' : 'bg-muted'"></span>
              <span v-if="m.status === 'running'"
                class="absolute -inset-1 rounded-full bg-positive opacity-20 animate-ping"></span>
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-text truncate text-sm" :title="m.name">{{ m.name || `VM ${m.vmid}` }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded border border-border uppercase bg-background text-text-muted">{{
                    m.type }}</span>
              </div>
              <span class="text-xs text-text-muted font-mono flex items-center gap-2">
                ID {{ m.vmid }} <span class="w-1 h-1 rounded-full bg-border"></span> {{ m.node }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Console: Only if VM.Console -->
            <button v-if="canOpenConsole(m)" @click="openConsole(m)" title="Abrir Consola"
              class="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
            <!-- Edit: Only if VM.Config.Options -->
            <button v-if="canConfigure(m)" @click="openEdit(m)" title="Configuración"
              class="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-warning transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>CPU</span> <span class="font-mono">{{ toPercent(m.cpu, 1) }}</span>
            </div>
            <div class="h-1.5 w-full bg-muted-surface rounded-full overflow-hidden">
              <div class="h-full bg-primary transition-all duration-500" :style="{ width: toPercent(m.cpu, 1) }"></div>
            </div>
            <div class="flex items-center justify-between text-xs text-text-muted mb-1 mt-2">
              <span>RAM</span> <span class="font-mono">{{ toPercent(m.mem, m.maxmem) }}</span>
            </div>
            <div class="h-1.5 w-full bg-muted-surface rounded-full overflow-hidden">
              <div class="h-full bg-accent transition-all duration-500" :style="{ width: toPercent(m.mem, m.maxmem) }">
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
            <div class="bg-muted-surface/50 rounded p-1.5 text-center">
              <span class="block text-text-muted text-[10px] uppercase">Uptime</span>
              <span class="font-medium text-text">{{ formatUptime(m.uptime) }}</span>
            </div>
            <div class="bg-muted-surface/50 rounded p-1.5 text-center">
              <span class="block text-text-muted text-[10px] uppercase">Pool</span>
              <span class="font-medium text-text truncate" :title="m.pool">{{ m.pool || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Card Actions - Protected by Permissions -->
        <div class="px-4 py-3 bg-muted-surface/20 flex justify-between items-center gap-2">
          <!-- Power Controls: Only if VM.PowerMgmt -->
          <div v-if="canManagePower(m)" class="flex gap-2 w-full">
            <button v-if="m.status !== 'running'" @click="changePowerState(m, 'start')"
              :disabled="actionLoading === m.vmid"
              class="flex-1 py-1.5 rounded bg-positive/10 text-positive hover:bg-positive/20 text-xs font-bold transition-colors flex justify-center items-center gap-1">
              <svg v-if="actionLoading === m.vmid" class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".3" />
                <path fill="currentColor" d="M20 12h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Iniciar
            </button>
            <button v-else @click="changePowerState(m, 'shutdown')" :disabled="actionLoading === m.vmid"
              class="flex-1 py-1.5 rounded bg-warning/10 text-warning hover:bg-warning/20 text-xs font-bold transition-colors flex justify-center items-center gap-1">
              <svg v-if="actionLoading === m.vmid" class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".3" />
                <path fill="currentColor" d="M20 12h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Apagar
            </button>
            <button @click="changePowerState(m, 'stop')" title="Forzar Parada" :disabled="actionLoading === m.vmid"
              class="px-2 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </button>
          </div>
          <!-- If no permissions, show message or nothing -->
          <div v-else class="w-full text-center py-1.5 text-xs text-text-muted italic bg-muted-surface/10 rounded">
            Solo lectura
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Modal and Edit Modal kept but guarded -->
  <!-- CREATE / CLONE MODAL -->
  <div v-if="showCreateModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="closeCreateModal">
    <div
      class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">

      <!-- Header with Tabs -->
      <div class="p-0 border-b border-border bg-muted-surface/30">
        <div class="flex items-center justify-between p-4 pb-0">
          <h2 class="text-xl font-bold text-text mb-4">{{ modalTitle }}</h2>
          <button @click="closeCreateModal" class="text-text-muted hover:text-text mb-4"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg></button>
        </div>
        <!-- Tabs -->
        <div class="flex border-b border-border px-4">
          <button @click="createMode = 'new'"
            class="px-4 py-2 text-sm font-bold border-b-2 transition-colors duration-200"
            :class="createMode === 'new' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'">
            Crear desde Cero
          </button>
          <button @click="createMode = 'clone'"
            class="px-4 py-2 text-sm font-bold border-b-2 transition-colors duration-200"
            :class="createMode === 'clone' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'">
            Clonar
          </button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <!-- === TAB 1: NEW MACHINE === -->
        <form v-if="createMode === 'new'" @submit.prevent="handleCreateNew"
          class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Node Selection (First step usually) -->
          <div class="col-span-1 md:col-span-2">
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nodo</label>
            <select v-model="newForm.node" @change="fetchNodeStorage"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text"
              required>
              <option value="" disabled>Selecciona un nodo...</option>
              <option v-for="n in nodes" :key="n.node" :value="n.node">{{ n.node }}</option>
            </select>
          </div>

          <!-- Type & ID -->
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Tipo</label>
            <select v-model="newForm.type"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option value="qemu">VM (QEMU)</option>
              <option value="lxc">Contenedor (LXC)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">ID (vmid)</label>
            <input v-model.number="newForm.vmid" type="number" min="100" placeholder="Ej. 105"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"
              required />
          </div>

          <!-- Name & Pool -->
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre</label>
            <input v-model="newForm.name" type="text" placeholder="Ej. WebServer"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"
              required />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Pool</label>
            <select v-model="newForm.pool"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option value="">Sin pool</option>
              <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <!-- ISO / Template Selector -->
          <div class="col-span-1 md:col-span-2 border-t border-border pt-4 mt-2">
            <h3 class="text-sm font-bold text-text mb-3">Imagen del Sistema</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Almacenamiento</label>
                <select v-model="newForm.isoStorage" @change="fetchContent" :disabled="!newForm.node"
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text disabled:opacity-50">
                  <option value="">Selección...</option>
                  <option v-for="s in availableStorages" :key="s.storage" :value="s.storage">{{ s.storage }} ({{
                    s.content }})</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">{{ newForm.type === 'qemu' ?
                  'ISO Image' : 'Template (tar.gz)' }}</label>
                <select v-model="newForm.isoFile" :disabled="!newForm.isoStorage"
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text disabled:opacity-50">
                  <option value="">Selección...</option>
                  <option v-for="file in availableIsos" :key="file.volid" :value="file.volid">{{
                    file.volid.split('/').pop() }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Resources -->
          <div class="col-span-1 md:col-span-2 border-t border-border pt-4 mt-2">
            <h3 class="text-sm font-bold text-text mb-3">Recursos</h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Memoria (MB)</label>
                <input v-model.number="newForm.memory" type="number" step="128" min="128"
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
              </div>
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Cores (CPU)</label>
                <input v-model.number="newForm.cores" type="number" min="1" max="32"
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
              </div>
              <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Disco (GB)</label>
                <input v-model.number="newForm.diskSize" type="number" min="1"
                  class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text" />
              </div>
            </div>

            <!-- Storage for Desk/Rootfs -->
            <div class="mt-4">
              <label class="block text-xs font-bold text-text-muted uppercase mb-1">Almacenamiento de Disco</label>
              <select v-model="newForm.storage" :disabled="!newForm.node"
                class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text disabled:opacity-50">
                <option value="local-lvm">local-lvm (Default)</option>
                <option v-for="s in availableStorages" :key="s.storage + '_disk'" :value="s.storage">{{ s.storage }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button type="button" @click="closeCreateModal"
              class="px-5 py-2.5 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
            <button type="submit" :disabled="saving"
              class="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
              <svg v-if="saving" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Crear Máquina
            </button>
          </div>
        </form>

        <!-- === TAB 2: CLONE (Existing Form) === -->
        <form v-else @submit.prevent="handleClone" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="col-span-1 md:col-span-2 bg-primary/10 border border-primary/20 text-text p-3 rounded-lg text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="text-primary mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>Clonarás una máquina existente. Asegúrate de que la VM origen está apagada para mejores resultados.</p>
          </div>
          <!-- ... Clone Form Fields (kept from before but cleaned up) ... -->
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nodo Origen</label>
            <select v-model="cloneForm.sourceNode"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option v-for="n in nodes" :key="n.node" :value="n.node">{{ n.node }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">ID Origen</label>
            <input v-model.number="cloneForm.sourceId" type="number"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"
              required />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre Nuevo</label>
            <input v-model.number="cloneForm.name" type="text"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"
              required />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nuevo ID</label>
            <input v-model.number="cloneForm.newId" type="number"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50"
              required />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Tipo</label>
            <select v-model="cloneForm.type"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option value="qemu">VM (QEMU)</option>
              <option value="lxc">CT (LXC)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Pool</label>
            <select v-model="cloneForm.pool"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option value="">Sin pool</option>
              <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div class="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button type="button" @click="closeCreateModal"
              class="px-5 py-2.5 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
            <button type="submit" :disabled="saving"
              class="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
              {{ saving ? 'Clonando...' : 'Clonar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Edit Modal (kept same) -->
  <div v-if="editingMachine"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="closeEdit">
    <div
      class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in duration-200">
      <div class="p-5 border-b border-border flex justify-between items-center bg-muted-surface/30">
        <div>
          <h2 class="text-xl font-bold text-text">Configurar Máquina</h2>
          <p class="text-xs text-text-muted mt-0.5">ID {{ editingMachine.vmid }}</p>
        </div>
        <button @click="closeEdit" class="text-text-muted hover:text-text"><svg xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg></button>
      </div>
      <div class="p-6 space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nombre</label>
            <input v-model="editForm.name" type="text"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text placeholder:text-text-muted/50" />
          </div>
          <div>
            <label class="block text-xs font-bold text-text-muted uppercase mb-1">Pool</label>
            <select v-model="editForm.pool"
              class="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-text">
              <option value="">Sin pool</option>
              <option v-for="p in pools" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>
        <div class="pt-6 border-t border-border/50">
          <div v-if="canDelete(editingMachine)">
            <h3 class="text-xs font-bold text-danger uppercase mb-2">Zona de Peligro</h3>
            <div class="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between gap-4">
              <div class="text-sm text-text-muted">
                <p class="font-medium text-text">Eliminar esta máquina</p>
                <p class="text-xs">Irreversible.</p>
              </div>
              <button @click="handleDelete"
                class="px-3 py-1.5 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded shadow-sm transition-colors">Eliminar</button>
            </div>
          </div>
          <div v-else class="text-xs text-text-muted italic text-center">
            No tienes permisos para eliminar esta máquina.
          </div>
        </div>
      </div>
      <div class="p-5 border-t border-border bg-muted-surface/30 flex justify-end gap-3 rounded-b-xl">
        <button @click="closeEdit"
          class="px-4 py-2 rounded-lg border border-border text-text hover:bg-muted-surface font-medium transition-colors">Cancelar</button>
        <button @click="handleUpdate" :disabled="saving"
          class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-strong font-bold transition-colors">Guardar</button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
useHead({ title: 'Máquinas Virtuales' })
import { ref, computed, onMounted, watch } from 'vue'

// -- Types --
type Machine = { vmid: number; name?: string; node: string; type: 'qemu' | 'lxc'; status?: string; pool?: string; uptime?: number; cpu?: number; maxcpu?: number; mem?: number; maxmem?: number }

type CloneForm = { type: 'qemu' | 'lxc'; sourceNode: string; sourceId: number | null; targetNode: string | null; newId: number | null; name: string; pool: string }
type NewForm = { node: string; type: 'qemu' | 'lxc'; vmid: number | null; name: string; pool: string; isoStorage: string; isoFile: string; memory: number; cores: number; diskSize: number; storage: string }

// -- Composable --
const router = useRouter()
const { isAuthenticated, restoreSession, listVMResources, listPools, listNodes, updateMachineConfig, deleteMachine, cloneMachine, addVmToPool, setMachineStatus, listStorages, listStorageContent, createQemu, createLxc, hasPermission, isClusterAdmin, userPermissions } = useProxmox()

// -- State --
const machines = ref<Machine[]>([])
const pools = ref<string[]>([])
const nodes = ref<{ node: string }[]>([])

const loadingList = ref(false)
const saving = ref(false)
const actionLoading = ref<number | string | null>(null)

// Create/Clone Modal State
const showCreateModal = ref(false)
const createMode = ref<'new' | 'clone'>('new')

const cloneForm = ref<CloneForm>({ type: 'qemu', sourceNode: '', sourceId: null, targetNode: null, newId: null, name: '', pool: '' })
const newForm = ref<NewForm>({ node: '', type: 'qemu', vmid: null, name: '', pool: '', isoStorage: '', isoFile: '', memory: 2048, cores: 2, diskSize: 32, storage: 'local-lvm' })

const availableStorages = ref<{ storage: string, content: string }[]>([])
const availableIsos = ref<{ volid: string, size: number }[]>([])

// Edit State
const editingMachine = ref<Machine | null>(null)
const editForm = ref({ name: '', pool: '' })

// Filters
const search = ref('')
const filterType = ref('all')
const filterStatus = ref('all')
const filterPool = ref('all')

// -- Lifecycle --

let pollInterval: NodeJS.Timeout | null = null

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) {
    loadInitial()
    // Start polling every 5 seconds
    pollInterval = setInterval(() => {
      // Background update: silent refresh (no loading spinner)
      listVMResources().then(res => {
        if (res.success && res.data) {
          machines.value = (res.data as Machine[]).filter(m => m.type === 'qemu' || m.type === 'lxc')
        }
      })
    }, 5000)
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const loadInitial = async () => { await Promise.all([loadMachines(), loadPoolsList(), loadNodesList()]) }
const loadMachines = async () => { loadingList.value = true; const res = await listVMResources(); loadingList.value = false; if (res.success && res.data) machines.value = (res.data as Machine[]).filter(m => m.type === 'qemu' || m.type === 'lxc') }
const loadPoolsList = async () => { const res = await listPools(); if (res.data) pools.value = (res.data as any).map((p: any) => p.poolid) }
const loadNodesList = async () => { const res = await listNodes(); if (res.data) nodes.value = res.data as any }

// -- Permissions Helpers --
const canCreate = computed(() => isClusterAdmin.value || hasPermission('VM.Allocate'))

const canManagePower = (m: Machine) => isClusterAdmin.value || hasPermission('VM.PowerMgmt', `/vms/${m.vmid}`, m.pool)
const canOpenConsole = (m: Machine) => isClusterAdmin.value || hasPermission('VM.Console', `/vms/${m.vmid}`, m.pool)
// Config options usually require VM.Config.Options. Disk requires VM.Config.Disk, etc.
const canConfigure = (m: Machine) => isClusterAdmin.value || hasPermission('VM.Config.Options', `/vms/${m.vmid}`, m.pool)
const canDelete = (m: Machine) => isClusterAdmin.value || hasPermission('VM.Allocate', `/vms/${m.vmid}`, m.pool)

// -- Data Fetching for New Machine --
const fetchNodeStorage = async () => {
  availableStorages.value = []
  if (!newForm.value.node) return
  const res = await listStorages(newForm.value.node)
  if (res.success && Array.isArray(res.data)) {
    // Filter storages that support ISO or Templates
    availableStorages.value = res.data.filter((s: any) => s.content.includes('iso') || s.content.includes('vztmpl'))
  }
}

const fetchContent = async () => {
  availableIsos.value = []
  if (!newForm.value.node || !newForm.value.isoStorage) return
  // Determine if we need ISO or Template based on type
  const contentType = newForm.value.type === 'qemu' ? 'iso' : 'vztmpl'
  const res = await listStorageContent(newForm.value.node, newForm.value.isoStorage, contentType)
  if (res.success && Array.isArray(res.data)) {
    availableIsos.value = res.data
  }
}

// -- Computed --
const filteredMachines = computed(() => {
  return machines.value.filter(m => {
    if (filterType.value !== 'all' && m.type !== filterType.value) return false
    if (filterStatus.value !== 'all' && m.status !== filterStatus.value) return false
    if (filterPool.value === 'none' && m.pool) return false
    if (filterPool.value !== 'all' && m.pool !== filterPool.value) return false
    if (!search.value) return true
    const term = search.value.toLowerCase()
    return (m.name?.toLowerCase().includes(term) || String(m.vmid).includes(term) || m.node.toLowerCase().includes(term))
  })
})

const modalTitle = computed(() => createMode.value === 'new' ? 'Crear Nueva Máquina' : 'Clonar Existente')

const toPercent = (v: any, m: any) => (v && m) ? Math.round((v / m) * 100) + '%' : '0%'
const formatUptime = (s: any) => s ? (Math.floor(s / 86400) + 'd ' + Math.floor((s % 86400) / 3600) + 'h') : '—'

const changePowerState = async (m: Machine, a: any) => {
  if (!canManagePower(m)) return alert('No tienes permisos de energía sobre esta máquina.')

  // Optimistic UI / Spinner start
  actionLoading.value = m.vmid

  await setMachineStatus(m.node, m.type, m.vmid, a)

  // We don't wait 2s anymore. We reload once immediately to check, 
  // but the background poller will handle the eventual state change.
  await loadMachines()
  actionLoading.value = null
}
const openConsole = (m: Machine) => {
  if (!canOpenConsole(m)) return alert('No tienes permisos de consola.')
  // Open in new window for better experience
  const url = `/console/${m.vmid}?node=${m.node}&type=${m.type}`
  window.open(url, `console-${m.vmid}`, 'width=1024,height=768,resizable=yes,scrollbars=no')
}

const openCreateModal = () => { if (!canCreate.value) return; showCreateModal.value = true; createMode.value = 'new' }
const closeCreateModal = () => { showCreateModal.value = false }

const handleCreateNew = async () => {
  // ... same ...
  if (!newForm.value.node || !newForm.value.vmid) return alert('Datos incompletos')
  saving.value = true

  // Basic payload
  const payload: any = {
    vmid: newForm.value.vmid,
    name: newForm.value.name,
    memory: newForm.value.memory,
    cores: newForm.value.cores,
    pool: newForm.value.pool || undefined,
    storage: newForm.value.storage
  }

  let res;
  if (newForm.value.type === 'qemu') {
    // VM Specifics
    if (newForm.value.isoFile) payload.cdrom = newForm.value.isoFile
    // Disk handling needs 'scsi0' or 'virtio0' string like "storage:size"
    // Simplification: use basic args. Proxmox API is "scsi0: local-lvm:32"
    payload.scsi0 = `${newForm.value.storage}:${newForm.value.diskSize}`
    payload.net0 = 'virtio,bridge=vmbr0' // Default net
    res = await createQemu(newForm.value.node, payload)
  } else {
    // CT Specifics
    payload.ostemplate = newForm.value.isoFile
    payload.rootfs = `${newForm.value.storage}:${newForm.value.diskSize}`
    payload.net0 = 'name=eth0,bridge=vmbr0,ip=dhcp' // Basic net
    res = await createLxc(newForm.value.node, payload)
  }

  saving.value = false
  if (!res.success) alert('Error: ' + res.message)
  else { closeCreateModal(); loadMachines() }
}

const handleClone = async () => {
  if (!cloneForm.value.sourceId || !cloneForm.value.newId) return
  saving.value = true
  const res = await cloneMachine(cloneForm.value.sourceNode, cloneForm.value.type, cloneForm.value.sourceId, { newid: cloneForm.value.newId, name: cloneForm.value.name, pool: cloneForm.value.pool, target: cloneForm.value.targetNode })
  saving.value = false
  if (!res.success) alert('Error: ' + res.message)
  else { closeCreateModal(); loadMachines() }
}

// Edit handlers
const openEdit = (m: Machine) => {
  if (!canConfigure(m)) return alert('No tienes permisos de edición.')
  editingMachine.value = m; editForm.value = { name: m.name || '', pool: m.pool || '' }
}
const closeEdit = () => editingMachine.value = null
const handleUpdate = async () => {
  if (!editingMachine.value) return
  saving.value = true
  const m = editingMachine.value
  if (editForm.value.name !== m.name) await updateMachineConfig(m.node, m.type, m.vmid, m.type === 'qemu' ? { name: editForm.value.name } : { hostname: editForm.value.name })
  if (editForm.value.pool !== m.pool) await addVmToPool(editForm.value.pool, m.vmid)
  saving.value = false; closeEdit(); loadMachines()
}
const handleDelete = async () => {
  if (!editingMachine.value || !confirm('Seguro?')) return
  await deleteMachine(editingMachine.value.node, editingMachine.value.type, editingMachine.value.vmid)
  closeEdit(); loadMachines()
}
</script>
