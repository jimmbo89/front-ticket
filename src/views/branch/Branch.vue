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
      <v-icon cover>mdi-store</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Sucursales</div>
      <div class="text-body-2 text-grey">Gestionar Sucursales</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAddBranch">
      Agregar Sucursal
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%;">
    <v-card flat>
      <!--<v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>-->
      <v-card-title class="d-flex align-center text-body-1">
        <!--<v-avatar :color="paleteColors.primary" size="40">
      <v-icon>mdi-store</v-icon>
    </v-avatar> &nbsp;-->
        Listado de sucursales

        <v-spacer></v-spacer>

        <v-text-field v-model="search" density="compact" label="Buscar Sucursal" prepend-inner-icon="mdi-magnify"
          variant="solo-filled" hide-details single-line flat></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="branches" :search="search" :items-per-page-text="'Elementos por páginas'"
        no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." class="elevation-1"
         style="max-height: 68vh; overflow-y: auto; background: transparent" :hide-default-header="true">
        <!-- Header como tarjeta (fuera de thead) -->
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
              <!-- Negocio (20%) 
              <div style="width: 20%; min-width: 0" class="text-left text-subtitle-2">
                Empresa
              </div>-->

              <!-- Nombre (20%) -->
              <div style="width: 25%; min-width: 0" class="text-left text-subtitle-2">
                Nombre
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 15%; min-width: 0" class="text-left text-subtitle-2">
                Teléfono
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 35%; min-width: 0" class="text-left text-subtitle-2">
                Dirección
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 25%; min-width: 0" class="d-flex justify-left text-subtitle-2">
                
              </div>
            </v-card-text>
          </v-card>
        </template>

        <!-- Fila personalizada (tu código actual, sin cambios) -->
        <template v-slot:item="slotProps">
          <tr>
            <td style="padding: 0; border: none">
              <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
                <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                  <!-- Negocio -->
                  <!--<div class="d-flex align-center" style="width: 20%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo">
                      <v-img
                        :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.companyImage}?t=${getCacheTimestamp()}`"
                        class="icono-concavo" cover></v-img>
                    </v-avatar>
                    <span class="text-truncate">{{ slotProps.item.companyName }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Empresa: {{ slotProps.item.companyName }}
                      </span>
                    </v-tooltip>
                  </div>-->

                  <!-- Nombre -->
                  <div class="d-flex align-center" style="width: 25%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`"
                        class="icono-concavo" cover></v-img>
                    </v-avatar>
                    <span class="text-truncate">{{ slotProps.item.name }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Nombre: {{ slotProps.item.name }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Teléfono -->
                  <div style="width: 15%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.phone }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Teléfono: {{ slotProps.item.phone }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Dirección -->
                  <div style="width: 35%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.address }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Dirección: {{ slotProps.item.address }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Acciones -->
                  <div class="d-flex gap-1" style="width: 25%; justify-content: flex-end; flex-wrap: nowrap">
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.green" @click="showAddWorker(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Agregar trabajador">
                      <v-icon size="20">mdi-account-plus</v-icon>
                    </v-btn>
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.orange" @click="showAddVehicle(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Agregar vehículo">
                      <v-icon size="20">mdi-car</v-icon>
                    </v-btn>
                    <!--<v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.route" @click="showAddRoute(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Agregar ruta">
                      <v-icon size="20">mdi-map-marker</v-icon>
                    </v-btn>-->
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Editar">
                      <v-icon size="20">mdi-pencil</v-icon>
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

  <v-dialog v-model="dialog" max-width="550px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <!--<v-col cols="12" md="12">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.company_id"
                  :items="companies" label="Negocios" prepend-icon="mdi-store-outline" item-title="name" item-value="id"
                  variant="underlined" :rules="selectRules">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.name"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>-->
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.name" clearable label="Nombre" prepend-icon="mdi-store"
                  variant="underlined" :rules="nameRules"></v-text-field>
              </v-col>
              <!--<v-col cols="12" md="12">
                <v-text-field v-model="editedItem.rut" clearable label="Rut" prepend-icon="mdi-identifier"
                  variant="underlined" :rules="rutRules"></v-text-field>
              </v-col>-->
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.phone" clearable label="Teléfono" placeholder="+56912345678"
                  prepend-icon="mdi-phone" variant="underlined" :rules="mobileRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.address" clearable label="Dirección"
                  prepend-icon="mdi-map-marker-outline" variant="underlined"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input clearable v-model="file" ref="fileInput" label="Imagen Sucursal" variant="underlined"
                  density="compact" name="file" accept=".png, .jpg, .jpeg" @change="onFileSelected">
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
        <span class="text-subtitle-2 ml-4"> Eliminar Sucursal</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la sucursal seleccionada?</v-card-text>
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

  <!-- Diálogo donde se mostrarán los detalles del trabajador -->
  <v-dialog v-model="dialogBranchWorker" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-card-text>
        <!-- Aquí pasamos el 'selectedWorker' al componente dentro del diálogo -->
        <BranchWorker :branch="selectedBranch" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" :color="paleteColors.gris" @click="closeDialogBranchWorker">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Diálogo donde se mostrarán los detalles de los vehiculos -->
  <v-dialog v-model="dialogBranchVehicle" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-card-text>
        <!-- Aquí pasamos el 'selectedWorker' al componente dentro del diálogo -->
        <BranchVehicle :branch="selectedBranch" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" :color="paleteColors.gris" @click="closeDialogBranchVehicle">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Diálogo donde se mostrarán los detalles de las rutas -->
  <v-dialog v-model="dialogBranchRoute" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-card-text>
        <!-- Aquí pasamos el 'selectedWorker' al componente dentro del diálogo -->
        <BranchRoute :branch="selectedBranch" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" :color="paleteColors.gris" @click="closeDialogBranchRoute">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import BranchWorker from "../branchworker/BranchWorker.vue";
import BranchVehicle from "../branchvehicle/BranchVehicle.vue";
import BranchRoute from "../branchroute/BranchRoute.vue";
import { paleteColors } from "@/assets/colors";
export default {
  components: {
    BranchWorker,
    BranchVehicle,
    BranchRoute,
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
    file: null,
    imgMiniatura: "",
    selectedBranch: [],
    dialog: false,
    dialogDelete: false,
    companies: [],
    branches: [],
    branch_id: '',
    permissions: '',
    data: {},
    dialogBranchWorker: null,
    dialogBranchVehicle: null,
    dialogBranchRoute: null,
    headers: [
      { title: "Negocio", key: "companyName" },
      { title: "Nombre", key: "name",},
      //{ title: "Rut", key: "rut", width: "10%" },
      { title: "Teléfono", key: "phone" },
      { title: "Dirección", key: "address" },
      { title: "Acciones", key: "actions", sortable: false,},
    ],

    editedItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
      company_id: "",
    },
    originalItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
      company_id: "",
    },
    defaultItem: {
      id: "",
      name: "",
      address: "",
      rut: "",
      image: "",
      phone: "",
      company_id: "",
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
    rutRules: [
      (v) =>
        !v ||
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) ||
        "El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Sucursal" : "Editar Sucursal";
    },
    imgedit() {
      return this.imgMiniatura;
    },
  },
  mounted() {
    this.permissions = LocalStorageService.getItem('permissions');
    this.branch_id = LocalStorageService.getItem('branch_id');
    this.initialize();
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
    async showAddBranch() {
      this.close();
      try {
        const result = await handleRequest({
          endpoint: "company",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.companies = result.data?.companies || [];
          if (
            !this.editedItem.company_id ||
            this.editedItem.company_id === 0 ||
            this.editedItem.company_id === ""
          ) {
            if (this.companies.length > 0) {
              this.editedItem.company_id = this.companies[0].id;
            }
          }
        } else {
          // Si no hay datos, asignamos un array vacío
          this.companies = [];
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al cargar las compañías.",
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
      this.file = null;
      this.imgMiniatura = "";
    },
    async initialize() {
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          if(this.hasPermission(['view_branches_company'])){            
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          }else{
            this.branches = (result.data?.branches || []).filter(branch => 
              branch.id == this.branch_id
            );
          }
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al cargar las sucursales.",
          3000
        );
      } finally {
        this.loading = false;
      }
    },
    async save() {
      this.loading = true;
      //this.$refs.form.reset();
      if (this.editedIndex === -1) {
        this.valid = false;
        this.data = {};
        this.data.name = this.editedItem.name;
        this.data.company_id = this.editedItem.company_id;
        this.data.address = this.editedItem.address;
        this.data.phone = this.editedItem.phone;
        this.data.rut = this.editedItem.rut;

        // Crear un objeto FormData
        const formData = new FormData();
        formData.append("name", this.data.name);
        formData.append("address", this.data.address);
        formData.append("phone", this.data.phone);
        formData.append("rut", this.data.rut);
        formData.append("company_id", this.data.company_id);
        if (this.file) {
          formData.append("image", this.editedItem.image);
        }

        try {
          const result = await handleRequest({
            endpoint: "branch",
            method: "POST",
            data: formData,
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
        const fieldsToUpdate = [
          "id",
          "name",
          "address",
          "rut",
          "phone",
          "image",
          "company_id",
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
              endpoint: "branch-update",
              method: "POST",
              data: formData,
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

      try {
        const result = await handleRequest({
          endpoint: "company",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.companies = result.data?.companies || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.companies = [];
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
          endpoint: "branch-destroy",
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
        this.showAlert(
          "warning",
          "El archivo de imagen debe ser de un máximo 500 KB",
          3000
        );
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
    //Asociar Profesionales
    showAddWorker(item) {
      this.selectedBranch = item; // Asignamos el trabajador seleccionado
      this.dialogBranchWorker = true; // Abrimos el diálogo
    },
    closeDialogBranchWorker() {
      this.dialogBranchWorker = false; // Cerramos el diálogo
      this.selectedBranch = [];
    },
    showAddVehicle(item) {
      this.selectedBranch = item; // Asignamos el trabajador seleccionado
      this.dialogBranchVehicle = true; // Abrimos el diálogo
    },
    closeDialogBranchVehicle() {
      this.dialogBranchVehicle = false; // Cerramos el diálogo
      this.selectedBranch = [];
    },
    showAddRoute(item) {
      this.selectedBranch = item; // Asignamos el trabajador seleccionado
      this.dialogBranchRoute = true; // Abrimos el diálogo
    },
    closeDialogBranchRoute() {
      this.dialogBranchRoute = false; // Cerramos el diálogo
      this.selectedBranch = [];
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
