<template>
  <div class="tariff-page">
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

    <!-- Encabezado -->
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon">
          <v-icon size="21">mdi-tag-multiple-outline</v-icon>
        </div>

        <div>
          <h1 class="page-title">Tarifas</h1>
          <p class="page-subtitle">Administra descuentos y promociones comerciales</p>
        </div>
      </div>

      <v-btn
        class="add-button"
        prepend-icon="mdi-plus"
        elevation="0"
        @click="showAdd"
      >
        Agregar tarifa
      </v-btn>
    </header>

    <v-container fluid class="page-content">
      <!-- Resumen -->
      <v-row class="summary-row">
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--blue">
              <v-icon size="19">mdi-tag-multiple-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ promotions.length }}</div>
              <div class="summary-label">Total de tarifas</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--green">
              <v-icon size="19">mdi-check-circle-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ activePromotions }}</div>
              <div class="summary-label">Tarifas activas</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--slate">
              <v-icon size="19">mdi-pause-circle-outline</v-icon>
            </div>
            <div>
              <div class="summary-value">{{ inactivePromotions }}</div>
              <div class="summary-label">Tarifas inactivas</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Tabla -->
      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div>
            <div class="section-title">Listado de tarifas</div>
            <div class="section-subtitle">
              {{ filteredCountText }}
            </div>
          </div>

          <v-text-field
            v-model="search"
            class="search-field"
            density="compact"
            placeholder="Buscar tarifa..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
          />
        </div>

        <v-divider />

        <v-data-table
          :headers="headers"
          :items="promotions"
          :search="search"
          :loading="loading"
          :items-per-page="10"
          items-per-page-text="Elementos por página"
          no-data-text="No hay tarifas disponibles"
          loading-text="Cargando tarifas..."
          class="tariff-table"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>

          <template #[`item.name`]="{ item }">
            <div class="tariff-name-cell">
              <div class="tariff-avatar">
                <v-icon size="17">mdi-tag-outline</v-icon>
              </div>

              <div class="cell-copy">
                <div class="tariff-name">{{ item.name }}</div>
                
              </div>
            </div>
          </template>

          <template #[`item.percentage`]="{ item }">
            <div class="discount-value">
              {{ formatDiscount(item) }}
            </div>
          </template>

          <template #[`item.discount_type`]="{ item }">
            <span
              class="type-badge"
              :class="item.discount_type === 'porcentaje'
                ? 'type-badge--percentage'
                : 'type-badge--amount'"
            >
              <v-icon size="14">
                {{ item.discount_type === "porcentaje" ? "mdi-percent" : "mdi-cash" }}
              </v-icon>
              {{ item.discount_type === "porcentaje" ? "Porcentaje" : "Monto fijo" }}
            </span>
          </template>

          <template #[`item.description`]="{ item }">
            <div class="description-cell" :title="item.description">
              {{ item.description || "Sin descripción" }}
            </div>
          </template>

          <template #[`item.active`]="{ item }">
            <span class="status-badge" :class="item.active ? 'status-badge--active' : 'status-badge--inactive'">
              <span class="status-dot" />
              {{ item.active ? "Activa" : "Inactiva" }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="action-buttons">
              <v-tooltip text="Editar tarifa" location="top">
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

              <v-tooltip text="Eliminar tarifa" location="top">
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
          Las tarifas activas estarán disponibles en los procesos de venta.
        </div>
      </v-card>
    </v-container>

    <!-- Crear / editar -->
    <v-dialog v-model="dialog" max-width="620" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading">
              <div class="dialog-icon">
                <v-icon size="20">
                  {{ editedIndex === -1 ? "mdi-tag-plus-outline" : "mdi-tag-edit-outline" }}
                </v-icon>
              </div>

              <div>
                <div class="dialog-title">{{ formTitle }}</div>
                <div class="dialog-subtitle">
                  {{ editedIndex === -1
                    ? "Crea una nueva tarifa comercial"
                    : "Actualiza la información de la tarifa" }}
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

            <v-text-field
              v-model="editedItem.name"
              label="Nombre de la tarifa"
              placeholder="Ej.: Estudiantes"
              prepend-inner-icon="mdi-tag-outline"
              variant="outlined"
              density="comfortable"
              :rules="nameRules"
              maxlength="50"
              counter="50"
              clearable
            />

            <v-textarea
              v-model="editedItem.description"
              label="Descripción"
              placeholder="Describe cuándo y para quién se aplica esta tarifa"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="comfortable"
              rows="3"
              auto-grow
              :rules="descriptionRules"
              clearable
            />

            <div class="form-section-label form-section-label--spaced">
              Configuración del descuento
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.discount_type"
                  :items="discountTypeOptions"
                  item-title="title"
                  item-value="value"
                  label="Tipo de descuento"
                  prepend-inner-icon="mdi-shape-outline"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.percentage"
                  :label="editedItem.discount_type === 'porcentaje' ? 'Porcentaje' : 'Monto'"
                  :prefix="editedItem.discount_type === 'monto' ? '$' : undefined"
                  :suffix="editedItem.discount_type === 'porcentaje' ? '%' : undefined"
                  :prepend-inner-icon="discountFieldIcon"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  min="0"
                  step="0.1"
                  :max="editedItem.discount_type === 'porcentaje' ? 100 : undefined"
                  :rules="discountRules"
                />
              </v-col>
            </v-row>

            <div class="status-control">
              <div>
                <div class="status-control-title">Estado de la tarifa</div>
                <div class="status-control-description">
                  Las tarifas inactivas no estarán disponibles para nuevas ventas.
                </div>
              </div>

              <div class="status-switch">
                <span :class="editedItem.active ? 'is-active' : 'is-inactive'">
                  {{ editedItem.active ? "Activa" : "Inactiva" }}
                </span>
                <v-switch
                  v-model="editedItem.active"
                  color="#20a66a"
                  inset
                  hide-details
                  density="compact"
                />
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="dialog-actions">
            <v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">
              Cancelar
            </v-btn>

            <v-btn
              type="submit"
              class="save-button"
              elevation="0"
              :loading="loading"
            >
              {{ editedIndex === -1 ? "Crear tarifa" : "Guardar cambios" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Eliminar -->
    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon">
          <v-icon size="27">mdi-trash-can-outline</v-icon>
        </div>

        <div class="delete-title">Eliminar tarifa</div>
        <div class="delete-message">
          ¿Deseas eliminar <strong>{{ editedItem.name || "esta tarifa" }}</strong>?
          Esta acción no se puede deshacer.
        </div>

        <div class="delete-actions">
          <v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">
            Cancelar
          </v-btn>
          <v-btn class="delete-button" elevation="0" :loading="loading" @click="deleteItemConfirm">
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
  name: "TarifasView",

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

    promotions: [],
    editedIndex: -1,
    search: "",

    headers: [
      { title: "Tarifa", key: "name", value: "name", width: "20%" },
      { title: "Descuento", key: "percentage", value: "percentage", width: "12%" },
      { title: "Tipo", key: "discount_type", value: "discount_type", width: "16%" },
      { title: "Descripción", key: "description", value: "description", width: "30%" },
      { title: "Estado", key: "active", value: "active", width: "12%" },
      { title: "", key: "actions", value: "actions", sortable: false, align: "end", width: "10%" },
    ],

    discountTypeOptions: [
      { title: "Porcentaje", value: "porcentaje" },
      { title: "Monto fijo", value: "monto" },
    ],

    editedItem: {
      id: "",
      name: "",
      description: "",
      percentage: "",
      discount_type: "monto",
      active: true,
    },

    defaultItem: {
      id: "",
      name: "",
      description: "",
      percentage: "",
      discount_type: "monto",
      active: true,
    },

    originalItem: {},

    nameRules: [
      (v) => !!v || "El nombre es requerido",
      (v) => !v || v.length >= 3 || "Debe tener al menos 3 caracteres",
      (v) => !v || v.length <= 50 || "No puede superar los 50 caracteres",
    ],

    descriptionRules: [
      (v) => !!v || "La descripción es requerida",
    ],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar tarifa" : "Editar tarifa";
    },

    activePromotions() {
      return this.promotions.filter((item) => Boolean(item.active)).length;
    },

    inactivePromotions() {
      return this.promotions.length - this.activePromotions;
    },

    filteredCountText() {
      const total = this.promotions.length;
      return total === 1 ? "1 tarifa registrada" : `${total} tarifas registradas`;
    },

    discountFieldIcon() {
      return this.editedItem.discount_type === "porcentaje"
        ? "mdi-percent"
        : "mdi-cash-minus";
    },

    discountRules() {
      return [
        (v) => v !== "" && v !== null && v !== undefined || "El descuento es requerido",
        (v) => Number(v) >= 0 || "El descuento debe ser mayor o igual a cero",
        (v) => this.editedItem.discount_type !== "porcentaje" || Number(v) <= 100 || "No puede superar el 100%",
      ];
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
    cloneItem(item) {
      return { ...item };
    },

    normalizePromotion(promotion) {
      return {
        ...promotion,
        active: Boolean(promotion.active),
        discount_type: promotion.discount_type ?? promotion.discountType ?? "monto",
      };
    },

    formatDiscount(item) {
      const value = Number(item.percentage) || 0;

      if (item.discount_type === "porcentaje") {
        return `${value.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%`;
      }

      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(value);
    },

    async initialize() {
      this.loading = true;

      try {
        const result = await handleRequest({
          endpoint: "promotion",
          method: "GET",
        });

        if (result.success) {
          const rawPromotions = Array.isArray(result.data?.promotions)
            ? result.data.promotions
            : Object.values(result.data?.promotions || {});

          this.promotions = rawPromotions.map(this.normalizePromotion);
        } else {
          this.promotions = [];
          this.showAlert("warning", result.message || "No fue posible cargar las tarifas.", 3000);
        }
      } catch (error) {
        this.promotions = [];
        this.showAlert("error", "Ocurrió un error al cargar las tarifas.", 3000);
      } finally {
        this.loading = false;
      }
    },

    showAdd() {
      this.editedIndex = -1;
      this.editedItem = this.cloneItem(this.defaultItem);
      this.originalItem = this.cloneItem(this.defaultItem);
      this.valid = false;
      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.form?.resetValidation();
      });
    },

    editItem(item) {
      const normalizedItem = this.normalizePromotion(item);
      this.editedIndex = this.promotions.findIndex((promotion) => promotion.id === item.id);
      this.editedItem = this.cloneItem(normalizedItem);
      this.originalItem = this.cloneItem(normalizedItem);
      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.form?.resetValidation();
      });
    },

    close() {
      if (this.loading) return;

      this.dialog = false;

      this.$nextTick(() => {
        this.editedItem = this.cloneItem(this.defaultItem);
        this.originalItem = this.cloneItem(this.defaultItem);
        this.editedIndex = -1;
        this.valid = false;
        this.$refs.form?.resetValidation();
      });
    },

    getChangedFields() {
      const fields = ["name", "description", "percentage", "discount_type", "active"];

      return fields.reduce((changes, key) => {
        if (this.editedItem[key] !== this.originalItem[key]) {
          changes[key] = this.editedItem[key];
        }
        return changes;
      }, {});
    },

    async save() {
      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) return;

      const isCreating = this.editedIndex === -1;
      const payload = isCreating
        ? {
            name: this.editedItem.name,
            description: this.editedItem.description,
            percentage: this.editedItem.percentage,
            discount_type: this.editedItem.discount_type,
            active: this.editedItem.active,
          }
        : this.getChangedFields();

      if (!isCreating && Object.keys(payload).length === 0) {
        this.showAlert("warning", "No se realizaron cambios.", 3000);
        this.close();
        return;
      }

      if (!isCreating) payload.id = this.editedItem.id;

      this.loading = true;

      try {
        const result = await handleRequest({
          endpoint: "promotion",
          method: isCreating ? "POST" : "PUT",
          data: payload,
        });

        if (result.success) {
          this.dialog = false;
          this.showAlert("success", result.message || "Tarifa guardada correctamente.", 3000);
          await this.initialize();
          this.resetEditor();
        } else {
          this.showAlert("warning", result.message || "No fue posible guardar la tarifa.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al guardar la tarifa.", 3000);
      } finally {
        this.loading = false;
      }
    },

    resetEditor() {
      this.editedItem = this.cloneItem(this.defaultItem);
      this.originalItem = this.cloneItem(this.defaultItem);
      this.editedIndex = -1;
      this.valid = false;
    },

    deleteItem(item) {
      this.editedItem = this.cloneItem(item);
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
          endpoint: "promotion-destroy",
          method: "POST",
          data: { id: this.editedItem.id },
        });

        if (result.success) {
          this.dialogDelete = false;
          this.showAlert("success", result.message || "Tarifa eliminada correctamente.", 3000);
          await this.initialize();
          this.editedItem = this.cloneItem(this.defaultItem);
        } else {
          this.showAlert("warning", result.message || "No fue posible eliminar la tarifa.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al eliminar la tarifa.", 3000);
      } finally {
        this.loading = false;
      }
    },

    showAlert(type, message, timeout = 3000) {
      const alertConfiguration = {
        success: { title: "Éxito", icon: "mdi-check-circle" },
        error: { title: "Error", icon: "mdi-close-circle" },
        warning: { title: "Advertencia", icon: "mdi-alert-circle" },
      };

      const configuration = alertConfiguration[type] || alertConfiguration.warning;

      this.sb_type = type;
      this.sb_title = configuration.title;
      this.sb_icon = configuration.icon;
      this.sb_message = message;
      this.sb_timeout = timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.tariff-page {
  --busgo-blue: #2454d6;
  --busgo-blue-light: #3266e4;
  --busgo-blue-dark: #132d6b;
  --busgo-blue-deep: #0e1f46;
  --busgo-cyan: #35b8e8;
  --page-text: #1e293b;
  --page-muted: #64748b;
  --page-border: #e8edf5;

  min-height: 100%;
  color: var(--page-text);
  background: #f6f8fb;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--page-border);
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
  color: #ffffff;
  background: radial-gradient(circle at 90% 5%, rgba(53,184,232,.5), transparent 28px),
    linear-gradient(135deg, var(--busgo-blue-deep), var(--busgo-blue));
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(36,84,214,.17);
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
  color: #ffffff !important;
  background: linear-gradient(100deg, var(--busgo-blue), var(--busgo-blue-light)) !important;
  border-radius: 9px !important;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  box-shadow: 0 5px 12px rgba(36,84,214,.18) !important;
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
  background: #ffffff;
  border: 1px solid var(--page-border);
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(15,23,42,.035);
}

.summary-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
}

