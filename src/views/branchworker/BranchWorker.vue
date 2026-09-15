<template>
  <div class="branch-workers-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" class="busgo-snackbar">
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="branch-image-shell">
          <v-img v-if="branch.image" :src="branchImage" width="38" height="38" cover>
            <template #error><div class="branch-image-fallback"><v-icon size="20">mdi-store</v-icon></div></template>
          </v-img>
          <v-icon v-else size="20">mdi-store</v-icon>
        </div>
        <div>
          <h1 class="page-title">Trabajadores de la sucursal</h1>
          <p class="page-subtitle"><strong>{{ branch.name || "Sucursal seleccionada" }}</strong><span v-if="branch.address"> · {{ branch.address }}</span></p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn class="close-page-button" prepend-icon="mdi-close" variant="text" elevation="0" @click="$emit('close')">Cerrar</v-btn>
        <v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAdd">Agregar trabajadores</v-btn>
      </div>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="6"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-account-group-outline</v-icon></div><div><div class="summary-value">{{ branchworkers.length }}</div><div class="summary-label">Trabajadores asociados</div></div></div></v-col>
        <v-col cols="12" sm="6"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-store-check-outline</v-icon></div><div><div class="summary-value branch-summary-name">{{ branch.name || "—" }}</div><div class="summary-label">Sucursal seleccionada</div></div></div></v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div><div class="section-title">Trabajadores asociados</div><div class="section-subtitle">{{ registeredCountText }}</div></div>
          <div class="toolbar-filters"><v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar trabajador..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable /></div>
        </div>
        <v-divider />

        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="branchworkers"
          :search="search"
          :loading="loading"
          :hide-default-header="false"
          sort-asc-icon="mdi-arrow-up"
          sort-desc-icon="mdi-arrow-down"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay trabajadores asociados"
          loading-text="Cargando trabajadores..."
          class="workers-table"
        >
          <template #loading><v-skeleton-loader type="table-row@5" /></template>
          <template #[`item.workerName`]="{ item }">
            <div class="worker-name-cell">
              <div class="worker-avatar">
                <v-img v-if="item.workerImage" :src="workerImage(item.workerImage)" class="worker-photo" width="34" height="34" cover>
                  <template #error><div class="image-fallback"><v-icon size="17">mdi-account</v-icon></div></template>
                </v-img>
                <v-icon v-else size="17">mdi-account</v-icon>
              </div>
              <div class="cell-copy"><div class="worker-name">{{ item.workerName || "Sin nombre" }}</div><div class="worker-caption">Trabajador asignado</div></div>
            </div>
          </template>
          <template #[`item.roleName`]="{ item }"><span class="role-badge"><v-icon size="14">mdi-account-tie-outline</v-icon>{{ item.roleName || "Sin rol" }}</span></template>
          <template #[`item.actions`]="{ item }">
            <div class="action-buttons"><v-tooltip text="Quitar trabajador" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip></div>
          </template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Los trabajadores asociados pueden operar en esta sucursal según sus permisos.</div>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading">
              <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-account-tie</v-icon><v-icon class="dialog-icon-action" size="11">mdi-plus</v-icon></div>
              <div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">Asigna varios trabajadores a {{ branch.name || "la sucursal" }} en una sola operación</div></div>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
          </div>
          <v-divider />
          <v-card-text class="dialog-body">
            <div class="form-section-label">Trabajador disponible</div>
            <v-autocomplete
              v-model="editedItem.worker_id"
              :items="workers"
              item-title="name"
              item-value="id"
              label="Seleccionar trabajador"
              placeholder="Busca por nombre"
              prepend-inner-icon="mdi-account-search-outline"
              variant="outlined"
              density="comfortable"
              no-data-text="No hay trabajadores disponibles"
              :rules="selectRules"
              :menu-props="{ contentClass: 'worker-select-menu' }"
              multiple
              chips
              closable-chips
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.name"
                  :subtitle="[item.raw.email, item.raw.roleName].filter(Boolean).join(' · ')"
                >
                  <template #prepend>
                    <v-avatar size="36" class="select-avatar"><v-img v-if="item.raw.image" :src="workerImage(item.raw.image)" cover><template #error><div class="image-fallback"><v-icon size="17">mdi-account</v-icon></div></template></v-img><v-icon v-else size="17">mdi-account</v-icon></v-avatar>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <v-chip class="selected-worker-chip" closable @click:close="removeSelectedWorker(item.raw.id)">
                  <template #prepend><v-avatar size="24" class="select-avatar"><v-img v-if="item.raw.image" :src="workerImage(item.raw.image)" cover /><v-icon v-else size="14">mdi-account</v-icon></v-avatar></template>
                  {{ item.raw.name }}
                </v-chip>
              </template>
            </v-autocomplete>
            <div class="selection-summary" :class="{ 'has-selection': selectedWorkerCount > 0 }"><v-icon size="18">{{ selectedWorkerCount ? 'mdi-account-multiple-check-outline' : 'mdi-information-outline' }}</v-icon><span>{{ selectionSummary }}</span></div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid || selectedWorkerCount === 0">{{ assignButtonText }}</v-btn></v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="27">mdi-account-remove-outline</v-icon></div>
        <div class="delete-title">Quitar trabajador</div>
        <div class="delete-message">¿Deseas quitar a <strong>{{ editedItem.workerName || "este trabajador" }}</strong> de la sucursal? El trabajador no será eliminado del sistema.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loadingDelete" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="loadingDelete" @click="deleteItemConfirm">Quitar</v-btn></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api";

