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
      <v-icon cover>mdi-account-cog-outline</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Roles</div>
      <div class="text-body-2 text-grey">Gestionar Roles</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAddRole">
      Agregar Rol
    </v-btn>
  </v-card>
    <v-container style="min-width: 100%;">
    <v-card flat>
      <v-card-title class="d-flex align-center text-body-1">
        Listado de roles
        <v-spacer></v-spacer>

        <v-text-field v-model="search" density="compact" label="Buscar roles" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" hide-details single-line flat></v-text-field>
      </v-card-title>

      <v-divider class="my-2"></v-divider>
      <v-data-table :headers="headers" :items="roles" :search="search" :items-per-page-text="'Elementos por páginas'"
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
              <div style="width: 20%; min-width: 0" class="text-left font-weight-bold">
                Nombre
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 15%; min-width: 0" class="text-left font-weight-bold">
                Tipo
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 50%; min-width: 0" class="text-left font-weight-bold">
                Descripción
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 15%; min-width: 0" class="d-flex justify-left font-weight-bold">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
        <!-- Slot para cada fila -->
        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
               <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
                <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                  <!-- Columna 1: Nombre -->
                  <div class="d-flex align-center" style="width: 20%; min-width: 0">
                   <span class="text-truncate">{{ slotProps.item.name }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Nombre: {{ slotProps.item.name }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Columna 3: tipo -->
                  <div style="width: 15%; min-width: 0" class="text-truncate text-left">
                    <v-avatar class="mr-1  avatar-border" elevation="3" size="small">
                      <v-icon :title=" slotProps.item.type">
                        {{ getTypeIcon( slotProps.item.type) }}
                      </v-icon>
                    </v-avatar>
                    {{  slotProps.item.type }}
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Tipo: {{ slotProps.item.type }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Columna 4: descripción -->
                  <div style="width: 50%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.description }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Descripción: {{ slotProps.item.description }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Columna 5: Acciones -->
                  <div class="d-flex gap-1" style="width: 15%; justify-content: flex-end; flex-wrap: nowrap">
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Editar">
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.green" @click="showAddPermission(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Asignar permisosr">
                      <v-icon size="20">mdi-shield-check</v-icon>
                    </v-btn>
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                      title="Eliminar">
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
  
  <v-dialog v-model="dialog" max-width="600px">
    <v-form ref="form" v-model="valid">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.name" clearable label="Nombre" prepend-icon="mdi-tag-outline"
                  variant="underlined" :rules="nameRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.type"
                  :items="typeOptions" label="Tipos" prepend-icon="mdi-label-outline" item-title="name" item-value="id"
                  variant="underlined" :rules="selectRules">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                      :prepend-icon="getTypeIcon(item.raw.name)"
                      :title="item.raw.name"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.description" clearable label="Descripción" prepend-icon="mdi-note"
                  variant="underlined"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn :color="paleteColors.primary" variant="flat" :loading="loading" @click="save" :disabled="!valid">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar un rol</span>
      </v-toolbar>
      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el rol seleccionado?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">Cancelar</v-btn>
        <v-btn :color="paleteColors.error" variant="flat" :loading="loading" @click="deleteItemConfirm">Aceptar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Diálogo donde se mostrarán los detalles de las rutas -->
  <v-dialog v-model="dialogRolePermission" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-card-text>
        <!-- Aquí pasamos el 'selectedWorker' al componente dentro del diálogo -->
        <RolePermission :role="selectedRole" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" :color="paleteColors.gris" @click="closeDialogRolePermission">Cerrar</v-btn>
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
      type: '',
    },
    defaultItem: {
      id: '',
      name: '',
      description: '',
      type: '',
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
</style>