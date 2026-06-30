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
      <v-icon>mdi-devices</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Dispositivos</div>
      <div class="busgo-page-subtitle">Gestionar dispositivos</div>
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
      Agregar Dispositivo
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">

  <div class="busgo-card-info">

    <div class="busgo-card-title">
      Listado de dispositivos
    </div>

    <div class="busgo-card-subtitle">
      Gestiona terminales, equipos móviles y dispositivos asociados a sucursales.
    </div>

  </div>

  <div class="busgo-card-filters">

    <v-autocomplete
      v-if="mostrarFila"
      v-model="branch_id"
      :items="branches"
      item-title="name"
      item-value="id"
      density="compact"
      variant="outlined"
      prepend-inner-icon="mdi-store"
      placeholder="Sucursal"
      hide-details
      class="busgo-filter busgo-filter-branch"
      @update:modelValue="initialize"
    >

      <template #item="{ props, item }">

        <v-list-item
          v-bind="props"
          :prepend-avatar="`${$axios.defaults.baseURL}images/${item.raw.image}`"
          :title="item.raw.name"
        />

      </template>

    </v-autocomplete>


    <v-text-field
      v-model="search"
      density="compact"
      placeholder="Buscar dispositivo..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      class="busgo-filter busgo-filter-search"
    />

  </div>

</div>

      <v-data-table
        :headers="headers"
        :items="devices"
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
            <div class="device-col-name">Nombre</div>
            <div class="device-col-mac">MAC</div>
            <div class="device-col-serial">Serie</div>
            <div class="device-col-android">Android</div>
            <div class="device-col-acquisition">Adquirido</div>
            <div class="device-col-maintenance">Mantención</div>
            <div class="device-col-status">Estado</div>
            <div class="device-col-notes">Descripción</div>
            <div class="device-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row">
                <div class="device-col-name busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`"
                      cover
                    />
                  </v-avatar>

                  <div class="busgo-name">
                    {{ slotProps.item.name }}
                  </div>
                </div>

                <div class="device-col-mac busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.mac }}
                  </span>
                </div>

                <div class="device-col-serial busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.serial }}
                  </span>
                </div>

                <div class="device-col-android busgo-meta">
                  <v-icon size="16" color="green">mdi-android</v-icon>
                  <span class="text-truncate">
                    {{ slotProps.item.version }}
                  </span>
                </div>

                <div class="device-col-acquisition busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.acquisition }}
                  </span>
                </div>

                <div class="device-col-maintenance busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.maintenance }}
                  </span>
                </div>

                <div class="device-col-status">
                  <v-chip
                    size="small"
                    :color="
                      slotProps.item.status === 1
                        ? paleteColors.active
                        : paleteColors.inactive
                    "
                    :text-color="paleteColors.white"
                  >
                    {{ slotProps.item.status === 1 ? "Activo" : "Inactivo" }}
                  </v-chip>
                </div>

                <div class="device-col-notes busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.notes }}
                  </span>
                </div>

                <div class="device-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar Dispositivo"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar Dispositivo"
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
                <v-autocomplete
                  v-if="mostrarFila"
                  v-model="editedItem.branch_id"
                  :items="branches"
                  :no-data-text="'No hay datos disponibles'"
                  label="Sucursal"
                  prepend-icon="mdi-store-outline"
                  item-title="name"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                  :disabled="editedIndex !== -1"
                >
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.name"
                    />
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.name"
                  clearable
                  label="Nombre"
                  prepend-icon="mdi-devices"
                  variant="underlined"
                  :rules="nameRules"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.mac"
                  clearable
                  label="Mac"
                  prepend-icon="mdi-lan"
                  variant="underlined"
                  :rules="macRules"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.serial"
                  clearable
                  label="Serie"
                  prepend-icon="mdi-barcode"
                  variant="underlined"
                  :rules="serialRules"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="editedItem.status"
                  :true-value="1"
                  :false-value="0"
                  :color="paleteColors.active"
                  hide-details
                  inset
                  class="custom-switch"
                >
                  <template #label>
                    <span
                      class="text-body-1"
                      :style="{
                        color: editedItem.status
                          ? paleteColors.active
                          : paleteColors.grey
                      }"
                    >
                      {{ editedItem.status ? "Activo" : "Inactivo" }}
                    </span>
                  </template>
                </v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :modelValue="dateFormatted"
                      variant="underlined"
                      prepend-icon="mdi-calendar"
                      label="Fecha de Adquisición"
                    />
                  </template>

                  <v-locale-provider locale="es">
                    <v-date-picker
                      header="Calendario"
                      title="Seleccione la fecha"
                      :color="paleteColors.primary"
                      :modelValue="input"
                      @update:model-value="updateDate"
                      format="yyyy-MM-dd"
                      :max="dateFormatted2"
                    />
                  </v-locale-provider>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-menu
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :modelValue="dateFormatted2"
                      variant="underlined"
                      prepend-icon="mdi-calendar"
                      label="Fecha de Mantenimiento"
                    />
                  </template>

                  <v-locale-provider locale="es">
                    <v-date-picker
                      header="Calendario"
                      title="Seleccione la fecha"
                      :color="paleteColors.primary"
                      :modelValue="input2"
                      format="yyyy-MM-dd"
                      :min="dateFormatted"
                      @update:model-value="updateDate1"
                    />
                  </v-locale-provider>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.version"
                  label="Versión de Android"
                  prepend-icon="mdi-android"
                  variant="underlined"
                  :rules="androidVersionRules"
                  clearable
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="12">
                <v-textarea
                  v-model="editedItem.notes"
                  clearable
                  label="Descripción"
                  prepend-icon="mdi-note"
                  variant="underlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-file-input
                  clearable
                  v-model="file"
                  ref="fileInput"
                  label="Imagen del Dispositivo"
                  variant="underlined"
                  density="compact"
                  name="file"
                  accept=".png, .jpg, .jpeg"
                  @change="onFileSelected"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img
                    v-if="imagenDisponible()"
                    :src="imgedit"
                    height="120"
                    width="210"
                  />
                </v-card>
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
            @click="save"
            :disabled="!valid"
            :loading="loading"
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
          Eliminar Dispositivo
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el dispositivo seleccionado?
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
          @click="deleteItemConfirm"
        >
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
    permissions: '',
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
    serialRules: [
      (v) => !!v || "El número de serie es requerido", // Verifica que el campo no esté vacío
      (v) =>
        /^[a-zA-Z0-9]{8,16}$/.test(v) ||
        "El número de serie debe ser alfanumérico y tener entre 8 y 16 caracteres", // Valida que sea alfanumérico y tenga la longitud correcta
    ],
    androidVersionRules: [
  (v) => {
    // Permitir vacío o solo espacios
    if (!v || v.trim() === '') return true;
    // Validar formato si hay valor
    return /^\d{1,2}(\.\d{1,2})?$/.test(v.trim()) || 
           "Formato inválido. Ejemplo: 11.0 o 12.1";
  }
],

