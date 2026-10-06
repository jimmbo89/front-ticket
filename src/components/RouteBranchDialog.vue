<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    transition="dialog-bottom-transition"
    persistent
    @update:model-value="handleModelUpdate"
  >
    <v-card class="route-branches-page" elevation="0">
      <header class="page-header">
        <div class="page-heading">
          <div class="page-icon"><v-icon size="21">mdi-store-marker-outline</v-icon></div>
          <div>
            <h1 class="page-title">Sucursales de la ruta</h1>
            <p class="page-subtitle"><strong>{{ routeCode }}</strong><span> · {{ associationCountText }}</span></p>
          </div>
        </div>
        <div class="header-actions">
          <v-btn class="close-page-button" prepend-icon="mdi-close" variant="text" elevation="0" :disabled="loading || saving || deleting" @click="close">Cerrar</v-btn>
        </div>
      </header>

      <v-container fluid class="page-content">
        <v-row class="summary-row">
          <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-store-check-outline</v-icon></div><div><div class="summary-value">{{ associatedBranches.length }}</div><div class="summary-label">Sucursales asociadas</div></div></div></v-col>
          <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-store-plus-outline</v-icon></div><div><div class="summary-value">{{ availableBranches.length }}</div><div class="summary-label">Disponibles para asociar</div></div></div></v-col>
          <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--amber"><v-icon size="19">mdi-routes</v-icon></div><div><div class="summary-value route-summary-name">{{ routeCode }}</div><div class="summary-label">Ruta seleccionada</div></div></div></v-col>
        </v-row>

        <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div class="table-heading">
            <div>
              <div class="section-title">Listado de sucursales</div>
              <div class="section-subtitle">
                {{ associationCountText }} · Usa el icono de cada fila para administrar la asociación.
              </div>
            </div>
          </div>
          <div class="table-toolbar-actions">
            <v-expand-transition>
              <v-text-field
                v-if="searchOpen"
                v-model="search"
                class="search-field"
                density="compact"
                placeholder="Buscar por sucursal o dirección..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                clearable
                autofocus
              />
            </v-expand-transition>
            <v-tooltip :text="searchOpen ? 'Ocultar búsqueda' : 'Buscar sucursal'" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="searchOpen ? 'mdi-close' : 'mdi-magnify'"
                  variant="text"
                  size="small"
                  class="search-button"
                  :aria-label="searchOpen ? 'Ocultar búsqueda' : 'Buscar sucursal'"
                  @click="toggleSearch"
                />
              </template>
            </v-tooltip>
          </div>
        </div>

        <v-divider />
        <StandardDataTable
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="branches"
          :search="search"
          :loading="loading"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay sucursales disponibles"
          loading-text="Cargando sucursales..."
          class="branches-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@4" />
          </template>

          <template #[`item.branch`]="{ item }">
            <div class="branch-cell">
              <div class="branch-avatar">
                <v-img
                  v-if="branchImage(item)"
                  :src="imageUrl(branchImage(item))"
                  cover
                >
                  <template #error>
                    <div class="image-fallback"><v-icon size="17">mdi-store</v-icon></div>
                  </template>
                </v-img>
                <v-icon v-else size="17">mdi-store</v-icon>
              </div>
              <div class="cell-copy">
                <div class="branch-name">{{ branchName(item) }}</div>
                <div class="branch-caption">{{ item.associated ? "Sucursal asociada" : "Disponible para asociar" }}</div>
              </div>
            </div>
          </template>

          <template #[`item.address`]="{ item }">
            <span class="branch-address" :title="branchAddress(item)">
              {{ branchAddress(item) }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="action-cell">
              <span class="status-badge" :class="item.associated ? 'status-badge--active' : 'status-badge--available'">
                <span class="status-dot" />
                {{ item.associated ? "Asociada" : "Disponible" }}
              </span>
              <div class="action-buttons">
              <v-tooltip v-if="item.associated" text="Quitar sucursal" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-trash-can-outline"
                    variant="text"
                    size="small"
                    class="action-button action-button--delete"
                    :disabled="loading || saving || deleting"
                    @click="openDelete(item)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip v-else text="Asociar sucursal" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-link-variant-plus"
                    variant="text"
                    size="small"
                    class="action-button action-button--associate"
                    :loading="associatingBranchId === item.id"
                    :disabled="loading || saving || deleting"
                    @click="associateBranch(item)"
                  />
                </template>
              </v-tooltip>
              </div>
            </div>
          </template>
        </StandardDataTable>

        <div class="table-footer-note">
          <v-icon size="15">mdi-information-outline</v-icon>
          Las sucursales asociadas podrán utilizar esta ruta en sus operaciones.
        </div>
        </v-card>
      </v-container>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="430" persistent>
    <v-card class="delete-dialog" elevation="0">
      <div class="delete-icon"><v-icon size="27">mdi-store-remove-outline</v-icon></div>
      <div class="delete-title">Quitar sucursal</div>
      <div class="delete-message">
        ¿Deseas quitar la sucursal <strong>{{ branchName(branchToDelete) }}</strong> de esta ruta?
        La sucursal no será eliminada del sistema.
      </div>
      <div class="delete-actions">
        <v-btn variant="text" class="cancel-button" :disabled="deleting" @click="closeDelete">Cancelar</v-btn>
        <v-btn class="delete-button" elevation="0" :loading="deleting" @click="confirmDelete">Quitar</v-btn>
      </div>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="sbTimeout" :color="sbType" elevation="10" class="busgo-snackbar">
    <div class="snackbar-content">
      <v-icon :icon="sbIcon" size="22" />
      <div><div class="snackbar-title">{{ sbTitle }}</div><div class="snackbar-message">{{ sbMessage }}</div></div>
    </div>
  </v-snackbar>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "RouteBranchDialog",
  emits: ["update:modelValue"],
  props: {
    modelValue: { type: Boolean, default: false },
    route: { type: Object, default: () => ({}) },
  },
  data: () => ({
    loading: false,
    saving: false,
    associatingBranchId: null,
    deleting: false,
    deleteDialog: false,
    snackbar: false,
    sbType: "",
    sbTitle: "",
    sbIcon: "",
    sbMessage: "",
    sbTimeout: 3000,
    branches: [],
    branchToDelete: null,
    search: "",
    searchOpen: false,
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "branch", order: "asc" }],
    headers: [
      { title: "Sucursal", key: "branch", sortable: true, width: "35%" },
      { title: "Dirección", key: "address", sortable: true, width: "45%" },
      { title: "Acciones", key: "actions", sortable: false, align: "end", width: "20%" },
    ],
  }),
  computed: {
    routeId() {
      return this.route?.route_id ?? this.route?.id ?? "";
    },
    routeCode() {
      return this.route?.code || this.route?.routeCode || this.route?.name || "Ruta seleccionada";
    },
    associatedBranches() {
      return this.branches
        .filter((branch) => branch.associated)
        .map((branch) => ({ ...branch, id: branch.branchRouteId, branch_id: branch.id }));
    },
    associatedBranchIds() {
      return new Set(this.branches.filter((branch) => branch.associated).map((branch) => String(branch.id)).filter(Boolean));
    },
    availableBranches() {
      return this.branches.filter((branch) => !branch.associated && !this.associatedBranchIds.has(String(branch.id)));
    },
    associationCountText() {
      const count = this.associatedBranches.length;
      return `${count} ${count === 1 ? "sucursal asociada" : "sucursales asociadas"}`;
    },
  },
    watch: {
    search() {
      this.page = 1;
    },
    modelValue(value) {
      if (value) this.initialize();
    },
    route: {
      deep: true,
      handler() {
        if (this.modelValue) this.initialize();
      },
    },
  },
    methods: {
    handleModelUpdate(value) {
      if (!value) this.close();
    },
    toArray(value) {
      if (Array.isArray(value)) return value;
      return value && typeof value === "object" ? Object.values(value) : [];
    },
    normalizeBranch(branch = {}) {
      return {
        ...branch,
        id: branch.id ?? branch.branch_id ?? branch.branchId ?? "",
        name: branch.name ?? branch.branchName ?? branch.branch_name ?? branch.nameBranch ?? "Sin nombre",
        address: branch.address ?? branch.branchAddress ?? branch.branch_address ?? branch.addressBranch ?? "Dirección no disponible",
        image: branch.image ?? branch.branchImage ?? branch.branch_image ?? branch.imageBranch ?? "",
        associated: branch.associated === true,
        branchRouteId: branch.branchRouteId ?? branch.branch_route_id ?? branch.branchRoute?.id ?? null,
      };
    },
    branchName(branch = {}) {
      return branch?.name || branch?.branchName || branch?.nameBranch || "Sucursal sin nombre";
    },
    branchAddress(branch = {}) {
      return branch?.address || branch?.branchAddress || branch?.addressBranch || "Dirección no disponible";
    },
    branchImage(branch = {}) {
      return branch?.image || branch?.branchImage || branch?.imageBranch || "";
    },
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) this.search = "";
    },
    imageUrl(source) {
      if (!source) return "";
      const image = String(source).trim();
      if (/^(https?:|data:|blob:)/i.test(image)) return image;
      const base = String(this.$axios.defaults.baseURL || "");
      const clean = image.replace(/^\/+/, "");
      return clean.startsWith("images/") ? `${base}${clean}` : `${base}images/${clean}`;
    },
    async initialize() {
      if (!this.routeId) {
        this.branches = [];
        return;
      }
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "route-branches", method: "POST", data: { route_id: this.routeId } });
        this.branches = result.success
          ? this.toArray(result.data?.route?.branches ?? result.data?.branches ?? result.data?.routeBranches ?? result.data).map((branch) => this.normalizeBranch(branch))
          : [];
        if (!result.success) this.showAlert("warning", result.message || "No fue posible cargar las sucursales de la ruta.");
      } catch (error) {
        this.branches = [];
        this.showAlert("error", "Ocurrió un error al cargar las sucursales de la ruta.");
      } finally {
        this.loading = false;
      }
    },
    async associateBranch(branch) {
      if (!branch?.id || this.saving) return;
      this.saving = true;
      this.associatingBranchId = branch.id;
      try {
        const result = await handleRequest({
          endpoint: "route-branch",
          method: "POST",
          data: { route_id: this.routeId, branch_id: branch.id },
        });
        if (result.success) {
          await this.initialize();
          this.showAlert("success", result.message || "Sucursal asociada correctamente.");
        } else {
          this.showAlert("warning", result.message || "No fue posible asociar la sucursal.");
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al asociar la sucursal.");
      } finally {
        this.associatingBranchId = null;
        this.saving = false;
      }
    },
    openDelete(branch) {
      this.branchToDelete = branch;
      this.deleteDialog = true;
    },
    closeDelete() {
      if (this.deleting) return;
      this.deleteDialog = false;
      this.branchToDelete = null;
    },
    async confirmDelete() {
      const associationId = this.branchToDelete?.branchRouteId ?? this.branchToDelete?.branch_route_id;
      if (!associationId) {
        this.showAlert("warning", "No se pudo identificar la asociación.");
        return;
      }
      this.deleting = true;
      try {
        const result = await handleRequest({ endpoint: "branch-route-destroy", method: "POST", data: { id: associationId } });
        if (result.success) {
          await this.initialize();
          this.showAlert("success", result.message || "Sucursal desasociada correctamente.");
        } else {
          this.showAlert("warning", result.message || "No fue posible desasociar la sucursal.");
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al desasociar la sucursal.");
      } finally {
        this.deleting = false;
        this.closeDelete();
      }
    },
    close() {
      if (this.loading || this.saving || this.deleting) return;
      this.deleteDialog = false;
      this.branchToDelete = null;
      this.search = "";
      this.searchOpen = false;
      this.$emit("update:modelValue", false);
    },
    showAlert(type, message, timeout = 3000) {
      const config = {
        success: ["Éxito", "mdi-check-circle"],
        error: ["Error", "mdi-close-circle"],
        warning: ["Advertencia", "mdi-alert-circle"],
      }[type] || ["Información", "mdi-information"];
      this.sbType = type;
      this.sbTitle = config[0];
      this.sbIcon = config[1];
      this.sbMessage = message;
      this.sbTimeout = timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.association-dialog,.form-dialog,.delete-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px;min-width:0}.dialog-icon{display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon--small{flex-basis:34px;width:34px;height:34px}.dialog-title{overflow:hidden;color:#0f172a;font-size:16px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.dialog-subtitle{margin-top:4px;overflow:hidden;color:#64748b;font-size:11.5px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.dialog-close{color:#64748b!important}.dialog-body{padding:18px 20px 0!important}.table-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 0 15px}.section-title{color:#0f172a;font-size:15px;font-weight:850}.section-subtitle{margin-top:3px;color:#64748b;font-size:11px;font-weight:650}.add-button,.save-button{min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.branches-table{color:#1e293b;background:transparent}.branches-table :deep(thead th){height:40px!important;color:#334155!important;font-size:11px!important;font-weight:850!important;letter-spacing:.04em;text-transform:uppercase;background:#f8fafc!important;border-bottom:1px solid #e8edf5!important}.branches-table :deep(tbody td){height:62px!important;color:#1e293b;font-size:13px;font-weight:600;border-bottom:1px solid #eef2f6!important}.branches-table :deep(tbody tr:hover){background:#f8faff!important}.branches-table :deep(.v-data-table-footer){min-height:52px;padding:6px 12px;color:#334155;font-size:11.5px;font-weight:700}.branch-cell{display:flex;align-items:center;gap:9px;min-width:0}.branch-avatar,.branch-option-icon{display:grid;flex:0 0 36px;width:36px;height:36px;overflow:hidden;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:9px}.branch-avatar :deep(.v-img__img){object-fit:cover}.branch-option-icon{width:34px;height:34px;flex-basis:34px}.image-fallback{display:grid;width:100%;height:100%;place-items:center}.cell-copy{min-width:0}.branch-name{overflow:hidden;color:#0f172a;font-size:12.5px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.branch-caption{margin-top:2px;color:#64748b;font-size:10px;font-weight:650}.branch-address{display:block;max-width:360px;overflow:hidden;color:#475569;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.action-buttons{display:flex;justify-content:flex-end}.action-button{border-radius:8px!important}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.table-footer-note{display:flex;align-items:center;gap:6px;min-height:42px;padding:9px 0;color:#64748b;font-size:10.5px;font-weight:650;border-top:1px solid #edf1f5}.form-body{padding:21px 22px 18px!important}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-body :deep(.v-field){border-radius:9px}.form-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.form-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.selected-branch-chip{max-width:215px;color:#1e293b!important;background:#eef3ff!important;font-size:11px!important;font-weight:750!important}.selected-branch-chip :deep(.v-chip__content){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selection-summary{display:flex;align-items:flex-start;gap:7px;margin-top:3px;padding:10px 11px;color:#526176;background:#f8fafc;border:1px solid #e8edf5;border-radius:9px;font-size:10.5px;font-weight:650;line-height:1.45}.selection-summary.has-selection{color:#116b49;background:#eaf8f1;border-color:#d7f1e5}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.save-button{min-width:155px}.delete-dialog{padding:29px 27px 24px;text-align:center}.delete-icon{display:grid;width:56px;height:56px;margin:0 auto 16px;place-items:center;color:#dc2626;background:#fff1f2;border-radius:15px}.delete-title{color:#0f172a;font-size:18px;font-weight:850}.delete-message{margin:10px auto 22px;color:#64748b;font-size:12.5px;font-weight:600;line-height:1.55}.delete-message strong{color:#334155}.delete-actions{display:flex;justify-content:center;gap:9px}.delete-button{min-width:112px;min-height:40px;color:#fff!important;background:#dc2626!important;border-radius:9px!important;font-size:12.5px;font-weight:800;text-transform:none}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-title{font-size:11px;font-weight:850}.snackbar-message{margin-top:2px;font-size:9.5px;font-weight:600}.busgo-snackbar :deep(.v-snackbar__wrapper){border-radius:11px}@media(max-width:600px){.dialog-header{padding:14px}.dialog-body{padding:15px 14px 0!important}.table-toolbar{align-items:stretch;flex-direction:column}.add-button{width:100%}.form-body{padding:17px 14px 12px!important}.dialog-actions{padding-inline:13px!important}}
.route-branches-page{--blue:#2454d6;min-height:100vh;color:#1e293b;background:#f6f8fb;border-radius:0!important;box-shadow:none!important}.route-branches-page>.page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:70px;padding:12px 24px;background:#fff;border-bottom:1px solid #e8edf5}.page-heading{display:flex;align-items:center;gap:11px}.page-icon{display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.page-title{margin:0;color:#0f172a;font-size:19px;font-weight:850;line-height:1.2}.page-subtitle{margin:3px 0 0;color:#526176;font-size:12px;font-weight:650}.page-subtitle strong{color:#334155;font-weight:800}.header-actions{display:flex;align-items:center;gap:8px}.close-page-button{min-height:40px;padding-inline:14px!important;color:#475569!important;background:#f8fafc!important;border:1px solid #e2e8f0!important;border-radius:9px!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none}.close-page-button:hover{color:#0f172a!important;background:#f1f5f9!important}.route-branches-page .page-content{padding:18px 24px 28px}.summary-row{margin-bottom:4px}.summary-card{display:flex;align-items:center;gap:11px;min-height:72px;padding:13px 15px;background:#fff;border:1px solid #e8edf5;border-radius:12px;box-shadow:0 4px 14px rgba(15,23,42,.035)}.summary-icon{display:grid;width:36px;height:36px;place-items:center;border-radius:9px}.summary-icon--blue{color:#2454d6;background:#eef3ff}.summary-icon--green{color:#16875a;background:#eaf8f1}.summary-icon--amber{color:#b86a08;background:#fff6e6}.summary-value{overflow:hidden;color:#0f172a;font-size:20px;font-weight:900;line-height:1;text-overflow:ellipsis;white-space:nowrap}.summary-label{margin-top:4px;color:#526176;font-size:11px;font-weight:700}.route-summary-name{max-width:220px;font-size:16px}.route-branches-page .table-panel{overflow:hidden;background:#fff;border:1px solid #e8edf5;border-radius:13px!important;box-shadow:0 5px 18px rgba(15,23,42,.04)!important}.route-branches-page .table-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:69px;padding:12px 17px}.route-branches-page .search-field{flex:0 1 320px}.route-branches-page .search-field :deep(.v-field){border-radius:9px;font-size:12px}.route-branches-page .table-footer-note{padding:9px 16px}.action-cell{display:flex;align-items:center;justify-content:flex-end;gap:8px}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:7px;font-size:10.5px;font-weight:800;white-space:nowrap}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--available{color:#8a5b08;background:#fff6e6}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-button--associate{color:#16875a!important}.action-button--associate:hover{background:#eaf8f1}.route-branches-page .branches-table :deep(.v-data-table__th--sortable){cursor:pointer}.route-branches-page .branches-table :deep(.v-data-table-header__content){display:flex!important;align-items:center!important;gap:5px!important}.route-branches-page .branches-table :deep(.v-data-table-header__sort-icon){display:inline-flex!important;visibility:visible!important;width:15px!important;height:15px!important;color:#94a3b8!important;font-size:15px!important;opacity:.65!important}@media(max-width:959px){.route-branches-page>.page-header{padding-inline:17px}.route-branches-page .page-content{padding:15px 17px 24px}.route-branches-page .table-toolbar{align-items:stretch;flex-direction:column}.route-branches-page .search-field{width:100%;max-width:none}}@media(max-width:600px){.route-branches-page>.page-header{align-items:flex-start;padding:11px 12px}.route-branches-page .page-subtitle{max-width:230px}.route-branches-page .header-actions{align-items:flex-end;flex-direction:column}.route-branches-page .add-button{min-width:42px!important;padding-inline:10px!important}.route-branches-page .add-button :deep(.v-btn__content){font-size:0}.route-branches-page .page-content{padding:11px 12px 20px}.route-branches-page .action-cell{gap:4px}.route-branches-page .status-badge{font-size:9px}.route-branches-page .branches-table{overflow-x:auto}.route-branches-page .branches-table :deep(.v-table__wrapper){min-width:720px}}
</style>
<style scoped>
.route-branches-page .table-heading{display:flex;align-items:center;min-width:0}
.route-branches-page .table-toolbar-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;min-width:0}
.route-branches-page .search-field{width:320px}
.route-branches-page .search-button{color:#2454d6!important;border-radius:8px!important}
.route-branches-page .search-button:hover{background:#eef3ff!important}
.route-branches-page .branches-table :deep(.v-table__wrapper){max-height:480px;overflow-y:auto}
.route-branches-page .branches-table :deep(thead th){position:sticky;top:0;z-index:2;background:#f8fafc!important}
@media(max-width:959px){.route-branches-page .table-toolbar-actions{width:100%}.route-branches-page .search-field{flex:1 1 auto;width:auto;max-width:none}}
</style>
