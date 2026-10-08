<template>
  <v-dialog v-model="isOpen" max-width="780" persistent>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-card class="form-dialog" elevation="0">
        <div class="dialog-header">
          <div class="dialog-heading">
            <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-routes</v-icon><v-icon class="dialog-icon-action" size="11">{{ isCreating ? "mdi-plus" : "mdi-pencil" }}</v-icon></div>
            <div><div class="dialog-title">{{ isCreating ? "Agregar ruta" : "Editar ruta" }}</div><div class="dialog-subtitle">{{ isCreating ? "Configura un nuevo recorrido operativo" : "Actualiza la ruta y sus asociaciones" }}</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
        </div>
        <v-divider />

        <v-card-text class="dialog-body">
          <div class="form-section-label">Identificación de la ruta</div>
          <v-text-field v-model.trim="formItem.code" label="Código de la ruta" placeholder="Ej.: AER-TPM" prepend-inner-icon="mdi-pound" variant="outlined" density="comfortable" :rules="codeRules" maxlength="20" counter="20" @blur="normalizeRouteCode" />

          <div class="form-section-label form-section-label--spaced">Recorrido</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete v-model="formItem.origin_id" :items="locationsOrigins" item-title="address" item-value="id" label="Origen" prepend-inner-icon="mdi-map-marker-up-outline" variant="outlined" density="comfortable" no-data-text="No hay orígenes disponibles" :rules="selectRules" class="route-location-select">
                <template #item="{ props, item }"><v-list-item v-bind="props" class="location-option"><template #prepend><v-avatar size="34" rounded="lg" class="option-avatar"><v-img v-if="item.raw.image" :src="imageUrl(item.raw.image)" width="34" height="34" cover><template #error><div class="option-fallback"><v-icon size="17">mdi-map-marker-outline</v-icon></div></template></v-img><v-icon v-else size="17">mdi-map-marker-outline</v-icon></v-avatar></template><v-list-item-title class="option-title">{{ item.raw.city }}</v-list-item-title></v-list-item></template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete v-model="formItem.destination_id" :items="availableDestinations" item-title="address" item-value="id" label="Destino" prepend-inner-icon="mdi-map-marker-down-outline" variant="outlined" density="comfortable" no-data-text="No hay destinos disponibles" :rules="selectRules" class="route-location-select">
                <template #item="{ props, item }"><v-list-item v-bind="props" class="location-option"><template #prepend><v-avatar size="34" rounded="lg" class="option-avatar"><v-img v-if="item.raw.image" :src="imageUrl(item.raw.image)" width="34" height="34" cover><template #error><div class="option-fallback"><v-icon size="17">mdi-map-marker-outline</v-icon></div></template></v-img><v-icon v-else size="17">mdi-map-marker-outline</v-icon></v-avatar></template><v-list-item-title class="option-title">{{ item.raw.city }}</v-list-item-title></v-list-item></template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6"><v-text-field v-model="formItem.distance" label="Distancia" suffix="km" prepend-inner-icon="mdi-ruler" variant="outlined" density="comfortable" type="number" min="0" step="0.01" :rules="distanceRules" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="formItem.estimated" label="Duración estimada" suffix="min" prepend-inner-icon="mdi-timer-outline" variant="outlined" density="comfortable" type="number" min="1" :rules="durationRules" /></v-col>
          </v-row>

          <div class="route-preview"><div class="preview-point preview-point--origin"><v-icon size="16">mdi-map-marker</v-icon></div><div class="preview-line" /><div class="preview-point preview-point--destination"><v-icon size="16">mdi-flag-checkered</v-icon></div><div class="preview-copy"><span>{{ selectedOriginName }}</span><v-icon size="15">mdi-arrow-right</v-icon><span>{{ selectedDestinationName }}</span></div></div>

          <div class="form-section-label form-section-label--spaced">Sucursales de la ruta</div>
          <section class="branch-association-panel">
            <div class="association-heading">
              <div class="association-heading-icon"><v-icon size="19">mdi-store-marker-outline</v-icon></div>
              <div><div class="association-heading-title">Asociación opcional</div><div class="association-heading-copy">Configura las sucursales y guarda todo junto con la ruta.</div></div>
            </div>
            <MultiSelectCombobox
              :model-value="selectedBranchRows"
              :items="branchRows"
              item-title="name"
              item-value="id"
              label="Seleccionar sucursales"
              placeholder="Busca por sucursal o dirección"
              prepend-inner-icon="mdi-store-search-outline"
              no-data-text="No hay sucursales que coincidan con la búsqueda."
              :disabled="loading"
              :loading="loading"
              :custom-filter="branchFilter"
              :menu-props="{ contentClass: 'route-branch-select-menu' }"
              class="route-branch-combobox"
              @update:model-value="updateSelectedBranches"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.address">
                  <template #prepend>
                    <div class="branch-avatar"><v-img v-if="branchImage(item.raw)" :src="branchImage(item.raw)" width="36" height="36" cover><template #error><div class="image-fallback"><v-icon size="18">mdi-store</v-icon></div></template></v-img><v-icon v-else size="18">mdi-store</v-icon></div>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item, remove }">
                <v-chip class="selected-branch-chip" closable @click:close="remove">
                  <template #prepend><v-icon size="14">mdi-store</v-icon></template>
                  {{ item.raw.name }}
                </v-chip>
              </template>
            </MultiSelectCombobox>
            <div class="selection-summary"><v-icon size="18">mdi-information-outline</v-icon><span>{{ selectedBranchRows.length ? `${selectedBranchRows.length} sucursal(es) seleccionada(s)` : "Asociar una sucursal es opcional." }}</span></div>
          </section>
        </v-card-text>

        <v-divider />
        <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear ruta" : "Guardar cambios" }}</v-btn></v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="snackbarTimeout" :color="snackbarType" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="snackbarIcon" size="22" /><div><div class="snackbar-title">{{ snackbarTitle }}</div><div class="snackbar-message">{{ snackbarMessage }}</div></div></div></v-snackbar>
