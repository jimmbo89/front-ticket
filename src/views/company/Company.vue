<template>
  <v-snackbar
    class="mt-12"
    location="right top"
    :timeout="sb_timeout"
    :color="sb_type"
    elevation="24"
    :multi-line="true"
    vertical
    v-model="snackbar"
  >
    <v-row>
      <v-col md="2">
        <v-avatar :icon="sb_icon" color="sb_type" size="40" />
      </v-col>

      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-icon>mdi-office-building</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Empresa</div>
      <div class="busgo-page-subtitle">Administración de la empresa</div>
    </div>

    <v-spacer />

    <v-btn
      v-if="companies.length <= 0"
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn"
      @click="showAddBussines"
    >
      Agregar Empresa
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Datos de la empresa</div>
          <div class="busgo-card-subtitle">
            Administra la información principal, contacto e imagen corporativa.
          </div>
        </div>
      </div>

      <div class="busgo-table-head">
        <div class="company-col-main">Nombre / Dirección</div>
        <div class="company-col-rut">RUT</div>
        <div class="company-col-phone">Teléfono</div>
        <div class="company-col-actions"></div>
      </div>

      <div
        v-for="(company, index) in companies"
        :key="index"
        class="busgo-row company-row-modern"
      >
        <div class="company-col-main busgo-name-cell">
          <v-dialog max-width="500">
            <template #activator="{ props }">
              <v-avatar
                v-bind="props"
                size="42"
                rounded="lg"
                color="grey-lighten-4"
                class="busgo-avatar"
                style="cursor: pointer"
              >
                <v-img
                  :src="`${$axios.defaults.baseURL}images/${company.image}?t=${getCacheTimestamp()}`"
                  cover
                />
              </v-avatar>
            </template>

            <v-card>
              <v-img
                :src="`${$axios.defaults.baseURL}images/${company.image}`"
                max-height="500"
                contain
              />

              <v-card-actions>
                <v-spacer />
                <v-btn variant="text">Cerrar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <div class="min-width-0">
            <div class="busgo-name">
              {{ company.name }}
            </div>

            <div class="busgo-submeta text-truncate">
              {{ company.address }}
            </div>
          </div>
        </div>

        <div class="company-col-rut busgo-meta">
          <span class="text-truncate">{{ company.rut }}</span>
        </div>

        <div class="company-col-phone busgo-meta">
          <v-icon size="16" color="primary">mdi-phone</v-icon>
          <span class="text-truncate">{{ company.phone }}</span>
        </div>

        <div class="company-col-actions busgo-actions">
          <v-btn
            size="30"
            icon
            variant="tonal"
            :color="paleteColors.primary"
            @click="editItem(company)"
            title="Editar Empresa"
          >
            <v-icon size="17">mdi-pencil</v-icon>
          </v-btn>

          <v-btn
            size="30"
            icon
            variant="tonal"
            :color="paleteColors.error"
            @click="deleteItem(company)"
            title="Eliminar Empresa"
          >
            <v-icon size="17">mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>

  <v-dialog v-model="dialog" max-width="600px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.name"
                  clearable
                  label="Nombre"
                  prepend-icon="mdi-store"
                  variant="underlined"
                  :rules="nameRules"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.rut"
                  clearable
                  label="Rut"
                  prepend-icon="mdi-identifier"
                  variant="underlined"
                  :rules="rutRules"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.phone"
                  clearable
                  label="Teléfono"
                  placeholder="+56912345678"
                  prepend-icon="mdi-phone"
                  variant="underlined"
                  :rules="mobileRules"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.address"
                  clearable
                  label="Dirección"
                  prepend-icon="mdi-map-marker-outline"
                  variant="underlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-file-input
                  clearable
                  v-model="file"
                  ref="fileInput"
                  label="Imagen de la Empresa"
                  variant="underlined"
                  density="compact"
                  name="file"
                  accept=".png, .jpg, .jpeg"
                  @change="onFileSelected"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img
                    v-if="imagenDisponible()"
                    :src="imgedit"
                    height="120"
                    width="210"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn
            :color="paleteColors.gris"
            variant="flat"
            @click="close"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="save"
            :disabled="!valid"
            :loading="loading"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar Empresa
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la empresa seleccionada?
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          :color="paleteColors.gris"
          variant="flat"
          @click="closeDelete"
        >
          Cancelar
        </v-btn>

        <v-btn
          :color="paleteColors.error"
          variant="flat"
          @click="deleteItemConfirm"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import LocalStorageService from "@/LocalStorageService";
