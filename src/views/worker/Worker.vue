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
 <v-card class="branch-page-header" elevation="0">
  <v-avatar :color="paleteColors.primary" class="branch-page-icon">
    <v-icon>mdi-account-group</v-icon>
  </v-avatar>

  <div class="ml-4">
    <div class="text-h6 font-weight-bold">Trabajadores</div>

    <div class="text-body-2 text-medium-emphasis">
      Gestionar trabajadores
    </div>
  </div>

  <v-spacer />

  <v-btn
    :color="paleteColors.primary"
    variant="flat"
    elevation="0"
    prepend-icon="mdi-plus"
    class="add-branch-btn"
    @click="showAdd()"
  >
    Agregar Trabajador
  </v-btn>
</v-card>

<v-container fluid class="branch-container">
  <v-card class="branch-card" elevation="0">
    <div class="branch-card-header">
      <div>
        <div class="text-subtitle-1 font-weight-bold">
          Listado de trabajadores
        </div>

        <div class="text-caption text-medium-emphasis">
          Administra usuarios, roles, datos personales y accesos del sistema.
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
        class="branch-search"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="workers"
      :search="search"
      :items-per-page-text="'Elementos por página'"
      no-data-text="No hay datos disponibles"
      :loading="loading"
      loading-text="Cargando datos..."
      :hide-default-header="true"
      class="branch-table"
    >
      <template #top>
        <div class="worker-table-head">
          <div class="worker-col-name">Nombre</div>
          <div class="worker-col-user">Usuario</div>
          <div class="worker-col-email">Correo</div>
          <div class="worker-col-phone">Teléfono</div>
          <div class="worker-col-rut">Rut</div>
          <div class="worker-col-role">Rol</div>
          <div class="worker-col-address">Dirección</div>
          <div class="worker-col-actions"></div>
        </div>
      </template>

      <template #item="slotProps">
        <tr>
          <td class="pa-0 border-0">
            <div class="worker-row">
              <div class="worker-col-name worker-name-cell">
                <v-avatar
                  size="36"
                  rounded="lg"
                  color="grey-lighten-4"
                  class="branch-avatar"
                >
                  <v-img
                    :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`"
                    cover
                  />
                </v-avatar>

                <div class="branch-name-text">
                  <span class="text-truncate">{{ slotProps.item.name }}</span>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Nombre: {{ slotProps.item.name }}
                    </span>
                  </v-tooltip>
                </div>
              </div>

              <div class="worker-col-user branch-info-cell">
                <span class="text-truncate">{{ slotProps.item.user }}</span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Usuario: {{ slotProps.item.user }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-email branch-info-cell">
                <v-icon size="16" color="primary">mdi-email-outline</v-icon>
                <span class="text-truncate">{{ slotProps.item.email }}</span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Correo: {{ slotProps.item.email }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-phone branch-info-cell">
                <v-icon size="16" color="primary">mdi-phone</v-icon>
                <span class="text-truncate">{{ slotProps.item.phone }}</span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Teléfono: {{ slotProps.item.phone }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-rut branch-info-cell">
                <span class="text-truncate">{{ slotProps.item.rut }}</span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    RUT: {{ slotProps.item.rut }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-role branch-info-cell">
                <span class="worker-role-chip">
                  {{ slotProps.item.role }}
                </span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Rol: {{ slotProps.item.role }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-address branch-info-cell">
                <v-icon size="16" color="primary">mdi-map-marker-outline</v-icon>
                <span class="text-truncate">{{ slotProps.item.address }}</span>

                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Dirección: {{ slotProps.item.address }}
                  </span>
                </v-tooltip>
              </div>

              <div class="worker-col-actions branch-actions">
                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.primary"
                  @click="editItem(slotProps.item)"
                  title="Editar Trabajador"
                >
                  <v-icon size="17">mdi-pencil</v-icon>
                </v-btn>

                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.teal"
                  @click="changePass(slotProps.item)"
                  title="Modificar contraseña"
                >
                  <v-icon size="17">mdi-lock-reset</v-icon>
                </v-btn>

                <v-btn
                  size="30"
                  icon
                  variant="tonal"
                  :color="paleteColors.error"
                  @click="deleteItem(slotProps.item)"
                  title="Eliminar Trabajador"
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
                <v-text-field v-model="editedItem.name" clearable label="Nombre" prepend-icon="mdi-account"
                  variant="underlined" :rules="nameRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.email" clearable label="Correo" prepend-icon="mdi-email"
                  variant="underlined" :rules="emailRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.user" clearable label="Usuario" prepend-icon="mdi-account-circle"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6" v-if="editedIndex===-1">
                <v-text-field v-model="editedItem.password" :type="showPassword ? 'text' : 'password'"
                 placeholder="Contraseña" prepend-icon="mdi-lock-outline" variant="underlined"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" class="mb-0" :rules="requiredRules"/>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.rut" clearable label="Rut" prepend-icon="mdi-card-account-details"
                  variant="underlined" :rules="rutRules"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.role_id"
                  :items="roles" label="Roles" prepend-icon="mdi-account-tie" item-title="name" item-value="id"
                  variant="underlined" :rules="selectRules">
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.address" clearable label="Dirección" prepend-icon="mdi-home-map-marker"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.phone" clearable label="Teléfono" prepend-icon="mdi-phone"
                  variant="underlined" :rules="mobileRules"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input clearable v-model="file" ref="fileInput" label="Avatar del trabajdor"
                  variant="underlined" density="compact" name="file" accept=".png, .jpg, .jpeg"
                  @change="onFileSelected">
                </v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img v-if="imagenDisponible()" :src="imgedit" height="120" width="210">
                </v-card>


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
        <span class="text-subtitle-2 ml-4"> Eliminar Trabajador</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el trabajador seleccionado?</v-card-text>
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

  <v-dialog v-model="dialogChangePass" max-width="400px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar color="#1976D2">
          <span class="text-subtitle-2 ml-4">Actualizar Contraseña</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <!--<v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
                density="compact" placeholder="Contraseña actual" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible = !visible" v-model="editedPass.currentPassword"></v-text-field>
              </v-col>-->
              <v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible1 ? 'text' : 'password'"
                density="compact" placeholder="Contraseña nueva" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible1 = !visible1" v-model="editedPass.newPassword" :rules="[passwordRule]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible2 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible2 ? 'text' : 'password'"
                density="compact" placeholder="Contraseña nueva" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible2 = !visible2" v-model="editedPass.newPassword1"></v-text-field>
              </v-col>
              <!-- Alerta de error si las contraseñas no coinciden -->
              <v-alert v-if="editedPass.newPassword !== editedPass.newPassword1 && editedPass.newPassword1 !== ''" type="error" dense>
                Las contraseñas no coinciden.
              </v-alert>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="closePass">Cancelar</v-btn>
          <v-btn :color="paleteColors.primary" variant="flat" :loading="loading" @click="savePass" :disabled="editedPass.newPassword !== editedPass.newPassword1 || editedItem.newPassword === ''">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
export default {
  data: () => ({
    snackbar: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 2000,
    sb_title: '',
    sb_icon: '',
    visible: false,
    visible1: false,
    visible2: false,
    paleteColors: paleteColors,
    valid: true,
    loading: false,
    mostrar: false,
    file: null,
    imgMiniatura: '',
    dialog: false,
    dialogDelete: false,
    showPassword: false,
    dialogChangePass: false,
    workers: [],
    branches: [],
    roles: [],
    data: {},
    headers: [
      //{ title: 'Sucursal', value: 'branchName', width: '20%' },
      { title: 'Nombre', value: 'name', },
      { title: 'Usuario', value: 'user', },
      { title: 'Correo', value: 'email', },
      { title: 'Teléfono', value: 'phone', },
      { title: 'Rut', value: 'rut', },
      { title: 'Rol', value: 'role', },
      { title: 'Dirección', value: 'address', },
      { title: 'Acciones', value: 'actions', sortable: false, width: '13%' },
    ],
    editedItem: {
      id: '',
      name: '',
      user: '',
      email: '',
      image: '',
      phone: '',
      password: '',
      rut: '',
      address: '',
      role_id: '',
      user_id: ''
    },
    originalItem: {
      id: '',
      name: '',
      user: '',
      email: '',
      image: '',
      phone: '',
      password: '',
      rut: '',
      address: '',
      role_id: '',
      user_id: ''
    },
    defaultItem: {
      id: '',
      name: '',
      user: '',
      email: '',
      image: '',
      phone: '',
      password: '',
      rut: '',
      address: '',
      role_id: '',
      user_id: ''
    },
    editedPass: {
      currentPassword: '',
      newPassword: '',
      newPassword1: ''
    },
    defaultPass: {
      currentPassword: '',
      newPassword: '',
      newPassword1: ''
    },
    editedIndex: -1,
    search: '',
    imageVersion: 0,
    user_id: '',
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) ||
        "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) ||
        "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    requiredRules: [(v) => !!v || "El campo es requerido"],
    mobileRules: [
      v => !!v || 'El número de teléfono es requerido',
      v => /^\+569\d{8}$/.test(v) || 'Formato de número móvil inválido. Ejemplo: +56912345678'
    ],
    rutRules: [v => !!v || 'El RUT es requerido',
    v => /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) || 'El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)'
    ],
    emailRules: [
      (v) => !!v || "El Correo Electrónico es requerido",
      (v) => /.+@.+\..+/.test(v) || "El Correo Electrónico no es válido",
    ],
    passwordRule: (value) => value && value.length >= 5 || 'La contraseña debe tener al menos 5 caracteres',
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Agregar Trabajador' : 'Editar Trabajador';
    },
    imgedit() {
      return this.imgMiniatura;
    },
  },
  mounted() {
    //this.user_id = JSON.parse(LocalStorageService.getItem('user_id'));
    this.initialize();
  },
  methods: {
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    /*async showBranches() {
      try {
        const result = await handleRequest({
          endpoint: 'branch',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          this.editedItem.branch_id = this.branches[0].id;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
        this.initialize();
      }
    },*/
    async showAdd() {
      this.close();
      const request = {
        type: 'Sistema'
      }
      try {
        const result = await handleRequest({
          endpoint: 'get-role-type',
          method: 'POST',
          data: request
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.roles = result.data?.roles || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.roles = [];
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
      this.file = null;
      this.imgMiniatura = '';
    },
    async initialize() {
      try {
        //this.data = {};
        //this.data.branch_id = this.editedItem.branch_id;
        this.loading = true;
        const result = await handleRequest({
          endpoint: 'worker',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.workers = result.data?.workers || [];
          this.imageVersion += 1;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.workers = [];
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
      //this.$refs.form.reset();
      this.loading = true;
      let closeAfterSave = false;
      if (this.editedIndex === -1) {
        this.loading = true;
        this.valid = false;
        const fieldsToUpdate = ['name', 'user', 'email', 'image', 'phone', 'rut', 'role_id', 'address', 'user_id', 'password'];

        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => {
            obj[key] = this.editedItem[key];
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.user_id = this.editedItem.user_id;
          if (this.file) {
            updatedFields.image = this.editedItem.image;
          }
          const formData = new FormData();
          for (let key in updatedFields) {
            formData.append(key, updatedFields[key]);
          }

          try {
            const result = await handleRequest({
              endpoint: 'worker',
              method: 'POST',
              data: formData
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              closeAfterSave = true;
              this.loading = false;
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            this.loading = false;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
            this.loading = false;
          }
        } else {
          this.loading = false;
          this.showAlert("success", "Debe completar los datos de producto.", 3000);
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = ['name', 'user', 'email', 'image', 'phone', 'rut', 'role_id', 'address', 'user_id'];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => {
            obj[key] = this.editedItem[key];
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          updatedFields.user_id = this.editedItem.user_id;
          if (this.file) {
            updatedFields.image = this.editedItem.image;
          }
          const formData = new FormData();
          for (let key in updatedFields) {
            formData.append(key, updatedFields[key]);
          }
          try {
            const result = await handleRequest({
              endpoint: 'worker-update',
              method: 'POST',
              data: formData
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              closeAfterSave = true;
              this.loading = false;
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
            } else {
              this.loading = false;
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            this.loading = false;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
            this.loading = false;
          }
        } else {
          this.loading = false;
          this.showAlert("success", "No se realizaron cambios.", 3000);
          closeAfterSave = true;
        }
      }

      if (closeAfterSave) {
        this.close();
      } else {
        // Mantener el formulario abierto y habilitado para corregir el error.
        this.valid = true;
      }
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
          console.error('Error al cargar la imagen', error);
          this.showAlert('error', 'Error al cargar la imagen.', 3000);
        }
      };
      const request = {
        type: 'Sistema'
      }
      try {
        const result = await handleRequest({
          endpoint: 'get-role-type',
          method: 'POST',
          data: request
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.roles = result.data?.roles || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.roles = [];
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
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },
    async deleteItemConfirm() {
      try {
        let request = {
          id: this.editedItem.id
        };
        const result = await handleRequest({
          endpoint: 'worker-destroy',
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
        this.closeDelete();
      }
    },
    changePass(item){
      this.editedPass = Object.assign({}, this.defaultPass);
      this.user_id = item.user_id;
      this.dialogChangePass = true;
    },
    closePass(){
      this.editedPass = Object.assign({}, this.defaultPass);
      this.dialogChangePass = false;
    },

    async savePass(){
      this.loading = true; // Iniciar loader
      try {
        // Preparar el payload
        this.data.id = this.user_id;
        this.data.currentPassword = this.editedPass.currentPassword;
        this.data.newPassword = this.editedPass.newPassword;

        // Petición al servidor utilizando handleRequest
        const result = await handleRequest({
          endpoint: 'update-password',
          method: 'POST',
          data: this.data
        });

        if (result.success) {
          // Manejo en caso de éxito
          this.showAlert('success', 'Contraseña actualizada correctamente', 3000);
          // Reiniciar el formulario
          this.editedPass = Object.assign({}, this.defaultPass);
        } else {
          // Manejo de errores definidos por la API
          this.showAlert('warning', result.details || 'Error inesperado', 3000);
        }
      } catch (error) {
        // Manejo de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al iniciar sesión.', 3000);
      } finally {
        this.loading = false; // Detener el loader
        this.dialogChangePass = false;
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
      if (this.imgedit !== undefined && this.imgedit !== '') {
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
        this.showAlert('warning', 'El archivo de imagen debe ser de máximo 500 KB', 3000);
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
      }
      reader.readAsDataURL(file);
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


.worker-table-head {
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

.worker-row {
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

.worker-row:hover {
  background: #f8fafc;
  border-color: #dbeafe;
}

.worker-col-name {
  width: 18%;
  min-width: 0;
}

.worker-col-user {
  width: 11%;
  min-width: 0;
}

.worker-col-email {
  width: 18%;
  min-width: 0;
}

.worker-col-phone {
  width: 11%;
  min-width: 0;
}

.worker-col-rut {
  width: 10%;
  min-width: 0;
}

.worker-col-role {
  width: 10%;
  min-width: 0;
}

.worker-col-address {
  width: 14%;
  min-width: 0;
}

.worker-col-actions {
  width: 8%;
  min-width: 0;
}

.worker-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.worker-name-cell > .branch-avatar {
  flex: 0 0 auto;
}

.branch-name-text {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.branch-name-text .text-truncate {
  display: block;
  width: 100%;
}

.branch-info-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  color: #374151;
}

.branch-info-cell > .v-icon {
  flex: 0 0 auto;
}

.branch-info-cell .text-truncate,
.worker-role-chip {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-info-cell .text-truncate {
  display: block;
  flex: 1 1 0;
  width: 0;
}

.worker-role-chip {
  max-width: 100%;
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
