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

        <div v-if="branch"></div>
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-img
        :src="`${this.$axios.defaults.baseURL}images/${this.branch.image}?t=${getCacheTimestamp()}`"
        alt="Sucursal"
        cover
      />
    </v-avatar>

    <div>
      <div class="busgo-page-title">
        {{ this.branch.name }}
      </div>

      <div class="busgo-page-subtitle">
        Gestionar trabajadores de la sucursal
      </div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn"
      @click="showAdd()"
    >
      Agregar Trabajador
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">
            Listado de trabajadores
          </div>

          <div class="busgo-card-subtitle">
            Administra los trabajadores asignados a esta sucursal.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar trabajador..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="busgo-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="branchworkers"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="busgo-table"
      >
        <template #top>
          <div class="busgo-table-head">
            <div class="branch-worker-col-name">
              Nombre
            </div>

            <div class="branch-worker-col-role">
              Rol
            </div>

            <div class="branch-worker-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row">
                <div class="branch-worker-col-name busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${$axios.defaults.baseURL}images/${slotProps.item.workerImage}?v=${imageVersion}`"
                      alt="Foto del trabajador"
                      cover
                    />
                  </v-avatar>

                  <div class="busgo-name">
                    {{ slotProps.item.workerName }}
                  </div>
                </div>

                <div class="branch-worker-col-role busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-account-tie
                  </v-icon>

                  <span class="branch-worker-role-chip">
                    {{ slotProps.item.roleName }}
                  </span>
                </div>

                <div class="branch-worker-col-actions busgo-actions">
                 

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar trabajador"
                  >
                    <v-icon size="17">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

<v-dialog v-model="dialog" max-width="520px" persistent>
  <v-form ref="form" v-model="valid" enctype="multipart/form-data">
    <v-card class="busgo-worker-dialog" elevation="18">

      <div class="busgo-worker-header">
        <div class="busgo-worker-icon">
          <v-icon size="28">mdi-account-plus-outline</v-icon>
        </div>

        <div>
          <div class="busgo-worker-title">
            {{ formTitle }}
          </div>
          <div class="busgo-worker-subtitle">
            Asigna un trabajador a esta sucursal
          </div>
        </div>

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="busgo-worker-close"
          @click="close"
        />
      </div>

      <v-card-text class="busgo-worker-body">
        <label class="busgo-field-label">Trabajador</label>

        <v-autocomplete
          :no-data-text="'No hay datos disponibles'"
          v-model="editedItem.worker_id"
          :items="workers"
          placeholder="Buscar trabajador..."
          prepend-inner-icon="mdi-account-search-outline"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          :rules="selectRules"
          :disabled="this.editedIndex === 1"
          hide-details="auto"
          clearable
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              class="busgo-worker-option"
              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
              :title="item.raw.name"
            >
              <v-list-item-subtitle class="busgo-worker-option-subtitle">
                <div>
                  <v-icon size="14">mdi-email-outline</v-icon>
                  Correo: {{ item.raw.email }}
                </div>
                <div>
                  <v-icon size="14">mdi-shield-account-outline</v-icon>
                  Rol: {{ item.raw.roleName }}
                </div>
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions class="busgo-worker-actions">
        <v-btn
          class="busgo-worker-cancel"
          variant="flat"
          @click="close"
        >
          Cancelar
        </v-btn>

        <v-btn
          class="busgo-worker-save"
          variant="flat"
          @click="save"
          :disabled="!valid"
          :loading="loading"
        >
          Guardar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-form>
</v-dialog>

 <v-dialog v-model="dialogDelete" max-width="480px" persistent>
  <v-card class="busgo-delete-dialog" elevation="18">

    <div class="busgo-delete-header">
      <div class="busgo-delete-icon">
        <v-icon size="30">mdi-account-remove-outline</v-icon>
      </div>

      <div>
        <div class="busgo-delete-title">
          Eliminar Trabajador
        </div>
        <div class="busgo-delete-subtitle">
          Esta acción no se puede deshacer
        </div>
      </div>

      <v-spacer />

      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        class="busgo-delete-close"
        @click="closeDelete"
      />
    </div>

    <v-card-text class="busgo-delete-body">
      <div class="busgo-delete-message">
        ¿Desea eliminar el trabajador seleccionado?
      </div>

      <div class="busgo-delete-warning">
        <v-icon size="20">mdi-information-outline</v-icon>
        <span>
          Verifique que el trabajador no tenga viajes, ventas o permisos asociados antes de continuar.
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="busgo-delete-actions">
      <v-btn
        class="busgo-delete-cancel"
        variant="flat"
        @click="closeDelete"
      >
        Cancelar
      </v-btn>

      <v-btn
        class="busgo-delete-confirm"
        variant="flat"
        @click="deleteItemConfirm"
      >
        Eliminar
      </v-btn>
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
    imageVersion: 0,
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Trabajador" : "Editar Trabajador";
    },
  },
   watch: {
    'editedItem.worker_id'(newWorkerId) {
      if (newWorkerId) {
        const selectedWorker = this.workers.find(w => w.id === newWorkerId);
        this.editedItem.role_id = selectedWorker ? selectedWorker.role_id : null;
      } else {
        this.editedItem.role_id = null;
      }
    }
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
          this.imageVersion += 1;
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
.branch-worker-col-name {
  width: 45%;
  min-width: 0;
}

.branch-worker-col-role {
  width: 35%;
  min-width: 0;
}

.branch-worker-col-actions {
  width: 20%;
  min-width: 0;
}

.branch-worker-role-chip {
  max-width: 100%;
  padding: 3px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 960px) {
  .branch-worker-col-name,
  .branch-worker-col-role,
  .branch-worker-col-actions {
    width: 100%;
  }
}

.busgo-worker-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-worker-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
  color: #ffffff;
}

.busgo-worker-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-worker-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.busgo-worker-subtitle {
  font-size: 13px;
  opacity: 0.78;
  margin-top: 3px;
}

.busgo-worker-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-worker-body {
  padding: 24px !important;
  background: #f8fafc;
}

.busgo-field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.busgo-worker-option {
  border-radius: 14px !important;
  margin: 4px 8px !important;
}

.busgo-worker-option-subtitle {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  color: #64748b !important;
  font-size: 12px;
}

.busgo-worker-option-subtitle div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.busgo-worker-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-worker-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 110px;
}

.busgo-worker-save {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 120px;
}

.busgo-worker-save.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
}

@media (max-width: 600px) {
  .busgo-worker-header {
    padding: 18px;
  }

  .busgo-worker-body {
    padding: 18px !important;
  }

  .busgo-worker-actions {
    padding: 16px 18px !important;
  }

  .busgo-worker-cancel,
  .busgo-worker-save {
    flex: 1;
  }
}
</style>
