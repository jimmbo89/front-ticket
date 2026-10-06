<template>
  <v-dialog v-model="isOpen" fullscreen transition="dialog-bottom-transition" :no-click-animation="true">
    <v-card class="vehicle-dialog" elevation="0">
      <header class="vehicle-dialog-header">
        <div class="vehicle-dialog-heading">
          <div class="vehicle-dialog-icon"><v-icon size="21">mdi-bus</v-icon></div>
          <div>
            <div class="vehicle-dialog-title">{{ isCreating ? "Agregar vehículo" : "Editar vehículo" }}</div>
            <div class="vehicle-dialog-subtitle">{{ isCreating ? "Registra un nuevo vehículo en la flota" : "Actualiza el vehículo y sus asociaciones" }}</div>
          </div>
        </div>
        <div class="vehicle-dialog-progress"><span>Paso {{ step }} de {{ stepItems.length }}</span><strong>{{ stepItems[step - 1] }}</strong></div>
        <v-btn icon="mdi-close" variant="text" class="vehicle-dialog-close" :disabled="loading" @click="close" />
      </header>

      <v-card-text class="vehicle-dialog-body pa-0">
        <div class="vehicle-progress-nav">
          <div v-for="(progressItem, progressIndex) in stepItems" :key="progressItem" class="vehicle-progress-item" :class="{ 'vehicle-progress-item--active': step === progressIndex + 1, 'vehicle-progress-item--complete': step > progressIndex + 1 }">
            <div class="vehicle-progress-number"><v-icon v-if="step > progressIndex + 1" size="16">mdi-check</v-icon><span v-else>{{ progressIndex + 1 }}</span></div>
            <div class="vehicle-progress-copy"><span>Etapa {{ String(progressIndex + 1).padStart(2, '0') }}</span><strong>{{ progressItem }}</strong></div>
          </div>
        </div>

        <v-form ref="form" v-model="valid" class="vehicle-form" @submit.prevent="submit">
          <v-stepper v-model="step" :items="stepItems" hide-actions class="vehicle-stepper" elevation="0" bg-color="">
            <template v-slot:[`item.1`]>
              <div class="vehicle-step-pane vehicle-step-pane--summary">
                <div class="vehicle-step-content">
                  <div class="vehicle-form-intro"><div class="vehicle-form-intro-icon"><v-icon size="21">mdi-bus-information</v-icon></div><div><strong>Datos del vehículo</strong><span>Completa la información principal y la imagen que identificará a la unidad.</span></div></div>
                  <div class="form-section-label">Información general</div>
                  <v-row dense>
                    <v-col cols="12">
                      <v-autocomplete v-model="formItem.structure_id" :items="structures" item-title="name" item-value="id" label="Estructura de asientos" prepend-inner-icon="mdi-seat-passenger" variant="outlined" density="comfortable" no-data-text="No hay estructuras disponibles" :rules="selectRules" :menu-props="{ contentClass: 'vehicle-structure-menu' }" @update:model-value="updateSeats">
                        <template #item="{ props, item }"><v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.description"><template #prepend><div class="structure-menu-icon"><v-icon size="18">mdi-seat-passenger</v-icon></div></template><template #append><span class="structure-seat-count">{{ item.raw.seatCount || 0 }} asientos</span></template></v-list-item></template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.brand" label="Marca" placeholder="Ej.: Mercedes-Benz" prepend-inner-icon="mdi-bus-marker" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col>
                    <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.model" label="Modelo" placeholder="Ej.: Marcopolo G7" prepend-inner-icon="mdi-bus-side" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model.trim="formItem.plate" label="Patente" placeholder="Ej.: ABCD12" prepend-inner-icon="mdi-card-text-outline" variant="outlined" density="comfortable" :rules="plateRules" clearable /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model.trim="formItem.internal_number" label="Número interno" placeholder="Ej.: BUS-014" prepend-inner-icon="mdi-pound" variant="outlined" density="comfortable" clearable /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model="formItem.seats" label="Asientos" prepend-inner-icon="mdi-seat-passenger" variant="outlined" density="comfortable" :rules="seatRules" disabled /></v-col>
                  </v-row>

                  <div class="status-control">
                    <div><div class="status-control-title">Estado del vehículo</div><div class="status-control-description">Los vehículos inactivos no estarán disponibles para la operación.</div></div>
                    <div class="status-switch" :class="Number(formItem.state) === 1 ? 'is-active' : 'is-inactive'"><span>{{ Number(formItem.state) === 1 ? "Activo" : "Inactivo" }}</span><v-switch v-model="formItem.state" :true-value="1" :false-value="0" color="success" hide-details inset /></div>
                  </div>

                  <div class="form-section-label form-section-label--spaced">Imagen del vehículo</div>
                  <div class="image-upload-area"><div class="image-preview"><v-img v-if="imagePreview" :key="imagePreview" :src="imagePreview" width="88" height="88" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-bus</v-icon></div></div><div class="upload-copy"><div class="upload-title">Fotografía del vehículo</div><div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @update:model-value="onFileSelected" /></div></div>
                </div>
                <v-divider />
                <div class="vehicle-step-actions"><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="close">Salir</v-btn><v-spacer /><v-btn type="button" class="save-button vehicle-continue-button" elevation="0" :loading="loading" :disabled="loading" @click="nextStep">Continuar</v-btn></div>
              </div>
            </template>

            <template v-slot:[`item.2`]>
              <div class="vehicle-step-pane">
                <div class="vehicle-step-content">
                  <section class="branch-association-panel">
                    <div class="association-heading">
                      <div class="association-heading-icon"><v-icon size="19">mdi-store-marker-outline</v-icon></div>
                      <div><div class="association-heading-title">Sucursales</div><div class="association-heading-copy">Selecciona una o varias sucursales. Puedes buscar, seleccionar y quitar opciones desde el mismo campo.</div></div>
                    </div>
                    <MultiSelectCombobox
                      :model-value="selectedBranchRows"
                      :items="branchRows"
                      item-title="name"
                      item-value="id"
                      label="Seleccionar sucursales"
                      placeholder="Busca por nombre, dirección o RUT"
                      prepend-inner-icon="mdi-store-search-outline"
                      no-data-text="No hay sucursales que coincidan con la búsqueda."
                      :disabled="loading"
                      :loading="loading"
                      :custom-filter="branchFilter"
                      :menu-props="{ contentClass: 'vehicle-branch-select-menu' }"
                      class="vehicle-branch-combobox"
                      @update:model-value="updateSelectedBranches"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.address">
                          <template #prepend>
                            <div class="branch-avatar"><v-img v-if="branchImage(item.raw)" :src="branchImage(item.raw)" width="36" height="36" cover><template #error><div class="image-fallback"><v-icon size="18">mdi-store</v-icon></div></template></v-img><v-icon v-else size="18">mdi-store</v-icon></div>
                          </template>
                          <template #append><span class="branch-option-status" :class="item.raw.associated ? 'branch-option-status--associated' : 'branch-option-status--available'">{{ item.raw.associated ? "Asociada" : "Disponible" }}</span></template>
                        </v-list-item>
                      </template>
                      <template #selection="{ item, remove }">
                        <v-chip class="selected-branch-chip" closable @click:close="remove">
                          <template #prepend><v-icon size="14">mdi-store</v-icon></template>
                          {{ item.raw.name }}
                        </v-chip>
                      </template>
                    </MultiSelectCombobox>
                  </section>

                  <template v-if="selectedBranchIds.length">
                    <section class="route-preference-panel">
                      <div class="association-heading">
                        <div class="association-heading-icon"><v-icon size="19">mdi-road-variant</v-icon></div>
                        <div><div class="association-heading-title">Rutas preferentes (opcional)</div><div class="association-heading-copy">Selecciona las rutas que este vehículo utiliza con mayor frecuencia.</div></div>
                      </div>
                      <MultiSelectCombobox
                        :model-value="selectedRouteRows"
                        :items="availableRoutes"
                        item-title="code"
                        item-value="id"
                        label="Buscar o agregar ruta"
                        placeholder="Busca por código, nombre, origen o destino"
                        prepend-inner-icon="mdi-road-variant"
                        no-data-text="No hay rutas que coincidan con la búsqueda."
                        :disabled="loading"
                        :loading="loading"
                        :custom-filter="routeFilter"
                        :menu-props="{ contentClass: 'vehicle-route-select-menu' }"
                        class="vehicle-route-combobox"
                        @update:model-value="updateSelectedRoutes"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props" :title="routeTitle(item.raw)" :subtitle="routeCaption(item.raw)">
                            <template #prepend><div class="route-avatar"><v-icon size="18">mdi-road-variant</v-icon></div></template>
                          </v-list-item>
                        </template>
                        <template #selection></template>
                      </MultiSelectCombobox>
                    </section>
                  </template>
                </div>
                <v-divider />
                <div class="vehicle-step-actions"><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="prevStep">Volver</v-btn><v-spacer /><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear vehículo" : "Guardar vehículo" }}</v-btn></div>
              </div>
            </template>
          </v-stepper>

          <aside class="vehicle-live-summary" aria-label="Resumen del vehículo">
            <div class="vehicle-summary-heading"><v-icon size="20">mdi-clipboard-text-outline</v-icon><div><strong>Tu vehículo</strong><span>Resumen de la configuración actual</span></div></div>
            <section class="vehicle-summary-card vehicle-summary-card--main">
              <div class="vehicle-summary-eyebrow">Identificación</div>
              <v-img v-if="imagePreview" :src="imagePreview" height="130" class="vehicle-summary-image" cover><template #error><div class="vehicle-summary-image-fallback"><v-icon size="42">mdi-bus</v-icon></div></template></v-img>
              <div v-else class="vehicle-summary-image vehicle-summary-image--empty"><v-icon size="42">mdi-bus</v-icon><span>Sin imagen</span></div>
              <strong class="vehicle-summary-plate">{{ formItem.plate || "Sin patente" }}</strong>
              <div class="vehicle-summary-name">{{ formItem.brand || "Sin marca" }} · {{ formItem.model || "Sin modelo" }}</div>
              <div class="vehicle-summary-meta"><span><v-icon size="14">mdi-pound</v-icon>{{ formItem.internal_number || "Sin número" }}</span><span><v-icon size="14">mdi-seat-passenger</v-icon>{{ formItem.seats || 0 }} asientos</span></div>
            </section>
            <section class="vehicle-summary-card">
              <div class="vehicle-summary-eyebrow">Estado</div>
              <span class="status-badge" :class="Number(formItem.state) === 1 ? 'status-badge--active' : 'status-badge--available'"><span class="status-dot" />{{ Number(formItem.state) === 1 ? "Activo" : "Inactivo" }}</span>
            </section>
            <section class="vehicle-summary-card">
              <div class="vehicle-summary-eyebrow">Sucursales asociadas</div>
              <div v-if="selectedBranchRows.length" class="vehicle-summary-list">
                <div v-for="branch in selectedBranchRows.slice(0, 4)" :key="branch.id" class="vehicle-summary-list-item"><span class="vehicle-summary-list-icon"><v-icon size="14">mdi-store</v-icon></span><div><strong>{{ branch.name }}</strong><span>{{ branch.address }}</span></div></div>
                <span v-if="selectedBranchRows.length > 4" class="vehicle-summary-more">+{{ selectedBranchRows.length - 4 }} sucursal(es) más</span>
              </div>
              <div v-else class="vehicle-summary-empty"><v-icon size="18">mdi-store-off-outline</v-icon><span>Aún no hay sucursales asociadas.</span></div>
            </section>
            <section class="vehicle-summary-card">
              <div class="vehicle-summary-eyebrow">Rutas preferentes</div>
              <div v-if="selectedRouteRows.length" class="vehicle-summary-list vehicle-summary-route-list">
                <div v-for="route in selectedRouteRows" :key="route.id" class="vehicle-summary-list-item"><span class="vehicle-summary-list-icon"><v-icon size="14">mdi-road-variant</v-icon></span><div><strong>{{ route.code }}</strong><span>{{ route.name }}</span></div></div>
              </div>
              <div v-else class="vehicle-summary-empty"><v-icon size="18">mdi-road-variant-off</v-icon><span>Asocia una sucursal para configurar rutas.</span></div>
            </section>
            <div class="vehicle-summary-note"><v-icon size="16">mdi-information-outline</v-icon><span>Los cambios se guardan al confirmar el vehículo en la última etapa.</span></div>
          </aside>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="snackbarTimeout" :color="snackbarType" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="snackbarIcon" size="22" /><div><div class="snackbar-title">{{ snackbarTitle }}</div><div class="snackbar-message">{{ snackbarMessage }}</div></div></div></v-snackbar>
