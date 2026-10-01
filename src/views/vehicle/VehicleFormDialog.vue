<template>
  <v-dialog v-model="isOpen" max-width="780" persistent>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-card class="form-dialog" elevation="0">
        <div class="dialog-header">
          <div class="dialog-heading">
            <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-bus</v-icon><v-icon class="dialog-icon-action" size="11">{{ isCreating ? "mdi-plus" : "mdi-pencil" }}</v-icon></div>
            <div><div class="dialog-title">{{ isCreating ? "Agregar vehículo" : "Editar vehículo" }}</div><div class="dialog-subtitle">{{ isCreating ? "Registra un nuevo vehículo en la flota" : "Actualiza el vehículo y sus asociaciones" }}</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
        </div>
        <v-divider />

        <v-card-text class="dialog-body">
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

          <div class="form-section-label form-section-label--spaced">Sucursales del vehículo</div>
          <section class="branch-association-panel">
            <div class="association-heading">
              <div class="association-heading-icon"><v-icon size="19">mdi-store-marker-outline</v-icon></div>
              <div><div class="association-heading-title">Asociación opcional</div><div class="association-heading-copy">Configura una o varias sucursales y guarda todo junto con el vehículo.</div></div>
              <v-tooltip :text="branchSearchOpen ? 'Ocultar búsqueda' : 'Buscar sucursal'" location="top">
                <template #activator="{ props }"><v-btn v-bind="props" :icon="branchSearchOpen ? 'mdi-close' : 'mdi-magnify'" variant="text" size="small" class="branch-search-button" :aria-label="branchSearchOpen ? 'Ocultar búsqueda' : 'Buscar sucursal'" @click="toggleBranchSearch" /></template>
              </v-tooltip>
            </div>
            <v-expand-transition>
              <v-text-field v-if="branchSearchOpen" v-model.trim="branchSearch" class="branch-search-field" prepend-inner-icon="mdi-magnify" label="Buscar por sucursal, dirección o RUT" variant="outlined" density="compact" hide-details clearable autofocus />
            </v-expand-transition>
            <div v-if="filteredBranchRows.length" class="branch-association-list">
              <div v-for="branch in filteredBranchRows" :key="branch.id" class="branch-association-row">
                <div class="branch-summary">
                  <div class="branch-avatar"><v-img v-if="branchImage(branch)" :src="branchImage(branch)" width="36" height="36" cover><template #error><div class="image-fallback"><v-icon size="18">mdi-store</v-icon></div></template></v-img><v-icon v-else size="18">mdi-store</v-icon></div>
                  <div class="cell-copy"><div class="branch-name">{{ branch.name }}</div><div class="branch-caption">{{ branch.address }}</div></div>
                </div>
                <div class="branch-row-actions">
                  <span class="status-badge" :class="branch.associated ? 'status-badge--active' : 'status-badge--available'"><span class="status-dot" />{{ branch.associated ? "Asociada" : "Disponible" }}</span>
                  <v-tooltip :text="branch.associated ? 'Desasociar sucursal' : 'Asociar sucursal'" location="top"><template #activator="{ props }"><v-btn v-bind="props" :icon="branch.associated ? 'mdi-trash-can-outline' : 'mdi-link-variant-plus'" variant="text" size="small" :class="['action-button', branch.associated ? 'action-button--delete' : 'action-button--associate']" :disabled="loading" @click="toggleBranchAssociation(branch)" /></template></v-tooltip>
                </div>
              </div>
            </div>
            <div v-else class="association-empty"><v-icon size="19">{{ branchSearch ? "mdi-magnify-close" : "mdi-store-off-outline" }}</v-icon><span>{{ branchSearch ? "No hay sucursales que coincidan con la búsqueda." : "No hay sucursales disponibles para administrar." }}</span></div>
            <div class="selection-summary"><v-icon size="18">mdi-information-outline</v-icon><span>{{ branchChanges.length ? `${branchChanges.length} cambio(s) de asociación pendiente(s)` : "Asociar sucursales es opcional." }}</span></div>
          </section>

          <template v-if="selectedBranchIds.length">
            <div class="form-section-label form-section-label--spaced">Rutas preferentes</div>
            <section class="route-preference-panel">
              <div class="association-heading">
                <div class="association-heading-icon"><v-icon size="19">mdi-road-variant</v-icon></div>
                <div><div class="association-heading-title">Preferencias opcionales</div><div class="association-heading-copy">Selecciona hasta 3 rutas y define el orden para las sucursales seleccionadas.</div></div>
                <v-tooltip :text="routeSearchOpen ? 'Ocultar búsqueda' : 'Buscar ruta'" location="top">
                  <template #activator="{ props }"><v-btn v-bind="props" :icon="routeSearchOpen ? 'mdi-close' : 'mdi-magnify'" variant="text" size="small" class="route-search-button" :aria-label="routeSearchOpen ? 'Ocultar búsqueda' : 'Buscar ruta'" @click="toggleRouteSearch" /></template>
                </v-tooltip>
              </div>
              <v-expand-transition>
                <v-text-field v-if="routeSearchOpen" v-model.trim="routeSearch" class="route-search-field" prepend-inner-icon="mdi-magnify" label="Buscar por código, nombre, origen o destino" variant="outlined" density="compact" hide-details clearable autofocus />
              </v-expand-transition>
              <div v-if="filteredRouteRows.length" class="route-preference-list">
                <div v-for="route in filteredRouteRows" :key="route.id" class="route-preference-row" :class="{ 'route-preference-row--selected': route.selected }">
                  <div class="route-summary">
                    <div class="route-avatar"><v-icon size="18">mdi-road-variant</v-icon></div>
                    <div class="cell-copy"><div class="route-name">{{ route.code }} · {{ route.name }}</div><div class="route-caption">{{ route.originName }} <v-icon size="12">mdi-arrow-right</v-icon> {{ route.destinationName }} · Disponible en {{ route.availableBranchIds.length }} sucursal(es)</div></div>
                  </div>
                  <div class="route-row-actions">
                    <span class="status-badge" :class="route.selected ? 'status-badge--active' : 'status-badge--available'"><span class="status-dot" />{{ route.selected ? `Prioridad ${route.priority}` : "Disponible" }}</span>
                    <v-select v-if="route.selected" :model-value="route.priority" :items="priorityOptionsFor(route.id)" label="Prioridad" density="compact" variant="outlined" hide-details class="route-priority-select" @update:model-value="setRoutePriority(route.id, $event)" />
                    <v-tooltip :text="route.selected ? 'Quitar ruta preferente' : 'Agregar ruta preferente'" location="top"><template #activator="{ props }"><v-btn v-bind="props" :icon="route.selected ? 'mdi-check-circle' : 'mdi-plus-circle-outline'" variant="text" size="small" :class="['action-button', route.selected ? 'action-button--selected' : 'action-button--associate']" :disabled="loading" @click="toggleRoutePreference(route)" /></template></v-tooltip>
                  </div>
                </div>
              </div>
              <div v-else class="association-empty"><v-icon size="19">{{ routeSearch ? "mdi-magnify-close" : "mdi-road-variant-off" }}</v-icon><span>{{ routeSearch ? "No hay rutas que coincidan con la búsqueda." : "Las sucursales seleccionadas no tienen rutas asociadas." }}</span></div>
              <div class="selection-summary" :class="{ 'selection-summary--warning': selectedRouteCount >= 3 }"><v-icon size="18">mdi-information-outline</v-icon><span>{{ selectedRouteCount }}/3 rutas preferentes seleccionadas. Solo se enviarán para las sucursales que tengan asociada cada ruta.</span></div>
            </section>
          </template>

          <div class="status-control">
            <div><div class="status-control-title">Estado del vehículo</div><div class="status-control-description">Los vehículos inactivos no estarán disponibles para la operación.</div></div>
            <div class="status-switch" :class="Number(formItem.state) === 1 ? 'is-active' : 'is-inactive'"><span>{{ Number(formItem.state) === 1 ? "Activo" : "Inactivo" }}</span><v-switch v-model="formItem.state" :true-value="1" :false-value="0" color="success" hide-details inset /></div>
          </div>

          <div class="form-section-label form-section-label--spaced">Imagen del vehículo</div>
          <div class="image-upload-area"><div class="image-preview"><v-img v-if="imagePreview" :key="imagePreview" :src="imagePreview" width="88" height="88" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-bus</v-icon></div></div><div class="upload-copy"><div class="upload-title">Fotografía del vehículo</div><div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @update:model-value="onFileSelected" /></div></div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear vehículo" : "Guardar cambios" }}</v-btn></v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="snackbarTimeout" :color="snackbarType" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="snackbarIcon" size="22" /><div><div class="snackbar-title">{{ snackbarTitle }}</div><div class="snackbar-message">{{ snackbarMessage }}</div></div></div></v-snackbar>
