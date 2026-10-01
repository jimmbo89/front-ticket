<template>
  <v-dialog v-model="isOpen" max-width="780" persistent>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-card class="form-dialog" elevation="0">
        <div class="dialog-header">
          <div class="dialog-heading">
            <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-cellphone</v-icon><v-icon class="dialog-icon-action" size="11">{{ isCreating ? "mdi-plus" : "mdi-pencil" }}</v-icon></div>
            <div><div class="dialog-title">{{ isCreating ? "Agregar dispositivo" : "Editar dispositivo" }}</div><div class="dialog-subtitle">{{ isCreating ? "Registra un nuevo equipo operativo" : "Actualiza el dispositivo y sus asociaciones" }}</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
        </div>
        <v-divider />

        <v-card-text class="dialog-body">
          <div class="form-section-label">Información general</div>
          <v-row dense>
            <v-col v-if="showBranch" cols="12" md="6">
              <v-autocomplete v-model="formItem.branch_id" :items="branches" item-title="name" item-value="id" label="Sucursal" prepend-inner-icon="mdi-store-outline" variant="outlined" density="comfortable" no-data-text="No hay sucursales disponibles" :rules="selectRules" :disabled="!isCreating" @update:model-value="onBranchChanged">
                <template #item="{ props, item }"><v-list-item v-bind="props" :prepend-avatar="branchImage(item.raw)" :title="item.raw.name" /></template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" :md="showBranch ? 6 : 12"><v-text-field v-model.trim="formItem.name" label="Nombre del dispositivo" placeholder="Ej.: Terminal boletería 01" prepend-inner-icon="mdi-devices" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" counter="50" clearable /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.mac" label="Dirección MAC" placeholder="AA:BB:CC:DD:EE:FF" prepend-inner-icon="mdi-lan" variant="outlined" density="comfortable" :rules="macRules" clearable /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.serial" label="Número de serie" placeholder="Serie del fabricante" prepend-inner-icon="mdi-barcode" variant="outlined" density="comfortable" :rules="serialRules" clearable /></v-col>
          </v-row>

          <div class="form-section-label form-section-label--spaced">Vehículos del dispositivo</div>
          <section class="vehicle-association-panel">
            <div class="association-heading">
              <div class="association-heading-icon"><v-icon size="19">mdi-bus</v-icon></div>
              <div><div class="association-heading-title">Asociación opcional</div><div class="association-heading-copy">Configura las asociaciones y guarda todo junto con el dispositivo.</div></div>
              <v-tooltip :text="vehicleSearchOpen ? 'Ocultar búsqueda' : 'Buscar vehículo'" location="top">
                <template #activator="{ props }">
                  <v-btn v-bind="props" :icon="vehicleSearchOpen ? 'mdi-close' : 'mdi-magnify'" variant="text" size="small" class="vehicle-search-button" aria-label="Buscar vehículo" @click="toggleVehicleSearch" />
                </template>
              </v-tooltip>
            </div>
            <v-expand-transition>
              <v-text-field
                v-if="vehicleSearchOpen"
                v-model.trim="vehicleSearch"
                class="vehicle-search-field"
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-close"
                label="Buscar por patente, interno, marca o modelo"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:append-inner="clearVehicleSearch"
              />
            </v-expand-transition>
            <div v-if="filteredVehicleRows.length" class="vehicle-association-list">
              <div v-for="vehicle in filteredVehicleRows" :key="vehicle.id" class="vehicle-association-row">
                <div class="vehicle-summary">
                  <div class="vehicle-avatar"><v-icon size="18">mdi-bus</v-icon></div>
                  <div class="cell-copy"><div class="vehicle-name">{{ vehicle.plate }}</div><div class="vehicle-caption">Interno: {{ vehicle.internalNumber }} · {{ vehicle.brand }} {{ vehicle.model }}</div></div>
                </div>
                <div class="vehicle-row-actions">
                  <span class="status-badge" :class="vehicle.associated ? (vehicle.active ? 'status-badge--active' : 'status-badge--inactive') : 'status-badge--available'"><span class="status-dot" />{{ vehicle.associated ? (vehicle.active ? "Activa" : "Inactiva") : "Disponible" }}</span>
                  <v-tooltip v-if="!vehicle.associated" text="Asociar vehículo" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-link-variant-plus" variant="text" size="small" class="action-button action-button--associate" :disabled="loading || saving" @click="associateVehicle(vehicle)" /></template></v-tooltip>
                  <template v-else>
                    <v-tooltip :text="vehicle.active ? 'Desactivar asociación' : (hasActiveVehicle ? 'El dispositivo ya tiene otra asociación activa' : 'Activar asociación')" location="top"><template #activator="{ props }"><v-btn v-bind="props" :icon="vehicle.active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" variant="text" size="small" class="action-button action-button--associate" :disabled="loading || saving || (!vehicle.active && hasActiveVehicle)" @click="setVehicleActive(vehicle, !vehicle.active)" /></template></v-tooltip>
                    <v-tooltip v-if="!vehicle.active" text="Eliminar asociación" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" :disabled="loading || saving" @click="deleteVehicle(vehicle)" /></template></v-tooltip>
                  </template>
                </div>
              </div>
            </div>
            <div v-else class="association-empty"><v-icon size="19">{{ vehicleSearch ? "mdi-magnify-close" : "mdi-link-variant-off" }}</v-icon><span>{{ vehicleSearch ? "No hay vehículos que coincidan con la búsqueda." : "No hay vehículos disponibles para administrar." }}</span></div>
            <div class="selection-summary"><v-icon size="18">mdi-information-outline</v-icon><span>{{ vehicleChanges.length ? `${vehicleChanges.length} cambio(s) de asociación pendiente(s)` : "Asociar un vehículo es opcional." }}</span></div>
          </section>

          <div class="form-section-label form-section-label--spaced">Configuración y control</div>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-locale-provider locale="es">
                <DatePicker
                  v-model="formItem.acquisition"
                  label="Fecha de adquisición"
                  prepend-inner-icon="mdi-calendar-outline"
                  variant="outlined"
                  density="comfortable"
                  :max-date="today"
                  :min-width="0"
                  hide-details
                />
              </v-locale-provider>
            </v-col>
            <v-col cols="12" md="4">
              <v-locale-provider locale="es">
                <DatePicker
                  v-model="formItem.maintenance"
                  label="Fecha de mantenimiento"
                  prepend-inner-icon="mdi-tools"
                  variant="outlined"
                  density="comfortable"
                  :min-date="formItem.acquisition || null"
                  :min-width="0"
                  hide-details
                />
              </v-locale-provider>
            </v-col>
            <v-col cols="12" md="4"><v-text-field v-model.trim="formItem.version" label="Versión de Android" placeholder="Ej.: 11.0" prepend-inner-icon="mdi-android" variant="outlined" density="comfortable" :rules="androidVersionRules" clearable /></v-col>
            <v-col cols="12"><v-textarea v-model.trim="formItem.notes" label="Descripción" placeholder="Información útil sobre el equipo" prepend-inner-icon="mdi-text-box-outline" variant="outlined" density="comfortable" rows="2" auto-grow clearable /></v-col>
          </v-row>


          <div class="status-control"><div><div class="status-control-title">Estado del dispositivo</div><div class="status-control-description">Los dispositivos inactivos no estarán disponibles para la operación.</div></div><div class="status-switch" :class="Number(formItem.status) === 1 ? 'is-active' : 'is-inactive'"><span>{{ Number(formItem.status) === 1 ? "Activo" : "Inactivo" }}</span><v-switch v-model="formItem.status" :true-value="1" :false-value="0" color="success" hide-details inset /></div></div>

          <div class="form-section-label form-section-label--spaced">Imagen del dispositivo</div>
          <div class="image-upload-area"><div class="image-preview"><v-img v-if="imagePreview" :key="imagePreview" class="device-image-preview" :src="imagePreview" width="88" height="88" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-cellphone-screenshot</v-icon></div></div><div class="upload-copy"><div class="upload-title">Fotografía del equipo</div><div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @update:model-value="onFileSelected" /></div></div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear dispositivo" : "Guardar cambios" }}</v-btn></v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="snackbarTimeout" :color="snackbarType" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="snackbarIcon" size="22" /><div><div class="snackbar-title">{{ snackbarTitle }}</div><div class="snackbar-message">{{ snackbarMessage }}</div></div></div></v-snackbar>
