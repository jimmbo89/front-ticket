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
                <div class="vehicle-step-actions"><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-spacer /><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="nextStep">Continuar a sucursales</v-btn><v-btn type="button" class="save-button" elevation="0" :loading="loading" :disabled="loading" @click="saveVehicle">{{ isCreating ? "Crear vehículo" : "Guardar cambios" }}</v-btn></div>
              </div>
            </template>

            <template v-slot:[`item.2`]>
              <div class="vehicle-step-pane">
                <div class="vehicle-step-content">
                  <div class="vehicle-form-intro"><div class="vehicle-form-intro-icon vehicle-form-intro-icon--green"><v-icon size="21">mdi-store-marker-outline</v-icon></div><div><strong>Sucursales y rutas preferentes</strong><span>Asocia las sucursales del vehículo y ordena las rutas que tendrán prioridad.</span></div></div>
                  <div class="form-section-label">Sucursales del vehículo</div>
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
                      <div v-for="branch in filteredBranchRows" :key="branch.id" :class="['branch-association-row', branch.associated ? 'branch-association-row--associated' : 'branch-association-row--available']">
                        <div class="branch-summary">
                          <div class="branch-avatar"><v-img v-if="branchImage(branch)" :src="branchImage(branch)" width="36" height="36" cover><template #error><div class="image-fallback"><v-icon size="18">mdi-store</v-icon></div></template></v-img><v-icon v-else size="18">mdi-store</v-icon></div>
                          <div class="cell-copy">
                            <v-tooltip :disabled="!isBranchNameTruncated(branch)" :text="`${branch.name} · ${branch.address}`" location="top" max-width="320">
                              <template #activator="{ props }"><div v-bind="props" class="branch-name" :data-branch-name="branch.id">{{ branch.name }}</div></template>
                            </v-tooltip>
                            <div class="branch-caption">{{ branch.address }}</div>
                          </div>
                        </div>
                        <div class="branch-row-actions">
                          <v-tooltip :text="branch.associated ? 'Asociada · Desasociar sucursal' : 'Disponible · Asociar sucursal'" location="top"><template #activator="{ props }"><v-btn v-bind="props" :title="branch.associated ? 'Asociada · Desasociar sucursal' : 'Disponible · Asociar sucursal'" :icon="branch.associated ? 'mdi-trash-can-outline' : 'mdi-link-variant-plus'" variant="text" size="small" :class="['action-button', branch.associated ? 'action-button--delete' : 'action-button--associate']" :disabled="loading" @click="toggleBranchAssociation(branch)" /></template></v-tooltip>
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
                        <div><div class="association-heading-title">Preferencias opcionales</div><div class="association-heading-copy">Arrastra las rutas para definir tus preferencias. Las tres primeras serán preferentes según el orden establecido.</div></div>
                        <v-tooltip :text="routeSearchOpen ? 'Ocultar búsqueda' : 'Buscar ruta'" location="top">
                          <template #activator="{ props }"><v-btn v-bind="props" :icon="routeSearchOpen ? 'mdi-close' : 'mdi-magnify'" variant="text" size="small" class="route-search-button" :aria-label="routeSearchOpen ? 'Ocultar búsqueda' : 'Buscar ruta'" @click="toggleRouteSearch" /></template>
                        </v-tooltip>
                      </div>
                      <v-expand-transition>
                        <v-text-field v-if="routeSearchOpen" v-model.trim="routeSearch" class="route-search-field" prepend-inner-icon="mdi-magnify" label="Buscar por código, nombre, origen o destino" variant="outlined" density="compact" hide-details clearable autofocus />
                      </v-expand-transition>
                      <div class="route-preference-zones">
                        <section class="route-preference-zone route-preference-zone--preferred">
                          <div class="route-zone-heading">
                            <div><strong>Rutas preferentes</strong><span>Arrastra aquí hasta 3 rutas. El orden define la prioridad.</span></div>
                            <span class="route-zone-count">{{ selectedRouteCount }}/3</span>
                          </div>
                          <div v-if="filteredPreferredRouteRows.length" class="route-preference-list">
                            <div v-for="route in filteredPreferredRouteRows" :key="`preferred-${route.id}`" class="route-preference-row" :class="{ 'route-preference-row--selected': route.selected, 'route-preference-row--dragging': draggedRouteId === String(route.id), 'route-preference-row--drag-over': dragOverRouteId === String(route.id) && dragOverRouteZone === 'preferred' }" :draggable="!loading" @dragstart="startRouteDrag(route, 'preferred', $event)" @dragover.prevent="dragOverRoute(route, 'preferred', $event)" @drop.prevent="dropRoute(route, 'preferred', $event)" @dragend="endRouteDrag">
                              <div class="route-summary">
                                <div class="route-avatar"><v-icon size="18">mdi-road-variant</v-icon></div>
                                <div class="cell-copy"><div class="route-name">{{ route.code }} · {{ route.name }}</div><div class="route-caption">{{ route.originName }} <v-icon size="12">mdi-arrow-right</v-icon> {{ route.destinationName }} · Disponible en {{ route.availableBranchIds.length }} sucursal(es)</div></div>
                              </div>
                              <div class="route-row-actions">
                                <span class="status-badge status-badge--active"><span class="status-dot" />Prioridad {{ route.priority }}</span>
                                <v-icon class="route-drag-handle" size="20" aria-label="Arrastrar ruta">mdi-drag-vertical</v-icon>
                              </div>
                            </div>
                          </div>
                          <div v-else class="route-drop-zone" :class="{ 'route-drop-zone--active': draggedRouteId && dragOverRouteZone === 'preferred' }" @dragover.prevent="dragOverRoute(null, 'preferred', $event)" @drop.prevent="dropRoute(null, 'preferred', $event)">
                            <v-icon size="18">mdi-arrow-down-bold-circle-outline</v-icon><span>{{ routeSearch ? "No hay rutas preferentes que coincidan con la búsqueda." : "Arrastra aquí las rutas que quieras priorizar." }}</span>
                          </div>
                        </section>

                        <section class="route-preference-zone route-preference-zone--available">
                          <div class="route-zone-heading">
                            <div><strong>Rutas disponibles</strong><span>Arrastra una ruta a la zona preferente para agregarla.</span></div>
                            <span class="route-zone-count route-zone-count--muted">{{ filteredAvailableRouteRows.length }}</span>
                          </div>
                          <div v-if="filteredAvailableRouteRows.length" class="route-preference-list">
                            <div v-for="route in filteredAvailableRouteRows" :key="`available-${route.id}`" class="route-preference-row" :class="{ 'route-preference-row--dragging': draggedRouteId === String(route.id), 'route-preference-row--drag-over': dragOverRouteId === String(route.id) && dragOverRouteZone === 'available' }" :draggable="!loading" @dragstart="startRouteDrag(route, 'available', $event)" @dragover.prevent="dragOverRoute(route, 'available', $event)" @drop.prevent="dropRoute(route, 'available', $event)" @dragend="endRouteDrag">
                              <div class="route-summary">
                                <div class="route-avatar"><v-icon size="18">mdi-road-variant</v-icon></div>
                                <div class="cell-copy"><div class="route-name">{{ route.code }} · {{ route.name }}</div><div class="route-caption">{{ route.originName }} <v-icon size="12">mdi-arrow-right</v-icon> {{ route.destinationName }} · Disponible en {{ route.availableBranchIds.length }} sucursal(es)</div></div>
                              </div>
                              <div class="route-row-actions">
                                <span class="status-badge status-badge--available"><span class="status-dot" />Disponible</span>
                                <v-icon class="route-drag-handle" size="20" aria-label="Arrastrar ruta">mdi-drag-vertical</v-icon>
                              </div>
                            </div>
                          </div>
                          <div v-else class="association-empty"><v-icon size="19">{{ routeSearch ? "mdi-magnify-close" : "mdi-road-variant-off" }}</v-icon><span>{{ routeSearch ? "No hay rutas disponibles que coincidan con la búsqueda." : "No hay rutas disponibles." }}</span></div>
                        </section>
                      </div>
                      <div class="selection-summary"><v-icon size="18">mdi-information-outline</v-icon><span>{{ selectedRouteCount }}/3 rutas preferentes seleccionadas. Solo se enviarán para las sucursales que tengan asociada cada ruta.</span></div>
                    </section>
                  </template>
                </div>
                <v-divider />
                <div class="vehicle-step-actions"><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="prevStep">Volver</v-btn><v-spacer /><v-btn type="button" variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear vehículo" : "Guardar cambios" }}</v-btn></div>
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
              <div v-if="preferredRouteRows.length" class="vehicle-summary-list vehicle-summary-route-list">
                <div v-for="route in preferredRouteRows" :key="route.id" class="vehicle-summary-list-item"><span class="vehicle-summary-priority">{{ route.priority }}</span><div><strong>{{ route.code }}</strong><span>{{ route.name }}</span></div></div>
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
    branchTooltipState: {},
    branchTooltipSignature: "",
    branchTooltipResizeHandler: null,
    originalRoutePreferences: [],
    routeOrder: [],
    preferredRouteIds: [],
    draggedRouteId: "",
    draggedRouteZone: "",
    dragOverRouteId: "",
    dragOverRouteZone: "",
    dragPreviewElement: null,
    step: 1,
    stepItems: ["Datos del vehículo", "Sucursales y rutas"],
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
          const current = routeMap.get(key) || { ...normalized, availableBranchIds: [] };
          if (!current.availableBranchIds.some((id) => String(id) === String(branch.id))) current.availableBranchIds.push(branch.id);
          routeMap.set(key, current);
        });
      });
      return Array.from(routeMap.values());
    },
    orderedRouteRows() {
      const routesById = new Map(this.availableRoutes.map((route) => [String(route.id), route]));
      const preferredIds = this.preferredRouteIds.map((routeId) => String(routeId));
      const orderedIds = [
        ...preferredIds,
        ...this.routeOrder.map((routeId) => String(routeId)),
        ...this.availableRoutes.map((route) => String(route.id)),
      ].filter((routeId, index, ids) => routesById.has(routeId) && ids.indexOf(routeId) === index);
      return orderedIds.map((routeId, index) => ({
        ...routesById.get(routeId),
        selected: preferredIds.includes(routeId),
        priority: preferredIds.includes(routeId) ? preferredIds.indexOf(routeId) + 1 : null,
        position: index,
      }));
    },
    filteredRouteRows() {
      const search = this.routeSearch.toLowerCase().trim();
      return search
        ? this.orderedRouteRows.filter((route) => [route.id, route.code, route.name, route.originName, route.destinationName].some((value) => String(value ?? "").toLowerCase().includes(search)))
        : this.orderedRouteRows;
    },
    filteredPreferredRouteRows() {
      const search = this.routeSearch.toLowerCase().trim();
      const rows = this.preferredRouteRows;
      return search
        ? rows.filter((route) => [route.id, route.code, route.name, route.originName, route.destinationName].some((value) => String(value ?? "").toLowerCase().includes(search)))
        : rows;
    },
    filteredAvailableRouteRows() {
      const search = this.routeSearch.toLowerCase().trim();
      const rows = this.availableRouteRows;
      return search
        ? rows.filter((route) => [route.id, route.code, route.name, route.originName, route.destinationName].some((value) => String(value ?? "").toLowerCase().includes(search)))
        : rows;
    },
    selectedRouteCount() {
      return this.preferredRouteRows.length;
    },
    preferredRouteRows() {
      return this.orderedRouteRows.filter((route) => route.selected);
    },
    availableRouteRows() {
      return this.orderedRouteRows.filter((route) => !route.selected);
    },
    desiredRoutePreferences() {
      const availableById = new Map(this.availableRoutes.map((route) => [String(route.id), route]));
      const selectedBranches = this.branchRows.filter((branch) => branch.associated);
      const preferences = [];
      this.preferredRouteRows.slice(0, 3).forEach((route, index) => {
        const routeId = String(route.id);
        const priority = index + 1;
        const availableRoute = availableById.get(routeId);
        if (!availableRoute) return;
        availableRoute.availableBranchIds.forEach((branchId) => {
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
  mounted() {
    this.measureBranchTooltips();
    this.branchTooltipResizeHandler = () => this.measureBranchTooltips();
    window.addEventListener("resize", this.branchTooltipResizeHandler);
  },
  beforeUnmount() {
    if (this.branchTooltipResizeHandler) window.removeEventListener("resize", this.branchTooltipResizeHandler);
  },
  updated() {
    this.measureBranchTooltips();
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
      const preferredRouteIds = this.originalRoutePreferences
        .slice()
        .sort((a, b) => Number(a.priority) - Number(b.priority))
        .map((preference) => String(preference.route_id))
        .filter((routeId, index, routeIds) => routeIds.indexOf(routeId) === index);
      const availableRouteIds = this.availableRoutes.map((route) => String(route.id));
      const availableRouteIdSet = new Set(availableRouteIds);
      this.routeOrder = [
        ...preferredRouteIds.filter((routeId) => availableRouteIdSet.has(routeId)),
        ...availableRouteIds.filter((routeId) => !preferredRouteIds.includes(routeId)),
      ];
      this.preferredRouteIds = preferredRouteIds.filter((routeId) => availableRouteIdSet.has(routeId)).slice(0, 3);
      this.branchSearch = "";
      this.branchSearchOpen = false;
      this.routeSearch = "";
      this.routeSearchOpen = false;
      this.step = 1;
      this.endRouteDrag();
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
    isBranchNameTruncated(branch) { return Boolean(this.branchTooltipState[String(branch?.id)]); },
    measureBranchTooltips() {
      this.$nextTick(() => {
        const nextState = {};
        this.$el?.querySelectorAll?.("[data-branch-name]").forEach((element) => {
          const branchId = element.dataset.branchName;
          const isTruncated = element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1;
          if (isTruncated) nextState[String(branchId)] = true;
        });
        const signature = JSON.stringify(nextState);
        if (signature === this.branchTooltipSignature) return;
        this.branchTooltipSignature = signature;
        this.branchTooltipState = nextState;
      });
    },
    toggleBranchSearch() { this.branchSearchOpen = !this.branchSearchOpen; if (!this.branchSearchOpen) this.branchSearch = ""; },
    toggleRouteSearch() { this.routeSearchOpen = !this.routeSearchOpen; if (!this.routeSearchOpen) this.routeSearch = ""; },
    pruneRouteOrder() {
      // Al reemplazar una sucursal puede existir un momento intermedio sin
      // sucursales seleccionadas. No se deben borrar las preferencias en ese
      // momento: la nueva sucursal puede tener las mismas rutas y esas
      // preferencias deben trasladarse al guardar.
      if (!this.selectedBranchIds.length) return;
      const availableIds = new Set(this.availableRoutes.map((route) => String(route.id)));
      const nextPreferredIds = this.preferredRouteIds.map((routeId) => String(routeId)).filter((routeId) => availableIds.has(routeId)).slice(0, 3);
      const next = this.routeOrder.map((routeId) => String(routeId)).filter((routeId) => availableIds.has(routeId));
      const orderedIds = new Set(next);
      this.availableRoutes.forEach((route) => {
        const routeId = String(route.id);
        if (!orderedIds.has(routeId)) {
          next.push(routeId);
          orderedIds.add(routeId);
        }
      });
      if (next.length !== this.routeOrder.length || next.some((routeId, index) => routeId !== String(this.routeOrder[index]))) this.routeOrder = next;
      if (nextPreferredIds.length !== this.preferredRouteIds.length || nextPreferredIds.some((routeId, index) => routeId !== String(this.preferredRouteIds[index]))) this.preferredRouteIds = nextPreferredIds;
    },
    startRouteDrag(route, zone, event) {
      if (this.loading || !route?.id) return;
      this.draggedRouteId = String(route.id);
      this.draggedRouteZone = zone;
      this.dragOverRouteId = this.draggedRouteId;
      this.dragOverRouteZone = zone;
      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", this.draggedRouteId);
        const source = event.currentTarget;
        if (source) {
          const preview = source.cloneNode(true);
          const bounds = source.getBoundingClientRect();
          preview.classList.add("route-preference-row--dragging");
          preview.style.position = "fixed";
          preview.style.top = "-1000px";
          preview.style.left = "-1000px";
          preview.style.width = `${bounds.width}px`;
          preview.style.pointerEvents = "none";
          preview.style.opacity = "1";
          document.body.appendChild(preview);
          this.dragPreviewElement = preview;
          event.dataTransfer.setDragImage(preview, Math.min(24, bounds.width / 2), Math.min(24, bounds.height / 2));
        }
      }
    },
    dragOverRoute(route, zone, event) {
      if (this.loading || !this.draggedRouteId || !zone) return;
      if (event?.dataTransfer) event.dataTransfer.dropEffect = "move";
      this.dragOverRouteId = route?.id ? String(route.id) : "";
      this.dragOverRouteZone = zone;
    },
    dropRoute(route, zone, event) {
      const draggedRouteId = this.draggedRouteId || event?.dataTransfer?.getData("text/plain");
      const targetRouteId = String(route?.id ?? "");
      if (!draggedRouteId || !zone) {
        this.endRouteDrag();
        return;
      }
      const draggedId = String(draggedRouteId);
      if (targetRouteId && targetRouteId === draggedId && this.draggedRouteZone === zone) {
        this.endRouteDrag();
        return;
      }
      const preferredIds = this.preferredRouteIds.map((routeId) => String(routeId));
      if (zone === "preferred") {
        if (!preferredIds.includes(draggedId) && preferredIds.length >= 3) {
          this.notify("warning", "Solo puedes seleccionar hasta 3 rutas preferentes.");
          this.endRouteDrag();
          return;
        }
        const nextPreferredIds = preferredIds.filter((routeId) => routeId !== draggedId);
        const targetIndex = targetRouteId ? nextPreferredIds.indexOf(targetRouteId) : -1;
        if (targetIndex === -1) nextPreferredIds.push(draggedId);
        else nextPreferredIds.splice(targetIndex, 0, draggedId);
        this.preferredRouteIds = nextPreferredIds.slice(0, 3);
      } else {
        this.preferredRouteIds = preferredIds.filter((routeId) => routeId !== draggedId);
        const nextOrder = this.routeOrder.map((routeId) => String(routeId)).filter((routeId) => routeId !== draggedId);
        const targetIndex = targetRouteId ? nextOrder.indexOf(targetRouteId) : -1;
        if (targetIndex === -1) nextOrder.push(draggedId);
        else nextOrder.splice(targetIndex, 0, draggedId);
        this.routeOrder = nextOrder;
      }
      this.endRouteDrag();
    },
    endRouteDrag() {
      this.draggedRouteId = "";
      this.draggedRouteZone = "";
      this.dragOverRouteId = "";
      this.dragOverRouteZone = "";
      if (this.dragPreviewElement?.parentNode) this.dragPreviewElement.parentNode.removeChild(this.dragPreviewElement);
      this.dragPreviewElement = null;
    },
    toggleBranchAssociation(branch) {
      if (!branch) return;
      const original = this.originalBranches.find((item) => String(item.id) === String(branch.id));
      if (branch.associated && original?.associated && !branch.relationId) { this.notify("warning", "No se pudo identificar la asociación de la sucursal."); return; }
      branch.associated = !branch.associated;
      this.pruneRouteOrder();
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
</style>

<style scoped>
.route-preference-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.route-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.route-search-button:hover{background:#eef3ff}.route-search-field{margin-bottom:9px}.route-preference-list{max-height:300px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.route-preference-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;cursor:grab;border-bottom:1px solid #eef2f6;transition:background-color .15s ease,box-shadow .15s ease}.route-preference-row:active{cursor:grabbing}.route-preference-row:last-child{border-bottom:0}.route-preference-row--selected{background:#fbfdff}.route-preference-row--drag-over{box-shadow:inset 0 2px 0 #2454d6}.route-summary{display:flex;align-items:center;gap:9px;min-width:0}.route-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.route-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.route-caption{display:flex;align-items:center;gap:3px;overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.route-row-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}.route-drag-handle{color:#94a3b8;cursor:grab}.action-button--selected{color:#16875a!important}.action-button--selected:hover{background:#eaf8f1}.selection-summary--warning{color:#8a5b08;background:#fff6e6;border-color:#f6e5be}@media(max-width:600px){.route-preference-row{align-items:flex-start;flex-direction:column}.route-row-actions{width:100%;justify-content:flex-end}.route-caption{max-width:245px}}
</style>
