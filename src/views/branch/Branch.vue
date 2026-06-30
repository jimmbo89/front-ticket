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
  <v-card class="branch-page-header"  elevation="0" >
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-store</v-icon>
    </v-avatar>

   

  <div class="ml-4">
    <div class="text-h6 font-weight-bold">Sucursales</div>
    <div class="text-body-2 text-medium-emphasis">Gestionar sucursales</div>
  </div>

  <v-spacer />

  <v-btn
    :color="paleteColors.primary"
    variant="flat"
    elevation="0"
    prepend-icon="mdi-plus"
    class="add-branch-btn"
    @click="showAddBranch"
  >
    Agregar Sucursal
  </v-btn>
</v-card>

<v-container fluid class="branch-container">
  <v-card class="branch-card" elevation="0">
    <div class="branch-card-header">
      <div>
        <div class="text-subtitle-1 font-weight-bold">
          Listado de sucursales
        </div>
        <div class="text-caption text-medium-emphasis">
          Administra la información de todas las sucursales registradas.
        </div>
      </div>

      <v-text-field
        v-model="search"
        density="compact"
        placeholder="Buscar sucursal..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        class="branch-search"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="branches"
      :search="search"
      :items-per-page-text="'Elementos por página'"
      no-data-text="No hay datos disponibles"
      :loading="loading"
      loading-text="Cargando datos..."
      class="branch-table"
      :hide-default-header="true"
    >
      <template #top>
        <div class="branch-table-head">
          <div class="branch-col-name">Nombre</div>
          <div class="branch-col-phone">Teléfono</div>
          <div class="branch-col-address">Dirección</div>
          <div class="branch-col-actions"></div>
        </div>
      </template>

      <template #item="slotProps">
        <tr>
          <td class="pa-0 border-0">
            <div class="branch-row">
              <div class="branch-col-name branch-name-cell">
                <v-avatar size="36" rounded="lg" color="grey-lighten-4" class="branch-avatar">
                  <v-img
                    :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`"
                    cover
                  />
                </v-avatar>

                <div class="branch-name-text">
                  <span>{{ slotProps.item.name }}</span>
                </div>
              </div>

              <div class="branch-col-phone branch-info-cell">
                <v-icon size="16" color="primary">mdi-phone</v-icon>
                <span class="text-truncate">{{ slotProps.item.phone }}</span>
              </div>

              <div class="branch-col-address branch-info-cell">
                <v-icon size="16" color="primary">mdi-map-marker-outline</v-icon>
                <span class="text-truncate">{{ slotProps.item.address }}</span>
              </div>

              <div class="branch-col-actions branch-actions">
                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.green"
                  @click="showAddWorker(slotProps.item)"
                  title="Agregar trabajador"
                >
                  <v-icon size="17">mdi-account-plus</v-icon>
                </v-btn>

                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.orange"
                  @click="showAddVehicle(slotProps.item)"
                  title="Agregar vehículo"
                >
                  <v-icon size="17">mdi-bus</v-icon>
                </v-btn>

                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.route"
                  @click="showAddRoute(slotProps.item)"
                  title="Agregar ruta"
                >
                  <v-icon size="17">mdi-map-marker-path</v-icon>
                </v-btn>

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

 <v-dialog v-model="dialog" max-width="620px" persistent>
  <v-form ref="form" v-model="valid" enctype="multipart/form-data">
    <v-card class="busgo-dialog-card" elevation="18">

      <!-- HEADER -->
      <div class="busgo-dialog-header">
        <div class="busgo-dialog-icon">
          <v-icon size="28">mdi-store-marker-outline</v-icon>
        </div>

        <div>
          <div class="busgo-dialog-title">
            {{ formTitle }}
          </div>
          <div class="busgo-dialog-subtitle">
            Administra la información principal de la sucursal
          </div>
        </div>

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="busgo-dialog-close"
          @click="close"
        />
      </div>

      <!-- BODY -->
      <v-card-text class="busgo-dialog-body">
        <v-row dense>

          <v-col cols="12">
            <label class="busgo-field-label">Nombre de la sucursal</label>
            <v-text-field
              v-model="editedItem.name"
              clearable
              placeholder="Ej: Terminal Puerto Montt"
              prepend-inner-icon="mdi-store-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="nameRules"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="6">
            <label class="busgo-field-label">Teléfono</label>
            <v-text-field
              v-model="editedItem.phone"
              clearable
              placeholder="+56912345678"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="mobileRules"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="6">
            <label class="busgo-field-label">Dirección</label>
            <v-text-field
              v-model="editedItem.address"
              clearable
              placeholder="Ej: Av. Principal 123"
              prepend-inner-icon="mdi-map-marker-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12">
            <div class="busgo-upload-section">
              <div class="busgo-upload-info">
                <label class="busgo-field-label">Imagen de la sucursal</label>

                <v-file-input
                  clearable
                  v-model="file"
                  ref="fileInput"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  name="file"
                  accept=".png, .jpg, .jpeg"
                  prepend-inner-icon="mdi-image-plus-outline"
                  prepend-icon=""
                  label="Seleccionar imagen"
                  hide-details="auto"
                  @change="onFileSelected"
                />
              </div>

              <div class="busgo-image-preview">
                <img
                  v-if="imagenDisponible()"
                  :src="imgedit"
                  alt="Imagen sucursal"
                />

                <div v-else class="busgo-image-empty">
                  <v-icon size="34">mdi-image-outline</v-icon>
                  <span>Sin imagen</span>
                </div>
              </div>
            </div>
          </v-col>

        </v-row>
      </v-card-text>

      <!-- ACTIONS -->
      <v-card-actions class="busgo-dialog-actions">
        <v-btn
          class="busgo-btn-cancel"
          variant="flat"
          @click="close"
        >
          Cancelar
        </v-btn>

        <v-btn
          class="busgo-btn-save"
          variant="flat"
          @click="save"
          :disabled="!valid"
          :loading="loading"
        >
          Guardar cambios
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-form>
</v-dialog>


<v-dialog v-model="dialogDelete" max-width="480px" persistent>
  <v-card class="busgo-delete-dialog" elevation="18">

    <!-- HEADER -->
    <div class="busgo-delete-header">
      <div class="busgo-delete-icon">
        <v-icon size="30">mdi-alert-outline</v-icon>
      </div>

      <div>
        <div class="busgo-delete-title">
          Eliminar Sucursal
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

    <!-- BODY -->
    <v-card-text class="busgo-delete-body">
      <div class="busgo-delete-message">
        ¿Desea eliminar la sucursal seleccionada?
      </div>

      <div class="busgo-delete-warning">
        <v-icon size="20">mdi-information-outline</v-icon>
        <span>
          Verifique que la sucursal no tenga información importante asociada antes de continuar.
        </span>
      </div>
    </v-card-text>

    <!-- ACTIONS -->
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
.branch-page-header {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.branch-page-icon {
  border-radius: 14px;
}

.add-branch-btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
}

.branch-container {
  padding: 24px;
}

.branch-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  overflow: hidden;
}

.branch-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}

.branch-search {
  max-width: 380px;
}

.branch-table {
  max-height: calc(100vh - 285px);
  overflow-y: auto;
  background: transparent;
}

.branch-table-head {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 20px;
  margin: 0 16px 6px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.branch-row {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 8px 20px;
  margin: 0 16px 6px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #ffffff;
  transition: 0.15s ease;
}

.branch-row:hover {
  background: #f8fafc;
  border-color: #dbeafe;
}

.branch-col-name {
  width: 30%;
  min-width: 0;
}

.branch-col-phone {
  width: 18%;
  min-width: 0;
}

.branch-col-address {
  width: 32%;
  min-width: 0;
}

.branch-col-actions {
  width: 20%;
  min-width: 0;
}

.branch-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.branch-avatar {
  border: 1px solid #e5e7eb;
}

.branch-name-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.branch-info-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #374151;
}

.branch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  flex-wrap: nowrap;
}

.branch-footer {
  padding: 12px 24px 18px;
  border-top: 1px solid #eef2f7;
}

.border-0 {
  border: 0 !important;
}

.branch-table::-webkit-scrollbar {
  width: 8px;
}

.branch-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}

@media (max-width: 960px) {
  .branch-card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .branch-search {
    max-width: 100%;
  }

  .branch-table-head {
    display: none;
  }

  .branch-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .branch-col-name,
  .branch-col-phone,
  .branch-col-address,
  .branch-col-actions {
    width: 100%;
  }

  .branch-actions {
    justify-content: flex-start;
  }
}

.busgo-dialog-card {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
  color: #ffffff;
}

.busgo-dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
}

.busgo-dialog-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.busgo-dialog-subtitle {
  font-size: 13px;
  opacity: 0.78;
  margin-top: 3px;
}

.busgo-dialog-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-dialog-body {
  padding: 24px !important;
  background: #f8fafc;
}

.busgo-field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 7px;
  letter-spacing: 0.02em;
}

.busgo-upload-section {
  display: grid;
  grid-template-columns: 1fr 210px;
  gap: 18px;
  align-items: end;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.busgo-upload-info {
  min-width: 0;
}

.busgo-image-preview {
  width: 210px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.busgo-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.busgo-dialog-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-btn-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 110px;
}

.busgo-btn-save {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 150px;
}

.busgo-btn-save.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
}

@media (max-width: 600px) {
  .busgo-dialog-header {
    padding: 18px;
  }

  .busgo-dialog-body {
    padding: 18px !important;
  }

  .busgo-upload-section {
    grid-template-columns: 1fr;
  }

  .busgo-image-preview {
    width: 100%;
    height: 160px;
  }

  .busgo-dialog-actions {
    padding: 16px 18px !important;
  }

  .busgo-btn-cancel,
  .busgo-btn-save {
    flex: 1;
  }
}

.busgo-delete-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-delete-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 55%, #dc2626 100%);
  color: #ffffff;
}

.busgo-delete-icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-delete-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.busgo-delete-subtitle {
  font-size: 13px;
  opacity: 0.82;
  margin-top: 3px;
}

.busgo-delete-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-delete-body {
  padding: 24px !important;
  background: #fff7f7;
}

.busgo-delete-message {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 14px;
}

.busgo-delete-warning {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #fecaca;
  color: #7f1d1d;
  font-size: 13px;
  line-height: 1.45;
}

.busgo-delete-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #fee2e2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-delete-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 110px;
}

.busgo-delete-confirm {
  background: #dc2626 !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 120px;
}

@media (max-width: 600px) {
  .busgo-delete-header {
    padding: 18px;
  }

  .busgo-delete-body {
    padding: 18px !important;
  }

  .busgo-delete-actions {
    padding: 16px 18px !important;
  }

  .busgo-delete-cancel,
  .busgo-delete-confirm {
    flex: 1;
  }
}

</style>
