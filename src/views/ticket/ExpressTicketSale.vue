<template>
  <v-dialog v-model="dialogModel" fullscreen transition="dialog-bottom-transition">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data" class="express-sale-form">
      <v-card class="ticket-sale-dialog-pro" elevation="0">
        <div class="ticket-sale-topbar">
          <div class="ticket-sale-topbar__left">
            <div class="ticket-sale-topbar__icon">
              <v-icon size="28">mdi-lightning-bolt-outline</v-icon>
            </div>

            <div>
              <div class="ticket-sale-topbar__title">Venta Express</div>
              <div class="ticket-sale-topbar__subtitle">
                Venta guiada de pasajes express por fecha, origen y destino
              </div>
            </div>
          </div>

          <v-spacer />

          <v-chip v-if="step === 1" size="small" variant="flat" class="ticket-sale-step-chip">
            Paso 1 - Viaje
          </v-chip>

          <v-chip v-if="step === 2" size="small" variant="flat" class="ticket-sale-step-chip">
            Paso 2 - Pasajes y pago
          </v-chip>

          <v-btn icon="mdi-close" variant="text" size="small" class="ticket-sale-close" aria-label="Cerrar venta Express" @click="close" />
        </div>

        <v-card-text class="ticket-sale-body">
          <div v-if="step === 1" class="ticket-sale-layout">
            <div class="ticket-sale-section-card">
              <div class="ticket-sale-section-header">
                <div>
                  <div class="ticket-sale-section-title">Selección del tramo</div>
                  <div class="ticket-sale-section-subtitle">
                    Elige fecha, origen, destino y luego selecciona el viaje disponible.
                  </div>
                </div>
              </div>

              <v-row dense>
                <v-col v-if="mostrarFila" cols="12" md="6">
                  <label class="ticket-sale-label">Sucursal</label>
                  <v-autocomplete
                    v-model="selectedBranchId"
                    :items="branches"
                    placeholder="Seleccione la sucursal"
                    prepend-inner-icon="mdi-store"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :no-data-text="'No hay sucursales disponibles'"
                    @update:model-value="onBranchChange"
                  />
                </v-col>

                <v-col cols="12" :md="mostrarFila ? 6 : 12">
                  <label class="ticket-sale-label">Fecha</label>
                  <v-menu
                    v-model="menuDate"
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
                        prepend-inner-icon="mdi-calendar"
                        placeholder="Fecha"
                        density="compact"
                        variant="outlined"
                        rounded="lg"
                        hide-details="auto"
                        readonly
                      />
                    </template>

                    <v-locale-provider locale="es">
                      <v-date-picker
                        header="Calendario"
                        title="Seleccione la fecha"
                        :color="'#16845b'"
                        :modelValue="selectedDate"
                        @update:model-value="updateDate"
                        format="yyyy-MM-dd"
                        :min="todayDate"
                      />
                    </v-locale-provider>
                  </v-menu>
                </v-col>

                <v-col cols="12" md="6">
                  <label class="ticket-sale-label">Origen</label>
                  <v-autocomplete
                    v-model="selectedOriginLocationId"
                    :items="originLocationOptions"
                    placeholder="Seleccione el origen"
                    prepend-inner-icon="mdi-map-marker-outline"
                    item-title="address"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :no-data-text="'No hay ubicaciones disponibles'"
                    :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-express-location-menu' }"
                    @update:model-value="handleOriginSelectionChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="{ ...props, title: undefined, subtitle: undefined }" class="ticket-location-option">
                        <div class="ticket-location-option__title">
                          {{ getTableRowItem(item).address }}
                        </div>
                        <div class="ticket-location-option__subtitle">
                          {{ getLocationSubtitle(getTableRowItem(item)) }}
                        </div>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12" md="6">
                  <label class="ticket-sale-label">Destino</label>
                  <v-autocomplete
                    v-model="selectedDestinationLocationId"
                    :items="destinationLocationOptions"
                    placeholder="Seleccione el destino"
                    prepend-inner-icon="mdi-map-marker-check-outline"
                    item-title="address"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :disabled="!selectedOriginLocationId"
                    :loading="loadingDestinations"
                    :no-data-text="loadingDestinations ? 'Cargando destinos...' : 'No hay ubicaciones disponibles'"
                    :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-express-location-menu' }"
                    @update:model-value="handleLocationSelectionChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="{ ...props, title: undefined, subtitle: undefined }" class="ticket-location-option">
                        <div class="ticket-location-option__title">
                          {{ getTableRowItem(item).address }}
                        </div>
                        <div class="ticket-location-option__subtitle">
                          {{ getLocationSubtitle(getTableRowItem(item)) }}
                        </div>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12">
                  <label class="ticket-sale-label">Buscar viaje</label>
                  <v-text-field
                    v-model="tripSearchText"
                    placeholder="Filtrar por ruta, patente, horario o tramo..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :disabled="!selectedOriginLocationId || !selectedDestinationLocationId || loading"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="ticket-sale-section-card mt-4">
              <div class="ticket-sale-section-header">
                <div class="d-flex align-center">
                  <div class="ticket-sale-mini-icon">
                    <v-icon size="22">mdi-bus-clock</v-icon>
                  </div>

                  <div>
                    <div class="ticket-sale-section-title">Viajes express disponibles</div>
                    <div class="ticket-sale-section-subtitle">
                      Selecciona una fila para continuar con la venta.
                    </div>
                  </div>
                </div>
              </div>

              <div class="trip-sale-panel-pro">
                <div class="trip-sale-panel-pro__header">
                  <div class="trip-sale-sortable-header" @click="toggleSort('code')">
                    <span>Código</span>
                    <v-icon size="14">{{ sortIcon('code') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('routeCode')">
                    <span>Ruta</span>
                    <v-icon size="14">{{ sortIcon('routeCode') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('schedule')">
                    <span>Salida</span>
                    <v-icon size="14">{{ sortIcon('schedule') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('arrival')">
                    <span>Llegada</span>
                    <v-icon size="14">{{ sortIcon('arrival') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('plate')">
                    <span>Vehículo</span>
                    <v-icon size="14">{{ sortIcon('plate') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('availableCapacity')">
                    <span>Disponibles</span>
                    <v-icon size="14">{{ sortIcon('availableCapacity') }}</v-icon>
                  </div>
                  <div class="trip-sale-sortable-header" @click="toggleSort('price')">
                    <span>Precio</span>
                    <v-icon size="14">{{ sortIcon('price') }}</v-icon>
                  </div>
                  <div></div>
                </div>

                <div v-if="filteredRows.length">
                  <div
                    v-for="tripRow in filteredRows"
                    :key="tripRow.id"
                    class="trip-sale-row-pro"
                    :class="{ 'trip-sale-row-pro--selected': selectedTripRowId === tripRow.id }"
                    @click="selectTripRow(tripRow)"
                  >
                    <div class="trip-sale-code">{{ tripRow.code || "-" }}</div>

                    <div class="trip-sale-route">
                      <div class="trip-sale-route__title-row">
                        <div class="trip-sale-route__name">{{ tripRow.routeCode || "-" }}</div>
                        <v-chip size="x-small" :color="getTripSourceColor(tripRow.sourceType)" variant="tonal">
                          {{ getTripSourceLabel(tripRow.sourceType) }}
                        </v-chip>
                      </div>
                      <div class="trip-sale-route__meta">
                        {{ tripRow.origin }} -> {{ tripRow.destination }}
                      </div>
                    </div>

                    <div>
                      <div class="trip-sale-strong">{{ tripRow.schedule || "-" }}</div>
                    </div>

                    <div>
                      <div class="trip-sale-strong">{{ tripRow.arrival || "-" }}</div>
                    </div>

                    <div>
                      <div class="trip-sale-strong">{{ tripRow.internal_number }}</div>
                      <div class="trip-sale-muted">{{ tripRow.plate }}</div>
                    </div>

                    <div class="trip-sale-price">
                      {{ Number(tripRow.availableCapacity ?? tripRow.availableSeats) }}
                    </div>

                    <div class="trip-sale-price">
                      {{ formatNumber(Number(tripRow.price)) }} CLP
                    </div>

                    <div class="d-flex justify-end">
                      <v-chip
                        size="small"
                        :color="selectedTripRowId === tripRow.id ? '#116546' : '#16845b'"
                        :variant="selectedTripRowId === tripRow.id ? 'flat' : 'tonal'"
                      >
                        {{ selectedTripRowId === tripRow.id ? "Seleccionado" : "Seleccionar" }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <div v-else class="ticket-sale-empty">
                  <v-icon size="42">mdi-bus-alert</v-icon>
                  <div class="ticket-sale-empty__title">No hay viajes disponibles</div>
                  <div class="ticket-sale-empty__text">
                    Cambia la fecha, origen, destino o búsqueda para encontrar viajes.
                  </div>
                </div>
              </div>
            </div>

            <div class="ticket-sale-footer-actions">
              <v-btn class="ticket-sale-btn-secondary" variant="flat" prepend-icon="mdi-close" @click="close">
                Cancelar
              </v-btn>

            </div>
          </div>

          <div v-if="step === 2" class="ticket-sale-layout">
            <div class="ticket-sale-summary-pro">
              <div>
                <div class="ticket-sale-section-title">Resumen de venta express</div>
                <div class="ticket-sale-section-subtitle">
                  Revisa el viaje antes de guardar.
                </div>
              </div>

              <div class="ticket-sale-summary-grid">
                <div>
                  <span>Recorrido</span>
                  <strong>{{ selectedTripRow?.origin || "-" }} -> {{ selectedTripRow?.destination || "-" }}</strong>
                </div>

                <div>
                  <span>Ruta</span>
                  <strong>{{ selectedTripRow?.routeCode || "No seleccionado" }}</strong>
                </div>

                <div>
                  <span>Disponibles</span>
                  <strong>{{ (selectedTripRow?.availableCapacity ?? selectedTripRow?.availableSeats ?? 0) }}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{{ formatNumber(Number(total || 0)) }} CLP</strong>
                </div>
              </div>
            </div>

            <v-row dense class="mt-4">
              <v-col cols="12" md="8">
                <div class="ticket-sale-section-card ticket-sale-fill">
                  <div class="ticket-sale-section-header">
                    <div>
                      <div class="ticket-sale-section-title">Tipos de pasajero</div>
                      <div class="ticket-sale-section-subtitle">
                        Ingresa la cantidad por tipo de pasaje.
                      </div>
                    </div>
                  </div>

                  <div class="ticket-type-list">
                    <div v-if="ticketTypes.length > 0">
                      <div v-for="ticket in ticketTypes" :key="ticket.trip_fare_id || ticket.id" class="ticket-type-card">
                        <div class="ticket-type-card__main">
                          <div>
                            <div class="ticket-type-card__title">
                              {{ ticket.ticketTypeName || ticket.name }}
                            </div>

                            <div class="ticket-type-card__price">
                              {{ formatNumber(Number(ticket.base_price)) }} CLP
                            </div>
                          </div>

                          <v-text-field
                            v-model.number="ticket.quantity"
                            @update:model-value="handleQuantityChange(ticket, $event)"
                            variant="outlined"
                            density="compact"
                            rounded="lg"
                            type="number"
                            min="0"
                            hide-details="auto"
                            class="ticket-type-card__input"
                            :error-messages="quantityErrors[ticket.trip_fare_id || ticket.id]"
                          />
                        </div>

                        <div v-if="Number(ticket.quantity) > 0" class="ticket-type-card__total">
                          Total:
                          <strong>{{ formatNumber(Number(ticket.line_total || 0)) }} CLP</strong>
                        </div>
                      </div>
                    </div>

                    <div v-else class="ticket-sale-empty">
                      <v-icon size="42">mdi-ticket-confirmation-outline</v-icon>
                      <div class="ticket-sale-empty__title">No hay tipos de pasaje</div>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="ticket-sale-section-card ticket-sale-fill ticket-payment-panel">
                  <div class="ticket-sale-section-header ticket-payment-header">
                    <div>
                      <div class="ticket-sale-section-title">Pago</div>
                      <div class="ticket-sale-section-subtitle">Medio de pago</div>
                    </div>
                  </div>

                  <div class="payment-methods-grid-pro">
                    <v-card
                      v-for="method in paymentMethods"
                      :key="method.value"
                      class="payment-method-card-pro"
                      :class="[
                        selectedMethod === method.value ? 'payment-method-selected' : '',
                        { 'payment-method-disabled': method.disabled }
                      ]"
                      @click="!method.disabled && (selectedMethod = method.value)"
                    >
                      <v-card-text class="payment-method-content-pro">
                        <v-icon size="24" :color="selectedMethod === method.value ? '#116546' : '#16845b'">
                          {{ method.icon }}
                        </v-icon>

                        <div class="payment-method-label">{{ method.text }}</div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <div class="ticket-total-box ticket-total-box-compact">
                    <span>Total</span>
                    <strong>{{ formatNumber(Number(total || 0)) }} CLP</strong>
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-alert v-if="totalQuantity > maxQuantity" type="error" variant="tonal" density="compact" class="mt-4">
              La cantidad total no puede superar los cupos disponibles.
            </v-alert>

            <div class="ticket-sale-footer-actions">
              <v-btn class="ticket-sale-btn-secondary" variant="flat" prepend-icon="mdi-arrow-left" @click="prevStep">
                Volver
              </v-btn>

              <v-spacer />

              <v-btn
                class="ticket-sale-btn-primary"
                variant="flat"
                prepend-icon="mdi-content-save-outline"
                :disabled="!canSave"
                :loading="loading"
                @click="save"
              >
                Guardar venta
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api";

export default {
  name: "ExpressTicketSale",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    branches: {
      type: Array,
      default: () => [],
    },
    branchId: {
      type: [String, Number],
      default: "",
    },
    mostrarFila: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "alert", "saved"],
  data: () => ({
    paleteColors,
    valid: true,
    loading: false,
    loadingDestinations: false,
    menuDate: false,
    selectedDate: null,
    selectedBranchId: "",
    selectedOriginLocationId: null,
    selectedDestinationLocationId: null,
    selectedTripRowId: null,
    selectedTripRow: null,
    selectedMethod: "Efectivo",
    tripSearchText: "",
    locations: [],
    allowedDestinations: [],
    trips: [],
    ticketTypes: [],
    quantityErrors: {},
    step: 1,
    sortBy: "schedule",
    sortOrder: "asc",
    paymentMethods: [
      { text: "Efectivo", value: "Efectivo", icon: "mdi-cash" },
      {
        text: "Credito",
        value: "Credito",
        icon: "mdi-credit-card-outline",
        disabled: true,
      },
      { text: "Debito", value: "Debito", icon: "mdi-bank-outline", disabled: true },
    ],
  }),
  computed: {
    dialogModel: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    todayDate() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    },
    today() {
      return new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Santiago",
      });
    },
    dateFormatted() {
      if (!this.selectedDate) {
        return this.today;
      }

      return this.selectedDate.toLocaleDateString("en-CA", {
        timeZone: "America/Santiago",
      });
    },
    originLocationOptions() {
      return (Array.isArray(this.locations) ? this.locations : []).filter(
        (location) => Number(location.id) !== Number(this.selectedDestinationLocationId)
      );
    },
    destinationLocationOptions() {
      const allowedDestinationIds = new Set(
        (Array.isArray(this.allowedDestinations) ? this.allowedDestinations : [])
          .map((destination) => Number(destination.destination_id ?? destination.destinationId))
          .filter((destinationId) => Number.isFinite(destinationId))
      );

      if (!this.selectedOriginLocationId || !allowedDestinationIds.size) {
        return [];
      }

      return (Array.isArray(this.locations) ? this.locations : []).filter((location) =>
        allowedDestinationIds.has(Number(location.id))
      );
    },
    tripRows() {
      return this.buildTripRows(this.trips);
    },
    filteredRows() {
      const query = (this.tripSearchText || "").toString().trim().toLowerCase();
      const rows = !query
        ? this.tripRows
        : this.tripRows.filter((row) =>
            [
              row.name,
              row.origin,
              row.destination,
              row.schedule,
              row.arrival,
              row.plate,
              row.internal_number,
              row.price,
            ].some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(query)
            )
          );

      return this.sortRows(rows, this.sortBy, this.sortOrder, (row, field) =>
        this.getSortValue(row, field)
      );
    },
    totalQuantity() {
      return this.ticketTypes.reduce(
        (total, ticket) => total + (Number(ticket.quantity) || 0),
        0
      );
    },
    maxQuantity() {
      return Number(this.selectedTripRow?.availableCapacity ?? this.selectedTripRow?.availableSeats ?? 0) || 0;
    },
    total() {
      return this.ticketTypes.reduce(
        (sum, ticket) => sum + (Number(ticket.line_total) || 0),
        0
      );
    },
    canSave() {
      return (
        !!this.selectedTripRow &&
        !!this.selectedMethod &&
        this.totalQuantity > 0 &&
        this.totalQuantity <= this.maxQuantity
      );
    },
  },
  watch: {
    modelValue(value) {
      if (value) {
        this.open();
      }
    },
  },
  methods: {
    getTableRowItem(item) {
      return item?.raw || item || {};
    },
    getLocationSubtitle(location) {
      if (!location) {
        return "";
      }

      return [location.city, location.country].filter(Boolean).join(" - ") || "Ubicacion";
    },
    async open() {
      this.selectedDate = this.todayDate;
      this.selectedBranchId = this.branchId;
      this.selectedOriginLocationId = null;
      this.selectedDestinationLocationId = null;
      this.selectedTripRowId = null;
      this.selectedTripRow = null;
      this.selectedMethod = "Efectivo";
      this.tripSearchText = "";
      this.trips = [];
      this.allowedDestinations = [];
      this.ticketTypes = [];
      this.quantityErrors = {};
      this.step = 1;
      await this.loadLocations();
    },
    close() {
      this.dialogModel = false;
    },
    nextStep() {
      this.step = 2;
    },
    prevStep() {
      this.step = 1;
    },
    updateDate(value) {
      this.selectedDate = value instanceof Date ? value : this.todayDate;
      this.menuDate = false;
      this.selectedDestinationLocationId = null;
      this.allowedDestinations = [];
      this.resetTrips();
      this.loadAllowedDestinationsByOrigin();
    },
    async onBranchChange() {
      this.selectedOriginLocationId = null;
      this.selectedDestinationLocationId = null;
      this.allowedDestinations = [];
      this.resetTrips();
      await this.loadLocations();
    },
    resetTrips() {
      this.trips = [];
      this.selectedTripRowId = null;
      this.selectedTripRow = null;
      this.ticketTypes = [];
      this.quantityErrors = {};
    },
    async loadLocations() {
      const branchId = this.selectedBranchId ?? this.branchId;

      if (branchId === "null" || branchId === null || branchId === "") {
        this.locations = [];
        return;
      }

      this.loadingDestinations = true;
      try {
        const result = await handleRequest({
          endpoint: "get-trip-date",
          method: "POST",
          data: {
            branch_id: Number(branchId),
            date: this.dateFormatted,
            trips: false,
          },
        });

        this.locations = result.success ? result.data?.locations || [] : [];
      } catch (error) {
        this.locations = [];
        this.$emit("alert", "error", "Ocurrio un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loadingDestinations = false;
      }
    },
    async handleLocationSelectionChange() {
      if (
        this.selectedOriginLocationId &&
        this.selectedDestinationLocationId &&
        Number(this.selectedOriginLocationId) === Number(this.selectedDestinationLocationId)
      ) {
        this.selectedDestinationLocationId = null;
        this.$emit("alert", "warning", "El origen y el destino no pueden ser la misma ubicacion.", 3000);
      }

      this.resetTrips();

      if (this.selectedOriginLocationId && this.selectedDestinationLocationId) {
        await this.loadTripsBySelectedLocations();
      }
    },
    async handleOriginSelectionChange() {
      this.selectedDestinationLocationId = null;
      this.allowedDestinations = [];
      this.resetTrips();
      await this.loadAllowedDestinationsByOrigin();
    },
    async loadAllowedDestinationsByOrigin() {
      if (!this.selectedOriginLocationId) {
        this.allowedDestinations = [];
        return;
      }

      const branchId = this.selectedBranchId ?? this.branchId;

      if (branchId === "null" || branchId === null || branchId === "") {
        this.allowedDestinations = [];
        return;
      }

      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "express-sales-destinations",
          method: "POST",
          data: {
            branch_id: Number(branchId),
            date: this.dateFormatted,
            origin_id: Number(this.selectedOriginLocationId),
          },
        });

        this.allowedDestinations = result.success
          ? this.extractAllowedDestinations(result.data)
          : [];
      } catch (error) {
        this.allowedDestinations = [];
        this.$emit("alert", "error", "Ocurrio un error inesperado al buscar los destinos disponibles.", 3000);
      } finally {
        this.loading = false;
      }
    },
    extractAllowedDestinations(data) {
      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.destinations)) {
        return data.destinations;
      }

      if (Array.isArray(data?.allowedDestinations)) {
        return data.allowedDestinations;
      }

      return [];
    },
    async loadTripsBySelectedLocations() {
      if (!this.selectedOriginLocationId || !this.selectedDestinationLocationId) {
        this.trips = [];
        return;
      }

      const branchId = this.selectedBranchId ?? this.branchId;

      if (branchId === "null" || branchId === null || branchId === "") {
        this.trips = [];
        return;
      }

      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "express-sales-departures",
          method: "POST",
          data: {
            branch_id: Number(branchId),
            date: this.dateFormatted,
            origin_id: Number(this.selectedOriginLocationId),
            destination_id: Number(this.selectedDestinationLocationId),
          },
        });

        this.trips = result.success && Array.isArray(result.data?.trips) ? result.data.trips : [];
      } catch (error) {
        this.trips = [];
        this.$emit("alert", "error", "Ocurrio un error inesperado al buscar los viajes disponibles.", 3000);
      } finally {
        this.loading = false;
      }
    },
    selectTripRow(tripRow) {
      this.selectedTripRowId = tripRow.id;
      this.selectedTripRow = tripRow;
      this.ticketTypes = this.getTicketTypesFromTrip(tripRow.raw);
      this.quantityErrors = {};
      this.nextStep();
    },
    getTicketTypesFromTrip(trip = {}) {
      const source =
        trip.ticketTypes ||
        trip.ticket_types ||
        trip.tripFares ||
        trip.trip_fares ||
        trip.fares ||
        [];

      return (Array.isArray(source) ? source : [])
        .map((item) => this.normalizeTicketType(item))
        .filter(Boolean);
    },
    normalizeTicketType(item = {}) {
      const fareSegmentTicketType = item.fareSegmentTicketType || item.fare_segment_ticket_type || {};
      const basePrice =
        Number(item.base_price ?? item.price ?? fareSegmentTicketType.base_price ?? 0) || 0;
      const tripFareId = Number(item.trip_fare_id ?? item.tripFareId ?? item.id);
      const ticketTypeId = Number(
        item.ticket_type_id ??
          item.ticketTypeId ??
          fareSegmentTicketType.ticket_type_id ??
          fareSegmentTicketType.ticketTypeId
      );

      if (!Number.isFinite(tripFareId) || tripFareId <= 0) {
        return null;
      }

      return {
        id: tripFareId,
        trip_fare_id: tripFareId,
        ticket_type_id: Number.isFinite(ticketTypeId) && ticketTypeId > 0 ? ticketTypeId : null,
        fare_segment_id:
          item.fare_segment_id ??
          item.fareSegmentId ??
          item.fareSegment?.id ??
          item.fare_segment?.id ??
          null,
        ticketTypeName:
          item.ticketTypeName ||
          item.ticket_type_name ||
          item.name ||
          fareSegmentTicketType.ticketTypeName ||
          fareSegmentTicketType.ticket_type_name ||
          "Tipo de pasajero",
        name:
          item.name ||
          item.ticketTypeName ||
          fareSegmentTicketType.ticketTypeName ||
          "Tipo de pasajero",
        base_price: basePrice,
        price: basePrice,
        quantity: 0,
        line_total: 0,
      };
    },
    handleQuantityChange(ticket, value) {
      const ticketId = ticket.trip_fare_id || ticket.id;
      const previousQuantity = Number(ticket.quantity) || 0;
      const requestedQuantity = Math.max(0, Number(value) || 0);
      const otherQuantity = this.totalQuantity - previousQuantity;
      const maxAllowed = Math.max(0, this.maxQuantity - otherQuantity);
      const finalQuantity = Math.min(requestedQuantity, maxAllowed);

      ticket.quantity = finalQuantity;
      ticket.line_total = finalQuantity * (Number(ticket.base_price) || 0);
      this.quantityErrors = {
        ...this.quantityErrors,
        [ticketId]:
          requestedQuantity > maxAllowed ? `Maximo disponible: ${maxAllowed}` : null,
      };
    },
    buildSavePayload() {
      const branchId = this.selectedBranchId ?? this.branchId;
      const ticketItems = this.ticketTypes
        .filter((ticket) => Number(ticket.quantity) > 0)
        .map((ticket) => ({
          trip_fare_id: Number(ticket.trip_fare_id),
          ticket_type_id: Number(ticket.ticket_type_id),
          quantity: Number(ticket.quantity) || 0,
          base_price: Number(ticket.base_price) || 0,
          unit_price: Number(ticket.base_price) || 0,
          subtotal: Number(ticket.line_total) || 0,
          currency: "CLP",
        }));

      const payload = {
        branch_id: Number(branchId),
        date: this.dateFormatted,
        method: this.selectedMethod,
        quantity: this.totalQuantity,
        price: Number(this.selectedTripRow?.price ?? 0) || 0,
        total: this.total,
        fare_segment_id: Number(this.selectedTripRow?.fare_segment_id) || null,
        validate_capacity: true,
        pay: this.total,
        ticketItems,
      };

      if (this.selectedTripRow?.sourceType === "template") {
        payload.template_id = Number(this.selectedTripRow?.template_id);
      } else {
        payload.trip_id = Number(this.selectedTripRow?.trip_id);
      }

      return payload;
    },
    getTripFareSegmentId(trip = {}) {
      const directId =
        trip.fare_segment_id ??
        trip.fareSegmentId ??
        trip.fareSegment?.id ??
        trip.fare_segment?.id;

      if (directId !== undefined && directId !== null) {
        return Number(directId);
      }

      const fare = (
        trip.tripFares ||
        trip.trip_fares ||
        trip.ticketTypes ||
        trip.ticket_types ||
        trip.fares ||
        []
      )[0];

      return Number(
        fare?.fare_segment_id ??
          fare?.fareSegmentId ??
          fare?.fareSegment?.id ??
          fare?.fare_segment?.id ??
          null
      );
    },
    getTripTemplateId(trip = {}) {
      return Number(
        trip.template_id ??
          trip.templateId ??
          trip.trip_template_id ??
          trip.tripTemplateId ??
          trip.id
      );
    },
    getTripId(trip = {}) {
      return Number(trip.trip_id ?? trip.tripId ?? trip.id);
    },
    async save() {
      if (!this.canSave) {
        return;
      }

      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "express-sales-ticket",
          method: "POST",
          data: this.buildSavePayload(),
        });

        if (result.success) {
          this.$emit("alert", "success", result.message, 3000);
          this.$emit("saved", result.data?.ticket || null);
          this.close();
        } else {
          this.$emit("alert", "warning", this.getSaveErrorMessage(result), 5000);
        }
      } catch (error) {
        this.$emit("alert", "error", "Ocurrio un error inesperado al guardar la venta express.", 3000);
      } finally {
        this.loading = false;
      }
    },
    getSaveErrorMessage(result = {}) {
      const data = result.data || {};
      const details = data.details || {};

      if (data.msg === "InsufficientCapacity" || result.message === "InsufficientCapacity") {
        const availableCapacity = details.availableCapacity ?? 0;
        const requestedQuantity = details.requestedQuantity ?? this.totalQuantity;
        return `No hay capacidad disponible para esta salida. Disponible: ${availableCapacity}. Solicitado: ${requestedQuantity}.`;
      }

      return result.message || "No se pudo guardar la venta express.";
    },
    buildTripRows(trips = []) {
      return (Array.isArray(trips) ? trips : []).map((trip) => ({
        id: `${this.getTripSourceType(trip)}-${trip.id}`,
        trip_id: this.getTripId(trip),
        template_id: this.getTripTemplateId(trip),
        fare_segment_id: this.getTripFareSegmentId(trip),
        code: trip.code || trip.tripCode || trip.trip_code || "-",
        routeCode:
          trip.routeCode ||
          trip.route_code ||
          trip.route?.code ||
          trip.route?.routeCode ||
          "-",
        name: trip.name || "No especificado",
        origin: trip.origin || trip.originName || trip.origin_name || "-",
        destination: trip.destination || trip.destinationName || trip.destination_name || "-",
        schedule: trip.schedule || trip.departure || "-",
        arrival: trip.arrival || trip.end || "-",
        plate: trip.plate || trip.vehicleName || "-",
        internal_number: trip.internal_number ?? trip.internalNumber ?? "No asignado",
        price: Number(trip.price ?? trip.base_price ?? 0) || 0,
        availableCapacity:
          Number(
            trip.availableCapacity ??
              trip.available_capacity ??
              trip.availableSeats ??
              trip.available_seats ??
              trip.seats ??
              0
          ) || 0,
        availableSeats:
          Number(
            trip.availableCapacity ??
              trip.available_capacity ??
              trip.availableSeats ??
              trip.available_seats ??
              trip.seats ??
              0
          ) || 0,
        sourceType: this.getTripSourceType(trip),
        raw: trip,
      }));
    },
    getTripSourceType(trip = {}) {
      const source = String(trip.source || "").toLowerCase();
      if (source === "trip" || source === "template") {
        return source;
      }

      const rawType = String(trip.type || trip.origin_type || trip.originType || "").toLowerCase();

      if (
        rawType.includes("template") ||
        rawType.includes("plantilla") ||
        trip.is_template ||
        trip.isTemplate ||
        trip.template_id ||
        trip.templateId ||
        trip.trip_template_id ||
        trip.tripTemplateId
      ) {
        return "template";
      }

      return "trip";
    },
    getTripSourceLabel(sourceType) {
      return sourceType === "template" ? "Plantilla" : "Viaje";
    },
    getTripSourceColor(sourceType) {
      return sourceType === "template" ? "secondary" : this.paleteColors.primary;
    },
    toggleSort(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.sortBy = field;
      this.sortOrder = "asc";
    },
    sortIcon(field) {
      if (this.sortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.sortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    getSortValue(row, field) {
      if (field === "availableSeats" || field === "availableCapacity" || field === "price") {
        return Number(row?.[field] ?? 0);
      }

      return row?.[field] ?? "";
    },
    sortRows(rows = [], sortBy = "", sortOrder = "asc", valueGetter = () => null) {
      const direction = sortOrder === "desc" ? -1 : 1;

      return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
        const rawA = valueGetter(a, sortBy);
        const rawB = valueGetter(b, sortBy);
        const numA = Number(rawA);
        const numB = Number(rawB);
        const canCompareAsNumbers =
          rawA !== null &&
          rawA !== undefined &&
          rawA !== "" &&
          rawB !== null &&
          rawB !== undefined &&
          rawB !== "" &&
          !Number.isNaN(numA) &&
          !Number.isNaN(numB);

        if (canCompareAsNumbers) {
          return (numA - numB) * direction;
        }

        return String(rawA ?? "").localeCompare(String(rawB ?? ""), "es", {
          numeric: true,
          sensitivity: "base",
        }) * direction;
      });
    },
    formatNumber(value) {
      if (value === 0 || value === null || value === undefined || isNaN(value)) {
        return "0.00";
      }

      const normalized = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
      return normalized.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },
};
</script>


