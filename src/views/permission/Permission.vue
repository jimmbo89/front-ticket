<template>
  <div class="permissions-page">
    <v-snackbar
      v-model="snackbar"
      location="right top"
      :timeout="sb_timeout"
      :color="sb_type"
      elevation="10"
      class="busgo-snackbar"
    >
      <div class="d-flex align-center ga-3">
        <v-icon :icon="sb_icon" size="22" />
        <div>
          <div class="snackbar-title">{{ sb_title }}</div>
          <div class="snackbar-message">{{ sb_message }}</div>
        </div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><v-icon size="21">mdi-shield-key-outline</v-icon></div>

        <div>
          <h1 class="page-title">Permisos</h1>
          <p class="page-subtitle">Gestiona los permisos disponibles en el sistema</p>
        </div>
      </div>

      <v-btn
        class="add-button"
        prepend-icon="mdi-plus"
        elevation="0"
        @click="showAdd"
      >
        Agregar permiso
      </v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-key-variant</v-icon></div>
            <div><div class="summary-value">{{ permisions.length }}</div><div class="summary-label">Total de permisos</div></div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--green"><v-icon size="19">mdi-view-module-outline</v-icon></div>
            <div><div class="summary-value">{{ moduleCount }}</div><div class="summary-label">Módulos registrados</div></div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--slate"><v-icon size="19">mdi-shield-check-outline</v-icon></div>
            <div><div class="summary-value">{{ describedPermissions }}</div><div class="summary-label">Con descripción</div></div>
          </div>
        </v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div>
            <div class="section-title">Listado de permisos</div>
            <div class="section-subtitle">{{ registeredCountText }}</div>
          </div>

          <v-text-field
            v-model="search"
            class="search-field"
            density="compact"
            placeholder="Buscar permiso..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
          />
        </div>
        <v-divider />

        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="permisions"
          :search="search"
          :loading="loading"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay permisos disponibles"
          loading-text="Cargando permisos..."
          class="permissions-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>

          <template #item.name="{ item }">
            <div class="permission-name-cell">
              <div class="permission-avatar"><v-icon size="17">mdi-key-variant</v-icon></div>
              <span class="permission-name">{{ item.name || 'Sin nombre' }}</span>
            </div>
          </template>

          <template #item.module="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-view-module-outline"
              class="module-chip"
            >
              {{ item.module || 'Sin módulo' }}
            </v-chip>
          </template>

          <template #item.description="{ item }">
            <span class="permission-description">
              {{ item.description || 'Sin descripción' }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="table-actions">
              <v-tooltip text="Editar permiso" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    class="action-button action-button--edit"
                    @click="editItem(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="Eliminar permiso" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    class="action-button action-button--delete"
                    @click="deleteItem(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-avatar size="58" rounded="xl" class="empty-icon">
                <v-icon size="29">mdi-shield-search-outline</v-icon>
              </v-avatar>
              <div class="empty-title">No se encontraron permisos</div>
              <div class="empty-text">Intenta cambiar la búsqueda o agrega uno nuevo.</div>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Los permisos determinan las acciones disponibles para cada rol.</div>
      </v-card>
    </v-container>

    <!-- Diálogo interno: crear o editar -->
    <v-dialog v-model="dialog" max-width="620" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading">
              <div class="dialog-icon">
                <v-icon size="23">
                  {{ editedIndex === -1 ? 'mdi-key-plus' : 'mdi-key-change' }}
                </v-icon>
              </div>

              <div>
                <h2 class="dialog-title">{{ formTitle }}</h2>
                <p class="dialog-subtitle">
                  {{ editedIndex === -1
                    ? 'Crea un permiso para controlar el acceso a una función.'
                    : 'Actualiza la información del permiso seleccionado.' }}
                </p>
              </div>
            </div>

            <v-btn
              icon="mdi-close"
              variant="text"
              color="#64748b"
              aria-label="Cerrar"
              @click="close"
            />
          </div>

          <v-divider />

          <v-card-text class="dialog-body">
            <div class="section-label">Información del permiso</div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.name"
                  label="Nombre del permiso"
                  placeholder="Ej. Crear venta"
                  prepend-inner-icon="mdi-tag-outline"
                  variant="outlined"
                  density="comfortable"
                  :rules="nameRules"
                  counter="50"
                  autofocus
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.module"
                  label="Módulo"
                  placeholder="Ej. Ventas"
                  prepend-inner-icon="mdi-view-module-outline"
                  variant="outlined"
                  density="comfortable"
                  :rules="moduleRules"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model.trim="editedItem.description"
                  label="Descripción"
                  placeholder="Describe qué acción habilita este permiso"
                  prepend-inner-icon="mdi-text-box-outline"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  :rules="descriptionRules"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <v-card-actions class="dialog-actions">
            <v-btn class="cancel-button" variant="text" @click="close">
              Cancelar
            </v-btn>
            <v-btn
              class="save-button"
              type="submit"
              prepend-icon="mdi-check"
              :loading="loading"
              :disabled="!valid || loading"
              elevation="0"
            >
              {{ editedIndex === -1 ? 'Crear permiso' : 'Guardar cambios' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Diálogo interno: confirmar eliminación -->
    <v-dialog v-model="dialogDelete" max-width="480" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-content">
          <div class="delete-icon">
            <v-icon size="29">mdi-delete-alert-outline</v-icon>
          </div>

          <h2 class="delete-title">Eliminar permiso</h2>
          <p class="delete-message">
            ¿Deseas eliminar el permiso
            <strong>“{{ selectedPermissionName }}”</strong>?
          </p>
        </div>

        <v-card-actions class="delete-actions">
          <v-btn class="cancel-button" variant="text" @click="closeDelete">
            Cancelar
          </v-btn>
          <v-btn
            class="delete-button"
            prepend-icon="mdi-delete-outline"
            :loading="loading"
            :disabled="loading"
            elevation="0"
            @click="deleteItemConfirm"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "PermissionsView",

  data: () => ({
    snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    valid: false,
    loading: false,
    dialog: false,
    dialogDelete: false,
    permisions: [],
    editedIndex: -1,
    search: "",
    page: 1,
    itemsPerPage: 10,
    headers: [
      { title: "Nombre", key: "name", width: "26%" },
      { title: "Módulo", key: "module", width: "22%" },
      { title: "Descripción", key: "description", width: "38%" },
      { title: "Acciones", key: "actions", sortable: false, align: "end", width: "14%" },
    ],
    editedItem: {
      id: "",
      name: "",
      description: "",
      module: "",
    },
    defaultItem: {
      id: "",
      name: "",
      description: "",
      module: "",
    },
    originalItem: {
      id: "",
      name: "",
      description: "",
      module: "",
    },
    nameRules: [
      (v) => !!v || "El nombre es requerido",
      (v) => (v && v.length >= 3) || "Debe tener al menos 3 caracteres",
      (v) => (v && v.length <= 50) || "No puede superar los 50 caracteres",
    ],
    moduleRules: [(v) => !!v || "El módulo es requerido"],
    descriptionRules: [(v) => !!v || "La descripción es requerida"],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar permiso" : "Editar permiso";
    },

    selectedPermissionName() {
      return this.editedItem.name || "seleccionado";
    },

    moduleCount() {
      return new Set(
        this.permisions
          .map((permission) => String(permission.module || "").trim().toLowerCase())
          .filter(Boolean)
      ).size;
    },

    describedPermissions() {
      return this.permisions.filter((permission) =>
        String(permission.description || "").trim()
      ).length;
    },

    registeredCountText() {
      return this.permisions.length === 1
        ? "1 permiso registrado"
        : `${this.permisions.length} permisos registrados`;
    },
  },

  watch: {
    search() {
      this.page = 1;
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
    unwrapItem(item) {
      return item?.raw ?? item ?? {};
    },

    showAdd() {
      this.resetForm();
      this.editedIndex = -1;
      this.dialog = true;
    },

    resetForm() {
      this.editedItem = { ...this.defaultItem };
      this.originalItem = { ...this.defaultItem };
      this.valid = false;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.resetForm();
        this.editedIndex = -1;
      });
    },

    async initialize() {
      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "permission",
          method: "GET",
        });

        this.permisions = result.success
          ? (result.data?.permissions ?? [])
          : [];

        const pageCount = Math.max(
          1,
          Math.ceil(this.permisions.length / this.itemsPerPage)
        );
        if (this.page > pageCount) this.page = pageCount;
      } catch (error) {
        this.permisions = [];
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al cargar los permisos.",
          3000
        );
      } finally {
        this.loading = false;
      }
    },

    async save() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;

      const creating = this.editedIndex === -1;
      const fields = ["name", "module", "description"];
      const updatedFields = fields.reduce((payload, key) => {
        if (creating || this.editedItem[key] !== this.originalItem[key]) {
          payload[key] = this.editedItem[key];
        }
        return payload;
      }, {});

      if (!creating && Object.keys(updatedFields).length === 0) {
        this.showAlert("warning", "No se realizaron cambios.", 3000);
        return;
      }

      if (!creating) updatedFields.id = this.editedItem.id;

      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "permission",
          method: creating ? "POST" : "PUT",
          data: updatedFields,
        });

        if (result.success) {
          this.showAlert(
            "success",
            result.message || (creating
              ? "Permiso creado correctamente."
              : "Permiso actualizado correctamente."),
            3000
          );
          this.dialog = false;
          await this.initialize();
          this.resetForm();
          this.editedIndex = -1;
        } else {
          this.showAlert("warning", result.message || "No fue posible guardar el permiso.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al guardar el permiso.", 3000);
      } finally {
        this.loading = false;
      }
    },

    editItem(item) {
      const permission = this.unwrapItem(item);
      this.editedIndex = this.permisions.findIndex(
        (current) => current.id === permission.id
      );
      this.originalItem = { ...permission };
      this.editedItem = { ...permission };
      this.dialog = true;
    },

    deleteItem(item) {
      const permission = this.unwrapItem(item);
      this.editedItem = { ...this.defaultItem, ...permission };
      this.dialogDelete = true;
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
      });
    },

    async deleteItemConfirm() {
      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "permission-destroy",
          method: "POST",
          data: { id: this.editedItem.id },
        });

        if (result.success) {
          this.showAlert(
            "success",
            result.message || "Permiso eliminado correctamente.",
            3000
          );
          this.dialogDelete = false;
          await this.initialize();
        } else {
          this.showAlert("warning", result.message || "No fue posible eliminar el permiso.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al eliminar el permiso.", 3000);
      } finally {
        this.loading = false;
        if (!this.dialogDelete) this.editedItem = { ...this.defaultItem };
      }
    },

    showAlert(type, message, timeout = 3000) {
      const alerts = {
        success: { title: "Éxito", icon: "mdi-check-circle" },
        error: { title: "Error", icon: "mdi-alert-circle" },
        warning: { title: "Advertencia", icon: "mdi-alert" },
      };
      const alert = alerts[type] || alerts.warning;

      this.sb_type = type;
      this.sb_title = alert.title;
      this.sb_icon = alert.icon;
      this.sb_message = message;
      this.sb_timeout = timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.permissions-page {
  --primary: #2454d6;
  --primary-light: #3266e4;
  --deep: #0e1f46;
  --cyan: #35b8e8;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e8edf5;
  min-height: 100%;
  padding: 24px;
  background: #f6f8fb;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1500px;
  margin: 0 auto 20px;
  padding: 20px 22px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fff;
}

.page-heading,
.dialog-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-icon,
.dialog-icon {
  color: #fff;
  background: linear-gradient(135deg, var(--primary), var(--cyan));
  box-shadow: 0 10px 22px rgba(36, 84, 214, 0.2);
}

.page-title {
  margin: 0;
  color: var(--text);
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.page-subtitle,
.card-subtitle,
.dialog-subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.91rem;
  font-weight: 500;
}

.primary-action,
.save-btn {
  min-height: 42px;
  padding-inline: 18px;
  border-radius: 11px;
  color: #fff !important;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  box-shadow: 0 9px 18px rgba(36, 84, 214, 0.2) !important;
}

.page-container {
  max-width: 1500px;
  padding: 0;
}

.content-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fff;
}

