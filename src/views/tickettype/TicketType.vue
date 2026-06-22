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
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>
  <v-card
    class="d-flex align-center pa-3"
    elevation="0"
    style="background-color: #f9f9f9"
  >
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-ticket-confirmation-outline</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Tipos de Pasajes</div>
      <div class="text-body-2 text-grey">Gestionar Tipos de Pasajes</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn
      class="text-subtitle-1 ml-12"
      :color="paleteColors.primary"
      variant="tonal"
      elevation="2"
      prepend-icon="mdi-plus-circle"
      @click="showAdd()"
    >
      Agregar Tipo de Pasaje
    </v-btn>
  </v-card>
  <!--<v-container style="min-width: 100%; min-height: 100%;">
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
    </v-container>-->
  <v-container style="min-width: 100%">
    <v-card flat>
      <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-subtitle-1 font-weight-bold">Listado de tipos de pasajes</div>

        <!-- Spacer (solo visible en md+) -->
        <v-spacer class="d-none d-md-block"></v-spacer>
        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 300px">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar tipos de pasajes"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <!-- Tabla de viajes con filas personalizadas -->
      <v-data-table
        :headers="headers"
        :items="ticketTypes"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="elevation-1"
        style="max-height: 68vh; overflow-y: auto; background: transparent"
      >
        <template v-slot:top>
          <!-- Tarjeta de encabezado con alto fijo -->
          <v-card
            flat
            color="blue-grey-lighten-5"
            class="mb-2 mx-1 rounded-lg"
            elevation="1"
            style="
              border: 1px solid #eceff1;
              height: 40px;
              min-height: 40px;
              display: flex;
              align-items: center;
            "
          >
            <v-card-text
              class="d-flex pa-2"
              style="
                width: 100%;
                min-width: 0;
                height: 100%;
                padding: 0 16px !important;
                display: flex;
                align-items: center;
              "
            >
              <!-- Negocio (20%) -->
              <div style="width: 18%; min-width: 0" class="text-left font-weight-bold">
                Nombre
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 28%; min-width: 0" class="text-left font-weight-bold">
                Descripción
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Ajuste
              </div>

              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Valor
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Monto
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Estado
              </div>

              <!-- Acciones (25%) -->
              <div
                style="width: 10%; min-width: 0"
                class="d-flex justify-left font-weight-bold"
              ></div>
            </v-card-text>
          </v-card>
        </template>
        <!-- Fila personalizada -->
        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
              <v-card
                class="mb-2 mx-1 rounded-lg"
                elevation="1"
                density="comfortable"
                flat
              >
                <v-card-text
                  class="d-flex align-center pa-2"
                  style="width: 100%; min-width: 0"
                >
                  <!-- Ruta -->
                  <div style="width: 18%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.name }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Nombre: {{ slotProps.item.name }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Origen con avatar -->
                  <div class="d-flex align-center" style="width: 28%; min-width: 0">
                    <span class="text-truncate">{{ slotProps.item.description }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Descripción: {{ slotProps.item.description }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Destino con avatar -->
                  <div class="d-flex align-center" style="width: 12%; min-width: 0">
                    <span class="text-truncate">{{
                      adjustmentTypeLabel(slotProps.item.adjustment_type)
                    }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Ajuste: {{ adjustmentTypeLabel(slotProps.item.adjustment_type) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div class="d-flex align-center" style="width: 12%; min-width: 0">
                    <span class="text-truncate">{{
                      valueTypeLabel(slotProps.item.value_type)
                    }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Tipo de valor: {{ valueTypeLabel(slotProps.item.value_type) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div class="d-flex align-center" style="width: 10%; min-width: 0">
                    <span class="text-truncate">{{
                      formatAdjustmentValue(slotProps.item)
                    }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Valor del ajuste: {{ formatAdjustmentValue(slotProps.item) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div class="d-flex align-center" style="width: 10%; min-width: 0">
                    <v-chip
                      :color="
                        slotProps.item.active
                          ? paleteColors.active
                          : paleteColors.inactive
                      "
                      :text-color="paleteColors.white"
                    >
                      {{ slotProps.item.active ? "Activo" : "Inactivo" }}
                    </v-chip>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Estado: {{ slotProps.item.active ? "Activo" : "Inactivo" }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Acciones -->
                  <div
                    class="d-flex gap-1"
                    style="width: 10%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary"
                      @click="editItem(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Editar Viaje"
                    >
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error"
                      @click="deleteItem(slotProps.item)"
                      class="flex-shrink-0"
                      title="Eliminar Viaje"
                    >
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
                <v-text-field
                  v-model="editedItem.name"
                  clearable
                  label="Nombre"
                  prepend-icon="mdi-tag-outline"
                  variant="underlined"
                  :rules="nameRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.active"
                    :true-value="true"
                    :false-value="false"
                    :base-color="switchColor"
                    :color="switchColor"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch"
                  />
                  <span class="text-body-1 compact-switch-label">
                    {{ editedItem.active ? "Activo" : "Inactivo" }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.adjustment_type"
                    true-value="recargo"
                    false-value="descuento"
                    :color="paleteColors.green"
                    :base-color="paleteColors.green"
                    :style="alwaysGreenSwitchStyle"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch always-green-switch"
                  />
                  <span class="text-body-1 compact-switch-label">
                    {{
                      editedItem.adjustment_type === "recargo" ? "Recargo" : "Descuento"
                    }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.value_type"
                    true-value="porcentaje"
                    false-value="monto"
                    :base-color="paleteColors.green"
                    :color="paleteColors.green"
                    :style="alwaysGreenSwitchStyle"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch always-green-switch"
                  />
                  <span class="text-body-1 compact-switch-label">
                    {{ editedItem.value_type === "porcentaje" ? "Porcentaje" : "Monto" }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model.number="editedItem.adjustment_value"
                  clearable
                  label="Valor del ajuste"
                  :prepend-icon="adjustmentValueIcon"
                  variant="underlined"
                  type="number"
                  min="0"
                  step="0.01"
                  :rules="adjustmentValueRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-textarea
                  v-model="editedItem.description"
                  clearable
                  label="Descripción"
                  prepend-icon="mdi-text-box-outline"
                  variant="underlined"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            :loading="loading"
            @click="save"
            :disabled="!valid"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar Tipo de Pasaje</span>
      </v-toolbar>
      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el tipo de pasaje seleccionado?</v-card-text
      >
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete"
          >Cancelar</v-btn
        >
        <v-btn
          :color="paleteColors.error"
          variant="flat"
          :loading="loading"
          @click="deleteItemConfirm"
          >Aceptar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api";
import { paleteColors } from "@/assets/colors";

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
    dialog: false,
    dialogDelete: false,
    ticketTypes: [],
    data: {},
    activeOptions: [
      { name: "No", id: false, icon: "mdi-close-circle" },
      { name: "Sí", id: true, icon: "mdi-check-circle" },
    ],
    headers: [
      { title: "Nombre", value: "name" },
      { title: "Descripción", value: "description" },
      { title: "Ajuste", value: "adjustment_type" },
      { title: "Tipo de valor", value: "value_type" },
      { title: "Valor del ajuste", value: "adjustment_value" },
      { title: "Activo", value: "active" },
      { title: "Acciones", value: "actions", sortable: false, width: "10%" },
    ],
    editedItem: {
      id: "",
      name: "",
      description: "",
      adjustment_type: "descuento",
      value_type: "monto",
      adjustment_value: 0,
      active: true,
    },
    defaultItem: {
      id: "",
      name: "",
      description: "",
      adjustment_type: "descuento",
      value_type: "monto",
      adjustment_value: 0,
      active: true,
    },
    originalItem: {
      id: "",
      name: "",
      description: "",
      adjustment_type: "descuento",
      value_type: "monto",
      adjustment_value: 0,
      active: true,
    },
    editedIndex: -1,
    search: "",
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [
      (v) => (v !== null && v !== undefined) || "Seleccionar al menos un elemento",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Tipo de Pasaje" : "Editar Tipo de Pasaje";
    },
    adjustmentValueIcon() {
      return this.editedItem.value_type === "porcentaje" ? "mdi-percent" : "mdi-cash";
    },
    switchColor() {
      return paleteColors.green;
    },
    alwaysGreenSwitchStyle() {
      return {
        "--v-theme-surface-variant": "76, 175, 80",
        "--v-theme-on-surface-variant": "255, 255, 255",
      };
    },
    adjustmentValueRules() {
      return [
        (v) =>
          (v !== null && v !== undefined && v !== "") ||
          "El valor del ajuste es requerido",
        (v) => Number(v) >= 0 || "El valor del ajuste debe ser mayor o igual a 0",
      ];
    },
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
          endpoint: "ticket-type",
          method: "GET",
        });

        if (result.success) {
          const rawTicketTypes = Array.isArray(result.data?.ticketTypes)
            ? result.data.ticketTypes
            : Object.values(result.data?.ticketTypes || {});
          this.ticketTypes = rawTicketTypes.map((ticketType) =>
            this.normalizeTicketType(ticketType)
          );
        } else {
          this.ticketTypes = [];
        }
      } catch (error) {
        this.loading = false;
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
      this.loading = true;
      const { valid } = await this.$refs.form.validate();

      if (!valid) {
        this.loading = false;
        return;
      }

      if (this.editedIndex === -1) {
        const updatedFields = this.buildTicketTypePayload(this.editedItem);

        if (Object.keys(updatedFields).length > 0) {
          try {
            const result = await handleRequest({
              endpoint: "ticket-type",
              method: "POST",
              data: updatedFields,
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
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
          }
        } else {
          this.loading = false;
          this.close();
          this.showAlert("success", "Debe completar los datos del tipo de pasaje.", 3000);
        }
      } else {
        const updatedFields = this.buildTicketTypePayload(this.editedItem, true);

        if (Object.keys(updatedFields).length > 0) {
          try {
            const result = await handleRequest({
              endpoint: "ticket-type",
              method: "PUT",
              data: updatedFields,
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
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
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
      const normalizedItem = this.normalizeTicketType(item);
      this.originalItem = Object.assign({}, normalizedItem);
      this.editedItem = Object.assign({}, normalizedItem);
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
          id: this.editedItem.id,
        };
        const result = await handleRequest({
          endpoint: "ticket-type-destroy",
          method: "POST",
          data: request,
        });

        if (result.success) {
          this.showAlert("success", result.message, 3000);
          this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
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
    normalizeTicketType(ticketType = {}) {
      return {
        ...this.defaultItem,
        ...ticketType,
        adjustment_type:
          ticketType.adjustment_type ?? ticketType.adjustmentType ?? "descuento",
        value_type: ticketType.value_type ?? ticketType.valueType ?? "monto",
        adjustment_value: Number(
          ticketType.adjustment_value ?? ticketType.adjustmentValue ?? 0
        ),
        active: ticketType.active ?? true,
      };
    },
    buildTicketTypePayload(item, includeId = false) {
      const payload = {
        name: item.name,
        description: item.description,
        adjustment_type: item.adjustment_type,
        value_type: item.value_type,
        adjustment_value: Number(item.adjustment_value ?? 0),
        active: item.active,
      };

      if (includeId) {
        payload.id = item.id;
      }

      return payload;
    },
    adjustmentTypeLabel(value) {
      return value === "recargo" ? "Recargo" : "Descuento";
    },
    valueTypeLabel(value) {
      return value === "porcentaje" ? "Porcentaje" : "Monto";
    },
    formatAdjustmentValue(item) {
      const numericValue = Number(item.adjustment_value ?? 0);
      return item.value_type === "porcentaje" ? `${numericValue}%` : numericValue;
    },
  },
};
</script>

<style>
.avatar-border {
  border: 2px solid #000;
}
.custom-switch {
  transform: scale(1);
  margin-left: 0;
}

.compact-switch-line {
  gap: 4px;
}

.compact-switch-label {
  color: #4caf50 !important;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.compact-inline-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
}

.always-green-switch :deep(.v-selection-control__input) {
  color: #4caf50 !important;
}

.always-green-switch :deep(.v-selection-control--dirty .v-switch__track),
.always-green-switch :deep(.v-switch__track) {
  background-color: #4caf50 !important;
  opacity: 1 !important;
}

.always-green-switch :deep(.v-switch__thumb),
.always-green-switch :deep(.v-selection-control--dirty .v-switch__thumb) {
  background-color: #ffffff !important;
  border-color: #4caf50 !important;
  color: #4caf50 !important;
}

.compact-inline-switch :deep(.v-switch__track) {
  transform: scale(0.68);
  transform-origin: left center;
}

.compact-inline-switch :deep(.v-switch__thumb) {
  transform: scale(0.68);
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
