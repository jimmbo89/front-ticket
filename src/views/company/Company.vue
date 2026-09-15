<template>
  <div class="company-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10">
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div><strong>{{ sb_title }}</strong><small>{{ sb_message }}</small></div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><v-icon size="22">mdi-office-building-outline</v-icon></div>
        <div><h1>Empresa</h1><p>Administra la identidad y los datos principales de tu organización</p></div>
      </div>
      <v-btn v-if="!loading && companies.length === 0" class="primary-button" prepend-icon="mdi-plus" elevation="0" @click="showAddBusiness">
        Agregar empresa
      </v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4">
          <div class="summary-card"><div class="summary-icon blue"><v-icon size="19">mdi-domain</v-icon></div><div><b>{{ companies.length }}</b><span>Empresa registrada</span></div></div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card"><div class="summary-icon green"><v-icon size="19">mdi-check-decagram-outline</v-icon></div><div><b>{{ companies.length ? 'Configurada' : 'Pendiente' }}</b><span>Estado de la organización</span></div></div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card"><div class="summary-icon amber"><v-icon size="19">mdi-image-outline</v-icon></div><div><b>{{ companies[0]?.image ? 'Disponible' : 'Sin logo' }}</b><span>Identidad corporativa</span></div></div>
        </v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div><div class="section-title">Datos de la empresa</div><div class="section-subtitle">{{ registeredCountText }}</div></div>
          <v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar empresa..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable />
        </div>
        <v-divider />
        <v-data-table v-model:items-per-page="itemsPerPage" v-model:page="page" v-model:sort-by="sortBy" :headers="headers" :items="companies" :search="search" :loading="loading" :items-per-page-options="[5,10,15,25]" items-per-page-text="Elementos por página" no-data-text="No hay empresas disponibles" loading-text="Cargando empresa..." class="companies-table">
          <template #loading><v-skeleton-loader type="table-row@3" /></template>
          <template #[`item.name`]="{ item }">
            <div class="company-name-cell">
              <button type="button" class="company-avatar" title="Ampliar logotipo" @click="openLogo(item)"><v-img v-if="item.displayImage" :src="item.displayImage" class="company-photo" width="46" height="38" contain><template #error><div class="image-fallback"><v-icon size="18">mdi-domain</v-icon></div></template></v-img><v-icon v-else size="18">mdi-domain</v-icon></button>
              <div class="cell-copy"><div class="company-name">{{ item.name || 'Empresa sin nombre' }}</div><div class="company-address">{{ item.address || 'Dirección no registrada' }}</div></div>
            </div>
          </template>
          <template #[`item.rut`]="{ item }"><span class="table-value">{{ item.rut || 'No registrado' }}</span></template>
          <template #[`item.phone`]="{ item }"><span class="phone-value"><v-icon size="15">mdi-phone-outline</v-icon>{{ item.phone || 'No registrado' }}</span></template>
          <template #[`item.image`]="{ item }"><span class="status-badge" :class="item.image ? 'status-badge--active' : 'status-badge--inactive'"><span class="status-dot" />{{ item.image ? 'Disponible' : 'Sin logo' }}</span></template>
          <template #[`item.actions`]="{ item }"><div class="action-buttons"><v-tooltip text="Editar empresa" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip><v-tooltip text="Eliminar empresa" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip></div></template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>El logotipo se utiliza en la navegación y otros elementos de identidad de BusGo.</div>
      </v-card>
    </v-container>

    <v-dialog v-model="logoDialog" max-width="620">
      <v-card class="logo-dialog" elevation="0">
        <div class="dialog-header">
        <div class="dialog-heading"><div class="dialog-icon"><v-icon size="20">mdi-image-outline</v-icon></div><div><div class="dialog-title">Logotipo corporativo</div><div class="dialog-subtitle">{{ selectedCompany?.name || 'Empresa' }}</div></div></div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="logoDialog = false" />
        </div>
        <v-divider />
        <div class="logo-preview-large"><v-img :src="selectedCompany?.displayImageNoCache || selectedCompany?.displayImage" max-height="420" contain><template #error><div class="large-logo-fallback"><v-icon size="54">mdi-domain</v-icon></div></template></v-img></div>
        <v-divider />
        <v-card-actions class="dialog-actions"><v-btn class="cancel-button" variant="text" @click="logoDialog = false">Cerrar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading"><div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-office-building-outline</v-icon><v-icon class="dialog-icon-action" size="11">{{ editedIndex === -1 ? 'mdi-plus' : 'mdi-pencil' }}</v-icon></div><div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">{{ editedIndex === -1 ? 'Registra la información de tu organización' : 'Actualiza los datos y la identidad corporativa' }}</div></div></div>
            <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
          </div>
          <v-divider />
          <v-card-text class="dialog-body">
            <div class="form-section-label">Información general</div>
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.name" label="Nombre de la empresa" prepend-inner-icon="mdi-domain" variant="outlined" density="comfortable" clearable :rules="nameRules" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.rut" label="RUT" placeholder="12.345.678-9" prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" density="comfortable" clearable :rules="rutRules" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.phone" label="Teléfono" placeholder="+56912345678" prepend-inner-icon="mdi-phone-outline" variant="outlined" density="comfortable" clearable :rules="mobileRules" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.address" label="Dirección" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" density="comfortable" clearable /></v-col>
            </v-row>

            <div class="form-section-label form-section-label--spaced">Imagen de la empresa</div>
            <div class="image-upload-area">
              <div class="image-preview"><v-img v-if="imgMiniatura" :src="imgMiniatura" class="preview-image" contain><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-image-outline</v-icon></div></div>
              <div class="upload-copy"><div class="upload-title">Logotipo corporativo</div><div class="upload-description">Formatos JPG, JPEG o PNG. Se optimizará automáticamente hasta 500 KB.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @change="onFileInputChange" @update:model-value="onFileSelected" /></div>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="dialog-actions">
            <v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn>
            <v-btn type="submit" class="save-button" prepend-icon="mdi-content-save-outline" elevation="0" :disabled="!valid" :loading="loading">{{ editedIndex === -1 ? 'Crear empresa' : 'Guardar cambios' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="440" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="28">mdi-trash-can-outline</v-icon></div>
        <div class="delete-title">Eliminar empresa</div>
        <div class="delete-message">¿Deseas eliminar <strong>{{ editedItem.name || 'esta empresa' }}</strong>? Esta acción no se puede deshacer.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="confirm-delete" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";
import LocalStorageService from "@/LocalStorageService";

export default {
  name: "CompanyView",
  data: () => ({
    snackbar: false, sb_type: "", sb_message: "", sb_timeout: 2500, sb_title: "", sb_icon: "",
    valid: false, loading: false, dialog: false, dialogDelete: false, logoDialog: false,
    companies: [], selectedCompany: null, file: null, imgMiniatura: "", editedIndex: -1,
    search: "", page: 1, itemsPerPage: 10, sortBy: [],
    headers: [
      { title: "Empresa / Dirección", key: "name", sortable: true, width: "42%" },
      { title: "RUT", key: "rut", sortable: true, width: "18%" },
      { title: "Teléfono", key: "phone", sortable: true, width: "18%" },
      { title: "Logotipo", key: "image", sortable: true, width: "13%" },
      { title: "", key: "actions", sortable: false, align: "end", width: "9%" },
    ],
    editedItem: { id: "", name: "", address: "", rut: "", image: "", phone: "" },
    originalItem: { id: "", name: "", address: "", rut: "", image: "", phone: "" },
    defaultItem: { id: "", name: "", address: "", rut: "", image: "", phone: "" },
    nameRules: [v => !!v || "El nombre es requerido", v => !v || v.length >= 3 || "Debe tener al menos 3 caracteres", v => !v || v.length <= 50 || "Debe tener como máximo 50 caracteres"],
    mobileRules: [v => !!v || "El teléfono es requerido", v => /^\+569\d{8}$/.test(v || "") || "Usa el formato +56912345678"],
    rutRules: [v => !!v || "El RUT es requerido", v => /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v || "") || "Usa el formato 12.345.678-9"],
  }),
  computed: {
    formTitle() { return this.editedIndex === -1 ? "Agregar empresa" : "Editar empresa"; },
    registeredCountText() { return this.companies.length === 1 ? "1 empresa registrada" : `${this.companies.length} empresas registradas`; },
  },
  mounted() { this.initialize(); },
  methods: {
    clone(value) { return JSON.parse(JSON.stringify(value)); },
    unwrapItem(item) { return item?.raw ?? item ?? {}; },
    resolveCompanyImage(image, cache = true) {
      const source = String(image || "").trim();
      if (!source) return "";
      if (/^(https?:|data:|blob:)/i.test(source)) return source;
      const base = String(this.$axios.defaults.baseURL || "");
      const path = source.replace(/^\/+/, "");
      const url = path.startsWith("images/") ? `${base}${path}` : `${base}images/${path}`;
      return cache ? `${url}${url.includes("?") ? "&" : "?"}t=${this.getCacheTimestamp()}` : url;
    },
    getCacheTimestamp() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); },
    openLogo(item) { this.selectedCompany = this.unwrapItem(item); this.logoDialog = true; },
    showAddBusiness() { this.resetForm(); this.dialog = true; this.$nextTick(() => this.$refs.form?.resetValidation()); },
    async initialize() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "company", method: "GET" });
        const rows = result.success ? (result.data?.companies || []) : [];
        this.companies = rows.map(company => ({
          ...company,
          displayImage: this.resolveCompanyImage(company.image),
          displayImageNoCache: this.resolveCompanyImage(company.image, false),
        }));
        const company = this.companies[0];
        if (company) {
          LocalStorageService.setItem("nameBusiness", company.name ?? "");
          LocalStorageService.setItem("imageBusiness", company.image ?? "");
          window.dispatchEvent(new Event("branding-updated"));
        }
      } catch (error) { this.showAlert("error", "No fue posible cargar la información de la empresa.", 3000); }
      finally { this.loading = false; }
    },
    editItem(item) {
      const company = this.unwrapItem(item);
      this.editedIndex = this.companies.findIndex(item => String(item.id) === String(company.id));
      this.originalItem = this.clone(company);
      this.editedItem = this.clone(company);
      this.file = null;
      this.imgMiniatura = company.displayImageNoCache || this.resolveCompanyImage(company.image, false);
      this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },
    deleteItem(item) { const company = this.unwrapItem(item); this.editedItem = { ...this.defaultItem, ...company }; this.dialogDelete = true; },
    close() { if (!this.loading) { this.dialog = false; this.$nextTick(this.resetForm); } },
    resetForm() { this.editedItem = { ...this.defaultItem }; this.originalItem = { ...this.defaultItem }; this.editedIndex = -1; this.file = null; this.imgMiniatura = ""; this.$refs.form?.resetValidation(); },
    closeDelete() { if (!this.loading) { this.dialogDelete = false; this.editedItem = { ...this.defaultItem }; } },
    changedFields() {
      const keys = ["name", "address", "rut", "phone"];
      return keys.reduce((result, key) => { if (this.editedItem[key] !== this.originalItem[key]) result[key] = this.editedItem[key]; return result; }, {});
    },
    async save() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;
      const creating = this.editedIndex === -1;
      const fields = creating ? { name: this.editedItem.name, address: this.editedItem.address || "", phone: this.editedItem.phone, rut: this.editedItem.rut } : this.changedFields();
      if (!creating && !Object.keys(fields).length && !this.file) { this.showAlert("success", "No se realizaron cambios.", 2500); this.dialog = false; this.resetForm(); return; }
      const formData = new FormData();
      if (!creating) formData.append("id", this.editedItem.id);
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value ?? ""));
      if (this.file) formData.append("image", this.file);
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: creating ? "company" : "company-update", method: "POST", data: formData });
        if (result.success) {
          this.showAlert("success", result.message || "Empresa guardada correctamente.", 3000);
          this.dialog = false; this.resetForm(); await this.initialize();
        } else this.showAlert("warning", result.message || "No fue posible guardar la empresa.", 3000);
      } catch (error) { this.showAlert("error", "Ocurrió un error al guardar la empresa.", 3000); }
      finally { this.loading = false; }
    },
    async deleteItemConfirm() {
      this.loading = true;
      try {
        const result = await handleRequest({ endpoint: "company-destroy", method: "POST", data: { id: this.editedItem.id } });
        if (result.success) { this.dialogDelete = false; this.showAlert("success", result.message || "Empresa eliminada correctamente.", 3000); this.editedItem = { ...this.defaultItem }; await this.initialize(); }
        else this.showAlert("warning", result.message || "No fue posible eliminar la empresa.", 3000);
      } catch (error) { this.showAlert("error", "Ocurrió un error al eliminar la empresa.", 3000); }
      finally { this.loading = false; }
    },
    async onFileSelected(value) {
      const selected = Array.isArray(value) ? value[0] : value;
      if (!selected) { this.file = null; this.imgMiniatura = this.editedIndex >= 0 ? this.resolveCompanyImage(this.originalItem.image, false) : ""; return; }
      const maxSize = 500 * 1024, maxDimension = 320;
      try {
        const dimensions = await this.getImageDimensions(selected);
        const shouldResize = dimensions.width > maxDimension || dimensions.height > maxDimension || selected.size > maxSize;
        const imageFile = shouldResize ? await this.resizeImageFile(selected, maxDimension, maxDimension) : selected;
        if (imageFile.size > maxSize) throw new Error("La imagen optimizada supera los 500 KB");
        this.file = imageFile; this.editedItem.image = imageFile; this.loadPreview(imageFile);
      } catch (error) { this.showAlert("warning", error.message || "No se pudo cargar la imagen.", 3000); this.clearFileInput(); }
    },
    onFileInputChange(event) { const selected = event?.target?.files?.[0]; if (selected) this.onFileSelected(selected); },
    getImageDimensions(file) { return new Promise((resolve, reject) => { const image = new Image(), url = URL.createObjectURL(file); image.onload = () => { URL.revokeObjectURL(url); resolve({ width: image.width, height: image.height }); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("La imagen no es válida.")); }; image.src = url; }); },
    async resizeImageFile(file, maxWidth, maxHeight) {
      const image = await new Promise((resolve, reject) => { const element = new Image(), url = URL.createObjectURL(file); element.onload = () => { URL.revokeObjectURL(url); resolve(element); }; element.onerror = () => { URL.revokeObjectURL(url); reject(new Error("La imagen no es válida.")); }; element.src = url; });
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1), width = Math.max(1, Math.round(image.width * scale)), height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas"), context = canvas.getContext("2d"); canvas.width = width; canvas.height = height; context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.drawImage(image, 0, 0, width, height);
      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.9));
      if (!blob) throw new Error("No se pudo optimizar la imagen.");
      return new File([blob], file.name, { type: mimeType, lastModified: Date.now() });
    },
    clearFileInput() { this.file = null; this.editedItem.image = this.originalItem.image || ""; this.imgMiniatura = this.editedIndex >= 0 ? this.resolveCompanyImage(this.originalItem.image, false) : ""; this.$refs.fileInput?.reset?.(); },
    loadPreview(file) { const reader = new FileReader(); reader.onload = event => { this.imgMiniatura = event.target.result; }; reader.readAsDataURL(file); },
    showAlert(type, message, timeout = 3000) { const config = { success: ["Éxito", "mdi-check-circle"], warning: ["Advertencia", "mdi-alert-circle"], error: ["Error", "mdi-close-circle"] }[type] || ["Información", "mdi-information"]; this.sb_type = type; this.sb_title = config[0]; this.sb_icon = config[1]; this.sb_message = message; this.sb_timeout = timeout; this.snackbar = true; },
  },
};
</script>

