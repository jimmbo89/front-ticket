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
      <v-icon cover>mdi-devices</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Dispositivos</div>
      <div class="text-body-2 text-grey">Gestionar Dispositivos</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Agregar Dispositivo
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%;">
    <!--<v-card elevation="6" class="mx-2">
      <v-card-text>
      <v-row>
                    <v-container fluid>
                        <v-cols cols="12" md="12">
                            <v-row v-if="mostrarFila" dense>
                                <v-col cols="12" md="3">
                                    <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id"
                                        v-if="mostrarFila" :items="branches" label="Seleccione una Sucursal"
                                        prepend-inner-icon="mdi-store" item-title="name" item-value="id"
                                        variant="underlined" :rules="selectRules" density="compact">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props"
                                                :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable">
                                        <v-icon>mdi-magnify</v-icon></v-btn>
                                </v-col>
                            </v-row>
                        </v-cols>
                    </v-container>
                </v-row>
               <v-row dense>
                    <v-col cols="12">
        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>
        <v-data-table :headers="headers" :search="search" :items="devices" class="elevation-1"
          style="max-height: 68vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
          <template v-slot:item.actions="{ item }">
            <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary" variant="tonal"
              elevation="1" title="Editar Dispositivo"></v-btn>
            <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error" variant="tonal"
              elevation="1" title="Eliminar Dispositivo"></v-btn>
          </template>
          <template v-slot:item.name="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.image}?t=${Date.now()}`" alt="image"></v-img>
            </v-avatar>
            {{ item.name }}
          </template>
          <template v-slot:item.branchName="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.branchImage}?t=${Date.now()}`"
                alt="image"></v-img>
            </v-avatar>
            {{ item.companyName }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 1 ? paleteColors.active : paleteColors.inactive" :text-color="paleteColors.white">
                            {{ item.status === 1 ? "Activo" : "Inactivo" }}
                        </v-chip>
          </template>
        </v-data-table>
        </v-col>
        </v-row>
      </v-card-text>
    </v-card>-->
    <v-card flat>
      <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-subtitle-1 font-weight-bold">Listado de dispositivos</div>

        <!-- Spacer (solo visible en md+) -->
        <v-spacer class="d-none d-md-block"></v-spacer>

        <!-- Grupo: Autocomplete + Botón buscar -->
        <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 400px">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->
          <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id" v-if="mostrarFila"
            :items="branches" label="Seleccione una Sucursal" prepend-inner-icon="mdi-store" item-title="name"
            item-value="id" variant="solo-filled" hide-details single-line flat :rules="selectRules" density="compact">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Botón de búsqueda (actualizar datos) -->
          <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable" :disabled="!branch_id"
            class="mt-2 mt-md-0 mr-5 ml-1">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>

        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 300px">
          <v-text-field v-model="search" density="compact" label="Buscar dispositivo" prepend-inner-icon="mdi-magnify"
            variant="solo-filled" hide-details single-line flat></v-text-field>
        </div>
      </v-card-title>

      <!-- Separador -->
      <v-divider class="my-2"></v-divider>

      <!-- Tabla de dispositivos con filas personalizadas -->
      <v-data-table :headers="headers" :items="devices" :search="search" :items-per-page-text="'Elementos por página'"
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
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                MAC
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Serie
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Android
              </div>

              <div style="width: 7%; min-width: 0" class="text-left font-weight-bold">
                Adquirido
              </div>
              
              <div style="width: 8%; min-width: 0" class="text-left font-weight-bold">
                Mantenimiento
              </div>

              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Estado
              </div>

              <div style="width: 25%; min-width: 0" class="text-left font-weight-bold">
                Descripción
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
                  <!-- Nombre con avatar -->
                  <div class="d-flex align-center" style="width: 20%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img :src="`${this.$axios.defaults.baseURL}images/${
                          slotProps.item.image
                        }?t=${getCacheTimestamp()}`" cover></v-img>
                    </v-avatar>
                    <span class="text-truncate">{{ slotProps.item.name }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Nombre: {{ slotProps.item.name }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Mac -->
                  <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.mac }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Mac: {{ slotProps.item.mac }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Serie -->
                  <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.serial }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Serie: {{ slotProps.item.serial }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Android -->
                  <div style="width: 5%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.version }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Android: {{ slotProps.item.version }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Adquirido -->
                  <div style="width: 7%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.acquisition }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Adquirido: {{ slotProps.item.acquisition }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Mantenimiento -->
                  <div style="width: 8%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.maintenance }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Mantenimiento: {{ slotProps.item.maintenance }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Estado -->
                  <div style="width: 5%; min-width: 0" class="text-center">
                    <v-chip :color="
                        slotProps.item.status === 1
                          ? paleteColors.active
                          : paleteColors.inactive
                      " :text-color="paleteColors.white" size="small">
                      {{ slotProps.item.status === 1 ? "Activo" : "Inactivo" }}
                    </v-chip>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Estado: {{ slotProps.item.status }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Descripción -->
                  <div style="width: 25%; min-width: 0" class="d-inline-block text-truncate text-start">
                    <span class="text-truncate">{{ slotProps.item.notes }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Descripción: {{ slotProps.item.notes }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Acciones -->
                  <div class="d-flex gap-1" style="width: 10%; justify-content: flex-end; flex-wrap: nowrap">
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Editar Dispositivo">
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                      title="Eliminar Dispositivo">
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
  <v-dialog v-model="dialog" max-width="700px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.branch_id"
                  :items="branches" label="Sucursal" prepend-icon="mdi-store-outline" item-title="name" item-value="id"
                  variant="underlined" :rules="selectRules">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.name"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.name" clearable label="Nombre" prepend-icon="mdi-devices"
                  variant="underlined" :rules="nameRules"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.mac" clearable label="Mac" prepend-icon="mdi-lan" variant="underlined"
                  :rules="macRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.serial" clearable label="Serie" prepend-icon="mdi-barcode"
                  variant="underlined" :rules="serialRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-switch 
  v-model="editedItem.status" 
  :true-value=1 
  :false-value=0
  :color="paleteColors.active"
  hide-details 
  inset 
  class="custom-switch"
>
  <template v-slot:label>
    <span class="text-body-1"
      :style="{ color: editedItem.status ? paleteColors.active : paleteColors.grey }">
      {{ editedItem.status ? 'Activo' : 'Inactivo' }}
    </span>
  </template>
</v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                  offset-y min-width="290px">
                  <template v-slot:activator="{ props }">
                    <v-text-field v-bind="props" :modelValue="dateFormatted" variant="underlined"
                      prepend-icon="mdi-calendar" label="Fecha de Adquisición"></v-text-field>
                  </template>
                  <v-locale-provider locale="es">
                    <v-date-picker header="Calendario" title="Seleccione la fecha" :color="paleteColors.primary"
                      :modelValue="input" @update:model-value="updateDate" format="yyyy-MM-dd"
                      :max="dateFormatted2"></v-date-picker>
                  </v-locale-provider>
                </v-menu>
              </v-col>
              <!-- Segunda columna -->
              <v-col cols="12" md="4">
                <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                  offset-y min-width="290px">
                  <template v-slot:activator="{ props }">
                    <v-text-field v-bind="props" :modelValue="dateFormatted2" variant="underlined"
                      prepend-icon="mdi-calendar" label="Fecha de Mantenimiento"></v-text-field>
                  </template>
                  <v-locale-provider locale="es">
                    <v-date-picker header="Calendario" title="Seleccione la fecha" :color="paleteColors.primary"
                      :modelValue="input2" format="yyyy-MM-dd" :min="dateFormatted"
                      @update:model-value="updateDate1"></v-date-picker><!--@update:model-value="updateDate2"-->
                  </v-locale-provider>
                </v-menu>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.version" label="Versión de Android" prepend-icon="mdi-android"
                  variant="underlined" :rules="androidVersionRules" clearable></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <v-textarea v-model="editedItem.notes" clearable label="Descripción" prepend-icon="mdi-note"
                  variant="underlined"></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input clearable v-model="file" ref="fileInput" label="Imagen del Dispositivo"
                  variant="underlined" density="compact" name="file" accept=".png, .jpg, .jpeg"
                  @change="onFileSelected">
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
        <span class="text-subtitle-2 ml-4"> Eliminar Dispositivo</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el dispositivo seleccionado?</v-card-text>
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
import LocalStorageService from "@/LocalStorageService";
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
    file: null,
    imgMiniatura: "",
    menu: false,
    menu2: false,
    input: null,
    input2: null,
    dialog: false,
    dialogDelete: false,
    mostrarFila: false,
    devices: [],
    branches: [],
    role: "",
    branch_id: "",
    data: {},
    headers: [
      //{ title: 'Sucursal', value: 'branchName', width: '20%' },
      { title: "Nombre", value: "name", width: "20%" },
      { title: "Mac", value: "mac", width: "7%" },
      { title: "Serie", value: "serial", width: "7%" },
      { title: "Android", value: "version", width: "5%" },
      { title: "Adquirido", value: "acquisition", width: "7%" },
      { title: "Mantenimiento", value: "maintenance", width: "7%" },
      { title: "Estado", value: "status", width: "7%" },
      { title: "Descripción", value: "notes", width: "20%" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
    ],
    statusOptions: [
      { text: "Activo", value: 1 },
      { text: "Inactivo", value: 0 },
    ],
    editedItem: {
      id: "",
      name: "",
      mac: "",
      version: "",
      image: "",
      serial: "",
      status: 1,
      maintenance: "",
      acquisition: "",
      notes: "",
      branch_id: "",
    },
    originalItem: {
      id: "",
      name: "",
      mac: "",
      version: "",
      image: "",
      serial: "",
      status: 1,
      maintenance: "",
      acquisition: "",
      notes: "",
      branch_id: "",
    },
    defaultItem: {
      id: "",
      name: "",
      mac: "",
      version: "",
      image: "",
      serial: "",
      status: 1,
      maintenance: "",
      acquisition: "",
      notes: "",
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
    macRules: [
      (v) => !!v || "La dirección MAC es requerida", // Verifica que el campo no esté vacío
      (v) =>
        /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v) ||
        "La dirección MAC debe tener el formato correcto (ej. XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX)", // Valida el formato de la MAC
    ],
    serialRules: [
      (v) => !!v || "El número de serie es requerido", // Verifica que el campo no esté vacío
      (v) =>
        /^[a-zA-Z0-9]{8,16}$/.test(v) ||
        "El número de serie debe ser alfanumérico y tener entre 8 y 16 caracteres", // Valida que sea alfanumérico y tenga la longitud correcta
    ],
    androidVersionRules: [
      (v) => !!v || "La versión de Android es obligatoria", // Reglas básicas
      (v) => /^\d{1,2}(\.\d{1,2})?$/.test(v) || "Formato inválido. Ejemplo: 11.0 o 12.1", // Validación para formato numérico
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Dispositivo" : "Editar Dispositivo";
    },
    imgedit() {
      return this.imgMiniatura;
    },
    dateFormatted() {
      const date = this.input ? new Date(this.input) : new Date();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    dateFormatted2() {
      const date = this.input2 ? new Date(this.input2) : new Date();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    getDate() {
      return this.input ? new Date(this.input) : new Date();
    },
    getDate2() {
      return this.input2 ? new Date(this.input2) : new Date();
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    if (this.role === "Administrador") {
      this.showBranches();
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  methods: {
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    updateDate(val) {
      this.input = val;
      this.editedItem.acquisition = this.dateFormatted;
      this.menu = false;
    },
    updateDate1(val) {
      this.input2 = val;
      this.editedItem.maintenance = this.dateFormatted2;
      this.menu2 = false;
    },
    async showBranches() {
      try {
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          this.editedItem.branch_id = this.branches[0].id;
          this.branch_id = this.branches[0].id;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        (this.mostrarFila = false),
          // Captura de errores no controlados
          this.showAlert(
            "error",
            "Ocurrió un error inesperado al procesar la solicitud.",
            3000
          );
      } finally {
        (this.mostrarFila = true), (this.loading = false);
        this.initialize();
      }
    },
    async showAdd() {
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
        this.data = {};
        this.data.branch_id = this.branch_id;
        this.loading = true;
        const result = await handleRequest({
          endpoint: "device-branch",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.devices = result.data?.devices || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.devices = [];
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
      if (this.editedIndex === -1) {
        this.loading = true;
        this.valid = false;
        const fieldsToUpdate = [
          "name",
          "mac",
          "version",
          "image",
          "serial",
          "status",
          "maintenance",
          "acquisition",
          "notes",
          "branch_id",
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
          updatedFields.branch_id = this.branch_id;
          updatedFields.acquisition = this.editedItem.acquisition
            ? this.editedItem.acquisition
            : new Date();
          updatedFields.maintenance = this.editedItem.maintenance
            ? this.editedItem.maintenance
            : new Date();
          if (this.file) {
            updatedFields.image = this.editedItem.image;
          }
          const formData = new FormData();
          for (let key in updatedFields) {
            formData.append(key, updatedFields[key]);
          }

          try {
            const result = await handleRequest({
              endpoint: "device",
              method: "POST",
              data: formData,
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
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
          }
        } else {
          this.loading = false;
          this.showAlert("success", "Debe completar los datos de producto.", 3000);
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = [
          "name",
          "mac",
          "version",
          "image",
          "serial",
          "status",
          "maintenance",
          "acquisition",
          "notes",
          "branch_id",
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
          if (this.file) {
            updatedFields.image = this.editedItem.image;
          }
          const formData = new FormData();
          for (let key in updatedFields) {
            formData.append(key, updatedFields[key]);
          }
          try {
            const result = await handleRequest({
              endpoint: "device-update",
              method: "POST",
              data: formData,
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
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
          }
        } else {
          this.loading = false;
          this.showAlert("success", "No se realizaron cambios.", 3000);
        }
      }
      this.close();
    },
    async editItem(item) {
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
          endpoint: "device-destroy",
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
        this.valid = false;
        this.showAlert("warning", "El archivo de imagen debe ser de máximo 500 KB", 3000);
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
      };
      reader.readAsDataURL(file);
    },
  },
};
</script>
<style>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
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
