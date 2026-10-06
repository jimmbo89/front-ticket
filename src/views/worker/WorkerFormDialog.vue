<template>
  <v-dialog v-model="isOpen" max-width="780" persistent>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-card class="form-dialog" elevation="0">
        <div class="dialog-header">
          <div class="dialog-heading">
            <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-account</v-icon><v-icon class="dialog-icon-action" size="11">{{ isCreating ? "mdi-plus" : "mdi-pencil" }}</v-icon></div>
            <div><div class="dialog-title">{{ isCreating ? "Agregar trabajador" : "Editar trabajador" }}</div><div class="dialog-subtitle">{{ isCreating ? "Registra un nuevo usuario operativo" : "Actualiza el trabajador y su asociación" }}</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
        </div>
        <v-divider />

        <v-card-text class="dialog-body">
          <div class="form-section-label">Información de acceso</div>
          <v-row dense>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.name" label="Nombre completo" placeholder="Nombre y apellidos" prepend-inner-icon="mdi-account-outline" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.email" label="Correo electrónico" placeholder="nombre@empresa.cl" prepend-inner-icon="mdi-email-outline" variant="outlined" density="comfortable" :rules="emailRules" clearable /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.user" label="Usuario" placeholder="Usuario de acceso" prepend-inner-icon="mdi-account-circle-outline" variant="outlined" density="comfortable" clearable /></v-col>
            <v-col v-if="isCreating" cols="12" md="6"><v-text-field v-model="formItem.password" :type="showPassword ? 'text' : 'password'" label="Contraseña" placeholder="Mínimo 5 caracteres" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" variant="outlined" density="comfortable" :rules="requiredRules" @click:append-inner="showPassword = !showPassword" /></v-col>
            <v-col cols="12" md="6"><v-autocomplete v-model="formItem.role_id" :items="roles" item-title="name" item-value="id" label="Rol del sistema" prepend-inner-icon="mdi-account-tie-outline" variant="outlined" density="comfortable" no-data-text="No hay roles disponibles" :rules="selectRules" :menu-props="{ contentClass: 'worker-role-menu' }"><template #item="{ props, item }"><v-list-item v-bind="props" :title="item.raw.name"><template #prepend><div class="role-menu-icon"><v-icon size="18">mdi-account-tie-outline</v-icon></div></template></v-list-item></template></v-autocomplete></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.trim="formItem.rut" label="RUT" placeholder="12.345.678-9" prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" density="comfortable" :rules="rutRules" clearable /></v-col>
          </v-row>

          <div class="form-section-label form-section-label--spaced">Información de contacto</div>
          <v-row dense><v-col cols="12" md="6"><v-text-field v-model.trim="formItem.phone" label="Teléfono" placeholder="+56912345678" prepend-inner-icon="mdi-phone-outline" variant="outlined" density="comfortable" :rules="mobileRules" clearable /></v-col><v-col cols="12" md="6"><v-text-field v-model.trim="formItem.address" label="Dirección" placeholder="Dirección del trabajador" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" density="comfortable" clearable /></v-col></v-row>

          <div class="form-section-label form-section-label--spaced">Sucursal del trabajador</div>
          <section class="branch-association-panel">
            <div class="association-heading">
              <div class="association-heading-icon"><v-icon size="19">mdi-store-marker-outline</v-icon></div>
              <div><div class="association-heading-title">Asociación opcional</div><div class="association-heading-copy">Un trabajador puede pertenecer a una sola sucursal. El rol seleccionado se aplicará a la asociación.</div></div>
            </div>
            <MultiSelectCombobox
              :model-value="selectedBranchRows"
              :items="branchRows"
              item-title="name"
              item-value="id"
              label="Seleccionar sucursal"
              placeholder="Busca por sucursal o dirección"
              prepend-inner-icon="mdi-store-search-outline"
              no-data-text="No hay sucursales que coincidan con la búsqueda."
              :disabled="loading"
              :loading="loading"
              :custom-filter="branchFilter"
              :menu-props="{ contentClass: 'worker-branch-select-menu' }"
              class="worker-branch-combobox"
              @update:model-value="updateSelectedBranch"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.address">
                  <template #prepend>
                    <div class="worker-branch-avatar"><v-img v-if="branchImage(item.raw)" :src="branchImage(item.raw)" width="36" height="36" cover><template #error><div class="image-fallback"><v-icon size="18">mdi-store</v-icon></div></template></v-img><v-icon v-else size="18">mdi-store</v-icon></div>
                  </template>
                  <template #append><span class="worker-branch-status" :class="item.raw.associated ? 'worker-branch-status--associated' : 'worker-branch-status--available'">{{ item.raw.associated ? "Asociada" : "Disponible" }}</span></template>
                </v-list-item>
              </template>
              <template #selection="{ item, remove }">
                <v-chip class="selected-worker-branch-chip" closable @click:close="remove">
                  <template #prepend><v-icon size="14">mdi-store</v-icon></template>
                  {{ item.raw.name }}
                </v-chip>
              </template>
            </MultiSelectCombobox>
          </section>

          <div class="form-section-label form-section-label--spaced">Imagen del trabajador</div>
          <div class="image-upload-area"><div class="image-preview"><v-img v-if="imagePreview" :key="imagePreview" :src="imagePreview" width="92" height="92" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-account</v-icon></div></div><div class="upload-copy"><div class="upload-title">Fotografía de perfil</div><div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @update:model-value="onFileSelected" /></div></div>
        </v-card-text>

        <v-divider /><v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ isCreating ? "Crear trabajador" : "Guardar cambios" }}</v-btn></v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-snackbar v-model="snackbar" location="right top" :timeout="snackbarTimeout" :color="snackbarType" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="snackbarIcon" size="22" /><div><div class="snackbar-title">{{ snackbarTitle }}</div><div class="snackbar-message">{{ snackbarMessage }}</div></div></div></v-snackbar>
