<template>
<div class="ticket-view sales-view">
  <v-snackbar class="ticket-snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" v-model="snackbar">
    <div class="ticket-alert-content"><v-icon :icon="sb_icon" size="22" /><div><strong>{{ sb_title }}</strong><div>{{ sb_message }}</div></div></div>
  </v-snackbar>
  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon"><v-icon>mdi-point-of-sale</v-icon></v-avatar>
    <div>
      <div class="busgo-page-title">Ventas</div>
      <div class="busgo-page-subtitle">Venta de pasajes Full y Express</div>
    </div>
  </v-card>
  <main class="sales-workspace">
    <section class="sales-context-panel" aria-label="Configuración de venta">
      <div class="sales-context-copy">
        <h2>Nueva venta</h2>
        <p>Selecciona la modalidad y comienza a emitir pasajes.</p>
      </div>
      <div class="sales-branch-control">
        <label v-if="mostrarFila" class="sales-field-label">Sucursal de venta</label>
        <v-autocomplete v-if="mostrarFila" v-model="branch_id" :items="branches" item-title="name" item-value="id"
          aria-label="Sucursal de venta" placeholder="Seleccionar sucursal" prepend-inner-icon="mdi-store-outline" variant="outlined" density="compact"
          :loading="loading" :disabled="loading" hide-details="auto" no-data-text="No hay sucursales disponibles" />
        <div v-else class="sales-assigned-branch"><span class="sales-branch-icon"><v-icon size="21">mdi-store-outline</v-icon></span><div><span>Sucursal de venta</span><strong>{{ hasSelectedBranch ? 'Sucursal asignada' : 'Sin sucursal asignada' }}</strong></div></div>
      </div>
    </section>

    <div class="sales-modes">
      <article v-if="hasPermission('view_traditional_sales_web')" class="sales-mode-card sales-mode-card--full">
        <div class="sales-mode-top"><span class="sales-mode-icon"><v-icon size="29">mdi-seat-passenger</v-icon></span><span class="sales-mode-tag">Con selección de asientos</span></div>
        <div class="sales-mode-copy"><h3>Venta Full</h3><p>Selecciona tramo, pasajeros y asientos.</p></div>
        <div class="sales-mode-footer"><span class="sales-mode-note"><v-icon size="16">mdi-ticket-outline</v-icon>Comprobante con QR</span><v-btn class="sales-launch-button sales-launch-button--full" variant="flat" append-icon="mdi-arrow-right" :disabled="loading || !hasSelectedBranch" @click="showAdd">Iniciar venta Full</v-btn></div>
      </article>
      <article v-if="hasPermission('view_express_sales_web')" class="sales-mode-card sales-mode-card--express">
        <div class="sales-mode-top"><span class="sales-mode-icon"><v-icon size="29">mdi-lightning-bolt-outline</v-icon></span><span class="sales-mode-tag">Venta rápida</span></div>
        <div class="sales-mode-copy"><h3>Venta Express</h3><p>Registra pasajes con el flujo de venta rápida.</p></div>
        <div class="sales-mode-footer"><span class="sales-mode-note"><v-icon size="16">mdi-ticket-outline</v-icon>Comprobante con QR</span><v-btn class="sales-launch-button sales-launch-button--express" variant="flat" append-icon="mdi-arrow-right" :disabled="loading || !hasSelectedBranch" @click="openExpressSale">Iniciar venta Express</v-btn></div>
      </article>
    </div>
    <v-alert v-if="!hasPermission(['view_traditional_sales_web', 'view_express_sales_web'])" type="info" variant="tonal" class="mt-5">No tienes permisos para realizar ventas.</v-alert>
    <v-alert v-else-if="!loading && !hasSelectedBranch" type="info" variant="tonal" class="mt-5">Selecciona una sucursal para comenzar. Si no hay sucursales disponibles, revisa tu asignación con el administrador.</v-alert>
    <div class="sales-workspace-footnote"><v-icon size="17">mdi-information-outline</v-icon><span>Consulta y reimprime las ventas realizadas desde el reporte de Tickets.</span></div>
  </main>
  <ExpressTicketSale
    v-model="dialogExpressSale"
    :branches="branches"
    :branch-id="branch_id"
    :mostrar-fila="mostrarFila"
    @alert="showAlert"
    @saved="handleExpressSaleSaved"
  />

  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition" content-class="busgo-full-sale-overlay">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data" class="busgo-full-sale-form">
      <v-card class="ticket-sale-dialog-pro busgo-full-sale" elevation="0">

        <!-- HEADER -->
        <div class="ticket-sale-topbar">
          <div class="ticket-sale-topbar__left">
            <div class="ticket-sale-topbar__icon">
              <v-icon size="28">mdi-ticket-confirmation-outline</v-icon>
            </div>

            <div>
              <div class="ticket-sale-topbar__title">
                {{ formTitle }}
              </div>
              <div class="ticket-sale-topbar__subtitle">
                Venta guiada de pasajes por tramo, asiento y medio de pago
              </div>
            </div>
          </div>

          <v-spacer />

          <v-chip v-if="step === 1" size="small" variant="flat" class="ticket-sale-step-chip">
            Paso 1 · Viaje
          </v-chip>

          <v-chip v-if="step === 2" size="small" variant="flat" class="ticket-sale-step-chip">
            Paso 2 · Pasajes y pago
          </v-chip>

          <v-btn icon="mdi-close" variant="text" size="small" class="ticket-sale-close" aria-label="Cerrar venta Full" @click="close" />
        </div>

        <!-- BODY -->
        <v-card-text class="ticket-sale-body">
          <v-stepper v-model="step" :items="items" hide-actions class="ticket-sale-stepper-pro">

            <!-- STEP 1 -->
            <template #item.1>
              <div class="ticket-sale-layout">

                <div class="ticket-sale-section-card">
                  <div class="ticket-sale-section-header">
                    <div>
                      <div class="ticket-sale-section-title">
                        Selección del tramo
                      </div>
                      <div class="ticket-sale-section-subtitle">
                        Elige origen, destino y luego selecciona el viaje disponible.
                      </div>
                    </div>
                  </div>

                  <v-row dense>
                    <v-col v-if="mostrarFila" cols="12">
                      <label class="ticket-sale-label">Sucursal</label>
                      <v-autocomplete v-model="editedItem.branch_id" :items="branches"
                        placeholder="Seleccione la sucursal" prepend-inner-icon="mdi-store" item-title="name"
                        item-value="id" variant="outlined" density="comfortable" rounded="lg" clearable
                        hide-details="auto" :no-data-text="'No hay sucursales disponibles'"
                        :disabled="editedIndex !== -1" @update:model-value="onTicketBranchChange" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <label class="ticket-sale-label">Origen</label>
                      <v-autocomplete v-model="selectedOriginLocationId" :items="originLocationOptions"
                        placeholder="Seleccione el origen" prepend-inner-icon="mdi-map-marker-outline"
                        item-title="address" item-value="id" variant="outlined" density="comfortable" rounded="lg"
                        clearable hide-details="auto" :no-data-text="'No hay ubicaciones disponibles'"
                        @update:model-value="handleLocationSelectionChange"
                        :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-full-location-menu' }">
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
                      <v-autocomplete v-model="selectedDestinationLocationId" :items="destinationLocationOptions"
                        placeholder="Seleccione el destino" prepend-inner-icon="mdi-map-marker-check-outline"
                        item-title="address" item-value="id" variant="outlined" density="comfortable" rounded="lg"
                        clearable hide-details="auto" :no-data-text="'No hay ubicaciones disponibles'"
                        @update:model-value="handleLocationSelectionChange"
                        :menu-props="{ maxHeight: 360, maxWidth: 520, contentClass: 'busgo-full-location-menu' }">
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
                      <v-text-field v-model="tripSearchText" placeholder="Filtrar por ruta, patente, horario o tramo..."
                        prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" rounded="lg" clearable
                        hide-details="auto" :disabled="!selectedOriginLocationId ||
                          !selectedDestinationLocationId ||
                          tripSearchLoading
                          " />
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
                        <div class="ticket-sale-section-title">
                          Viajes y tramos disponibles
                        </div>
                        <div class="ticket-sale-section-subtitle">
                          Selecciona una fila para continuar con la venta.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="trip-sale-panel-pro">
                    <div class="trip-sale-panel-pro__header">
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('code')">
                        <span>Código</span>
                        <v-icon size="14">{{ tripSaleSortIcon('code') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('routeCode')">
                        <span>Ruta</span>
                        <v-icon size="14">{{ tripSaleSortIcon('routeCode') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('schedule')">
                        <span>Salida</span>
                        <v-icon size="14">{{ tripSaleSortIcon('schedule') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('arrival')">
                        <span>Llegada</span>
                        <v-icon size="14">{{ tripSaleSortIcon('arrival') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('plate')">
                        <span>Vehículo</span>
                        <v-icon size="14">{{ tripSaleSortIcon('plate') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('availableSeats')">
                        <span>Disponibles</span>
                        <v-icon size="14">{{ tripSaleSortIcon('availableSeats') }}</v-icon>
                      </div>
                      <div class="trip-sale-sortable-header" @click="toggleTripSaleSort('price')">
                        <span>Precio</span>
                        <v-icon size="14">{{ tripSaleSortIcon('price') }}</v-icon>
                      </div>
                      <div></div>
                    </div>

                    <div v-if="filteredTripSaleRows.length">
                      <div v-for="tripRow in filteredTripSaleRows" :key="tripRow.id" class="trip-sale-row-pro" :class="{
                        'trip-sale-row-pro--selected':
                          Number(tripRow.trip_id) === Number(editedItem.trip_id) &&
                          Number(tripRow.fare_segment_id) === Number(editedItem.fare_segment_id)
                      }" @click="selectTripForSale(tripRow)">
                        <div class="trip-sale-code">
                          {{ tripRow.code || "-" }}
                        </div>

                        <div class="trip-sale-route">
                          <div class="trip-sale-route__title-row">
                            <div class="trip-sale-route__name">
                              {{ tripRow.routeCode || "-" }}
                            </div>
                          </div>
                          <div class="trip-sale-route__meta">
                            {{ tripRow.origin }} → {{ tripRow.destination }}
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
                          {{ Number(tripRow.availableSeats) }}
                        </div>

                        <div class="trip-sale-price">
                          {{ formatNumber(Number(tripRow.price)) }} CLP
                        </div>

                        <div class="d-flex justify-end">
                          <v-chip size="small" :color="Number(tripRow.trip_id) === Number(editedItem.trip_id) &&
                              Number(tripRow.fare_segment_id) === Number(editedItem.fare_segment_id)
                              ? paleteColors.active
                              : paleteColors.primary
                            " :variant="Number(tripRow.trip_id) === Number(editedItem.trip_id) &&
                              Number(tripRow.fare_segment_id) === Number(editedItem.fare_segment_id)
                              ? 'flat'
                              : 'tonal'
                            ">
                            {{
                              Number(tripRow.trip_id) === Number(editedItem.trip_id) &&
                                Number(tripRow.fare_segment_id) === Number(editedItem.fare_segment_id)
                                ? "Seleccionado"
                                : "Seleccionar"
                            }}
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <div v-else class="ticket-sale-empty">
                      <v-icon size="42">mdi-bus-alert</v-icon>
                      <div class="ticket-sale-empty__title">
                        No hay viajes disponibles
                      </div>
                      <div class="ticket-sale-empty__text">
                        Cambia el origen, destino o búsqueda para encontrar viajes.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="ticket-sale-footer-actions">
                  <v-btn class="ticket-sale-btn-secondary" variant="flat" prepend-icon="mdi-close" @click="close">
                    Cancelar
                  </v-btn>

                  <v-spacer />

                  <v-btn class="ticket-sale-btn-primary" variant="flat" append-icon="mdi-arrow-right"
                    :disabled="!editedItem.trip_id || !editedItem.fare_segment_id" @click="nextStep">
                    Continuar
                  </v-btn>
                </div>
              </div>
            </template>

            <!-- STEP 2 -->
            <template #item.2>
              <div v-if="step === 2" class="ticket-sale-layout">

                <div class="ticket-sale-summary-pro">
                  <div>
                    <div class="ticket-sale-section-title">
                      Resumen de venta
                    </div>
                    <div class="ticket-sale-section-subtitle">
                      Revisa el viaje y el tramo antes de guardar.
                    </div>
                  </div>

                  <div class="ticket-sale-summary-grid">

                    <div>
                      <span>Recorrido</span>
                      <strong>
                        {{
                          selectedFareSegmentRecord?.label ||
                          selectedFareSegmentRecord?.name ||
                          "No seleccionado"
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>Ruta del viaje</span>
                      <strong>{{ selectedTripRecord?.routeCode || "No seleccionado" }}</strong>
                    </div>



                    <div>
                      <span>Precio tramo</span>
                      <strong>
                        {{ formatNumber(Number(selectedFareSegmentRecord?.base_price || 0)) }} CLP
                      </strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>{{ formatNumber(Number(editedItem.total || 0)) }} CLP</strong>
                    </div>
                  </div>
                </div>

                <v-row dense class="mt-4">
                  <v-col cols="12" md="5" lg="4">
                    <div class="ticket-sale-section-card ticket-sale-fill">
                      <div class="ticket-sale-section-header">
                        <div>
                          <div class="ticket-sale-section-title">
                            Tipos de pasajero
                          </div>
                          <div class="ticket-sale-section-subtitle">
                            Ingresa la cantidad por tipo de pasaje.
                          </div>
                        </div>
                      </div>

                      <div class="ticket-type-list">
                        <div v-if="mergedTicketTypes.length > 0">
                          <div v-for="ticket in mergedTicketTypes" :key="ticket.trip_fare_id || ticket.id"
                            class="ticket-type-card">
                            <div class="ticket-type-card__main">
                              <div>
                                <div class="ticket-type-card__title">
                                  {{ ticket.ticketTypeName || ticket.name }}
                                </div>

                                <div class="ticket-type-card__price">
                                  {{ formatNumber(Number(ticket.base_price)) }} CLP
                                </div>
                              </div>

                              <v-text-field v-model.number="ticket.cant"
                                @update:model-value="handleQuantityChange(ticket, $event)"
                                @blur="validateQuantity(ticket)" variant="outlined" density="compact" rounded="lg"
                                type="number" min="0" hide-details="auto" class="ticket-type-card__input"
                                :error-messages="(currentlyEditing === ticket.trip_fare_id && seatError) ||
                                  quantityErrors[ticket.trip_fare_id]
                                  " />
                            </div>

                            <div v-if="Number(ticket.cant) > 0" class="ticket-type-card__total">
                              Total:
                              <strong>
                                {{ formatNumber(getTicketTypePayableAmount(ticket)) }} CLP
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div v-else class="ticket-sale-empty">
                          <v-icon size="42">mdi-ticket-confirmation-outline</v-icon>
                          <div class="ticket-sale-empty__title">
                            No hay tipos de pasaje
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="7" lg="6">
                    <div class="ticket-sale-section-card ticket-sale-fill">
                      <div class="ticket-sale-section-header">
                        <div>
                          <div class="ticket-sale-section-title">
                            Selección de asientos
                          </div>
                          <div class="ticket-sale-section-subtitle">
                            Seleccionados {{ selectedSeats.length }} de {{ editedItem.quantity || 0 }}
                          </div>
                        </div>
                      </div>

                      <div class="ticket-seat-legend"><span><i class="legend-free"></i>Disponible</span><span><i class="legend-selected"></i>Seleccionado</span><span><i class="legend-reserved"></i>Reservado</span><span><i class="legend-disabled"></i>No disponible</span></div><div class="seat-map-shell">
                        <div class="seat-map-scroll">
                          <div class="seat-map-preview ticket-structure-bus">
                            <div class="ticket-structure-windshield" aria-hidden="true"></div>
                            <i class="ticket-structure-wheel front-top" aria-hidden="true"></i>
                            <i class="ticket-structure-wheel front-bottom" aria-hidden="true"></i>
                            <i class="ticket-structure-wheel rear-top" aria-hidden="true"></i>
                            <i class="ticket-structure-wheel rear-bottom" aria-hidden="true"></i>
                            <div class="ticket-structure-front"><div><v-icon size="25">mdi-steering</v-icon></div><span>Frente</span></div>
                            <div class="ticket-structure-grid">
                            <div v-for="(row, rowIndex) in seatMap" :key="rowIndex" class="seat-row">
                              <template v-for="(seat, seatIndex) in row" :key="seatIndex">
                                <div :class="[
                                  'seat-container',
                                  {
                                    'seat-available': isSeatAvailable(seat),
                                    'seat-selected': selectedSeats.includes(Number(seat.label)),
                                    'seat-reserved': isSeatReserved(seat.label),
                                    'seat-disabled':
                                      seat.type === 'seat' &&
                                      seat.label &&
                                      !isSeatAvailable(seat) &&
                                      !isSeatReserved(seat.label) &&
                                      !selectedSeats.includes(Number(seat.label)),
                                    'seat-aisle': seat.type === 'aisle'
                                  }
                                ]" @click="seat.type && toggleSeat(seat)">
                                  <v-icon v-if="seat.type === 'seat'" size="46" class="ticket-structure-seat">mdi-car-seat</v-icon>

                                  <v-icon v-else-if="seat.type === 'aisle'" class="aisle-icon" size="44">
                                    mdi-minus
                                  </v-icon>

                                  <span v-if="seat.type === 'seat'" class="seat-number">
                                    {{ seat.label }}
                                  </span>

                                  <span v-if="seat.type === 'aisle'" class="aisle-indicator"></span>
                                </div>
                              </template>
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <v-alert v-if="selectedSeats.length != editedItem.quantity" type="error" variant="tonal"
                        density="compact" class="mt-4">
                        Debe seleccionar {{ editedItem.quantity }} asiento(s).
                      </v-alert>
                    </div>
                  </v-col>

                  <v-col cols="12" lg="2">
                    <div class="ticket-sale-section-card ticket-sale-fill ticket-payment-panel">
                      <div class="ticket-sale-section-header ticket-payment-header">
                        <div>
                          <div class="ticket-sale-section-title">
                            Pago
                          </div>
                          <div class="ticket-sale-section-subtitle">
                            Medio de pago
                          </div>
                        </div>
                      </div>

                      <div class="payment-methods-grid-pro">
                        <v-card v-for="method in paymentMethods" :key="method.value" class="payment-method-card-pro"
                          :class="[
                            getCardClass(method),
                            { 'payment-method-disabled': method.disabled }
                          ]" @click="!method.disabled && (editedItem.method = method.value)">
                          <v-card-text class="payment-method-content-pro">
                            <v-icon size="24" :color="getMethodColor(method.value)">
                              {{ method.icon }}
                            </v-icon>

                            <div class="payment-method-label">
                              {{ method.text }}
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>

                      <div class="ticket-total-box ticket-total-box-compact">
                        <span>Total</span>
                        <strong>{{ formatNumber(Number(editedItem.total || 0)) }} CLP</strong>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <div class="ticket-sale-footer-actions">
                  <v-btn class="ticket-sale-btn-secondary" variant="flat" prepend-icon="mdi-arrow-left"
                    @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn class="ticket-sale-btn-primary" variant="flat" prepend-icon="mdi-content-save-outline"
                    @click="save" :disabled="!valid ||
                      Number(selectedSeats.length) !== Number(editedItem.quantity) ||
                      !editedItem.method
                      " :loading="loading">
                    Guardar venta
                  </v-btn>
                </div>
              </div>
            </template>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="showTicketDialog" max-width="500" persistent>
    <v-card class="ticket-preview-dialog ticket-print-card">
      <div class="ticket-confirm-heading">
        <span class="ticket-confirm-icon ticket-confirm-icon--preview"><v-icon size="22">mdi-ticket-confirmation-outline</v-icon></span>
        <div><strong>Vista previa del ticket</strong><span>Revisa el comprobante antes de imprimir</span></div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" aria-label="Cerrar vista previa" @click="showTicketDialog = false" />
      </div>
      <v-card-title class="ticket-print-header">
        <div class="d-flex flex-column align-center" style="width: 100%">
          <div v-if="ticketCompanyImage" class="ticket-branch-logo-preview mb-3">
            <img :src="`${this.$axios.defaults.baseURL}images/${ticketCompanyImage}`" :alt="ticketCompanyName"
              class="ticket-branch-logo-preview__img" />
          </div>

          <div class="text-center">
            <div class="text-subtitle-1 font-weight-bold">
              {{ selectedBranch?.name || "Nombre Sucursal" }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.rut">
              RUT: {{ selectedBranch.rut }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.address">
              Dirección: {{ selectedBranch.address }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.phone">
              Teléfono: {{ selectedBranch.phone }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.id">
              Folio N° {{ currentTicket.id }}
            </div>
          </div>
        </div>

        <v-btn icon @click="printTicket" class="ticket-print-button" title="Imprimir">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="ticket-container">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">
              Fecha: {{ currentTicket.date }}
            </div>

            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="font-weight-bold">Recorrido:</div>

              <v-chip size="x-small" variant="tonal" :color="getSaleModeColor(currentTicket)">
                {{ getSaleModeLabel(currentTicket) }}
              </v-chip>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Origen:</span>
              <span>{{ currentTicket.tripOrigin || "No especificado" }}</span>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Destino:</span>
              <span>{{ currentTicket.tripDestination || "No especificado" }}</span>
            </div>
          </div>

          <div class="ticket-details">
            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Precio:</span>
              <span>${{ formatNumber(currentTicket.total) }}</span>
            </div>

            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Medio de pago:</span>
              <span>{{ currentTicket.method }}</span>
            </div>
          </div>

          <br />

          <div class="text-center">
            <canvas ref="qrCanvasOriginal" style="width: 150px; height: 150px"></canvas>
          </div>

          <br />

          <div class="dashed-divider my-3"></div>

          <div class="text-center caption mb-3">
            -Copia de control-

            <div class="text-body-2" v-if="currentTicket?.id">
              Folio N° {{ currentTicket.id }}
            </div>
          </div>

          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">
              Fecha: {{ currentTicket.date }}
            </div>

            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="font-weight-bold">Recorrido:</div>

              <v-chip size="x-small" variant="tonal" :color="getSaleModeColor(currentTicket)">
                {{ getSaleModeLabel(currentTicket) }}
              </v-chip>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Origen:</span>
              <span>{{ currentTicket.tripOrigin || "No especificado" }}</span>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Destino:</span>
              <span>{{ currentTicket.tripDestination || "No especificado" }}</span>
            </div>
          </div>

          <div class="ticket-details">
            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Precio:</span>
              <span>${{ formatNumber(currentTicket.total) }}</span>
            </div>

            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Medio de pago:</span>
              <span>{{ currentTicket.method }}</span>
            </div>
          </div>

          <br />

          <div class="text-center">
            <canvas ref="qrCanvasControl" style="width: 150px; height: 150px"></canvas>
          </div>

          <br />

          <v-divider class="my-2" />

          <div v-if="currentTicket.print > 1" class="text-center caption mt-2 uppercase-text">
            (COPIA REIMPRESA POR EL OPERADOR {{ nameUser }})
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn color="primary" variant="flat" prepend-icon="mdi-close" @click="showTicketDialog = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>


<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api";
import { paleteColors } from "@/assets/colors";
import QRCode from "qrcode";
import ExpressTicketSale from "@/views/ticket/ExpressTicketSale.vue";
export default {
  name: 'SalesView',
  components: { ExpressTicketSale },
  data: () => ({ snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    paleteColors: paleteColors,
    valid: true,
    loading: false,
    mostrarFila: false,
    permissions: "",
    dialog: false,
    dialogExpressSale: false,
    branch_id: "",
    seatError: null,
    currentlyEditing: null,
    locations: [],
    trips: [],
    selectedOriginLocationId: null,
    selectedDestinationLocationId: null,
    tripSearchLoading: false,
    tripSearchText: "",
    promotions: [],
    tickettypes: [],
    currentTicket: {},
    nameUser: "",
    selectedBranch: {},
    data: {},
    seats: 0,
    selectedSeats: [],
    reservedSeats: [],
    availableSeats: [],
    availableSeatNumbers: [],
    aviable: "",
    branches: [],
    showTicketDialog: false,
    step: 1,
    items: ["Trayecto", "Venta"],
    editedItem: {
      id: "",
      trip_id: "",
      branch_id: "",
      user_id: "",
      date: "",
      method: "Efectivo",
      status: "",
      quantity: "",
      price: "",
      fare_segment_id: null,
      total: "",
      adults: "",
      minors: "",
      seats: [],
      promotions: [],
      tickettypes: [],
    },
    originalItem: {
      id: "",
      trip_id: "",
      branch_id: "",
      user_id: "",
      date: "",
      method: "",
      status: "",
      quantity: "",
      price: "",
      fare_segment_id: null,
      total: "",
      seats: [],
      adults: "",
      minors: "",
      promotions: [],
      tickettypes: [],
    },
    defaultItem: {
      id: "",
      trip_id: "",
      branch_id: "",
      user_id: "",
      date: "",
      method: "Efectivo",
      status: "",
      quantity: "",
      price: "",
      fare_segment_id: null,
      total: "",
      seats: [],
      adults: "",
      minors: "",
      promotions: [],
      tickettypes: [],
    },
    paymentMethods: [
      { text: "Efectivo", value: "Efectivo", icon: "mdi-cash" },
      {
        text: "Crédito",
        value: "Credito",
        icon: "mdi-credit-card-outline",
        disabled: true,
      },
      { text: "Débito", value: "Debito", icon: "mdi-bank-outline", disabled: true },
    ],
    editedIndex: -1,
    menu: false,
    seatMap: [],
    selectedPromotion: null,
    normal: "",
    quantityErrors: {},
    isRecalculatingTickettypes: false,
    tripSaleSortBy: "schedule",
    tripSaleSortOrder: "asc",
    role: null }),
  computed: { formTitle() { return "Venta Full"; },
    ticketCompanyImage() {
      return (
        this.getLocalStorageValue("imageBusiness") ||
        this.selectedBranch?.company?.image ||
        this.selectedBranch?.companyImage ||
        this.currentTicket?.companyImage ||
        this.selectedBranch?.image ||
        ""
      );
    },
    ticketCompanyName() {
      return (
        this.getLocalStorageValue("nameBusiness") ||
        this.selectedBranch?.company?.name ||
        this.selectedBranch?.companyName ||
        this.selectedBranch?.name ||
        "Empresa"
      );
    },
    mergedTicketTypes() {
      const editedTickets = this.normalizeEditedTickettypes();
      const ticketDefinitions = this.getTicketTypeDefinitions();
      const result = ticketDefinitions.map((ticket) => {
        const editedTicket =
          editedTickets.find(
            (t) =>
              Number(t.trip_fare_id ?? t.tripFareId ?? t.id) ===
              Number(ticket.trip_fare_id)
          ) || {};
        const mergedTicket = this.buildTicketTypeRecord(
          ticket,
          editedTicket.cant ?? editedTicket.quantity ?? 0,
          editedTicket
        );

        return {
          ...ticket,
          ...mergedTicket,
          adjustment_label: `${mergedTicket.adjustment_type === "recargo" ? "Recargo" : "Descuento"
            } · ${mergedTicket.value_type === "porcentaje" ? "Porcentaje" : "Monto"}`,
          adjustmentTypeLabel: `${mergedTicket.adjustmentType === "recargo" ? "Recargo" : "Descuento"
            } · ${mergedTicket.valueType === "porcentaje" ? "Porcentaje" : "Monto"}`,
        };
      });

      console.log("mergedTicketTypes result:", JSON.parse(JSON.stringify(result)));
      return result;
    },
    totalSelected() {
      return (
        this.normalizeEditedTickettypes().reduce(
          (sum, t) => sum + (Number(t.cant ?? t.quantity) || 0),
          0
        ) || 0
      );
    },
    selectedTripRecord() {
      return this.getSelectedTripRecord();
    },
    selectedFareSegmentRecord() {
      return this.getSelectedFareSegmentRecord();
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
    tripSaleRows() {
      return this.buildTripSaleRows(this.trips);
    },
    filteredTripSaleRows() {
      const query = (this.tripSearchText || "").toString().trim().toLowerCase();
      const filteredRows = !query
        ? this.tripSaleRows
        : this.tripSaleRows.filter((row) =>
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

      return this.sortRows(
        filteredRows,
        this.tripSaleSortBy,
        this.tripSaleSortOrder,
        (row, field) => this.getTripSaleSortValue(row, field)
      );
    },
    hasSelectedBranch() { return Number(this.branch_id) > 0; } },
  watch: {
    selectedSeats(newValue) {
      if (typeof newValue === "string") {
        this.selectedSeats = JSON.parse(newValue);
      }
    },
    "editedItem.tickettypes": {
      deep: true,
      handler() {
        if (this.isRecalculatingTickettypes) {
          return;
        }
        this.recalculateTicketTotals();
      },
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.nameUser = JSON.parse(LocalStorageService.getItem("name"));
    this.permissions = LocalStorageService.getItem("permissions");
    if (this.hasPermission("view_tickets_company")) {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      
    }
  },
  methods: { getLocalStorageValue(key) {
      const value = LocalStorageService.getItem(key);

      if (value === null || value === undefined || value === "") {
        return "";
      }

      try {
        return JSON.parse(value) || "";
      } catch (error) {
        return value;
      }
    },
    hasPermission(requiredPermissions) {
    const requested = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    let permissions = this.permissions || [];
    if (typeof permissions === 'string') {
      try { permissions = JSON.parse(permissions); } catch { permissions = permissions.split(',').map(value => value.trim()); }
    }
    return Array.isArray(permissions) && requested.some(permission => permissions.includes(permission));
  },
    getTripInternalNumber(trip) {
      return trip?.internal_number ?? trip?.internalNumber ?? "No asignado";
    },
    getTableRowItem(item) {
      return item?.raw || item || {};
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

        return String(rawA ?? "")
          .localeCompare(String(rawB ?? ""), "es", {
            numeric: true,
            sensitivity: "base",
          }) * direction;
      });
    },
    tripSaleSortIcon(field) {
      if (this.tripSaleSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.tripSaleSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    toggleTripSaleSort(field) {
      if (this.tripSaleSortBy === field) {
        this.tripSaleSortOrder = this.tripSaleSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.tripSaleSortBy = field;
      this.tripSaleSortOrder = "asc";
    },
    getTripSaleSortValue(row, field) {
      switch (field) {
        case "code":
          return row?.code ?? "";
        case "routeCode":
          return row?.routeCode ?? "";
        case "schedule":
          return row?.schedule ?? "";
        case "arrival":
          return row?.arrival ?? "";
        case "plate":
          return `${row?.plate ?? ""} ${row?.internal_number ?? ""}`;
        case "availableSeats":
          return Number(row?.availableSeats ?? 0);
        case "price":
          return Number(row?.price ?? 0);
        default:
          return row?.[field] ?? "";
      }
    },
    buildTripSaleRows(trips = []) {
      const rows = [];

      (Array.isArray(trips) ? trips : []).forEach((trip) => {
        const tripFares = this.getTripFareSegments(trip);

        tripFares.forEach((fare) => {
          const range = this.getSegmentRange(fare, trip);
          if (!range) {
            return;
          }

          const fareAvailability = this.getTripFareAvailabilityForSegment(trip, fare);

          rows.push({
            id: `${trip.id}-${fare.id}`,
            trip_id: Number(trip.id),
            fare_segment_id: Number(fare.id),
            tripFareId: Number(fare.id),
            code: trip.code || trip.tripCode || trip.trip_code || "-",
            routeCode:
              trip.routeCode ||
              trip.route_code ||
              trip.route?.code ||
              trip.route?.routeCode ||
              "-",
            name: trip.name || "No especificado",
            origin: this.getRouteStopLabel(range.originStop),
            destination: this.getRouteStopLabel(range.destinationStop),
            schedule: trip.schedule || "-",
            arrival: trip.arrival || "-",
            plate: trip.plate || trip.vehicleName || "-",
            internal_number: this.getTripInternalNumber(trip),
            price: Number(fare.price ?? fare.base_price ?? 0) || 0,
            availableSeats: Number(fareAvailability.availableSeats) || 0,
          });
        });
      });

      return rows;
    },
    getFareSegmentRouteStopLabel(routeStop) {
      if (!routeStop) {
        return "No especificado";
      }

      if (typeof routeStop === "string") {
        return routeStop;
      }

      return (
        routeStop.location?.address ||
        routeStop.locationName ||
        routeStop.address ||
        routeStop.name ||
        routeStop.label ||
        "No especificado"
      );
    },
    getRouteStopLabel(routeStop) {
      return this.getFareSegmentRouteStopLabel(routeStop);
    },
    getSaleModeLabel(ticket = {}) {
      const saleMode = String(ticket?.sale_mode || ticket?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "Express" : "Full";
    },
    getSaleModeColor(ticket = {}) {
      const saleMode = String(ticket?.sale_mode || ticket?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "secondary" : "primary";
    },
    getMethodColor(methodValue) {
      const colors = {
        Efectivo: "green-darken-2",
        Debito: "purple-darken-2",
        Credito: "blue-darken-2",
      };
      return colors[methodValue] || "";
    },
    getCardClass(method) {
      const baseClass = {
        "payment-method-card": true,
        "cursor-pointer": true,
      };

      if (this.editedItem.method === method.value) {
        return {
          ...baseClass,
          [`selected-${method.value.toLowerCase()}`]: true,
          "elevation-1": true,
        };
      }
      return baseClass;
    },
    getSelectedTripRecord() {
      return (
        (this.trips || []).find(
          (trip) => Number(trip.id) === Number(this.editedItem.trip_id)
        ) || null
      );
    },
    getSelectedFareSegmentRecord() {
      const selectedId = this.editedItem.fare_segment_id;
      if (selectedId === null || selectedId === undefined || selectedId === "") {
        return null;
      }

      const trip = this.selectedTripRecord;
      if (!trip) {
        return null;
      }

      return (
        this.getFareSegmentOptions(trip).find(
          (segment) => Number(segment.id) === Number(selectedId)
        ) || null
      );
    },
    getLocationSubtitle(location) {
      if (!location) {
        return "";
      }

      return [location.city, location.country].filter(Boolean).join(" · ") || "Ubicación";
    },
    resetTripSelectionState(keepLocations = true) {
      this.editedItem.trip_id = "";
      this.editedItem.fare_segment_id = null;
      this.editedItem.tickettypes = [];
      this.selectedSeats = [];
      this.reservedSeats = [];
      this.availableSeats = [];
      this.availableSeatNumbers = [];
      this.seatMap = [];
      this.aviable = 0;
      this.trips = [];

      if (!keepLocations) {
        this.selectedOriginLocationId = null;
        this.selectedDestinationLocationId = null;
      }
    },
    async loadTripLocations(branchId) {
      this.tripSearchLoading = true;
      this.data = {};
      const normalizedBranchId = branchId ?? this.editedItem.branch_id ?? this.branch_id;
      if (
        normalizedBranchId === "null" ||
        normalizedBranchId === null ||
        normalizedBranchId === ""
      ) {
        this.locations = [];
        this.promotions = [];
        this.tripSearchLoading = false;
        return;
      }
      this.data.branch_id = Number(normalizedBranchId);
      this.data.date = this.getChileDate();
      this.data.trips = false;

      try {
        const result = await handleRequest({
          endpoint: "get-trip-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.locations = result.data?.locations || [];
          this.promotions = this.normalizePromotions(result.data?.promotions || []);
        } else {
          this.locations = [];
          this.promotions = [];
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
        this.locations = [];
      } finally {
        this.tripSearchLoading = false;
      }
    },
    async loadTripsBySelectedLocations(preserveTripId = null) {
      if (!this.selectedOriginLocationId || !this.selectedDestinationLocationId) {
        this.trips = [];
        return;
      }

      this.tripSearchLoading = true;
      const normalizedBranchId = this.editedItem.branch_id ?? this.branch_id;
      if (
        normalizedBranchId === "null" ||
        normalizedBranchId === null ||
        normalizedBranchId === ""
      ) {
        this.trips = [];
        this.tripSearchLoading = false;
        return;
      }
      const requestData = {
        branch_id: Number(normalizedBranchId),
        origin_id: Number(this.selectedOriginLocationId),
        destination_id: Number(this.selectedDestinationLocationId),
        date: this.getChileDate(),
      };

      try {
        const result = await handleRequest({
          endpoint: "get-trip-date-segment",
          method: "POST",
          data: requestData,
        });

        if (result.success) {
          this.trips = this.filterTripsForReservation(
            result.data?.trips || [],
            requestData.date,
            preserveTripId
          );
        } else {
          this.trips = [];
        }
      } catch (error) {
        this.trips = [];
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al buscar los viajes disponibles.",
          3000
        );
      } finally {
        this.tripSearchLoading = false;
      }
    },
    async handleLocationSelectionChange() {
      if (
        this.selectedOriginLocationId &&
        this.selectedDestinationLocationId &&
        Number(this.selectedOriginLocationId) === Number(this.selectedDestinationLocationId)
      ) {
        this.selectedDestinationLocationId = null;
        this.showAlert(
          "warning",
          "El origen y el destino no pueden ser la misma ubicación.",
          3000
        );
      }

      this.resetTripSelectionState(true);
      this.step = 1;

      if (this.selectedOriginLocationId && this.selectedDestinationLocationId) {
        await this.loadTripsBySelectedLocations();
      }
    },
    async onTicketBranchChange(branchId) {
      this.editedItem.branch_id = branchId;
      this.tripSearchText = "";
      this.resetTripSelectionState(false);
      await this.loadTripLocations(branchId);
    },
    selectTripForSale(trip) {
      if (!trip) {
        return;
      }

      const tripId = Number(trip.trip_id ?? trip.tripId ?? trip.id);
      const fareSegmentId =
        Number(trip.fare_segment_id ?? trip.fareSegmentId ?? 0) || null;

      this.editedItem.trip_id = tripId;
      this.editedItem.fare_segment_id = fareSegmentId;
      this.updateSeats(tripId);
      this.step = 2;
    },
    nextStep() {
      if (!this.editedItem.trip_id || !this.editedItem.fare_segment_id) {
        this.showAlert("warning", "Seleccione un viaje y un tramo para continuar.", 2500);
        return;
      }

      this.step = 2;
    },
    prevStep() {
      this.editedItem.trip_id = null;
      this.editedItem.fare_segment_id = null;
      this.selectedSeats = [];
      this.availableSeatNumbers = [];
      this.currentlyEditing = null;
      this.step = 1;
    },
    getTripStopsCollection(trip, key = "routeStops") {
      const value = trip?.[key];
      return Array.isArray(value) ? value.filter(Boolean) : [];
    },
    getTripOriginStop(trip = this.selectedTripRecord) {
      const routeStops = this.getTripRouteStops(trip);
      if (routeStops.length) {
        return (
          [...routeStops].sort((a, b) => {
            const orderA = Number(a?.stop_order ?? a?.stopOrder ?? a?.order ?? 0);
            const orderB = Number(b?.stop_order ?? b?.stopOrder ?? b?.order ?? 0);
            return orderA - orderB;
          })[0] || null
        );
      }

      const tripStops = this.getTripTripStops(trip);
      if (!tripStops.length) {
        return null;
      }

      const firstTripStop = [...tripStops].sort((a, b) => {
        const orderA = Number(a?.stop_order ?? a?.stopOrder ?? a?.order ?? 0);
        const orderB = Number(b?.stop_order ?? b?.stopOrder ?? b?.order ?? 0);
        return orderA - orderB;
      })[0];

      return firstTripStop?.routeStop || firstTripStop?.route_stop || null;
    },
    getTripDestinationStop(trip = this.selectedTripRecord) {
      const routeStops = this.getTripRouteStops(trip);
      if (routeStops.length) {
        return (
          [...routeStops].sort((a, b) => {
            const orderA = Number(a?.stop_order ?? a?.stopOrder ?? a?.order ?? 0);
            const orderB = Number(b?.stop_order ?? b?.stopOrder ?? b?.order ?? 0);
            return orderA - orderB;
          })[routeStops.length - 1] || null
        );
      }

      const tripStops = this.getTripTripStops(trip);
      if (!tripStops.length) {
        return null;
      }

      const lastTripStop = [...tripStops].sort((a, b) => {
        const orderA = Number(a?.stop_order ?? a?.stopOrder ?? a?.order ?? 0);
        const orderB = Number(b?.stop_order ?? b?.stopOrder ?? b?.order ?? 0);
        return orderA - orderB;
      })[tripStops.length - 1];

      return lastTripStop?.routeStop || lastTripStop?.route_stop || null;
    },
    getTripFareSegments(trip = this.selectedTripRecord) {
      const fromFareSegments = Array.isArray(trip?.fareSegments) ? trip.fareSegments : [];
      const fromTripFares = Array.isArray(trip?.tripFares)
        ? trip.tripFares
          .map((fare) => {
            const fareSegmentTicketType = fare?.fareSegmentTicketType || {};
            const fareSegment =
              fareSegmentTicketType.fareSegment || fare?.fareSegment || {};

            const normalizedId = Number(
              fareSegment?.id ??
              fare?.fare_segment_id ??
              fare?.fareSegmentTicketType?.fare_segment_id ??
              fareSegmentTicketType?.fareSegment?.id ??
              0
            );

            if (!normalizedId) {
              return null;
            }

            return {
              ...fareSegment,
              id: normalizedId,
              fare_segment_id: normalizedId,
              origin_route_stop_id:
                fareSegment.origin_route_stop_id ??
                fareSegment.originRouteStop?.id ??
                fareSegmentTicketType.fareSegment?.origin_route_stop_id ??
                null,
              destination_route_stop_id:
                fareSegment.destination_route_stop_id ??
                fareSegment.destinationRouteStop?.id ??
                fareSegmentTicketType.fareSegment?.destination_route_stop_id ??
                null,
              originRouteStop:
                fareSegment.originRouteStop || fareSegment.origin_route_stop || null,
              destinationRouteStop:
                fareSegment.destinationRouteStop ||
                fareSegment.destination_route_stop ||
                null,
              base_price:
                Number(
                  fare.price ??
                  fare.base_price ??
                  fareSegment.base_price ??
                  fareSegmentTicketType.base_price ??
                  0
                ) || 0,
              price:
                Number(
                  fare.price ??
                  fare.base_price ??
                  fareSegment.base_price ??
                  fareSegmentTicketType.base_price ??
                  0
                ) || 0,
              active: fare.active ?? true,
              fareSegmentTicketType,
              fareSegment,
            };
          })
          .filter(Boolean)
        : [];

      const uniqueSegments = new Map();
      [...fromFareSegments, ...fromTripFares].forEach((segment) => {
        const segmentId = Number(segment?.id);
        if (!segmentId || uniqueSegments.has(segmentId)) {
          return;
        }

        uniqueSegments.set(segmentId, segment);
      });

      return Array.from(uniqueSegments.values());
    },
    normalizeTripFareRecord(fare = {}) {
      const fareSegmentTicketType = fare?.fareSegmentTicketType || {};
      const fareSegment = fareSegmentTicketType?.fareSegment || fare?.fareSegment || {};
      const availableSeatNumbers = this.normalizeSeatNumbers(
        fare.availableSeatNumbers ?? fare.available_seat_numbers ?? []
      );
      const occupiedSeats = this.normalizeSeatNumbers(
        fare.occupiedSeats ?? fare.occupied_seats ?? []
      );
      const reservedSeats = this.normalizeSeatNumbers(
        fare.reservedSeats ?? fare.reserved_seats ?? []
      );
      const availableSeats = Number(
        fare.availableSeats ??
        fare.available_seats ??
        availableSeatNumbers.length ??
        0
      );

      return {
        ...fare,
        id: fare.id ?? null,
        fare_segment_id:
          fare.fare_segment_id ??
          fareSegmentTicketType.fare_segment_id ??
          fareSegment?.id ??
          null,
        fareSegmentTicketType,
        fareSegment,
        availableSeatNumbers,
        occupiedSeats,
        reservedSeats,
        availableSeats: Number.isFinite(availableSeats) ? availableSeats : 0,
        price:
          Number(fare.price ?? fare.base_price ?? fareSegmentTicketType.base_price ?? 0) ||
          0,
        base_price:
          Number(fare.base_price ?? fare.price ?? fareSegmentTicketType.base_price ?? 0) ||
          0,
      };
    },
    getTripFareRecords(trip = this.selectedTripRecord) {
      return (Array.isArray(trip?.tripFares) ? trip.tripFares : [])
        .map((fare) => this.normalizeTripFareRecord(fare))
        .filter((fare) => fare && fare.id !== null && fare.id !== undefined);
    },
    getTripFareRecordForSegment(trip = this.selectedTripRecord, segment = null) {
      const segmentId = Number(
        segment?.id ??
        segment?.fare_segment_id ??
        segment?.fareSegmentTicketType?.fare_segment_id ??
        this.editedItem.fare_segment_id ??
        0
      );

      if (!segmentId) {
        return null;
      }

      return (
        this.getTripFareRecords(trip).find((fare) => {
          const fareSegmentId = Number(
            fare.fare_segment_id ??
            fare.fareSegmentTicketType?.fare_segment_id ??
            fare.fareSegment?.id ??
            fare.fareSegmentTicketType?.fareSegment?.id ??
            0
          );

          return fareSegmentId === segmentId;
        }) || null
      );
    },
    getTripFareAvailabilityForSegment(trip = this.selectedTripRecord, segment = null) {
      const fareRecord = this.getTripFareRecordForSegment(trip, segment);

      if (fareRecord) {
        const availableSeatNumbers = Array.isArray(fareRecord.availableSeatNumbers)
          ? fareRecord.availableSeatNumbers
          : [];
        const availableSeats = Number.isFinite(Number(fareRecord.availableSeats))
          ? Number(fareRecord.availableSeats)
          : availableSeatNumbers.length;

        return {
          availableSeats,
          availableSeatNumbers,
          occupiedSeats: Array.isArray(fareRecord.occupiedSeats)
            ? fareRecord.occupiedSeats
            : [],
          reservedSeats: Array.isArray(fareRecord.reservedSeats)
            ? fareRecord.reservedSeats
            : [],
        };
      }

      return {
        availableSeats: 0,
        availableSeatNumbers: [],
        occupiedSeats: [],
        reservedSeats: [],
      };
    },
    getReservedSeatNumbersForSegment(trip = this.selectedTripRecord, segment = null) {
      const fareAvailability = this.getTripFareAvailabilityForSegment(trip, segment);

      if (fareAvailability.reservedSeats.length) {
        return [...new Set(fareAvailability.reservedSeats.map(Number))];
      }

      if (fareAvailability.occupiedSeats.length) {
        return [...new Set(fareAvailability.occupiedSeats.map(Number))];
      }

      return this.getOccupiedSeatsForSelection(trip, segment);
    },
    getFareSegmentOriginStop(segment, trip = this.selectedTripRecord) {
      if (!segment) {
        return null;
      }

      const routeStops = this.getTripStopsCollection(trip, "routeStops");
      const originId =
        segment.origin_route_stop_id ??
        segment.originRouteStop?.id ??
        segment.origin_route_stop?.id ??
        segment.originStop?.id ??
        segment.origin?.id ??
        null;

      if (originId !== null && originId !== undefined) {
        const direct = routeStops.find((stop) => Number(stop.id) === Number(originId));
        if (direct) {
          return direct;
        }

        const tripStop = this.getTripTripStops(trip).find(
          (stop) =>
            Number(stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id) ===
            Number(originId)
        );

        if (tripStop?.routeStop) {
          return tripStop.routeStop;
        }
      }

      return (
        segment.originRouteStop || segment.origin_route_stop || segment.originStop || null
      );
    },
    getFareSegmentDestinationStop(segment, trip = this.selectedTripRecord) {
      if (!segment) {
        return null;
      }

      const routeStops = this.getTripStopsCollection(trip, "routeStops");
      const destinationId =
        segment.destination_route_stop_id ??
        segment.destinationRouteStop?.id ??
        segment.destination_route_stop?.id ??
        segment.destinationStop?.id ??
        segment.destination?.id ??
        null;

      if (destinationId !== null && destinationId !== undefined) {
        const direct = routeStops.find(
          (stop) => Number(stop.id) === Number(destinationId)
        );
        if (direct) {
          return direct;
        }

        const tripStop = this.getTripTripStops(trip).find(
          (stop) =>
            Number(stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id) ===
            Number(destinationId)
        );

        if (tripStop?.routeStop) {
          return tripStop.routeStop;
        }
      }

      return (
        segment.destinationRouteStop ||
        segment.destination_route_stop ||
        segment.destinationStop ||
        null
      );
    },
    getStopOrderFromStop(stop) {
      if (!stop) {
        return null;
      }

      const order = Number(stop.stop_order ?? stop.stopOrder ?? stop.order);
      return Number.isNaN(order) ? null : order;
    },
    getSegmentRange(segment, trip = this.selectedTripRecord) {
      const originStop = this.getFareSegmentOriginStop(segment, trip);
      const destinationStop = this.getFareSegmentDestinationStop(segment, trip);
      const originOrder = this.getStopOrderFromStop(originStop);
      const destinationOrder = this.getStopOrderFromStop(destinationStop);

      if (
        originOrder === null ||
        destinationOrder === null ||
        originOrder >= destinationOrder
      ) {
        return null;
      }

      return {
        originStop,
        destinationStop,
        originOrder,
        destinationOrder,
      };
    },
    getTripRouteStops(trip = this.selectedTripRecord) {
      return this.getTripStopsCollection(trip, "routeStops");
    },
    getTripTripStops(trip = this.selectedTripRecord) {
      return this.getTripStopsCollection(trip, "tripStops");
    },
    getTripStopForRouteStop(trip, routeStopId) {
      if (!trip || routeStopId === null || routeStopId === undefined) {
        return null;
      }

      return (
        this.getTripTripStops(trip).find(
          (stop) =>
            Number(stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id) ===
            Number(routeStopId)
        ) || null
      );
    },
    formatFareSegmentLabel(segment, trip = this.selectedTripRecord) {
      const range = this.getSegmentRange(segment, trip);
      if (!range) {
        return "Tramo sin datos";
      }

      return `${this.getRouteStopLabel(range.originStop)} -> ${this.getRouteStopLabel(
        range.destinationStop
      )}`;
    },
    normalizeFareSegmentOption(segment, trip = this.selectedTripRecord) {
      const range = this.getSegmentRange(segment, trip);
      const serviceClass = segment.service_class ?? segment.serviceClass ?? "";
      const serviceClassLabel = serviceClass
        ? serviceClass
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
        : "Tramo";

      return {
        ...segment,
        id: segment.id,
        label: this.formatFareSegmentLabel(segment, trip),
        service_class_label: serviceClassLabel,
        origin_label: range ? this.getRouteStopLabel(range.originStop) : "-",
        destination_label: range ? this.getRouteStopLabel(range.destinationStop) : "-",
        origin_order: range?.originOrder ?? null,
        destination_order: range?.destinationOrder ?? null,
        base_price: Number(segment.base_price ?? segment.basePrice ?? 0) || 0,
        currency: segment.currency || "CLP",
        valid_from: segment.valid_from ?? segment.validFrom ?? "",
        valid_to: segment.valid_to ?? segment.validTo ?? "",
        active: segment.active ?? true,
      };
    },
    isFareSegmentSelectable(segment, trip = this.selectedTripRecord) {
      const range = this.getSegmentRange(segment, trip);
      if (!range) {
        return false;
      }

      const originTripStop = this.getTripStopForRouteStop(trip, range.originStop?.id);
      const destinationTripStop = this.getTripStopForRouteStop(
        trip,
        range.destinationStop?.id
      );

      const routeCanBoard = range.originStop?.allows_boarding !== false;
      const routeCanAlight = range.destinationStop?.allows_alighting !== false;
      const tripCanBoard = originTripStop ? originTripStop.can_board !== false : true;
      const tripCanAlight = destinationTripStop
        ? destinationTripStop.can_alight !== false
        : true;

      return routeCanBoard && routeCanAlight && tripCanBoard && tripCanAlight;
    },
    getFareSegmentOptions(trip = this.selectedTripRecord) {
      return this.getTripFareSegments(trip)
        .map((segment) => this.normalizeFareSegmentOption(segment, trip))
        .filter((segment) => {
          if (!this.isFareSegmentSelectable(segment, trip)) {
            return false;
          }

          if (segment.origin_order >= segment.destination_order) {
            return false;
          }

          return segment.active !== false;
        })
        .sort((a, b) => {
          const originDiff = Number(a.origin_order) - Number(b.origin_order);
          if (originDiff !== 0) {
            return originDiff;
          }

          const destinationDiff =
            Number(a.destination_order) - Number(b.destination_order);
          if (destinationDiff !== 0) {
            return destinationDiff;
          }

          return Number(a.id) - Number(b.id);
        });
    },
    normalizeSeatNumbers(seats = []) {
      return (Array.isArray(seats) ? seats : [])
        .map((seat) => Number(seat?.label ?? seat?.seat ?? seat?.number ?? seat))
        .filter((seat) => Number.isFinite(seat));
    },
    getTripOccupancyRecords(trip = this.selectedTripRecord) {
      if (!trip) {
        return [];
      }

      const sources = [
        trip.tickets,
        trip.ticketSales,
        trip.soldTickets,
        trip.bookings,
        trip.reservations,
        trip.occupiedTickets,
      ];

      const currentTicketId =
        this.editedIndex > -1 ? Number(this.editedItem?.id) || null : null;
      const records = [];

      sources.forEach((source) => {
        if (!Array.isArray(source)) {
          return;
        }

        source.filter(Boolean).forEach((ticket) => {
          if (
            currentTicketId !== null &&
            Number(ticket?.id) === Number(currentTicketId)
          ) {
            return;
          }

          records.push(ticket);
        });
      });

      return records;
    },
    getTicketFareSegmentId(ticket) {
      if (!ticket) {
        return null;
      }

      const directId =
        ticket.fare_segment_id ??
        ticket.fareSegmentId ??
        ticket.fareSegment?.id ??
        ticket.fare_segment?.id ??
        null;

      if (directId !== null && directId !== undefined) {
        return Number(directId);
      }

      const ticketItems = Array.isArray(ticket.ticketItems) ? ticket.ticketItems : [];
      const firstItem = ticketItems[0] || null;
      const fareSegmentId =
        firstItem?.tripFare?.fareSegmentTicketType?.fareSegment?.id ??
        firstItem?.tripFare?.fareSegmentTicketType?.fare_segment_id ??
        firstItem?.tripFare?.fareSegment?.id ??
        firstItem?.tripFare?.fare_segment_id ??
        null;

      return fareSegmentId !== null && fareSegmentId !== undefined
        ? Number(fareSegmentId)
        : null;
    },
    getTripFullRange(trip = this.selectedTripRecord) {
      const originStop = this.getTripOriginStop(trip);
      const destinationStop = this.getTripDestinationStop(trip);
      const originOrder = this.getStopOrderFromStop(originStop);
      const destinationOrder = this.getStopOrderFromStop(destinationStop);

      if (
        originOrder === null ||
        destinationOrder === null ||
        originOrder >= destinationOrder
      ) {
        return null;
      }

      return {
        originStop,
        destinationStop,
        originOrder,
        destinationOrder,
      };
    },
    getTicketSegmentRange(ticket, trip = this.selectedTripRecord) {
      if (!ticket) {
        return null;
      }

      const segmentId = this.getTicketFareSegmentId(ticket);

      if (segmentId !== null && segmentId !== undefined) {
        const segment = this.getTripFareSegments(trip).find(
          (item) => Number(item.id) === Number(segmentId)
        );
        if (segment) {
          return this.getSegmentRange(segment, trip);
        }
      }

      const originId =
        ticket.origin_route_stop_id ??
        ticket.originRouteStopId ??
        ticket.originRouteStop?.id ??
        ticket.origin_route_stop?.id ??
        null;
      const destinationId =
        ticket.destination_route_stop_id ??
        ticket.destinationRouteStopId ??
        ticket.destinationRouteStop?.id ??
        ticket.destination_route_stop?.id ??
        null;

      if (originId === null || destinationId === null) {
        return null;
      }

      const routeStops = this.getTripRouteStops(trip);
      const originStop = routeStops.find((stop) => Number(stop.id) === Number(originId));
      const destinationStop = routeStops.find(
        (stop) => Number(stop.id) === Number(destinationId)
      );

      if (!originStop || !destinationStop) {
        return null;
      }

      return this.getSegmentRange(
        {
          originRouteStop: originStop,
          destinationRouteStop: destinationStop,
        },
        trip
      );
    },
    isTicketIntervalOverlapping(
      ticket,
      originOrder,
      destinationOrder,
      trip = this.selectedTripRecord
    ) {
      const range = this.getTicketSegmentRange(ticket, trip);
      if (!range) {
        return false;
      }

      return (
        Number(range.originOrder) < Number(destinationOrder) &&
        Number(range.destinationOrder) > Number(originOrder)
      );
    },
    getOccupiedSeatsForSelection(
      trip = this.selectedTripRecord,
      fareSegment = this.selectedFareSegmentRecord
    ) {
      const baseReserved = this.normalizeSeatNumbers(
        trip?.reservedSeats || trip?.occupiedSeats || trip?.reserved_seats || []
      );

      const fareAvailability = this.getTripFareAvailabilityForSegment(trip, fareSegment);
      if (fareAvailability.reservedSeats.length) {
        return [...new Set(fareAvailability.reservedSeats.map(Number))];
      }
      if (fareAvailability.occupiedSeats.length) {
        return [...new Set(fareAvailability.occupiedSeats.map(Number))];
      }

      const range = fareSegment
        ? this.getSegmentRange(fareSegment, trip)
        : this.getTripFullRange(trip);

      if (!range) {
        return [...new Set(baseReserved)];
      }

      const occupancyRecords = this.getTripOccupancyRecords(trip);

      if (fareSegment) {
        const occupied = new Set();

        occupancyRecords.forEach((ticket) => {
          if (
            !this.isTicketIntervalOverlapping(
              ticket,
              range.originOrder,
              range.destinationOrder,
              trip
            )
          ) {
            return;
          }

          this.normalizeSeatNumbers(
            ticket?.seats || ticket?.seatMap || ticket?.selectedSeats
          ).forEach((seat) => occupied.add(seat));
        });

        return [...occupied];
      }

      if (occupancyRecords.length === 0) {
        return [...new Set(baseReserved)];
      }

      const occupied = new Set(baseReserved);

      occupancyRecords.forEach((ticket) => {
        if (
          !this.isTicketIntervalOverlapping(
            ticket,
            range.originOrder,
            range.destinationOrder,
            trip
          )
        ) {
          return;
        }

        this.normalizeSeatNumbers(
          ticket?.seats || ticket?.seatMap || ticket?.selectedSeats
        ).forEach((seat) => occupied.add(seat));
      });

      return [...occupied];
    },
    formatNumber(value) {
      // Verificar si el valor es 0, null, undefined o no es un nÃºmero
      if (value === 0 || value === null || value === undefined || isNaN(value)) {
        return "0.0";
      }
      // Si el valor es menor que 1000, devuelve el valor original con dos decimales
      if (value < 1000) {
        return (Math.round((value + Number.EPSILON) * 100) / 100).toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
      }

      // Primero, redondea el valor a dos decimales
      value = Math.round((value + Number.EPSILON) * 100) / 100;

      // Convierte el valor a cadena con formato de nÃºmero local (en-US)
      let formattedValue = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return formattedValue;
    },
    getSelectedTripBasePrice() {
      return Number(this.editedItem.price) || 0;
    },
    normalizePromotions(promotions = []) {
      return (Array.isArray(promotions)
        ? promotions
        : Object.values(promotions || {})
      ).map((promotion) => ({
        ...promotion,
        discount_type: promotion.discount_type ?? promotion.discountType ?? "monto",
      }));
    },
    getTicketTypePayableAmount(ticket) {
      const cant = Math.max(0, Number(ticket?.cant) || 0);
      if (!cant) {
        return 0;
      }

      return Math.max(
        0,
        Number(ticket.line_total ?? ticket.lineTotal ?? ticket.base_price * cant ?? 0) ||
        0
      );
    },
    async showBranches() {
    this.loading = true;
    try {
      const result = await handleRequest({ endpoint: 'branch', method: 'GET' });
      this.branches = result.success && Array.isArray(result.data?.branches) ? result.data.branches : [];
      this.branch_id = this.branches[0]?.id ?? '';
      if (!result.success) this.showAlert('warning', result.message || 'No se pudieron cargar las sucursales.', 3000);
    } catch (error) {
      this.branches = [];
      this.branch_id = '';
      this.showAlert('error', 'No se pudieron cargar las sucursales.', 3000);
    } finally {
      this.loading = false;
    }
    
  },
    isSeatAvailable(seat) {
      return (
        seat.type === "seat" &&
        seat.label &&
        this.availableSeatNumbers.includes(Number(seat.label)) &&
        !this.isSeatReserved(Number(seat.label))
      );
    },
    updateSeats(tripId, preserveTicketItems = false) {
      this.availableSeats = [];
      this.reservedSeats = [];
      this.availableSeatNumbers = [];
      this.aviable = 0;
      this.selectedSeats = [];

      const selectedTrip = this.trips.find((trip) => Number(trip.id) === Number(tripId));
      if (!selectedTrip) {
        this.editedItem.price = 0;
        this.editedItem.tickettypes = [];
        this.editedItem.fare_segment_id = null;
        return;
      }

      if (!preserveTicketItems) {
        this.editedItem.tickettypes = [];
      }

      const validFareSegments = this.getFareSegmentOptions(selectedTrip);
      const hasSelectedSegment = validFareSegments.some(
        (segment) => Number(segment.id) === Number(this.editedItem.fare_segment_id)
      );

      if (!hasSelectedSegment) {
        this.editedItem.fare_segment_id = null;
      }

      this.editedItem.price = 0;
      this.seats = Number(selectedTrip.seats) || 0;
      this.seatMap = Array.isArray(selectedTrip.seatMap) ? selectedTrip.seatMap : [];
      const selectedFareSegment = hasSelectedSegment
        ? this.selectedFareSegmentRecord
        : null;
      const fareAvailability = this.getTripFareAvailabilityForSegment(
        selectedTrip,
        selectedFareSegment
      );
      this.availableSeatNumbers = [...fareAvailability.availableSeatNumbers];
      this.reservedSeats = this.getReservedSeatNumbersForSegment(
        selectedTrip,
        selectedFareSegment
      );

      this.availableSeats = this.availableSeatNumbers.length
        ? [...this.availableSeatNumbers]
        : this.generateAvailableSeats(this.seatMap, this.reservedSeats);
      this.aviable = this.availableSeats.length;

      if (this.editedIndex > -1 && this.editedItem.seats?.length) {
        this.selectedSeats = this.editedItem.seats.map(Number);
      }

      this.recalculateTicketTotals();
    },
    generateAvailableSeats(seatMap, reservedSeats) {
      if (Array.isArray(this.availableSeatNumbers) && this.availableSeatNumbers.length) {
        return [...new Set(this.availableSeatNumbers.map(Number))];
      }

      const availableSeats = [];
      const reservedNumbers = reservedSeats.map(Number); // Convertir a nÃºmeros

      seatMap.forEach((row) => {
        row.forEach((seat) => {
          if (seat.type === "seat" && seat.label) {
            const seatNumber = Number(seat.label);
            if (!reservedNumbers.includes(seatNumber)) {
              availableSeats.push(seatNumber);
            }
          }
        });
      });

      return availableSeats;
    },
    isSeatReserved(seatNumber) {
      return this.reservedSeats.includes(Number(seatNumber));
    },
    toggleSeat(seat) {
      // ValidaciÃ³n adicional de seguridad
      if (!this.isSeatAvailable(seat)) return;

      const seatNumber = Number(seat.label);
      const index = this.selectedSeats.indexOf(seatNumber);

      // Limitar la selecciÃ³n al quantity definido
      if (index === -1) {
        if (this.selectedSeats.length >= this.editedItem.quantity) {
          this.showAlert(
            "warning",
            `Solo puede seleccionar ${this.editedItem.quantity} asientos`,
            2000
          );
          return;
        }
        this.selectedSeats.push(seatNumber);
      } else {
        this.selectedSeats.splice(index, 1);
      }

      // Forzar actualizaciÃ³n si es necesario
      this.$forceUpdate();
    },
    getChileDateTime() {
      return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
    },
    normalizeTripDateTime(value, fallbackDate = null) {
      const rawValue = String(value || "").trim();
      if (!rawValue) {
        return null;
      }

      const normalized = rawValue.replace("T", " ");
      if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
        return normalized.length === 16 ? `${normalized}:00` : normalized.slice(0, 19);
      }

      const timeMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!timeMatch) {
        return normalized;
      }

      const datePart = String(fallbackDate || this.getChileDate()).split("T")[0];
      const hours = timeMatch[1].padStart(2, "0");
      const minutes = timeMatch[2];
      const seconds = (timeMatch[3] || "00").padStart(2, "0");
      return `${datePart} ${hours}:${minutes}:${seconds}`;
    },
    filterTripsForReservation(trips, currentDate, currentTripId = null) {
      const nowChile = this.getChileDateTime();
      const referenceDate = String(currentDate || this.getChileDate()).split("T")[0];

      return trips.filter((trip) => {
        // âœ… 1. Siempre incluir el viaje que se estÃ¡ editando
        if (currentTripId !== null && Number(trip.id) === Number(currentTripId)) {
          return true;
        }

        if (!trip?.arrival) {
          return true;
        }

        const tripArrival = this.normalizeTripDateTime(trip.arrival, referenceDate);
        if (!tripArrival) {
          return true;
        }

        return tripArrival > nowChile;
      });
    },
    getChileDate() {
      return new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Santiago",
      });
    },
    async showAdd() {
      if (!this.hasPermission('view_traditional_sales_web') || !this.hasSelectedBranch) return;
      this.close();
      await this.$nextTick();
      this.step = 1;
      this.editedItem.method = "Efectivo";
      this.editedItem.branch_id = this.branch_id;
      this.normal = "";
      this.selectedPromotion = "";
      this.resetTripSelectionState(true);
      try {
        await this.loadTripLocations(this.editedItem.branch_id);
        this.tickettypes = [];
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
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.originalItem = Object.assign({}, this.defaultItem);
      });
      this.step = 1;
      this.tripSearchText = "";
      this.selectedSeats = [];
      this.selectedOriginLocationId = null;
      this.selectedDestinationLocationId = null;
      this.trips = [];
      this.editedIndex = -1;
      this.reservedSeats = [];
      this.availableSeats = [];
      this.availableSeatNumbers = [];
      this.seatMap = [];
      this.aviable = 0;
    },
    areSeatsDifferent(originalSeats, editedSeats) {
      // Convertir ambos arrays en cadenas de texto para una comparaciÃ³n profunda
      const originalSeatsString = JSON.stringify(originalSeats);
      const editedSeatsString = JSON.stringify(editedSeats);
      // Comparar las cadenas generadas
      return originalSeatsString !== editedSeatsString;
    },
    normalizeTicketItemsPayload(items = []) {
      return (Array.isArray(items) ? items : [])
        .filter((item) => item && Number(item.cant ?? item.quantity) > 0)
        .map((item) => {
          const payload = {
            trip_fare_id: Number(item.trip_fare_id ?? item.tripFareId ?? item.id),
            quantity: Number(item.cant ?? item.quantity) || 0,
          };

          if (item.id && Number(item.id) !== Number(payload.trip_fare_id)) {
            payload.id = Number(item.id);
          }

          return payload;
        })
        .sort((a, b) => Number(a.trip_fare_id) - Number(b.trip_fare_id));
    },
    areTicketItemsDifferent(originalItems, editedItems) {
      const normalize = (items) =>
        this.normalizeTicketItemsPayload(items).map((item) => ({
          id: item.id ?? null,
          trip_fare_id: Number(item.trip_fare_id),
          quantity: Number(item.quantity) || 0,
        }));

      return (
        JSON.stringify(normalize(originalItems)) !==
        JSON.stringify(normalize(editedItems))
      );
    },
    async save() {
      if (this.loading || !this.hasPermission('view_traditional_sales_web')) return;
      this.loading = true;
      let shouldClose = false;
      try {
        
        this.valid = false;
        const fieldsToUpdate = [
          "trip_id",
          "branch_id",
          "status",
          "date",
          "method",
          "quantity",
          "price",
          "fare_segment_id",
          "total",
          "seats",
          "adults",
          "minors",
          "promotions",
          "ticketItems",
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
        if (this.areSeatsDifferent(this.selectedSeats, this.originalItem.seats)) {
          updatedFields.seats = this.selectedSeats;
        }
        if (
          this.areTicketItemsDifferent(
            this.originalItem.tickettypes || this.originalItem.ticketItems || [],
            this.editedItem.tickettypes
          )
        ) {
          updatedFields.ticketItems = this.normalizeTicketItemsPayload(
            this.editedItem.tickettypes
          );
        }
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.date = this.editedItem.date ? this.editedItem.date : new Date();
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          updatedFields.method = this.editedItem.method || "Efectivo";
          updatedFields.price = this.getSelectedTripBasePrice();
          try {
            const result = await handleRequest({
              endpoint: "ticket-web",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              // AquÃ­ llamamos a la funciÃ³n de impresiÃ³n con los datos del ticket
              if (result.data && result.data.ticket) {
                console.log("Ticket generado:", result.data.ticket);
                this.currentTicket = {};
                this.currentTicket = result.data.ticket;
                this.showTicketDialog = true;

                const branchIdBuscado = this.currentTicket.branch_id; // o el ID que necesitas comparar

                // Encuentra la branch que coincide
                const branchEncontrada = this.branches.find(
                  (branch) => branch.id === branchIdBuscado
                );

                // Si necesitas la branch en this para usarla en el template
                this.selectedBranch = branchEncontrada || null;
                // Genera el QR despuÃ©s de que el componente se haya renderizado
                await this.$nextTick();
                await this.generateQRCode();
                //this.printTicket(result.data.ticket);
              }
              this.showAlert("success", result.message, 3000);
              this.branch_id = this.editedItem.branch_id ?? this.branch_id;
              shouldClose = true;
            } else {
              this.showAlert("warning", result.message, 3000);
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estÃ¡ndar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
          }
        }
      
      } finally {
        this.loading = false;
        this.valid = true;
      }
      if (shouldClose) this.close();
    },
    async generateQRCode() {
      try {
        const qrData = this.currentTicket.qr;

        if (!qrData) return;

        // Opciones comunes para ambos QR
        const qrOptions = {
          width: 150,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        };

        // Generar QR original
        if (this.$refs.qrCanvasOriginal) {
          await QRCode.toCanvas(this.$refs.qrCanvasOriginal, qrData, qrOptions);
        }

        // Generar QR para copia de control
        if (this.$refs.qrCanvasControl) {
          await QRCode.toCanvas(this.$refs.qrCanvasControl, qrData, qrOptions);
        }
      } catch (error) {
        console.error("Error generando QR codes:", error);
        this.showAlert("error", "Error al generar códigos QR", 3000);
      }
    },
    async handleExpressSaleSaved(ticket = null) {
      

      if (!ticket) {
        return;
      }

      this.currentTicket = ticket;
      this.showTicketDialog = true;

      const branchIdBuscado = this.currentTicket.branch_id ?? this.currentTicket.branchId;
      this.selectedBranch =
        this.branches.find((branch) => Number(branch.id) === Number(branchIdBuscado)) || null;

      await this.$nextTick();
      await this.generateQRCode();
    },
    async printTicket() {
      try {
        const printWindow = window.open("", "_blank");

        // Generar ambos cÃ³digos QR
        let qrImageOriginal = "";
        let qrImageControl = "";
        const qrData = this.currentTicket.qr || this.currentTicket.id;

        if (qrData) {
          qrImageOriginal = await QRCode.toDataURL(qrData, {
            width: 150,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          qrImageControl = qrImageOriginal; // Usamos el mismo QR para ambas secciones
        }

        const ticketCompanyImage = this.ticketCompanyImage;
        const ticketCompanyName = this.ticketCompanyName;
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Viaje</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 10px;
                    font-size: 14px;
                }
                .ticket-container {
                    max-width: 100%;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .branch-logo {
                        width: 150px;
                        height: 80px;
                        margin: 0 auto 10px;
                        display: block;
                        object-fit: contain;
                    }

                    @media print {
                        body {
                            padding: 5px;
                        }
                        .branch-logo {
                            width: 150px !important;
                            height: 80px !important;
                            margin: 0 auto 8px !important;
                        }
                    }
                .branch-name {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .branch-info {
                    font-size: 0.875rem;
                    margin-bottom: 3px;
                }
                .dashed-divider {
                    border-top: 1px dashed #000;
                    width: 100%;
                    margin: 15px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .font-weight-medium {
                    font-weight: 500;
                }
                .font-weight-bold {
                    font-weight: bold;
                }
                .mr-1 {
                    margin-right: 4px;
                }
                .mb-1 {
                    margin-bottom: 4px;
                }
                .mb-3 {
                    margin-bottom: 12px;
                }
                .my-3 {
                    margin-top: 12px;
                    margin-bottom: 12px;
                }
                .text-center {
                    text-align: center;
                }
                .caption {
                    font-size: 0.75rem;
                }
                .uppercase-text {
                    text-transform: uppercase;
                }
                .ticket-details {
                    margin-bottom: 15px;
                }
                .control-copy-title {
                    font-style: italic;
                    margin-bottom: 8px;
                }
                @page {
                    size: auto;
                    margin: 0;
                }
                @media print {
                    body {
                    padding: 5px;
                    }
                }
                
</style>
            </head>
            <body>
                <div class="ticket-container">
                <!-- Encabezado con logo e informaciÃ³n de sucursal -->
                <div class="header">
                    ${ticketCompanyImage
            ? `
                    <img src="${this.$axios.defaults.baseURL}images/${ticketCompanyImage}" 
                        class="branch-logo" 
                        alt="${ticketCompanyName}">
                    `
            : ""
          }
                    
                    <div class="branch-name">${this.selectedBranch?.name || "Nombre Sucursal"
          }</div>
                    
                    ${this.selectedBranch?.rut
            ? `
                    <div class="branch-info">RUT: ${this.selectedBranch.rut}</div>
                    `
            : ""
          }
                    
                    ${this.selectedBranch?.address
            ? `
                    <div class="branch-info">Dirección: ${this.selectedBranch.address}</div>
                    `
            : ""
          }
                    
                    ${this.selectedBranch?.phone
            ? `
                    <div class="branch-info">Teléfono: ${this.selectedBranch.phone}</div>
                    `
            : ""
          }
                    
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <!-- Ticket original -->
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date
          }</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || "--:--"
          }</div>
                </div>
                
                <div class="mb-3">
                    <div class="detail-row">
                    <div class="font-weight-bold">Recorrido:</div>
                    <div class="ticket-sale-mode ticket-sale-mode--${String(this.currentTicket.sale_mode || this.currentTicket.saleMode || "normal").toLowerCase()}">${this.getSaleModeLabel(this.currentTicket)}</div>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || "No especificado"
          }</span>
                    </div>
                </div>
                
                <div class="ticket-details">
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Precio:</span>
                    <span>$${this.formatNumber(this.currentTicket.total)}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Medio de pago:</span>
                    <span>${this.currentTicket.method}</span>
                    </div>
                </div>
                
                <br>
                
                ${qrImageOriginal
            ? `
                    <div class="text-center">
                    <img src="${qrImageOriginal}" style="width: 150px; height: 150px;">
                    </div>
                `
            : ""
          }
                
                <br>
                
                <!-- LÃ­nea divisoria -->
                <div class="dashed-divider"></div>
                
                <!-- Copia de control -->
                <div class="text-center caption control-copy-title">
                    -Copia de control-
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date
          }</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || "--:--"
          }</div>
                </div>
                
                <div class="mb-3">
                    <div class="detail-row">
                    <div class="font-weight-bold">Recorrido:</div>
                    <div class="ticket-sale-mode ticket-sale-mode--${String(this.currentTicket.sale_mode || this.currentTicket.saleMode || "normal").toLowerCase()}">${this.getSaleModeLabel(this.currentTicket)}</div>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || "No especificado"
          }</span>
                    </div>
                </div>
                
                <div class="ticket-details">
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Precio:</span>
                    <span>$${this.formatNumber(this.currentTicket.total)}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Medio de pago:</span>
                    <span>${this.currentTicket.method}</span>
                    </div>
                </div>
                
                <br>
                
                ${qrImageControl
            ? `
                    <div class="text-center">
                    <img src="${qrImageControl}" style="width: 150px; height: 150px;">
                    </div>
                `
            : ""
          }
                
                <br>
                
                <!-- Nota de impresiÃ³n -->
                
                
                ${this.currentTicket.print >= 1
            ? `
                    <div class="text-center caption mt-2 uppercase-text">
                    (COPIA REIMPRESA POR EL OPERADOR ${this.nameUser})
                    </div>
                `
            : ""
          }
                </div>
                
                <script>
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 300);
                <\/script>
            </body>
            </html>
            `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
      } catch (error) {
        console.error("Error al imprimir:", error);
        this.showAlert("error", "Error al imprimir el ticket", 3000);
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
    getTicketTypeDefinitions(collection = null) {
      const trip = this.selectedTripRecord;
      const source = Array.isArray(trip?.tripFares) ? trip.tripFares : [];
      const selectedFareSegmentId = Number(this.editedItem.fare_segment_id || 0);

      if (!trip || !selectedFareSegmentId) {
        return [];
      }

      return source
        .filter((fare) => {
          const fareSegmentId = Number(
            fare?.fareSegment?.id ??
            fare?.fareSegmentTicketType?.fare_segment_id ??
            fare?.fare_segment_id ??
            fare?.fareSegmentTicketType?.fareSegment?.id ??
            0
          );

          return fareSegmentId === selectedFareSegmentId;
        })
        .map((fare) => this.normalizeTripFareDefinition(fare))
        .filter(
          (item) => item && item.trip_fare_id !== undefined && item.trip_fare_id !== null
        );
    },
    normalizeTripFareDefinition(fare = {}) {
      const fareSegmentTicketType = fare.fareSegmentTicketType || {};
      const fareSegment = fareSegmentTicketType.fareSegment || fare.fareSegment || {};
      const originRouteStop =
        fareSegment.originRouteStop ?? fareSegment.origin_route_stop ?? null;
      const destinationRouteStop =
        fareSegment.destinationRouteStop ?? fareSegment.destination_route_stop ?? null;
      const price =
        Number(fare.price ?? fare.base_price ?? fareSegmentTicketType.base_price ?? 0) ||
        0;

      return {
        id: fare.id,
        trip_fare_id: fare.id,
        tripFareId: fare.id,
        fare_segment_ticket_type_id:
          fare.fare_segment_ticket_type_id ?? fareSegmentTicketType.id ?? null,
        fareSegmentTicketTypeId:
          fare.fare_segment_ticket_type_id ?? fareSegmentTicketType.id ?? null,
        ticketTypeName:
          fareSegmentTicketType.ticketTypeName ||
          fareSegmentTicketType.ticket_type_name ||
          fare.ticketTypeName ||
          "Tipo de pasajero",
        ticketTypeDescription:
          fareSegmentTicketType.ticketTypeDescription || fare.ticketTypeDescription || "",
        base_price: price,
        price,
        active: fare.active ?? true,
        origin_label: this.getFareSegmentRouteStopLabel(originRouteStop) || "-",
        destination_label: this.getFareSegmentRouteStopLabel(destinationRouteStop) || "-",
        fareSegment,
        fareSegmentTicketType,
        name:
          fareSegmentTicketType.ticketTypeName ||
          fareSegmentTicketType.ticket_type_name ||
          fare.ticketTypeName ||
          "Tipo de pasajero",
        description: fareSegmentTicketType.ticketTypeDescription || "",
      };
    },
    normalizeEditedTickettypes(tickettypes = this.editedItem.tickettypes || []) {
      const source =
        tickettypes && typeof tickettypes === "object" && !Array.isArray(tickettypes)
          ? Array.isArray(tickettypes.tickettypes)
            ? tickettypes.tickettypes
            : Object.values(tickettypes)
          : tickettypes;

      if (Array.isArray(source)) {
        return source.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item.trip_fare_id !== undefined ||
              item.tripFareId !== undefined ||
              item.id !== undefined)
        );
      }

      return [];
    },
    getCurrentQuantity(ticketId) {
      const ticket = this.normalizeEditedTickettypes().find(
        (item) =>
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) === Number(ticketId)
      );
      return ticket ? Number(ticket.cant ?? ticket.quantity) || 0 : 0;
    },
    getTicketTypeDefinition(ticketOrId) {
      const ticketId =
        typeof ticketOrId === "object"
          ? ticketOrId?.trip_fare_id ?? ticketOrId?.id
          : ticketOrId;
      const currentTicket =
        typeof ticketOrId === "object" && ticketOrId ? ticketOrId : {};
      const sourceTicket =
        this.getTicketTypeDefinitions().find(
          (ticket) => Number(ticket.trip_fare_id) === Number(ticketId)
        ) || {};

      return {
        ...sourceTicket,
        ...currentTicket,
        trip_fare_id:
          sourceTicket.trip_fare_id ?? currentTicket.trip_fare_id ?? ticketId ?? null,
        id: currentTicket.id ?? sourceTicket.id ?? null,
      };
    },
    buildTicketTypeRecord(ticketOrId, quantity, existing = {}) {
      const definition = this.getTicketTypeDefinition(ticketOrId);
      const basePrice = Number(definition.base_price ?? definition.price ?? 0) || 0;
      const cant = Math.max(0, Number(quantity) || 0);
      const lineTotal = basePrice * cant;
      const record = {
        ...existing,
        id: existing.id ?? definition.id ?? null,
        trip_fare_id: definition.trip_fare_id ?? definition.id ?? null,
        tripFareId: definition.trip_fare_id ?? definition.id ?? null,
        fare_segment_ticket_type_id: definition.fare_segment_ticket_type_id ?? null,
        ticketTypeName: definition.ticketTypeName || definition.name || "",
        ticketTypeDescription:
          definition.ticketTypeDescription || definition.description || "",
        name: definition.name || definition.ticketTypeName || "",
        description: definition.description || definition.ticketTypeDescription || "",
        cant,
        quantity: cant,
        base_price: basePrice,
        basePrice,
        price: basePrice,
        line_total: lineTotal,
        lineTotal,
        total: lineTotal,
        origin_label: definition.origin_label || "-",
        destination_label: definition.destination_label || "-",
        fareSegment: definition.fareSegment || existing.fareSegment || null,
        fareSegmentTicketType:
          definition.fareSegmentTicketType || existing.fareSegmentTicketType || null,
      };

      return record;
    },
    normalizeTickettypes(tickettypes = this.editedItem.tickettypes || []) {
      const ticketItems = this.normalizeEditedTickettypes(tickettypes);
      return this.getTicketTypeDefinitions().map((ticket) => {
        const existingTicket =
          ticketItems.find(
            (item) =>
              Number(item.trip_fare_id ?? item.tripFareId ?? item.id) ===
              Number(ticket.trip_fare_id)
          ) || {};

        return this.buildTicketTypeRecord(
          ticket,
          Number(existingTicket.cant ?? existingTicket.quantity) || 0,
          existingTicket
        );
      });
    },
    recalculateTicketTotals() {
      const normalizedTickettypes = this.normalizeTickettypes();
      const quantity = normalizedTickettypes.reduce(
        (sum, ticket) => sum + (Number(ticket.cant ?? ticket.quantity) || 0),
        0
      );
      const total = normalizedTickettypes.reduce(
        (sum, ticket) => sum + (Number(ticket.line_total ?? ticket.lineTotal ?? 0) || 0),
        0
      );
      const price = quantity > 0 ? total / quantity : 0;

      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = normalizedTickettypes;
      this.editedItem.quantity = quantity;
      this.editedItem.total = total;
      this.editedItem.price = price;
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    validateQuantity(ticket) {
      this.quantityErrors = {
        ...this.quantityErrors,
        [ticket.trip_fare_id || ticket.id]: null,
      };

      const currentQty = this.getCurrentQuantity(ticket.trip_fare_id || ticket.id);
      const requestedQty = Math.max(0, Number(ticket.cant ?? ticket.quantity) || 0);
      const maxAllowed = Math.max(
        0,
        this.availableSeats.length - (this.totalSelected - currentQty)
      );

      if (requestedQty > maxAllowed) {
        ticket.cant = maxAllowed;
        this.quantityErrors = {
          ...this.quantityErrors,
          [ticket.trip_fare_id || ticket.id]: `Máximo disponible: ${maxAllowed}`,
        };
      }

      this.handleQuantityChange(ticket, ticket.cant ?? ticket.quantity);
    },
    handleQuantityChange(ticket, newValue) {
      const numericValue = Math.max(0, Number(newValue) || 0);
      const currentQty = this.getCurrentQuantity(ticket.trip_fare_id || ticket.id);
      const maxAllowed = Math.max(
        0,
        this.availableSeats.length - (this.totalSelected - currentQty)
      );

      if (numericValue > maxAllowed) {
        this.seatError = `Excede la capacidad. Máximo: ${this.availableSeats.length} asientos`;
        this.quantityErrors = {
          ...this.quantityErrors,
          [ticket.trip_fare_id || ticket.id]: `Máximo disponible: ${maxAllowed}`,
        };
        return;
      }

      this.seatError = null;
      const updatedTickets = [...this.normalizeEditedTickettypes()];
      const existingIndex = updatedTickets.findIndex(
        (item) =>
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) ===
          Number(ticket.trip_fare_id || ticket.id)
      );
      const existingTicket = existingIndex !== -1 ? updatedTickets[existingIndex] : {};
      const normalizedRecord = this.buildTicketTypeRecord(
        ticket,
        numericValue,
        existingTicket
      );

      if (numericValue > 0) {
        if (existingIndex !== -1) {
          updatedTickets[existingIndex] = normalizedRecord;
        } else {
          updatedTickets.push(normalizedRecord);
        }
      } else if (existingIndex !== -1) {
        updatedTickets.splice(existingIndex, 1);
      }

      this.currentlyEditing = ticket.trip_fare_id || ticket.id;
      this.quantityErrors = {
        ...this.quantityErrors,
        [ticket.trip_fare_id || ticket.id]: null,
      };
      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = updatedTickets;
      this.recalculateTicketTotals();
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    openExpressSale() {
      if (this.hasPermission('view_express_sales_web') && this.hasSelectedBranch) this.dialogExpressSale = true;
    } }
};
</script>
<style scoped>
.payment-method-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.selected-efectivo {
  border-color: #388e3c !important;
  background-color: rgba(56, 142, 60, 0.05) !important;
}

.selected-debito {
  border-color: #5e35b1 !important;
  background-color: rgba(94, 53, 177, 0.05) !important;
}

.selected-credito {
  border-color: #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.05) !important;
}

.payment-method-content {
  width: 100%;
  height: 100%;
  gap: 0;
}

.payment-method-label {
  width: 100%;
  font-size: 0.72rem;
  line-height: 1.05;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.payment-methods-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.ticket-total-preview {
  line-height: 1.1;
}

.ticket-price-pill {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.08);
  border: 1px solid rgba(25, 118, 210, 0.12);
  min-width: 140px;
}

.trip-sale-sheet {
  overflow: hidden;
}

.trip-sale-subtitle {
  opacity: 0.88;
  color: rgba(255, 255, 255, 0.92);
}

.trip-sale-panel {
  border-color: #d9e1ef;
  background: #ffffff;
  overflow: hidden;
}

.trip-sale-panel__header,
.trip-sale-panel__row {
  display: grid;
  grid-template-columns: 1.85fr 0.78fr 0.9fr 1fr 0.72fr 0.72fr;
  gap: 10px;
  align-items: center;
}

.trip-sale-panel__header {
  padding: 6px 14px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%);
  border-bottom: 1px solid #d9e1ef;
  font-weight: 700;
  font-size: 14px;
  color: #1f2a44;
}

.trip-sale-panel__row {
  padding: 6px 14px;
  border-bottom: 1px solid #e5eaf2;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.trip-sale-panel__row:last-child {
  border-bottom: none;
}

.trip-sale-panel__row:hover {
  border-color: rgba(25, 118, 210, 0.28);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.08);
  background: #fafcff;
}

.trip-sale-panel__row--selected {
  border-color: rgba(25, 118, 210, 0.42);
  background: rgba(25, 118, 210, 0.04);
}

.trip-sale-col {
  min-width: 0;
}

.trip-sale-col--route {
  min-width: 0;
}

.trip-sale-col--schedule,
.trip-sale-col--arrival,
.trip-sale-col--vehicle,
.trip-sale-col--price,
.trip-sale-col--actions {
  min-width: 0;
}

.trip-sale-col--price {
  max-width: 130px;
}

.trip-sale-col--actions {
  justify-self: end;
}

.trip-sale-summary {
  overflow: hidden;
  background: #fff;
}

.trip-sale-summary__header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.trip-sale-summary__body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 16px;
}

.trip-sale-summary__item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.trip-sale-summary__label {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  display: block;
}

.trip-sale-summary__value {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  min-width: 0;
  line-height: 1.2;
  display: block;
}

.trip-sale-row-meta {
  line-height: 1.1;
  margin-top: 1px;
}

.trip-sale-panel .v-chip {
  height: 28px;
}

@media (max-width: 960px) {
  .trip-sale-summary__body {
    grid-template-columns: 1fr;
  }
}

.v-icon {
  transition: all 0.3s ease;
}

.seat-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  margin: 6px;
  transition: all 0.2s ease;
}



.seat-number {
  position: absolute;

  top: 30%;
  left: 50%;

  transform: translate(-50%, -50%);

  min-width: 18px;

  text-align: center;

  font-size: 14px;
  font-weight: 900;

  color: #000;

  -webkit-text-stroke: 0.8px #fff;

  line-height: 1;

  font-variant-numeric: tabular-nums;

  pointer-events: none;
}


/* Indicador de pasillo */
.aisle-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* Colores para diferentes estados */






/* Efecto hover para asientos disponibles */
.seat-available:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

/* NÃºmeros mÃ¡s oscuros en asientos claros */
.seat-available .seat-number,
.seat-available .aisle-indicator,
.seat-aisle .aisle-indicator {
  color: #fefefe;
  font-weight: bold;
  padding-top: 8px;
  border: #fbfbfb;
}

/* NÃºmeros claros en asientos oscuros */
.seat-selected .seat-number,
.seat-reserved .seat-number {
  color: #ffffff;
  font-weight: bold;
  padding-top: 8px;
  border: #ffffff;
}

@media (max-width: 768px) {
  .payment-methods-grid {
    gap: 6px;
    justify-content: space-between;
  }



  .payment-method-label {
    font-size: 0.68rem;
  }

  .ticket-total-preview {
    font-size: 0.72rem;
  }

  .ticket-price-pill {
    min-width: 120px;
    padding: 6px 10px;
  }

  .seat-container {
    width: 40px;
    height: 40px;
    margin: 4px;
  }

  .seat-icon,
  .aisle-icon {
    font-size: 32px !important;
  }

  .seat-number,
  .aisle-indicator {
    font-size: 12px;
  }

  /* Ajuste fino para mÃ³viles */
  .seat-number {
    top: 28%;
    /* Puedes ajustar este valor segÃºn necesidad */
  }
}

.icono-concavo {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  /* Mantenemos solo el efecto cÃ³ncavo en el Ã­cono 
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



.ticket-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ticket-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ticket-filter {
  width: 260px;
  min-width: 260px;
}

.ticket-date-filter {
  width: 180px;
  min-width: 180px;
}

.ticket-search {
  width: 300px;
  min-width: 260px;
}

.ticket-col-code {
  width: 16%;
  min-width: 0;
}

.ticket-sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.ticket-sortable-header:hover {
  color: #0f172a;
}

.ticket-col-route {
  width: 28%;
  min-width: 0;
}

.ticket-col-date {
  width: 10%;
  min-width: 0;
}

.ticket-col-schedule {
  width: 10%;
  min-width: 0;
}

.ticket-col-method {
  width: 8%;
  min-width: 0;
}

.ticket-col-quantity {
  width: 6%;
  min-width: 0;
}

.ticket-col-seats {
  width: 10%;
  min-width: 0;
}

.ticket-col-price {
  width: 8%;
  min-width: 0;
}

.ticket-col-total {
  width: 8%;
  min-width: 0;
}

.ticket-col-actions {
  width: 10%;
  min-width: 0;
}

.ticket-row {
  min-height: 66px;
}

.ticket-code-cell {
  flex-direction: column;
  align-items: flex-start !important;
  justify-content: center;
  gap: 2px;
  text-align: left;
}

.ticket-code-value {
  display: block;
  max-width: 100%;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
  text-align: left;
}

.ticket-route-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ticket-route-main {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.ticket-route-code-chip {
  max-width: 100%;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.ticket-route-meta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  min-width: 0;
}

.ticket-method-chip {
  max-width: 100%;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticket-money {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-money-total {
  color: #15803d;
  font-weight: 800;
}

.ticket-sale-dialog {
  height: 100vh;
}

.ticket-sale-stepper {
  max-height: calc(100vh - 72px);
  overflow-y: auto;
}

.ticket-sale-step-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ticket-print-card {
  border-radius: 18px;
  overflow: hidden;
}

.ticket-print-header {
  position: relative;
}

.ticket-print-button {
  position: absolute;
  right: 16px;
  top: 16px;
}

.ticket-branch-logo-preview {
  width: 150px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.ticket-branch-logo-preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ticket-sale-mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ticket-sale-mode--express {
  background: #e0e7ff;
  color: #4338ca;
}

.ticket-sale-mode--normal {
  background: #dcfce7;
  color: #166534;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
  background: #f8fafc;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .ticket-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-filter,
  .ticket-date-filter,
  .ticket-search {
    width: 100%;
    min-width: 100%;
  }

  .ticket-col-route,
  .ticket-col-date,
  .ticket-col-schedule,
  .ticket-col-method,
  .ticket-col-quantity,
  .ticket-col-seats,
  .ticket-col-price,
  .ticket-col-total,
  .ticket-col-actions {
    width: 100%;
  }

  .ticket-route-meta {
    flex-wrap: wrap;
  }
}

.ticket-sale-dialog-pro {
  min-height: 100vh;
  background: #f8fafc;
}

.ticket-sale-topbar {
  min-height: 76px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ticket-sale-topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.ticket-sale-topbar__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-sale-topbar__title {
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
}

.ticket-sale-topbar__subtitle {
  font-size: 13px;
  opacity: 0.78;
  margin-top: 3px;
}

.ticket-sale-step-chip {
  background: rgba(255, 255, 255, 0.14) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

.ticket-sale-close {
  color: #ffffff !important;
}

.ticket-sale-body {
  padding: 20px 24px 24px !important;
}

.ticket-sale-stepper-pro {
  background: transparent !important;
  box-shadow: none !important;
}

.ticket-sale-layout {
  max-width: 1480px;
  margin: 0 auto;
}

.ticket-sale-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.ticket-sale-fill {
  height: 100%;
}

.ticket-sale-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ticket-sale-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.ticket-sale-section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.ticket-sale-mini-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef2ff;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.ticket-sale-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 7px;
}

.ticket-location-option {
  padding: 12px 14px !important;
}

.ticket-location-option__title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-location-option__subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-panel-pro {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.trip-sale-panel-pro__header {
  display: grid;
  grid-template-columns: 1.2fr 2.4fr 0.75fr 0.75fr 0.75fr 0.7fr 0.75fr 0.75fr;
  gap: 12px;
  padding: 13px 16px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.trip-sale-sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.trip-sale-sortable-header:hover {
  color: #0f172a;
}

.trip-sale-row-pro {
  display: grid;
  grid-template-columns: 1.2fr 2.4fr 0.75fr 0.75fr 0.75fr 0.7fr 0.75fr 0.75fr;
  gap: 12px;
  align-items: center;
  padding: 15px 16px;
  border-top: 1px solid #e5e7eb;
  cursor: pointer;
  transition: 0.18s ease;
}

.trip-sale-row-pro:hover {
  background: #f8fafc;
}

.trip-sale-row-pro--selected {
  background: #eef2ff;
  border-left: 4px solid #0f172a;
}

.trip-sale-route {
  min-width: 0;
}

.trip-sale-code {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-route__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.trip-sale-route__name {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-route-code-chip {
  max-width: 100%;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.trip-sale-route__meta,
.trip-sale-muted {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.trip-sale-strong {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}

.trip-sale-price {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
}

.ticket-sale-empty {
  padding: 38px 20px;
  text-align: center;
  color: #94a3b8;
}

.ticket-sale-empty__title {
  font-size: 15px;
  font-weight: 800;
  color: #475569;
  margin-top: 10px;
}

.ticket-sale-empty__text {
  font-size: 13px;
  margin-top: 3px;
}

.ticket-sale-footer-actions {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 16px 0 0;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 32%);
}

.ticket-sale-btn-secondary {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 13px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 130px;
}

.ticket-sale-btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 13px !important;
  text-transform: none !important;
  font-weight: 900 !important;
  min-width: 150px;
}

.ticket-sale-btn-primary.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
}

.ticket-sale-summary-pro {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.ticket-sale-summary-grid {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.ticket-sale-summary-grid div {
  min-width: 0;
  padding: 13px 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.ticket-sale-summary-grid span {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 4px;
}

.ticket-sale-summary-grid strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-list {
  max-height: 58vh;
  overflow-y: auto;
  padding-right: 4px;
}

.ticket-type-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 13px;
  margin-bottom: 10px;
  background: #ffffff;
}

.ticket-type-card__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.ticket-type-card__title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.ticket-type-card__price {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.ticket-type-card__input {
  max-width: 96px;
}

.ticket-type-card__total {
  margin-top: 10px;
  padding: 9px 11px;
  border-radius: 12px;
  background: #eef2ff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.seat-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.seat-container {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.16s ease;
}

.seat-container:hover {
  transform: translateY(-1px);
}

.seat-available {
  background: #e0f2fe;
  color: #0369a1;
}

.seat-selected {
  background: #dcfce7 !important;
  color: #15803d !important;
  box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.22);
}

.seat-reserved {
  background: #fee2e2 !important;
  color: #b91c1c !important;
  cursor: not-allowed;
  opacity: 0.8;
}

.seat-disabled {
  background: #e2e8f0 !important;
  color: #334155 !important;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat-aisle {
  background: transparent !important;
  color: #cbd5e1 !important;
  cursor: default;
}

.seat-number {
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: 12px;
  font-weight: 900;
}

.payment-methods-grid-pro {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.payment-method-card-pro {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: 0.16s ease;
}

.payment-method-card-pro:hover {
  transform: translateY(-1px);
}

.payment-method-content-pro {
  min-height: 72px;
  padding: 12px !important;
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-method-label {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}

.payment-method-disabled {
  opacity: 0.45;
  pointer-events: none;
}

.ticket-total-box {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #0f172a;
  color: #ffffff;
}

.ticket-total-box span {
  display: block;
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 4px;
}

.ticket-total-box strong {
  display: block;
  font-size: 20px;
  font-weight: 900;
}

@media (max-width: 960px) {
  .ticket-sale-summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .trip-sale-panel-pro__header {
    display: none;
  }

  .trip-sale-row-pro {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 16px;
  }

  .ticket-col-code,
  .ticket-col-route,
  .ticket-col-date,
  .ticket-col-schedule,
  .ticket-col-method,
  .ticket-col-quantity,
  .ticket-col-seats,
  .ticket-col-price,
  .ticket-col-total,
  .ticket-col-actions {
    width: 100%;
  }

  .ticket-route-title-row,
  .trip-sale-route__title-row {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .ticket-sale-topbar {
    padding: 14px 16px;
  }

  .ticket-sale-topbar__subtitle,
  .ticket-sale-step-chip {
    display: none;
  }

  .ticket-sale-body {
    padding: 14px !important;
  }

  .ticket-sale-section-card,
  .ticket-sale-summary-pro {
    border-radius: 18px;
    padding: 14px;
  }

  .ticket-sale-summary-grid {
    grid-template-columns: 1fr;
  }

  .ticket-sale-footer-actions {
    gap: 8px;
  }

  .ticket-sale-btn-secondary,
  .ticket-sale-btn-primary {
    flex: 1;
    min-width: 0;
  }
}

.seat-map-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.seat-map-scroll {
  width: 100%;
  max-height: 430px;
  overflow-y: auto;
  overflow-x: auto;
  padding: 6px;
}

.seat-map-preview {
  width: max-content;
  min-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

/* Identidad BusGo: mismas medidas, tipografía y acciones que Vehículos. */
.ticket-view { min-height:100%; color:#1e293b; background:#f6f8fb; }
.busgo-page-header { display:flex; align-items:center; gap:11px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; border-radius:0!important; }
.busgo-page-icon { flex:0 0 38px; width:38px!important; height:38px!important; color:#fff!important; background:linear-gradient(135deg,#0e1f46,#2454d6)!important; border-radius:10px!important; box-shadow:0 5px 12px #2454d62b; }
.busgo-page-title { color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }
.busgo-page-subtitle { margin-top:3px; color:#526176; font-size:12px; font-weight:650; }
.busgo-add-btn,.ticket-sale-btn-primary { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px #2454d633!important; }
.ticket-header-actions .busgo-add-btn:last-child:not(:first-child) { background:#eef3ff!important; color:#2454d6!important; box-shadow:none!important; border:1px solid #dce6ff; }
.busgo-container { padding:18px 24px 28px!important; }
.busgo-card { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px #0f172a0a!important; }
.busgo-card-header { display:flex; align-items:center; min-height:69px; padding:12px 17px; }
.busgo-card-title { color:#0f172a; font-size:15px; font-weight:850; }
.busgo-card-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.ticket-toolbar { padding:0 17px 13px!important; gap:9px; }
.ticket-toolbar :deep(.v-field) { border-radius:9px; color:#1e293b; font-size:12px; background:#fff; }
.ticket-toolbar :deep(.v-field__outline) { color:#dce3ed; }
.ticket-toolbar :deep(.v-field__input) { font-size:13px; font-weight:600; }
.ticket-toolbar :deep(.v-field__prepend-inner) { color:#64748b; opacity:1; }
.ticket-list-table { color:#1e293b; background:#fff; }
.ticket-list-table :deep(.v-table__wrapper > table) { min-width:1240px; }
.ticket-list-table :deep(thead) { display:table-header-group!important; }
.ticket-list-table :deep(th.ticket-header-shell) { padding:0!important; height:40px!important; border:0!important; }
.busgo-table-head,.ticket-row { display:grid!important; grid-template-columns:1.05fr 2.5fr 1fr .8fr 1fr .6fr 1fr .85fr .95fr 86px; align-items:center!important; gap:12px!important; min-width:1240px; margin:0!important; padding:10px 17px!important; border-radius:0!important; }
.busgo-table-head > div,.ticket-row > div { width:auto!important; min-width:0; }
.busgo-table-head { min-height:40px; color:#334155; font-size:11px; font-weight:850; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #e8edf5; }
.ticket-row { min-height:66px; background:#fff; border:0; border-bottom:1px solid #eef2f6; color:#1e293b; font-size:13px; font-weight:600; }
.ticket-row:hover { background:#f8faff; }
.ticket-list-table :deep(tbody td) { padding:0!important; border:0!important; }
.ticket-list-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }
.ticket-sortable-header:hover { color:#2454d6; }
.busgo-meta { display:flex; align-items:center; gap:6px; color:#334155; font-size:13px; }
.ticket-code-value,.ticket-route-main { color:#0f172a; font-size:13px; font-weight:800; }
.ticket-route-meta { display:grid; grid-template-columns:14px minmax(0,1fr); gap:3px 5px; align-items:center; margin-top:5px; color:#526176; font-size:12px; }
.ticket-route-meta :deep(.mx-2) { margin:0!important; }
.ticket-route-meta > span { white-space:normal; overflow-wrap:anywhere; }
.ticket-route-title-row { flex-wrap:wrap; gap:5px; }
.ticket-method-chip { display:inline-flex; padding:4px 7px; color:#475569; background:#f1f5f9; border-radius:7px; font-size:11.5px; font-weight:750; }
.ticket-money { color:#334155; font-size:13px; font-weight:700; font-variant-numeric:tabular-nums; }
.ticket-money-total { color:#183d9c; font-weight:850; }
.busgo-actions { display:flex; justify-content:flex-end; gap:2px; }
.ticket-action { border-radius:8px!important; }
.ticket-action--print { color:#2454d6!important; }
.ticket-action--print:hover { background:#eef3ff; }
.ticket-action--delete { color:#dc2626!important; }
.ticket-action--delete:hover { background:#fff1f2; }
.ticket-sale-dialog-pro { height:100dvh; min-height:0; display:flex; flex-direction:column; color:#1e293b; background:#f6f8fb; }
.ticket-sale-topbar { flex-shrink:0; min-height:72px; padding:11px 22px; background:linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6); }
.ticket-sale-topbar__icon { width:40px; height:40px; border-radius:10px; }
.ticket-sale-topbar__title { font-size:17px; font-weight:850; }
.ticket-sale-topbar__subtitle { color:#dbe7ff; font-size:12px; opacity:1; }
.ticket-sale-body { flex:1; min-height:0; overflow-y:auto; padding:0 22px 20px!important; }
.ticket-sale-stepper-pro :deep(.v-stepper-header) { position:sticky; top:0; z-index:4; min-height:64px; background:#f6f8fb; box-shadow:none; border-bottom:1px solid #e1e8f1; }
.ticket-sale-stepper-pro :deep(.v-stepper-item) { padding:14px 18px; }
.ticket-sale-stepper-pro :deep(.v-stepper-item__title) { font-size:13px; color:#475569; font-weight:750; }
.ticket-sale-stepper-pro :deep(.v-stepper-item--selected .v-stepper-item__avatar) { color:#fff; background:#2454d6; }
.ticket-sale-stepper-pro :deep(.v-stepper-window) { margin:18px 0 0; }
.ticket-sale-section-card,.ticket-sale-summary-pro { border:1px solid #e4eaf2; border-radius:13px; padding:18px; box-shadow:0 5px 18px #0f172a0a; }
.ticket-sale-section-header { margin-bottom:16px; }
.ticket-sale-section-title { color:#0f172a; font-size:15px; font-weight:850; }
.ticket-sale-section-subtitle { color:#526176; font-size:12px; line-height:1.5; }
.ticket-sale-mini-icon { width:36px; height:36px; border-radius:9px; background:#eef3ff; color:#2454d6; }
.ticket-sale-label { color:#475569; font-size:12px; font-weight:750; }
.ticket-sale-dialog-pro :deep(.v-field) { background:#fff; border-radius:9px!important; }
.ticket-sale-dialog-pro :deep(.v-field__outline) { color:#d6dee9; }
.ticket-sale-dialog-pro :deep(.v-field__input),.ticket-sale-dialog-pro :deep(.v-label) { color:#1e293b; font-size:14px; font-weight:600; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__prepend-inner .v-icon) { color:#64748b; opacity:1; }
:global(.busgo-full-location-menu .v-list) { padding:6px; border:1px solid #e2e8f0; border-radius:11px; background:#fff; }
:global(.busgo-full-location-menu .v-list-item) { margin:3px 0; padding:11px 12px!important; border-radius:8px; }
:global(.busgo-full-location-menu .v-list-item--active) { background:#eef3ff; color:#2454d6; }
.ticket-location-option__title { white-space:normal; overflow-wrap:anywhere; color:#1e293b; font-size:14px; line-height:1.45; }
.ticket-location-option__subtitle { white-space:normal; color:#526176; font-size:12px; line-height:1.5; }
.trip-sale-panel-pro { border:1px solid #e8edf5; border-radius:10px; overflow-x:auto; }
.trip-sale-panel-pro__header,.trip-sale-row-pro { display:grid!important; grid-template-columns:1fr 2.2fr .8fr .8fr 1fr .8fr 1fr 1fr; min-width:1000px; gap:12px; padding:12px 16px; }
.trip-sale-panel-pro__header { min-height:40px; align-items:center; color:#334155; background:#f8fafc; font-size:11px; font-weight:850; letter-spacing:.04em; }
.trip-sale-row-pro { min-height:66px; border:0; border-bottom:1px solid #eef2f6; }
.trip-sale-row-pro--selected { background:#eef3ff; box-shadow:inset 3px 0 #2454d6; }
.trip-sale-code,.trip-sale-route__name,.trip-sale-strong { font-size:13px; color:#1e293b; font-weight:750; }
.trip-sale-route__meta,.trip-sale-muted { color:#526176; font-size:12px; }
.trip-sale-price { color:#183d9c; font-size:13px; font-variant-numeric:tabular-nums; }
.ticket-sale-summary-grid { grid-template-columns:1.7fr 1fr 1fr 1fr; }
.ticket-sale-summary-grid > div { padding:12px; border-radius:9px; border-color:#e8edf5; }
.ticket-sale-summary-grid strong { white-space:normal; font-size:14px; }
.ticket-sale-summary-grid > div:last-child { background:#eef3ff; border-color:#dce6ff; }
.ticket-sale-summary-grid > div:last-child strong { color:#2454d6; }
.ticket-sale-footer-actions { padding:14px 0; margin-top:16px; background:#f6f8fb; border-top:1px solid #e1e8f1; }
.ticket-sale-btn-secondary { min-height:40px; background:#fff!important; border:1px solid #dce3ed; border-radius:9px!important; color:#475569!important; font-size:12.5px; }
.ticket-sale-btn-primary.v-btn--disabled { background:#dce3ed!important; color:#64748b!important; box-shadow:none!important; }
.ticket-type-card { padding:13px; margin-bottom:9px; border-radius:10px; border-color:#e4eaf2; }
.ticket-type-card__total { border-radius:7px; background:#eef3ff; color:#183d9c; }
.ticket-type-card__input { flex:0 0 85px; }
.payment-method-card-pro { border-radius:10px!important; box-shadow:none!important; }
.payment-method-content-pro { min-height:62px; gap:8px; padding:10px!important; }
.payment-method-label { font-size:12px; font-weight:750; }
.ticket-total-box { border-radius:11px; background:#183d9c; padding:14px; }
.ticket-total-box strong { font-size:18px; overflow-wrap:anywhere; }
.ticket-seat-legend { display:flex; flex-wrap:wrap; gap:7px 13px; margin-bottom:12px; color:#526176; font-size:11px; }
.ticket-seat-legend > span { display:flex; align-items:center; gap:5px; }
.ticket-seat-legend i { width:9px; height:9px; border-radius:3px; }
.legend-free { background:#c7d9f9; }.legend-selected { background:#2454d6; }.legend-reserved { background:#efacac; }.legend-disabled { background:#cbd5e1; }
.seat-map-shell { border-radius:11px; padding:12px; }
.seat-map-preview { min-width:0; padding:14px 12px; border:2px solid #d9e2ef; border-radius:36px 36px 18px 18px; background:#fff; }
.ticket-bus-front { display:flex; align-items:center; justify-content:space-between; gap:25px; align-self:stretch; margin:0 4px 15px; padding:6px 9px 12px; border-bottom:3px solid #dce6f5; color:#64748b; font-size:10px; font-weight:700; }
.seat-container { flex:0 0 42px; width:42px; height:44px; margin:3px; border-radius:7px; background:transparent; }
.seat-container:hover,.seat-available:hover { transform:none; box-shadow:none; }
.ticket-seat-shape { width:42px; height:44px; }
.seat-available { color:#426bb7; background:transparent; }
.seat-selected { color:#2454d6!important; background:#eef3ff!important; box-shadow:0 0 0 2px #2454d6; }
.seat-reserved { color:#b94c4c!important; background:#fff1f2!important; }
.seat-disabled { color:#64748b!important; background:#f1f5f9!important; }
.seat-number,.seat-available .seat-number,.seat-selected .seat-number,.seat-reserved .seat-number { position:absolute; top:18px; left:50%; right:auto; bottom:auto; transform:translate(-50%,-50%); padding:0; color:#1e293b; -webkit-text-stroke:0; font-size:12px; font-weight:850; line-height:1; pointer-events:none; }
.seat-selected .seat-number { color:#183d9c; }
.aisle-icon { visibility:hidden; }
.ticket-delete-dialog,.ticket-preview-dialog { color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; }
.ticket-confirm-heading { display:flex; align-items:center; gap:11px; padding:17px 20px; border-bottom:1px solid #e8edf5; }
.ticket-confirm-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:10px; color:#dc2626; background:#fff1f2; }
.ticket-confirm-icon--preview { color:#2454d6; background:#eef3ff; }
.ticket-confirm-heading strong { display:block; color:#0f172a; font-size:16px; font-weight:850; }
.ticket-confirm-heading span:not(.ticket-confirm-icon) { display:block; margin-top:4px; color:#64748b; font-size:11.5px; }
.ticket-delete-dialog :deep(.v-card-text) { color:#334155; font-size:14px; padding:22px!important; }
.busgo-dialog-actions { gap:9px; padding:14px 20px!important; }
.ticket-cancel-button { color:#475569!important; border-radius:9px!important; font-size:12.5px; font-weight:750; text-transform:none; }
.ticket-delete-button { color:#fff!important; background:#dc2626!important; border-radius:9px!important; min-height:40px; font-size:12.5px; font-weight:750; text-transform:none; }
.ticket-preview-dialog :deep(.v-card-text) { color:#334155; font-size:13px; }
.ticket-alert-content { display:flex; align-items:center; gap:10px; font-size:12px; }
.ticket-alert-content strong { display:block; margin-bottom:3px; font-size:13px; }
@media(max-width:959px) { .busgo-container { padding:15px 17px 24px!important; }.busgo-page-header { padding-inline:17px; }.ticket-sale-summary-grid { grid-template-columns:1fr 1fr; }.ticket-toolbar { align-items:stretch; }.ticket-sale-body { padding-inline:14px!important; } }
@media(max-width:600px) { .busgo-page-header { flex-wrap:wrap; padding:12px; }.ticket-header-actions { width:100%; justify-content:flex-start; gap:8px; }.busgo-container { padding:12px!important; }.ticket-sale-summary-grid { grid-template-columns:1fr; }.ticket-sale-section-card { padding:14px; }.ticket-sale-topbar { padding:11px 14px; }.ticket-sale-topbar__title { font-size:16px; }.seat-container { flex-basis:38px; width:38px; margin:2px; } }

.seat-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
  flex-wrap: nowrap;
}

@media (max-width: 600px) {
  .seat-map-scroll {
    max-height: 360px;
  }
}
/* Representación compartida con Estructura: frente a la izquierda. */
.seat-map-scroll { padding:16px!important; max-height:340px; overflow:auto; }
.ticket-structure-bus { position:relative; display:flex!important; flex-direction:row!important; align-items:center!important; gap:12px!important; width:max-content!important; min-width:500px!important; min-height:214px; padding:22px 42px 22px 30px!important; margin:auto; overflow:visible!important; background:linear-gradient(90deg,#2454d609,transparent 18%),#fff; border:2px solid #bfcbd9!important; border-radius:64px 25px 25px 64px!important; box-shadow:inset 0 0 0 6px #f4f7fa,inset -15px 0 0 #e2e8f073,0 12px 28px #0f172a1c; }
.ticket-structure-windshield { position:absolute; top:23px; bottom:23px; left:15px; width:24px; z-index:1; background:linear-gradient(180deg,#d9eff9,#b9d9e9); border:1px solid #9bbccd; border-radius:38px 8px 8px 38px; box-shadow:inset -4px 0 7px #33415517; pointer-events:none; }
.ticket-structure-wheel { position:absolute; width:31px; height:9px; background:#334155; border:2px solid #1e293b; border-radius:5px; box-shadow:inset 0 0 0 1px #64748b; pointer-events:none; }
.ticket-structure-wheel.front-top { top:-6px; left:60px; }.ticket-structure-wheel.front-bottom { bottom:-6px; left:60px; }.ticket-structure-wheel.rear-top { top:-6px; right:54px; }.ticket-structure-wheel.rear-bottom { bottom:-6px; right:54px; }
.ticket-structure-front { position:relative; z-index:2; display:flex; flex:0 0 62px; flex-direction:column; align-items:center; gap:5px; padding-left:8px; color:#2454d6; }
.ticket-structure-front > div { display:grid; place-items:center; width:35px; height:35px; color:#334155; background:#eef2f6; border:1px solid #cbd5e1; border-radius:50%; }
.ticket-structure-front > span { font-size:10px; font-weight:850; text-transform:uppercase; }
.ticket-structure-grid { display:flex; flex-direction:column; align-items:flex-start; gap:3px; }
.ticket-structure-grid .seat-row { display:flex!important; flex-wrap:nowrap!important; justify-content:flex-start!important; gap:6px!important; margin:0!important; }
.ticket-structure-grid .seat-container { position:relative; display:grid!important; place-items:center!important; flex:0 0 55px!important; width:55px!important; height:55px!important; margin:1px!important; background:transparent!important; border-radius:9px; transform:none!important; box-shadow:none; }
.ticket-structure-grid .ticket-structure-seat,.ticket-structure-grid .seat-container:hover .ticket-structure-seat { position:relative; z-index:1; width:46px!important; height:46px!important; font-size:46px!important; transform:scaleX(-1)!important; transition:filter .16s ease!important; }
.ticket-structure-grid .seat-available { color:#2454d6!important; }
.ticket-structure-grid .seat-selected { color:#16875a!important; background:#eaf8f1!important; box-shadow:0 0 0 2px #16875a!important; }
.ticket-structure-grid .seat-reserved { color:#bd5555!important; opacity:1!important; }
.ticket-structure-grid .seat-disabled { color:#94a3b8!important; opacity:1!important; }
.ticket-structure-grid .seat-number { position:absolute!important; z-index:3!important; top:50%!important; left:50%!important; right:auto!important; bottom:auto!important; display:grid!important; place-items:center; min-width:21px; height:19px; padding:0 4px!important; color:#17377f!important; background:#fff!important; border:1px solid #2454d638; border-radius:6px; font-size:11px!important; font-weight:900!important; line-height:1!important; transform:translate(-50%,-50%)!important; -webkit-text-stroke:0!important; }
.ticket-structure-grid .seat-selected .seat-number { color:#116b49!important; border-color:#16875a66; }
.ticket-structure-grid .seat-aisle { color:#94a3b8!important; cursor:default; background:repeating-linear-gradient(135deg,#f8fafc,#f8fafc 5px,#eef2f6 5px,#eef2f6 10px)!important; border:1px dashed #cbd5e1; }
.ticket-structure-grid .seat-aisle .aisle-indicator::after { content:'P'; color:#64748b; font-size:10px; font-weight:850; }
.ticket-seat-legend .legend-free { background:#2454d6; }.ticket-seat-legend .legend-selected { background:#16875a; }

/* Compact launcher aligned with TicketView dimensions. */
.sales-view { background:#f6f8fb; color:#1e293b; min-height:100%; }
.sales-workspace { width:100%; padding:18px 24px 28px; }
.sales-context-panel { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:16px 18px; background:#fff; border:1px solid #e4eaf2; border-radius:12px; }
.sales-context-copy h2 { color:#0f172a; font-size:15px; font-weight:750; line-height:1.3; }
.sales-context-copy p { color:#526176; font-size:12px; line-height:1.5; margin-top:4px; }
.sales-branch-control { width:280px; flex:0 0 280px; }
.sales-field-label { display:block; color:#475569; font-size:11px; font-weight:700; margin-bottom:5px; }
.sales-branch-control :deep(.v-field) { border-radius:8px; color:#233654; background:#fff; font-size:13px; }
.sales-branch-control :deep(.v-field__outline) { color:#ccd5e2; opacity:1; }
.sales-assigned-branch { display:flex; align-items:center; gap:10px; padding:9px 12px; border:1px solid #e5eaf2; border-radius:8px; background:#f8faff; }
.sales-branch-icon { color:#2454d6; }
.sales-assigned-branch span:not(.sales-branch-icon) { display:block; font-size:11px; color:#64748b; }
.sales-assigned-branch strong { display:block; margin-top:2px; font-size:12px; font-weight:650; }
.sales-modes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin-top:16px; max-width:1000px; }
.sales-mode-card { min-width:0; display:flex; flex-direction:column; padding:18px; border-radius:12px; border:1px solid #e0e6ef; background:#fff; color:#162641; box-shadow:0 3px 12px #15264b05; }
.sales-mode-card--full { border-top:3px solid #173b8f; }
.sales-mode-card--express { border-top:3px solid #2454d6; }
.sales-mode-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.sales-mode-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:9px; flex-shrink:0; background:#eef3ff; color:#2454d6; }
.sales-mode-icon :deep(.v-icon) { font-size:23px!important; }
.sales-mode-tag { padding:4px 7px; border-radius:6px; font-size:10px; line-height:1.4; font-weight:650; color:#526784; background:#f3f6fb; }
.sales-mode-copy { margin-top:12px; }
.sales-mode-copy h3 { font-size:17px; font-weight:750; line-height:1.25; letter-spacing:-.2px; }
.sales-mode-copy p { margin-top:5px; font-size:12px; line-height:1.5; color:#526176; }
.sales-mode-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-top:16px; padding-top:12px; border-top:1px solid #e8edf5; }
.sales-mode-note { display:flex; align-items:center; gap:5px; color:#64748b; font-size:10px; }
.sales-launch-button.v-btn { min-height:38px; border-radius:8px; font-size:12px; font-weight:750; letter-spacing:0; text-transform:none; box-shadow:none; }
.sales-launch-button--full.v-btn { background:#173b8f; color:#fff; }
.sales-launch-button--express.v-btn { background:#eef3ff; color:#2454d6; }
.sales-launch-button:focus-visible { outline:3px solid #6e9bff; outline-offset:3px; }
.sales-workspace-footnote { display:flex; align-items:center; gap:7px; margin-top:16px; color:#64748b; font-size:11px; line-height:1.5; }
/* Full dialog: explicit background, type and controls independent of the page. */
.busgo-full-sale-form { height:100%; min-height:0; }
.busgo-full-sale.ticket-sale-dialog-pro { height:100vh; height:100dvh; width:100%; border-radius:0; background:#f4f6fa; color:#182942; font-family:inherit; }
.busgo-full-sale .ticket-sale-topbar { min-height:78px; padding:15px 26px; background:#142b55; color:#fff; border-bottom:1px solid #2b4269; }
.busgo-full-sale .ticket-sale-topbar__icon { width:44px; height:44px; border-radius:12px; background:#294777; color:#fff; }
.busgo-full-sale .ticket-sale-topbar__title { font-size:21px; font-weight:750; letter-spacing:-.35px; color:#fff; }
.busgo-full-sale .ticket-sale-topbar__subtitle { font-size:13px; line-height:1.5; color:#c7d5ed; }
.busgo-full-sale .ticket-sale-step-chip { background:#294777; color:#e6edff; font-size:12px; }
.busgo-full-sale .ticket-sale-close { background:#294777; color:#fff; border-radius:10px; flex-shrink:0; }
.busgo-full-sale .ticket-sale-body { background:#f4f6fa; padding:0 26px 22px!important; }
.busgo-full-sale .ticket-sale-stepper-pro { background:transparent!important; border-radius:0; box-shadow:none!important; }
.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-header) { background:#f4f6fa; min-height:76px; border-bottom:1px solid #dfe6f0; box-shadow:none; }
.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-item__title) { color:#465772; font-size:14px; font-weight:650; }
.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-item--selected .v-stepper-item__title) { color:#173c84; }
.busgo-full-sale .ticket-sale-section-card,.busgo-full-sale .ticket-sale-summary-pro { background:#fff; border:1px solid #dfe6f0; border-radius:15px; padding:22px; box-shadow:0 4px 16px #172a4806; }
.busgo-full-sale .ticket-sale-section-title { color:#162641; font-size:17px; font-weight:750; white-space:normal; letter-spacing:-.25px; }
.busgo-full-sale .ticket-sale-section-subtitle { color:#61718a; font-size:13px; line-height:1.6; margin-top:4px; }
.busgo-full-sale .ticket-sale-label { display:block; color:#344761; font-size:13px; font-weight:650; margin-bottom:8px; }
.busgo-full-sale :deep(.v-field) { background:#fbfcfe; color:#1e3351; border-radius:10px!important; }
.busgo-full-sale :deep(.v-field__outline) { color:#becadb; opacity:1; }
.busgo-full-sale :deep(.v-field--focused .v-field__outline) { color:#2454d6; }
.busgo-full-sale :deep(.v-field__input),.busgo-full-sale :deep(.v-label) { color:#233654; font-size:14px; font-weight:550; opacity:1; }
.busgo-full-sale :deep(.v-field__input::placeholder) { color:#66768c; opacity:1; }
.busgo-full-sale .trip-sale-panel-pro__header { background:#f1f5fb; color:#445773; font-size:12px; text-transform:none; letter-spacing:0; min-height:46px; }
.busgo-full-sale .trip-sale-row-pro { background:#fff; min-height:76px; }
.busgo-full-sale .trip-sale-row-pro:hover { background:#f7faff; }
.busgo-full-sale .trip-sale-row-pro--selected { background:#edf3ff; box-shadow:inset 3px 0 #2454d6; }
.busgo-full-sale .trip-sale-code,.busgo-full-sale .trip-sale-route__name,.busgo-full-sale .trip-sale-strong { font-size:14px; color:#233654; }
.busgo-full-sale .ticket-sale-footer-actions { background:#f4f6fa; padding:16px 0; gap:12px; }
.busgo-full-sale .ticket-sale-btn-primary { background:#2454d6!important; color:#fff!important; min-height:44px; border-radius:10px!important; box-shadow:none!important; font-size:14px; font-weight:700!important; }
.busgo-full-sale .ticket-sale-btn-primary.v-btn--disabled { background:#dce3ed!important; color:#61718a!important; }
.busgo-full-sale .ticket-sale-btn-secondary { background:#fff!important; color:#334761!important; min-height:44px; border:1px solid #cfd8e6; border-radius:10px!important; font-size:14px; }
.busgo-full-sale .ticket-type-card__title { color:#233654; font-size:14px; }
.busgo-full-sale .ticket-seat-legend { font-size:12px; gap:9px 15px; }
.busgo-full-sale .ticket-total-box { background:#142b55; color:#fff; border-radius:12px; }
.busgo-full-sale .payment-method-label { font-size:13px; }
@media (max-width:767px) {
  .busgo-full-sale .ticket-sale-topbar { padding:13px 16px; gap:10px; flex-wrap:wrap; }.busgo-full-sale .ticket-sale-topbar__left { flex:1; }.busgo-full-sale .ticket-sale-topbar__subtitle { font-size:12px; }.busgo-full-sale .ticket-sale-topbar__title { font-size:19px; }.busgo-full-sale .ticket-sale-step-chip { display:none; }.busgo-full-sale .ticket-sale-body { padding:0 12px 16px!important; }.busgo-full-sale .ticket-sale-section-card,.busgo-full-sale .ticket-sale-summary-pro { padding:16px; }.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-item) { padding:16px 10px; }.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-item__title) { font-size:12px; }
}
@media(max-width:959px) {
  .sales-workspace { padding:15px 17px 24px; }
  .sales-mode-footer { align-items:stretch; }
  .sales-launch-button.v-btn { width:100%; }
}
@media(max-width:600px) {
  .sales-workspace { padding:12px; }
  .sales-context-panel { flex-direction:column; align-items:stretch; gap:12px; padding:14px; }
  .sales-branch-control { width:100%; flex-basis:auto; }
  .sales-modes { grid-template-columns:1fr; gap:12px; margin-top:12px; }
  .sales-mode-card { padding:14px; }
  .sales-workspace-footnote { align-items:flex-start; }
}


/* Shared compact dimensions for Full and Express headers. */
.busgo-full-sale .ticket-sale-topbar { min-height:70px; padding:12px 24px; gap:12px; flex-wrap:nowrap; background:#142b55; }
.busgo-full-sale .ticket-sale-topbar__left { gap:11px; }
.busgo-full-sale .ticket-sale-topbar__icon { flex:0 0 38px; width:38px; height:38px; border-radius:10px; }
.busgo-full-sale .ticket-sale-topbar__icon :deep(.v-icon) { font-size:23px!important; }
.busgo-full-sale .ticket-sale-topbar__title { font-size:19px; font-weight:800; line-height:1.2; letter-spacing:normal; }
.busgo-full-sale .ticket-sale-topbar__subtitle { font-size:12px; line-height:1.4; margin-top:4px; }
.busgo-full-sale .ticket-sale-step-chip { display:inline-flex; font-size:11px; font-weight:650; }
.busgo-full-sale .ticket-sale-close { border-radius:9px; }
.busgo-full-sale .ticket-sale-section-card,.busgo-full-sale .ticket-sale-summary-pro { padding:18px; border-radius:12px; }
.busgo-full-sale .ticket-sale-section-header { gap:12px; margin-bottom:16px; }
.busgo-full-sale .ticket-sale-section-title { font-size:15px; font-weight:800; line-height:1.4; letter-spacing:normal; }
.busgo-full-sale .ticket-sale-section-subtitle { font-size:12px; line-height:1.5; margin-top:3px; }
.busgo-full-sale .ticket-sale-label { font-size:12px; margin-bottom:6px; }
.busgo-full-sale .trip-sale-panel-pro__header { min-height:42px; font-size:11px; font-weight:800; }
.busgo-full-sale .ticket-sale-stepper-pro :deep(.v-stepper-header) { min-height:64px; }
.sales-mode-card--express { border-top-color:#16845b; }
.sales-mode-card--express .sales-mode-icon { color:#16845b; background:#edf8f2; }
.sales-mode-card--express .sales-mode-tag { color:#116546; background:#edf8f2; }
.sales-launch-button--express.v-btn { color:#116546; background:#edf8f2; }
.sales-launch-button--express:focus-visible { outline-color:#78c9a2; }
@media(max-width:959px) { .busgo-full-sale .ticket-sale-topbar { padding-inline:17px; } }
@media(max-width:600px) {
  .busgo-full-sale .ticket-sale-topbar { padding:12px; gap:9px; }
  .busgo-full-sale .ticket-sale-topbar__left { flex:1; gap:9px; }
  .busgo-full-sale .ticket-sale-topbar__title { font-size:17px; }
  .busgo-full-sale .ticket-sale-topbar__subtitle { font-size:11px; }
  .busgo-full-sale .ticket-sale-step-chip { display:none; }
  .busgo-full-sale .ticket-sale-section-card,.busgo-full-sale .ticket-sale-summary-pro { padding:14px; }
}
</style>
