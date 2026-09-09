<template>
  <div class="devices-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" class="busgo-snackbar">
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><v-icon size="21">mdi-devices</v-icon></div>
        <div><h1 class="page-title">Dispositivos</h1><p class="page-subtitle">Administra terminales y equipos asociados a las sucursales</p></div>
      </div>
      <v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAdd">Agregar dispositivo</v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-devices</v-icon></div><div><div class="summary-value">{{ devices.length }}</div><div class="summary-label">Total de dispositivos</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-check-circle-outline</v-icon></div><div><div class="summary-value">{{ activeDevices }}</div><div class="summary-label">Dispositivos activos</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--slate"><v-icon size="19">mdi-pause-circle-outline</v-icon></div><div><div class="summary-value">{{ inactiveDevices }}</div><div class="summary-label">Dispositivos inactivos</div></div></div></v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div><div class="section-title">Listado de dispositivos</div><div class="section-subtitle">{{ registeredCountText }}</div></div>
          <div class="toolbar-filters">
            <v-autocomplete
              v-if="mostrarFila"
              v-model="branch_id"
              :items="branches"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-store-outline"
              placeholder="Sucursal"
              no-data-text="No hay sucursales disponibles"
              hide-details
              class="branch-filter"
              @update:model-value="onBranchChange"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :prepend-avatar="branchImage(item.raw)" :title="item.raw.name" />
              </template>
            </v-autocomplete>
            <v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar dispositivo..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable />
          </div>
        </div>
        <v-divider />

        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="devices"
          :search="search"
          :loading="loading"
          :custom-key-sort="customKeySort"
          :hide-default-header="false"
          sort-asc-icon="mdi-arrow-up"
          sort-desc-icon="mdi-arrow-down"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay dispositivos disponibles"
          loading-text="Cargando dispositivos..."
          class="devices-table"
        >
          <template #loading><v-skeleton-loader type="table-row@5" /></template>

          <template #[`item.name`]="{ item }">
            <div class="device-name-cell">
              <div class="device-avatar">
                <v-img
                  v-if="hasDeviceImage(item)"
                  :src="deviceImage(item)"
                  class="device-photo"
                  width="34"
                  height="34"
                  cover
                >
                  <template #error><div class="image-fallback"><v-icon size="17">mdi-cellphone</v-icon></div></template>
                </v-img>
                <v-icon v-else size="17">mdi-cellphone</v-icon>
              </div>
              <div class="cell-copy"><div class="device-name">{{ item.name || "Sin nombre" }}</div>
            
            </div>
            </div>
          </template>

          <template #[`item.mac`]="{ item }"><span class="technical-value">{{ item.mac || "Sin MAC" }}</span></template>
          <template #[`item.serial`]="{ item }">
          <div class="technical-value">{{ item.serial || "Sin serie" }}</div>
          </template>
   <template #[`item.version`]="{ item }">
          <span class="android-badge"><v-icon size="14">mdi-android</v-icon>{{ item.version || "N/D" }}</span>
          </template>

          <template #[`item.acquisition`]="{ item }"><span class="date-value">{{ formatDisplayDate(item.acquisition) }}</span></template>
          <template #[`item.maintenance`]="{ item }"><span class="date-value">{{ formatDisplayDate(item.maintenance) }}</span></template>
          <template #[`item.status`]="{ item }"><span class="status-badge" :class="Number(item.status) === 1 ? 'status-badge--active' : 'status-badge--inactive'"><span class="status-dot" />{{ Number(item.status) === 1 ? "Activo" : "Inactivo" }}</span></template>
          <template #[`item.notes`]="{ item }"><div class="description-cell" :title="item.notes">{{ item.notes || "Sin descripción" }}</div></template>
          <template #[`item.actions`]="{ item }">
            <div class="action-buttons">
              <v-tooltip text="Editar dispositivo" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip>
              <v-tooltip text="Eliminar dispositivo" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Los dispositivos activos pueden operar con los servicios habilitados para su sucursal.</div>
      </v-card>
    </v-container>

    <!-- Diálogo interno: crear o editar -->
    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-form ref="form" v-model="valid" enctype="multipart/form-data" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading"><div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-cellphone</v-icon><v-icon class="dialog-icon-action" size="11">{{ editedIndex === -1 ? "mdi-plus" : "mdi-pencil" }}</v-icon></div><div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">{{ editedIndex === -1 ? "Registra un nuevo equipo operativo" : "Actualiza la información del dispositivo" }}</div></div></div>
            <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
          </div>
          <v-divider />

          <v-card-text class="dialog-body">
            <div class="form-section-label">Información general</div>
            <v-row dense>
              <v-col v-if="mostrarFila" cols="12" md="6">
                <v-autocomplete
                  v-model="editedItem.branch_id"
                  :items="branches"
                  item-title="name"
                  item-value="id"
                  label="Sucursal"
                  prepend-inner-icon="mdi-store-outline"
                  variant="outlined"
                  density="comfortable"
                  no-data-text="No hay sucursales disponibles"
                  :rules="selectRules"
                  :disabled="editedIndex !== -1"
                >
                  <template #item="{ props, item }"><v-list-item v-bind="props" :prepend-avatar="branchImage(item.raw)" :title="item.raw.name" /></template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" :md="mostrarFila ? 6 : 12"><v-text-field v-model.trim="editedItem.name" label="Nombre del dispositivo" placeholder="Ej.: Terminal boletería 01" prepend-inner-icon="mdi-devices" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" counter="50" clearable /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.mac" label="Dirección MAC" placeholder="AA:BB:CC:DD:EE:FF" prepend-inner-icon="mdi-lan" variant="outlined" density="comfortable" :rules="macRules" clearable /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.serial" label="Número de serie" placeholder="Serie del fabricante" prepend-inner-icon="mdi-barcode" variant="outlined" density="comfortable" :rules="serialRules" clearable /></v-col>
            </v-row>

            <div class="form-section-label form-section-label--spaced">Configuración y control</div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" min-width="290">
                  <template #activator="{ props }"><v-text-field v-bind="props" :model-value="dateFormatted" label="Fecha de adquisición" prepend-inner-icon="mdi-calendar-outline" variant="outlined" density="comfortable" readonly /></template>
                  <v-locale-provider locale="es"><v-date-picker :model-value="input" title="Fecha de adquisición" color="primary" :max="today" @update:model-value="updateDate" /></v-locale-provider>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4">
                <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition" min-width="290">
                  <template #activator="{ props }"><v-text-field v-bind="props" :model-value="dateFormatted2" label="Fecha de mantenimiento" prepend-inner-icon="mdi-tools" variant="outlined" density="comfortable" readonly /></template>
                  <v-locale-provider locale="es"><v-date-picker :model-value="input2" title="Fecha de mantenimiento" color="primary" :min="input || undefined" @update:model-value="updateDate1" /></v-locale-provider>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4"><v-text-field v-model.trim="editedItem.version" label="Versión de Android" placeholder="Ej.: 11.0" prepend-inner-icon="mdi-android" variant="outlined" density="comfortable" :rules="androidVersionRules" clearable /></v-col>
              <v-col cols="12"><v-textarea v-model.trim="editedItem.notes" label="Descripción" placeholder="Información útil sobre el equipo" prepend-inner-icon="mdi-text-box-outline" variant="outlined" density="comfortable" rows="2" auto-grow clearable /></v-col>
            </v-row>

            <div class="status-control">
              <div><div class="status-control-title">Estado del dispositivo</div><div class="status-control-description">Los dispositivos inactivos no estarán disponibles para la operación.</div></div>
              <div class="status-switch" :class="Number(editedItem.status) === 1 ? 'is-active' : 'is-inactive'"><span>{{ Number(editedItem.status) === 1 ? "Activo" : "Inactivo" }}</span><v-switch v-model="editedItem.status" :true-value="1" :false-value="0" color="success" hide-details inset /></div>
            </div>

            <div class="form-section-label form-section-label--spaced">Imagen del dispositivo</div>
            <div class="image-upload-area">
              <div class="image-preview">
                <v-img v-if="imgedit" :src="imgedit" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img>
                <div v-else class="preview-placeholder"><v-icon size="28">mdi-cellphone-screenshot</v-icon></div>
              </div>
              <div class="upload-copy">
                <div class="upload-title">Fotografía del equipo</div>
                <div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div>
                <v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @change="onFileSelected" />
              </div>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ editedIndex === -1 ? "Crear dispositivo" : "Guardar cambios" }}</v-btn></v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Diálogo interno: confirmar eliminación -->
    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="27">mdi-trash-can-outline</v-icon></div>
        <div class="delete-title">Eliminar dispositivo</div>
        <div class="delete-message">¿Deseas eliminar <strong>{{ editedItem.name || "este dispositivo" }}</strong>? Esta acción no se puede deshacer.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api";

