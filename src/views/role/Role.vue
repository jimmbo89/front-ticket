<template>
  <div class="roles-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" class="busgo-snackbar">
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><v-icon size="21">mdi-account-cog-outline</v-icon></div>
        <div><h1 class="page-title">Roles</h1><p class="page-subtitle">Administra perfiles, permisos y niveles de acceso del sistema</p></div>
      </div>
      <v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAddRole">Agregar rol</v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-account-key-outline</v-icon></div><div><div class="summary-value">{{ roles.length }}</div><div class="summary-label">Total de roles</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-cog-outline</v-icon></div><div><div class="summary-value">{{ systemRoles }}</div><div class="summary-label">Roles de sistema</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--slate"><v-icon size="19">mdi-store-outline</v-icon></div><div><div class="summary-value">{{ branchRoles }}</div><div class="summary-label">Roles de sucursal</div></div></div></v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div><div class="section-title">Listado de roles</div><div class="section-subtitle">{{ registeredCountText }}</div></div>
          <v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar rol..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable />
        </div>
        <v-divider />

        <v-data-table :headers="headers" :items="roles" :search="search" :loading="loading" :items-per-page="10" items-per-page-text="Elementos por página" no-data-text="No hay roles disponibles" loading-text="Cargando roles..." class="roles-table">
          <template #loading><v-skeleton-loader type="table-row@5" /></template>
          <template #[`item.name`]="{ item }">
            <div class="role-name-cell">
              <div class="role-avatar"><v-icon size="17">mdi-account-key-outline</v-icon></div>
              <div class="cell-copy"><div class="role-name">{{ item.name }}</div></div>
            </div>
          </template>
          <template #[`item.type`]="{ item }">
            <span class="role-type-badge" :class="normalizeRoleType(item.type) === 'SISTEMA' ? 'role-type-badge--system' : 'role-type-badge--branch'">
              <v-icon size="14">{{ normalizeRoleType(item.type) === "SISTEMA" ? "mdi-cog-outline" : "mdi-store-outline" }}</v-icon>{{ getRoleTypeLabel(item.type) }}
            </span>
          </template>
          <template #[`item.description`]="{ item }"><div class="description-cell" :title="item.description">{{ item.description || "Sin descripción" }}</div></template>
          <template #[`item.actions`]="{ item }">
            <div class="action-buttons">
              <v-tooltip text="Editar rol" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip>
              <v-tooltip text="Gestionar permisos" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-shield-check-outline" variant="text" size="small" class="action-button action-button--permission" @click="showAddPermission(item)" /></template></v-tooltip>
              <v-tooltip text="Eliminar rol" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Los permisos determinan las acciones disponibles para cada rol.</div>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog" max-width="620" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading"><div class="dialog-icon"><v-icon size="20">{{ editedIndex === -1 ? "mdi-account-plus-outline" : "mdi-account-edit-outline" }}</v-icon></div><div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">{{ editedIndex === -1 ? "Crea un nuevo perfil de acceso" : "Actualiza la información del rol" }}</div></div></div>
            <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
          </div>
          <v-divider />
          <v-card-text class="dialog-body">
            <div class="form-section-label">Información general</div>
            <v-text-field v-model="editedItem.name" label="Nombre del rol" placeholder="Ej.: Supervisor" prepend-inner-icon="mdi-account-key-outline" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" counter="50" clearable />
            <v-select v-model="editedItem.type" :items="typeOptions" item-title="name" item-value="id" label="Tipo de rol" prepend-inner-icon="mdi-shape-outline" variant="outlined" density="comfortable" :rules="selectRules" />
            <v-textarea v-model="editedItem.description" label="Descripción" placeholder="Describe las responsabilidades de este rol" prepend-inner-icon="mdi-text-box-outline" variant="outlined" density="comfortable" rows="3" auto-grow :rules="descriptionRules" clearable />
          </v-card-text>
          <v-divider />
          <v-card-actions class="dialog-actions">
            <v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn>
            <v-btn type="submit" class="save-button" elevation="0" :loading="loading">{{ editedIndex === -1 ? "Crear rol" : "Guardar cambios" }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="27">mdi-trash-can-outline</v-icon></div>
        <div class="delete-title">Eliminar rol</div>
        <div class="delete-message">¿Deseas eliminar <strong>{{ editedItem.name || "este rol" }}</strong>? Esta acción no se puede deshacer.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogRolePermission" fullscreen transition="dialog-bottom-transition">
      <v-card class="permission-dialog">
        <div class="permission-header">
          <div class="permission-heading">
            <div class="permission-icon"><v-icon size="21">mdi-shield-key-outline</v-icon></div>
            <div><div class="permission-title">Permisos del rol</div><div class="permission-subtitle">{{ selectedRole?.name || "Rol seleccionado" }}</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" class="permission-close" @click="closeDialogRolePermission" />
        </div>
        <v-divider />
        <v-card-text class="permission-body"><RolePermission v-if="dialogRolePermission" :role="selectedRole" /></v-card-text>
        <v-divider />
        <v-card-actions class="permission-actions"><v-spacer /><v-btn class="permission-done" prepend-icon="mdi-check" elevation="0" @click="closeDialogRolePermission">Finalizar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";
import RolePermission from "../rolepermission/RolePermission.vue";

export default {
  name: "RolesView",
  components: { RolePermission },
  data: () => ({
    snackbar: false, sb_type: "", sb_message: "", sb_timeout: 2000, sb_title: "", sb_icon: "",
    valid: false, loading: false, dialog: false, dialogDelete: false, dialogRolePermission: false,
    roles: [], selectedRole: null, editedIndex: -1, search: "",
    typeOptions: [{ name: "Sistema", id: "Sistema" }, { name: "Sucursal", id: "Sucursal" }],
    headers: [
      { title: "Rol", key: "name", value: "name", width: "24%" },
      { title: "Tipo", key: "type", value: "type", width: "16%" },
      { title: "Descripción", key: "description", value: "description", width: "42%" },
      { title: "", key: "actions", value: "actions", sortable: false, align: "end", width: "18%" },
    ],
    editedItem: { id: "", name: "", description: "", type: "Sistema" },
    defaultItem: { id: "", name: "", description: "", type: "Sistema" },
    originalItem: {},
    nameRules: [
      (v) => !!v || "El nombre es requerido",
      (v) => !v || v.length >= 3 || "Debe tener al menos 3 caracteres",
      (v) => !v || v.length <= 50 || "No puede superar los 50 caracteres",
    ],
    descriptionRules: [(v) => !!v || "La descripción es requerida"],
    selectRules: [(v) => !!v || "Debes seleccionar un tipo"],
  }),
  computed: {
    formTitle() { return this.editedIndex === -1 ? "Agregar rol" : "Editar rol"; },
    systemRoles() { return this.roles.filter((role) => this.normalizeRoleType(role.type) === "SISTEMA").length; },
    branchRoles() { return this.roles.filter((role) => this.normalizeRoleType(role.type) === "SUCURSAL").length; },
    registeredCountText() { return this.roles.length === 1 ? "1 rol registrado" : `${this.roles.length} roles registrados`; },
  },
  mounted() { this.initialize(); },
  methods: {
    cloneItem(item) { return { ...item }; },
    unwrapRole(item) { return item?.raw ?? item ?? {}; },
    normalizeRoleType(type) { return String(type ?? "").trim().toUpperCase(); },
    getRoleTypeLabel(type) {
      const normalizedType = this.normalizeRoleType(type);
      if (normalizedType === "SISTEMA") return "Sistema";
      if (normalizedType === "SUCURSAL") return "Sucursal";
      return type || "Sin tipo";
    },
    async initialize() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "role", method: "GET" });
        if (result.success) {
          const raw = Array.isArray(result.data?.roles) ? result.data.roles : [];
          this.roles = raw.filter((role) => role.type !== "");
        } else {
          this.roles = [];
          this.showAlert("warning", result.message || "No fue posible cargar los roles.", 3000);
        }
      } catch (error) {
        this.roles = [];
        this.showAlert("error", "Ocurrió un error al cargar los roles.", 3000);
      } finally { this.loading = false; }
    },
    showAddRole() {
      this.editedIndex = -1; this.editedItem = this.cloneItem(this.defaultItem); this.originalItem = this.cloneItem(this.defaultItem); this.valid = false; this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    editItem(item) {
      const roleItem = this.unwrapRole(item);
      this.editedIndex = this.roles.findIndex((role) => role.id === roleItem.id);
      this.editedItem = this.cloneItem(roleItem); this.originalItem = this.cloneItem(roleItem); this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    close() {
      if (this.loading) return;
      this.dialog = false;
      this.$nextTick(() => { this.resetEditor(); this.$refs.form?.resetValidation(); });
    },
    resetEditor() { this.editedItem = this.cloneItem(this.defaultItem); this.originalItem = this.cloneItem(this.defaultItem); this.editedIndex = -1; this.valid = false; },
    getChangedFields() {
      return ["name", "description", "type"].reduce((changes, key) => {
        if (this.editedItem[key] !== this.originalItem[key]) changes[key] = this.editedItem[key];
        return changes;
      }, {});
    },
    async save() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      const creating = this.editedIndex === -1;
      const payload = creating ? { name: this.editedItem.name, description: this.editedItem.description, type: this.editedItem.type } : this.getChangedFields();
      if (!creating && Object.keys(payload).length === 0) { this.showAlert("warning", "No se realizaron cambios.", 3000); this.close(); return; }
      if (!creating) payload.id = this.editedItem.id;
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "role", method: creating ? "POST" : "PUT", data: payload });
        if (result.success) {
          this.dialog = false; this.showAlert("success", result.message || "Rol guardado correctamente.", 3000);
          await this.initialize(); this.resetEditor();
        } else {
          this.showAlert("warning", result.message || "No fue posible guardar el rol.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al guardar el rol.", 3000);
      } finally { this.loading = false; }
    },
    deleteItem(item) {
      const roleItem = this.unwrapRole(item);
      this.editedItem = {
        ...this.cloneItem(this.defaultItem),
        ...this.cloneItem(roleItem),
      };
      this.dialogDelete = true;
    },
    closeDelete() { if (!this.loading) { this.dialogDelete = false; this.editedItem = this.cloneItem(this.defaultItem); } },
    async deleteItemConfirm() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "role-destroy", method: "POST", data: { id: this.editedItem.id } });
        if (result.success) {
          this.dialogDelete = false; this.showAlert("success", result.message || "Rol eliminado correctamente.", 3000);
          await this.initialize(); this.editedItem = this.cloneItem(this.defaultItem);
        } else this.showAlert("warning", result.message || "No fue posible eliminar el rol.", 3000);
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al eliminar el rol.", 3000);
      } finally { this.loading = false; }
    },
    showAddPermission(item) { this.selectedRole = this.cloneItem(this.unwrapRole(item)); this.dialogRolePermission = true; },
    closeDialogRolePermission() { this.dialogRolePermission = false; this.selectedRole = null; },
    showAlert(type, message, timeout = 3000) {
      const config = {
        success: { title: "Éxito", icon: "mdi-check-circle" },
        error: { title: "Error", icon: "mdi-close-circle" },
        warning: { title: "Advertencia", icon: "mdi-alert-circle" },
      }[type] || { title: "Advertencia", icon: "mdi-alert-circle" };
      this.sb_type = type; this.sb_title = config.title; this.sb_icon = config.icon; this.sb_message = message; this.sb_timeout = timeout; this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.roles-page {
  --blue: #2454d6; --blue-light: #3266e4; --blue-deep: #0e1f46;
  min-height: 100%; color: #1e293b; background: #f6f8fb;
}

.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; }
.page-heading,.dialog-heading { display:flex; align-items:center; gap:11px; }
.page-icon,.dialog-icon { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }
.page-title { margin:0; color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }
.page-subtitle { margin:3px 0 0; color:#526176; font-size:12px; font-weight:650; }
.add-button,.save-button { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }
.add-button:hover,.save-button:hover { background:linear-gradient(100deg,#1f49bd,#2859d1)!important; }
.page-content { padding:18px 24px 28px; }
.summary-row { margin-bottom:4px; }
.summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }
.summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }
.summary-icon--blue { color:#2454d6; background:#eef3ff; }.summary-icon--green { color:#16875a; background:#eaf8f1; }.summary-icon--slate { color:#64748b; background:#f1f5f9; }
.summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }
.table-panel { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }
.table-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:69px; padding:12px 17px; }
.section-title { color:#0f172a; font-size:15px; font-weight:850; }.section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.search-field { flex:0 1 300px; }.search-field :deep(.v-field) { border-radius:9px; font-size:12px; }.search-field :deep(.v-field__outline) { color:#dce3ed; }
.roles-table { color:#334155; background:transparent; }
.roles-table :deep(thead th) { height:40px!important; color:#475569!important; font-size:10.5px!important; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }
.roles-table :deep(tbody td) { height:58px!important; color:#334155; font-size:12px; border-bottom:1px solid #eef2f6!important; }.roles-table :deep(tbody tr:hover) { background:#f8faff!important; }
.role-name-cell { display:flex; align-items:center; gap:9px; min-width:0; }.role-avatar { display:grid; flex:0 0 31px; width:31px; height:31px; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }
.cell-copy { min-width:0; }.role-name { overflow:hidden; color:#172033; font-size:12.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }.role-id { margin-top:2px; color:#64748b; font-size:10px; font-weight:650; }
.description-cell { max-width:520px; overflow:hidden; color:#475569; font-size:11.5px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 7px; font-size:10.5px; font-weight:750; border-radius:7px; }.status-badge--active { color:#16875a; background:#eaf8f1; }.status-badge--inactive { color:#64748b; background:#f1f5f9; }.status-dot { width:6px; height:6px; background:currentColor; border-radius:50%; }
.action-buttons { display:flex; justify-content:flex-end; gap:2px; }.action-button { border-radius:8px!important; }.action-button--edit { color:#2454d6!important; }.action-button--edit:hover { background:#eef3ff; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }
.table-footer-note { display:flex; align-items:center; gap:6px; min-height:42px; padding:9px 16px; color:#64748b; font-size:10.5px; font-weight:650; border-top:1px solid #edf1f5; }

.form-dialog,.delete-dialog { --blue:#2454d6; overflow:hidden; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }
.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-icon { flex-basis:38px; }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }
.dialog-body { padding:21px 22px 13px!important; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }
.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }
.status-control { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:11px 13px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.status-control-title { color:#334155; font-size:12.5px; font-weight:800; }.status-control-description { margin-top:4px; color:#64748b; font-size:10.5px; font-weight:600; }.status-switch { display:flex; align-items:center; gap:8px; font-size:11.5px; font-weight:800; }.is-active { color:#16875a; }.is-inactive { color:#64748b; }
.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:138px; padding-inline:18px!important; }
.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius:11px; }

@media (max-width:959px) { .page-header { padding-inline:17px; }.page-content { padding:15px 17px 24px; }.roles-table { overflow-x:auto; }.roles-table :deep(.v-table__wrapper) { min-width:850px; } }
@media (max-width:600px) { .page-header { align-items:flex-start; padding:11px 12px; }.page-subtitle { max-width:210px; }.add-button { min-width:42px!important; padding-inline:10px!important; }.add-button :deep(.v-btn__content) { font-size:0; }.add-button :deep(.v-icon) { margin:0!important; }.page-content { padding:11px 12px 20px; }.table-toolbar { align-items:stretch; flex-direction:column; gap:10px; }.search-field { flex-basis:auto; width:100%; }.dialog-header { padding:14px; }.dialog-body { padding:17px 14px 10px!important; }.status-control { align-items:flex-start; flex-direction:column; }.status-switch { width:100%; justify-content:space-between; }.dialog-actions { padding-inline:13px!important; } }

.role-type-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 8px; font-size:10.5px; font-weight:750; border-radius:7px; white-space:nowrap; }
.role-type-badge--system { color:#2454d6; background:#eef3ff; }
.role-type-badge--branch { color:#7c3aed; background:#f3efff; }
.action-button--permission { color:#16875a!important; }
.action-button--permission:hover { background:#eaf8f1; }
.permission-dialog { --blue:#2454d6; display:flex; flex-direction:column; background:#f6f8fb!important; }
.permission-header { display:flex; flex:0 0 auto; align-items:center; justify-content:space-between; min-height:68px; padding:11px 20px; background:#fff; }
.permission-heading { display:flex; align-items:center; gap:11px; }
.permission-icon { display:grid; width:38px; height:38px; place-items:center; color:#fff; background:linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; }
.permission-title { color:#0f172a; font-size:15px; font-weight:850; }
.permission-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.permission-close { color:#64748b!important; }
.permission-body { flex:1 1 auto; min-height:0; padding:18px!important; overflow:auto; }
.permission-actions { flex:0 0 auto; min-height:60px; padding:10px 20px!important; background:#fff; }
.permission-done { min-width:110px; min-height:39px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12px; font-weight:800; letter-spacing:0; text-transform:none; }
</style>
