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
            <v-icon cover>mdi-tag-outline</v-icon>
        </v-avatar>

        <!-- Texto -->
        <div class="ml-4">
            <div class="text-h6 font-weight-medium">Promociones</div>
            <div class="text-body-2 text-grey">Gestionar Promociones</div>
        </div>

        <!-- Botones -->
        <v-spacer></v-spacer>

        <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
            prepend-icon="mdi-plus-circle" @click="showAdd()">
            Agregar Promoción
        </v-btn>
    </v-card>
    <v-container style="min-width: 100%;">
        <v-card flat>
            <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
            <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
                <!-- Título -->
                <div class="text-subtitle-1 font-weight-bold">Listado de promociones</div>

                <!-- Spacer (solo visible en md+) -->
                <v-spacer class="d-none d-md-block"></v-spacer>
                <!-- Campo de búsqueda global -->
                <div class="flex-grow-1" style="max-width: 300px">
                    <v-text-field v-model="search" density="compact" label="Buscar promociones"
                        prepend-inner-icon="mdi-magnify" variant="solo-filled" hide-details single-line
                        flat></v-text-field>
                </div>
            </v-card-title>

            <!-- Tabla de viajes con filas personalizadas -->
            <v-data-table :headers="headers" :items="promotions" :search="search"
                :items-per-page-text="'Elementos por página'" no-data-text="No hay datos disponibles" :loading="loading"
                loading-text="Cargando datos..." :hide-default-header="true" class="elevation-1"
                style="max-height: 68vh; overflow-y: auto; background: transparent">
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
                            <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                                Porciento (%)
                            </div>

                            <!-- Teléfono (10%) -->
                            <div style="width: 55%; min-width: 0" class="text-left font-weight-bold">
                                Descripción
                            </div>

                            <!-- Dirección (25%) -->
                            <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                                Estado
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
                                    <!-- Ruta -->
                                    <div style="width: 20%; min-width: 0" class="text-truncate">
                                        <span>{{ slotProps.item.name }}</span>
                                        <v-tooltip activator="parent" location="bottom" max-width="350px">
                                            <span style="white-space: normal; word-break: break-word">
                                                Nombre: {{ slotProps.item.name }}
                                            </span>
                                        </v-tooltip>
                                    </div>

                                    <div class="d-flex align-center" style="width: 10%; min-width: 0; text-align: left">
                                        <span class="text-truncate">{{ slotProps.item.percentage }}</span>
                                        <v-tooltip activator="parent" location="bottom" max-width="350px">
                                            <span style="white-space: normal; word-break: break-word">
                                                Porciento (%): {{ slotProps.item.percentage }}
                                            </span>
                                        </v-tooltip>
                                    </div>

                                    <!-- Origen con avatar -->
                                    <div class="d-flex align-center" style="width: 55%; min-width: 0">
                                        <span class="text-truncate">{{ slotProps.item.description }}</span>
                                        <v-tooltip activator="parent" location="bottom" max-width="350px">
                                            <span style="white-space: normal; word-break: break-word">
                                                Descripción: {{ slotProps.item.description }}
                                            </span>
                                        </v-tooltip>
                                    </div>

                                    <!-- Destino con avatar -->
                                    <div class="d-flex align-center" style="width: 10%; min-width: 0">
                                        <v-chip
                                            :color="slotProps.item.active ? paleteColors.active : paleteColors.inactive"
                                            :text-color="paleteColors.white">
                                            {{ slotProps.item.active ? "Activa" : "Inactiva" }}
                                        </v-chip>
                                        <v-tooltip activator="parent" location="bottom" max-width="350px">
                                            <span style="white-space: normal; word-break: break-word">
                                                Estado: {{ slotProps.item.active ? "Activa" : "Inactiva" }}
                                            </span>
                                        </v-tooltip>
                                    </div>

                                    <!-- Acciones -->
                                    <div class="d-flex gap-1"
                                        style="width: 10%; justify-content: flex-end; flex-wrap: nowrap">
                                        <v-btn size="35" icon variant="outlined"
                                            :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                                            :color="paleteColors.primary" @click="editItem(slotProps.item)"
                                            class="flex-shrink-0 mr-1" title="Editar Promoción">
                                            <v-icon size="20">mdi-pencil</v-icon>
                                        </v-btn>

                                        <v-btn size="35" icon variant="outlined"
                                            :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                                            :color="paleteColors.error" @click="deleteItem(slotProps.item)"
                                            class="flex-shrink-0" title="Eliminar Promoción">
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
    <!--<v-container style="min-width: 100%; min-height: 100%;">
        <v-card elevation="6" class="mx-2">
            <v-toolbar :color="paleteColors.primary">
                <v-row align="center">
                    <v-col cols="12" md="8" class="grow ml-4">
                        <span class="text-subtitle-1"><strong>Listado de Promociones</strong></span>
                    </v-col>
                    <v-col cols="12" md="3" class="text-right">
                        <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.white" variant="tonal" elevation="2"
                            prepend-icon="mdi-plus-circle" @click="showAdd">
                            Agregar Promoción
                        </v-btn>
                    </v-col>
                </v-row>
            </v-toolbar>

            <v-card-text>
                <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
                    hide-details>
                </v-text-field>
                <v-data-table :headers="headers" :search="search" :items="promotions" class="elevation-1"
                    style="max-height: 68vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
                    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
                    <template v-slot:item.actions="{ item }">
                        <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary"
                            variant="tonal" elevation="1" title="Editar Promoción"></v-btn>
                        <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error"
                            variant="tonal" elevation="1" title="Eliminar Promoción"></v-btn>
                    </template>
                    <template v-slot:item.active="{ item }">
                        <v-chip :color="item.active ? paleteColors.active : paleteColors.inactive" :text-color="paleteColors.white">
                            {{ item.active ? "Activa" : "Inactiva" }}
                        </v-chip>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>-->

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
                                <v-text-field v-model="editedItem.name" clearable label="Nombre"
                                    prepend-icon="mdi-tag-outline" variant="underlined"
                                    :rules="nameRules"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-switch 
  v-model="editedItem.active" 
  :true-value="true" 
  :false-value="false"
  :color="paleteColors.active"
  hide-details 
  inset 
  class="custom-switch"