export default {
  data: () => ({
    snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    paleteColors: paleteColors,
    valid: true,
    permissions: '',
    mostrar: false,
    file: null,
    imgMiniatura: "",

    dialog: false,
    dialogDelete: false,
    companies: [],
    data: {},
    headers: [
      { title: "Nombre", value: "name", width: "30%" },
      { title: "Rut", value: "rut", width: "10%" },
      { title: "Teléfono", value: "phone", width: "10%" },
      { title: "Dirección", value: "address", width: "40%" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
    ],
    loading: true,

    administracion: [
      {
        icon: "mdi-store",
        title: "Sucursales",
        to: "/branch",
        value: "branch",
        permission: ["view_branches", "view_branches_company"],
      },
      {
        icon: "mdi-account",
        title: "Trabajadores",
        to: "/worker",
        value: "worker",
        permission: ["view_workers"],
      },
      {
        icon: "mdi-bus",
        title: "Vehículos",
        to: "/structure-vehicle",
        value: "structure-vehicle",
        permission: ["view_vehicles"],
      },
      /*{
        icon: "mdi-map-marker",
        title: "Lugares",
        to: "/location",
        value: "location",
        permission: "view_locations",
      },*/
      {
        icon: "mdi-road-variant",
        title: "Rutas",
        to: "/location-route",
        value: "location-route",
        permission: ["view_routes", "view_routes_company"],
      },
      {
        icon: "mdi-devices",
        title: "Dispositivos",
        to: "/device",
        value: "devices",
        permission: ["view_devices", "view_devices_company"],
      },
    ],

    editedItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
    },
    originalItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
    },
    defaultItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
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
      (v) => !!v || "El RUT es requerido",
      (v) =>
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) ||
        "El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)",
    ],
  }),
  computed: {
    filteredAdministracion() {
    return this.administracion.filter(item => this.hasPermission(item.permission));
  },
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Empresa" : "Editar Empresa";
    },
    imgedit() {
      return this.imgMiniatura;
    },
  },
  mounted() {
    this.permissions = LocalStorageService.getItem('permissions');
    this.initialize();
  },
  methods: {
    /* hasPermission(permission) {
      return this.permissions.includes(permission);
    },*/
    hasPermission(requiredPermissions) {
        // Si es un string, lo convertimos a array
        const perms = Array.isArray(requiredPermissions) 
          ? requiredPermissions 
          : [requiredPermissions];
        
        // Retorna true si al menos uno coincide
        return perms.some(p => this.permissions.includes(p));
      },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    showAddBussines() {
      this.close();
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.originalItem = Object.assign({}, this.defaultItem);
      });
      this.editedIndex = -1;
      this.file = null;
      this.imgMiniatura = "";
    },
    async initialize() {
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "company",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.companies = result.data?.companies || [];
          const company = this.companies[0];
          if (company) {
            LocalStorageService.setItem("nameBusiness", company.name ?? "");
            LocalStorageService.setItem("imageBusiness", company.image ?? "");
            window.dispatchEvent(new Event("branding-updated"));
          }
        } else {
          // Si no hay datos, asignamos un array vacío
          this.companies = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
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
        this.data.name = this.editedItem.name;
        this.data.address = this.editedItem.address;
        this.data.phone = this.editedItem.phone;
        this.data.rut = this.editedItem.rut;

        // Crear un objeto FormData
        const formData = new FormData();
        formData.append("name", this.data.name);
        formData.append("address", this.data.address);
        formData.append("phone", this.data.phone);
        formData.append("rut", this.data.rut);
        if (this.file) {
          formData.append("image", this.editedItem.image);
        }

        try {
          const result = await handleRequest({
            endpoint: "company",
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
        const fieldsToUpdate = ["id", "name", "address", "rut", "phone", "image"];
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
              endpoint: "company-update",
              method: "POST",
              data: formData,
            });

            // Manejo de la respuesta según el resultado
          if (result.success) {
            this.showAlert("success", result.message, 3000);
            await this.initialize();
            window.dispatchEvent(new Event("branding-updated"));
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
    editItem(item) {
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
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = 1;
      this.editedItem.id = item.id;
      this.dialogDelete = true;
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      });
    },
    async deleteItemConfirm() {
      try {
        let request = {
          id: this.editedItem.id,
        };
        const result = await handleRequest({
          endpoint: "company-destroy",
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
        this.sb_icon = "mdi-check-circle";
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
      // Validar el tamaño del archivo (500 KB máximo)
      const maxSize = 500 * 1024; // 500 KB en bytes
      if (file && file.size > maxSize) {
        this.showAlert("warning", "El archivo de imagen debe ser de máximo 500 KB", 3000);
        return; // Detener el proceso si el archivo es demasiado grande
      }
      // 3. Validar dimensiones (160x160 máximo)
  try {
        const dimensions = await this.getImageDimensions(file);
        if (dimensions.width > 160 || dimensions.height > 160) {
          this.showAlert(
            "warning",
            `La imagen debe tener un tamaño máximo de 160x160 píxeles. La imagen seleccionada mide ${dimensions.width}x${dimensions.height}.`,
            4000
          );
          this.clearFileInput();
          return;
        }

        // Si todo está bien, asignar la imagen
        this.editedItem.image = file;
        this.cargarImage(file);
      } catch (error) {
        console.error("Error al leer la imagen:", error);
        this.showAlert("error", "No se pudo cargar la imagen. Formato inválido.", 3000);
        this.clearFileInput();
      }
      this.editedItem.image = file;
      //console.log(this.editedItem.image_cardgift);
      this.cargarImage(file);
    },
    async getImageDimensions(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(objectUrl); // Liberar memoria
          resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("No se pudo cargar la imagen."));
        };

        img.src = objectUrl;
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
  },
};
</script>
<style>
.icono-concavo {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  /* Mantenemos solo el efecto cóncavo en el ícono 
  box-shadow: inset;*/
  position: relative;
  overflow: hidden;
}

.icono-concavo::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 8px;
  background: transparent;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* OCULTAR HEADER DE v-data-table - Vuetify 3.4.7 */
/* Máxima especificidad para ocultar el thead */
.v-data-table > .v-data-table__wrapper > table > thead,
.v-data-table > .v-data-table__wrapper > .v-table > table > thead,
.v-data-table__content > table > thead,
.v-data-table__content > thead,
table.v-table > thead,
.v-table > .v-table__wrapper > table > thead {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}
.hidden-header .v-data-table__content > table > thead {
  display: none !important;
}

.company-header {
  background: #f5f7f9;
  border: 1px solid #eceff1;
}

.company-row {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.company-row:hover {
  transform: translateY(-2px);
  border-color: rgba(25, 118, 210, 0.2);
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.company-col {
  width: 160px;
  display: flex;
  align-items: center;
}

.min-width-0 {
  min-width: 0;
}
.launchpad-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
}

.launchpad-grid {
  margin: 0;
}

.launchpad-item {
  width: 100px;
  aspect-ratio: 1 / 1;
  border-radius: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: all 0.18s ease;
  background: #f7f8fa;
  border: 1px solid rgba(0,0,0,0.05);
}

.launchpad-item:hover {
  transform: translateY(-3px) scale(1.03);
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.launchpad-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  margin-bottom: 8px;
}

.launchpad-label {
  font-size: 11px;
  text-align: center;
  line-height: 1.1;
  font-weight: 500;
  color: #1f2937;
}

.launchpad-wrapper {
  display: flex;
  justify-content: flex-start;
}
.company-col-main {
  width: 55%;
  min-width: 0;
}

.company-col-rut {
  width: 15%;
  min-width: 0;
}

.company-col-phone {
  width: 15%;
  min-width: 0;
}

.company-col-actions {
  width: 15%;
  min-width: 0;
}

.company-row-modern {
  min-height: 68px;
}

.busgo-submeta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .company-col-main,
  .company-col-rut,
  .company-col-phone,
  .company-col-actions {
    width: 100%;
  }
}
</style>