</template>

<script>
import MultiSelectCombobox from "@/components/MultiSelectCombobox.vue";

export default {
  name: "WorkerFormDialog",
  components: { MultiSelectCombobox },
  emits: ["update:modelValue", "save"],
  props: {
    modelValue: { type: Boolean, default: false },
    worker: { type: Object, default: () => ({}) },
    roles: { type: Array, default: () => [] },
    branches: { type: Array, default: () => [] },
    isCreating: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data: () => ({
    valid: false,
    formItem: {},
    originalBranches: [],
    branchRows: [],
    file: null,
    imgMiniatura: "",
    showPassword: false,
    syncingRole: false,
    snackbar: false,
    snackbarType: "",
    snackbarTitle: "",
    snackbarIcon: "",
    snackbarMessage: "",
    snackbarTimeout: 3000,
    nameRules: [(v) => !!v || "El campo es requerido", (v) => v && v.length <= 50 || "El campo debe tener menos de 51 caracteres", (v) => v && v.length >= 3 || "El campo debe tener al menos 3 caracteres"],
    selectRules: [(v) => !!v || "Seleccionar un rol"],
    requiredRules: [(v) => !!v || "El campo es requerido"],
    mobileRules: [(v) => !!v || "El número de teléfono es requerido", (v) => /^\+569\d{8}$/.test(v) || "Formato de número móvil inválido. Ejemplo: +56912345678"],
    rutRules: [(v) => !!v || "El RUT es requerido", (v) => /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) || "El RUT debe estar en el formato XX.XXX.XXX-Y"],
    emailRules: [(v) => !!v || "El Correo Electrónico es requerido", (v) => /.+@.+\..+/.test(v) || "El Correo Electrónico no es válido"],
  }),
  computed: {
    isOpen: { get() { return this.modelValue; }, set(value) { this.$emit("update:modelValue", value); } },
    imagePreview() { return this.imgMiniatura || this.baseImageUrl(this.formItem?.image); },
    hasAssociatedBranch() { return this.branchRows.some((branch) => branch.associated); },
    selectedBranchRows() { return this.branchRows.filter((branch) => branch.associated); },
    branchChanges() {
      const originalById = new Map(this.originalBranches.map((branch) => [String(branch.id), branch]));
      return this.branchRows.map((branch) => {
        const original = originalById.get(String(branch.id));
        const originalAssociated = Boolean(original?.associated);
        const currentRole = branch.role_id ?? this.formItem.role_id ?? null;
        if (!originalAssociated && branch.associated) return { association_id: null, branch_id: branch.id, role_id: currentRole, action: "associate" };
        if (originalAssociated && !branch.associated) return { association_id: original.relationId, branch_id: branch.id, role_id: original.role_id ?? null, action: "delete" };
        if (originalAssociated && branch.associated && String(original.role_id ?? "") !== String(currentRole ?? "")) return { association_id: original.relationId, branch_id: branch.id, role_id: currentRole, action: "update" };
        return null;
      }).filter(Boolean);
    },
  },
  watch: {
    modelValue(value) { if (value) this.syncFromWorker(); },
    worker: { deep: true, handler() { if (this.modelValue) this.syncFromWorker(); } },
    branches: { deep: true, handler() { if (this.modelValue) this.syncFromWorker(); } },
    "formItem.role_id"(value) {
      if (this.syncingRole) return;
      const associated = this.branchRows.find((branch) => branch.associated);
      if (associated) associated.role_id = value;
    },
  },
  methods: {
    defaultItem() { return { id: "", name: "", user: "", email: "", image: "", phone: "", password: "", rut: "", address: "", role_id: "", user_id: "", branches: [] }; },
    toArray(value) { return Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []); },
    syncFromWorker() {
      this.formItem = { ...this.defaultItem(), ...this.worker, branches: [] };
      const catalog = this.toArray(this.branches);
      const workerBranches = this.toArray(this.worker?.branches);
      const byId = new Map();
      catalog.forEach((branch) => { const normalized = this.normalizeBranch({ ...branch, associated: false, association_id: null, role_id: null }); if (normalized.id) byId.set(String(normalized.id), normalized); });
      workerBranches.forEach((branch) => { const normalized = this.normalizeBranch(branch); if (!normalized.id) return; byId.set(String(normalized.id), { ...byId.get(String(normalized.id)), ...normalized }); });
      this.branchRows = Array.from(byId.values());
      const associated = this.branchRows.find((branch) => branch.associated);
      if (associated?.role_id !== null && associated?.role_id !== undefined && associated?.role_id !== "") {
        this.syncingRole = true;
        this.formItem.role_id = associated.role_id;
        this.$nextTick(() => { this.syncingRole = false; });
      }
      if (this.isCreating) {
        this.originalBranches = [];
        this.branchRows = this.branchRows.map((branch) => ({ ...branch, associated: false, relationId: null, role_id: null }));
      } else {
        this.originalBranches = this.branchRows.map((branch) => ({ ...branch }));
      }
      this.file = null;
      this.imgMiniatura = this.baseImageUrl(this.worker?.image);
      this.showPassword = false;
      this.valid = false;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    normalizeBranch(branch = {}) {
      const relationId = branch.association_id ?? branch.associationId ?? branch.workerBranchId ?? branch.worker_branch_id ?? null;
      const associated = branch.associated === true || relationId !== null && relationId !== undefined && relationId !== "";
      return { ...branch, id: branch.branch_id ?? branch.branchId ?? branch.id ?? "", name: branch.name ?? branch.branchName ?? "Sucursal sin nombre", address: branch.address ?? branch.branchAddress ?? "Dirección no disponible", image: branch.image ?? branch.branchImage ?? "", associated, relationId, role_id: branch.role_id ?? branch.roleId ?? branch.association_role_id ?? null };
    },
    roleName(roleId) { return this.roles.find((role) => String(role.id) === String(roleId))?.name || "Sin rol"; },
    baseImageUrl(source) {
      if (!source) return "";
      const image = typeof source === "string" ? source.trim() : String(source.image ?? source.image_url ?? source.imageUrl ?? source.url ?? source.path ?? "").trim();
      if (!image) return "";
      if (/^(https?:|data:|blob:)/i.test(image)) return image;
      const base = String(this.$axios.defaults.baseURL || "");
      const clean = image.replace(/^\/+/, "");
      return clean.startsWith("images/") ? `${base}${clean}` : `${base}images/${clean}`;
    },
    branchImage(branch) { return this.baseImageUrl(branch?.image); },
    branchFilter(value, query, item) {
      const search = String(query ?? "").toLowerCase().trim();
      if (!search) return 1;
      const branch = item?.raw ?? item ?? {};
      const searchable = [value, branch.id, branch.name, branch.address].map((part) => String(part ?? "").toLowerCase()).join(" ");
      return searchable.includes(search) ? 1 : -1;
    },
    updateSelectedBranch(selectedBranches) {
      const selected = this.toArray(selectedBranches);
      const selectedBranch = selected[selected.length - 1] || null;
      const selectedId = selectedBranch?.id ?? selectedBranch ?? null;
      const current = this.branchRows.find((branch) => branch.associated);
      if (current && (!selectedId || String(current.id) !== String(selectedId))) {
        const original = this.originalBranches.find((item) => String(item.id) === String(current.id));
        if (original?.associated && !current.relationId) { this.notify("warning", "No se pudo identificar la asociación de la sucursal."); return; }
      }
      this.branchRows = this.branchRows.map((branch) => {
        const associated = selectedId !== null && String(branch.id) === String(selectedId);
        return { ...branch, associated, role_id: associated ? (branch.role_id ?? this.formItem.role_id ?? null) : branch.role_id };
      });
      const associated = this.branchRows.find((branch) => branch.associated);
      if (associated) associated.role_id = this.formItem.role_id || null;
    },
    onFileSelected(value) {
      const selected = value?.target?.files?.[0] || (Array.isArray(value) ? value[0] : value);
      if (!selected) { this.file = null; this.imgMiniatura = ""; return; }
      if (selected.size > 500 * 1024) { this.file = null; this.notify("warning", "El archivo de imagen debe ser de máximo 500 KB"); return; }
      this.file = selected;
      const reader = new FileReader(); reader.onload = (event) => { this.imgMiniatura = event.target.result; }; reader.readAsDataURL(selected);
    },
    async submit() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      this.$emit("save", { item: { ...this.formItem }, file: this.file, branches: this.branchChanges });
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
.form-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon-main{transform:translate(-2px,1px)}.dialog-icon-action{position:absolute;right:5px;bottom:5px;padding:1px;color:#0e1f46;background:#fff;border-radius:50%}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.dialog-body{max-height:72vh;padding:21px 22px 18px!important;overflow-y:auto}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-section-label--spaced{margin-top:9px}.dialog-body :deep(.v-field){border-radius:9px}.dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.branch-association-panel{padding:13px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.association-heading{display:flex;align-items:center;gap:9px;margin-bottom:12px}.association-heading>div:nth-child(2){min-width:0;flex:1}.association-heading-icon{display:grid;width:32px;height:32px;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:8px}.association-heading-title{color:#0f172a;font-size:12.5px;font-weight:850}.association-heading-copy{margin-top:2px;color:#64748b;font-size:10.5px;font-weight:650;line-height:1.35}.branch-search-button{flex:0 0 auto;color:#2454d6!important;border-radius:8px!important}.branch-search-button:hover{background:#eef3ff}.branch-search-field{margin-bottom:9px}.branch-association-list{max-height:320px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #e8edf5;border-radius:9px}.branch-association-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eef2f6}.branch-association-row:last-child{border-bottom:0}.branch-summary{display:flex;align-items:center;gap:9px;min-width:0}.branch-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;overflow:hidden;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:9px}.branch-avatar :deep(.v-img__img){object-fit:cover}.image-fallback{display:grid;width:100%;height:100%;place-items:center}.cell-copy{min-width:0}.branch-name{overflow:hidden;color:#0f172a;font-size:12px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.branch-caption{overflow:hidden;margin-top:2px;color:#64748b;font-size:10px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.branch-row-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:7px;font-size:10.5px;font-weight:800;white-space:nowrap}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--available{color:#8a5b08;background:#fff6e6}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-button{border-radius:8px!important}.action-button--associate{color:#16875a!important}.action-button--associate:hover{background:#eaf8f1}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.association-empty,.selection-summary{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;color:#64748b;background:#fff;border:1px solid #e8edf5;border-radius:8px;font-size:10.5px;font-weight:650;line-height:1.45}.selection-summary{margin-top:9px}.image-upload-area{display:flex;align-items:center;gap:14px;padding:12px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.image-preview{display:grid;flex:0 0 92px;width:92px;height:92px;overflow:hidden;place-items:center;background:#eef3ff;border:1px solid #dce6ff;border-radius:10px}.image-preview :deep(.v-img__img){object-fit:cover}.preview-placeholder{display:grid;width:100%;height:100%;place-items:center;color:#8aa0bf}.upload-copy{min-width:0;flex:1}.upload-title{color:#334155;font-size:12.5px;font-weight:850}.upload-description{margin:4px 0 8px;color:#64748b;font-size:10.5px;font-weight:650}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.save-button{min-width:150px;min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-title{font-size:11px;font-weight:850}.snackbar-message{margin-top:2px;font-size:9.5px;font-weight:600}.busgo-snackbar :deep(.v-snackbar__wrapper){border-radius:11px}.worker-role-menu .v-list{padding:6px!important}.worker-role-menu .v-list-item{min-height:48px!important;margin:2px 0;border-radius:9px!important}.worker-role-menu .v-list-item:hover{background:#f4f7ff!important}.worker-role-menu .v-list-item-title{color:#1e293b!important;font-size:12.5px!important;font-weight:750!important}.worker-role-menu .role-menu-icon{display:grid;width:34px;height:34px;place-items:center;color:#5145a8;background:#f1edff;border-radius:8px}@media(max-width:600px){.dialog-header{padding:14px}.dialog-body{padding:17px 14px 12px!important}.branch-association-row{align-items:flex-start;flex-direction:column}.branch-row-actions{width:100%;justify-content:flex-end}.branch-caption{max-width:240px}.image-upload-area{align-items:flex-start;flex-direction:column}.dialog-actions{padding-inline:13px!important}}
</style>
<style scoped>
.branch-role-label{display:inline-flex;align-items:center;justify-content:flex-start;gap:5px;min-width:230px;max-width:230px;overflow:hidden;color:#475569;font-size:11px;font-weight:750;text-overflow:ellipsis;white-space:nowrap}.branch-role-label :deep(.v-icon){color:#5145a8}@media(max-width:600px){.branch-role-label{width:100%;min-width:0;max-width:100%}}
</style>

<style>
.worker-branch-select-menu .v-list{padding:6px!important}.worker-branch-select-menu .v-list-item{min-height:54px;margin:2px 0;border-radius:9px}.worker-branch-select-menu .v-list-item:hover{background:#f4f7ff}.worker-branch-select-menu .v-list-item__prepend{margin-inline-end:12px!important}.worker-branch-select-menu .v-list-item-subtitle{color:#64748b!important;font-size:10.5px!important;font-weight:650!important;opacity:1!important}.worker-branch-select-menu .worker-branch-avatar{display:grid;flex:0 0 36px;width:36px;height:36px;overflow:hidden;place-items:center;color:#16875a;background:#eaf8f1;border:1px solid #d7f1e5;border-radius:9px}.worker-branch-select-menu .worker-branch-avatar :deep(.v-img__img){object-fit:cover}.worker-branch-status{display:inline-flex;align-items:center;padding:4px 7px;border-radius:7px;font-size:10px;font-weight:800}.worker-branch-status--associated{color:#116b49;background:#eaf8f1}.worker-branch-status--available{color:#8a5b08;background:#fff6e6}.selected-worker-branch-chip{max-width:220px!important;color:#2454d6!important;background:#eef3ff!important;font-size:11px!important;font-weight:750!important}.selected-worker-branch-chip .v-chip__content{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selected-worker-branch-chip .v-chip__close{color:#64748b!important}.selected-worker-branch-chip .v-chip__close:hover{color:#dc2626!important}
</style>