.summary-icon--blue { color: #2454d6; background: #eef3ff; }
.summary-icon--green { color: #16875a; background: #eaf8f1; }
.summary-icon--slate { color: #64748b; background: #f1f5f9; }

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
  background: #ffffff;
  border: 1px solid var(--page-border);
  border-radius: 13px !important;
  box-shadow: 0 5px 18px rgba(15,23,42,.04) !important;
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
  flex: 0 1 285px;
}

.search-field :deep(.v-field) {
  border-radius: 9px;
  font-size: 11px;
  box-shadow: none;
}

.search-field :deep(.v-field__outline) { color: #dce3ed; }

.tariff-table {
  color: #334155;
  background: transparent;
}

.tariff-table :deep(thead th) {
  height: 40px !important;
  color: #475569 !important;
  font-size: 10.5px !important;
  font-weight: 850 !important;
  letter-spacing: .04em;
  text-transform: uppercase;
  background: #f8fafc !important;
  border-bottom: 1px solid #e8edf5 !important;
}

.tariff-table :deep(tbody td) {
  height: 58px !important;
  color: #334155;
  font-size: 12px;
  border-bottom: 1px solid #eef2f6 !important;
}

.tariff-table :deep(tbody tr) { transition: background-color 150ms ease; }
.tariff-table :deep(tbody tr:hover) { background: #f8faff !important; }

.tariff-name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.tariff-avatar {
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

.cell-copy { min-width: 0; }
.tariff-name { overflow: hidden; color: #172033; font-size: 12.5px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.tariff-id { margin-top: 2px; color: #64748b; font-size: 10px; font-weight: 650; }
.discount-value { color: #0f172a; font-size: 13px; font-weight: 850; }

.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  font-size: 10.5px;
  font-weight: 750;
  line-height: 1;
  border-radius: 7px;
  white-space: nowrap;
}

.type-badge--percentage { color: #2454d6; background: #eef3ff; }
.type-badge--amount { color: #7c3aed; background: #f3efff; }
.status-badge--active { color: #16875a; background: #eaf8f1; }
.status-badge--inactive { color: #64748b; background: #f1f5f9; }

.status-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

.description-cell {
  max-width: 340px;
  overflow: hidden;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons { display: flex; justify-content: flex-end; gap: 2px; }
.action-button { border-radius: 8px !important; }
.action-button--edit { color: #2454d6 !important; }
.action-button--edit:hover { background: #eef3ff; }
.action-button--delete { color: #dc2626 !important; }
.action-button--delete:hover { background: #fff1f2; }

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
  --busgo-blue: #2454d6;
  --busgo-blue-light: #3266e4;
  --busgo-blue-dark: #132d6b;
  --busgo-blue-deep: #0e1f46;
  --busgo-cyan: #35b8e8;

  overflow: hidden;
  background: #ffffff;
  border: 1px solid #dfe6ef;
  border-radius: 14px !important;
  box-shadow: 0 22px 60px rgba(15,23,42,.2) !important;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
}

.dialog-icon {
  flex-basis: 36px;
  width: 36px;
  height: 36px;
}

.dialog-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 850;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.dialog-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.35;
}
.dialog-close { color: #64748b !important; }
.dialog-body { padding: 21px 22px 13px !important; }

.form-section-label {
  margin-bottom: 13px;
  color: #475569;
  font-size: 10.5px;
  font-weight: 850;
  letter-spacing: .065em;
  text-transform: uppercase;
}

.form-section-label--spaced { margin-top: 2px; }
.dialog-body :deep(.v-field) { border-radius: 9px; }
.dialog-body :deep(.v-field__outline) { color: #d6dee9; }
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

.dialog-body :deep(.v-messages__message),
.dialog-body :deep(.v-counter) {
  font-size: 10.5px;
  font-weight: 600;
}

.status-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 1px;
  padding: 11px 13px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 10px;
}

.status-control-title { color: #334155; font-size: 12.5px; font-weight: 800; }
.status-control-description { margin-top: 4px; color: #64748b; font-size: 10.5px; font-weight: 600; line-height: 1.35; }
.status-switch { display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 800; }
.is-active { color: #16875a; }
.is-inactive { color: #64748b; }
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
  color: #1e293b !important;
  background: #f1f5f9;
}

.save-button {
  min-width: 138px;
  min-height: 40px;
  padding-inline: 18px !important;
  color: #ffffff !important;
  background: linear-gradient(100deg, #2454d6, #3266e4) !important;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  border-radius: 9px !important;
  box-shadow: 0 5px 12px rgba(36,84,214,.2) !important;
}

.save-button:hover {
  background: linear-gradient(100deg, #1f49bd, #2859d1) !important;
  box-shadow: 0 7px 16px rgba(36,84,214,.26) !important;
}

.save-button:disabled {
  color: #94a3b8 !important;
  background: #e8edf5 !important;
  box-shadow: none !important;
}

.delete-dialog { padding: 29px 27px 24px; text-align: center; }
.delete-icon { display: grid; width: 56px; height: 56px; margin: 0 auto 16px; place-items: center; color: #dc2626; background: #fff1f2; border: 1px solid #ffe0e4; border-radius: 15px; }
.delete-title { color: #0f172a; font-size: 18px; font-weight: 850; line-height: 1.25; letter-spacing: -.015em; }
.delete-message { max-width: 340px; margin: 10px auto 22px; color: #64748b; font-size: 12.5px; font-weight: 600; line-height: 1.55; }
.delete-message strong { color: #334155; font-weight: 800; }
.delete-actions { display: flex; justify-content: center; gap: 9px; }
.delete-button { min-width: 112px; min-height: 40px; color: #ffffff !important; background: #dc2626 !important; border-radius: 9px !important; font-size: 12.5px; font-weight: 800; letter-spacing: 0; text-transform: none; box-shadow: 0 5px 12px rgba(220,38,38,.18) !important; }
.delete-button:hover { background: #b91c1c !important; box-shadow: 0 7px 16px rgba(220,38,38,.24) !important; }

.snackbar-content { display: flex; align-items: center; gap: 10px; }
.snackbar-title { font-size: 11px; font-weight: 850; }
.snackbar-message { margin-top: 2px; font-size: 9.5px; font-weight: 600; }
.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius: 11px; }

@media (max-width: 959px) {
  .page-header { padding-inline: 17px; }
  .page-content { padding: 15px 17px 24px; }
  .tariff-table { overflow-x: auto; }
  .tariff-table :deep(.v-table__wrapper) { min-width: 850px; }
}

@media (max-width: 600px) {
  .page-header { align-items: flex-start; padding: 11px 12px; }
  .page-subtitle { max-width: 190px; }
  .add-button { min-width: 42px !important; padding-inline: 10px !important; }
  .add-button :deep(.v-btn__content) { font-size: 0; }
  .add-button :deep(.v-icon) { margin: 0 !important; font-size: 20px !important; }
  .page-content { padding: 11px 12px 20px; }
  .table-toolbar { align-items: stretch; flex-direction: column; gap: 10px; }
  .search-field { flex-basis: auto; width: 100%; }
  .dialog-header { padding: 13px 14px; }
  .dialog-body { padding: 16px 14px 8px !important; }
  .status-control { align-items: flex-start; flex-direction: column; }
  .status-switch { width: 100%; justify-content: space-between; }
  .dialog-actions { padding-inline: 13px !important; }
}
</style>