export default {
  name: "DevicesView",
  data: () => ({
    snackbar: false, sb_type: "", sb_message: "", sb_timeout: 2000, sb_title: "", sb_icon: "",
    valid: false, loading: false, file: null, imgMiniatura: "", menu: false, menu2: false,
    input: null, input2: null, dialog: false, dialogDelete: false, mostrarFila: false,
    permissions: "", devices: [], branches: [], branch_id: "", editedIndex: -1, search: "", page: 1, itemsPerPage: 10, sortBy: [],
    headers: [
      { title: "Dispositivo", key: "name", value: "name", sortable: true, width: "22%" },
      { title: "Serial", key: "serial", value: "serial", sortable: true, width: "9%" },
      { title: "MAC", key: "mac", value: "mac", sortable: true, width: "15%" },
      { title: "Android", key: "version", value: "version", sortable: true, width: "9%" },
      { title: "Adquirido", key: "acquisition", value: "acquisition", sortable: true, width: "12%" },
      { title: "Mantenimiento", key: "maintenance", value: "maintenance", sortable: true, width: "13%" },
      { title: "Estado", key: "status", value: "status", sortable: true, width: "10%" },
      { title: "Descripción", key: "notes", value: "notes", sortable: false, width: "14%" },
      { title: "", key: "actions", value: "actions", sortable: false, align: "end", width: "5%" },
    ],
    editedItem: { id: "", name: "", mac: "", version: "", image: "", serial: "", status: 1, maintenance: "", acquisition: "", notes: "", branch_id: "" },
    defaultItem: { id: "", name: "", mac: "", version: "", image: "", serial: "", status: 1, maintenance: "", acquisition: "", notes: "", branch_id: "" },
    originalItem: {},
    nameRules: [(v) => !!v || "El nombre es requerido", (v) => !v || v.length >= 3 || "Debe tener al menos 3 caracteres", (v) => !v || v.length <= 50 || "No puede superar los 50 caracteres"],
    selectRules: [(v) => !!v || "Debes seleccionar una sucursal"],
    serialRules: [(v) => !!v || "El número de serie es requerido", (v) => !v || /^[a-zA-Z0-9-]{8,24}$/.test(v) || "Debe ser alfanumérico y tener entre 8 y 24 caracteres"],
    androidVersionRules: [(v) => !v || /^\d{1,2}(\.\d{1,2})?$/.test(String(v).trim()) || "Formato inválido. Ejemplo: 11.0 o 12.1"],
    macRules: [(v) => !v || /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(String(v).trim()) || "Usa el formato AA:BB:CC:DD:EE:FF"],
  }),
  computed: {
    formTitle() { return this.editedIndex === -1 ? "Agregar dispositivo" : "Editar dispositivo"; },
    imgedit() { return this.imgMiniatura; },
    dateFormatted() { return this.formatInputDate(this.input || this.editedItem.acquisition); },
    dateFormatted2() { return this.formatInputDate(this.input2 || this.editedItem.maintenance); },
    today() { return this.formatInputDate(new Date()); },
    activeDevices() { return this.devices.filter((device) => Number(device.status) === 1).length; },
    inactiveDevices() { return this.devices.filter((device) => Number(device.status) !== 1).length; },
    registeredCountText() { return this.devices.length === 1 ? "1 dispositivo registrado" : `${this.devices.length} dispositivos registrados`; },
    customKeySort() {
      return {
        version: (a, b) => this.compareAndroidVersions(a, b),
        status: (a, b) => Number(a || 0) - Number(b || 0),
      };
    },
  },
  watch: { search() { this.page = 1; } },
  mounted() {
    this.permissions = LocalStorageService.getItem("permissions") || "";
    if (this.hasPermission("view_devices_company")) { this.mostrarFila = true; this.showBranches(); }
    else { this.branch_id = this.normalizeStorageValue(LocalStorageService.getItem("branch_id")); this.initialize(); }
  },
  methods: {
    cloneItem(item) { return { ...item }; },
    unwrapItem(item) { return item?.raw ?? item ?? {}; },
    normalizeStorageValue(value) { return String(value ?? "").replace(/["']/g, "").trim(); },
    hasPermission(permission) { const list = Array.isArray(permission) ? permission : [permission]; return list.some((item) => String(this.permissions).includes(item)); },
    resolveImageValue(source) {
      if (!source) return "";
      if (typeof source === "string") return source.trim();
      return String(source.image ?? source.image_url ?? source.imageUrl ?? source.url ?? source.path ?? "").trim();
    },
    baseImageUrl(source) {
      const image = this.resolveImageValue(source);
      if (!image) return "";
      if (/^(https?:|data:|blob:)/i.test(image)) return image;

      const baseURL = String(this.$axios.defaults.baseURL || "");
      const cleanImage = image.replace(/^\/+/, "");

      if (cleanImage.startsWith("images/")) return `${baseURL}${cleanImage}`;
      return `${baseURL}images/${cleanImage}`;
    },
    branchImage(branch) { return this.baseImageUrl(branch?.image); },
    hasDeviceImage(device) { return Boolean(this.resolveImageValue(device)); },
    deviceImage(device) {
      const url = this.baseImageUrl(device);
      if (!url || /^(data:|blob:)/i.test(url)) return url;
      return `${url}${url.includes("?") ? "&" : "?"}t=${this.getCacheTimestamp()}`;
    },
    getCacheTimestamp() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); },
    formatInputDate(value) {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
      const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatDisplayDate(value) { if (!value) return "Sin fecha"; const normalized = String(value).slice(0, 10); const parts = normalized.split("-"); return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : normalized; },
    compareAndroidVersions(a, b) {
      const first = String(a || "0").split(".").map((part) => Number(part) || 0);
      const second = String(b || "0").split(".").map((part) => Number(part) || 0);
      const length = Math.max(first.length, second.length);
      for (let index = 0; index < length; index += 1) {
        const difference = (first[index] || 0) - (second[index] || 0);
        if (difference !== 0) return difference;
      }
      return 0;
    },
    updateDate(value) { this.input = value; this.editedItem.acquisition = this.formatInputDate(value); this.menu = false; },
    updateDate1(value) { this.input2 = value; this.editedItem.maintenance = this.formatInputDate(value); this.menu2 = false; },
    onBranchChange() { this.page = 1; this.initialize(); },
    async showBranches() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "branch", method: "GET" });
        this.branches = result.success && Array.isArray(result.data?.branches) ? result.data.branches : [];
        if (!this.branches.length) { this.branch_id = ""; this.devices = []; if (!result.success) this.showAlert("warning", result.message || "No fue posible cargar las sucursales.", 3000); return; }
        if (!this.branches.some((branch) => String(branch.id) === String(this.branch_id))) this.branch_id = this.branches[0].id;
        await this.initialize();
      } catch (error) { this.branches = []; this.devices = []; this.showAlert("error", "Ocurrió un error al cargar las sucursales.", 3000); }
      finally { this.loading = false; }
    },
    showAdd() {
      this.resetEditor(); this.editedItem.branch_id = this.branch_id || this.branches[0]?.id || ""; this.editedItem.acquisition = this.today; this.editedItem.maintenance = this.today; this.input = this.editedItem.acquisition; this.input2 = this.editedItem.maintenance; this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    close() { if (this.loading) return; this.dialog = false; this.$nextTick(() => { this.resetEditor(); this.$refs.form?.resetValidation(); }); },
    resetEditor() { this.editedItem = this.cloneItem(this.defaultItem); this.originalItem = this.cloneItem(this.defaultItem); this.editedIndex = -1; this.file = null; this.imgMiniatura = ""; this.input = null; this.input2 = null; this.valid = false; },
    async initialize() {
      if (!this.branch_id || this.branch_id === "null") { this.devices = []; return; }
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "device-branch", method: "POST", data: { branch_id: this.branch_id } });
        this.devices = result.success && Array.isArray(result.data?.devices) ? result.data.devices : [];
        if (!result.success) this.showAlert("warning", result.message || "No fue posible cargar los dispositivos.", 3000);
        const pageCount = Math.max(1, Math.ceil(this.devices.length / this.itemsPerPage)); if (this.page > pageCount) this.page = pageCount;
      } catch (error) { this.devices = []; this.showAlert("error", "Ocurrió un error al cargar los dispositivos.", 3000); }
      finally { this.loading = false; }
    },
    getChangedFields(creating) {
      const fields = ["name", "mac", "version", "serial", "status", "maintenance", "acquisition", "notes", "branch_id"];
      const payload = fields.reduce((changes, key) => { if (creating || this.editedItem[key] !== this.originalItem[key]) changes[key] = this.editedItem[key]; return changes; }, {});
      if (this.file) payload.image = this.file;
      return payload;
    },
    async save() {
      const validation = await this.$refs.form?.validate(); if (!validation?.valid) return;
      const creating = this.editedIndex === -1; const payload = this.getChangedFields(creating);
      if (!creating && Object.keys(payload).length === 0) { this.showAlert("warning", "No se realizaron cambios.", 3000); return; }
      if (!creating) payload.id = this.editedItem.id;
      const formData = new FormData(); Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ""));
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: creating ? "device" : "device-update", method: "POST", data: formData });
        if (result.success) { this.branch_id = this.editedItem.branch_id || this.branch_id; this.dialog = false; this.showAlert("success", result.message || "Dispositivo guardado correctamente.", 3000); await this.initialize(); this.resetEditor(); }
        else this.showAlert("warning", result.message || "No fue posible guardar el dispositivo.", 3000);
      } catch (error) { this.showAlert("error", "Ocurrió un error al guardar el dispositivo.", 3000); }
      finally { this.loading = false; }
    },
    editItem(item) {
      const device = this.unwrapItem(item); this.editedIndex = this.devices.findIndex((current) => String(current.id) === String(device.id)); this.originalItem = this.cloneItem(device); this.editedItem = this.cloneItem(device); this.file = null; this.input = device.acquisition || null; this.input2 = device.maintenance || null; this.imgMiniatura = this.baseImageUrl(device.image); this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    deleteItem(item) { const device = this.unwrapItem(item); this.editedItem = { ...this.cloneItem(this.defaultItem), ...this.cloneItem(device) }; this.dialogDelete = true; },
    closeDelete() { if (!this.loading) { this.dialogDelete = false; this.editedItem = this.cloneItem(this.defaultItem); } },
    async deleteItemConfirm() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "device-destroy", method: "POST", data: { id: this.editedItem.id } });
        if (result.success) { this.dialogDelete = false; this.showAlert("success", result.message || "Dispositivo eliminado correctamente.", 3000); await this.initialize(); this.editedItem = this.cloneItem(this.defaultItem); }
        else this.showAlert("warning", result.message || "No fue posible eliminar el dispositivo.", 3000);
      } catch (error) { this.showAlert("error", "Ocurrió un error al eliminar el dispositivo.", 3000); }
      finally { this.loading = false; }
    },
    onFileSelected(event) {
      const modelFile = Array.isArray(this.file) ? this.file[0] : this.file;
      const selected = event?.target?.files?.[0] || modelFile; if (!selected) { this.file = null; this.imgMiniatura = this.editedItem.image ? this.baseImageUrl(this.editedItem.image) : ""; return; }
      if (selected.size > 500 * 1024) { this.file = null; this.showAlert("warning", "La imagen debe tener un tamaño máximo de 500 KB.", 3000); return; }
      this.file = selected; const reader = new FileReader(); reader.onload = (loadEvent) => { this.imgMiniatura = loadEvent.target.result; }; reader.readAsDataURL(selected);
    },
    showAlert(type, message, timeout = 3000) {
      const config = { success: { title: "Éxito", icon: "mdi-check-circle" }, error: { title: "Error", icon: "mdi-close-circle" }, warning: { title: "Advertencia", icon: "mdi-alert-circle" }, info: { title: "Información", icon: "mdi-information" } }[type] || { title: "Advertencia", icon: "mdi-alert-circle" };
      this.sb_type = type; this.sb_title = config.title; this.sb_icon = config.icon; this.sb_message = message; this.sb_timeout = timeout; this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.devices-page { --blue:#2454d6; --blue-light:#3266e4; min-height:100%; color:#1e293b; background:#f6f8fb; }
.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; }
.page-heading,.dialog-heading { display:flex; align-items:center; gap:11px; }
.page-icon,.dialog-icon { position:relative; display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }
.dialog-icon-main { transform:translate(-2px,1px); }
.dialog-icon-action { position:absolute; right:5px; bottom:5px; padding:1px; color:#0e1f46; background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(15,23,42,.22); }
.page-title { margin:0; color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }.page-subtitle { margin:3px 0 0; color:#526176; font-size:12px; font-weight:650; }
.add-button,.save-button { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }
.page-content { padding:18px 24px 28px; }.summary-row { margin-bottom:4px; }
.summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }
.summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }.summary-icon--blue { color:#2454d6; background:#eef3ff; }.summary-icon--green { color:#16875a; background:#eaf8f1; }.summary-icon--slate { color:#64748b; background:#f1f5f9; }
.summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }
.table-panel { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }
.table-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:69px; padding:12px 17px; }.section-title { color:#0f172a; font-size:15px; font-weight:850; }.section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.toolbar-filters { display:flex; align-items:center; justify-content:flex-end; gap:9px; flex:1; }.branch-filter { flex:0 1 245px; }.search-field { flex:0 1 285px; }.branch-filter :deep(.v-field),.search-field :deep(.v-field) { border-radius:9px; font-size:12px; }.branch-filter :deep(.v-field__outline),.search-field :deep(.v-field__outline) { color:#dce3ed; }
.devices-table { color:#1e293b; background:transparent; }.devices-table :deep(thead th) { height:40px!important; color:#334155!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }.devices-table :deep(tbody td) { height:58px!important; color:#1e293b; font-size:13px; font-weight:600; border-bottom:1px solid #eef2f6!important; }.devices-table :deep(tbody tr:hover) { background:#f8faff!important; }.devices-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }
.devices-table :deep(.v-data-table__th--sortable) { cursor:pointer; user-select:none; transition:color .18s ease,background-color .18s ease; }
.devices-table :deep(.v-data-table__th--sortable:hover) { color:#2454d6!important; background:#f4f7ff!important; }
.devices-table :deep(.v-data-table-header__content) { display:flex!important; align-items:center!important; gap:5px!important; }
.devices-table :deep(.v-data-table-header__sort-icon) { display:inline-flex!important; visibility:visible!important; flex:0 0 auto; width:15px!important; height:15px!important; margin-left:1px!important; color:#94a3b8!important; font-size:15px!important; opacity:.65!important; transition:color .18s ease,opacity .18s ease,transform .18s ease; }
.devices-table :deep(.v-data-table__th--sorted) { color:#2454d6!important; background:#f5f7ff!important; }
.devices-table :deep(.v-data-table__th--sorted .v-data-table-header__sort-icon) { color:#2454d6!important; opacity:1!important; }
.device-name-cell { display:flex; align-items:center; gap:9px; min-width:0; }.device-avatar { display:grid; flex:0 0 34px; width:34px; height:34px; overflow:hidden; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }.device-photo { display:block; width:100%!important; height:100%!important; min-width:34px; min-height:34px; }.device-photo :deep(.v-img__img) { width:100%!important; height:100%!important; object-fit:cover; }.image-fallback { display:grid; width:100%; height:100%; place-items:center; }.cell-copy { min-width:0; }.device-name { overflow:hidden; color:#0f172a; font-size:13.5px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.device-serial { margin-top:2px; overflow:hidden; color:#526176; font-size:11px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
.technical-value { color:#334155; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11.5px; font-weight:700; }.android-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 7px; color:#116b49; background:#eaf8f1; border-radius:7px; font-size:11.5px; font-weight:800; }.date-value { color:#334155; font-size:12px; font-weight:700; white-space:nowrap; }
.status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 7px; font-size:11.5px; font-weight:800; border-radius:7px; }.status-badge--active { color:#116b49; background:#eaf8f1; }.status-badge--inactive { color:#475569; background:#f1f5f9; }.status-dot { width:6px; height:6px; background:currentColor; border-radius:50%; }.description-cell { max-width:260px; overflow:hidden; color:#334155; font-size:12.5px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.action-buttons { display:flex; justify-content:flex-end; gap:2px; }.action-button { border-radius:8px!important; }.action-button--edit { color:#2454d6!important; }.action-button--edit:hover { background:#eef3ff; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }.table-footer-note { display:flex; align-items:center; gap:6px; min-height:42px; padding:9px 16px; color:#64748b; font-size:10.5px; font-weight:650; border-top:1px solid #edf1f5; }
.form-dialog,.delete-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }.dialog-body { max-height:70vh; padding:21px 22px 16px!important; overflow-y:auto; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }.form-section-label--spaced { margin-top:7px; }
.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }
.status-control { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:11px 13px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.status-control-title { color:#334155; font-size:12.5px; font-weight:800; }.status-control-description { margin-top:4px; color:#64748b; font-size:10.5px; font-weight:600; }.status-switch { display:flex; align-items:center; gap:8px; font-size:11.5px; font-weight:800; }.is-active { color:#16875a; }.is-inactive { color:#64748b; }
.image-upload-area { display:flex; align-items:center; gap:14px; padding:12px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.image-preview { flex:0 0 92px; width:92px; height:68px; overflow:hidden; background:#eef3ff; border:1px solid #dce6ff; border-radius:9px; }.preview-placeholder { display:grid; width:100%; height:100%; place-items:center; color:#2454d6; }.upload-copy { flex:1; min-width:0; }.upload-title { color:#334155; font-size:12.5px; font-weight:800; }.upload-description { margin:3px 0 8px; color:#64748b; font-size:10.5px; font-weight:600; }.file-field { max-width:330px; }
.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:150px; padding-inline:18px!important; }
.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius:11px; }
@media (max-width:1100px) { .devices-table { overflow-x:auto; }.devices-table :deep(.v-table__wrapper) { min-width:1050px; } }
@media (max-width:959px) { .page-header { padding-inline:17px; }.page-content { padding:15px 17px 24px; }.table-toolbar { align-items:stretch; flex-direction:column; }.toolbar-filters { justify-content:flex-start; }.branch-filter,.search-field { flex:1 1 0; } }
@media (max-width:600px) { .page-header { align-items:flex-start; padding:11px 12px; }.page-subtitle { max-width:210px; }.add-button { min-width:42px!important; padding-inline:10px!important; }.add-button :deep(.v-btn__content) { font-size:0; }.add-button :deep(.v-icon) { margin:0!important; }.page-content { padding:11px 12px 20px; }.toolbar-filters { align-items:stretch; flex-direction:column; }.branch-filter,.search-field { flex-basis:auto; width:100%; }.dialog-header { padding:14px; }.dialog-body { padding:17px 14px 12px!important; }.status-control,.image-upload-area { align-items:flex-start; flex-direction:column; }.status-switch { width:100%; justify-content:space-between; }.dialog-actions { padding-inline:13px!important; } }
</style>

<style>
/* Los indicadores nativos viven dentro de v-data-table y requieren alcance global. */
.devices-table .v-data-table__th--sortable .v-data-table-header__sort-icon {
  display: inline-flex !important;
  visibility: visible !important;
  width: 15px !important;
  height: 15px !important;
  margin-left: 5px !important;
  color: #94a3b8 !important;
  font-size: 15px !important;
  opacity: 0.72 !important;
}

.devices-table thead {
  display: table-header-group !important;
  visibility: visible !important;
}

.devices-table thead tr {
  display: table-row !important;
  visibility: visible !important;
}

.devices-table thead th {
  display: table-cell !important;
  visibility: visible !important;
}

.devices-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,
.devices-table .v-data-table__th--sorted .v-data-table-header__sort-icon {
  color: #2454d6 !important;
  opacity: 1 !important;
}
</style>
