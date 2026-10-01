<template>
  <v-dialog v-model="dialogModel" fullscreen transition="dialog-bottom-transition">
    <v-card class="ticket-sale-dialog-pro" elevation="0">
      <div class="ticket-sale-topbar">
        <div class="ticket-sale-topbar__left">
          <div class="ticket-sale-topbar__icon">
            <v-icon size="25">mdi-bus</v-icon>
          </div>
          <div>
            <div class="ticket-sale-topbar__title">Venta a bordo</div>
            <div class="ticket-sale-topbar__subtitle">
              {{ step === 2 ? 'Venta de pasajes a bordo por tramo y tipo de pasajero' : 'Selecciona el contexto operativo y la ruta antes de iniciar la venta' }}
            </div>
          </div>
        </div>

        <v-spacer />

        <v-chip size="small" variant="flat" class="ticket-sale-step-chip">
          {{ step === 1 ? "Paso 1 · Contexto, ruta y viaje" : "Paso 2 · Tramo y tarifas" }}
        </v-chip>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="ticket-sale-close"
          aria-label="Cerrar venta a bordo"
          :disabled="loadingContext || loadingRoutes || loadingActiveTrips || loadingSubmit"
          @click="close"
        />
      </div>

      <v-card-text class="ticket-sale-body">
        <div class="ticket-sale-layout">
          <div v-if="step === 1">
          <section class="ticket-sale-section-card">
            <div class="ticket-sale-section-header">
              <div class="onboard-section-heading">
                <div class="onboard-section-icon">
                  <v-icon size="19">mdi-briefcase-account-outline</v-icon>
                </div>
                <div>
                  <div class="ticket-sale-section-title">¿Dónde estás operando?</div>
                  <div class="ticket-sale-section-subtitle">
                    Selecciona la sucursal, el vehículo y el dispositivo habilitado para esta venta.
                  </div>
                </div>
              </div>
              <v-progress-circular v-if="loadingContext" indeterminate size="22" width="2" color="#b45309" />
            </div>

            <v-alert v-if="contextError" type="warning" variant="tonal" density="compact" class="onboard-alert">
              {{ contextError }}
            </v-alert>

            <v-row dense>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="selectedBranchId"
                  :items="branches"
                  item-title="name"
                  item-value="id"
                  label="Sucursal"
                  placeholder="Seleccione la sucursal"
                  prepend-inner-icon="mdi-store-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details="auto"
                  :loading="loadingContext"
                  :disabled="loadingContext"
                  :menu-props="{ contentClass: 'onboard-branch-menu' }"
                  no-data-text="No hay sucursales autorizadas"
                  @update:model-value="onBranchChange"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-avatar="imageUrl(item.raw.image)">
                      <v-list-item-subtitle>{{ item.raw.address || "Dirección no disponible" }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="selectedVehicleId"
                  :items="selectedBranchVehicles"
                  item-title="vehicleLabel"
                  item-value="id"
                  label="Vehículo"
                  placeholder="Seleccione el vehículo"
                  prepend-inner-icon="mdi-bus-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details="auto"
                  :disabled="!selectedBranchId || loadingContext"
                  :menu-props="{ contentClass: 'onboard-vehicle-menu' }"
                  no-data-text="No hay vehículos disponibles"
                  @update:model-value="onVehicleChange"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-avatar="imageUrl(item.raw.image)" :title="item.raw.vehicleLabel">
                      <v-list-item-subtitle class="onboard-option-meta">
                        Interno {{ item.raw.internal_number || "—" }} · {{ item.raw.brand || "Sin marca" }} {{ item.raw.model || "" }} · {{ item.raw.seats ?? "N/D" }} asientos
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="selectedDeviceId"
                  :items="selectedVehicleDevices"
                  item-title="name"
                  item-value="id"
                  label="Dispositivo (opcional)"
                  placeholder="Seleccione el dispositivo"
                  prepend-inner-icon="mdi-devices"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details="auto"
                  :disabled="!selectedVehicleId || loadingContext || loadingRoutes"
                  :loading="loadingRoutes"
                  :item-props="deviceItemProps"
                  :menu-props="{ contentClass: 'onboard-device-menu' }"
                  no-data-text="No hay dispositivos asociados"
                  @update:model-value="onDeviceChange"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :prepend-avatar="imageUrl(item.raw.image)" :title="item.raw.name">
                      <v-list-item-subtitle class="onboard-option-meta">
                        Serie {{ item.raw.serial || "—" }} · {{ item.raw.available ? "Disponible" : "No disponible" }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>

            <div v-if="selectedBranch || selectedVehicle || selectedDevice" class="onboard-context-summary">
              <div v-if="selectedBranch" class="onboard-context-summary__item">
                <v-icon size="16">mdi-store-outline</v-icon>
                <span>{{ selectedBranch.name }}</span>
              </div>
              <v-icon v-if="selectedBranch && selectedVehicle" size="15" class="onboard-context-summary__arrow">mdi-chevron-right</v-icon>
              <div v-if="selectedVehicle" class="onboard-context-summary__item">
                <v-icon size="16">mdi-bus-outline</v-icon>
                <span>{{ selectedVehicle.vehicleLabel }}</span>
              </div>
              <v-icon v-if="selectedVehicle && selectedDevice" size="15" class="onboard-context-summary__arrow">mdi-chevron-right</v-icon>
              <div v-if="selectedDevice" class="onboard-context-summary__item">
                <v-icon size="16">mdi-devices</v-icon>
                <span>{{ selectedDevice.name }}</span>
              </div>
            </div>
          </section>

          <section v-if="hasRouteContext || loadingRoutes || routesLoaded" class="ticket-sale-section-card onboard-route-card">
            <div class="ticket-sale-section-header">
              <div class="onboard-section-heading">
                <div class="onboard-section-icon onboard-section-icon--route">
                  <v-icon size="19">mdi-road-variant</v-icon>
                </div>
                <div>
                  <div class="ticket-sale-section-title">Ruta disponible</div>
                  <div class="ticket-sale-section-subtitle">
                    Las rutas se filtran según la sucursal y vehículo; el dispositivo se envía cuando se selecciona.
                  </div>
                </div>
              </div>
              <v-progress-circular v-if="loadingRoutes" indeterminate size="22" width="2" color="#b45309" />
            </div>

            <v-alert v-if="!loadingRoutes && !availableRoutes.length" type="info" variant="tonal" density="compact" class="onboard-alert">
              No hay rutas disponibles para este contexto operativo.
            </v-alert>

            <v-autocomplete
              v-else
              v-model="selectedRouteId"
              :items="availableRoutes"
              item-title="routeLabel"
              item-value="id"
              label="Ruta"
              placeholder="Seleccione la ruta"
              prepend-inner-icon="mdi-road-variant"
              variant="outlined"
              density="compact"
              clearable
              hide-details="auto"
              :loading="loadingRoutes"
              :menu-props="{ contentClass: 'onboard-route-menu' }"
              no-data-text="No hay rutas disponibles"
              @update:model-value="onRouteChange"
            >
              <template #selection="{ item }">
                <span class="onboard-route-selection">{{ item.raw.routeLabel }}</span>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="{ ...props, title: undefined, subtitle: undefined }" class="onboard-route-option">
                  <div class="onboard-route-heading">
                    <strong>{{ item.raw.routeCode || item.raw.routeLabel }}</strong>
                    <span v-if="item.raw.estimated"><v-icon size="14">mdi-clock-outline</v-icon>{{ formatDuration(item.raw.estimated) }}</span>
                  </div>
                  <div class="onboard-route-journey">
                    <div class="onboard-route-place">
                      <v-avatar size="38" rounded="lg"><v-img :src="imageUrl(item.raw.originImage)" cover><template #error><v-icon size="18">mdi-map-marker-outline</v-icon></template></v-img></v-avatar>
                      <div><small>Origen</small><strong>{{ item.raw.originAddress || "Sin dirección" }}</strong></div>
                    </div>
                    <v-icon class="onboard-route-arrow" size="19">mdi-arrow-right</v-icon>
                    <div class="onboard-route-place">
                      <v-avatar size="38" rounded="lg"><v-img :src="imageUrl(item.raw.destinationImage)" cover><template #error><v-icon size="18">mdi-map-marker-outline</v-icon></template></v-img></v-avatar>
                      <div><small>Destino</small><strong>{{ item.raw.destinationAddress || "Sin dirección" }}</strong></div>
                    </div>
                  </div>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-progress-linear v-if="loadingActiveTrips" indeterminate color="#b45309" class="mt-4" aria-label="Consultando viajes activos" />
            <v-alert v-if="activeTripsError" type="warning" variant="tonal" density="compact" class="mt-4">
              {{ activeTripsError }}
              <v-btn variant="text" size="small" :loading="loadingActiveTrips" @click="loadActiveTrips">Reintentar</v-btn>
            </v-alert>
            <div v-if="selectedRouteId && activeTripsLoaded && activeTrips.length && !loadingActiveTrips && !activeTripsError" class="mt-4">
              <div class="ticket-sale-section-header">
                <div>
                  <div class="ticket-sale-section-title">Viajes activos</div>
                  <div class="ticket-sale-section-subtitle">Selecciona un viaje para continuar con los pasajes.</div>
                </div>
              </div>
            <div class="onboard-trip-list">
              <button
                v-for="trip in activeTrips"
                :key="trip.id"
                type="button"
                class="onboard-trip-option"
                :class="{ 'onboard-trip-option--selected': Number(selectedTripId) === Number(trip.id) }"
                @click="selectActiveTrip(trip)"
              >
                <span class="onboard-trip-option__icon"><v-icon size="21">mdi-bus-clock</v-icon></span>
                <span class="onboard-trip-option__content">
                  <strong>{{ trip.code || `Viaje #${trip.id}` }}</strong>
                  <small>{{ trip.schedule || trip.start || "Horario no disponible" }}</small>
                  <small v-if="trip.worker?.name">Operador: {{ trip.worker.name }}</small>
                </span>
                <span class="onboard-trip-option__meta">
                  <v-chip size="small" :color="Number(selectedTripId) === Number(trip.id) ? '#b45309' : '#64748b'" :variant="Number(selectedTripId) === Number(trip.id) ? 'flat' : 'tonal'">
                    {{ Number(selectedTripId) === Number(trip.id) ? "Seleccionado" : "Activo" }}
                  </v-chip>
                  <v-icon v-if="Number(selectedTripId) === Number(trip.id)" color="#b45309">mdi-check-circle</v-icon>
                </span>
              </button>
            </div>
            </div>
            <div v-if="selectedRouteId && activeTripsLoaded && !activeTrips.length && !loadingActiveTrips && !activeTripsError" class="d-flex justify-end mt-4">
              <v-btn class="ticket-sale-btn-primary" variant="flat" append-icon="mdi-arrow-right" @click="step = 2">
                Continuar
              </v-btn>
            </div>
          </section>

          <div v-if="!branches.length && !loadingContext && !contextError" class="onboard-empty-state">
            <v-icon size="24">mdi-store-off-outline</v-icon>
            <span>No tienes sucursales autorizadas para operar a bordo.</span>
          </div>
          </div>

          <div v-else class="ticket-sale-layout">
            <div class="ticket-sale-summary-pro">
              <div class="ticket-sale-section-title">Resumen de venta a bordo</div>
              <div class="ticket-sale-section-subtitle">Revisa el recorrido y la cantidad de pasajes.</div>
              <div class="ticket-sale-summary-grid">
                <div>
                  <span>Recorrido</span>
                  <strong>{{ selectedOriginStop?.stopLabel || "Selecciona el origen" }} → {{ selectedDestinationStop?.stopLabel || "Selecciona el destino" }}</strong>
                </div>
                <div><span>Ruta</span><strong>{{ selectedRoute?.routeCode || selectedRoute?.name || "—" }}</strong></div>
                <div><span>Pasajes</span><strong>{{ totalQuantity }}</strong></div>
                <div><span>Total</span><strong>{{ formatPrice(total) }} {{ saleCurrency }}</strong></div>
              </div>
            </div>

            <v-row dense class="mt-4">
              <v-col cols="12" md="8">
                <section class="ticket-sale-section-card">
                  <div class="ticket-sale-section-header">
                    <div>
                      <div class="ticket-sale-section-title">Selección del tramo</div>
                      <div class="ticket-sale-section-subtitle">Elige el origen y el destino para consultar las tarifas disponibles.</div>
                    </div>
                  </div>
                  <v-alert v-if="!commercialStops.length" type="info" variant="tonal" density="compact">
                    Esta ruta no tiene paradas comerciales configuradas.
                  </v-alert>
                  <v-row v-else dense>
                    <v-col cols="12" md="6">
                      <label class="ticket-sale-label" for="onboard-origin">Origen</label>
                      <v-autocomplete
                        id="onboard-origin"
                        v-model="selectedOriginStopId"
                        :items="originStopOptions"
                        item-title="stopLabel"
                        item-value="id"
                        placeholder="Seleccione el origen"
                        prepend-inner-icon="mdi-map-marker-outline"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        clearable
                        hide-details="auto"
                        no-data-text="No hay orígenes con tramos disponibles"
                        :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-onboard-location-menu' }"
                        @update:model-value="onOriginStopChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="{ ...props, title: undefined }" class="ticket-location-option">
                            <div class="ticket-location-option__title">{{ item.raw.stopLabel }}</div>
                            <div class="ticket-location-option__subtitle">Parada {{ item.raw.stop_order }}</div>
                          </v-list-item>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6">
                      <label class="ticket-sale-label" for="onboard-destination">Destino</label>
                      <v-autocomplete
                        id="onboard-destination"
                        v-model="selectedDestinationStopId"
                        :items="destinationStopOptions"
                        item-title="stopLabel"
                        item-value="id"
                        placeholder="Seleccione el destino"
                        prepend-inner-icon="mdi-map-marker-check-outline"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        clearable
                        hide-details="auto"
                        :disabled="!selectedOriginStopId"
                        no-data-text="No hay destinos con tramos disponibles"
                        :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-onboard-location-menu' }"
                        @update:model-value="onDestinationStopChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="{ ...props, title: undefined }" class="ticket-location-option">
                            <div class="ticket-location-option__title">{{ item.raw.stopLabel }}</div>
                            <div class="ticket-location-option__subtitle">Parada {{ item.raw.stop_order }}</div>
                          </v-list-item>
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col v-if="availableFareSegments.length > 1" cols="12">
                      <label class="ticket-sale-label" for="onboard-fare">Tarifa del tramo</label>
                      <v-select
                        id="onboard-fare"
                        v-model="selectedFareSegmentId"
                        :items="availableFareSegments"
                        :item-title="fareSegmentLabel"
                        item-value="id"
                        placeholder="Seleccione la tarifa"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        @update:model-value="resetPassengerQuantities"
                      />
                    </v-col>
                  </v-row>
                </section>

                <section class="ticket-sale-section-card mt-4">
                  <div class="ticket-sale-section-header">
                    <div>
                      <div class="ticket-sale-section-title">Tipos de pasajero</div>
                      <div class="ticket-sale-section-subtitle">Ingresa la cantidad por tipo de pasaje.</div>
                    </div>
                  </div>
                  <div class="ticket-type-list">
                    <div v-if="passengerFares.length">
                      <div v-for="fare in passengerFares" :key="fare.id" class="ticket-type-card">
                        <div class="ticket-type-card__main">
                          <div>
                            <div class="ticket-type-card__title">{{ fare.name }}</div>
                            <div class="ticket-type-card__price">{{ formatPrice(fare.price) }} {{ saleCurrency }}</div>
                          </div>
                          <v-text-field
                            :model-value="passengerQuantities[fare.id] ?? 0"
                            @update:model-value="setPassengerQuantity(fare.id, $event)"
                            :aria-label="'Cantidad de pasajes: ' + fare.name"
                            variant="outlined"
                            density="compact"
                            rounded="lg"
                            type="number"
                            min="0"
                            step="1"
                            hide-details="auto"
                            class="ticket-type-card__input"
                            :error-messages="quantityErrors[fare.id]"
                          />
                        </div>
                        <div v-if="quantityFor(fare.id) > 0" class="ticket-type-card__total">
                          Total:
                          <strong>{{ formatPrice(fare.price * quantityFor(fare.id)) }} {{ saleCurrency }}</strong>
                        </div>
                      </div>
                    </div>
                    <div v-else class="ticket-sale-empty">
                      <v-icon size="42">mdi-ticket-confirmation-outline</v-icon>
                      <div class="ticket-sale-empty__title">{{ selectedFareSegment ? "No hay tipos de pasaje disponibles" : "Selecciona el tramo" }}</div>
                      <div class="ticket-sale-empty__text">
                        {{ selectedFareSegment ? "Este tramo no tiene tarifas de pasajero habilitadas." : "Elige el origen y el destino para ver las tarifas." }}
                      </div>
                    </div>
                  </div>
                </section>
              </v-col>

              <v-col cols="12" md="4">
                <aside class="ticket-sale-section-card onboard-sale-sidebar">
                  <div class="ticket-sale-section-header">
                    <div>
                      <div class="ticket-sale-section-title">Detalle de venta</div>
                      <div class="ticket-sale-section-subtitle">Revisa tu selección.</div>
                    </div>
                  </div>
                  <dl class="onboard-detail-list">
                    <div><dt>Sucursal</dt><dd>{{ selectedBranch?.name || "—" }}</dd></div>
                    <div><dt>Vehículo</dt><dd>{{ selectedVehicle?.vehicleLabel || "—" }}</dd></div>
                    <div v-if="selectedDevice"><dt>Dispositivo</dt><dd>{{ selectedDevice.name }}</dd></div>
                    <div v-if="selectedTrip?.code"><dt>Viaje</dt><dd>{{ selectedTrip.code }}</dd></div>
                  </dl>
                  <div v-if="selectedPassengerFares.length" class="onboard-passenger-summary">
                    <div v-for="fare in selectedPassengerFares" :key="fare.id">
                      <span>{{ quantityFor(fare.id) }} × {{ fare.name }}</span>
                      <strong>{{ formatPrice(fare.price * quantityFor(fare.id)) }} {{ saleCurrency }}</strong>
                    </div>
                  </div>
                  <div class="ticket-sale-section-header ticket-payment-header mt-4">
                    <div>
                      <div class="ticket-sale-section-title">Pago</div>
                      <div class="ticket-sale-section-subtitle">Medio de pago</div>
                    </div>
                  </div>
                  <div class="payment-methods-grid-pro">
                    <v-card
                      v-for="method in paymentMethods"
                      :key="method.value"
                      tag="button"
                      type="button"
                      :disabled="method.disabled"
                      :aria-pressed="selectedMethod === method.value"
                      class="payment-method-card-pro"
                      :class="{ 'payment-method-selected': selectedMethod === method.value, 'payment-method-disabled': method.disabled }"
                      @click="!method.disabled && (selectedMethod = method.value)"
                    >
                      <v-card-text class="payment-method-content-pro">
                        <v-icon size="24" :color="selectedMethod === method.value ? '#78350f' : '#b45309'">{{ method.icon }}</v-icon>
                        <div class="payment-method-label">{{ method.text }}</div>
                      </v-card-text>
                    </v-card>
                  </div>
                  <div class="ticket-total-box ticket-total-box-compact">
                    <span>Total</span>
                    <strong>{{ formatPrice(total) }} {{ saleCurrency }}</strong>
                  </div>
                </aside>
              </v-col>
            </v-row>

            <v-alert v-if="submitError" type="error" variant="tonal" density="compact" class="mt-4">
              {{ submitError }}
            </v-alert>

            <div class="ticket-sale-footer-actions">
              <v-btn class="ticket-sale-btn-secondary" variant="flat" prepend-icon="mdi-arrow-left" @click="goBackFromSegmentStep">
                Volver
              </v-btn>
              <v-spacer />
              <span class="onboard-pending-sale">Método de pago: Efectivo</span>
              <v-btn class="ticket-sale-btn-primary" variant="flat" prepend-icon="mdi-content-save-outline" :disabled="!canSubmit" :loading="loadingSubmit" @click="save">
                Guardar venta
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider v-if="step === 1" />
      <v-card-actions v-if="step === 1" class="onboard-sale-actions">
        <span class="onboard-sale-actions__hint">
          <v-icon size="16">mdi-information-outline</v-icon>
          {{ activeTrips.length > 1 ? 'Selecciona un viaje para continuar con los pasajes.' : 'Selecciona el contexto y la ruta para comenzar.' }}
        </span>
        <v-spacer />
        <v-btn variant="text" class="ticket-sale-btn-secondary" :disabled="loadingContext || loadingRoutes || loadingActiveTrips || loadingSubmit" @click="close">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "OnBoardSaleDialog",
  emits: ["update:modelValue", "saved"],
  props: {
    modelValue: { type: Boolean, default: false },
  },
  data: () => ({
    loadingContext: false,
    loadingRoutes: false,
    loadingActiveTrips: false,
    loadingSubmit: false,
    contextError: "",
    activeTripsError: "",
    submitError: "",
    branches: [],
    step: 1,
    selectedBranchId: null,
    selectedVehicleId: null,
    selectedDeviceId: null,
    selectedRouteId: null,
    selectedTripId: null,
    selectedOriginStopId: null,
    selectedDestinationStopId: null,
    selectedFareSegmentId: null,
    passengerQuantities: {},
    quantityErrors: {},
    selectedMethod: "Efectivo",
    paymentMethods: [
      { text: "Efectivo", value: "Efectivo", icon: "mdi-cash" },
      { text: "Crédito", value: "Credito", icon: "mdi-credit-card-outline", disabled: true },
      { text: "Débito", value: "Debito", icon: "mdi-bank-outline", disabled: true },
    ],
    availableRoutes: [],
    activeTrips: [],
    activeTripsLoaded: false,
    activeTripRequestId: 0,
    routesLoaded: false,
    routeRequestId: 0,
  }),
  computed: {
    dialogModel: {
      get() { return this.modelValue; },
      set(value) { this.$emit("update:modelValue", value); },
    },
    selectedBranch() {
      return this.branches.find((branch) => Number(branch.id) === Number(this.selectedBranchId)) || null;
    },
    selectedBranchVehicles() {
      return this.toArray(this.selectedBranch?.vehicles).map((vehicle) => ({
        ...vehicle,
        id: vehicle.id ?? vehicle.vehicle_id ?? vehicle.vehicleId,
        vehicleLabel: vehicle.vehicleLabel || vehicle.plate || vehicle.name || `Vehículo ${vehicle.id}`,
      }));
    },
    selectedVehicle() {
      return this.selectedBranchVehicles.find((vehicle) => Number(vehicle.id) === Number(this.selectedVehicleId)) || null;
    },
    selectedVehicleDevices() {
      return this.toArray(this.selectedVehicle?.devices).map((device) => ({
        ...device,
        id: device.id ?? device.device_id ?? device.deviceId,
        available: device.available === true,
      }));
    },
    selectedDevice() {
      return this.selectedVehicleDevices.find((device) => Number(device.id) === Number(this.selectedDeviceId)) || null;
    },
    selectedRoute() {
      return this.availableRoutes.find((route) => Number(route.id) === Number(this.getValueId(this.selectedRouteId))) || null;
    },
    selectedTrip() {
      return this.activeTrips.find((trip) => Number(trip.id) === Number(this.getValueId(this.selectedTripId))) || null;
    },
    saleTripId() {
      return this.selectedTrip?.id ?? null;
    },
    commercialStops() {
      const stops = this.toArray(this.selectedRoute?.commercial?.tripStops).map((stop, index) => {
        const id = stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id ?? stop.route_stop?.id;
        const location = stop.routeStop?.location ?? stop.route_stop?.location ?? {};
        return {
          ...stop,
          id,
          stop_order: stop.stop_order ?? stop.stopOrder ?? index + 1,
          stopLabel: location.address || stop.address || stop.name || `Parada ${index + 1}`,
        };
      }).filter((stop) => stop.id !== null && stop.id !== undefined && stop.id !== "");

      return stops.sort((a, b) => Number(a.stop_order) - Number(b.stop_order));
    },
    commercialSegments() {
      return this.toArray(this.selectedRoute?.commercial?.segments).filter((segment) => {
        if (!this.isEnabled(segment.active)) return false;
        const origin = this.commercialStops.find((stop) => Number(stop.id) === Number(segment.origin_route_stop_id));
        const destination = this.commercialStops.find((stop) => Number(stop.id) === Number(segment.destination_route_stop_id));
        return origin && destination && this.isEnabled(origin.can_board) && this.isEnabled(destination.can_alight)
          && Number(destination.stop_order) > Number(origin.stop_order);
      });
    },
    originStopOptions() {
      return this.commercialStops.filter((stop) => this.commercialSegments.some((segment) => Number(segment.origin_route_stop_id) === Number(stop.id)));
    },
    selectedOriginStop() {
      return this.commercialStops.find((stop) => Number(stop.id) === Number(this.getValueId(this.selectedOriginStopId))) || null;
    },
    destinationStopOptions() {
      if (!this.selectedOriginStop) return [];
      return this.commercialStops.filter((stop) => this.commercialSegments.some((segment) =>
        Number(segment.origin_route_stop_id) === Number(this.selectedOriginStop.id)
        && Number(segment.destination_route_stop_id) === Number(stop.id)));
    },
    selectedDestinationStop() {
      return this.commercialStops.find((stop) => Number(stop.id) === Number(this.getValueId(this.selectedDestinationStopId))) || null;
    },
    availableFareSegments() {
      if (!this.selectedOriginStop || !this.selectedDestinationStop) return [];
      const originId = Number(this.selectedOriginStop.id);
      const destinationId = Number(this.selectedDestinationStop.id);
      const originOrder = Number(this.selectedOriginStop.stop_order) || 0;
      const destinationOrder = Number(this.selectedDestinationStop.stop_order) || 0;
      return this.commercialSegments
        .filter((segment) => {
          const segmentOriginId = Number(segment.origin_route_stop_id ?? segment.originRouteStopId ?? segment.originRouteStop?.id ?? segment.origin_route_stop?.id);
          const segmentDestinationId = Number(segment.destination_route_stop_id ?? segment.destinationRouteStopId ?? segment.destinationRouteStop?.id ?? segment.destination_route_stop?.id);
          return segmentOriginId === originId
            && segmentDestinationId === destinationId
            && destinationOrder > originOrder;
        });
    },
    selectedFareSegment() {
      return this.availableFareSegments.find((segment) => Number(segment.id) === Number(this.getValueId(this.selectedFareSegmentId))) || null;
    },
    passengerFares() {
      return this.toArray(this.selectedFareSegment?.passenger_types)
        .filter((fare) => this.isEnabled(fare.active) && Number(fare.id) > 0)
        .map((fare) => ({
          ...fare,
          name: fare.name || fare.ticket_type?.name || "Pasajero",
          price: Number(fare.price ?? fare.base_price),
        }))
        .filter((fare) => Number.isFinite(fare.price) && fare.price >= 0);
    },
    selectedPassengerFares() {
      return this.passengerFares.filter((fare) => this.quantityFor(fare.id) > 0);
    },
    totalQuantity() {
      return this.passengerFares.reduce((sum, fare) => sum + this.quantityFor(fare.id), 0);
    },
    total() {
      return this.passengerFares.reduce((sum, fare) => sum + fare.price * this.quantityFor(fare.id), 0);
    },
    saleCurrency() {
      return this.selectedFareSegment?.currency || "CLP";
    },
    ticketItems() {
      return this.selectedPassengerFares.map((fare) => ({
        fare_segment_ticket_type_id: Number(fare.id),
        ticket_type_id: Number(fare.ticket_type_id ?? fare.ticketTypeId ?? fare.ticket_type?.id),
        quantity: this.quantityFor(fare.id),
      })).filter((item) => Number.isFinite(item.fare_segment_ticket_type_id) && Number.isFinite(item.ticket_type_id));
    },
    canSubmit() {
      return Boolean(
        this.selectedBranch &&
        this.selectedVehicle &&
        this.selectedRoute &&
        this.selectedFareSegment &&
        this.ticketItems.length &&
        this.totalQuantity > 0 &&
        !Object.values(this.quantityErrors).some(Boolean) &&
        !this.loadingSubmit
      );
    },
    ticketPayload() {
      const deviceId = this.getValueId(this.selectedDeviceId);
      return {
        trip_id: this.saleTripId === null ? null : Number(this.saleTripId),
        route_id: Number(this.getValueId(this.selectedRouteId)),
        branch_id: Number(this.getValueId(this.selectedBranchId)),
        vehicle_id: Number(this.getValueId(this.selectedVehicleId)),
        device_id: deviceId === null || deviceId === undefined || deviceId === "" ? null : Number(deviceId),
        method: "Efectivo",
        quantity: this.totalQuantity,
        price: Number(this.selectedFareSegment?.base_price ?? this.selectedPassengerFares[0]?.price ?? 0),
        total: this.total,
        fare_segment_id: Number(this.getValueId(this.selectedFareSegmentId)),
        ticketItems: this.ticketItems,
        seats: [],
      };
    },
    hasRouteContext() {
      const branchId = this.getValueId(this.selectedBranchId);
      const vehicleId = this.getValueId(this.selectedVehicleId);
      return Number(branchId) > 0 && Number(vehicleId) > 0;
    },
  },
  watch: {
    modelValue(value) {
      if (value) this.open();
    },
  },
  methods: {
    toArray(value) {
      return Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : []);
    },
    getValueId(value) {
      if (value && typeof value === "object") {
        return value.id ?? value.route_id ?? value.trip_id ?? value.vehicle_id ?? value.device_id ?? value.value;
      }
      return value;
    },
    imageUrl(source) {
      if (!source) return "";
      const image = typeof source === "string"
        ? source.trim()
        : String(source.image ?? source.image_url ?? source.imageUrl ?? source.url ?? source.path ?? "").trim();
      if (!image) return "";
      if (/^(https?:|data:|blob:)/i.test(image)) return image;
      const base = String(this.$axios?.defaults?.baseURL || "");
      const clean = image.replace(/^\/+/, "");
      return clean.startsWith("images/") ? `${base}${clean}` : `${base}images/${clean}`;
    },
    deviceItemProps(device) {
      return { disabled: device?.available !== true };
    },
    formatDuration(value) {
      const minutes = Number(value);
      if (!Number.isFinite(minutes) || minutes <= 0) return "";
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      return hours ? `${hours} h ${remaining ? `${remaining} min` : ""}`.trim() : `${remaining} min`;
    },
    formatPrice(value) {
      return new Intl.NumberFormat("es-CL").format(Number(value) || 0);
    },
    isEnabled(value) {
      return value !== false && value !== 0 && value !== "0" && value !== "false";
    },
    quantityFor(fareId) {
      const quantity = Number(this.passengerQuantities[fareId]);
      return Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0;
    },
    setPassengerQuantity(fareId, value) {
      if (!this.passengerFares.some((fare) => String(fare.id) === String(fareId))) return;
      const quantity = value === "" || value === null ? 0 : Number(value);
      this.passengerQuantities[fareId] = value;
      if (!Number.isSafeInteger(quantity) || quantity < 0) {
        this.quantityErrors[fareId] = "Ingresa una cantidad entera mayor o igual a 0.";
      } else {
        delete this.quantityErrors[fareId];
      }
    },
    resetPassengerQuantities() {
      this.passengerQuantities = {};
      this.quantityErrors = {};
    },
    fareSegmentLabel(segment) {
      const origin = this.commercialStops.find((stop) => Number(stop.id) === Number(segment.origin_route_stop_id ?? segment.originRouteStopId));
      const destination = this.commercialStops.find((stop) => Number(stop.id) === Number(segment.destination_route_stop_id ?? segment.destinationRouteStopId));
      return `${origin?.stopLabel || "Origen"} → ${destination?.stopLabel || "Destino"}`;
    },
    normalizeCommercial(commercial = {}) {
      const tripStops = this.toArray(commercial.tripStops ?? commercial.trip_stops).map((stop) => ({
        ...stop,
        route_stop_id: stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id ?? stop.route_stop?.id,
        stop_order: stop.stop_order ?? stop.stopOrder ?? 0,
        can_board: this.isEnabled(stop.can_board),
        can_alight: this.isEnabled(stop.can_alight),
        routeStop: stop.routeStop ?? stop.route_stop ?? {},
      }));
      const segments = this.toArray(commercial.segments ?? commercial.fareSegments).map((segment) => ({
        ...segment,
        origin_route_stop_id: segment.origin_route_stop_id ?? segment.originRouteStopId ?? segment.originRouteStop?.id ?? segment.origin_route_stop?.id,
        destination_route_stop_id: segment.destination_route_stop_id ?? segment.destinationRouteStopId ?? segment.destinationRouteStop?.id ?? segment.destination_route_stop?.id,
        passenger_types: this.toArray(segment.passenger_types ?? segment.passengerTypes).map((passengerType) => ({
          ...passengerType,
          id: passengerType.id ?? passengerType.fare_segment_ticket_type_id,
        })),
      }));
      return { ...commercial, tripStops, segments };
    },
    normalizeRoute(route = {}) {
      const id = route.id ?? route.route_id ?? route.routeId;
      const routeCode = route.routeCode ?? route.route_code ?? route.code ?? "";
      const name = route.name ?? route.routeName ?? route.route_name ?? "Ruta";
      const originAddress = route.originAddress ?? route.origin_address ?? route.origin?.address ?? "";
      const destinationAddress = route.destinationAddress ?? route.destination_address ?? route.destination?.address ?? "";
      return {
        ...route,
        id,
        routeCode,
        originAddress,
        destinationAddress,
        originImage: route.originImage ?? route.origin_image ?? route.origin?.image ?? "",
        destinationImage: route.destinationImage ?? route.destination_image ?? route.destination?.image ?? "",
        commercial: this.normalizeCommercial(route.commercial),
        routeLabel: [routeCode || name, originAddress, destinationAddress].filter(Boolean).join(" · ").replace(`${originAddress} · ${destinationAddress}`, `${originAddress} → ${destinationAddress}`),
      };
    },
    extractRoutes(payload) {
      const candidate = payload?.routes
        ?? payload?.availableRoutes
        ?? payload?.available_routes
        ?? payload?.data?.routes
        ?? payload?.data?.availableRoutes
        ?? payload?.data
        ?? payload;
      return this.toArray(candidate).map((route) => this.normalizeRoute(route)).filter((route) => route.id !== null && route.id !== undefined && route.id !== "");
    },
    normalizeActiveTrip(trip = {}) {
      return {
        ...trip,
        id: trip.id ?? trip.trip_id ?? trip.tripId,
        code: trip.code ?? trip.trip_code ?? trip.tripCode ?? "",
        schedule: trip.schedule ?? trip.start ?? "",
      };
    },
    extractActiveTrips(payload) {
      const candidate = payload?.trips
        ?? payload?.data?.trips
        ?? payload?.activeTrips
        ?? payload?.data?.activeTrips
        ?? [];
      return this.toArray(candidate)
        .map((trip) => this.normalizeActiveTrip(trip))
        .filter((trip) => trip.id !== null && trip.id !== undefined && trip.id !== "");
    },
    resetSelections() {
      this.resetPassengerQuantities();
      this.selectedMethod = "Efectivo";
      this.submitError = "";
      this.step = 1;
      this.selectedBranchId = null;
      this.selectedVehicleId = null;
      this.selectedDeviceId = null;
      this.selectedRouteId = null;
      this.selectedTripId = null;
      this.selectedOriginStopId = null;
      this.selectedDestinationStopId = null;
      this.selectedFareSegmentId = null;
      this.availableRoutes = [];
      this.activeTrips = [];
      this.activeTripsLoaded = false;
      this.activeTripsError = "";
      this.routesLoaded = false;
    },
    async open() {
      this.resetSelections();
      this.contextError = "";
      this.branches = [];
      this.loadingContext = true;
      try {
        const result = await handleRequest({ endpoint: "on-board-web-context", method: "POST" });
        if (result.success) {
          this.branches = this.toArray(result.data?.branches ?? result.data);
          if (!this.branches.length) this.contextError = "No tienes sucursales autorizadas para operar a bordo.";
          if (this.branches.length === 1) {
            this.selectedBranchId = this.branches[0].id;
            await this.autoSelectSingleVehicle();
          }
        } else {
          this.contextError = result.message || "No se pudo cargar el contexto operativo.";
        }
      } catch (error) {
        this.contextError = "No se pudo cargar el contexto operativo.";
      } finally {
        this.loadingContext = false;
      }
    },
    async onBranchChange() {
      this.step = 1;
      this.selectedVehicleId = null;
      this.selectedDeviceId = null;
      this.selectedRouteId = null;
      this.clearActiveTripFlow();
      this.availableRoutes = [];
      this.routesLoaded = false;
      await this.autoSelectSingleVehicle();
    },
    async onVehicleChange() {
      this.step = 1;
      this.selectedDeviceId = null;
      this.selectedRouteId = null;
      this.clearActiveTripFlow();
      this.availableRoutes = [];
      this.routesLoaded = false;
      await this.autoSelectSingleDevice();
      if (this.hasRouteContext && !this.selectedDeviceId) await this.loadAvailableRoutes();
    },
    async autoSelectSingleVehicle() {
      await this.$nextTick();
      if (!this.selectedBranchId || this.selectedBranchVehicles.length !== 1) return;
      const vehicle = this.selectedBranchVehicles[0];
      if (vehicle.id === null || vehicle.id === undefined || vehicle.id === "") return;
      this.selectedVehicleId = vehicle.id;
      await this.autoSelectSingleDevice();
      if (this.hasRouteContext && !this.selectedDeviceId) await this.loadAvailableRoutes();
    },
    async autoSelectSingleDevice() {
      await this.$nextTick();
      if (!this.selectedVehicleId) return;
      const availableDevices = this.selectedVehicleDevices.filter((device) => device.available === true);
      if (availableDevices.length !== 1) return;
      const device = availableDevices[0];
      if (device.id === null || device.id === undefined || device.id === "") return;
      this.selectedDeviceId = device.id;
      await this.$nextTick();
      await this.onDeviceChange(device.id);
    },
    async onDeviceChange(deviceId) {
      this.step = 1;
      this.selectedRouteId = null;
      this.clearActiveTripFlow();
      this.availableRoutes = [];
      this.routesLoaded = false;
      const device = this.selectedVehicleDevices.find((item) => Number(item.id) === Number(deviceId));
      if (deviceId && !device?.available) return;
      if (!this.hasRouteContext) return;
      await this.loadAvailableRoutes();
    },
    async loadAvailableRoutes() {
      const requestId = ++this.routeRequestId;
      this.loadingRoutes = true;
      this.routesLoaded = false;
      this.contextError = "";
      try {
        const requestData = {
          branch_id: Number(this.selectedBranchId),
          vehicle_id: Number(this.selectedVehicleId),
        };
        if (this.selectedDeviceId) requestData.device_id = Number(this.selectedDeviceId);

        const result = await handleRequest({
          endpoint: "on-board-available-routes-web",
          method: "POST",
          data: requestData,
        });
        if (requestId !== this.routeRequestId) return;
        this.availableRoutes = result.success ? this.extractRoutes(result.data) : [];
        this.routesLoaded = true;
        if (!result.success) this.contextError = result.message || "No se pudieron cargar las rutas disponibles.";
      } catch (error) {
        if (requestId === this.routeRequestId) {
          this.availableRoutes = [];
          this.routesLoaded = true;
          this.contextError = "No se pudieron cargar las rutas disponibles.";
        }
      } finally {
        if (requestId === this.routeRequestId) this.loadingRoutes = false;
      }
    },
    clearActiveTripFlow() {
      this.resetPassengerQuantities();
      this.activeTripRequestId++;
      this.loadingActiveTrips = false;
      this.submitError = "";
      this.selectedTripId = null;
      this.selectedOriginStopId = null;
      this.selectedDestinationStopId = null;
      this.selectedFareSegmentId = null;
      this.activeTrips = [];
      this.activeTripsLoaded = false;
      this.activeTripsError = "";
    },
    async onRouteChange(routeId) {
      this.clearActiveTripFlow();
      this.step = 1;
      if (!routeId || !this.hasRouteContext) return;
      await this.loadActiveTrips();
    },
    async loadActiveTrips() {
      const requestId = ++this.activeTripRequestId;
      this.loadingActiveTrips = true;
      this.activeTripsError = "";
      try {
        const requestData = {
          route_id: Number(this.getValueId(this.selectedRouteId)),
          branch_id: Number(this.getValueId(this.selectedBranchId)),
          vehicle_id: Number(this.getValueId(this.selectedVehicleId)),
        };
        const deviceId = this.getValueId(this.selectedDeviceId);
        if (deviceId !== null && deviceId !== undefined && deviceId !== "") {
          requestData.device_id = Number(deviceId);
        }

        const result = await handleRequest({
          endpoint: "on-board-active-trips",
          method: "POST",
          data: requestData,
        });
        if (requestId !== this.activeTripRequestId) return;
        if (!result.success) {
          this.activeTrips = [];
          this.activeTripsLoaded = false;
          this.activeTripsError = result.message || "No se pudieron consultar los viajes activos.";
          return;
        }
        this.activeTrips = this.extractActiveTrips(result.data);
        this.activeTripsLoaded = true;
        if (this.activeTrips.length === 0) {
          this.step = 2;
        } else if (this.activeTrips.length === 1) {
          this.selectedTripId = this.activeTrips[0].id;
          this.step = 2;
        } else {
          this.step = 1;
        }
      } catch (error) {
        if (requestId === this.activeTripRequestId) {
          this.activeTrips = [];
          this.activeTripsLoaded = false;
          this.activeTripsError = "No se pudieron consultar los viajes activos.";
        }
      } finally {
        if (requestId === this.activeTripRequestId) this.loadingActiveTrips = false;
      }
    },
    selectActiveTrip(trip) {
      this.selectedTripId = trip?.id ?? null;
      if (this.selectedTripId) this.step = 2;
    },
    goBackFromSegmentStep() {
      this.step = 1;
    },
    onOriginStopChange() {
      this.selectedDestinationStopId = null;
      this.selectedFareSegmentId = null;
      this.resetPassengerQuantities();
    },
    onDestinationStopChange(destinationId) {
      this.selectedDestinationStopId = destinationId;
      this.resetPassengerQuantities();
      this.selectedFareSegmentId = this.availableFareSegments.length === 1 ? this.availableFareSegments[0].id : null;
    },
    async save() {
      if (!this.canSubmit) return;
      this.loadingSubmit = true;
      this.submitError = "";
      try {
        const result = await handleRequest({
          endpoint: "on-board-ticket-web",
          method: "POST",
          data: this.ticketPayload,
        });
        if (!result.success) {
          this.submitError = result.message || "No se pudo crear el ticket.";
          return;
        }
        this.$emit("saved", result.data?.ticket ?? result.data?.data?.ticket ?? null, result.data, this.ticketPayload);
        this.dialogModel = false;
      } catch (error) {
        this.submitError = "No se pudo crear el ticket.";
      } finally {
        this.loadingSubmit = false;
      }
    },
    close() {
      if (this.loadingContext || this.loadingRoutes || this.loadingActiveTrips || this.loadingSubmit) return;
      this.dialogModel = false;
    },
  },
};
</script>