<style scoped>
.company-page{--blue:#2454d6;--blue-light:#3266e4;min-height:100%;color:#1e293b;background:#f6f8fb}.page-header{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:70px;padding:12px 24px;background:#fff;border-bottom:1px solid #e8edf5}.page-heading,.dialog-heading{display:flex;align-items:center;gap:11px}.page-icon,.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-icon-main{transform:translate(-2px,1px)}.dialog-icon-action{position:absolute;right:5px;bottom:5px;padding:1px;color:#0e1f46;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(15,23,42,.22)}h1,h2,h3,p{margin:0}.page-heading h1{color:#0f172a;font-size:19px;font-weight:850}.page-heading p{margin-top:3px;color:#526176;font-size:12px;font-weight:650}.primary-button,.save-button{min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.page-content{padding:18px 24px 28px}.summary-row{margin-bottom:4px}.summary-card{display:flex;align-items:center;gap:11px;min-height:72px;padding:13px 15px;background:#fff;border:1px solid #e8edf5;border-radius:12px;box-shadow:0 4px 14px rgba(15,23,42,.035)}.summary-icon{display:grid;flex:0 0 36px;width:36px;height:36px;place-items:center;border-radius:9px}.summary-icon.blue{color:#2454d6;background:#eef3ff}.summary-icon.green{color:#16875a;background:#eaf8f1}.summary-icon.amber{color:#64748b;background:#f1f5f9}.summary-card b{display:block;color:#0f172a;font-size:20px;font-weight:900;line-height:1}.summary-card span{display:block;margin-top:4px;color:#526176;font-size:11px;font-weight:700}.table-panel{overflow:hidden;background:#fff;border:1px solid #e8edf5;border-radius:13px!important;box-shadow:0 5px 18px rgba(15,23,42,.04)!important}.table-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:69px;padding:12px 17px}.section-title{color:#0f172a;font-size:15px;font-weight:850}.section-subtitle{margin-top:3px;color:#64748b;font-size:11px;font-weight:650}.search-field{flex:0 1 320px}.search-field :deep(.v-field){border-radius:9px;font-size:12px}.companies-table{color:#1e293b;background:transparent}.companies-table :deep(thead th){height:40px!important;color:#334155!important;font-size:11px!important;font-weight:850!important;letter-spacing:.04em;text-transform:uppercase;background:#f8fafc!important;border-bottom:1px solid #e8edf5!important}.companies-table :deep(tbody td){height:62px!important;color:#1e293b;font-size:13px;font-weight:600;border-bottom:1px solid #eef2f6!important}.companies-table :deep(tbody tr:hover){background:#f8faff!important}.companies-table :deep(.v-data-table-footer){min-height:52px;padding:6px 16px;color:#334155;font-size:11.5px;font-weight:700}.companies-table :deep(.v-data-table__th--sortable:hover),.companies-table :deep(.v-data-table__th--sorted){color:#2454d6!important;background:#f4f7ff!important}.company-name-cell{display:flex;align-items:center;gap:10px;min-width:0}.company-avatar{display:grid;flex:0 0 48px;width:48px;height:40px;padding:3px;overflow:hidden;place-items:center;color:#2454d6;background:#fff;border:1px solid #dce6ff;border-radius:9px;cursor:pointer}.company-photo,.preview-image{width:100%!important;height:100%!important}.image-fallback,.large-logo-fallback{display:grid;width:100%;height:100%;place-items:center;color:#2454d6;background:#eef3ff}.cell-copy{min-width:0}.company-name{max-width:320px;overflow:hidden;color:#0f172a;font-size:13.5px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.company-address{margin-top:2px;overflow:hidden;color:#526176;font-size:11px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.table-value,.phone-value{color:#334155;font-size:12.5px;font-weight:700}.phone-value{display:flex;align-items:center;gap:5px}.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;font-size:11.5px;font-weight:800;border-radius:7px}.status-badge--active{color:#116b49;background:#eaf8f1}.status-badge--inactive{color:#475569;background:#f1f5f9}.status-dot{width:6px;height:6px;background:currentColor;border-radius:50%}.action-buttons{display:flex;justify-content:flex-end;gap:2px}.action-button{border-radius:8px!important}.action-button--edit{color:#2454d6!important}.action-button--edit:hover{background:#eef3ff}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2}.table-footer-note{display:flex;align-items:center;gap:6px;min-height:42px;padding:9px 16px;color:#64748b;font-size:10.5px;font-weight:650;border-top:1px solid #edf1f5}.form-dialog,.logo-dialog,.delete-dialog{overflow:hidden;color:#1e293b;background:#fff;border:1px solid #dfe6ef;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.dialog-body{max-height:70vh;padding:21px 22px 16px!important;overflow-y:auto}.form-section-label{margin-bottom:13px;color:#475569;font-size:10.5px;font-weight:850;letter-spacing:.065em;text-transform:uppercase}.form-section-label--spaced{margin-top:7px}.dialog-body :deep(.v-field){border-radius:9px}.dialog-body :deep(.v-field__outline){color:#d6dee9}.dialog-body :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.dialog-body :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.image-upload-area{display:flex;align-items:center;gap:14px;padding:12px;background:#f8fafc;border:1px solid #e8edf5;border-radius:10px}.image-preview{flex:0 0 112px;width:112px;height:76px;overflow:hidden;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.preview-placeholder{display:grid;width:100%;height:100%;place-items:center;color:#2454d6}.upload-copy{flex:1;min-width:0}.upload-title{color:#334155;font-size:12.5px;font-weight:800}.upload-description{margin:3px 0 8px;color:#64748b;font-size:10.5px;font-weight:600}.file-field{max-width:350px}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-width:94px;min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;letter-spacing:0;text-transform:none;border-radius:9px!important}.cancel-button:hover{background:#f1f5f9}.save-button{min-width:150px;padding-inline:18px!important}.logo-preview-large{display:grid;min-height:300px;padding:28px;place-items:center;background:#f8fafc}.delete-dialog{padding:29px 27px 24px;text-align:center}.delete-icon{display:grid;width:56px;height:56px;margin:0 auto 16px;place-items:center;color:#dc2626;background:#fff1f2;border:1px solid #ffe0e4;border-radius:15px}.delete-title{color:#0f172a;font-size:18px;font-weight:850}.delete-message{max-width:350px;margin:10px auto 22px;color:#64748b;font-size:12.5px;font-weight:600;line-height:1.55}.delete-message strong{color:#334155;font-weight:800}.delete-actions{display:flex;justify-content:center;gap:9px}.confirm-delete{min-width:112px;min-height:40px;color:#fff!important;background:#dc2626!important;border-radius:9px!important;font-size:12.5px;font-weight:800;letter-spacing:0;text-transform:none}.snackbar-content{display:flex;align-items:center;gap:10px}.snackbar-content strong,.snackbar-content small{display:block}.snackbar-content small{margin-top:2px}
@media(max-width:1050px){.companies-table{overflow-x:auto}.companies-table :deep(.v-table__wrapper){min-width:880px}}@media(max-width:700px){.page-header{align-items:flex-start;padding:12px 14px}.page-heading p{display:none}.page-content{padding:12px 13px 22px}.table-toolbar{align-items:stretch;flex-direction:column}.search-field{width:100%;max-width:none}.image-editor{grid-template-columns:1fr}.image-preview{margin:auto}.dialog-body{padding:17px 14px 13px!important}}@media(max-width:450px){.page-header{flex-direction:column}.primary-button{width:100%}}
</style>
