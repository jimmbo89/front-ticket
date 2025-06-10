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
    <v-container style="min-width: 100%; min-height: 100%;">
        <v-card elevation="6" class="mx-2">
            <v-toolbar :color="paleteColors.primary">
                <v-row align="center">
                    <v-col cols="12" md="8" class="grow ml-4">
                        <span class="text-subtitle-1"><strong>Listado de Tipos de Pasaje</strong></span>
                    </v-col>
                    <v-col cols="12" md="3" class="text-right">
                        <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.white" variant="tonal" elevation="2"
                            prepend-icon="mdi-plus-circle" @click="showAdd">
                            Agregar Tipo
                        </v-btn>
                    </v-col>
                </v-row>
            </v-toolbar>

            <v-card-text>
                <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
                    hide-details>
                </v-text-field>
                <v-data-table :headers="headers" :search="search" :items="ticketTypes" class="elevation-1"
                    style="max-height: 68vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
                    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
                    <template v-slot:item.actions="{ item }">
                        <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary"
                            variant="tonal" elevation="1" title="Editar"></v-btn>
                        <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error"
                            variant="tonal" elevation="1" title="Eliminar"></v-btn>
                    </template>
                    <!-- Columna de estado active -->
                    <template v-slot:item.active="{ item }">
                    <v-chip
                    :color="item.active ? 'green-darken-3' : 'red-darken-3'"
                    :prepend-icon="item.active ? 'mdi-check-circle' : 'mdi-close-circle'"
                    :text="item.active ? 'Sí' : 'No'"
                    variant="outlined"
                    ></v-chip>
                </template>
                </v-data-table>
            </v-card-text>
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
                                <v-text-field v-model="editedItem.name" clearable label="Nombre"
                                    prepend-icon="mdi-tag-outline" variant="underlined"
                                    :rules="nameRules"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <!--<v-autocomplete 
                            :no-data-text="'No hay datos disponibles'" 
                            v-model="editedItem.active"
                            :items="[
                                { id: 1, name: 'Activo', icon: 'mdi-check-circle-outline', color: 'green' },
                                { id: 0, name: 'Inactivo', icon: 'mdi-close-circle-outline', color: 'red' },
                            ]" 
                            label="Estado" 
                            item-title="name" 
                            item-value="id" 
                            variant="underlined"
                            :rules="selectRules"
                            >
                            <template v-slot:prepend>
                                <v-icon :color="editedItem.active ? 'green' : 'red'">
                                {{ editedItem.active ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}
                                </v-icon>
                            </template>
                            
                            <template v-slot:item="{ props, item }">
                                <v-list-item
                                v-bind="props"
                                :prepend-icon="item.raw.icon"
                                :color="item.raw.color"
                                ></v-list-item>
                            </template>
                            
                            <template v-slot:selection="{ item }">
                                <v-chip
                                :color="item.raw.color"
                                variant="tonal"
                                >
                                <v-icon start :icon="item.raw.icon"></v-icon>
                                {{ item.title }}
                                </v-chip>
                            </template>
                            </v-autocomplete>-->
                            <v-switch
                                v-model="editedItem.active"
                                :true-value="true"
                                :false-value="false"
                                :label="`Activo: ${editedItem.active ? 'Sí' : 'No'}`"
                                :color="paleteColors.active"
                                hide-details
                                inset
                                class="custom-switch"
                            >
                                <template v-slot:label>
                                <span class="text-body-1" :style="{ color: editedItem.active ? paleteColors.active : paleteColors.grey }">
                                    Activo: 
                                    <span class="text-body-1">
                                    {{ editedItem.active ? 'Sí' : 'No' }}
                                    </span>
                                </span>
                                </template>
                            </v-switch>
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
                <span class="text-subtitle-2 ml-4"> Eliminar Tipo de Pasaje</span>
            </v-toolbar>
            <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el tipo de pasaje seleccionado?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">Cancelar</v-btn>
                <v-btn :color="paleteColors.error" variant="flat" :loading="loading" @click="deleteItemConfirm">Aceptar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api";
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
        ticketTypes: [],
        data: {},
        activeOptions: [
        { name: 'No', id: 0, icon: 'mdi-close-circle' },
        { name: 'Sí', id: 1, icon: 'mdi-check-circle' }
        ],
        headers: [
            { title: 'Nombre', value: 'name' },
            { title: 'Descripción', value: 'description' },
            { title: 'Activo', value: 'active' },
            { title: 'Acciones', value: 'actions', sortable: false, width: '10%' },
        ],
        editedItem: {
            id: '',
            name: '',
            description: '',
            active: 1,
        },
        defaultItem: {
            id: '',
            name: '',
            description: '',
            active: 1,
        },
        originalItem: {
            id: '',
            name: '',
            description: '',
            active: 1,
        },
        editedIndex: -1,
        search: '',
        nameRules: [
            (v) => !!v || "El campo es requerido",
            (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
            (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
        ],
        selectRules: [
            (v) => v !== null && v !== undefined || "Seleccionar al menos un elemento",
        ],
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Agregar Tipo de Pasaje' : 'Editar Tipo de Pasaje';
        }
    },
    mounted() {
        this.initialize();
    },
    methods: {
        showAdd() {
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
                    endpoint: 'ticket-type',
                    method: 'GET',
                });

                if (result.success) {
                    this.ticketTypes = result.data?.ticketTypes || [];
                } else {
                    this.ticketTypes = [];
                }
            } catch (error) {
                this.loading = false;
                this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
            } finally {
                this.loading = false;
            }
        },
        async save() {
            this.loading = true;
            if (this.editedIndex === -1) {
                this.valid = false;
                const fieldsToUpdate = ['name', 'description', 'active'];

                let updatedFields = Object.keys(this.editedItem)
                    .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
                    .reduce((obj, key) => {
                        obj[key] = this.editedItem[key];
                        return obj;
                    }, {});

                if (this.editedItem.active === this.originalItem.active) {
                    updatedFields.active = this.editedItem.active;
                }

                if (Object.keys(updatedFields).length > 0) {
                    try {
                        const result = await handleRequest({
                            endpoint: 'ticket-type',
                            method: 'POST',
                            data: updatedFields
                        });

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
                        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
                    }
                } else {
                    this.loading = false;
                    this.close();
                    this.showAlert("success", "Debe completar los datos del tipo de pasaje.", 3000);
                }
            } else {
                this.valid = false;
                const fieldsToUpdate = ['name', 'description', 'active'];
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
                            endpoint: 'ticket-type',
                            method: 'PUT',
                            data: updatedFields
                        });

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
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
            });
        },
        async deleteItemConfirm() {
            this.loading = true;
            try {
                let request = {
                    id: this.editedItem.id
                };
                const result = await handleRequest({
                    endpoint: 'ticket-type-destroy',
                    method: 'POST',
                    data: request
                });

                if (result.success) {
                    this.showAlert("success", result.message, 3000);
                    this.initialize();
                } else {
                    this.showAlert("warning", result.message, 3000);
                }
            } catch (error) {
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

<style scoped>
.avatar-border {
    border: 2px solid #000;
}
.custom-switch {
  transform: scale(1);
  margin-left: 8px;
}
</style>