</template>

<script>
import MultiSelectCombobox from "@/components/MultiSelectCombobox.vue";

export default {
  name: "VehicleFormDialog",
  components: { MultiSelectCombobox },
  emits: ["update:modelValue", "save"],
  props: {
    modelValue: { type: Boolean, default: false },
    vehicle: { type: Object, default: () => ({}) },
    structures: { type: Array, default: () => [] },
    branches: { type: Array, default: () => [] },
    isCreating: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data: () => ({
    valid: false,
    formItem: {},
    originalBranches: [],
    branchRows: [],
    originalRoutePreferences: [],
    preferredRouteIds: [],
    step: 1,
    stepItems: ["Datos del vehículo", "Sucursales y rutas"],
    file: null,
    imgMiniatura: "",
    snackbar: false,
    snackbarType: "",
    snackbarTitle: "",
    snackbarIcon: "",
    snackbarMessage: "",
    snackbarTimeout: 3000,
    nameRules: [(v) => !!String(v || "").trim() || "El campo es requerido", (v) => !v || String(v).length <= 50 || "El campo debe tener menos de 51 caracteres", (v) => !v || String(v).length >= 3 || "El campo debe tener al menos 3 caracteres"],
    plateRules: [(v) => !!String(v || "").trim() || "La patente es requerida"],
    seatRules: [(v) => !!v || "El número de asientos es requerido", (v) => !isNaN(v) || "Debe ser un número"],
    selectRules: [(v) => !!v || "Selecciona una estructura"],
  }),
  computed: {
    isOpen: { get() { return this.modelValue; }, set(value) { this.$emit("update:modelValue", value); } },
    imagePreview() { return this.imgMiniatura || this.imageUrl(this.formItem?.image || this.vehicle?.image); },
    selectedBranchIds() {
      return this.branchRows.filter((branch) => branch.associated).map((branch) => branch.id).filter(Boolean);
    },
    selectedBranchRows() {
      return this.branchRows.filter((branch) => branch.associated);
    },
    availableRoutes() {
      const selectedIds = new Set(this.selectedBranchIds.map((id) => String(id)));
      const routeMap = new Map();
      this.branchRows.filter((branch) => selectedIds.has(String(branch.id))).forEach((branch) => {
        this.toArray(branch.routes).forEach((route) => {
          const normalized = this.normalizeRoute(route);
          if (!normalized.id) return;
          const key = String(normalized.id);
          if (!routeMap.has(key)) routeMap.set(key, normalized);
        });
      });
      return Array.from(routeMap.values());
    },
    selectedRouteRows() {
      const selectedIds = new Set(this.preferredRouteIds.map((routeId) => String(routeId)));
      return this.availableRoutes.filter((route) => selectedIds.has(String(route.id)));
    },
    selectedRouteCount() { return this.selectedRouteRows.length; },
    routePreferenceChanges() {
      const originalByRoute = new Map(this.originalRoutePreferences.map((preference) => [String(preference.route_id), preference]));
      const selectedIds = new Set(this.preferredRouteIds.map((routeId) => String(routeId)));
      const vehicleId = this.vehicle?.id || this.formItem?.id || null;
      const changes = [];
      originalByRoute.forEach((original, routeId) => {
        if (!selectedIds.has(routeId)) changes.push({ association_id: original.id ?? null, vehicle_id: original.vehicle_id || vehicleId, route_id: original.route_id, action: "delete" });
      });
      selectedIds.forEach((routeId) => {
        if (!originalByRoute.has(routeId)) changes.push({ association_id: null, vehicle_id: vehicleId, route_id: routeId, action: "associate" });
      });
      return changes;
    },
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
    modelValue(value) { if (value) this.syncFromVehicle(); },
    vehicle: { deep: true, handler() { if (this.modelValue) this.syncFromVehicle(); } },
    branches: { deep: true, handler() { if (this.modelValue) this.syncFromVehicle(); } },
  },
  methods: {
    defaultItem() { return { id: "", structure_id: "", plate: "", internal_number: "", model: "", brand: "", image: "", rut: "", state: 1, seats: "", branches: [] }; },
    toArray(value) { return Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []); },
    syncFromVehicle() {
      this.formItem = { ...this.defaultItem(), ...this.vehicle, internal_number: this.vehicle?.internal_number ?? this.vehicle?.internalNumber ?? "", branches: [] };
      const vehicleBranches = this.toArray(this.vehicle?.branches);
      const catalog = this.toArray(this.branches);
      const byId = new Map();
      catalog.forEach((branch) => { const normalized = this.normalizeBranch({ ...branch, associated: false, relationId: null }); if (normalized.id) byId.set(String(normalized.id), normalized); });
      vehicleBranches.forEach((branch) => { const normalized = this.normalizeBranch(branch); if (!normalized.id) return; byId.set(String(normalized.id), { ...byId.get(String(normalized.id)), ...normalized }); });
      this.branchRows = Array.from(byId.values()).map((branch) => this.isCreating ? { ...branch, associated: false, relationId: null } : branch);
      this.originalBranches = this.isCreating ? [] : this.branchRows.map((branch) => ({ ...branch }));
      const rawRoutePreferences = this.vehicle?.route_preferences ?? this.vehicle?.routePreferences ?? [];
      this.originalRoutePreferences = this.isCreating ? [] : this.toArray(rawRoutePreferences).map((preference) => this.normalizeRoutePreference(preference)).filter((preference) => preference.route_id);
      const preferredRouteIds = this.originalRoutePreferences
        .map((preference) => String(preference.route_id))
        .filter((routeId, index, routeIds) => routeIds.indexOf(routeId) === index);
      const availableRouteIds = this.availableRoutes.map((route) => String(route.id));
      const availableRouteIdSet = new Set(availableRouteIds);
      this.preferredRouteIds = preferredRouteIds.filter((routeId) => availableRouteIdSet.has(routeId));
      this.step = 1;
      this.file = null;
      this.imgMiniatura = "";
      this.valid = false;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    normalizeBranch(branch = {}) {
      const relation = branch.branchVehicle || branch.branch_vehicle || branch.association || {};
      const id = branch.branch_id ?? branch.branchId ?? branch.id ?? "";
      const relationId = branch.association_id ?? branch.associationId ?? branch.branchVehicleId ?? branch.branch_vehicle_id ?? branch.branchVehicle?.id ?? branch.branch_vehicle?.id ?? relation.id ?? null;
      const associated = branch.associated === false ? false : branch.associated === true || (branch.associated == null && Boolean(relationId));
      return { ...branch, id, name: branch.name ?? branch.branchName ?? branch.branch_name ?? "Sucursal sin nombre", address: branch.address ?? branch.branchAddress ?? branch.branch_address ?? "Dirección no disponible", image: branch.image ?? branch.branchImage ?? branch.branch_image ?? "", associated, relationId };
    },
    normalizeRoute(route = {}) {
      const origin = route.origin || {};
      const destination = route.destination || {};
      const id = route.route_id ?? route.routeId ?? route.id ?? "";
      return { ...route, id, code: route.code ?? route.route_code ?? route.routeCode ?? "Sin código", name: route.name ?? "Ruta sin nombre", originName: origin.address ?? route.originAddress ?? "Origen no disponible", destinationName: destination.address ?? route.destinationAddress ?? "Destino no disponible" };
    },
    normalizeRoutePreference(preference = {}) {
      const route = preference.route || {};
      return { ...preference, id: preference.id ?? preference.preference_id ?? preference.preferenceId ?? "", vehicle_id: preference.vehicle_id ?? preference.vehicleId ?? this.vehicle?.id ?? null, route_id: preference.route_id ?? preference.routeId ?? route.id ?? "" };
    },
    updateSeats(structureId) { const selectedStructure = this.structures.find((structure) => String(structure.id) === String(structureId)); this.formItem.seats = selectedStructure?.seatCount ?? ""; },
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
      const searchable = [value, branch.id, branch.name, branch.address, branch.rut, branch.phone, branch.companyName].map((part) => String(part ?? "").toLowerCase()).join(" ");
      return searchable.includes(search) ? 1 : -1;
    },
    updateSelectedBranches(selectedBranches) {
      const selectedIds = new Set(this.toArray(selectedBranches).map((branch) => String(branch?.id ?? branch)).filter(Boolean));
      const invalidRemoval = this.branchRows.find((branch) => {
        const original = this.originalBranches.find((item) => String(item.id) === String(branch.id));
        return branch.associated && !selectedIds.has(String(branch.id)) && original?.associated && !branch.relationId;
      });
      if (invalidRemoval) {
        this.notify("warning", "No se pudo identificar la asociación de la sucursal.");
        return;
      }
      this.branchRows = this.branchRows.map((branch) => ({ ...branch, associated: selectedIds.has(String(branch.id)) }));
      this.pruneSelectedRoutes();
    },
    pruneSelectedRoutes() {
      if (!this.selectedBranchIds.length) return;
      const availableIds = new Set(this.availableRoutes.map((route) => String(route.id)));
      const nextPreferredIds = this.preferredRouteIds.map((routeId) => String(routeId)).filter((routeId) => availableIds.has(routeId));
      if (nextPreferredIds.length !== this.preferredRouteIds.length || nextPreferredIds.some((routeId, index) => routeId !== String(this.preferredRouteIds[index]))) this.preferredRouteIds = nextPreferredIds;
    },
    routeFilter(value, query, item) {
      const search = String(query ?? "").toLowerCase().trim();
      if (!search) return 1;
      const route = item?.raw ?? item ?? {};
      const searchable = [value, route.id, route.code, route.name, route.originName, route.destinationName].map((part) => String(part ?? "").toLowerCase()).join(" ");
      return searchable.includes(search) ? 1 : -1;
    },
    routeTitle(route = {}) {
      return [route.code, route.name].filter(Boolean).join(" · ");
    },
    routeCaption(route = {}) {
      return [route.originName, route.destinationName].filter(Boolean).join(" → ");
    },
    updateSelectedRoutes(selectedRoutes) {
      const availableIds = new Set(this.availableRoutes.map((route) => String(route.id)));
      this.preferredRouteIds = [...new Set(this.toArray(selectedRoutes).map((route) => String(route?.id ?? route)).filter((routeId) => availableIds.has(routeId)))];
    },
    removeSelectedRoute(routeId) {
      const removedId = String(routeId);
      this.preferredRouteIds = this.preferredRouteIds.filter((selectedId) => String(selectedId) !== removedId);
    },
    toggleBranchAssociation(branch) {
      if (!branch) return;
      const original = this.originalBranches.find((item) => String(item.id) === String(branch.id));
      if (branch.associated && original?.associated && !branch.relationId) { this.notify("warning", "No se pudo identificar la asociación de la sucursal."); return; }
      branch.associated = !branch.associated;
      this.pruneSelectedRoutes();
    },
    async nextStep() {
      if (this.step >= this.stepItems.length || this.loading) return;
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      this.step += 1;
    },
    prevStep() {
      if (this.step > 1 && !this.loading) this.step -= 1;
    },
    onFileSelected(value) {
      const selected = value?.target?.files?.[0] || (Array.isArray(value) ? value[0] : value);
      if (!selected) { this.file = null; this.imgMiniatura = ""; return; }
      if (selected.size > 500 * 1024) { this.file = null; this.notify("warning", "El archivo de imagen debe ser de máximo 500 KB."); return; }
      this.file = selected;
      const reader = new FileReader();
      reader.onload = (event) => { this.imgMiniatura = event.target.result; };
      reader.readAsDataURL(selected);
    },
    async saveVehicle() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      this.$emit("save", { item: { ...this.formItem }, file: this.file, branches: this.branchChanges, routePreferences: this.routePreferenceChanges });
    },
    async submit() {
      if (this.step !== this.stepItems.length) { await this.nextStep(); return; }
      await this.saveVehicle();
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
.form-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon-main{transform:translate(-2px,1px)}.dialog-icon-action{position:absolute;right:5px;bottom:5px;padding:1px;color:#0e1f46;background:#fff;border-radius:50%}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.dialog-body{max-height:72vh;padding:21px 22px 18px!important;overflow-y:auto}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-section-label--spaced{margin-top:9px}.dialog-body :deep(.v-field){border-radius:9px}.dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.structure-menu-icon{display:grid;width:34px;height:34px;place-items:center;color:#2454d6;background:#eef3ff;border-radius:8px}.structure-seat-count{color:#475569;font-size:11px;font-weight:750}.branch-association-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.association-heading{display:flex;align-items:center;gap:9px;margin-bottom:12px}.association-heading>div:nth-child(2){min-width:0;flex:1}.association-heading-icon{display:grid;width:32px;height:32px;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:8px}.association-heading-title{color:#0f172a;font-size:12.5px;font-weight:850}.association-heading-copy{margin-top:2px;color:#64748b;font-size:10.5px;font-weight:650}.branch-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.branch-search-button:hover{background:#eef3ff}.branch-search-field{margin-bottom:9px}.branch-association-list{max-height:320px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.branch-association-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eef2f6}.branch-association-row:last-child{border-bottom:0}.branch-summary{display:flex;align-items:center;gap:9px;min-width:0}.branch-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;overflow:hidden;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:9px}.branch-avatar :deep(.v-img__img){object-fit:cover}.image-fallback{display:grid;width:100%;height:100%;place-items:center}.cell-copy{min-width:0}.branch-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.branch-caption{overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.branch-row-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:7px;font-size:10.5px;font-weight:800;white-space:nowrap}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--available{color:#8a5b08;background:#fff6e6}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-button{border-radius:8px!important}.action-button--associate{color:#16875a!important}.action-button--associate:hover{background:#eaf8f1}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.association-empty,.selection-summary{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;color:#64748b;background:#fff;border:1px solid #e8edf5;border-radius:8px;font-size:10.5px;font-weight:650;line-height:1.45}.selection-summary{margin-top:9px}.status-control{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:14px;padding:12px 13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.status-control-title{color:#334155;font-size:12px;font-weight:850}.status-control-description{margin-top:3px;color:#64748b;font-size:10.5px;font-weight:650}.status-switch{display:flex;align-items:center;gap:8px;color:#16875a;font-size:11px;font-weight:850}.status-switch.is-inactive{color:#64748b}.image-upload-area{display:flex;align-items:center;gap:14px;padding:12px;background:#f8fafc;border:1px dashed #cfd9e7;border-radius:10px}.image-preview{display:grid;flex:0 0 88px;width:88px;height:88px;overflow:hidden;place-items:center;background:#eef3ff;border:1px solid #dce6ff;border-radius:10px}.image-preview :deep(.v-img__img){object-fit:cover}.preview-placeholder{display:grid;width:100%;height:100%;place-items:center;color:#8aa0bf}.upload-copy{min-width:0;flex:1}.upload-title{color:#334155;font-size:12.5px;font-weight:850}.upload-description{margin:4px 0 8px;color:#64748b;font-size:10.5px;font-weight:650}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.save-button{min-width:160px;min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-title{font-size:11px;font-weight:850}.snackbar-message{margin-top:2px;font-size:9.5px;font-weight:600}.busgo-snackbar :deep(.v-snackbar__wrapper){border-radius:11px}@media(max-width:600px){.dialog-header{padding:14px}.dialog-body{padding:17px 14px 12px!important}.branch-association-row{align-items:flex-start;flex-direction:column}.branch-row-actions{width:100%;justify-content:flex-end}.branch-caption{max-width:220px}.image-upload-area{align-items:flex-start;flex-direction:column}.image-preview{flex-basis:76px;width:76px;height:76px}.dialog-actions{padding-inline:13px!important}}
</style>

<style>
.vehicle-branch-select-menu .v-list{padding:6px!important}.vehicle-branch-select-menu .v-list-item{min-height:54px;margin:2px 0;border-radius:9px}.vehicle-branch-select-menu .v-list-item:hover{background:#f4f7ff}.vehicle-branch-select-menu .v-list-item__prepend{margin-inline-end:12px!important}.vehicle-branch-select-menu .v-list-item-subtitle{color:#64748b!important;font-size:10.5px!important;font-weight:650!important;opacity:1!important}.vehicle-branch-select-menu .branch-avatar{flex:0 0 36px;width:36px;height:36px}.branch-option-status{display:inline-flex;align-items:center;padding:4px 7px;border-radius:7px;font-size:10px;font-weight:800}.branch-option-status--associated{color:#116b49;background:#eaf8f1}.branch-option-status--available{color:#8a5b08;background:#fff6e6}.selected-branch-chip{max-width:220px!important;color:#2454d6!important;background:#eef3ff!important;font-size:11px!important;font-weight:750!important}.selected-branch-chip .v-chip__content{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selected-branch-chip .v-chip__close{color:#64748b!important}.selected-branch-chip .v-chip__close:hover{color:#dc2626!important}
</style>

<style scoped>
.route-preference-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  padding: 1px 1px 2px !important;
  background: transparent !important;
  border: 0 !important;
}

.route-preference-row {
  position: relative;
  min-height: 60px !important;
  padding: 8px 10px !important;
  background: #fff !important;
  border: 1px solid #dfe7f2 !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06) !important;
  cursor: grab !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.route-preference-row:hover {
  background: #fff !important;
  border-color: #b9caf0 !important;
  box-shadow: 0 4px 10px rgba(36, 84, 214, 0.12) !important;
  transform: translateY(-1px) !important;
}

.route-preference-row:active {
  cursor: grabbing !important;
}

.route-preference-row--selected {
  background: #fbfdff !important;
}

.route-preference-row--dragging {
  z-index: 3;
  background: #eef4ff !important;
  border-color: #2454d6 !important;
  box-shadow: 0 10px 20px rgba(36, 84, 214, 0.28), 0 0 0 2px rgba(36, 84, 214, 0.18) !important;
  opacity: 1 !important;
  transform: translateY(-3px) scale(1.012) !important;
}

.route-preference-row--dragging .route-drag-handle {
  color: #2454d6 !important;
  background: #dce7ff !important;
}

.route-preference-row--drag-over {
  background: #f3f7ff !important;
  border-color: #2454d6 !important;
  box-shadow: inset 0 0 0 2px rgba(36, 84, 214, 0.2), 0 4px 12px rgba(36, 84, 214, 0.1) !important;
}

.route-preference-row--drag-over:not(.route-preference-row--dragging) {
  transform: translateY(1px) !important;
}

.route-preference-row:last-child {
  border-bottom: 1px solid #dfe7f2 !important;
}

.route-drag-handle {
  padding: 3px !important;
  color: #7c8da8 !important;
  background: #f1f5fb !important;
  border-radius: 5px !important;
  cursor: grab !important;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.route-preference-row:hover .route-drag-handle {
  color: #2454d6 !important;
  background: #e8efff !important;
}

.route-preference-zones {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  align-items: start;
}

.route-preference-zone {
  min-width: 0;
  padding: 8px;
  background: #fbfcfe;
  border: 1px solid #e1e8f2;
  border-radius: 9px;
}

.route-preference-zone--preferred {
  background: #f8fbff;
  border-color: #cfdcf3;
}

.route-zone-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  margin-bottom: 7px;
  padding: 0 2px;
}

.route-zone-heading > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.route-zone-heading strong {
  color: #1e293b;
  font-size: 11px;
  font-weight: 850;
}

.route-zone-heading span:not(.route-zone-count) {
  overflow: hidden;
  color: #64748b;
  font-size: 9.5px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-zone-count {
  display: grid;
  flex: 0 0 auto;
  min-width: 28px;
  height: 22px;
  padding: 0 6px;
  place-items: center;
  color: #2454d6;
  background: #e8efff;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 850;
}

.route-zone-count--muted {
  color: #64748b;
  background: #eef2f7;
}

.route-preference-zone .route-preference-list {
  max-height: 260px !important;
}

.route-drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 58px;
  padding: 10px;
  color: #7183a0;
  background: #fff;
  border: 1px dashed #b7c8e6;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.route-drop-zone .v-icon {
  flex-shrink: 0;
  color: #2454d6;
}

.route-drop-zone--active {
  color: #2454d6;
  background: #eef4ff;
  border-color: #2454d6;
  box-shadow: inset 0 0 0 2px rgba(36, 84, 214, 0.14);
}

@media(max-width:600px) {
  .route-preference-row {
    min-height: 66px !important;
  }

  .route-preference-zones {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.branch-association-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;max-height:420px;padding:1px;overflow-x:hidden;overflow-y:auto;background:transparent;border:0}.branch-association-row{display:flex;align-items:stretch;justify-content:space-between;gap:12px;min-width:0;min-height:156px;padding:12px;background:#fff;border:1px solid #e8edf5;border-radius:8px;flex-direction:column;transition:background .15s ease,border-color .15s ease,box-shadow .15s ease}.branch-association-row:hover{background:#f9fbfe;border-color:#d5e0f0;box-shadow:0 3px 10px rgba(15,23,42,.05)}.branch-association-row:last-child{border-bottom:1px solid #e8edf5}.branch-summary{align-items:flex-start;width:100%}.branch-avatar{flex-basis:42px;width:42px;height:42px}.branch-name{white-space:normal;overflow-wrap:anywhere}.branch-caption{display:-webkit-box;white-space:normal;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2}.branch-row-actions{justify-content:space-between;width:100%;margin-top:auto}.branch-row-actions .action-button{flex:0 0 auto}.branch-association-list+.association-empty{grid-column:1/-1}
@media(max-width:1199px){.branch-association-list{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:959px){.branch-association-list{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){.branch-association-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:500px){.branch-association-list{grid-template-columns:1fr}}
</style>

<style scoped>
.branch-association-list {
  max-height: 340px;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.branch-association-row {
  align-items: center;
  flex-direction: row;
  min-height: 88px;
  padding: 11px 12px;
  border: 1px solid #e8edf5;
  border-radius: 9px;
}

.branch-association-row--associated {
  border-left: 3px solid #24a269;
}

.branch-association-row--available {
  border-left: 3px solid #d99a24;
}

.branch-summary {
  align-items: center;
  flex: 1 1 auto;
  width: auto;
}

.branch-avatar {
  flex-basis: 38px;
  width: 38px;
  height: 38px;
}

.cell-copy {
  flex: 1 1 auto;
}

.branch-name,
.branch-caption {
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  -webkit-box-orient: vertical;
}

.branch-name {
  overflow-wrap: normal;
  word-break: normal;
  -webkit-line-clamp: 2;
}

.branch-caption {
  -webkit-line-clamp: 2;
}

.branch-row-actions {
  width: auto;
  margin-top: 0;
  justify-content: flex-end;
  gap: 6px;
}

.status-badge {
  padding: 2px 0;
  background: transparent;
  font-size: 10px;
}

.status-badge--active,
.status-badge--available {
  background: transparent;
}

@media(max-width:600px) {
  .branch-association-list {
    grid-template-columns: 1fr;
  }

  .branch-association-row {
    align-items: flex-start;
    flex-direction: column;
    min-height: 0;
  }

  .branch-summary {
    width: 100%;
  }

  .branch-row-actions {
    width: 100%;
    margin-top: 2px;
  }
}

@media(max-width:1199px) {
  .branch-association-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media(max-width:959px) {
  .branch-association-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media(max-width:600px) {
  .branch-association-list {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.vehicle-dialog{display:flex;flex-direction:column;min-height:100vh;height:100vh;color:#1e293b;background:#f6f8fb}.vehicle-dialog-header{z-index:5;display:grid;grid-template-columns:minmax(0,1fr) auto 42px;align-items:center;gap:18px;min-height:72px;padding:11px 22px;color:#fff;background:radial-gradient(circle at 88% -40%,rgba(53,184,232,.38),transparent 230px),linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6);box-shadow:0 5px 18px rgba(15,23,42,.18)}.vehicle-dialog-heading{display:flex;align-items:center;gap:11px;min-width:0}.vehicle-dialog-icon{display:grid;flex:0 0 40px;width:40px;height:40px;place-items:center;color:#fff;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.17);border-radius:10px}.vehicle-dialog-title{font-size:17px;font-weight:850;line-height:1.2}.vehicle-dialog-subtitle{margin-top:3px;overflow:hidden;color:#dbe7ff;font-size:11px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.vehicle-dialog-progress{display:flex;align-items:flex-end;flex-direction:column}.vehicle-dialog-progress span{color:#b8cbf5;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.vehicle-dialog-progress strong{margin-top:2px;font-size:12px;font-weight:800}.vehicle-dialog-close{color:#fff!important;border-radius:9px!important}.vehicle-dialog-body{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;height:100%;overflow:hidden;background:#f6f8fb}.vehicle-dialog-body :deep(.v-field){border-radius:9px}.vehicle-dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.vehicle-dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.vehicle-progress-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;flex-shrink:0;padding:18px 24px;background:#fff;border-bottom:1px solid #e5eaf2}.vehicle-progress-item{display:flex;align-items:center;gap:11px;min-width:0;padding:12px 14px;background:#f8fafc;border:1px solid #e5eaf2;border-radius:11px}.vehicle-progress-number{display:grid;flex:0 0 34px;height:34px;place-items:center;color:#475569;background:#e8edf4;border-radius:10px;font-weight:800}.vehicle-progress-copy{display:flex;min-width:0;flex-direction:column;gap:3px}.vehicle-progress-copy>span{color:#64748b;font-size:10px;font-weight:750;letter-spacing:.06em;text-transform:uppercase}.vehicle-progress-copy strong{overflow:hidden;color:#334155;font-size:13px;line-height:1.3;text-overflow:ellipsis;white-space:nowrap}.vehicle-progress-item--active{background:#eef3ff;border-color:#a8bff8;box-shadow:0 3px 10px #2454d610}.vehicle-progress-item--active .vehicle-progress-number{color:#fff;background:#2454d6}.vehicle-progress-item--active strong{color:#183d9c}.vehicle-progress-item--complete .vehicle-progress-number{color:#16875a;background:#e0f5eb}.vehicle-form{display:grid;grid-template-columns:minmax(0,1fr) 300px;flex:1;min-width:0;min-height:0;height:auto;overflow:hidden}.vehicle-stepper{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;width:100%;height:100%;overflow:hidden;background:transparent!important;box-shadow:none!important}.vehicle-stepper :deep(.v-stepper-header){display:none!important}.vehicle-stepper :deep(.v-stepper-window),.vehicle-stepper :deep(.v-window),.vehicle-stepper :deep(.v-window__container),.vehicle-stepper :deep(.v-stepper-window-item),.vehicle-stepper :deep(.v-stepper-window-item>.v-window-item){display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;width:100%;height:100%;margin:0;overflow:hidden}.vehicle-step-pane{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;width:100%;height:100%;padding:20px 22px 0;overflow:hidden}.vehicle-step-content{display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;width:100%;height:auto;padding:0 2px 4px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}.vehicle-step-content :deep(.v-row){width:auto;max-width:none;margin-right:0!important;margin-left:0!important}.vehicle-step-actions{display:flex;align-items:center;flex:0 0 auto;gap:9px;margin-top:14px;padding:14px 0 calc(14px + env(safe-area-inset-bottom));background:#f6f8fb;border-top:1px solid #dfe5ed;box-shadow:0 -8px 16px #f6f8fb}.vehicle-step-actions .save-button{min-width:172px}.vehicle-form-intro{display:flex;align-items:center;gap:11px;min-width:0;margin:-2px 0 17px;padding:14px;color:#1e293b;background:linear-gradient(100deg,#f4f7ff,#f8fbff);border:1px solid #dfe7fb;border-radius:10px}.vehicle-form-intro-icon{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;color:#2454d6;background:#fff;border:1px solid #dce6ff;border-radius:9px}.vehicle-form-intro-icon--green{color:#16875a;background:#eaf8f1;border-color:#d7f1e5}.vehicle-form-intro>div:last-child{display:flex;min-width:0;flex-direction:column}.vehicle-form-intro strong{color:#0f172a;font-size:15px;font-weight:850}.vehicle-form-intro span{margin-top:2px;color:#64748b;font-size:11px;font-weight:600;line-height:1.45}.vehicle-live-summary{min-width:0;min-height:0;padding:22px 18px;overflow-x:hidden;overflow-y:auto;background:#fff;border-left:1px solid #e1e8f1}.vehicle-summary-heading{display:flex;align-items:center;gap:9px;min-width:0;margin-bottom:20px;color:#2454d6}.vehicle-summary-heading strong{display:block;color:#0f172a;font-size:16px;font-weight:800}.vehicle-summary-heading span{display:block;margin-top:3px;color:#64748b;font-size:11px}.vehicle-summary-card{min-width:0;padding:15px;margin-bottom:14px;background:#fff;border:1px solid #e4eaf3;border-radius:12px}.vehicle-summary-card--main{background:linear-gradient(145deg,#f0f5ff,#fff);border-color:#dce6fb}.vehicle-summary-eyebrow{margin-bottom:11px;color:#526176;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.vehicle-summary-image{max-width:100%;margin-bottom:12px;background:#f5f8fc;border-radius:9px}.vehicle-summary-image :deep(.v-img__img){object-fit:cover}.vehicle-summary-image--empty,.vehicle-summary-image-fallback{display:grid;place-items:center;width:100%;height:130px;color:#7692be;background:#f5f8fc;border-radius:9px}.vehicle-summary-image--empty{gap:3px}.vehicle-summary-image--empty span{font-size:10px;font-weight:700}.vehicle-summary-plate{display:block;overflow:hidden;color:#183d9c;font-size:17px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.vehicle-summary-name{max-width:100%;margin-top:3px;overflow:hidden;color:#475569;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.vehicle-summary-meta{display:flex;flex-wrap:wrap;gap:6px;max-width:100%;margin-top:10px}.vehicle-summary-meta>span{display:flex;align-items:center;gap:4px;padding:4px 6px;color:#475569;background:#f1f5f9;border-radius:5px;font-size:10px}.vehicle-summary-list{display:flex;min-width:0;flex-direction:column;gap:9px}.vehicle-summary-list-item{display:flex;align-items:flex-start;gap:8px;min-width:0}.vehicle-summary-list-item>div{display:flex;min-width:0;flex-direction:column;gap:2px}.vehicle-summary-list-item strong{overflow:hidden;color:#1e293b;font-size:11.5px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.vehicle-summary-list-item span:not(.vehicle-summary-list-icon):not(.vehicle-summary-priority){overflow:hidden;color:#64748b;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.vehicle-summary-list-icon,.vehicle-summary-priority{display:grid;flex:0 0 24px;width:24px;height:24px;place-items:center;color:#16875a;background:#eaf8f1;border-radius:7px}.vehicle-summary-priority{color:#2454d6;background:#eef3ff;font-size:11px;font-weight:850}.vehicle-summary-more{display:block;margin-top:9px;color:#2454d6;font-size:10px;font-weight:800}.vehicle-summary-empty{display:flex;align-items:flex-start;gap:7px;color:#64748b;font-size:10.5px;line-height:1.45}.vehicle-summary-empty .v-icon{flex-shrink:0;color:#7692be}.vehicle-summary-note{display:flex;align-items:flex-start;gap:6px;color:#64748b;font-size:10.5px;line-height:1.6}.vehicle-summary-note .v-icon{flex-shrink:0;margin-top:2px}.vehicle-summary-route-list .vehicle-summary-list-item strong{color:#183d9c}.vehicle-dialog .form-section-label{margin-top:0}.vehicle-dialog .form-section-label--spaced{margin-top:9px}
@media(max-width:1199px){.vehicle-form{grid-template-columns:minmax(0,1fr) 260px}.vehicle-live-summary{padding:16px 12px}.vehicle-step-pane{padding-inline:14px}}
@media(max-width:959px){.vehicle-form{display:flex;flex-direction:column}.vehicle-live-summary{order:-1;display:flex;gap:10px;flex:0 0 auto;max-height:180px;padding:10px 14px;border-bottom:1px solid #e1e8f1;border-left:0;overflow:auto}.vehicle-summary-heading{display:none}.vehicle-summary-card{flex:1 0 220px;margin:0;padding:10px 12px}.vehicle-summary-card--main{display:flex;align-items:center;gap:9px}.vehicle-summary-card--main .vehicle-summary-eyebrow{display:none}.vehicle-summary-card--main .vehicle-summary-image,.vehicle-summary-card--main .vehicle-summary-image--empty,.vehicle-summary-card--main .vehicle-summary-image-fallback{flex:0 0 62px;width:62px;height:62px;margin:0}.vehicle-summary-card--main .vehicle-summary-plate,.vehicle-summary-card--main .vehicle-summary-name,.vehicle-summary-card--main .vehicle-summary-meta{margin-top:0}.vehicle-summary-card--main .vehicle-summary-name{max-width:145px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vehicle-summary-card--main .vehicle-summary-meta{display:none}.vehicle-summary-note{display:none}.vehicle-stepper{height:auto;flex:1 1 auto}.vehicle-step-actions .save-button{min-width:145px}.vehicle-progress-nav{padding:10px 14px;gap:7px}.vehicle-progress-item{padding:9px;gap:7px}.vehicle-progress-copy strong{font-size:11px}.vehicle-progress-number{flex-basis:28px;height:28px}}
@media(max-width:600px){.vehicle-dialog-header{grid-template-columns:minmax(0,1fr) 42px;padding:10px 12px}.vehicle-dialog-progress{display:none}.vehicle-dialog-subtitle{max-width:230px}.vehicle-progress-nav{grid-template-columns:repeat(2,minmax(0,1fr));padding:10px;gap:7px}.vehicle-progress-copy>span{font-size:9px}.vehicle-progress-copy strong{font-size:10.5px}.vehicle-step-pane{padding:14px 12px 0}.vehicle-step-content{padding-inline:0}.vehicle-form-intro{align-items:flex-start;padding:12px}.vehicle-form-intro strong{font-size:13px}.vehicle-form-intro span{font-size:10.5px}.vehicle-step-actions{flex-wrap:wrap;padding-bottom:12px}.vehicle-step-actions .save-button{min-width:0;flex:1}.vehicle-step-actions .cancel-button{min-width:82px}.vehicle-summary-card{flex-basis:205px}.vehicle-summary-card--main .vehicle-summary-name{max-width:125px}.branch-association-row,.route-preference-row{align-items:flex-start;flex-direction:column}.branch-row-actions,.route-row-actions{width:100%;justify-content:flex-end}.branch-caption,.route-caption{max-width:245px}.vehicle-live-summary{max-height:160px}}
.vehicle-continue-button{min-width:156px!important;min-height:38px!important;background:linear-gradient(100deg,#315acb,#4d73d9)!important;border-radius:10px!important;font-size:12px!important;font-weight:750!important;box-shadow:0 3px 8px rgba(36,84,214,.14)!important}.vehicle-continue-button:hover{background:linear-gradient(100deg,#2d54bd,#466bd0)!important;box-shadow:0 4px 10px rgba(36,84,214,.18)!important}
</style>

<style scoped>
.route-preference-panel{margin-top:14px;padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.route-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.route-search-button:hover{background:#eef3ff}.route-search-field{margin-bottom:9px}.route-preference-list{max-height:300px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.route-preference-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;cursor:grab;border-bottom:1px solid #eef2f6;transition:background-color .15s ease,box-shadow .15s ease}.route-preference-row:active{cursor:grabbing}.route-preference-row:last-child{border-bottom:0}.route-preference-row--selected{background:#fbfdff}.route-preference-row--drag-over{box-shadow:inset 0 2px 0 #2454d6}.route-summary{display:flex;align-items:center;gap:9px;min-width:0}.route-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.route-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.route-caption{display:flex;align-items:center;gap:3px;overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.route-row-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}.route-drag-handle{color:#94a3b8;cursor:grab}.action-button--selected{color:#16875a!important}.action-button--selected:hover{background:#eaf8f1}.selection-summary--warning{color:#8a5b08;background:#fff6e6;border-color:#f6e5be}@media(max-width:600px){.route-preference-row{align-items:flex-start;flex-direction:column}.route-row-actions{width:100%;justify-content:flex-end}.route-caption{max-width:245px}}
</style>

<style>
.vehicle-route-select-menu .v-list{padding:6px!important}.vehicle-route-select-menu .v-list-item{min-height:54px;margin:2px 0;border-radius:9px}.vehicle-route-select-menu .v-list-item:hover{background:#f4f7ff}.vehicle-route-select-menu .v-list-item__prepend{margin-inline-end:12px!important}.vehicle-route-select-menu .v-list-item-subtitle{color:#64748b!important;font-size:10.5px!important;font-weight:650!important;opacity:1!important}.vehicle-route-select-menu .route-avatar{flex:0 0 36px;width:36px;height:36px}.route-selection-heading{margin-top:13px;color:#475569;font-size:11px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}.route-selection-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.selected-route-chip{max-width:100%;color:#2454d6!important;background:#eef3ff!important;font-size:11px!important;font-weight:750!important}.selected-route-chip .v-chip__content{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selected-route-chip .v-chip__close{color:#64748b!important}.selected-route-chip .v-chip__close:hover{color:#dc2626!important}
</style>