</template>

<script>
export default {
  name: "DeviceFormDialog",
  emits: ["update:modelValue", "save", "branch-change"],
  props: {
    modelValue: { type: Boolean, default: false },
    device: { type: Object, default: () => ({}) },
    branches: { type: Array, default: () => [] },
    vehicles: { type: Array, default: () => [] },
    showBranch: { type: Boolean, default: false },
    isCreating: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data: () => ({
    valid: false,
    formItem: {},
    originalVehicles: [],
    vehicleRows: [],
    file: null,
    imgMiniatura: "",
    saving: false,
    snackbar: false,
    snackbarType: "",
    snackbarTitle: "",
    snackbarIcon: "",
    snackbarMessage: "",
    snackbarTimeout: 3000,
    vehicleSearch: "",
    vehicleSearchOpen: false,
    nameRules: [(v) => !!v || "El nombre es requerido", (v) => !v || v.length >= 3 || "Debe tener al menos 3 caracteres", (v) => !v || v.length <= 50 || "No puede superar los 50 caracteres"],
    selectRules: [(v) => !!v || "Debes seleccionar una sucursal"],
    serialRules: [(v) => !!v || "El número de serie es requerido", (v) => !v || /^[a-zA-Z0-9-]{8,24}$/.test(v) || "Debe ser alfanumérico y tener entre 8 y 24 caracteres"],
    androidVersionRules: [(v) => !v || /^\d{1,2}(\.\d{1,2})?$/.test(String(v).trim()) || "Formato inválido. Ejemplo: 11.0 o 12.1"],
    macRules: [(v) => !v || /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(String(v).trim()) || "Usa el formato AA:BB:CC:DD:EE:FF"],
  }),
  computed: {
    isOpen: { get() { return this.modelValue; }, set(value) { this.$emit("update:modelValue", value); } },
    imagePreview() { return this.imgMiniatura || this.baseImageUrl(this.formItem?.image || this.device?.image); },
    today() { return this.formatInputDate(new Date()); },
    hasActiveVehicle() { return this.vehicleRows.some((vehicle) => vehicle.associated && vehicle.active); },
    activeVehicleCount() { return this.vehicleRows.filter((vehicle) => vehicle.associated && vehicle.active).length; },
    filteredVehicleRows() {
      const search = this.vehicleSearch.toLowerCase().trim();
      if (!search) return this.vehicleRows;
      return this.vehicleRows.filter((vehicle) => [
        vehicle.id,
        vehicle.plate,
        vehicle.internalNumber,
        vehicle.brand,
        vehicle.model,
      ].some((value) => String(value ?? "").toLowerCase().includes(search)));
    },
    vehicleChanges() {
      const originalById = new Map(this.originalVehicles.map((vehicle) => [String(vehicle.id), vehicle]));
      return this.vehicleRows.map((vehicle) => {
        const original = originalById.get(String(vehicle.id));
        const originalAssociated = Boolean(original?.associated);
        const originalActive = Boolean(original?.active);
        if (!originalAssociated && vehicle.associated) return { association_id: null, vehicle_id: vehicle.id, action: "associate", active: true };
        if (originalAssociated && !vehicle.associated) return { association_id: vehicle.relationId, vehicle_id: vehicle.id, action: "delete", active: false };
        if (originalAssociated && vehicle.associated && originalActive !== vehicle.active) return { association_id: vehicle.relationId, vehicle_id: vehicle.id, action: vehicle.active ? "activate" : "deactivate", active: vehicle.active };
        return null;
      }).filter(Boolean);
    },
  },
  watch: {
    modelValue(value) { if (value) this.syncFromDevice(); },
    vehicles: {
      deep: true,
      handler(value) {
        if (this.modelValue && this.isCreating && !this.toArray(this.device?.vehicles).length) {
          this.vehicleRows = this.toArray(value).map((vehicle) => this.normalizeVehicle({
            ...vehicle,
            associated: false,
            active: false,
            association_id: null,
            associationId: null,
            deviceVehicleId: null,
            device_vehicle_id: null,
          }));
          this.originalVehicles = [];
        }
      },
    },
    device: { deep: true, handler() { if (this.modelValue) this.syncFromDevice(); } },
  },
  methods: {
    defaultItem() { return { id: "", name: "", mac: "", version: "", image: "", serial: "", status: 1, maintenance: "", acquisition: "", notes: "", branch_id: "", vehicles: [] }; },
    toArray(value) { return Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []); },
    syncFromDevice() {
      this.formItem = { ...this.defaultItem(), ...this.device, vehicles: [] };
      const deviceVehicles = this.toArray(this.device?.vehicles);
      const editingRelations = !this.isCreating && deviceVehicles.length > 0;
      const rawVehicles = editingRelations ? deviceVehicles : this.vehicles;
      this.vehicleRows = rawVehicles.map((vehicle) => this.normalizeVehicle(
        editingRelations ? vehicle : { ...vehicle, associated: false, active: false, association_id: null, associationId: null, deviceVehicleId: null, device_vehicle_id: null },
      ));
      this.originalVehicles = this.vehicleRows.map((vehicle) => ({ ...vehicle }));
      this.file = null;
      this.imgMiniatura = this.baseImageUrl(this.device?.image);
      this.vehicleSearch = "";
      this.vehicleSearchOpen = false;
      this.valid = false;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    normalizeVehicle(vehicle = {}) {
      const source = vehicle?.vehicle && typeof vehicle.vehicle === "object" ? vehicle.vehicle : vehicle;
      const relation = vehicle.deviceVehicle || vehicle.device_vehicle || vehicle.association || vehicle.deviceVehicleRelation || {};
      const id = vehicle.vehicle_id ?? vehicle.vehicleId ?? vehicle.vehicle?.id ?? vehicle.id ?? "";
      const associated = vehicle.associated === false
        ? false
        : this.isActive(vehicle.associated) || this.isActive(vehicle.related) || this.isActive(vehicle.is_associated) || this.isActive(vehicle.device_associated) || Boolean(relation.id);
      const relationId = vehicle.association_id ?? vehicle.associationId ?? vehicle.deviceVehicleId ?? vehicle.device_vehicle_id ?? vehicle.deviceVehicle?.id ?? vehicle.association?.id ?? relation.id ?? (associated && vehicle.vehicle_id !== undefined && String(vehicle.id) !== String(vehicle.vehicle_id) ? vehicle.id : "");
      const associationActive = vehicle.association_active ?? relation.association_active;
      const associationStatus = String(vehicle.device_vehicle_status ?? relation.device_vehicle_status ?? "").toUpperCase();
      const active = associationActive !== undefined && associationActive !== null
        ? this.isActive(associationActive)
        : this.isActive(vehicle.active ?? relation.active) || associationStatus === "ASSOCIATED_ACTIVE";
      return { ...source, ...vehicle, id, relationId, plate: source.plate || vehicle.plate || "Sin patente", internalNumber: source.internal_number ?? source.internalNumber ?? vehicle.internal_number ?? vehicle.internalNumber ?? "No asignado", brand: source.brand || vehicle.brand || "Sin marca", model: source.model || vehicle.model || "Sin modelo", associated, active: associated && active };
    },
    branchImage(branch) { return this.baseImageUrl(branch?.image); },
    baseImageUrl(source) {
      if (!source) return "";
      const image = typeof source === "string" ? source.trim() : String(source.image ?? source.image_url ?? source.imageUrl ?? source.url ?? source.path ?? "").trim();
      if (!image) return "";
      if (/^(https?:|data:|blob:)/i.test(image)) return image;
      const base = String(this.$axios.defaults.baseURL || "");
      return `${base}${image.replace(/^\/+/, "").startsWith("images/") ? image.replace(/^\/+/, "") : `images/${image.replace(/^\/+/, "")}`}`;
    },
    formatInputDate(value) {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    onBranchChanged(value) { if (this.isCreating) this.$emit("branch-change", value); },
    toggleVehicleSearch() {
      this.vehicleSearchOpen = !this.vehicleSearchOpen;
      if (!this.vehicleSearchOpen) this.vehicleSearch = "";
    },
    clearVehicleSearch() { this.vehicleSearch = ""; },
    isActive(value) { return value === true || Number(value) === 1 || String(value).toLowerCase() === "true"; },
    associateVehicle(vehicle) {
      if (this.hasActiveVehicle) { this.notify("warning", "Desactiva la asociación activa antes de asociar otro vehículo."); return; }
      vehicle.associated = true;
      vehicle.active = true;
    },
    setVehicleActive(vehicle, active) {
      if (active && this.hasActiveVehicle) { this.notify("warning", "El dispositivo ya tiene otra asociación activa."); return; }
      if (!vehicle.relationId) { this.notify("warning", "No se pudo identificar la asociación."); return; }
      vehicle.active = active;
    },
    deleteVehicle(vehicle) {
      if (vehicle.active) { this.notify("warning", "Desactiva la asociación antes de eliminarla."); return; }
      if (!vehicle.relationId) { this.notify("warning", "No se pudo identificar la asociación."); return; }
      vehicle.associated = false;
      vehicle.active = false;
    },
    onFileSelected(value) {
      const selected = value?.target?.files?.[0] || (Array.isArray(value) ? value[0] : value);
      if (!selected) { this.file = null; this.imgMiniatura = ""; return; }
      if (selected.size > 500 * 1024) { this.file = null; this.notify("warning", "La imagen debe tener un tamaño máximo de 500 KB."); return; }
      this.file = selected;
      const reader = new FileReader(); reader.onload = (loadEvent) => { this.imgMiniatura = loadEvent.target.result; }; reader.readAsDataURL(selected);
    },
    async submit() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      if (this.activeVehicleCount > 1) {
        this.notify("warning", "Un dispositivo solo puede tener un vehículo asociado activo.");
        return;
      }
      this.$emit("save", { item: { ...this.formItem }, file: this.file, vehicles: this.vehicleChanges });
    },
    close() { if (!this.loading) this.isOpen = false; },
    notify(type, message, timeout = 3000) {
      const config = { success: ["Éxito", "mdi-check-circle"], error: ["Error", "mdi-close-circle"], warning: ["Advertencia", "mdi-alert-circle"] }[type] || ["Información", "mdi-information"];
      this.snackbarType = type; this.snackbarTitle = config[0]; this.snackbarIcon = config[1]; this.snackbarMessage = message; this.snackbarTimeout = timeout; this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.form-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon-main{transform:translate(-2px,1px)}.dialog-icon-action{position:absolute;right:5px;bottom:5px;padding:1px;color:#0e1f46;background:#fff;border-radius:50%}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.dialog-body{max-height:72vh;padding:21px 22px 18px!important;overflow-y:auto}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-section-label--spaced{margin-top:9px}.dialog-body :deep(.v-field){border-radius:9px}.dialog-body :deep(.v-field__outline){color:#d6dee9}.dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.vehicle-association-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.association-heading{display:flex;align-items:center;gap:9px;margin-bottom:12px}.association-heading>div:nth-child(2){min-width:0;flex:1}.vehicle-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.vehicle-search-button:hover{background:#eef3ff}.association-heading-icon{display:grid;width:32px;height:32px;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:8px}.association-heading-title{color:#0f172a;font-size:12.5px;font-weight:850}.association-heading-copy{margin-top:2px;color:#64748b;font-size:10.5px;font-weight:650}.vehicle-search-field{margin-bottom:9px}.vehicle-association-list{max-height:320px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.vehicle-association-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eef2f6}.vehicle-association-row:last-child{border-bottom:0}.vehicle-summary{display:flex;align-items:center;gap:9px;min-width:0}.vehicle-avatar{display:grid;flex:0 0 34px;width:34px;height:34px;place-items:center;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:8px}.cell-copy{min-width:0}.vehicle-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.vehicle-caption{margin-top:2px;overflow:hidden;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.vehicle-row-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:7px;font-size:10.5px;font-weight:800;white-space:nowrap}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--inactive{color:#475569;background:#f1f5f9}.status-badge--available{color:#8a5b08;background:#fff6e6}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-button{border-radius:8px!important}.action-button--associate{color:#16875a!important}.action-button--associate:hover{background:#eaf8f1}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.association-empty,.selection-summary{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;color:#64748b;background:#fff;border:1px solid #e8edf5;border-radius:8px;font-size:10.5px;font-weight:650;line-height:1.45}.selection-summary{margin-top:9px}.status-control{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:9px;padding:12px 13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.status-control-title{color:#334155;font-size:12px;font-weight:850}.status-control-description{margin-top:3px;color:#64748b;font-size:10.5px;font-weight:650}.status-switch{display:flex;align-items:center;gap:8px;color:#16875a;font-size:11px;font-weight:850}.status-switch.is-inactive{color:#64748b}.image-upload-area{display:flex;align-items:center;gap:14px;padding:12px;background:#f8fafc;border:1px dashed #cfd9e7;border-radius:10px}.image-preview{display:grid;flex:0 0 88px;width:88px;height:88px;overflow:hidden;place-items:center;background:#eef3ff;border:1px solid #dce6ff;border-radius:10px}.image-preview :deep(.v-img__img){object-fit:cover}.preview-placeholder{display:grid;width:100%;height:100%;place-items:center;color:#8aa0bf}.upload-copy{min-width:0;flex:1}.upload-title{color:#334155;font-size:12.5px;font-weight:850}.upload-description{margin:4px 0 8px;color:#64748b;font-size:10.5px;font-weight:650}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.save-button{min-width:160px;min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-title{font-size:11px;font-weight:850}.snackbar-message{margin-top:2px;font-size:9.5px;font-weight:600}.busgo-snackbar :deep(.v-snackbar__wrapper){border-radius:11px}@media(max-width:600px){.dialog-header{padding:14px}.dialog-body{padding:17px 14px 12px!important}.vehicle-association-row{align-items:flex-start;flex-direction:column}.vehicle-row-actions{width:100%;justify-content:flex-end}.vehicle-caption{max-width:210px}.image-upload-area{align-items:flex-start;flex-direction:column}.image-preview{flex-basis:76px;width:76px;height:76px}.dialog-actions{padding-inline:13px!important}}
</style>
