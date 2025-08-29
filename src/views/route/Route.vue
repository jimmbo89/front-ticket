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
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>
  <v-card
    class="d-flex align-center pa-3"
    elevation="0"
    style="background-color: #f9f9f9"
  >
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-road-variant</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Rutas</div>
      <div class="text-body-2 text-grey">Gestionar Rutas</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn
      class="text-subtitle-1 ml-12"
      :color="paleteColors.primary"
      variant="tonal"
      elevation="2"
      prepend-icon="mdi-plus-circle"
      @click="showAdd()"
    >
      Agregar Ruta
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%">
    <!--<v-card elevation="6" class="mx-2">
      <v-card-text>
        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>
        <v-data-table :headers="headers" :search="search" :items="routes" class="elevation-1"
          style="max-height: 68vh; overflow-y: auto" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
          <template v-slot:item.actions="{ item }">
            <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary" variant="tonal"
              elevation="1" title="Editar Ruta"></v-btn>
            <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error" variant="tonal"
              elevation="1" title="Eliminar Ruta"></v-btn>
          </template>
          <template v-slot:item.originAddress="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.originImage
                }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
            {{ item.originAddress }}
          </template>
          <template v-slot:item.destinationAddress="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.destinationImage
                }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
            {{ item.destinationAddress }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>-->
    <v-card flat class="mt-4">
      <!-- Barra superior con título y búsqueda -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-subtitle-1 font-weight-bold">Listado de rutas</div>

        <!-- Spacer (solo visible en md+) -->
        <v-spacer class="d-none d-md-block"></v-spacer>

        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 30%">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar ruta"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <!-- Tabla de rutas con filas personalizadas -->
      <v-data-table
        :headers="headers"
        :items="routes"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="elevation-1"
        style="max-height: 68vh; overflow-y: auto; background: transparent"
      >
        <template v-slot:top>
          <!-- Tarjeta de encabezado con alto fijo -->
          <v-card
            flat
            color="blue-grey-lighten-5"
            class="mb-2 mx-1 rounded-lg"
            elevation="1"
            style="
              border: 1px solid #eceff1;
              height: 56px;
              display: flex;
              align-items: center;
            "
          >
            <v-card-text
              class="d-flex pa-2"
              style="
                width: 100%;
                min-width: 0;
                height: 100%;
                padding: 0 16px !important;
                display: flex;
                align-items: center;
              "
            >
              <!-- Negocio (20%) -->
              <div style="width: 15%; min-width: 0" class="text-left font-weight-bold">
                Nombre de la ruta
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 30%; min-width: 0" class="text-left font-weight-bold">
                Origen
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 25%; min-width: 0" class="text-left font-weight-bold">
                Destino
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Distancia
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Duración
              </div>

              <!-- Acciones (25%) -->
              <div
                style="width: 10%; min-width: 0"
                class="d-flex justify-left font-weight-bold"
              ></div>
            </v-card-text>
          </v-card>
        </template>
        <!-- Fila personalizada -->
        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
              <v-card
                class="mb-2 mx-1 rounded-lg"
                elevation="1"
                density="comfortable"
                flat
              >
                <v-card-text
                  class="d-flex align-center pa-2"
                  style="width: 100%; min-width: 0"
                >
                  <!-- Nombre -->
                  <div style="width: 15%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.name }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Nombre: {{ slotProps.item.name }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Origen con avatar -->
                  <div class="d-flex align-center" style="width: 30%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="`${this.$axios.defaults.baseURL}images/${
                          slotProps.item.originImage
                        }?t=${getCacheTimestamp()}`"
                        cover
                      ></v-img>
                    </v-avatar>
                    <span class="text-truncate">{{ slotProps.item.originAddress }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Origen: {{ slotProps.item.originAddress }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Destino con avatar -->
                  <div class="d-flex align-center" style="width: 25%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="`${this.$axios.defaults.baseURL}images/${
                          slotProps.item.destinationImage
                        }?t=${getCacheTimestamp()}`"
                        cover
                      ></v-img>
                    </v-avatar>
                    <span class="text-truncate">{{
                      slotProps.item.destinationAddress
                    }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Destino: {{ slotProps.item.destinationAddress }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Distancia -->
                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.distance }} km</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Distancia: {{ slotProps.item.distance }} km
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Duración -->
                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.estimated }} min</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Duración: {{ slotProps.item.estimated }} minutos
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Acciones -->
                  <div
                    class="d-flex gap-1"
                    style="width: 10%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary"
                      @click="editItem(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Editar Ruta"
                    >
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error"
                      @click="deleteItem(slotProps.item)"
                      class="flex-shrink-0"
                      title="Eliminar Ruta"
                    >
                      <v-icon size="20">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
  <v-dialog v-model="dialog" max-width="500px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="editedItem.name"
                  clearable
                  label="Nombre"
                  prepend-icon="mdi-store"
                  variant="underlined"
                  :rules="nameRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="editedItem.origin_id"
                  :items="locations"
                  label="Origen"
                  prepend-icon="mdi-arrow-up-circle"
                  item-title="address"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    ></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="editedItem.destination_id"
                  :items="locations"
                  label="Destino"
                  prepend-icon="mdi-arrow-down-circle"
                  item-title="address"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    ></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.distance"
                  clearable
                  label="Distancia (Km)"
                  prepend-icon="mdi-ruler"
                  variant="underlined"
                  :rules="distanceRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.estimated"
                  clearable
                  label="Duración (Minutos)"
                  prepend-icon="mdi-timer"
                  variant="underlined"
                  :rules="durationRules"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="save"
            :disabled="!valid"
            :loading="loading"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar una Ruta</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar la ruta seleccionada?</v-card-text>
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
    loading: false,
    mostrar: false,
    dialog: false,
    dialogDelete: false,
    locations: [],
    routes: [],
    data: {},
    headers: [
      { title: "Nombre", value: "name", width: "15%" },
      { title: "Origen", value: "originAddress", width: "30%" },
      { title: "Destino", value: "destinationAddress", width: "30%" },
      { title: "Distancia (Km)", value: "distance", width: "5%" },
      { title: "Duración (Minutos)", value: "estimated", width: "5%" },
      { title: "Acciones", value: "actions", sortable: false, width: "15%" },
    ],

    editedItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
    },
    originalItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
    },
    defaultItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
    },
    editedIndex: -1,
    search: "",
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    distanceRules: [
      (v) => !isNaN(v) || "La distancia debe ser un número",
      (v) => v > 0 || "La distancia debe ser mayor a 0",
    ],
    durationRules: [
      (v) => !isNaN(v) || "La duración debe ser un número",
      (v) => v > 0 || "La duración debe ser mayor a 0",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Ruta" : "Editar Ruta";
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
      try {
        const result = await handleRequest({
          endpoint: "location",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.locations = result.data?.locations || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.locations = [];
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
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.originalItem = Object.assign({}, this.defaultItem);
      });
      this.editedIndex = -1;
    },
    async initialize() {
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "route",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.routes = result.data?.routes || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.routes = [];
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
        const fieldsToUpdate = [
          "name",
          "origin_id",
          "destination_id",
          "distance",
          "estimated",
          "status",
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
          try {
            const result = await handleRequest({
              endpoint: "route",
              method: "POST",
              data: updatedFields,
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
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = [
          "name",
          "origin_id",
          "destination_id",
          "distance",
          "estimated",
          "status",
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
          try {
            const result = await handleRequest({
              endpoint: "route",
              method: "PUT",
              data: updatedFields,
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
      try {
        const result = await handleRequest({
          endpoint: "location",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.locations = result.data?.locations || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.locations = [];
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
          endpoint: "route-destroy",
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
