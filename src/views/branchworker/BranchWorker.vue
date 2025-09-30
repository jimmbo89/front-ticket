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
        <div v-if="branch">
          <!-- Aquí puedes agregar más información sobre la sucursal -->
        </div>
      </v-col>
    </v-row>
  </v-snackbar>
  <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-img :src="`${this.$axios.defaults.baseURL}images/${this.branch.image}?t=${getCacheTimestamp()}`"
                            alt="image" class="icono-concavo" cover></v-img>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">{{ this.branch.name }}</div>
      <div class="text-body-2 text-grey">Gestionar Trabajdores de la Sucursal</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Agregar Trabajador
    </v-btn>
  </v-card>
      <!--<v-card-text>
        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>
        <v-data-table :headers="headers" :search="search" :items="branchworkers" class="elevation-1"
          style="max-height: 65vh; overflow-y: auto" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
          <template v-slot:item.actions="{ item }">
            <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary" variant="tonal"
              elevation="1" title="Editar Trabajador"></v-btn>
            <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error" variant="tonal"
              elevation="1" title="Eliminar Trabajador"></v-btn>
          </template>
          <template v-slot:item.workerName="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="large">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.workerImage
                }?t=${getCacheTimestamp()}`" alt="image"></v-img> </v-avatar>
            {{ item.workerName }}
          </template>
        </v-data-table>
      </v-card-text>-->
      <v-card flat>
      <v-card-title class="d-flex align-center text-body-1">
        Listado de trabajadores

        <v-spacer></v-spacer>

        <v-text-field
          v-model="search"
          density="compact"
          label="Buscar trabajador"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          hide-details
          single-line
          flat
        ></v-text-field>
      </v-card-title>

      <v-divider class="my-2"></v-divider>

      <v-data-table
        :headers="headers"
        :items="branchworkers"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        class="elevation-1"
        :hide-default-header="true"
      style="max-height: 68vh; overflow-y: auto; background: transparent"
      >
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
              <div style="width: 40%; min-width: 0" class="text-left font-weight-bold">
                Nombre del Trabajador
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 30%; min-width: 0" class="text-left font-weight-bold">
                Rol
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 30%; min-width: 0" class="d-flex justify-left font-weight-bold">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
    <!-- Slot personalizado para cada fila -->
    <template v-slot:item="slotProps">
      <tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
              
              <!-- Columna 1: Nombre del trabajador con avatar -->
              <div class="d-flex align-center" style="width: 40%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img
                    :src="`${$axios.defaults.baseURL}images/${slotProps.item.workerImage}?t=${getCacheTimestamp()}`"
                    alt="Foto del trabajador"
                    class="icono-concavo"
                    cover
                  ></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.workerName }}</span>
                <v-tooltip activator="parent" location="top" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Nombre: {{ slotProps.item.workerName }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Columna 2: Rol -->
              <div style="width: 30%; min-width: 0" class="text-truncate">
                <span>{{ slotProps.item.roleName }}</span>
                <v-tooltip activator="parent" location="top" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Rol: {{ slotProps.item.roleName }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Columna 3: Acciones -->
              <div class="d-flex gap-1" style="width: 30%; justify-content: flex-end; flex-wrap: nowrap">
                <v-btn
                 size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.primary"
                  @click="editItem(slotProps.item)"
                  class="flex-shrink-0 mr-1"
                  title="Editar trabajador"
                >
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.error"
                  @click="deleteItem(slotProps.item)"
                  class="flex-shrink-0"
                  title="Eliminar trabajador"
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

  <v-dialog v-model="dialog" max-width="400px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.worker_id"
                  :items="workers" label="Personas" prepend-icon="mdi-account" item-title="name" item-value="id"
                  variant="underlined" :rules="selectRules" :disabled="this.editedIndex === 1">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.name">
                      <v-list-item-subtitle class="d-flex flex-column">
                        <div>Correo: {{ item.raw.email }}</div>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.role_id" :items="roles"
                  label="Roles" prepend-icon="mdi-account-tie" item-title="name" item-value="id" variant="underlined"
                  :rules="selectRules">
                </v-autocomplete>
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
        <span class="text-subtitle-2 ml-4"> Eliminar Trabajdor</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el Trabajador seleccionado?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete"> Cancelar </v-btn>
        <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm"> Aceptar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
export default {
  props: {
    branch: {
      type: Object,
      required: true,
      default: () => ({}), // Objeto vacío por defecto
    },
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

    dialog: false,
    dialogDelete: false,
    branchworkers: [],
    roles: [],
    workers: [],
    branch_id: "",
    data: {},
    headers: [
      { title: "Nombre del trabajdor", key: "workerName", width: "40%" },
      { title: "Rol", key: "roleName", width: "30%" },
      { title: "Acciones", key: "actions", sortable: false, width: "20%" },
    ],

    editedItem: {
      id: "",
      branch_id: "",
      role_id: "",
      worker_id: "",
    },
    originalItem: {
      id: "",
      branch_id: "",
      role_id: "",
      worker_id: "",
    },
    defaultItem: {
      id: "",
      branch_id: "",
      role_id: "",
      worker_id: "",
    },
    editedIndex: -1,
    search: "",
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Trabajador" : "Editar Trabajador";
    },
  },
  mounted() {
    this.branch_id = this.branch.id;
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
      this.data = {};
      this.data.branch_id = this.branch_id;
      this.data.type = 'Sucursal';
      try {
        const result = await handleRequest({
          endpoint: 'branch-workers-roles',
          method: 'POST',
          data: this.data
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.roles = result.data?.roles || [];
          this.workers = result.data?.workers.filter((worker) =>
            !this.branchworkers.some((branchworker) => branchworker.worker_id === worker.id)
          ) || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.roles = [];
          this.workers = [];
        }
      } catch (error) {
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
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
        this.data = {};
        this.data.branch_id = this.branch_id;
        const result = await handleRequest({
          endpoint: "branch-workers",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branchworkers = result.data?.branchWorkers || [];
          this.loading = false;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branchwrorkers = [];
          this.loading = false;
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
        this.data = {};
        this.data.branch_id = this.branch_id;
        this.data.worker_id = this.editedItem.worker_id;
        this.data.role_id = this.editedItem.role_id;

        try {
          const result = await handleRequest({
            endpoint: "branch-worker",
            method: "POST",
            data: this.data,
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
        const fieldsToUpdate = ["id", "branch_id", "role_id", "worker_id"];
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
              endpoint: "branch-worker",
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
      this.data = {};
      this.data.branch_id = this.branch_id;
      this.data.type = 'Sucursal';
      try {
        const result = await handleRequest({
          endpoint: 'branch-workers-roles',
          method: 'POST',
          data: this.data
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.roles = result.data?.roles || [];
          this.workers = result.data?.workers.filter((worker) =>
            !this.branchworkers.some((branchworker) => branchworker.worker_id === worker.id) ||
            worker.id === this.editedItem.worker_id
          ) || [];
          // Luego, si estás editando, buscas y agregas el trabajador desde branchworkers
          if (this.editedItem?.worker_id) {
            const editedWorker = this.branchworkers.find(
              bw => bw.worker_id == this.editedItem.worker_id
            );
            
            if (editedWorker && !this.workers.some(w => w.id == editedWorker.worker_id)) {
              this.workers.push({
                id: editedWorker.worker_id,
                worker_id: editedWorker.worker_id,
                name: editedWorker.workerName,
                image: editedWorker.workerImage,
              });
            }
          }
        } else {
          // Si no hay datos, asignamos un array vacío
          this.roles = [];
          this.workers = [];
        }
      } catch (error) {
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
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
          endpoint: "branch-worker-destroy",
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
/*.v-data-table > .v-data-table__wrapper > table > thead,
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
}*/
</style>