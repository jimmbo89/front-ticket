<template>
  <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
    :multi-line="true" vertical v-model="snackbar">
    <v-row>
      <v-col md="2">
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>
  <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-office-building</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Empresa</div>
      <div class="text-body-2 text-grey">Administración de la Empresa</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn v-if="companies.length <= 0" class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal"
      elevation="2" prepend-icon="mdi-plus-circle" @click="showAddBussines">
      Agregar Empresa
    </v-btn>
  </v-card>
  <v-container fluid>
    <!-- Encabezado alineado con v-col (para que coincida con filas posteriores) -->
    <v-card elevation="0">
      <v-card-text>
        <v-card color="blue-grey-lighten-5" class="mb-2 rounded-lg"
          style="border: 1px solid #ECEFF1; height: 40px; min-height: 40px;" density="comfortable">
          <v-card-text class="pa-0" style="height: 100%">
            <v-row no-gutters align="center" class="text-body-2 font-weight-bold" style="height: 40px; padding: 0 16px">
              <!-- Vehículo (10%) -->
              <v-col cols="auto" class="text-left">

              </v-col>

              <!-- Marca (7%) -->
              <v-col cols="5" class="text-left">
                Nombre/Dirección
              </v-col>

              <!-- Recorrido (30%) -->
              <v-col cols="3" class="text-left">
                Rut
              </v-col>

              <!-- Fecha (10%) -->
              <v-col cols="2" class="text-left">
                Teléfono
              </v-col>

              <!-- Horario (10%) -->
              <v-col cols="2" class="text-left">

              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card v-for="(company, index) in companies" :key="index" class="mb-4 rounded-lg pa-2" density="comfortable"
          elevation="2">
          <v-row>
            <v-col cols="auto" class="d-flex text-left">
              <v-dialog max-width="500" class="rounded-lg">
                <!-- Activator: Solo el avatar es clickeable -->
                <template v-slot:activator="{ props: activatorProps }">
                  <v-avatar v-bind="activatorProps" class="mr-1 icono-concavo" elevation="3" color="grey-lighten-4"
                    style="cursor: pointer">
                    <v-img :src="`${this.$axios.defaults.baseURL}images/${
                        company.image
                      }?t=${getCacheTimestamp()}`" alt="Logo de la compañía" cover />
                  </v-avatar>
                </template>

                <!-- Diálogo con la imagen expandida -->
                <template v-slot:default="{ isActive }">
                  <v-card class="modal-imagen">
                    <v-img :src="`${this.$axios.defaults.baseURL}images/${
                        company.image
                      }?t=${getCacheTimestamp()}`" max-height="500" contain />
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text="Cerrar" variant="flat" @click="isActive.value = false" />
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </v-col>
            <v-col cols="4" class="d-flex align-center justify-start">
              <v-row align="center" class="gap-3">
                <div>
                  <div class="font-weight-bold text-body-2">
                    {{ company.name }}
                  </div>
                  <div class="text-body-2 d-flex align-center text-grey-darken-1 text-truncate">
                    {{ company.address }}
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Dirección: {{ company.address }}
                      </span>
                    </v-tooltip>
                  </div>
                </div>
              </v-row>
            </v-col>

            <v-col cols="3" class="d-flex align-center justify-start">
              <div class="text-body-2 d-flex align-center text-truncate">
                {{ company.rut }}
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Rut: {{ company.rut }}
                  </span>
                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Rut: {{ company.rut }}
                    </span>
                  </v-tooltip>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="2" class="d-flex align-center justify-start">
              <div class="text-body-2 d-flex align-center text-truncate">
                {{ company.phone }}
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Teléfono: {{ company.phone }}
                  </span>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="2" class="d-flex align-center justify-end">
              <v-btn icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                :color="paleteColors.primary" @click="editItem(company)" size="35" title="Editar">
                <v-icon size="20">mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                :color="paleteColors.error" @click="deleteItem(company)" size="35" title="Eliminar" class="ml-1">
                <v-icon size="20">mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-row>
          <v-col cols="12">
  <v-row style="gap: 8px;">
    <v-col
      v-for="item_menu in administracion"
      :key="item_menu.value"
      class="flex-grow-1"
      style="max-width: none;"
    >
      <v-card
        class="d-flex flex-column align-center pa-4"
        elevation="2"
        rounded="lg"
        @click="$router.push(item_menu.to)"
        style="width: 100%; cursor: pointer;"
      >
        <v-avatar size="48" class="mb-2" color="grey-lighten-4">
          <v-icon :icon="item_menu.icon" color="primary" size="28" />
        </v-avatar>
        <span class="text-body-1 font-weight-medium">{{ item_menu.title }}</span>
      </v-card>
    </v-col>
  </v-row>
</v-col>
        </v-row>

        <!--<br /><br />

        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>
        <v-data-table :headers="headers" :search="search" :items="companies" class="elevation-1"
          style="max-height: 68vh; overflow-y: auto" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
          <template v-slot:item.actions="{ item }">
            <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary"
              variant="tonal" elevation="1" title="Editar Empresa"></v-btn>
            <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error"
              variant="tonal" elevation="1" title="Eliminar Empresa"></v-btn>
          </template>
          <template v-slot:item.name="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="large">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${
                  item.image
                }?t=${getCacheTimestamp()}`" alt="image"></v-img>
            </v-avatar>
            {{ item.name }}
          </template>
        </v-data-table>-->
      </v-card-text>
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
                <v-text-field v-model="editedItem.name" clearable label="Nombre" prepend-icon="mdi-store"
                  variant="underlined" :rules="nameRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.rut" clearable label="Rut" prepend-icon="mdi-identifier"
                  variant="underlined" :rules="rutRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.phone" clearable label="Teléfono" placeholder="+56912345678"
                  prepend-icon="mdi-phone" variant="underlined" :rules="mobileRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.address" clearable label="Dirección"
                  prepend-icon="mdi-map-marker-outline" variant="underlined"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input clearable v-model="file" ref="fileInput" label="Imagen de la Empresa" variant="underlined"
                  density="compact" name="file" accept=".png, .jpg, .jpeg" @change="onFileSelected">
                </v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img v-if="imagenDisponible()" :src="imgedit" height="120" width="210" />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn :color="paleteColors.primary" variant="flat" @click="save" :disabled="!valid"
            :loading="loading">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar Empresa</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la empresa seleccionada?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">
          Cancelar
        </v-btn>
        <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm">
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
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
        permission: "view_branches",
      },
      {
        icon: "mdi-account",
        title: "Trabajadores",
        to: "/worker",
        value: "worker",
        permission: "view_workers",
      },
      {
        icon: "mdi-bus",
        title: "Vehículos",
        to: "/structure-vehicle",
        value: "structure-vehicle",
        permission: "view_vehicles",
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
        permission: "view_routes",
      },
      {
        icon: "mdi-devices",
        title: "Dispositivos",
        to: "/device",
        value: "devices",
        permission: "view_devices",
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
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Empresa" : "Editar Empresa";
    },
    imgedit() {
      return this.imgMiniatura;
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    showAddBussines() {
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
    onFileSelected(event) {
      let file = event.target.files[0];
      // Validar el tamaño del archivo (500 KB máximo)
      const maxSize = 500 * 1024; // 500 KB en bytes
      if (file && file.size > maxSize) {
        this.showAlert("warning", "El archivo de imagen debe ser de máximo 500 KB", 3000);
        return; // Detener el proceso si el archivo es demasiado grande
      }
      this.editedItem.image = file;
      //console.log(this.editedItem.image_cardgift);
      this.cargarImage(file);
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
</style>
