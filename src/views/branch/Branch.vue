<template>
  <div class="branches-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" class="busgo-snackbar"><div class="snackbar-content"><v-icon :icon="sb_icon" size="22" /><div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div></div></v-snackbar>

    <header class="page-header"><div class="page-heading"><div class="page-icon"><v-icon size="21">mdi-store</v-icon></div><div><h1 class="page-title">Sucursales</h1><p class="page-subtitle">Administra sedes, datos de contacto y recursos operativos</p></div></div><v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAddBranch">Agregar sucursal</v-btn></header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-store-outline</v-icon></div><div><div class="summary-value">{{ branches.length }}</div><div class="summary-label">Total de sucursales</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--violet"><v-icon size="19">mdi-domain</v-icon></div><div><div class="summary-value">{{ representedCompanies }}</div><div class="summary-label">Empresas representadas</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-card-account-phone-outline</v-icon></div><div><div class="summary-value">{{ completeBranches }}</div><div class="summary-label">Contactos completos</div></div></div></v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar"><div><div class="section-title">Listado de sucursales</div><div class="section-subtitle">{{ registeredCountText }}</div></div><div class="toolbar-filters"><v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar sucursal..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable /></div></div>
        <v-divider />
        <v-data-table v-model:items-per-page="itemsPerPage" v-model:page="page" v-model:sort-by="sortBy" :headers="headers" :items="branches" :search="search" :loading="loading" :hide-default-header="false" sort-asc-icon="mdi-arrow-up" sort-desc-icon="mdi-arrow-down" :items-per-page-options="[5, 10, 15, 25]" items-per-page-text="Elementos por página" no-data-text="No hay sucursales disponibles" loading-text="Cargando sucursales..." class="branches-table">
          <template #loading><v-skeleton-loader type="table-row@5" /></template>
          <template #[`item.name`]="{ item }"><div class="branch-name-cell"><div class="branch-avatar"><v-img v-if="item.image" :src="branchImage(item.image)" class="branch-photo" width="34" height="34" cover><template #error><div class="image-fallback"><v-icon size="17">mdi-store</v-icon></div></template></v-img><v-icon v-else size="17">mdi-store</v-icon></div><div class="cell-copy"><div class="branch-name">{{ item.name || "Sin nombre" }}</div><div class="branch-caption">Sucursal operativa</div></div></div></template>
          <template #[`item.companyName`]="{ item }"><span class="company-badge"><v-icon size="14">mdi-domain</v-icon>{{ item.companyName || "Sin empresa" }}</span></template>
          <template #[`item.phone`]="{ item }"><div class="contact-cell"><v-icon size="15">mdi-phone-outline</v-icon><span>{{ item.phone || "Sin teléfono" }}</span></div></template>
          <template #[`item.address`]="{ item }"><div class="address-cell" :title="item.address"><v-icon size="15">mdi-map-marker-outline</v-icon><span>{{ item.address || "Sin dirección" }}</span></div></template>
          <template #[`item.actions`]="{ item }"><div class="action-buttons"><v-tooltip text="Gestionar trabajadores" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-account-group-outline" variant="text" size="small" class="action-button action-button--workers" @click="showAddWorker(item)" /></template></v-tooltip><v-tooltip text="Gestionar vehículos" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-bus" variant="text" size="small" class="action-button action-button--vehicles" @click="showAddVehicle(item)" /></template></v-tooltip><v-tooltip text="Gestionar rutas" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-map-marker-path" variant="text" size="small" class="action-button action-button--routes" @click="showAddRoute(item)" /></template></v-tooltip><v-tooltip text="Editar sucursal" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip><v-tooltip text="Eliminar sucursal" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip></div></template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Desde las acciones puedes administrar trabajadores, vehículos y rutas de cada sucursal.</div>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog" max-width="680" persistent><v-form ref="form" v-model="valid" enctype="multipart/form-data" @submit.prevent="save"><v-card class="form-dialog" elevation="0"><div class="dialog-header"><div class="dialog-heading"><div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-store</v-icon><v-icon class="dialog-icon-action" size="11">{{ editedIndex === -1 ? "mdi-plus" : "mdi-pencil" }}</v-icon></div><div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">{{ editedIndex === -1 ? "Registra una nueva sede operativa" : "Actualiza la información de la sucursal" }}</div></div></div><v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" /></div><v-divider />
      <v-card-text class="dialog-body"><div class="form-section-label">Información general</div><v-row dense><v-col cols="12"><v-autocomplete v-model="editedItem.company_id" :items="companies" item-title="name" item-value="id" label="Empresa" prepend-inner-icon="mdi-domain" variant="outlined" density="comfortable" no-data-text="No hay empresas disponibles" :rules="selectRules" :menu-props="{ contentClass: 'branch-company-menu' }"><template #item="{ props, item }"><v-list-item v-bind="props" :title="item.raw.name"><template #prepend><div class="company-menu-icon"><v-icon size="18">mdi-domain</v-icon></div></template></v-list-item></template></v-autocomplete></v-col><v-col cols="12"><v-text-field v-model.trim="editedItem.name" label="Nombre de la sucursal" placeholder="Ej.: Terminal Puerto Montt" prepend-inner-icon="mdi-store-outline" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col><v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.phone" label="Teléfono" placeholder="+56912345678" prepend-inner-icon="mdi-phone-outline" variant="outlined" density="comfortable" :rules="mobileRules" clearable /></v-col><v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.address" label="Dirección" placeholder="Av. Principal 123" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" density="comfortable" clearable /></v-col></v-row>
      <div class="form-section-label form-section-label--spaced">Imagen de la sucursal</div><div class="image-upload-area"><div class="image-preview"><v-img v-if="imgedit" :src="imgedit" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img><div v-else class="preview-placeholder"><v-icon size="28">mdi-store</v-icon></div></div><div class="upload-copy"><div class="upload-title">Imagen o logotipo de la sede</div><div class="upload-description">La imagen se optimiza automáticamente. Formatos JPG, JPEG o PNG.</div><v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @change="onFileSelected" /></div></div></v-card-text><v-divider /><v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ editedIndex === -1 ? "Crear sucursal" : "Guardar cambios" }}</v-btn></v-card-actions></v-card></v-form></v-dialog>

    <v-dialog v-model="dialogDelete" max-width="430" persistent><v-card class="delete-dialog" elevation="0"><div class="delete-icon"><v-icon size="27">mdi-trash-can-outline</v-icon></div><div class="delete-title">Eliminar sucursal</div><div class="delete-message">¿Deseas eliminar <strong>{{ editedItem.name || "esta sucursal" }}</strong>? Esta acción no se puede deshacer.</div><div class="delete-warning"><v-icon size="17">mdi-information-outline</v-icon><span>Verifica que no tenga información operativa importante asociada.</span></div><div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div></v-card></v-dialog>

    <!-- SubNiveles externos -->
    <v-dialog v-model="dialogBranchWorker" fullscreen transition="dialog-bottom-transition"><v-card class="sublevel-shell"><v-card-text class="sublevel-body"><BranchWorker :branch="selectedBranch" @close="closeDialogBranchWorker" /></v-card-text><v-divider /><v-card-actions class="sublevel-actions"><v-spacer /><v-btn variant="text" class="cancel-button" @click="closeDialogBranchWorker">Cerrar</v-btn></v-card-actions></v-card></v-dialog>
    <v-dialog v-model="dialogBranchVehicle" fullscreen transition="dialog-bottom-transition"><v-card class="sublevel-shell"><v-card-text class="sublevel-body"><BranchVehicle :branch="selectedBranch" @close="closeDialogBranchVehicle" /></v-card-text><v-divider /><v-card-actions class="sublevel-actions"><v-spacer /><v-btn variant="text" class="cancel-button" @click="closeDialogBranchVehicle">Cerrar</v-btn></v-card-actions></v-card></v-dialog>
    <v-dialog v-model="dialogBranchRoute" fullscreen transition="dialog-bottom-transition"><v-card class="sublevel-shell"><v-card-text class="sublevel-body"><BranchRoute :branch="selectedBranch" @close="closeDialogBranchRoute" /></v-card-text><v-divider /><v-card-actions class="sublevel-actions"><v-spacer /><v-btn variant="text" class="cancel-button" @click="closeDialogBranchRoute">Cerrar</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>