macRules: [
  (v) => {
    // Permitir vacío o solo espacios
    if (!v || v.trim() === '') return true;
    // Validar formato MAC si hay valor
    const trimmed = v.trim();
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(trimmed) || 
           "La dirección MAC debe tener el formato correcto (ej. XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX)";
  }
]
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
  created() {
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.permissions = LocalStorageService.getItem('permissions');
    if (this.hasPermission('view_devices_company')) {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");    
      this.initialize();
    }
  },
  methods: {
    hasPermission(requiredPermissions) {
        // Si es un string, lo convertimos a array
        const perms = Array.isArray(requiredPermissions) 
          ? requiredPermissions 
          : [requiredPermissions];
        
        // Retorna true si al menos uno coincide
        return perms.some(p => this.permissions.includes(p));
      },
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
      this.close();
       this.editedItem.branch_id = 
  (this.editedItem.branch_id !== null && 
   this.editedItem.branch_id !== undefined && 
   this.editedItem.branch_id !== '') 
    ? this.editedItem.branch_id 
    : this.branch_id;
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
       if (this.branch_id === 'null') {
        this.devices = [];
        this.loading = false;
        return;
      }
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
              this.branch_id = this.editedItem.branch_id;
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

.device-col-name{
    width:20%;
    min-width:0;
}

.device-col-mac{
    width:10%;
    min-width:0;
}

.device-col-serial{
    width:10%;
    min-width:0;
}

.device-col-android{
    width:6%;
    min-width:0;
}

.device-col-acquisition{
    width:8%;
    min-width:0;
}

.device-col-maintenance{
    width:8%;
    min-width:0;
}

.device-col-status{
    width:8%;
    min-width:0;
}

.device-col-notes{
    width:20%;
    min-width:0;
}

.device-col-actions{
    width:10%;
    min-width:0;
}

.busgo-card-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:24px;

    padding:20px 24px;

}

.busgo-card-info{

    flex:1;

    min-width:240px;

}

.busgo-card-filters{

    display:flex;

    align-items:center;

    gap:12px;

    flex-wrap:wrap;

}

.busgo-filter-branch{

    width:260px;

}

.busgo-filter-search{

    width:320px;

}
</style>
