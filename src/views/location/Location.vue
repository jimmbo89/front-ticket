<template>
  <div class="locations-page">
    <v-snackbar
      v-model="snackbar"
      location="right top"
      :timeout="sb_timeout"
      :color="sb_type"
      elevation="10"
      class="busgo-snackbar"
    >
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div>
          <div class="snackbar-title">{{ sb_title }}</div>
          <div class="snackbar-message">{{ sb_message }}</div>
        </div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon">
          <v-icon size="21">mdi-map-marker-multiple-outline</v-icon>
        </div>
        <div>
          <h1 class="page-title">Ubicaciones</h1>
          <p class="page-subtitle">
            Administra los lugares utilizados en rutas y operaciones
          </p>
        </div>
      </div>

      <v-btn
        class="add-button"
        prepend-icon="mdi-plus"
        elevation="0"
        @click="showAdd"
      >
        Agregar ubicación
      </v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--blue">
              <v-icon size="19">mdi-map-marker-multiple-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ locations.length }}</div>
              <div class="summary-label">Total de ubicaciones</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--green">
              <v-icon size="19">mdi-check-circle-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ activeLocations }}</div>
              <div class="summary-label">Ubicaciones activas</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--slate">
              <v-icon size="19">mdi-pause-circle-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ inactiveLocations }}</div>
              <div class="summary-label">Ubicaciones inactivas</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div>
            <div class="section-title">Listado de ubicaciones</div>
            <div class="section-subtitle">{{ registeredCountText }}</div>
          </div>

          <v-text-field
            v-model="search"
            class="search-field"
            density="compact"
            placeholder="Buscar ubicación..."
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
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="locations"
          :search="search"
          :loading="loading"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay ubicaciones disponibles"
          loading-text="Cargando ubicaciones..."
          class="locations-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>

          <template #[`item.address`]="{ item }">
            <div class="location-name-cell">
              <div class="location-avatar">
                <v-img
                  v-if="hasLocationImage(item)"
                  :src="locationImage(item)"
                  class="location-photo"
                  width="38"
                  height="38"
                  cover
                >
                  <template #error>
                    <div class="image-fallback">
                      <v-icon size="18">mdi-map-marker-outline</v-icon>
                    </div>
                  </template>
                </v-img>
                <v-icon v-else size="18">mdi-map-marker-outline</v-icon>
              </div>

              <div class="cell-copy">
                <div class="location-name">{{ item.address || "Sin dirección" }}</div>
                <div class="location-area">{{ locationArea(item) }}</div>
              </div>
            </div>
          </template>

          <template #[`item.longitude`]="{ item }">
            <span class="coordinate-value">{{ displayCoordinate(item.longitude) }}</span>
          </template>

          <template #[`item.latitude`]="{ item }">
            <span class="coordinate-value">{{ displayCoordinate(item.latitude) }}</span>
          </template>

          <template #[`item.country`]="{ item }">
            <span class="table-value">{{ item.country || "Sin país" }}</span>
          </template>

          <template #[`item.city`]="{ item }">
            <span class="table-value">{{ item.city || "Sin ciudad" }}</span>
          </template>

          <template #[`item.active`]="{ item }">
            <span
              class="status-badge"
              :class="isActive(item.active) ? 'status-badge--active' : 'status-badge--inactive'"
            >
              <span class="status-dot" />
              {{ isActive(item.active) ? "Activa" : "Inactiva" }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="action-buttons">
              <v-tooltip text="Editar ubicación" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    variant="text"
                    size="small"
                    class="action-button action-button--edit"
                    @click="editItem(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="Eliminar ubicación" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-trash-can-outline"
                    variant="text"
                    size="small"
                    class="action-button action-button--delete"
                    @click="deleteItem(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <div class="table-footer-note">
          <v-icon size="15">mdi-information-outline</v-icon>
          Las ubicaciones activas estarán disponibles para la configuración de rutas y servicios.
        </div>
      </v-card>
    </v-container>

    <!-- Diálogo interno: crear o editar -->
    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-form
        ref="form"
        v-model="valid"
        enctype="multipart/form-data"
        @submit.prevent="save"
      >
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading">
              <div class="dialog-icon">
                <v-icon class="dialog-icon-main" size="20">mdi-map-marker-outline</v-icon>
                <v-icon class="dialog-icon-action" size="11">
                  {{ editedIndex === -1 ? "mdi-plus" : "mdi-pencil" }}
                </v-icon>
              </div>

              <div>
                <div class="dialog-title">{{ formTitle }}</div>
                <div class="dialog-subtitle">
                  {{ editedIndex === -1
                    ? "Registra un nuevo lugar para la operación"
                    : "Actualiza los datos de la ubicación" }}
                </div>
              </div>
            </div>

            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="dialog-close"
              :disabled="loading"
              @click="close"
            />
          </div>

          <v-divider />

          <v-card-text class="dialog-body">
            <div class="form-section-label">Información general</div>

            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="editedItem.address"
                  label="Nombre o dirección"
                  placeholder="Ej.: Terminal de buses Puerto Montt"
                  prepend-inner-icon="mdi-map-marker-outline"
                  variant="outlined"
                  density="comfortable"
                  :rules="addressRules"
                  maxlength="250"
                  counter="250"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.country"
                  label="País"
                  placeholder="Ej.: Chile"
                  prepend-inner-icon="mdi-earth"
                  variant="outlined"
                  density="comfortable"
                  maxlength="80"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.city"
                  label="Ciudad"
                  placeholder="Ej.: Puerto Montt"
                  prepend-inner-icon="mdi-city-variant-outline"
                  variant="outlined"
                  density="comfortable"
                  maxlength="80"
                  clearable
                />
              </v-col>
            </v-row>

            <div class="form-section-label form-section-label--spaced">Coordenadas</div>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.longitude"
                  label="Longitud"
                  placeholder="Ej.: -72.9425"
                  prepend-inner-icon="mdi-longitude"
                  variant="outlined"
                  density="comfortable"
                  :rules="longitudeRules"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="editedItem.latitude"
                  label="Latitud"
                  placeholder="Ej.: -41.4693"
                  prepend-inner-icon="mdi-latitude"
                  variant="outlined"
                  density="comfortable"
                  :rules="latitudeRules"
                  clearable
                />
              </v-col>
            </v-row>

            <div class="status-control">
              <div>
                <div class="status-control-title">Estado de la ubicación</div>
                <div class="status-control-description">
                  Las ubicaciones inactivas no estarán disponibles para nuevas configuraciones.
                </div>
              </div>

              <div
                class="status-switch"
                :class="isActive(editedItem.active) ? 'is-active' : 'is-inactive'"
              >
                <span>{{ isActive(editedItem.active) ? "Activa" : "Inactiva" }}</span>
                <v-switch
                  v-model="editedItem.active"
                  :true-value="true"
                  :false-value="false"
                  color="success"
                  hide-details
                  inset
                />
              </div>
            </div>

            <div class="form-section-label form-section-label--spaced">Imagen de la ubicación</div>

            <div class="image-upload-area">
              <div class="image-preview">
                <v-img v-if="imgedit" :src="imgedit" class="preview-image" cover>
                  <template #error>
                    <div class="preview-placeholder">
                      <v-icon size="28">mdi-image-off-outline</v-icon>
                    </div>
                  </template>
                </v-img>

                <div v-else class="preview-placeholder">
                  <v-icon size="28">mdi-image-marker-outline</v-icon>
                </div>
              </div>

              <div class="upload-copy">
                <div class="upload-title">Fotografía del lugar</div>
                <div class="upload-description">
                  Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.
                </div>

                <v-file-input
                  ref="fileInput"
                  v-model="file"
                  class="file-field"
                  label="Seleccionar imagen"
                  prepend-inner-icon="mdi-upload-outline"
                  prepend-icon=""
                  variant="outlined"
                  density="compact"
                  accept=".png,.jpg,.jpeg"
                  hide-details
                  clearable
                  @change="onFileSelected"
                  @update:model-value="onFileModelUpdate"
                />
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="dialog-actions">
            <v-btn
              variant="text"
              class="cancel-button"
              :disabled="loading"
              @click="close"
            >
              Cancelar
            </v-btn>

            <v-btn
              type="submit"
              class="save-button"
              elevation="0"
              :loading="loading"
              :disabled="!valid"
            >
              {{ editedIndex === -1 ? "Crear ubicación" : "Guardar cambios" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Diálogo interno: confirmar eliminación -->
    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon">
          <v-icon size="27">mdi-trash-can-outline</v-icon>
        </div>

        <div class="delete-title">Eliminar ubicación</div>
        <div class="delete-message">
          ¿Deseas eliminar <strong>{{ editedItem.address || "esta ubicación" }}</strong>?
          Esta acción no se puede deshacer.
        </div>

        <div class="delete-actions">
          <v-btn
            variant="text"
            class="cancel-button"
            :disabled="loading"
            @click="closeDelete"
          >
            Cancelar
          </v-btn>

          <v-btn
            class="delete-button"
            elevation="0"
            :loading="loading"
            @click="deleteItemConfirm"
          >
            Eliminar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "LocationsView",

  data: () => ({
    snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    valid: false,
    loading: false,
    file: null,
    imgMiniatura: "",
    dialog: false,
    dialogDelete: false,
    locations: [],
    editedIndex: -1,
    search: "",
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    imageVersion: 0,

    headers: [
      { title: "Ubicación", key: "address", sortable: true, width: "31%" },
      { title: "Longitud", key: "longitude", sortable: true, width: "13%" },
      { title: "Latitud", key: "latitude", sortable: true, width: "13%" },
      { title: "País", key: "country", sortable: true, width: "13%" },
      { title: "Ciudad", key: "city", sortable: true, width: "14%" },
      { title: "Estado", key: "active", sortable: true, width: "10%" },
      { title: "", key: "actions", sortable: false, align: "end", width: "6%" },
    ],

    editedItem: {
      id: "",
      longitude: "",
      latitude: "",
      country: "",
      city: "",
      image: "",
      address: "",
      active: true,
    },

    defaultItem: {
      id: "",
      longitude: "",
      latitude: "",
      country: "",
      city: "",
      image: "",
      address: "",
      active: true,
    },

    originalItem: {},

    addressRules: [
      (value) => !!value || "El nombre o dirección es requerido",
      (value) => !value || value.length >= 3 || "Debe tener al menos 3 caracteres",
      (value) => !value || value.length <= 250 || "No puede superar los 250 caracteres",
    ],

    longitudeRules: [
      (value) => value === "" || value === null || value === undefined || !Number.isNaN(Number(value)) || "Ingresa una longitud válida",
      (value) => value === "" || value === null || value === undefined || (Number(value) >= -180 && Number(value) <= 180) || "La longitud debe estar entre -180 y 180",
    ],

    latitudeRules: [
      (value) => value === "" || value === null || value === undefined || !Number.isNaN(Number(value)) || "Ingresa una latitud válida",
      (value) => value === "" || value === null || value === undefined || (Number(value) >= -90 && Number(value) <= 90) || "La latitud debe estar entre -90 y 90",
    ],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar ubicación" : "Editar ubicación";
    },

    imgedit() {
      return this.imgMiniatura;
    },

    activeLocations() {
      return this.locations.filter((location) => this.isActive(location.active)).length;
    },

    inactiveLocations() {
      return this.locations.length - this.activeLocations;
    },

    registeredCountText() {
      return this.locations.length === 1
        ? "1 ubicación registrada"
        : `${this.locations.length} ubicaciones registradas`;
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
    cloneItem(item) {
      return { ...item };
    },

    unwrapItem(item) {
      return item?.raw ?? item ?? {};
    },

    isActive(value) {
      return value === true || value === 1 || value === "1";
    },

    normalizeLocation(location) {
      return {
        ...location,
        active: location.active === undefined || location.active === null
          ? true
          : this.isActive(location.active),
      };
    },

    resolveImageValue(source) {
      if (!source) return "";
      if (typeof source === "string") return source.trim();
      return String(
        source.image ??
        source.image_url ??
        source.imageUrl ??
        source.url ??
        source.path ??
        ""
      ).trim();
    },

    baseImageUrl(source) {
      const image = this.resolveImageValue(source);
      if (!image) return "";
      if (/^(https?:|data:|blob:)/i.test(image)) return image;

      const baseURL = String(this.$axios.defaults.baseURL || "");
      const cleanImage = image.replace(/^\/+/, "");

      if (cleanImage.startsWith("images/")) return `${baseURL}${cleanImage}`;
      return `${baseURL}images/${cleanImage}`;
    },

    hasLocationImage(location) {
      return Boolean(this.resolveImageValue(location));
    },

    locationImage(location) {
      const url = this.baseImageUrl(location);
      if (!url || /^(data:|blob:)/i.test(url)) return url;
      return `${url}${url.includes("?") ? "&" : "?"}v=${this.imageVersion}`;
    },

    locationArea(location) {
      const area = [location.city, location.country].filter(Boolean).join(", ");
      return area || "Sin localidad definida";
    },

    displayCoordinate(value) {
      if (value === "" || value === null || value === undefined) return "Sin dato";
      return String(value);
    },

    resetEditor() {
      this.editedItem = this.cloneItem(this.defaultItem);
      this.originalItem = this.cloneItem(this.defaultItem);
      this.editedIndex = -1;
      this.file = null;
      this.imgMiniatura = "";
      this.valid = false;
    },

    showAdd() {
      this.resetEditor();
      this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },

    close() {
      if (this.loading) return;
      this.dialog = false;
      this.$nextTick(() => {
        this.resetEditor();
        this.$refs.form?.resetValidation();
      });
    },

    async initialize() {
      this.loading = true;

      try {
        const result = await handleRequest({
          endpoint: "location",
          method: "GET",
        });

        if (result.success) {
          const rawLocations = Array.isArray(result.data?.locations)
            ? result.data.locations
            : Object.values(result.data?.locations || {});

          this.locations = rawLocations.map((location) => this.normalizeLocation(location));
          this.imageVersion += 1;

          const pageCount = Math.max(1, Math.ceil(this.locations.length / this.itemsPerPage));
          if (this.page > pageCount) this.page = pageCount;
        } else {
          this.locations = [];
          this.showAlert("warning", result.message || "No fue posible cargar las ubicaciones.", 3000);
        }
      } catch (error) {
        this.locations = [];
        this.showAlert("error", "Ocurrió un error al cargar las ubicaciones.", 3000);
      } finally {
        this.loading = false;
      }
    },

    getChangedFields(creating) {
      const fields = [
        "address",
        "longitude",
        "latitude",
        "country",
        "city",
        "active",
      ];

      const payload = fields.reduce((changes, key) => {
        if (creating || this.editedItem[key] !== this.originalItem[key]) {
          changes[key] = this.editedItem[key];
        }
        return changes;
      }, {});

      if (this.file) payload.image = this.file;
      return payload;
    },

    async save() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;

      const creating = this.editedIndex === -1;
      const payload = this.getChangedFields(creating);

      if (!creating && Object.keys(payload).length === 0) {
        this.showAlert("warning", "No se realizaron cambios.", 3000);
        return;
      }

      if (!creating) payload.id = this.editedItem.id;

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      this.loading = true;

      try {
        const result = await handleRequest({
          endpoint: creating ? "location" : "location-update",
          method: "POST",
          data: formData,
        });

        if (result.success) {
          this.dialog = false;
          this.showAlert(
            "success",
            result.message || (creating
              ? "Ubicación creada correctamente."
              : "Ubicación actualizada correctamente."),
            3000
          );
          await this.initialize();
          this.resetEditor();
        } else {
          this.showAlert("warning", result.message || "No fue posible guardar la ubicación.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al guardar la ubicación.", 3000);
      } finally {
        this.loading = false;
      }
    },

    editItem(item) {
      const location = this.unwrapItem(item);
      this.editedIndex = this.locations.findIndex(
        (current) => String(current.id) === String(location.id)
      );
      this.originalItem = this.cloneItem(location);
      this.editedItem = this.cloneItem(location);
      this.file = null;
      this.imgMiniatura = this.baseImageUrl(location);
      this.dialog = true;
      this.$nextTick(() => this.$refs.form?.resetValidation());
    },

    deleteItem(item) {
      const location = this.unwrapItem(item);
      this.editedItem = {
        ...this.cloneItem(this.defaultItem),
        ...this.cloneItem(location),
      };
      this.dialogDelete = true;
    },

    closeDelete() {
      if (this.loading) return;
      this.dialogDelete = false;
      this.editedItem = this.cloneItem(this.defaultItem);
    },

    async deleteItemConfirm() {
      this.loading = true;

      try {
        const result = await handleRequest({
          endpoint: "location-destroy",
          method: "POST",
          data: { id: this.editedItem.id },
        });

        if (result.success) {
          this.dialogDelete = false;
          this.showAlert("success", result.message || "Ubicación eliminada correctamente.", 3000);
          await this.initialize();
          this.editedItem = this.cloneItem(this.defaultItem);
        } else {
          this.showAlert("warning", result.message || "No fue posible eliminar la ubicación.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al eliminar la ubicación.", 3000);
      } finally {
        this.loading = false;
      }
    },

    onFileSelected(event) {
      const selected = event?.target?.files?.[0];
      if (selected) this.processSelectedFile(selected);
    },

    onFileModelUpdate(value) {
      const selected = Array.isArray(value) ? value[0] : value;

      if (!selected) {
        this.file = null;
        this.imgMiniatura = this.baseImageUrl(this.editedItem);
        return;
      }

      this.processSelectedFile(selected);
    },

    processSelectedFile(selected) {
      if (!selected) return;

      if (selected.size > 500 * 1024) {
        this.file = null;
        this.showAlert("warning", "La imagen debe tener un tamaño máximo de 500 KB.", 3000);
        return;
      }

      this.file = selected;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.imgMiniatura = event.target.result;
      };
      reader.readAsDataURL(selected);
    },

    showAlert(type, message, timeout = 3000) {
      const config = {
        success: { title: "Éxito", icon: "mdi-check-circle" },
        error: { title: "Error", icon: "mdi-close-circle" },
        warning: { title: "Advertencia", icon: "mdi-alert-circle" },
        info: { title: "Información", icon: "mdi-information" },
      }[type] || { title: "Advertencia", icon: "mdi-alert-circle" };

      this.sb_type = type;
      this.sb_title = config.title;
      this.sb_icon = config.icon;
      this.sb_message = message;
      this.sb_timeout = timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.locations-page {
  --blue: #2454d6;
  --blue-light: #3266e4;
  min-height: 100%;
  color: #1e293b;
  background: #f6f8fb;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8edf5;
}

.page-heading,
.dialog-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.page-icon,
.dialog-icon {
  position: relative;
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #fff;
  background:
    radial-gradient(circle at 90% 5%, rgba(53, 184, 232, 0.5), transparent 28px),
    linear-gradient(135deg, #0e1f46, #2454d6);
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(36, 84, 214, 0.17);
}

.dialog-icon-main {
  transform: translate(-2px, 1px);
}

.dialog-icon-action {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 1px;
  color: #0e1f46;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.22);
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
  color: #fff !important;
  background: linear-gradient(100deg, #2454d6, #3266e4) !important;
  border-radius: 9px !important;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  box-shadow: 0 5px 12px rgba(36, 84, 214, 0.2) !important;
}

.page-content {
  padding: 18px 24px 28px;
}

.summary-row {
  margin-bottom: 4px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 72px;
  padding: 13px 15px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}

.summary-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
}

.summary-icon--blue {
  color: #2454d6;
  background: #eef3ff;
}

.summary-icon--green {
  color: #16875a;
  background: #eaf8f1;
}

.summary-icon--slate {
  color: #64748b;
  background: #f1f5f9;
}

.summary-value {
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.summary-label {
  margin-top: 4px;
  color: #526176;
  font-size: 11px;
  font-weight: 700;
}

.table-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 13px !important;
  box-shadow: 0 5px 18px rgba(15, 23, 42, 0.04) !important;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 69px;
  padding: 12px 17px;
}

.section-title {
  color: #0f172a;
  font-size: 15px;
  font-weight: 850;
}

.section-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  font-weight: 650;
}

.search-field {
  flex: 0 1 320px;
}

.search-field :deep(.v-field) {
  border-radius: 9px;
  font-size: 12px;
}

.search-field :deep(.v-field__outline) {
  color: #dce3ed;
}

.locations-table {
  color: #1e293b;
  background: transparent;
}

.locations-table :deep(thead th) {
  height: 40px !important;
  color: #334155 !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: #f8fafc !important;
  border-bottom: 1px solid #e8edf5 !important;
}

.locations-table :deep(tbody td) {
  height: 62px !important;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #eef2f6 !important;
}

.locations-table :deep(tbody tr:hover) {
  background: #f8faff !important;
}

.locations-table :deep(.v-data-table-footer) {
  min-height: 52px;
  padding: 6px 16px;
  color: #334155;
  font-size: 11.5px;
  font-weight: 700;
}

.locations-table :deep(.v-data-table__th--sortable) {
  cursor: pointer;
  user-select: none;
}

.locations-table :deep(.v-data-table__th--sortable:hover),
.locations-table :deep(.v-data-table__th--sorted) {
  color: #2454d6 !important;
  background: #f4f7ff !important;
}

.location-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.location-avatar {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  overflow: hidden;
  place-items: center;
  color: #2454d6;
  background: #eef3ff;
  border: 1px solid #dce6ff;
  border-radius: 9px;
}

.location-photo,
.preview-image {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.location-photo :deep(.v-img__img),
.preview-image :deep(.v-img__img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.image-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
}

.cell-copy {
  min-width: 0;
}

.location-name {
  max-width: 320px;
  overflow: hidden;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-area {
  margin-top: 2px;
  overflow: hidden;
  color: #526176;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coordinate-value {
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.table-value {
  color: #334155;
  font-size: 12.5px;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 7px;
}

.status-badge--active {
  color: #116b49;
  background: #eaf8f1;
}

.status-badge--inactive {
  color: #475569;
  background: #f1f5f9;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.action-button {
  border-radius: 8px !important;
}

.action-button--edit {
  color: #2454d6 !important;
}

.action-button--edit:hover {
  background: #eef3ff;
}

.action-button--delete {
  color: #dc2626 !important;
}

.action-button--delete:hover {
  background: #fff1f2;
}

.table-footer-note {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 9px 16px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 650;
  border-top: 1px solid #edf1f5;
}

.form-dialog,
.delete-dialog {
  overflow: hidden;
  color: #1e293b;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 14px !important;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2) !important;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
}

.dialog-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 850;
  line-height: 1.2;
}

.dialog-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
}

.dialog-close {
  color: #64748b !important;
}

.dialog-body {
  max-height: 70vh;
  padding: 21px 22px 16px !important;
  overflow-y: auto;
}

.form-section-label {
  margin-bottom: 13px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 850;
  letter-spacing: 0.065em;
  text-transform: uppercase;
}

.form-section-label--spaced {
  margin-top: 7px;
}

.dialog-body :deep(.v-field) {
  border-radius: 9px;
}

.dialog-body :deep(.v-field__outline) {
  color: #d6dee9;
}

.dialog-body :deep(.v-label) {
  color: #64748b;
  font-size: 13px;
  font-weight: 650;
  opacity: 1;
}

.dialog-body :deep(.v-field__input) {
  color: #1e293b;
  font-size: 13px;
  font-weight: 650;
}

.status-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 13px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 10px;
}

.status-control-title {
  color: #334155;
  font-size: 12.5px;
  font-weight: 800;
}

.status-control-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 800;
}

.is-active {
  color: #16875a;
}

.is-inactive {
  color: #64748b;
}

.image-upload-area {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 10px;
}

.image-preview {
  flex: 0 0 112px;
  width: 112px;
  height: 76px;
  overflow: hidden;
  background: #eef3ff;
  border: 1px solid #dce6ff;
  border-radius: 9px;
}

.preview-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #2454d6;
}

.upload-copy {
  flex: 1;
  min-width: 0;
}

.upload-title {
  color: #334155;
  font-size: 12.5px;
  font-weight: 800;
}

.upload-description {
  margin: 3px 0 8px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
}

.file-field {
  max-width: 350px;
}

.dialog-actions {
  justify-content: flex-end;
  gap: 9px;
  padding: 14px 20px !important;
}

.cancel-button {
  min-width: 94px;
  min-height: 39px;
  color: #475569 !important;
  font-size: 12.5px;
  font-weight: 750;
  letter-spacing: 0;
  text-transform: none;
  border-radius: 9px !important;
}

.cancel-button:hover {
  background: #f1f5f9;
}

.save-button {
  min-width: 150px;
  padding-inline: 18px !important;
}

.delete-dialog {
  padding: 29px 27px 24px;
  text-align: center;
}

.delete-icon {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  place-items: center;
  color: #dc2626;
  background: #fff1f2;
  border: 1px solid #ffe0e4;
  border-radius: 15px;
}

.delete-title {
  color: #0f172a;
  font-size: 18px;
  font-weight: 850;
}

.delete-message {
  max-width: 350px;
  margin: 10px auto 22px;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.55;
}

.delete-message strong {
  color: #334155;
  font-weight: 800;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 9px;
}

.delete-button {
  min-width: 112px;
  min-height: 40px;
  color: #fff !important;
  background: #dc2626 !important;
  border-radius: 9px !important;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.snackbar-title {
  font-size: 11px;
  font-weight: 850;
}

.snackbar-message {
  margin-top: 2px;
  font-size: 9.5px;
  font-weight: 600;
}

.busgo-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 11px;
}

@media (max-width: 1100px) {
  .locations-table {
    overflow-x: auto;
  }

  .locations-table :deep(.v-table__wrapper) {
    min-width: 980px;
  }
}

@media (max-width: 959px) {
  .page-header {
    padding-inline: 17px;
  }

  .page-content {
    padding: 15px 17px 24px;
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start;
    padding: 11px 12px;
  }

  .page-subtitle {
    max-width: 210px;
  }

  .add-button {
    min-width: 42px !important;
    padding-inline: 10px !important;
  }

  .add-button :deep(.v-btn__content) {
    font-size: 0;
  }

  .add-button :deep(.v-icon) {
    margin: 0 !important;
  }

  .page-content {
    padding: 11px 12px 20px;
  }

  .dialog-header {
    padding: 14px;
  }

  .dialog-body {
    padding: 17px 14px 12px !important;
  }

  .status-control,
  .image-upload-area {
    align-items: flex-start;
    flex-direction: column;
  }

  .status-switch {
    width: 100%;
    justify-content: space-between;
  }

  .dialog-actions {
    padding-inline: 13px !important;
  }
}
</style>
