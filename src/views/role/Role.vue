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
      <v-icon>mdi-account-cog-outline</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Roles</div>
      <div class="busgo-page-subtitle">Gestionar roles y permisos del sistema</div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn"
      @click="showAddRole"
    >
      Agregar Rol
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Listado de roles</div>
          <div class="busgo-card-subtitle">
            Administra perfiles, permisos y niveles de acceso.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar rol..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="busgo-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="roles"
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
            <div class="role-col-name">Nombre</div>
            <div class="role-col-description">Descripción</div>
            <div class="role-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row">
                <div class="role-col-name busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-icon color="primary" size="20">
                      mdi-account-key
                    </v-icon>
                  </v-avatar>

                  <div class="busgo-name">
                    {{ slotProps.item.name }}
                  </div>
                </div>

                <div class="role-col-description busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.description }}
                  </span>
                </div>

                <div class="role-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.green"
                    @click="showAddPermission(slotProps.item)"
                    title="Asignar permisos"
                  >
                    <v-icon size="17">mdi-shield-check</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar"
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

  <v-dialog v-model="dialog" max-width="600px">
    <v-form ref="form" v-model="valid">
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
                  prepend-icon="mdi-tag-outline"
                  variant="underlined"
                  :rules="nameRules"
                />
              </v-col>

              <v-col cols="12" md="12">
                <v-text-field
                  v-model="editedItem.description"
                  clearable
                  label="Descripción"
                  prepend-icon="mdi-note"
                  variant="underlined"
                />
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
            :loading="loading"
            @click="save"
            :disabled="!valid"
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
          Eliminar rol
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el rol seleccionado?
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
          :loading="loading"
          @click="deleteItemConfirm"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="dialogRolePermission"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <RolePermission :role="selectedRole" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="flat"
          :color="paleteColors.gris"
          @click="closeDialogRolePermission"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import RolePermission from "../rolepermission/RolePermission.vue";
import { paleteColors } from "@/assets/colors";
export default {
  components: {
    RolePermission
  },
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
    dialog: false,
    dialogDelete: false,
    roles: [],
    data: {},
    selectedRole: [],
    dialogRolePermission: null,
    typeOptions: [
      {
        "name": "Sistema",
        "id": "Sistema",
      },
      {
        "name": "Sucursal",
        "id": "Sucursal",
      }
    ],
    headers: [
      { title: 'Nombre', value: 'name', width: '30%' },
      { title: 'Tipo', value: 'type', width: '10%' },
      { title: 'Descripción', value: 'description', width: '40%' },
      { title: 'Acciones', value: 'actions', sortable: false, width: '20%' },
    ],

    editedItem: {
      id: '',
      name: '',
      description: '',
      type: 'Sistema',
    },
    defaultItem: {
      id: '',
      name: '',
      description: '',
      type: 'Sistema',
    },
    originalItem: {
      id: '',
      name: '',
      description: '',
      type: '',
    },
    editedIndex: -1,
    search: '',
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) ||
        "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) ||
        "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Agregar Rol' : 'Editar Rol';
    }
  },
  mounted() {
    this.initialize();
  },
  methods: {
    showAddRole() {
      this.close();
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.loading = false;
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
          endpoint: 'role',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.roles = result.data?.roles
            ? result.data.roles.filter(role => role.type !== '') // Filtra los roles con 'type' no vacío
            : []; // Si no hay roles, asigna un arreglo vacío
        } else {
          // Si no hay datos, asignamos un array vacío
          this.roles = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
      }
    },
    getTypeIcon(type) {
      switch (type) {
        case 'Sucursal':
          return 'mdi-store'; // Ícono para tareas
        case 'Sistema':
          return 'mdi-cog'; // Ícono para productos
        default:
          return 'mdi-help-circle'; // Ícono por defecto
      }
    },
    getTypeColor(type) {
      switch (type) {
        case 'Task':
          return '#FFB300'; // Color sugerente para tareas (amarillo)
        case 'Sistema':
          return '#43A047'; // Color sugerente para productos (verde)
        case 'Home':
          return '#03626C'; // Color base para hogar
        default:
          return '#E0E0E0'; // Color gris claro para otros tipos
      }
    },
    async save() {
      this.loading = true;
      if (this.editedIndex === -1) {
        this.valid = false;
        this.data.name = this.editedItem.name;
        this.data.description = this.editedItem.description;
        this.data.type = this.editedItem.type;
        try {
          const result = await handleRequest({
            endpoint: 'role',
            method: 'POST',
            data: this.data
          });

          // Manejo de la respuesta según el resultado
          if (result.success) {
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
        } finally {
          this.loading = false;
        }
      } else {
        const fieldsToUpdate = ['id', 'name', 'type', 'description'];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => {
            obj[key] = this.editedItem[key];
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          this.loading = true;
          try {
            const result = await handleRequest({
              endpoint: 'role',
              method: 'PUT',
              data: updatedFields
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
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
      this.loading = true;
      try {
        let request = {
          id: this.editedItem.id
        };
        const result = await handleRequest({
          endpoint: 'role-destroy',
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
        this.loading = false;
        this.closeDelete();
      }
    },
     //Trabajadores asociados
     showAddPermission(item) {
      this.selectedRole = item; // Asignamos el trabajador seleccionado
      this.dialogRolePermission = true; // Abrimos el diálogo
    },
    closeDialogRolePermission() {
      this.dialogRolePermission = false; // Cerramos el diálogo
      this.selectedRole = [];
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
.avatar-border {
  border: 2px solid #000;
  /* Aquí se define el borde */
}
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

.role-col-name{
    width:25%;
    min-width:0;
}

.role-col-description{
    width:60%;
    min-width:0;
}

.role-col-actions{
    width:15%;
    min-width:0;
}
</style>