</template>

<script>
import MultiSelectCombobox from "@/components/MultiSelectCombobox.vue";

export default {
  name: "RouteFormDialog",
  components: { MultiSelectCombobox },
  emits: ["update:modelValue", "save"],
  props: {
    modelValue: { type: Boolean, default: false },
    route: { type: Object, default: () => ({}) },
    locations: { type: Array, default: () => [] },
    locationsOrigins: { type: Array, default: () => [] },
    branches: { type: Array, default: () => [] },
    isCreating: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data: () => ({
    valid: false,
    formItem: {},
    originalBranches: [],
    branchRows: [],
    snackbar: false,
    snackbarType: "",
    snackbarTitle: "",
    snackbarIcon: "",
    snackbarMessage: "",
    snackbarTimeout: 3000,
    codeRules: [(v) => !!String(v || "").trim() || "El código es requerido", (v) => !v || String(v).length <= 20 || "Máximo 20 caracteres"],
    selectRules: [(v) => !!v || "Debes seleccionar una ubicación"],
    distanceRules: [(v) => v !== "" && !isNaN(v) || "Ingresa una distancia válida", (v) => Number(v) > 0 || "Debe ser mayor a 0"],
    durationRules: [(v) => v !== "" && !isNaN(v) || "Ingresa una duración válida", (v) => Number(v) > 0 || "Debe ser mayor a 0"],
  }),
  computed: {
    isOpen: { get() { return this.modelValue; }, set(value) { this.$emit("update:modelValue", value); } },
    availableDestinations() { return this.locations.filter((location) => String(location.id) !== String(this.formItem.origin_id)); },
    selectedOriginName() { return this.locationsOrigins.find((location) => String(location.id) === String(this.formItem.origin_id))?.address || "Selecciona origen"; },
    selectedDestinationName() { return this.locations.find((location) => String(location.id) === String(this.formItem.destination_id))?.address || "Selecciona destino"; },
    selectedBranchRows() { return this.branchRows.filter((branch) => branch.associated); },
    branchChanges() {
      const originalById = new Map(this.originalBranches.map((branch) => [String(branch.id), branch]));
      return this.branchRows.map((branch) => {
        const original = originalById.get(String(branch.id));
        const originalAssociated = Boolean(original?.associated);
        if (!originalAssociated && branch.associated) return { association_id: null, branch_id: branch.id, action: "associate" };
        if (originalAssociated && !branch.associated) return { association_id: branch.relationId, branch_id: branch.id, action: "delete" };
        return null;
      }).filter(Boolean);
    },
  },
  watch: {
    modelValue(value) { if (value) this.syncFromRoute(); },
    route: { deep: true, handler() { if (this.modelValue) this.syncFromRoute(); } },
    branches: { deep: true, handler() { if (this.modelValue && this.isCreating) this.syncFromRoute(); } },
    "formItem.origin_id"(value) { if (String(value) === String(this.formItem.destination_id)) this.formItem.destination_id = ""; },
  },
  methods: {
    defaultItem() { return { id: "", code: "", origin_id: "", destination_id: "", distance: "", estimated: "", status: "1", route_id: "", branches: [] }; },
    toArray(value) { return Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []); },
    syncFromRoute() {
      this.formItem = { ...this.defaultItem(), ...this.route, branches: [] };
      const routeBranches = this.toArray(this.route?.branches);
      const catalog = this.toArray(this.branches);
      const byId = new Map();
      catalog.forEach((branch) => { const normalized = this.normalizeBranch({ ...branch, associated: false, relationId: null }); if (normalized.id) byId.set(String(normalized.id), normalized); });
      routeBranches.forEach((branch) => { const normalized = this.normalizeBranch(branch); if (!normalized.id) return; byId.set(String(normalized.id), { ...byId.get(String(normalized.id)), ...normalized }); });
      this.branchRows = Array.from(byId.values()).map((branch) => this.isCreating ? { ...branch, associated: false, relationId: null } : branch);
      this.originalBranches = this.isCreating ? [] : this.branchRows.map((branch) => ({ ...branch }));
      this.valid = false;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    normalizeBranch(branch = {}) {
      const relation = branch.routeBranch || branch.route_branch || branch.association || {};
      const id = branch.branch_id ?? branch.branchId ?? branch.id ?? "";
      const relationId = branch.association_id ?? branch.associationId ?? branch.branchRouteId ?? branch.branch_route_id ?? branch.routeBranchId ?? branch.route_branch_id ?? relation.id ?? null;
      const associated = branch.associated === false ? false : branch.associated === true || Boolean(relationId);
      return { ...branch, id, name: branch.name ?? branch.branchName ?? branch.branch_name ?? "Sucursal sin nombre", address: branch.address ?? branch.branchAddress ?? branch.branch_address ?? "Dirección no disponible", image: branch.image ?? branch.branchImage ?? branch.branch_image ?? "", associated, relationId };
    },
    normalizeRouteCode() { this.formItem.code = String(this.formItem.code || "").trim().toUpperCase(); },
    imageUrl(source) {
      if (!source) return "";
      const image = String(source).trim();
      if (/^(https?:|data:|blob:)/i.test(image)) return image;
      const base = String(this.$axios.defaults.baseURL || "");
      const clean = image.replace(/^\/+/, "");
      return clean.startsWith("images/") ? `${base}${clean}` : `${base}images/${clean}`;
    },
    branchImage(branch) { return this.imageUrl(branch?.image); },
    branchFilter(value, query, item) {
      const search = String(query ?? "").toLowerCase().trim();
      if (!search) return 1;
      const branch = item?.raw ?? item ?? {};
      const searchable = [value, branch.id, branch.name, branch.address].map((part) => String(part ?? "").toLowerCase()).join(" ");
      return searchable.includes(search) ? 1 : -1;
    },
    updateSelectedBranches(selectedBranches) {
      const selectedIds = new Set(this.toArray(selectedBranches).map((branch) => String(branch?.id ?? branch?.branch_id ?? branch)).filter(Boolean));
      this.branchRows = this.branchRows.map((branch) => ({ ...branch, associated: selectedIds.has(String(branch.id)) }));
    },
    async submit() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      this.normalizeRouteCode();
      this.$emit("save", { item: { ...this.formItem }, branches: this.branchChanges });
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
.form-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon-main{transform:translate(-2px,1px)}.dialog-icon-action{position:absolute;right:5px;bottom:5px;padding:1px;color:#0e1f46;background:#fff;border-radius:50%}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.dialog-body{max-height:72vh;padding:21px 22px 18px!important;overflow-y:auto}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-section-label--spaced{margin-top:9px}.dialog-body :deep(.v-field){border-radius:9px}.dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.route-location-select :deep(.v-field__input){align-items:center;min-height:52px;padding-top:0;padding-bottom:0}.route-location-select :deep(.v-field__prepend-inner){align-self:center;padding-top:0}.route-preview{position:relative;display:flex;align-items:center;margin-top:3px;padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.preview-point{display:grid;z-index:1;width:30px;height:30px;place-items:center;border-radius:50%}.preview-point--origin{color:#16875a;background:#eaf8f1}.preview-point--destination{color:#2454d6;background:#eef3ff}.preview-line{width:44px;height:2px;background:#cad5e6}.preview-copy{display:flex;align-items:center;gap:7px;min-width:0;margin-left:12px;color:#334155;font-size:11.5px;font-weight:750}.preview-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.branch-association-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.association-heading{display:flex;align-items:center;gap:9px;margin-bottom:12px}.association-heading>div:nth-child(2){min-width:0;flex:1}.association-heading-icon{display:grid;width:32px;height:32px;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:8px}.association-heading-title{color:#0f172a;font-size:12.5px;font-weight:850}.association-heading-copy{margin-top:2px;color:#64748b;font-size:10.5px;font-weight:650}.branch-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.branch-search-button:hover{background:#eef3ff}.branch-search-field{margin-bottom:9px}.branch-association-list{max-height:320px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.branch-association-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eef2f6}.branch-association-row:last-child{border-bottom:0}.branch-summary{display:flex;align-items:center;gap:9px;min-width:0}.branch-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;overflow:hidden;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:9px}.branch-avatar :deep(.v-img__img){object-fit:cover}.image-fallback{display:grid;width:100%;height:100%;place-items:center}.cell-copy{min-width:0}.branch-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.branch-caption{overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.branch-row-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:7px;font-size:10.5px;font-weight:800;white-space:nowrap}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--available{color:#8a5b08;background:#fff6e6}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-button{border-radius:8px!important}.action-button--associate{color:#16875a!important}.action-button--associate:hover{background:#eaf8f1}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.association-empty,.selection-summary{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;color:#64748b;background:#fff;border:1px solid #e8edf5;border-radius:8px;font-size:10.5px;font-weight:650;line-height:1.45}.selection-summary{margin-top:9px}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.save-button{min-width:150px;min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-title{font-size:11px;font-weight:850}.snackbar-message{margin-top:2px;font-size:9.5px;font-weight:600}.busgo-snackbar :deep(.v-snackbar__wrapper){border-radius:11px}@media(max-width:600px){.dialog-header{padding:14px}.dialog-body{padding:17px 14px 12px!important}.branch-association-row{align-items:flex-start;flex-direction:column}.branch-row-actions{width:100%;justify-content:flex-end}.branch-caption{max-width:220px}.dialog-actions{padding-inline:13px!important}}
</style>

<style>
.route-branch-select-menu .v-list { padding: 6px !important; }
.route-branch-select-menu .v-list-item { min-height: 54px; margin: 2px 0; border-radius: 9px; }
.route-branch-select-menu .v-list-item:hover { background: #f4f7ff !important; }
.route-branch-select-menu .v-list-item__prepend { margin-inline-end: 12px !important; }
.route-branch-select-menu .v-list-item-subtitle { color: #64748b !important; font-size: 10.5px !important; font-weight: 650 !important; opacity: 1 !important; }
.route-branch-select-menu .branch-avatar { flex: 0 0 36px; width: 36px; height: 36px; }
.selected-branch-chip { max-width: 220px !important; color: #2454d6 !important; background: #eef3ff !important; font-size: 11px !important; font-weight: 750 !important; }
.selected-branch-chip .v-chip__content { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-branch-chip .v-chip__close { color: #64748b !important; }
.selected-branch-chip .v-chip__close:hover { color: #dc2626 !important; }
</style>