<style scoped>
/* Distribución y controles de Venta Express, con la paleta de venta a bordo. */
.express-sale-form { height:100%; min-height:0; }
.ticket-sale-dialog-pro { display:flex; flex-direction:column; height:100vh; height:100dvh; min-height:0; color:#1e293b; background:#f6f8fb; border-radius:0; }
.ticket-sale-topbar { display:flex; align-items:center; flex-shrink:0; gap:12px; min-height:70px; padding:12px 24px; color:#fff; background:#78350f; border-bottom:1px solid #92400e; }
.ticket-sale-topbar__left { display:flex; align-items:center; gap:11px; min-width:0; }
.ticket-sale-topbar__icon { display:grid; place-items:center; flex:0 0 38px; width:38px; height:38px; border-radius:10px; background:#b45309; color:#fff; }
.ticket-sale-topbar__icon :deep(.v-icon) { font-size:23px!important; }
.ticket-sale-topbar__title { font-size:19px; font-weight:800; line-height:1.2; }
.ticket-sale-topbar__subtitle { color:#ffedd5; font-size:12px; line-height:1.4; margin-top:4px; }
.ticket-sale-step-chip { color:#fff3df; background:#b45309; font-size:11px; font-weight:650; }
.ticket-sale-close { flex-shrink:0; color:#fff; background:#b45309; border-radius:9px; }
.ticket-sale-body { flex:1; min-height:0; overflow-y:auto; padding:18px 24px 0!important; }
.ticket-sale-layout { max-width:1480px; margin:0 auto; }
.ticket-sale-section-card,.ticket-sale-summary-pro { padding:18px; background:#fff; border:1px solid #e4eaf2; border-radius:12px; box-shadow:0 4px 14px #15264b05; }
.ticket-sale-fill { height:100%; }
.ticket-sale-section-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.ticket-sale-section-title { color:#0f172a; font-size:15px; font-weight:800; line-height:1.4; }
.ticket-sale-section-subtitle { color:#526176; font-size:12px; line-height:1.5; margin-top:3px; }
.ticket-sale-mini-icon { display:grid; place-items:center; width:36px; height:36px; margin-right:10px; flex-shrink:0; border-radius:9px; background:#fff7ed; color:#b45309; }
.ticket-sale-label { display:block; margin-bottom:6px; color:#475569; font-size:12px; font-weight:700; }
.ticket-sale-section-card :deep(.v-row) { row-gap:9px; }
.ticket-sale-dialog-pro :deep(.v-field) { color:#233654; background:#fff; border-radius:9px!important; font-size:14px; }
.ticket-sale-dialog-pro :deep(.v-field__outline) { color:#c5cfdd; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field--focused .v-field__outline) { color:#b45309; }
.ticket-sale-dialog-pro :deep(.v-field__input),.ticket-sale-dialog-pro :deep(.v-label) { color:#233654; font-size:14px; font-weight:500; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__input::placeholder) { color:#64748b; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__prepend-inner .v-icon) { color:#64748b; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-input__details) { font-size:12px; }
.ticket-location-option__title { color:#1e293b; font-size:14px; line-height:1.45; white-space:normal; overflow-wrap:anywhere; }
.ticket-location-option__subtitle { margin-top:3px; color:#526176; font-size:12px; line-height:1.45; white-space:normal; }
:global(.busgo-onboard-location-menu .v-list) { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:6px; }
:global(.busgo-onboard-location-menu .v-list-item) { border-radius:8px; padding:10px 12px!important; margin:2px 0; }
:global(.busgo-onboard-location-menu .v-list-item--active) { background:#fff7ed; color:#b45309; }
.trip-sale-panel-pro { border:1px solid #e4eaf2; border-radius:10px; overflow-x:auto; }
.trip-sale-panel-pro__header,.trip-sale-row-pro { display:grid; grid-template-columns:1fr 2.2fr .8fr .8fr 1fr .9fr 1fr 112px; min-width:1000px; align-items:center; gap:12px; padding:12px 16px; }
.trip-sale-panel-pro__header { min-height:42px; color:#334155; background:#f3f6fa; font-size:11px; font-weight:800; border-bottom:1px solid #e4eaf2; }
.trip-sale-sortable-header { display:flex; align-items:center; gap:5px; cursor:pointer; user-select:none; }
.trip-sale-sortable-header:hover { color:#b45309; }
.trip-sale-row-pro { min-height:68px; cursor:pointer; background:#fff; border-bottom:1px solid #edf1f6; }
.trip-sale-row-pro:last-child { border-bottom:0; }
.trip-sale-row-pro:hover { background:#fffaf1; }
.trip-sale-row-pro--selected { background:#fff7ed; box-shadow:inset 3px 0 #b45309; }
.trip-sale-code,.trip-sale-strong,.trip-sale-route__name { color:#1e293b; font-size:13px; font-weight:750; }
.trip-sale-route { min-width:0; }
.trip-sale-route__title-row { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.trip-sale-route__meta,.trip-sale-muted { color:#526176; font-size:12px; line-height:1.5; margin-top:3px; overflow-wrap:anywhere; }
.trip-sale-price { color:#78350f; font-size:13px; font-weight:750; font-variant-numeric:tabular-nums; }
.ticket-sale-empty { padding:30px 18px; text-align:center; color:#718198; }
.ticket-sale-empty__title { color:#475569; font-size:14px; font-weight:750; margin-top:10px; }
.ticket-sale-empty__text { color:#64748b; font-size:12px; line-height:1.5; margin-top:5px; }
.ticket-sale-summary-grid { display:grid; grid-template-columns:1.8fr 1fr .8fr 1fr; gap:12px; margin-top:14px; }
.ticket-sale-summary-grid > div { min-width:0; padding:12px; background:#f8fafc; border:1px solid #e7edf5; border-radius:9px; }
.ticket-sale-summary-grid span { display:block; color:#64748b; font-size:11px; font-weight:650; margin-bottom:5px; }
.ticket-sale-summary-grid strong { display:block; color:#233654; font-size:14px; line-height:1.4; font-weight:750; overflow-wrap:anywhere; }
.ticket-sale-summary-grid > div:last-child { background:#fff7ed; border-color:#fed7aa; }
.ticket-sale-summary-grid > div:last-child strong { color:#b45309; }
.ticket-type-list { display:flex; flex-direction:column; gap:10px; }
.ticket-type-card { padding:12px 14px; margin-bottom:9px; border:1px solid #e4eaf2; border-radius:10px; background:#fff; }
.ticket-type-card:last-child { margin-bottom:0; }
.ticket-type-card__main { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.ticket-type-card__main > div:first-child { min-width:0; }
.ticket-type-card__title { color:#233654; font-size:14px; font-weight:750; overflow-wrap:anywhere; }
.ticket-type-card__price { color:#526176; font-size:12px; margin-top:4px; }
.ticket-type-card__input { flex:0 0 100px; width:100px; }
.ticket-type-card__total { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:8px 10px; margin-top:10px; border-radius:7px; background:#fff7ed; color:#78350f; font-size:12px; }
.payment-methods-grid-pro { display:grid; gap:9px; }
.payment-method-card-pro { color:#334155; background:#fff; border:1px solid #dce4ef; border-radius:9px!important; box-shadow:none!important; cursor:pointer; }
.payment-method-content-pro { display:flex; align-items:center; gap:10px; padding:12px!important; min-height:48px; }
.payment-method-label { font-size:13px; font-weight:700; }
.payment-method-selected { background:#fff7ed; border-color:#b45309; box-shadow:inset 0 0 0 1px #b45309!important; }
.payment-method-disabled { cursor:not-allowed; opacity:.5; background:#f8fafc; }
.ticket-total-box { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:15px; margin-top:16px; border-radius:10px; background:#78350f; color:#fff; }
.ticket-total-box span { font-size:12px; font-weight:650; }
.ticket-total-box strong { font-size:20px; font-weight:800; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.ticket-sale-footer-actions { display:flex; align-items:center; gap:10px; position:sticky; bottom:0; z-index:3; margin-top:16px; padding:14px 0; border-top:1px solid #e1e8f1; background:#f6f8fb; }
.ticket-sale-btn-primary,.ticket-sale-btn-secondary { min-height:40px; padding-inline:18px; border-radius:9px!important; font-size:13px; font-weight:750; letter-spacing:0; text-transform:none; box-shadow:none!important; }
.ticket-sale-btn-primary { color:#fff!important; background:#b45309!important; }
.ticket-sale-btn-secondary { color:#475569!important; background:#fff!important; border:1px solid #dce3ed; }
.ticket-sale-btn-primary.v-btn--disabled { background:#dce3ed!important; color:#64748b!important; }
.ticket-sale-btn-primary:focus-visible,.ticket-sale-btn-secondary:focus-visible { outline:3px solid #fdba74; outline-offset:3px; }
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

/* Particularidades del contexto, viajes activos y resumen de venta a bordo. */
.ticket-sale-topbar { background:linear-gradient(110deg,#78350f,#b45309 60%,#c46a13); }
.onboard-section-heading,.onboard-summary-heading { display:flex; align-items:center; gap:11px; min-width:0; }
.onboard-section-icon { display:grid; place-items:center; flex:0 0 36px; width:36px; height:36px; border-radius:9px; background:#fff7ed; color:#b45309; }
.onboard-route-card { margin-top:16px; }
.onboard-alert { margin-bottom:14px; }
.onboard-option-meta { color:#526176!important; font-size:12px!important; white-space:normal; }
.onboard-context-summary { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:16px; padding:12px; border:1px solid #fed7aa; border-radius:9px; background:#fff7ed; color:#78350f; font-size:12px; font-weight:650; }
.onboard-context-summary__item { display:inline-flex; align-items:center; gap:6px; }
.onboard-context-summary__arrow { color:#b45309; }
.onboard-route-selection { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.onboard-route-heading { display:flex; justify-content:space-between; gap:12px; padding-bottom:7px; border-bottom:1px solid #e4eaf2; color:#78350f; }
.onboard-route-heading strong { font-size:13px; }
.onboard-route-heading span { display:flex; align-items:center; gap:4px; color:#526176; font-size:12px; }
.onboard-route-journey { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); gap:12px; align-items:center; padding-top:9px; }
.onboard-route-place { display:flex; align-items:center; gap:8px; min-width:0; }
.onboard-route-place .v-avatar { flex-shrink:0; }
.onboard-route-place small { display:block; color:#64748b; font-size:11px; }
.onboard-route-place strong { display:block; color:#233654; font-size:13px; overflow-wrap:anywhere; }
.onboard-route-arrow { color:#b45309; }
:global(.onboard-route-menu) { width:min(720px,calc(100vw - 24px)); }
:global(.onboard-route-menu .v-list) { padding:6px; background:#fff; }
:global(.onboard-route-menu .v-list-item) { padding:11px 12px!important; border-radius:9px; }
:global(.onboard-route-menu .v-list-item__content) { overflow:visible; }
.onboard-empty-state { padding:30px 18px; text-align:center; color:#64748b; }
.onboard-sale-actions { flex-shrink:0; min-height:68px; padding:13px 24px!important; background:#f6f8fb; }
.onboard-sale-actions__hint,.onboard-pending-sale { display:flex; align-items:center; gap:6px; color:#64748b; font-size:12px; }
.onboard-sale-workspace { display:grid; grid-template-columns:minmax(0,2fr) minmax(280px,1fr); align-items:start; gap:16px; }
.onboard-sale-main { min-width:0; }
.onboard-sale-summary { padding:18px; background:#fff; border:1px solid #e4eaf2; border-radius:12px; box-shadow:0 4px 14px #15264b05; }
.onboard-summary-heading { padding-bottom:16px; border-bottom:1px solid #e4eaf2; }
.onboard-summary-list>div,.onboard-detail-list>div { display:grid; gap:4px; padding:10px 0; border-bottom:1px solid #edf1f6; }
.onboard-summary-list span,.onboard-detail-list dt { font-size:12px; color:#64748b; }
.onboard-summary-list strong,.onboard-detail-list dd { margin:0; font-size:14px; font-weight:650; color:#233654; overflow-wrap:anywhere; }
.onboard-sale-sidebar { position:sticky; top:0; }
.onboard-passenger-summary { display:grid; gap:9px; padding-top:14px; font-size:12px; }
.onboard-passenger-summary>div { display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; color:#526176; }
.onboard-passenger-summary strong { color:#233654; }
.onboard-trip-list { display:grid; gap:9px; max-height:480px; overflow-y:auto; }
.onboard-trip-option { display:flex; align-items:center; gap:12px; width:100%; padding:12px 16px; border:1px solid #e4eaf2; border-radius:10px; text-align:left; background:#fff; cursor:pointer; }
.onboard-trip-option:hover,.onboard-trip-option--selected { background:#fff7ed; border-color:#b45309; }
.onboard-trip-option:focus-visible { outline:3px solid #fdba74; outline-offset:-3px; }
.onboard-trip-option__icon { color:#b45309; }
.onboard-trip-option__content { display:grid; flex:1; min-width:0; gap:4px; }
.onboard-trip-option__content strong { color:#233654; font-size:14px; overflow-wrap:anywhere; }
.onboard-trip-option__content small { color:#526176; font-size:12px; }
.onboard-trip-option__meta { display:flex; align-items:center; gap:7px; }
.onboard-step-actions { display:flex; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid #e4eaf2; }
@media(max-width:959px) {
  .onboard-sale-workspace { grid-template-columns:1fr; }
  .onboard-sale-sidebar { position:static; }
}
@media(max-width:600px) {
  .onboard-sale-summary { padding:14px; }
  .onboard-sale-actions { padding:12px!important; flex-wrap:wrap; }
  .onboard-route-journey { grid-template-columns:1fr; gap:8px; }
  .onboard-route-arrow { display:none; }
  .ticket-sale-footer-actions { flex-wrap:wrap; }
  .onboard-pending-sale { order:3; width:100%; }
}
</style>