>
  <template v-slot:label>
    <span class="text-body-1"
      :style="{ color: editedItem.active ? paleteColors.active : paleteColors.grey }">
      {{ editedItem.active ? 'Activa' : 'Inactiva' }}
    </span>
  </template>
</v-switch>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="editedItem.percentage" clearable label="Descuento (%)"
                                    prepend-icon="mdi-percent" variant="underlined" type="number" step="0.1" min="0"
                                    max="100" :rules="[
                                        (v) => !!v || 'El descuento es requerido',
                                        (v) => (v >= 0 && v <= 100) || 'El descuento debe estar entre 0 y 100',
                                    ]"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="12">
                                <v-textarea v-model="editedItem.description" clearable label="Descripción"
                                    prepend-icon="mdi-text-box-outline" variant="underlined"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
                    <v-btn :color="paleteColors.primary" variant="flat" :loading="loading" @click="save"
                        :disabled="!valid">Aceptar</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
            <v-toolbar :color="paleteColors.error">
                <span class="text-subtitle-2 ml-4"> Eliminar una promoción</span>
            </v-toolbar>
            <v-card-text class="mt-2 mb-2"> ¿Desea eliminar la promoción seleccionada?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">Cancelar</v-btn>
                <v-btn :color="paleteColors.error" variant="flat" :loading="loading"
                    @click="deleteItemConfirm">Aceptar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import { paleteColors } from '@/assets/colors';
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
        dialog: false,
        dialogDelete: false,
        promotions: [],
        data: {},
        typeOptions: [
            {
                "name": "Activa",
                "id": "true",
            },
            {
                "name": "Inactiva",
                "id": "false",
            }
        ],
        headers: [
            { title: 'Nombre', value: 'name', },
            { title: 'Porciento(%)', value: 'percentage', },
            { title: 'Descripción', value: 'description', },
            { title: 'Estado', value: 'active', },
            { title: 'Acciones', value: 'actions', sortable: false, width: '10%' },
        ],

        editedItem: {
            id: '',
            name: '',
            description: '',
            percentage: '',
            active: true,
        },
        defaultItem: {
            id: '',
            name: '',
            description: '',
            percentage: '',
            active: true,
        },
        originalItem: {
            id: '',
            name: '',
            description: '',
            percentage: '',
            active: true,
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
        selectRules: [
            (v) => v !== null && v !== undefined || "Seleccionar al menos un elemento",
        ],
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Agregar Promoción' : 'Editar Promoción';
        }
    },
    mounted() {
        this.initialize();
    },
    methods: {
        showAdd() {
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
                    endpoint: 'promotion',
                    method: 'GET',
                });

                if (result.success) {
                    // Si la solicitud es exitosa, asignamos las sucursales
                    this.promotions = result.data?.promotions || []; // Si no hay roles, asigna un arreglo vacío
                } else {
                    // Si no hay datos, asignamos un array vacío
                    this.promotions = [];
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
            this.loading = true;
            if (this.editedIndex === -1) {
                this.valid = false;
                const fieldsToUpdate = ['name', 'description', 'percentage', 'active'];

                let updatedFields = Object.keys(this.editedItem)
                    .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
                    .reduce((obj, key) => {
                        obj[key] = this.editedItem[key];
                        return obj;
                    }, {});
                // Asegúrate de que el campo 'active' se incluya si ha cambiado
                if (this.editedItem.active === this.originalItem.active) {
                    updatedFields.active = this.editedItem.active;
                }
                if (Object.keys(updatedFields).length > 0) {
                    try {
                        const result = await handleRequest({
                            endpoint: 'promotion',
                            method: 'POST',
                            data: updatedFields
                        });

                        // Manejo de la respuesta según el resultado
                        if (result.success) {
                            this.loading = false;
                            this.showAlert("success", result.message, 3000);
                            this.initialize();
                        } else {
                            this.close();
                            this.loading = false;
                            this.showAlert("warning", result.message, 3000);
                        }
                    } catch (error) {
                        this.loading = false;
                        this.close();
                        // Este bloque captura errores inesperados fuera del manejo estándar
                        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
                    }
                } else {
                    this.loading = false;
                    this.close();
                    this.showAlert("success", "Debe completar los datos de la promoción.", 3000);
                }
            } else {
                this.valid = false;
                const fieldsToUpdate = ['name', 'description', 'percentage', 'active'];
                let updatedFields = Object.keys(this.editedItem)
                    .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
                    .reduce((obj, key) => {
                        obj[key] = this.editedItem[key];
                        return obj;
                    }, {});
                if (Object.keys(updatedFields).length > 0) {
                    updatedFields.id = this.editedItem.id;
                    try {
                        const result = await handleRequest({
                            endpoint: 'promotion',
                            method: 'PUT',
                            data: updatedFields
                        });

                        // Manejo de la respuesta según el resultado
                        if (result.success) {
                            this.loading = false;
                            this.showAlert("success", result.message, 3000);
                            this.initialize();
                        } else {
                            this.close();
                            this.loading = false;
                            this.showAlert("warning", result.message, 3000);
                        }
                    } catch (error) {
                        this.loading = false;
                        this.close();
                        // Este bloque captura errores inesperados fuera del manejo estándar
                        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
                    }
                } else {
                    this.loading = false;
                    this.close();
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
                    endpoint: 'promotion-destroy',
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