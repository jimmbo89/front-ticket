<template>
  <v-dialog v-model="dialogModel" fullscreen transition="dialog-bottom-transition">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="ticket-sale-dialog-pro">
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

          <v-btn icon="mdi-close" variant="text" size="small" class="ticket-sale-close" @click="close" />
        </div>

        <v-card-text class="ticket-sale-body">
          <div v-if="step === 1" class="ticket-sale-layout">
            <div class="ticket-sale-section-card">
              <div class="ticket-sale-section-header">
                <div>
                  <div class="ticket-sale-section-title">Seleccion del tramo</div>
                  <div class="ticket-sale-section-subtitle">
                    Elige fecha, origen, destino y luego selecciona el viaje disponible.
                  </div>
                </div>
              </div>

              <v-row dense>
                <v-col v-if="mostrarFila" cols="12">
                  <label class="ticket-sale-label">Sucursal</label>
                  <v-autocomplete
                    v-model="selectedBranchId"
                    :items="branches"
                    placeholder="Seleccione la sucursal"
                    prepend-inner-icon="mdi-store"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :no-data-text="'No hay sucursales disponibles'"
                    @update:model-value="onBranchChange"
                  />
                </v-col>

                <v-col cols="12">
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
                        density="comfortable"
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
                        :color="paleteColors.primary"
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
                    density="comfortable"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :no-data-text="'No hay ubicaciones disponibles'"
                    :menu-props="{ maxHeight: 360, maxWidth: 520 }"
                    @update:model-value="handleLocationSelectionChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props" title="" class="ticket-location-option">
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
                    density="comfortable"
                    rounded="lg"
                    clearable
                    hide-details="auto"
                    :no-data-text="'No hay ubicaciones disponibles'"
                    :menu-props="{ maxHeight: 360, maxWidth: 520 }"
                    @update:model-value="handleLocationSelectionChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props" title="" class="ticket-location-option">
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
                    density="comfortable"
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
                    <span>Codigo</span>
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
                    <span>Vehiculo</span>
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
                        :color="selectedTripRowId === tripRow.id ? paleteColors.active : paleteColors.primary"
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
                    Cambia la fecha, origen, destino o busqueda para encontrar viajes.
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
                        <v-icon size="24" :color="selectedMethod === method.value ? paleteColors.active : paleteColors.primary">
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
      return (Array.isArray(this.locations) ? this.locations : []).filter(
        (location) => Number(location.id) !== Number(this.selectedOriginLocationId)
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
      this.resetTrips();
      this.loadTripsBySelectedLocations();
    },
    async onBranchChange() {
      this.selectedOriginLocationId = null;
      this.selectedDestinationLocationId = null;
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

      this.loading = true;
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
        this.loading = false;
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