<script>

import LocalStorageService from "@/LocalStorageService";

import { handleRequest } from "@/utils/api"; // Ruta al archivo

import BranchWorker from "../branchworker/BranchWorker.vue";

import BranchVehicle from "../branchvehicle/BranchVehicle.vue";

import BranchRoute from "../branchroute/BranchRoute.vue";

import { paleteColors } from "@/assets/colors";

export default {

  name: "BranchesView",

  components: {

    BranchWorker,

    BranchVehicle,

    BranchRoute,

  },

  data: () => ({

    snackbar: false,

    sb_type: "",

    sb_message: "",

    sb_timeout: 2000,

    sb_title: "",

    sb_icon: "",

    paleteColors: paleteColors,

    valid: true,

    loading: false,

    mostrar: false,

    file: null,

    imgMiniatura: "",

    selectedBranch: [],

    dialog: false,

    dialogDelete: false,

    companies: [],

    branches: [],

    branch_id: '',

    permissions: '',

    data: {},

    itemsPerPage: 10,

    page: 1,

    sortBy: [{ key: "name", order: "asc" }],

    dialogBranchWorker: null,

    dialogBranchVehicle: null,

    dialogBranchRoute: null,

    headers: [

      { title: "Sucursal", key: "name", sortable: true, width: "24%" },

      { title: "Empresa", key: "companyName", sortable: true, width: "20%" },

      //{ title: "Rut", key: "rut", width: "10%" },

      { title: "Teléfono", key: "phone", sortable: true, width: "15%" },

      { title: "Dirección", key: "address", sortable: true, width: "21%" },

      { title: "", key: "actions", sortable: false, align: "end", width: "20%" },

    ],

    editedItem: {

      id: "",

      name: "",

      address: "",

      rut: "",

      image: "",

      phone: "",

      company_id: "",

    },

    originalItem: {

      id: "",

      name: "",

      address: "",

      rut: "",

      image: "",

      phone: "",

      company_id: "",

    },

    defaultItem: {

      id: "",

      name: "",

      address: "",

      rut: "",

      image: "",

      phone: "",

      company_id: "",

    },

    editedIndex: -1,

    search: "",

    nameRules: [

      (v) => !!v || "El campo es requerido",

      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",

      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",

    ],

    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],

    mobileRules: [

      (v) => !!v || "El número de móvil es requerido",

      (v) =>

        /^\+569\d{8}$/.test(v) ||

        "Formato de número móvil inválido. Ejemplo: +56912345678",

    ],

    rutRules: [

      (v) =>

        !v ||

        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) ||

        "El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)",

    ],

  }),

  computed: {

    registeredCountText() {

      const count = this.branches.length;

      return `${count} ${count === 1 ? "sucursal registrada" : "sucursales registradas"}`;

    },

    representedCompanies() {

      return new Set(this.branches.map((branch) => branch.company_id || branch.companyName).filter(Boolean)).size;

    },

    completeBranches() {

      return this.branches.filter((branch) => branch.name && branch.phone && branch.address).length;

    },

    formTitle() {

      return this.editedIndex === -1 ? "Agregar sucursal" : "Editar sucursal";

    },

    imgedit() {

      return this.imgMiniatura;

    },

  },

  mounted() {

    this.permissions = LocalStorageService.getItem('permissions');

    this.branch_id = LocalStorageService.getItem('branch_id');

    this.initialize();

  },

  methods: {

    hasPermission(requiredPermissions) {

        // Si es un string, lo convertimos a array

        const perms = Array.isArray(requiredPermissions) 

          ? requiredPermissions 

          : [requiredPermissions];

        // Retorna true si al menos uno coincide

        return perms.some(p => String(this.permissions || "").includes(p));

      },

    getCacheTimestamp() {

      // Usamos medianoche (00:00:00) del día actual

      const now = new Date();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)

    },

    branchImage(image) {

      return `${this.$axios.defaults.baseURL}images/${image}?t=${this.getCacheTimestamp()}`;

    },

    async showAddBranch() {

      this.close();

      try {

        const result = await handleRequest({

          endpoint: "company",

          method: "GET",

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.companies = result.data?.companies || [];

          if (

            !this.editedItem.company_id ||

            this.editedItem.company_id === 0 ||

            this.editedItem.company_id === ""

          ) {

            if (this.companies.length > 0) {

              this.editedItem.company_id = this.companies[0].id;

            }

          }

        } else {

          // Si no hay datos, asignamos un array vacío

          this.companies = [];

        }

      } catch (error) {

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al cargar las compañías.",

          3000

        );

      } finally {

        this.dialog = true;

      }

    },

    close() {

      if (this.loading) return;

      this.dialog = false;

      this.$nextTick(() => {

        this.editedItem = Object.assign({}, this.defaultItem);

        this.originalItem = Object.assign({}, this.defaultItem);

        this.$refs.form?.resetValidation();

      });

      this.editedIndex = -1;

      this.file = null;

      this.imgMiniatura = "";

    },

    async initialize() {

      try {

        this.loading = true;

        const result = await handleRequest({

          endpoint: "branch",

          method: "GET",

        });

        if (result.success) {

          if(this.hasPermission(['view_branches_company'])){            

          // Si la solicitud es exitosa, asignamos las sucursales

          this.branches = result.data?.branches || [];

          }else{

            this.branches = (result.data?.branches || []).filter(branch => 

              branch.id == this.branch_id

            );

          }

        } else {

          // Si no hay datos, asignamos un array vacío

          this.branches = [];

        }

      } catch (error) {

        this.loading = false;

        // Captura de errores no controlados

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al cargar las sucursales.",

          3000

        );

      } finally {

        this.loading = false;

      }

    },

    async save() {

      this.loading = true;

      //this.$refs.form.reset();

      if (this.editedIndex === -1) {

        this.valid = false;

        this.data = {};

        this.data.name = this.editedItem.name;

        this.data.company_id = this.editedItem.company_id;

        this.data.address = this.editedItem.address;

        this.data.phone = this.editedItem.phone;

        this.data.rut = this.editedItem.rut;

        // Crear un objeto FormData

        const formData = new FormData();

        formData.append("name", this.data.name);

        formData.append("address", this.data.address);

        formData.append("phone", this.data.phone);

        formData.append("rut", this.data.rut);

        formData.append("company_id", this.data.company_id);

        if (this.file) {

          formData.append("image", this.editedItem.image);

        }

        try {

          const result = await handleRequest({

            endpoint: "branch",

            method: "POST",

            data: formData,

          });

          // Manejo de la respuesta según el resultado

          if (result.success) {

            this.showAlert("success", result.message, 3000);

            this.initialize();

            this.loading = false;

          } else {

            this.showAlert("warning", result.message, 3000);

            this.loading = false;

          }

        } catch (error) {

          // Este bloque captura errores inesperados fuera del manejo estándar

          this.showAlert(

            "error",

            "Ocurrió un error inesperado al procesar la solicitud.",

            3000

          );

          this.loading = false;

        }

      } else {

        this.valid = false;

        const fieldsToUpdate = [

          "id",

          "name",

          "address",

          "rut",

          "phone",

          "image",

          "company_id",

        ];

        let updatedFields = Object.keys(this.editedItem)

          .filter(

            (key) =>

              fieldsToUpdate.includes(key) &&

              this.editedItem[key] !== this.originalItem[key]

          )

          .reduce((obj, key) => {

            obj[key] = this.editedItem[key];

            return obj;

          }, {});

        if (Object.keys(updatedFields).length > 0) {

          updatedFields.id = this.editedItem.id;

          if (this.file) {

            updatedFields.image = this.editedItem.image;

          }

          const formData = new FormData();

          for (let key in updatedFields) {

            formData.append(key, updatedFields[key]);

          }

          try {

            const result = await handleRequest({

              endpoint: "branch-update",

              method: "POST",

              data: formData,

            });

            // Manejo de la respuesta según el resultado

            if (result.success) {

              this.showAlert("success", result.message, 3000);

              this.initialize();

              this.loading = false;

            } else {

              this.showAlert("warning", result.message, 3000);

              this.loading = false;

            }

          } catch (error) {

            // Este bloque captura errores inesperados fuera del manejo estándar

            this.showAlert(

              "error",

              "Ocurrió un error inesperado al procesar la solicitud.",

              3000

            );

            this.loading = false;

          }

        } else {

          this.showAlert("success", "No se realizaron cambios.", 3000);

          this.loading = false;

        }

      }

      this.close();

    },

    async editItem(item) {

      this.editedIndex = 1;

      this.originalItem = Object.assign({}, item);

      this.editedItem = Object.assign({}, item);

      this.file = null;

      // Crear la imagen y configurar el src

      const img = new Image();

      img.src = `${this.$axios.defaults.baseURL}images/${item.image}`; // Se asume que item.image_url es la URL de la imagen

      // Usar una función asíncrona para manejar la carga de la imagen

      img.onload = async () => {

        try {

          // Asignar la imagen cargada a imgMiniatura

          this.imgMiniatura = `${this.$axios.defaults.baseURL}images/${item.image}`;

        } catch (error) {

          console.error("Error al cargar la imagen", error);

          this.showAlert("error", "Error al cargar la imagen.", 3000);

        }

      };

      try {

        const result = await handleRequest({

          endpoint: "company",

          method: "GET",

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.companies = result.data?.companies || [];

        } else {

          // Si no hay datos, asignamos un array vacío

          this.companies = [];

        }

      } catch (error) {

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.dialog = true;

      }

    },

    deleteItem(item) {

      this.editedIndex = 1;

      this.editedItem = Object.assign({}, this.defaultItem, item);

      this.dialogDelete = true;

    },

    closeDelete() {

      if (this.loading) return;

      this.dialogDelete = false;

      this.$nextTick(() => {

        this.editedItem = Object.assign({}, this.defaultItem);

      });

    },

    async deleteItemConfirm() {

      this.loading = true;

      try {

        let request = {

          id: this.editedItem.id,

        };

        const result = await handleRequest({

          endpoint: "branch-destroy",

          method: "POST",

          data: request,

        });

        // Manejo de la respuesta según el resultado

        if (result.success) {

          this.showAlert("success", result.message, 3000);

          this.initialize();

        } else {

          this.showAlert("warning", result.message, 3000);

        }

      } catch (error) {

        // Este bloque captura errores inesperados fuera del manejo estándar

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.loading = false;

        this.closeDelete();

      }

    },

    showAlert(sb_type, sb_message, sb_timeout) {

      this.sb_type = sb_type;

      if (sb_type == "success") {

        this.sb_title = "Éxito";

        this.sb_icon = "mdi-check-circle";

      }

      if (sb_type == "error") {

        this.sb_title = "Error";

        this.sb_icon = "mdi-alert-circle";

      }

      if (sb_type == "warning") {

        this.sb_title = "Advertencia";

        this.sb_icon = "mdi-alert-circle";

      }

      this.sb_message = sb_message;

      this.sb_timeout = sb_timeout;

      this.snackbar = true;

    },

    imagenDisponible() {

      if (this.imgedit !== undefined && this.imgedit !== "") {

        // Intenta cargar la imagen en un elemento oculto para verificar si está disponible

        let img = new Image();

        img.src = this.imgedit;

        return true; // Devuelve true si la imagen está disponible

      }

      return false; // Si la URL de la imagen no está definida o está vacía, devuelve false

    },

    async onFileSelected(event) {

      let file = event.target.files[0];

      if (!file) {
        this.editedItem.image = "";

        this.imgMiniatura = "";

        return;

      }

      const maxSize = 500 * 1024;

      const maxLogoDimension = 320;

      try {

        const dimensions = await this.getImageDimensions(file);

        const shouldResize =

          dimensions.width > maxLogoDimension ||

          dimensions.height > maxLogoDimension ||

          file.size > maxSize;

        const imageFile = shouldResize

          ? await this.resizeImageFile(file, maxLogoDimension, maxLogoDimension)

          : file;

        if (imageFile.size > maxSize) {

          this.valid = false;

          this.showAlert(

            "warning",

            "No se pudo optimizar la imagen por debajo de 500 KB.",

            3000

          );

          this.clearFileInput();

          return;

        }

        this.valid = true;

        this.file = imageFile;

        this.editedItem.image = imageFile;

        this.cargarImage(imageFile);

      } catch (error) {

        console.error("Error al leer la imagen:", error);

        this.valid = false;

        this.showAlert(

          "error",

          "No se pudo cargar la imagen. Formato inválido.",

          3000

        );

        this.clearFileInput();

      }

    },

    async getImageDimensions(file) {

      return new Promise((resolve, reject) => {

        const img = new Image();

        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {

          URL.revokeObjectURL(objectUrl);

          resolve({ width: img.width, height: img.height });

        };

        img.onerror = () => {

          URL.revokeObjectURL(objectUrl);

          reject(new Error("No se pudo cargar la imagen."));

        };

        img.src = objectUrl;

      });

    },

    async resizeImageFile(file, maxWidth, maxHeight) {

      const imageData = await new Promise((resolve, reject) => {

        const img = new Image();

        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {

          URL.revokeObjectURL(objectUrl);

          resolve(img);

        };

        img.onerror = () => {

          URL.revokeObjectURL(objectUrl);

          reject(new Error("No se pudo cargar la imagen."));

        };

        img.src = objectUrl;

      });

      const scale = Math.min(

        maxWidth / imageData.width,

        maxHeight / imageData.height,

        1

      );

      const width = Math.max(1, Math.round(imageData.width * scale));

      const height = Math.max(1, Math.round(imageData.height * scale));

      const canvas = document.createElement("canvas");

      const context = canvas.getContext("2d");

      canvas.width = width;

      canvas.height = height;

      context.imageSmoothingEnabled = true;

      context.imageSmoothingQuality = "high";

      context.drawImage(imageData, 0, 0, width, height);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

      const blob = await new Promise((resolve) => {

        canvas.toBlob(resolve, mimeType, 0.9);

      });

      return new File([blob], file.name, {

        type: mimeType,

        lastModified: Date.now(),

      });

    },

    clearFileInput() {

      this.file = null;

      this.editedItem.image = null;

      this.imgMiniatura = "";

      if (this.$refs.fileInput) {

        this.$refs.fileInput.reset();

      }

    },

    cargarImage(file) {

      let reader = new FileReader();

      reader.onload = (e) => {

        this.imgMiniatura = e.target.result;

      };

      reader.readAsDataURL(file);

    },

    //Asociar Profesionales

    showAddWorker(item) {

      this.selectedBranch = item; // Asignamos el trabajador seleccionado

      this.dialogBranchWorker = true; // Abrimos el diálogo

    },

    closeDialogBranchWorker() {

      this.dialogBranchWorker = false; // Cerramos el diálogo

      this.selectedBranch = [];

    },

    showAddVehicle(item) {

      this.selectedBranch = item; // Asignamos el trabajador seleccionado

      this.dialogBranchVehicle = true; // Abrimos el diálogo

    },

    closeDialogBranchVehicle() {

      this.dialogBranchVehicle = false; // Cerramos el diálogo

      this.selectedBranch = [];

    },

    showAddRoute(item) {

      this.selectedBranch = item; // Asignamos el trabajador seleccionado

      this.dialogBranchRoute = true; // Abrimos el diálogo

    },

    closeDialogBranchRoute() {

      this.dialogBranchRoute = false; // Cerramos el diálogo

      this.selectedBranch = [];

    },

  },

};