</template>

<script>
export default {
  name: "VehicleFormDialog",
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
    branchSearch: "",
    branchSearchOpen: false,
    originalRoutePreferences: [],
    selectedRoutePriorities: {},
    routeSearch: "",
    routeSearchOpen: false,
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
    filteredBranchRows() {
      const search = this.branchSearch.toLowerCase().trim();
      if (!search) return this.branchRows;
      return this.branchRows.filter((branch) => [branch.id, branch.name, branch.address, branch.rut, branch.phone, branch.companyName].some((value) => String(value ?? "").toLowerCase().includes(search)));
    },
    selectedBranchIds() {
      return this.branchRows.filter((branch) => branch.associated).map((branch) => branch.id).filter(Boolean);
    },
    availableRoutes() {
      const selectedIds = new Set(this.selectedBranchIds.map((id) => String(id)));
      const routeMap = new Map();
      this.branchRows.filter((branch) => selectedIds.has(String(branch.id))).forEach((branch) => {
        this.toArray(branch.routes).forEach((route) => {
          const normalized = this.normalizeRoute(route);
          if (!normalized.id) return;
          const key = String(normalized.id);
          const current = routeMap.get(key) || { ...normalized, availableBranchIds: [] };
          if (!current.availableBranchIds.some((id) => String(id) === String(branch.id))) current.availableBranchIds.push(branch.id);
          routeMap.set(key, current);
        });
      });
      return Array.from(routeMap.values());
    },
    filteredRouteRows() {
      const search = this.routeSearch.toLowerCase().trim();
      const rows = this.availableRoutes.map((route) => ({ ...route, selected: Object.prototype.hasOwnProperty.call(this.selectedRoutePriorities, String(route.id)), priority: this.selectedRoutePriorities[String(route.id)] ?? null }));
      const filtered = search
        ? rows.filter((route) => [route.id, route.code, route.name, route.originName, route.destinationName].some((value) => String(value ?? "").toLowerCase().includes(search)))
        : rows;
      return filtered.sort((a, b) => {
        if (a.selected && b.selected) return Number(a.priority) - Number(b.priority);
        if (a.selected) return -1;
        if (b.selected) return 1;
        return 0;
      });
    },
    selectedRouteCount() {
      const availableIds = new Set(this.availableRoutes.map((route) => String(route.id)));
      return Object.keys(this.selectedRoutePriorities).filter((routeId) => availableIds.has(String(routeId))).length;
    },
    desiredRoutePreferences() {
      const availableById = new Map(this.availableRoutes.map((route) => [String(route.id), route]));
      const selectedBranches = this.branchRows.filter((branch) => branch.associated);
      const preferences = [];
      Object.entries(this.selectedRoutePriorities).forEach(([routeId, priority]) => {
        const route = availableById.get(String(routeId));
        if (!route) return;
        route.availableBranchIds.forEach((branchId) => {
          if (!selectedBranches.some((branch) => String(branch.id) === String(branchId))) return;
          preferences.push({ vehicle_id: this.vehicle?.id ?? this.formItem?.id ?? null, branch_id: branchId, route_id: route.id, priority: Number(priority) });
        });
      });
      return preferences;
    },
    routePreferenceChanges() {
      const originalByKey = new Map(this.originalRoutePreferences.map((preference) => [`${preference.branch_id}:${preference.route_id}`, preference]));
      const desiredByKey = new Map(this.desiredRoutePreferences.map((preference) => [`${preference.branch_id}:${preference.route_id}`, preference]));
      const changes = [];
      originalByKey.forEach((original, key) => {
        const desired = desiredByKey.get(key);
        if (!desired) {
          changes.push({ association_id: original.id ?? null, vehicle_id: original.vehicle_id ?? this.vehicle?.id ?? this.formItem?.id ?? null, branch_id: original.branch_id, route_id: original.route_id, priority: original.priority, action: "delete" });
        } else if (Number(original.priority) !== Number(desired.priority)) {
          changes.push({ association_id: original.id ?? null, vehicle_id: desired.vehicle_id, branch_id: desired.branch_id, route_id: desired.route_id, priority: desired.priority, action: "update" });
        }
      });
      desiredByKey.forEach((desired, key) => {
        if (!originalByKey.has(key)) changes.push({ association_id: null, vehicle_id: desired.vehicle_id, branch_id: desired.branch_id, route_id: desired.route_id, priority: desired.priority, action: "associate" });
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
      this.originalRoutePreferences = this.isCreating ? [] : this.toArray(rawRoutePreferences).map((preference) => this.normalizeRoutePreference(preference)).filter((preference) => preference.branch_id && preference.route_id);
      this.selectedRoutePriorities = this.originalRoutePreferences.reduce((priorities, preference) => {
        const routeId = String(preference.route_id);
        const current = priorities[routeId];
        if (current === undefined || Number(preference.priority) < Number(current)) priorities[routeId] = Number(preference.priority);
        return priorities;
      }, {});
      this.branchSearch = "";
      this.branchSearchOpen = false;
      this.routeSearch = "";
      this.routeSearchOpen = false;
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
      const branch = preference.branch || {};
      return { ...preference, id: preference.id ?? preference.preference_id ?? preference.preferenceId ?? "", vehicle_id: preference.vehicle_id ?? preference.vehicleId ?? this.vehicle?.id ?? null, branch_id: preference.branch_id ?? preference.branchId ?? branch.id ?? "", route_id: preference.route_id ?? preference.routeId ?? route.id ?? "", priority: Number(preference.priority) || 1 };
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
    toggleBranchSearch() { this.branchSearchOpen = !this.branchSearchOpen; if (!this.branchSearchOpen) this.branchSearch = ""; },
    toggleRouteSearch() { this.routeSearchOpen = !this.routeSearchOpen; if (!this.routeSearchOpen) this.routeSearch = ""; },
    priorityOptionsFor(routeId) {
      const current = Number(this.selectedRoutePriorities[String(routeId)]);
      const used = new Set(Object.entries(this.selectedRoutePriorities).filter(([id]) => String(id) !== String(routeId)).map(([, priority]) => Number(priority)));
      return [1, 2, 3].filter((priority) => priority === current || !used.has(priority));
    },
    pruneRouteSelections() {
      // Al reemplazar una sucursal puede existir un momento intermedio sin
      // sucursales seleccionadas. No se deben borrar las preferencias en ese
      // momento: la nueva sucursal puede tener las mismas rutas y esas
      // preferencias deben trasladarse al guardar.
      if (!this.selectedBranchIds.length) return;
      const availableIds = new Set(this.availableRoutes.map((route) => String(route.id)));
      const next = Object.fromEntries(Object.entries(this.selectedRoutePriorities).filter(([routeId]) => availableIds.has(String(routeId))));
      if (Object.keys(next).length !== Object.keys(this.selectedRoutePriorities).length) this.selectedRoutePriorities = next;
    },
    toggleRoutePreference(route) {
      const routeId = String(route?.id ?? "");
      if (!routeId) return;
      const next = { ...this.selectedRoutePriorities };
      if (Object.prototype.hasOwnProperty.call(next, routeId)) {
        delete next[routeId];
      } else {
        if (this.selectedRouteCount >= 3) { this.notify("warning", "Solo puedes seleccionar hasta 3 rutas preferentes."); return; }
        const used = new Set(Object.values(next).map((priority) => Number(priority)));
        next[routeId] = [1, 2, 3].find((priority) => !used.has(priority)) || 1;
      }
      this.selectedRoutePriorities = next;
    },
    setRoutePriority(routeId, priority) {
      const value = Number(priority);
      if (![1, 2, 3].includes(value)) return;
      const next = { ...this.selectedRoutePriorities };
      const conflictingRouteId = Object.keys(next).find((id) => String(id) !== String(routeId) && Number(next[id]) === value);
      if (conflictingRouteId) {
        const current = Number(next[String(routeId)]);
        next[conflictingRouteId] = current;
      }
      next[String(routeId)] = value;
      this.selectedRoutePriorities = next;
    },
    toggleBranchAssociation(branch) {
      if (!branch) return;
      if (branch.associated && !branch.relationId) { this.notify("warning", "No se pudo identificar la asociación de la sucursal."); return; }
      branch.associated = !branch.associated;
      this.pruneRouteSelections();
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
    async submit() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      this.$emit("save", { item: { ...this.formItem }, file: this.file, branches: this.branchChanges, routePreferences: this.routePreferenceChanges });
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

<style scoped>
.route-preference-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.route-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.route-search-button:hover{background:#eef3ff}.route-search-field{margin-bottom:9px}.route-preference-list{max-height:300px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.route-preference-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eef2f6}.route-preference-row:last-child{border-bottom:0}.route-preference-row--selected{background:#fbfdff}.route-summary{display:flex;align-items:center;gap:9px;min-width:0}.route-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.route-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.route-caption{display:flex;align-items:center;gap:3px;overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.route-row-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}.route-priority-select{width:94px}.route-priority-select :deep(.v-field){min-height:36px!important}.action-button--selected{color:#16875a!important}.action-button--selected:hover{background:#eaf8f1}.selection-summary--warning{color:#8a5b08;background:#fff6e6;border-color:#f6e5be}@media(max-width:600px){.route-preference-row{align-items:flex-start;flex-direction:column}.route-row-actions{width:100%;justify-content:flex-end}.route-caption{max-width:245px}.route-priority-select{width:105px}}
</style>