export default {
  name: "BranchWorker",
  emits: ["close"],
  props: {
    branch: { type: Object, required: true, default: () => ({}) },
  },
  data: () => ({
    snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    paleteColors,
    valid: true,
    loading: false,
    mostrar: false,
    loadingDelete: false,
    dialog: false,
    dialogDelete: false,
    branchworkers: [],
    roles: [],
    workers: [],
    branch_id: "",
    data: {},
    itemsPerPage: 10,
    page: 1,
    sortBy: [{ key: "workerName", order: "asc" }],
    headers: [
      { title: "Nombre del trabajador", key: "workerName", sortable: true, width: "55%" },
      { title: "Rol", key: "roleName", sortable: true, width: "29%" },
      { title: "", key: "actions", sortable: false, align: "end", width: "16%" },
    ],
    editedItem: { id: "", branch_id: "", worker_id: [], role_id: "", workerName: "" },
    originalItem: { id: "", branch_id: "", worker_id: [], role_id: "", workerName: "" },
    defaultItem: { id: "", branch_id: "", worker_id: [], role_id: "", workerName: "" },
    editedIndex: -1,
    search: "",
    selectRules: [(v) => (Array.isArray(v) && v.length > 0) || "Selecciona al menos un trabajador"],
  }),
  computed: {
    formTitle() { return this.editedIndex === -1 ? "Agregar trabajadores" : "Editar trabajador"; },
    registeredCountText() {
      const count = this.branchworkers.length;
      return `${count} ${count === 1 ? "trabajador asociado" : "trabajadores asociados"}`;
    },
    branchImage() {
      return `${this.$axios.defaults.baseURL}images/${this.branch.image}?t=${this.getCacheTimestamp()}`;
    },
    selectedWorkerCount() {
      return Array.isArray(this.editedItem.worker_id) ? this.editedItem.worker_id.length : 0;
    },
    selectionSummary() {
      if (!this.selectedWorkerCount) return "Selecciona uno o varios trabajadores disponibles.";
      return `${this.selectedWorkerCount} ${this.selectedWorkerCount === 1 ? "trabajador seleccionado" : "trabajadores seleccionados"}`;
    },
    assignButtonText() {
      if (!this.selectedWorkerCount) return "Asignar trabajadores";
      return "Asignar";
    },
  },
  mounted() {
    this.branch_id = this.branch.id;
    this.initialize();
  },
  methods: {
    getCacheTimestamp() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    },
    workerImage(image) {
      return `${this.$axios.defaults.baseURL}images/${image}?t=${this.getCacheTimestamp()}`;
    },
    async showAdd() {
      this.editedIndex = -1;
      this.editedItem = { ...this.defaultItem, worker_id: [] };
      this.originalItem = { ...this.defaultItem, worker_id: [] };
      try {
        const result = await handleRequest({
          endpoint: "branch-workers-roles",
          method: "POST",
          data: { branch_id: this.branch_id, type: "Sucursal" },
        });
        if (result.success) {
          this.roles = result.data?.roles || [];
          this.workers = result.data?.workers.filter((worker) =>
            !this.branchworkers.some((branchworker) => String(branchworker.worker_id) === String(worker.id))
          ) || [];
        } else {
          this.roles = [];
          this.workers = [];
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.dialog = true;
      }
    },
    close() {
      if (this.loading) return;
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem, worker_id: [] };
        this.originalItem = { ...this.defaultItem, worker_id: [] };
        this.$refs.form?.resetValidation();
      });
      this.editedIndex = -1;
    },
    async initialize() {
      try {
        this.loading = true;
        this.data = { branch_id: this.branch_id };
        const result = await handleRequest({ endpoint: "branch-workers", method: "POST", data: this.data });
        this.branchworkers = result.success ? result.data?.branchWorkers || [] : [];
      } catch (error) {
        this.branchworkers = [];
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
      }
    },
    async save() {
      this.loading = true;
      if (this.editedIndex === -1) {
        const workerIds = Array.isArray(this.editedItem.worker_id) ? [...this.editedItem.worker_id] : [];
        if (!workerIds.length) {
          this.showAlert("warning", "Selecciona al menos un trabajador.", 3000);
          this.loading = false;
          return;
        }

        let assigned = 0;
        let failed = 0;
        for (const workerId of workerIds) {
          try {
            const selectedWorker = this.workers.find((worker) => String(worker.id) === String(workerId));
            const result = await handleRequest({
              endpoint: "branch-worker",
              method: "POST",
              data: {
                branch_id: this.branch_id,
                worker_id: workerId,
                role_id: selectedWorker?.role_id ?? selectedWorker?.roleId ?? null,
              },
            });
            if (result.success) assigned += 1;
            else failed += 1;
          } catch (error) {
            failed += 1;
          }
        }

        await this.initialize();
        this.loading = false;
        if (failed === 0) {
          this.showAlert("success", `${assigned} ${assigned === 1 ? "trabajador asignado" : "trabajadores asignados"} correctamente.`, 3000);
        } else {
          this.showAlert("warning", `Se asignaron ${assigned} de ${workerIds.length} trabajadores. ${failed} no pudieron asignarse.`, 4000);
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = ["id", "branch_id", "worker_id", "role_id"];
        const updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => { obj[key] = this.editedItem[key]; return obj; }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          try {
            const result = await handleRequest({ endpoint: "branch-worker", method: "PUT", data: updatedFields });
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              await this.initialize();
            } else {
              this.showAlert("warning", result.message, 3000);
            }
          } catch (error) {
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
          } finally {
            this.loading = false;
          }
        } else {
          this.showAlert("success", "No se realizaron cambios.", 3000);
          this.loading = false;
        }
      }
      this.close();
    },
    removeSelectedWorker(workerId) {
      this.editedItem.worker_id = this.editedItem.worker_id.filter((id) => String(id) !== String(workerId));
    },
    async editItem(item) {
      this.editedIndex = 1;
      const selectedWorkerId = item.worker_id;
      this.originalItem = { ...item, worker_id: [selectedWorkerId] };
      this.editedItem = { ...item, worker_id: [selectedWorkerId] };
      try {
        const result = await handleRequest({
          endpoint: "branch-workers-roles",
          method: "POST",
          data: { branch_id: this.branch_id, type: "Sucursal" },
        });
        if (result.success) {
          this.roles = result.data?.roles || [];
          this.workers = result.data?.workers.filter((worker) =>
            !this.branchworkers.some((branchworker) => String(branchworker.worker_id) === String(worker.id)) ||
            String(worker.id) === String(selectedWorkerId)
          ) || [];
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al cargar los datos.", 3000);
      } finally {
        this.dialog = true;
      }
    },
    deleteItem(item) {
      this.editedIndex = 1;
      this.editedItem = { ...this.defaultItem, ...item };
      this.dialogDelete = true;
    },
    closeDelete() {
      if (this.loadingDelete) return;
      this.dialogDelete = false;
      this.$nextTick(() => { this.editedItem = Object.assign({}, this.defaultItem); });
    },
    async deleteItemConfirm() {
      this.loadingDelete = true;
      try {
        const result = await handleRequest({ endpoint: "branch-worker-destroy", method: "POST", data: { id: this.editedItem.id } });
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          await this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loadingDelete = false;
        this.closeDelete();
      }
    },
    showAlert(sb_type, sb_message, sb_timeout) {
      this.sb_type = sb_type;
      if (sb_type === "success") { this.sb_title = "Éxito"; this.sb_icon = "mdi-check-circle"; }
      if (sb_type === "error") { this.sb_title = "Error"; this.sb_icon = "mdi-alert-circle"; }
      if (sb_type === "warning") { this.sb_title = "Advertencia"; this.sb_icon = "mdi-alert-circle"; }
      this.sb_message = sb_message;
      this.sb_timeout = sb_timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.branch-workers-page { --blue:#2454d6; min-height:100%; color:#1e293b; background:#f6f8fb; }
.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; }
.page-heading,.dialog-heading { display:flex; align-items:center; gap:11px; }.branch-image-shell,.dialog-icon { position:relative; display:grid; flex:0 0 38px; width:38px; height:38px; overflow:hidden; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }.branch-image-shell :deep(.v-img__img) { object-fit:cover; }.branch-image-fallback { display:grid; width:100%; height:100%; place-items:center; }.dialog-icon-main { transform:translate(-2px,1px); }.dialog-icon-action { position:absolute; right:5px; bottom:5px; padding:1px; color:#0e1f46; background:#fff; border-radius:50%; }
.page-title { margin:0; color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }.page-subtitle { margin:3px 0 0; color:#526176; font-size:12px; font-weight:650; }.page-subtitle strong { color:#334155; font-weight:800; }
.header-actions { display:flex; align-items:center; gap:8px; }.close-page-button { min-height:40px; padding-inline:14px!important; color:#475569!important; background:#f8fafc!important; border:1px solid #e2e8f0!important; border-radius:9px!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; }.close-page-button:hover { color:#0f172a!important; background:#f1f5f9!important; }
.add-button,.save-button { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }
.page-content { padding:18px 24px 28px; }.summary-row { margin-bottom:4px; }.summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }.summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }.summary-icon--blue { color:#2454d6; background:#eef3ff; }.summary-icon--green { color:#16875a; background:#eaf8f1; }.summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }
.table-panel { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }.table-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:69px; padding:12px 17px; }.section-title { color:#0f172a; font-size:15px; font-weight:850; }.section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }.toolbar-filters { display:flex; align-items:center; justify-content:flex-end; gap:9px; flex:1; }.search-field { flex:0 1 285px; }.search-field :deep(.v-field) { border-radius:9px; font-size:12px; }.search-field :deep(.v-field__outline) { color:#dce3ed; }
.workers-table { color:#1e293b; background:transparent; }.workers-table :deep(thead th) { height:40px!important; color:#334155!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }.workers-table :deep(tbody td) { height:58px!important; color:#1e293b; font-size:13px; font-weight:600; border-bottom:1px solid #eef2f6!important; }.workers-table :deep(tbody tr:hover) { background:#f8faff!important; }.workers-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }.workers-table :deep(.v-data-table__th--sortable) { cursor:pointer; }.workers-table :deep(.v-data-table-header__content) { display:flex!important; align-items:center!important; gap:5px!important; }.workers-table :deep(.v-data-table-header__sort-icon) { display:inline-flex!important; visibility:visible!important; width:15px!important; height:15px!important; color:#94a3b8!important; font-size:15px!important; opacity:.65!important; }.workers-table :deep(.v-data-table__th--sorted),.workers-table :deep(.v-data-table__th--sortable:hover) { color:#2454d6!important; background:#f5f7ff!important; }
.worker-name-cell { display:flex; align-items:center; gap:9px; min-width:0; }.worker-avatar { display:grid; flex:0 0 34px; width:34px; height:34px; overflow:hidden; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }.worker-photo,.image-fallback { width:100%; height:100%; }.worker-photo :deep(.v-img__img) { object-fit:cover; }.image-fallback { display:grid; place-items:center; }.cell-copy { min-width:0; }.worker-name { overflow:hidden; color:#0f172a; font-size:13.5px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.worker-caption { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:650; }.role-badge { display:inline-flex; align-items:center; gap:5px; max-width:190px; padding:4px 8px; overflow:hidden; color:#5145a8; background:#f1edff; border-radius:7px; font-size:11.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }.branch-summary-name { max-width:360px; overflow:hidden; font-size:16px; text-overflow:ellipsis; white-space:nowrap; }.action-buttons { display:flex; justify-content:flex-end; }.action-button { border-radius:8px!important; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }.table-footer-note { display:flex; align-items:center; gap:6px; min-height:42px; padding:9px 16px; color:#64748b; font-size:10.5px; font-weight:650; border-top:1px solid #edf1f5; }
.form-dialog,.delete-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }.dialog-body { padding:21px 22px 18px!important; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }.selected-worker-chip { max-width:205px; color:#1e293b!important; background:#eef3ff!important; font-size:11px!important; font-weight:750!important; }.selected-worker-chip :deep(.v-chip__content) { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.select-avatar { display:grid; flex:0 0 auto; place-items:center; overflow:hidden; color:#2454d6; background:#eef3ff; }.selection-summary { display:flex; align-items:flex-start; gap:7px; margin-top:3px; padding:10px 11px; color:#526176; background:#f8fafc; border:1px solid #e8edf5; border-radius:9px; font-size:10.5px; font-weight:650; line-height:1.45; }.selection-summary.has-selection { color:#116b49; background:#eaf8f1; border-color:#d7f1e5; }
.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:160px; padding-inline:18px!important; }.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius:11px; }
@media (max-width:959px) { .page-header { padding-inline:17px; }.page-content { padding:15px 17px 24px; }.table-toolbar { align-items:stretch; flex-direction:column; }.toolbar-filters { justify-content:flex-start; }.search-field { flex:1 1 auto; } }
@media (max-width:600px) { .page-header { align-items:flex-start; padding:11px 12px; }.page-subtitle { max-width:180px; }.header-actions { gap:5px; }.close-page-button,.add-button { min-width:40px!important; padding-inline:9px!important; }.close-page-button :deep(.v-btn__content),.add-button :deep(.v-btn__content) { font-size:0; }.close-page-button :deep(.v-icon),.add-button :deep(.v-icon) { margin:0!important; }.page-content { padding:11px 12px 20px; }.search-field { width:100%; }.dialog-header { padding:14px; }.dialog-body { padding:17px 14px 12px!important; }.dialog-actions { padding-inline:13px!important; } }
</style>

<style>
.workers-table .v-data-table__th--sortable .v-data-table-header__sort-icon { display:inline-flex!important; visibility:visible!important; width:15px!important; height:15px!important; margin-left:5px!important; color:#94a3b8!important; font-size:15px!important; opacity:.72!important; }.workers-table thead { display:table-header-group!important; visibility:visible!important; }.workers-table thead tr { display:table-row!important; visibility:visible!important; }.workers-table thead th { display:table-cell!important; visibility:visible!important; }.workers-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,.workers-table .v-data-table__th--sorted .v-data-table-header__sort-icon { color:#2454d6!important; opacity:1!important; }
.worker-select-menu .v-list { padding:6px!important; }.worker-select-menu .v-list-item { min-height:54px!important; margin:2px 0; border-radius:9px!important; }.worker-select-menu .v-list-item:hover { background:#f4f7ff!important; }.worker-select-menu .v-list-item-title { color:#1e293b!important; font-size:12.5px!important; font-weight:750!important; }.worker-select-menu .v-list-item-subtitle { color:#64748b!important; font-size:10.5px!important; font-weight:600!important; }
</style>
