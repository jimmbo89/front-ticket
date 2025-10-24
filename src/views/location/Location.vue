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
<v-card class="d-flex align-center pa-3" elevation="0">
    <!-- Icono 
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-map-marker</v-icon>
    </v-avatar>

    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Lugares</div>
      <div class="text-body-2 text-grey">Gestionar Lugares</div>
    </div>-->

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Agregar Ubicación
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%;">
  <!--<v-card elevation="6" class="mx-2">
    <v-card-text>
      <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
        hide-details>
      </v-text-field>
      <v-data-table :headers="headers" :search="search" :items="locations" class="elevation-1"
        style="max-height: 68vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
        no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
        <template v-slot:item.actions="{ item }">
          <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary" variant="tonal"
            elevation="1" title="Editar Lugar"></v-btn>
          <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error" variant="tonal"
            elevation="1" title="Eliminar Lugar"></v-btn>
        </template>
        <template v-slot:item.address="{ item }">
          <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
            <v-img :src="`${this.$axios.defaults.baseURL}images/${item.image}?t=${Date.now()}`" alt="image"></v-img>
          </v-avatar>
          {{ item.address }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>-->
  <v-card flat>
  <!-- Barra superior con título y búsqueda -->
  <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
    <!-- Título -->
    <div class="text-subtitle-1 font-weight-bold">Listado de ubicaciones</div>

    <!-- Spacer (solo visible en md+) -->
    <v-spacer class="d-none d-md-block"></v-spacer>

    <!-- Campo de búsqueda global -->
      <v-text-field v-model="search" density="compact" label="Buscar ubicación" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" hide-details single-line flat></v-text-field>

  </v-card-title>

  <!-- Tabla de lugares con filas personalizadas -->
  <v-data-table :headers="headers" :items="locations" :search="search" :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." :hide-default-header="true"
    class="elevation-1" style="max-height: 68vh; overflow-y: auto; background: transparent">
    <template v-slot:top>
  <!-- Tarjeta de encabezado con alto fijo -->
  <v-card
    flat
    color="blue-grey-lighten-5"
    class="mb-2 mx-1 rounded-lg"
    elevation="1"
    style="border: 1px solid #ECEFF1; height: 40px; min-height: 40px; display: flex; align-items: center"
  >
    <v-card-text
      class="d-flex pa-2"
      style="width: 100%; min-width: 0; height: 100%; padding: 0 16px !important; display: flex; align-items: center"
    >
              <!-- Negocio (20%) -->
              <div style="width: 50%; min-width: 0" class="text-left font-weight-bold">
                Dirección
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Longitud
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Latitud
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                País
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Ciudad
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 10%; min-width: 0" class="d-flex justify-left font-weight-bold">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
    <!-- Fila personalizada -->
    <template v-slot:item="slotProps">
      <tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
              <!-- Dirección con avatar -->
              <div class="d-flex align-center" style="width: 50%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`" cover></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.address }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Dirección: {{ slotProps.item.address }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Longitud -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.longitude }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Longitud: {{ slotProps.item.longitude }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Latitud -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.latitude }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Latitud: {{ slotProps.item.latitude }}
                  </span>
                </v-tooltip>
              </div>

              <!-- País -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.country }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    País: {{ slotProps.item.country }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Ciudad -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.city }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Ciudad: {{ slotProps.item.city }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Acciones -->
              <div class="d-flex gap-1" style="width: 10%; justify-content: flex-end; flex-wrap: nowrap">
                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                  title="Editar Lugar">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>

                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                  title="Eliminar Lugar">
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>
  <v-card-actions class="pa-4">
    <v-spacer></v-spacer>
    <v-btn
      variant="flat"
      :color="paleteColors.gris"
      to="/company"
      aria-label="Volver a Empresa"
    >
      Volver
    </v-btn>
  </v-card-actions>
</v-card>
</v-container>

  <v-dialog v-model="dialog" max-width="700px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.address" clearable label="Dirección"
                  prepend-icon="mdi-map-marker-outline" variant="underlined" :rules="addressRules" hint="Ejemplo: Terminal Magallanes"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.longitude" clearable label="Logintud" prepend-icon="mdi-earth"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.latitude" clearable label="Latitud" prepend-icon="mdi-earth"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.country" clearable label="País" prepend-icon="mdi-earth"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.city" clearable label="Ciudad" prepend-icon="mdi-city"
                  variant="underlined"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input clearable v-model="file" ref="fileInput" label="Imagen del lugar" variant="underlined"
                  density="compact" name="file" accept=".png, .jpg, .jpeg" @change="onFileSelected">
                </v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img v-if="imagenDisponible()" :src="imgedit" height="120" width="210">
                </v-card>


              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn :color="paleteColors.primary" variant="flat" @click="save" :disabled="!valid" :loading="loading">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>

      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar una Ubicación</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar la ubicación seleccionado?</v-card-text>
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
    sb_type: '',
    sb_message: '',
    sb_timeout: 2000,
    sb_title: '',
    sb_icon: '',
    paleteColors: paleteColors,
    valid: true,
    loading: false,
    mostrar: false,
    file: null,
    imgMiniatura: '',
    dialog: false,
    dialogDelete: false,
    showPassword: false,
    locations: [],
    data: {},
    headers: [
      //{ title: 'Sucursal', value: 'branchName', width: '20%' },
      { title: 'Dirección', value: 'address', width: '50%' },
      { title: 'Longitud', value: 'longitude', width: '10%' },
      { title: 'Latitud', value: 'latitude', width: '10%' },
      { title: 'País', value: 'country', width: '10%' },
      { title: 'Ciudad', value: 'city', width: '10%' },
      { title: 'Acciones', value: 'actions', sortable: false, width: '10%' },
    ],
    editedItem: {
      id: '',
      longitude: '',
      latitude: '',
      country: '',
      city: '',
      image: '',
      address: '',
    },
    originalItem: {
      id: '',
      longitude: '',
      latitude: '',
      country: '',
      city: '',
      image: '',
      address: '',
    },
    defaultItem: {
      id: '',
      longitude: '',
      latitude: '',
      country: '',
      city: '',
      image: '',
      address: '',
    },
    editedIndex: -1,
    search: '',
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 250) ||
        "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) ||
        "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    requiredRules: [(v) => !!v || "El campo es requerido"],
    addressRules: [
      (v) => !!v || "El campo es requerido", // Verifica que el campo no esté vacío
      (v) => (v && v.length <= 30) || "El campo debe tener 30 caracteres máximo", // Verifica que tenga máximo 30 caracteres
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres", // Verifica que tenga al menos 3 caracteres
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Agregar Ubicación' : 'Editar Ubicación';
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
    async showAdd() {
      this.close();
      this.editedIndex === -1;
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
      this.imgMiniatura = '';
    },
    async initialize() {
      try {
        //this.data = {};
        //this.data.branch_id = this.editedItem.branch_id;
        this.loading = true;
        const result = await handleRequest({
          endpoint: 'location',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.locations = result.data?.locations || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.locations = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
      }
    },
    async save() {
      if (this.editedIndex === -1) {
        this.loading = true;
        this.valid = false;
        const fieldsToUpdate = ['address', 'longitude', 'latitude', 'image', 'country', 'city'];

        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => {
            obj[key] = this.editedItem[key];
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          if (this.file) {
            updatedFields.image = this.editedItem.image;
          }
          const formData = new FormData();
          for (let key in updatedFields) {
            formData.append(key, updatedFields[key]);
          }

          try {
            const result = await handleRequest({
              endpoint: 'location',
              method: 'POST',
              data: formData
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.loading = false;
              this.showAlert("success", result.message, 3000);
              this.initialize();
            } else {
              this.loading = false;
              this.showAlert("warning", result.message, 3000);
            }
          } catch (error) {
            this.loading = false;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
          }
        } else {
          this.loading = false;
          this.showAlert("success", "Debe completar los datos.", 3000);
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = ['address', 'longitude', 'latitude', 'image', 'country', 'city'];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
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
              endpoint: 'location-update',
              method: 'POST',
              data: formData
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.loading = false;
              this.showAlert("success", result.message, 3000);
              this.initialize();
            } else {
              this.loading = false;
              this.showAlert("warning", result.message, 3000);
            }
          } catch (error) {
            this.loading = false;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
          }
        } else {
          this.loading = false;
          this.showAlert("success", "No se realizaron cambios.", 3000);
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
          console.error('Error al cargar la imagen', error);
          this.showAlert('error', 'Error al cargar la imagen.', 3000);
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
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },
    async deleteItemConfirm() {
      try {
        let request = {
          id: this.editedItem.id
        };
        const result = await handleRequest({
          endpoint: 'location-destroy',
          method: 'POST',
          data: request
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
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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

      if (sb_type == "info") {
        this.sb_title = "Información";
        this.sb_icon = "mdi-alert-circle";
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
      if (this.imgedit !== undefined && this.imgedit !== '') {
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
        this.valid = false;
        this.showAlert('warning', 'El archivo de imagen debe ser de máximo 500 KB', 3000);
        return; // Detener el proceso si el archivo es demasiado grande
      }
      this.valid = true;
      this.editedItem.image = file;
      //console.log(this.editedItem.image_cardgift);
      this.cargarImage(file);
    },
    cargarImage(file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.imgMiniatura = e.target.result;
      }
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