<style scoped>
/* Self-contained styles for the Express dialog, including Vuetify controls. */
.express-sale-form { height:100%; min-height:0; }
.ticket-sale-dialog-pro { display:flex; flex-direction:column; height:100vh; height:100dvh; min-height:0; color:#1e293b; background:#f6f8fb; border-radius:0; }
.ticket-sale-topbar { display:flex; align-items:center; flex-shrink:0; gap:12px; min-height:70px; padding:12px 24px; color:#fff; background:#004D40; border-bottom:1px solid #22664c; }
.ticket-sale-topbar__left { display:flex; align-items:center; gap:11px; min-width:0; }
.ticket-sale-topbar__icon { display:grid; place-items:center; flex:0 0 38px; width:38px; height:38px; border-radius:10px; background:#00796B; color:#fff; }
.ticket-sale-topbar__icon :deep(.v-icon) { font-size:23px!important; }
.ticket-sale-topbar__title { font-size:19px; font-weight:800; line-height:1.2; }
.ticket-sale-topbar__subtitle { color:#d4ece1; font-size:12px; line-height:1.4; margin-top:4px; }
.ticket-sale-step-chip { color:#e0f3e9; background:#00796B; font-size:11px; font-weight:650; }
.ticket-sale-close { flex-shrink:0; color:#fff; background:#00796B; border-radius:9px; }
.ticket-sale-body { flex:1; min-height:0; overflow-y:auto; padding:18px 24px 0!important; }
.ticket-sale-layout { max-width:1480px; margin:0 auto; }
.ticket-sale-section-card,.ticket-sale-summary-pro { padding:18px; background:#fff; border:1px solid #e4eaf2; border-radius:12px; box-shadow:0 4px 14px #15264b05; }
.ticket-sale-fill { height:100%; }
.ticket-sale-section-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.ticket-sale-section-title { color:#0f172a; font-size:15px; font-weight:800; line-height:1.4; }
.ticket-sale-section-subtitle { color:#526176; font-size:12px; line-height:1.5; margin-top:3px; }
.ticket-sale-mini-icon { display:grid; place-items:center; width:36px; height:36px; margin-right:10px; flex-shrink:0; border-radius:9px; background:#edf8f2; color:#00796B; }
.ticket-sale-label { display:block; margin-bottom:6px; color:#475569; font-size:12px; font-weight:700; }
.ticket-sale-section-card :deep(.v-row) { row-gap:9px; }
.ticket-sale-dialog-pro :deep(.v-field) { color:#233654; background:#fff; border-radius:9px!important; font-size:14px; }
.ticket-sale-dialog-pro :deep(.v-field__outline) { color:#c5cfdd; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field--focused .v-field__outline) { color:#00796B; }
.ticket-sale-dialog-pro :deep(.v-field__input),.ticket-sale-dialog-pro :deep(.v-label) { color:#233654; font-size:14px; font-weight:500; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__input::placeholder) { color:#64748b; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__prepend-inner .v-icon) { color:#64748b; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-input__details) { font-size:12px; }
.ticket-location-option__title { color:#1e293b; font-size:14px; line-height:1.45; white-space:normal; overflow-wrap:anywhere; }
.ticket-location-option__subtitle { margin-top:3px; color:#526176; font-size:12px; line-height:1.45; white-space:normal; }
:global(.busgo-express-location-menu .v-list) { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:6px; }
:global(.busgo-express-location-menu .v-list-item) { border-radius:8px; padding:10px 12px!important; margin:2px 0; }
:global(.busgo-express-location-menu .v-list-item--active) { background:#edf8f2; color:#16845b; }
.trip-sale-panel-pro { border:1px solid #e4eaf2; border-radius:10px; overflow-x:auto; }
.trip-sale-panel-pro__header,.trip-sale-row-pro { display:grid; grid-template-columns:1fr 2.2fr .8fr .8fr 1fr .9fr 1fr 112px; min-width:1000px; align-items:center; gap:12px; padding:12px 16px; }
.trip-sale-panel-pro__header { min-height:42px; color:#334155; background:#f3f6fa; font-size:11px; font-weight:800; border-bottom:1px solid #e4eaf2; }
.trip-sale-sortable-header { display:flex; align-items:center; gap:5px; cursor:pointer; user-select:none; }
.trip-sale-sortable-header:hover { color:#16845b; }
.trip-sale-row-pro { min-height:68px; cursor:pointer; background:#fff; border-bottom:1px solid #edf1f6; }
.trip-sale-row-pro:last-child { border-bottom:0; }
.trip-sale-row-pro:hover { background:#f5fbf7; }
.trip-sale-row-pro--selected { background:#edf8f2; box-shadow:inset 3px 0 #16845b; }
.trip-sale-code,.trip-sale-strong,.trip-sale-route__name { color:#1e293b; font-size:13px; font-weight:750; }
.trip-sale-route { min-width:0; }
.trip-sale-route__title-row { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.trip-sale-route__meta,.trip-sale-muted { color:#526176; font-size:12px; line-height:1.5; margin-top:3px; overflow-wrap:anywhere; }
.trip-sale-price { color:#116546; font-size:13px; font-weight:750; font-variant-numeric:tabular-nums; }
.ticket-sale-empty { padding:30px 18px; text-align:center; color:#718198; }
.ticket-sale-empty__title { color:#475569; font-size:14px; font-weight:750; margin-top:10px; }
.ticket-sale-empty__text { color:#64748b; font-size:12px; line-height:1.5; margin-top:5px; }
.ticket-sale-summary-grid { display:grid; grid-template-columns:1.8fr 1fr .8fr 1fr; gap:12px; margin-top:14px; }
.ticket-sale-summary-grid > div { min-width:0; padding:12px; background:#f8fafc; border:1px solid #e7edf5; border-radius:9px; }
.ticket-sale-summary-grid span { display:block; color:#64748b; font-size:11px; font-weight:650; margin-bottom:5px; }
.ticket-sale-summary-grid strong { display:block; color:#233654; font-size:14px; line-height:1.4; font-weight:750; overflow-wrap:anywhere; }
.ticket-sale-summary-grid > div:last-child { background:#edf8f2; border-color:#cce9da; }
.ticket-sale-summary-grid > div:last-child strong { color:#16845b; }
.ticket-type-list { display:flex; flex-direction:column; gap:10px; }
.ticket-type-card { padding:12px 14px; margin-bottom:9px; border:1px solid #e4eaf2; border-radius:10px; background:#fff; }
.ticket-type-card:last-child { margin-bottom:0; }
.ticket-type-card__main { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.ticket-type-card__main > div:first-child { min-width:0; }
.ticket-type-card__title { color:#233654; font-size:14px; font-weight:750; overflow-wrap:anywhere; }
.ticket-type-card__price { color:#526176; font-size:12px; margin-top:4px; }
.ticket-type-card__input { flex:0 0 100px; width:100px; }
.ticket-type-card__total { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:8px 10px; margin-top:10px; border-radius:7px; background:#edf8f2; color:#116546; font-size:12px; }
.payment-methods-grid-pro { display:grid; gap:9px; }
.payment-method-card-pro { color:#334155; background:#fff; border:1px solid #dce4ef; border-radius:9px!important; box-shadow:none!important; cursor:pointer; }
.payment-method-content-pro { display:flex; align-items:center; gap:10px; padding:12px!important; min-height:48px; }
.payment-method-label { font-size:13px; font-weight:700; }
.payment-method-selected { background:#edf8f2; border-color:#16845b; box-shadow:inset 0 0 0 1px #16845b!important; }
.payment-method-disabled { cursor:not-allowed; opacity:.5; background:#f8fafc; }
.ticket-total-box { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:15px; margin-top:16px; border-radius:10px; background:#104b36; color:#fff; }
.ticket-total-box span { font-size:12px; font-weight:650; }
.ticket-total-box strong { font-size:20px; font-weight:800; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.ticket-sale-footer-actions { display:flex; align-items:center; gap:10px; position:sticky; bottom:0; z-index:3; margin-top:16px; padding:14px 0; border-top:1px solid #e1e8f1; background:#f6f8fb; }
.ticket-sale-btn-primary,.ticket-sale-btn-secondary { min-height:40px; padding-inline:18px; border-radius:9px!important; font-size:13px; font-weight:750; letter-spacing:0; text-transform:none; box-shadow:none!important; }
.ticket-sale-btn-primary { color:#fff!important; background:#16845b!important; }
.ticket-sale-btn-secondary { color:#475569!important; background:#fff!important; border:1px solid #dce3ed; }
.ticket-sale-btn-primary.v-btn--disabled { background:#dce3ed!important; color:#64748b!important; }
.ticket-sale-btn-primary:focus-visible,.ticket-sale-btn-secondary:focus-visible { outline:3px solid #78c9a2; outline-offset:3px; }
@media(max-width:959px) { .ticket-sale-topbar { padding-inline:17px; }.ticket-sale-body { padding:15px 17px 0!important; }.ticket-sale-summary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:600px) {
  .ticket-sale-topbar { padding:12px; gap:9px; }
  .ticket-sale-topbar__left { flex:1; gap:9px; }
  .ticket-sale-topbar__title { font-size:17px; }
  .ticket-sale-topbar__subtitle { font-size:11px; }
  .ticket-sale-step-chip { display:none; }
  .ticket-sale-body { padding:12px 12px 0!important; }
  .ticket-sale-section-card,.ticket-sale-summary-pro { padding:14px; }
  .ticket-sale-summary-grid { gap:8px; }
  .ticket-sale-summary-grid > div:first-child { grid-column:1 / -1; }
  .ticket-type-card { padding:11px; }
  .ticket-type-card__input { flex-basis:88px; width:88px; }
  .ticket-sale-footer-actions .v-spacer { display:none; }
  .ticket-sale-btn-primary,.ticket-sale-btn-secondary { flex:1; min-width:0; padding-inline:12px; }
}
</style>