</script>
<style scoped>
.branches-page { --blue:#2454d6; min-height:100%; color:#1e293b; background:#f6f8fb; }
.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; }.page-heading,.dialog-heading { display:flex; align-items:center; gap:11px; }.page-icon,.dialog-icon { position:relative; display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }.dialog-icon-main { transform:translate(-2px,1px); }.dialog-icon-action { position:absolute; right:5px; bottom:5px; padding:1px; color:#0e1f46; background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(15,23,42,.22); }.page-title { margin:0; color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }.page-subtitle { margin:3px 0 0; color:#526176; font-size:12px; font-weight:650; }
.add-button,.save-button { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }.page-content { padding:18px 24px 28px; }.summary-row { margin-bottom:4px; }.summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }.summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }.summary-icon--blue { color:#2454d6; background:#eef3ff; }.summary-icon--violet { color:#6d45c6; background:#f1edff; }.summary-icon--green { color:#16875a; background:#eaf8f1; }.summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }
.table-panel { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }.table-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:69px; padding:12px 17px; }.section-title { color:#0f172a; font-size:15px; font-weight:850; }.section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }.toolbar-filters { display:flex; align-items:center; justify-content:flex-end; gap:9px; flex:1; }.search-field { flex:0 1 285px; }.search-field :deep(.v-field) { border-radius:9px; font-size:12px; }.search-field :deep(.v-field__outline) { color:#dce3ed; }
.branches-table { color:#1e293b; background:transparent; }.branches-table :deep(thead th) { height:40px!important; color:#334155!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }.branches-table :deep(tbody td) { height:58px!important; color:#1e293b; font-size:13px; font-weight:600; border-bottom:1px solid #eef2f6!important; }.branches-table :deep(tbody tr:hover) { background:#f8faff!important; }.branches-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }.branches-table :deep(.v-data-table__th--sortable) { cursor:pointer; user-select:none; }.branches-table :deep(.v-data-table-header__content) { display:flex!important; align-items:center!important; gap:5px!important; }.branches-table :deep(.v-data-table-header__sort-icon) { display:inline-flex!important; visibility:visible!important; width:15px!important; height:15px!important; color:#94a3b8!important; font-size:15px!important; opacity:.65!important; }.branches-table :deep(.v-data-table__th--sorted),.branches-table :deep(.v-data-table__th--sortable:hover) { color:#2454d6!important; background:#f5f7ff!important; }
.action-buttons { display:flex; justify-content:flex-end; gap:2px; }.action-button { border-radius:8px!important; }.action-button--edit { color:#2454d6!important; }.action-button--edit:hover { background:#eef3ff; }.action-button--password { color:#0c8568!important; }.action-button--password:hover { background:#eaf8f3; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }.table-footer-note { display:flex; align-items:center; gap:6px; min-height:42px; padding:9px 16px; color:#64748b; font-size:10.5px; font-weight:650; border-top:1px solid #edf1f5; }
.form-dialog,.delete-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }.dialog-body { max-height:70vh; padding:21px 22px 16px!important; overflow-y:auto; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }.form-section-label--spaced { margin-top:7px; }.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }
.image-upload-area { display:flex; align-items:center; gap:14px; padding:12px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.image-preview { flex:0 0 92px; width:92px; height:68px; overflow:hidden; background:#eef3ff; border:1px solid #dce6ff; border-radius:9px; }.preview-placeholder { display:grid; width:100%; height:100%; place-items:center; color:#2454d6; }.upload-copy { flex:1; min-width:0; }.upload-title { color:#334155; font-size:12.5px; font-weight:800; }.upload-description { margin:3px 0 8px; color:#64748b; font-size:10.5px; font-weight:600; }.file-field { max-width:330px; }.password-alert { margin-top:2px; font-size:11.5px; font-weight:650; }
.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:150px; padding-inline:18px!important; }.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius:11px; }
@media (max-width:1250px) { .branches-table { overflow-x:auto; }.branches-table :deep(.v-table__wrapper) { min-width:1180px; } }
@media (max-width:959px) { .page-header { padding-inline:17px; }.page-content { padding:15px 17px 24px; }.table-toolbar { align-items:stretch; flex-direction:column; }.toolbar-filters { justify-content:flex-start; }.search-field { flex:1 1 auto; } }
@media (max-width:600px) { .page-header { align-items:flex-start; padding:11px 12px; }.page-subtitle { max-width:210px; }.add-button { min-width:42px!important; padding-inline:10px!important; }.add-button :deep(.v-btn__content) { font-size:0; }.add-button :deep(.v-icon) { margin:0!important; }.page-content { padding:11px 12px 20px; }.search-field { width:100%; }.dialog-header { padding:14px; }.dialog-body { padding:17px 14px 12px!important; }.image-upload-area { align-items:flex-start; flex-direction:column; }.dialog-actions { padding-inline:13px!important; } }

.summary-icon--violet { color:#6d45c6; background:#f1edff; }
.branch-name-cell { display:flex; align-items:center; gap:9px; min-width:190px; }.branch-avatar { display:grid; flex:0 0 34px; width:34px; height:34px; overflow:hidden; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }.branch-photo,.image-fallback { width:100%; height:100%; }.branch-photo :deep(.v-img__img) { object-fit:cover; }.image-fallback { display:grid; place-items:center; }.cell-copy { min-width:0; }.branch-name { overflow:hidden; color:#0f172a; font-size:13.5px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.branch-caption { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:650; }.company-badge { display:inline-flex; align-items:center; gap:5px; max-width:190px; padding:4px 8px; overflow:hidden; color:#5145a8; background:#f1edff; border-radius:7px; font-size:11.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }.contact-cell,.address-cell { display:flex; align-items:center; gap:6px; color:#334155; font-size:12px; font-weight:700; }.contact-cell .v-icon,.address-cell .v-icon { flex:0 0 auto; color:#64748b; }.contact-cell span,.address-cell span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.address-cell { max-width:250px; }
.action-button--workers { color:#0c8568!important; }.action-button--workers:hover { background:#eaf8f3; }.action-button--vehicles { color:#b76e00!important; }.action-button--vehicles:hover { background:#fff5dc; }.action-button--routes { color:#6d45c6!important; }.action-button--routes:hover { background:#f1edff; }
.delete-warning { display:flex; align-items:flex-start; gap:7px; margin:-10px 0 20px; padding:10px 11px; color:#7c5c16; background:#fff8e7; border:1px solid #f8e7b8; border-radius:9px; font-size:10.5px; font-weight:650; line-height:1.4; text-align:left; }.sublevel-shell { background:#f5f7fb!important; }.sublevel-body { padding:0!important; }.sublevel-actions { min-height:64px; padding:10px 24px!important; background:#fff; }

</style>

<style>
.branches-table .v-data-table__th--sortable .v-data-table-header__sort-icon { display:inline-flex!important; visibility:visible!important; width:15px!important; height:15px!important; margin-left:5px!important; color:#94a3b8!important; font-size:15px!important; opacity:.72!important; }.branches-table thead { display:table-header-group!important; visibility:visible!important; }.branches-table thead tr { display:table-row!important; visibility:visible!important; }.branches-table thead th { display:table-cell!important; visibility:visible!important; }.branches-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,.branches-table .v-data-table__th--sorted .v-data-table-header__sort-icon { color:#2454d6!important; opacity:1!important; }
.branch-company-menu .v-list { padding:6px!important; }.branch-company-menu .v-list-item { min-height:48px!important; margin:2px 0; border-radius:9px!important; }.branch-company-menu .v-list-item:hover { background:#f4f7ff!important; }.branch-company-menu .v-list-item-title { color:#1e293b!important; font-size:12.5px!important; font-weight:750!important; }.branch-company-menu .company-menu-icon { display:grid; width:34px; height:34px; place-items:center; color:#5145a8; background:#f1edff; border-radius:8px; }
</style>