.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 21px 22px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  margin: 0;
  color: var(--text);
  font-size: 1.08rem;
  font-weight: 800;
}

.search-field {
  flex: 0 1 330px;
}

.search-field :deep(.v-field) {
  border-radius: 11px;
  color: var(--text);
  background: #fbfcfe;
}

.permissions-table {
  color: var(--text);
}

.permissions-table :deep(th) {
  height: 48px !important;
  color: #475569 !important;
  font-size: 0.75rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.045em !important;
  text-transform: uppercase;
  background: #f8fafc !important;
}

.permissions-table :deep(td) {
  height: 68px !important;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 500;
  border-color: #eef2f7 !important;
}

.permissions-table :deep(tbody tr:hover) {
  background: #f8faff !important;
}

.permissions-table :deep(.v-data-table-footer) {
  min-height: 62px;
  padding: 8px 18px;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  border-top: 1px solid var(--border);
}

.permission-name-cell,
.table-actions {
  display: flex;
  align-items: center;
}

.permission-name-cell {
  gap: 12px;
}

.permission-icon {
  flex: 0 0 auto;
  color: var(--primary);
  background: #edf3ff;
}

.permission-name {
  color: #172033;
  font-weight: 750;
}

.module-chip {
  font-weight: 700;
}

.permission-description {
  display: -webkit-box;
  overflow: hidden;
  color: #526079;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.table-actions {
  justify-content: flex-end;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 14px;
  color: var(--primary);
  background: #edf3ff;
}

.empty-title {
  color: var(--text);
  font-size: 1rem;
  font-weight: 800;
}

.empty-text {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.87rem;
}

.busgo-snackbar {
  border-radius: 12px;
}

.snackbar-title {
  font-weight: 800;
}

.snackbar-message {
  font-size: 0.82rem;
}

/* Los diálogos son teletransportados fuera de .permissions-page. */
.form-dialog,
.delete-dialog {
  overflow: hidden;
  border: 1px solid #dce4ef;
  border-radius: 20px !important;
  color: #0f172a;
  background: #fff;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
}

.dialog-icon {
  flex: 0 0 auto;
  background: linear-gradient(135deg, #2454d6, #35b8e8);
}

.dialog-title,
.delete-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.dialog-subtitle {
  color: #64748b;
}

.dialog-body {
  padding: 24px !important;
}

.section-label {
  margin-bottom: 16px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.form-dialog :deep(.v-label) {
  color: #53627a;
  font-size: 0.92rem;
  font-weight: 650;
  opacity: 1;
}

.form-dialog :deep(input),
.form-dialog :deep(textarea) {
  color: #172033 !important;
  font-size: 0.95rem;
  font-weight: 600;
}

.form-dialog :deep(.v-field) {
  border-radius: 12px;
  background: #fff;
}

.form-dialog :deep(.v-field__outline) {
  color: #cfd8e6;
}

.dialog-actions,
.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 17px 24px !important;
}

.secondary-btn {
  min-height: 40px;
  padding-inline: 16px;
  border-radius: 10px;
  color: #475569 !important;
  font-weight: 750;
  letter-spacing: 0;
  text-transform: none;
}

.save-btn {
  background: linear-gradient(135deg, #2454d6, #3266e4);
}

.delete-content {
  padding: 32px 30px 22px;
  text-align: center;
}

.delete-icon {
  margin-bottom: 16px;
  color: #dc2626;
  background: #feecec;
}

.delete-text {
  margin: 12px auto 0;
  color: #475569;
  font-size: 0.98rem;
  line-height: 1.55;
}

.delete-text strong {
  color: #172033;
  font-weight: 800;
}

.delete-warning {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
}

.delete-actions {
  border-top: 1px solid #e8edf5;
}

.delete-btn {
  min-height: 42px;
  padding-inline: 18px;
  border-radius: 11px;
  color: #fff !important;
  font-weight: 750;
  letter-spacing: 0;
  text-transform: none;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 9px 18px rgba(220, 38, 38, 0.18) !important;
}

@media (max-width: 700px) {
  .permissions-page {
    padding: 14px;
  }

  .page-header,
  .card-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-action,
  .search-field {
    width: 100%;
    max-width: none;
  }

  .card-toolbar {
    padding: 18px;
  }

  .permissions-table :deep(th:nth-child(3)),
  .permissions-table :deep(td:nth-child(3)) {
    display: none;
  }

  .dialog-header {
    padding: 19px;
  }

  .dialog-body {
    padding: 20px 19px !important;
  }

  .dialog-actions,
  .delete-actions {
    padding: 15px 19px !important;
  }
}

/* Sistema visual BusGO: mismo Nivel de Roles, Tarifas y Tipos de pasajero */
.permissions-page {
  --blue: #2454d6;
  --blue-light: #3266e4;
  --blue-deep: #0e1f46;
  min-height: 100%;
  padding: 0;
  color: #1e293b;
  background: #f6f8fb;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  max-width: none;
  margin: 0;
  padding: 12px 24px;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #e8edf5;
  border-radius: 0;
}

.page-heading,
.dialog-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.page-icon,
.dialog-icon {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #fff;
  background: radial-gradient(circle at 90% 5%, rgba(53, 184, 232, .5), transparent 28px), linear-gradient(135deg, #0e1f46, #2454d6);
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(36, 84, 214, .17);
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
  font-weight: 850;
  line-height: 1.2;
}

.page-subtitle {
  margin: 3px 0 0;
  color: #526176;
  font-size: 12px;
  font-weight: 650;
}

.add-button,
.save-button {
  min-height: 40px;
  padding-inline: 18px;
  color: #fff !important;
  background: linear-gradient(100deg, #2454d6, #3266e4) !important;
  border-radius: 9px !important;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  box-shadow: 0 5px 12px rgba(36, 84, 214, .2) !important;
}

.page-content {
  max-width: none;
  padding: 18px 24px 28px;
}

.summary-row { margin-bottom: 4px; }
.summary-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 72px;
  padding: 13px 15px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, .035);
}
.summary-icon { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 9px; }
.summary-icon--blue { color: #2454d6; background: #eef3ff; }
.summary-icon--green { color: #16875a; background: #eaf8f1; }
.summary-icon--slate { color: #64748b; background: #f1f5f9; }
.summary-value { color: #0f172a; font-size: 20px; font-weight: 900; line-height: 1; }
.summary-label { margin-top: 4px; color: #526176; font-size: 11px; font-weight: 700; }

.table-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 13px !important;
  box-shadow: 0 5px 18px rgba(15, 23, 42, .04) !important;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 69px;
  padding: 12px 17px;
}

.section-title { color: #0f172a; font-size: 15px; font-weight: 850; }
.section-subtitle { margin-top: 3px; color: #64748b; font-size: 11px; font-weight: 650; }
.search-field { flex: 0 1 300px; }
.search-field :deep(.v-field) { border-radius: 9px; font-size: 12px; background: #fff; }
.search-field :deep(.v-field__outline) { color: #dce3ed; }

.permissions-table { color: #334155; background: transparent; }
.permissions-table :deep(thead th) {
  height: 40px !important;
  color: #475569 !important;
  font-size: 10.5px !important;
  font-weight: 850 !important;
  letter-spacing: .04em !important;
  text-transform: uppercase;
  background: #f8fafc !important;
  border-bottom: 1px solid #e8edf5 !important;
}
.permissions-table :deep(tbody td) {
  height: 58px !important;
  color: #334155;
  font-size: 12px;
  border-bottom: 1px solid #eef2f6 !important;
}
.permissions-table :deep(tbody tr:hover) { background: #f8faff !important; }
.permissions-table :deep(.v-data-table-footer) {
  min-height: 52px;
  padding: 6px 16px;
  color: #475569;
  font-size: 11px;
  font-weight: 650;
  border-top: 0;
}

.permission-name-cell { display: flex; align-items: center; gap: 9px; min-width: 0; }
.permission-avatar {
  display: grid;
  flex: 0 0 31px;
  width: 31px;
  height: 31px;
  place-items: center;
  color: #2454d6;
  background: #eef3ff;
  border: 1px solid #dce6ff;
  border-radius: 8px;
}
.permission-name { overflow: hidden; color: #172033; font-size: 12.5px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.module-chip { min-height: 25px; font-size: 10.5px; font-weight: 750; border-radius: 7px; }
.permission-description { display: block; max-width: 520px; overflow: hidden; color: #475569; font-size: 11.5px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.table-actions { display: flex; justify-content: flex-end; gap: 2px; }
.action-button { border-radius: 8px !important; }
.action-button--edit { color: #2454d6 !important; }
.action-button--edit:hover { background: #eef3ff; }
.action-button--delete { color: #dc2626 !important; }
.action-button--delete:hover { background: #fff1f2; }
.table-footer-note { display: flex; align-items: center; gap: 6px; min-height: 42px; padding: 9px 16px; color: #64748b; font-size: 10.5px; font-weight: 650; border-top: 1px solid #edf1f5; }

.form-dialog,
.delete-dialog {
  overflow: hidden;
  color: #1e293b;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 14px !important;
  box-shadow: 0 22px 60px rgba(15, 23, 42, .2) !important;
}
.dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 20px; }
.dialog-title { color: #0f172a; font-size: 16px; font-weight: 850; line-height: 1.2; }
.dialog-subtitle { margin-top: 4px; color: #64748b; font-size: 11.5px; font-weight: 600; }
.dialog-body { padding: 21px 22px 13px !important; }
.section-label { margin-bottom: 13px; color: #475569; font-size: 10.5px; font-weight: 850; letter-spacing: .065em; text-transform: uppercase; }
.form-dialog :deep(.v-field) { border-radius: 9px; }
.form-dialog :deep(.v-field__outline) { color: #d6dee9; }
.form-dialog :deep(.v-label) { color: #64748b; font-size: 13px; font-weight: 650; opacity: 1; }
.form-dialog :deep(.v-field__input) { color: #1e293b; font-size: 13px; font-weight: 650; }
.dialog-actions { justify-content: flex-end; gap: 9px; padding: 14px 20px !important; }
.cancel-button { min-width: 94px; min-height: 39px; color: #475569 !important; font-size: 12.5px; font-weight: 750; letter-spacing: 0; text-transform: none; border-radius: 9px !important; }
.cancel-button:hover { background: #f1f5f9; }
.save-button { min-width: 138px; }

.delete-dialog { padding: 29px 27px 24px; text-align: center; }
.delete-content { padding: 0; }
.delete-icon { display: grid; width: 56px; height: 56px; margin: 0 auto 16px; place-items: center; color: #dc2626; background: #fff1f2; border: 1px solid #ffe0e4; border-radius: 15px; }
.delete-title { color: #0f172a; font-size: 18px; font-weight: 850; }
.delete-message { max-width: 340px; margin: 10px auto 22px; color: #64748b; font-size: 12.5px; font-weight: 600; line-height: 1.55; }
.delete-message strong { color: #334155; font-weight: 800; }
.delete-actions { display: flex; justify-content: center; gap: 9px; padding: 0 !important; border: 0; }
.delete-button { min-width: 112px; min-height: 40px; padding-inline: 18px; color: #fff !important; background: #dc2626 !important; border-radius: 9px !important; font-size: 12.5px; font-weight: 800; letter-spacing: 0; text-transform: none; box-shadow: none !important; }

@media (max-width: 959px) {
  .page-header { padding-inline: 17px; }
  .page-content { padding: 15px 17px 24px; }
  .permissions-table { overflow-x: auto; }
  .permissions-table :deep(.v-table__wrapper) { min-width: 780px; }
}

@media (max-width: 600px) {
  .permissions-page { padding: 0; }
  .page-header { align-items: flex-start; flex-direction: row; padding: 11px 12px; }
  .page-subtitle { max-width: 210px; }
  .add-button { width: auto; min-width: 42px !important; padding-inline: 10px !important; }
  .add-button :deep(.v-btn__content) { font-size: 0; }
  .add-button :deep(.v-icon) { margin: 0 !important; }
  .page-content { padding: 11px 12px 20px; }
  .table-toolbar { align-items: stretch; flex-direction: column; gap: 10px; }
  .search-field { flex-basis: auto; width: 100%; }
  .dialog-header { padding: 14px; }
  .dialog-body { padding: 17px 14px 10px !important; }
  .dialog-actions { padding-inline: 13px !important; }
}
</style>
