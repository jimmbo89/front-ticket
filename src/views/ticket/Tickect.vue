<template>
  <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
    :multi-line="true" vertical v-model="snackbar">
    <v-row>
      <v-col md="2">
        <v-avatar :icon="sb_icon" color="sb_type" size="40" />
      </v-col>

      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-icon>mdi-ticket</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Tickets</div>
      <div class="busgo-page-subtitle">Gestionar tickets vendidos</div>
    </div>

    <v-spacer />

    <div class="ticket-header-actions">
      <v-btn v-if="hasPermission('view_traditional_sales_web')" :color="paleteColors.primary" variant="flat" elevation="0" prepend-icon="mdi-plus" class="busgo-add-btn"
        @click="showAdd()">
        Venta Full
      </v-btn>

      <v-btn v-if="hasPermission('view_express_sales_web')" :color="paleteColors.primary" variant="tonal" elevation="0" prepend-icon="mdi-lightning-bolt-outline"
        class="busgo-add-btn mr-1" @click="dialogExpressSale = true">
        Venta Express
      </v-btn>
    </div>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">
            Listado de tickets vendidos
          </div>

          <div class="busgo-card-subtitle">
            Consulta ventas, rutas, asientos, métodos de pago y reimpresiones.
          </div>
        </div>
      </div>

      <div class="ticket-toolbar px-6 pb-4">
        <v-autocomplete v-if="mostrarFila" :no-data-text="'No hay datos disponibles'" v-model="branch_id"
          :items="branches" placeholder="Seleccione una sucursal" prepend-inner-icon="mdi-store" item-title="name"
          item-value="id" variant="outlined" hide-details single-line density="compact" class="ticket-filter"
          :rules="selectRules" @update:modelValue="initialize">
          <template #item="{ props, item }">
            <v-list-item v-bind="props"
              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${getTableRowItem(item).image}`" />
          </template>
        </v-autocomplete>

        <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
          min-width="290px">
          <template #activator="{ props }">
            <v-text-field v-bind="props" :modelValue="dateFormattedSearch" prepend-inner-icon="mdi-calendar"
              placeholder="Fecha" density="compact" variant="outlined" hide-details single-line
              class="ticket-date-filter" />
          </template>

          <v-locale-provider locale="es">
            <v-date-picker header="Calendario" title="Seleccione la fecha" :color="paleteColors.primary"
              :modelValue="input2" @update:model-value="updateDateSearch" format="yyyy-MM-dd"
              :min="new Date().toISOString().split('T')[0]" />
          </v-locale-provider>
        </v-menu>

        <v-spacer />

        <v-text-field v-model="search" density="compact" placeholder="Buscar ticket..." prepend-inner-icon="mdi-magnify"
          variant="outlined" hide-details single-line class="ticket-search" />
      </div>

      <v-data-table :headers="headers" :items="sortedTickets" :search="search"
        :items-per-page-text="'Elementos por página'" no-data-text="No hay datos disponibles" :loading="loading"
        loading-text="Cargando datos..." :hide-default-header="true" class="busgo-table">
        <template #top>
          <div class="busgo-table-head">
            <div class="ticket-col-code ticket-sortable-header" @click="toggleTicketSort('code')">
              <span>Código</span>
              <v-icon size="14">{{ ticketSortIcon('code') }}</v-icon>
            </div>
            <div class="ticket-col-route ticket-sortable-header" @click="toggleTicketSort('tripName')">
              <span>Tramos</span>
              <v-icon size="14">{{ ticketSortIcon('tripName') }}</v-icon>
            </div>
            <div class="ticket-col-date ticket-sortable-header" @click="toggleTicketSort('date')">
              <span>Fecha</span>
              <v-icon size="14">{{ ticketSortIcon('date') }}</v-icon>
            </div>
            <div class="ticket-col-schedule ticket-sortable-header" @click="toggleTicketSort('schedule')">
              <span>Horario</span>
              <v-icon size="14">{{ ticketSortIcon('schedule') }}</v-icon>
            </div>
            <div class="ticket-col-method ticket-sortable-header" @click="toggleTicketSort('method')">
              <span>Método</span>
              <v-icon size="14">{{ ticketSortIcon('method') }}</v-icon>
            </div>
            <div class="ticket-col-quantity ticket-sortable-header" @click="toggleTicketSort('quantity')">
              <span>Pasajes</span>
              <v-icon size="14">{{ ticketSortIcon('quantity') }}</v-icon>
            </div>
            <div class="ticket-col-seats ticket-sortable-header" @click="toggleTicketSort('seats')">
              <span>Asientos</span>
              <v-icon size="14">{{ ticketSortIcon('seats') }}</v-icon>
            </div>
            <div class="ticket-col-price ticket-sortable-header" @click="toggleTicketSort('price')">
              <span>Precio</span>
              <v-icon size="14">{{ ticketSortIcon('price') }}</v-icon>
            </div>
            <div class="ticket-col-total ticket-sortable-header" @click="toggleTicketSort('total')">
              <span>Total</span>
              <v-icon size="14">{{ ticketSortIcon('total') }}</v-icon>
            </div>
            <div class="ticket-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row ticket-row">
                <div class="ticket-col-code busgo-meta ticket-code-cell">
                  <span class="ticket-code-value text-truncate">
                    {{ slotProps.item.code || "-" }}
                  </span>
                </div>

                <div class="ticket-col-route">
                  <div class="ticket-route-title-row">
                    <div class="ticket-route-main text-truncate">
                      {{ slotProps.item.routeCode || "-" }}
                    </div>

                    <v-chip v-if="getTicketFareSegment(slotProps.item)" size="x-small" :color="paleteColors.primary"
                      variant="tonal" class="flex-shrink-0">
                      Tramo
                    </v-chip>

                    <v-chip
                      size="x-small"
                      :color="getSaleModeColor(slotProps.item)"
                      variant="tonal"
                      class="flex-shrink-0"
                    >
                      {{ getSaleModeLabel(slotProps.item) }}
                    </v-chip>
                  </div>

                  <div class="ticket-route-meta">
                    <v-icon size="14" class="mr-0">mdi-map-marker</v-icon>

                    <span class="text-truncate">
                      Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}
                    </span>

                    <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>

                    <span class="text-truncate">
                      Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="420px">
                    <span style="white-space: normal; word-break: break-word">
                      Código viaje: {{ slotProps.item.code || "-" }}<br />
                      Código ruta: {{ slotProps.item.routeCode || "-" }}<br />
                      Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}<br />
                      Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="ticket-col-date busgo-meta">
                  <v-icon size="16" color="primary">mdi-calendar</v-icon>
                  <span class="text-truncate">{{ slotProps.item.date }}</span>
                </div>

                <div class="ticket-col-schedule busgo-meta">
                  <v-icon size="16" color="primary">mdi-clock-outline</v-icon>
                  <span class="text-truncate">{{ slotProps.item.schedule }}</span>
                </div>

                <div class="ticket-col-method busgo-meta">
                  <span class="ticket-method-chip">
                    {{ slotProps.item.method }}
                  </span>
                </div>

                <div class="ticket-col-quantity busgo-meta">
                  <span>{{ slotProps.item.quantity }}</span>
                </div>

                <div class="ticket-col-seats busgo-meta">
                  <v-icon size="16" color="primary">mdi-seat</v-icon>
                  <span class="text-truncate">{{ slotProps.item.seats }}</span>
                </div>

                <div class="ticket-col-price ticket-money">
                  ${{ formatNumber(Number(slotProps.item.price)) }}
                </div>

                <div class="ticket-col-total ticket-money ticket-money-total">
                  ${{ formatNumber(Number(slotProps.item.total)) }}
                </div>

                <div class="ticket-col-actions busgo-actions">
                  <v-btn size="30" icon variant="tonal" :color="paleteColors.green" @click="printerItem(slotProps.item)"
                    title="Reimprimir Ticket">
                    <v-icon size="17">mdi-printer</v-icon>
                  </v-btn>

                  <v-btn size="30" icon variant="tonal" :color="paleteColors.error" @click="deleteItem(slotProps.item)"
                    title="Eliminar Ticket">
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
  <ExpressTicketSale
    v-model="dialogExpressSale"
    :branches="branches"
    :branch-id="branch_id"
    :mostrar-fila="mostrarFila"
    @alert="showAlert"
    @saved="handleExpressSaleSaved"
  />

  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="ticket-sale-dialog-pro">

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

          <v-btn icon="mdi-close" variant="text" size="small" class="ticket-sale-close" @click="close" />
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
                        :menu-props="{ maxHeight: 360, maxWidth: 520 }">
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
                      <v-autocomplete v-model="selectedDestinationLocationId" :items="destinationLocationOptions"
                        placeholder="Seleccione el destino" prepend-inner-icon="mdi-map-marker-check-outline"
                        item-title="address" item-value="id" variant="outlined" density="comfortable" rounded="lg"
                        clearable hide-details="auto" :no-data-text="'No hay ubicaciones disponibles'"
                        @update:model-value="handleLocationSelectionChange"
                        :menu-props="{ maxHeight: 360, maxWidth: 520 }">
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
                  <v-col cols="12" md="4">
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

                  <v-col cols="12" md="6">
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

                      <div class="seat-map-shell">
                        <div class="seat-map-scroll">
                          <div class="seat-map-preview">
                            <div v-for="(row, rowIndex) in seatMap" :key="rowIndex" class="seat-row">
                              <template v-for="(seat, seatIndex) in row" :key="seatIndex">
                                <div v-if="seat.type" :class="[
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
                                ]" @click="toggleSeat(seat)">
                                  <v-icon v-if="seat.type === 'seat'" class="seat-icon" size="44">
                                    mdi-seat
                                  </v-icon>

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
                      <v-alert v-if="selectedSeats.length != editedItem.quantity" type="error" variant="tonal"
                        density="compact" class="mt-4">
                        Debe seleccionar {{ editedItem.quantity }} asiento(s).
                      </v-alert>
                    </div>
                  </v-col>

                  <v-col cols="12" md="2">
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

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card class="busgo-dialog-card">
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar un Ticket
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el ticket seleccionado?
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">
          Cancelar
        </v-btn>

        <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm" :loading="loading">
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showTicketDialog" max-width="500" persistent>
    <v-card class="ticket-print-card">
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
</template>

<script>
import ExpressTicketSale from "@/views/ticket/ExpressTicketSale.vue";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import _ from "lodash";
import { paleteColors } from "@/assets/colors";
import QRCode from "qrcode";
export default {
  components: {
    ExpressTicketSale,
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
    mostrarFila: false,
    permissions: "",
    dialog: false,
    dialogExpressSale: false,
    dialogDelete: false,
    branch_id: "",
    seatError: null,
    currentlyEditing: null,
    locations: [],
    trips: [],
    selectedOriginLocationId: null,
    selectedDestinationLocationId: null,
    tripSearchLoading: false,
    tripSearchText: "",
    routes: [],
    vehicles: [],
    workers: [],
    tickets: [],
    promotions: [],
    tickettypes: [],
    currentTicket: {},
    nameBranch: "",
    imageBranch: "",
    nameUser: "",
    selectedBranch: {},
    data: {},
    hasStartedSelecting: false,
    seats: 0, // Ejemplo de asientos disponibles
    selectedSeats: [], // AquÃ­ se almacenan los asientos seleccionados
    reservedSeats: [],
    availableSeats: [],
    availableSeatNumbers: [],
    aviable: "",
    branches: [],
    showSeatsMenu: false,
    showTicketDialog: false,
    step: 1,
    items: ["Trayecto", "Venta"],
    tripSearchHeaders: [
      { title: "Ruta", key: "routeCode" },
      { title: "Salida", key: "schedule" },
      { title: "Llegada", key: "arrival" },
      { title: "Vehículo", key: "plate" },
      { title: "Precio", key: "price" },
      { title: "Acciones", key: "actions", sortable: false, width: "120px" },
    ],
    headers: [
      { title: "Código", key: "code" },
      { title: "Ruta", key: "routeCode" },
      { title: "Origen", key: "tripOrigin" },
      { title: "Destino", key: "tripDestination" },
      { title: "Fecha", key: "date" },
      { title: "Horario", key: "schedule" },
      { title: "Metodo", key: "method" },
      { title: "Pasajes", key: "quantity" },
      //{ title: "Adultos", key: "adults", },
      //{ title: "Menores", key: "minors", },
      { title: "Asientos", key: "seats" },
      { title: "Precio", key: "price" },
      { title: "Total", key: "total" },
      { title: "Acciones", key: "actions", sortable: false, width: "15%" },
    ],

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
    search: "",
    menu: false,
    menu2: false,
    input: null,
    input2: null,
    tab: null,
    route: "",
    seatMap: [],
    appliedPromotions: [],
    selectedPromotionAdults: null,
    selectedPromotionMinors: null,
    selectedPromotion: null,
    showPromotion: false,
    showPromotionAdults: false,
    showPromotionMinors: false,
    normal: "",
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos de 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    //prueba borrar
    fareSegmentRules: [(v) => !!v || "Seleccione un tramo"],
    currentPage: 1, // Página actual
    itemsPerPage: 6, // Elementos por página
    quantityErrors: {},
    isRecalculatingTickettypes: false,
    ticketSortBy: "date",
    ticketSortOrder: "desc",
    tripSaleSortBy: "schedule",
    tripSaleSortOrder: "asc",
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Venta de Ticket" : "Editar Ticket";
    },
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
    dateFormatted() {
      const date = this.input ? new Date(this.input) : new Date();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    getDate() {
      return this.input ? new Date(this.input) : new Date();
    },
    dateFormattedSearch() {
      const date = this.input2 ? new Date(this.input2) : new Date();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    getDateSearch() {
      return this.input2 ? new Date(this.input2) : new Date();
    },
    evenSeats() {
      return this.availableSeats.filter((seat, index) => index % 2 === 0);
    },
    oddSeat() {
      return this.availableSeats.length % 2 !== 0
        ? this.availableSeats[this.availableSeats.length - 1]
        : null;
    },
    quantityAndPassengerRules() {
      return [
        () => {
          // Calcular la cantidad actual sumando todos los tickets
          const currentQuantity =
            this.editedItem.tickettypes?.reduce(
              (sum, t) => sum + (Number(t.cant ?? t.quantity) || 0),
              0
            ) || 0;
          const availableSeats = this.availableSeats.length;

          // ValidaciÃ³n 1: Debe haber al menos un pasaje
          if (currentQuantity <= 0) {
            return "Debe haber al menos un pasaje seleccionado.";
          }

          // ValidaciÃ³n 2: La suma total no puede superar los asientos disponibles
          if (currentQuantity > availableSeats) {
            return `La cantidad total de pasajes (${currentQuantity}) no puede ser mayor a los asientos disponibles (${availableSeats}).`;
          }

          return true;
        },
      ];
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
    tripHasStarted() {
      return this.isTripStarted(this.selectedTripRecord);
    },
    fareSegmentOptions() {
      const trip = this.selectedTripRecord;
      if (!trip) {
        return [];
      }

      return this.getFareSegmentOptions(trip);
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
    sortedTickets() {
      return this.sortRows(this.tickets, this.ticketSortBy, this.ticketSortOrder, (row, field) =>
        this.getTicketSortValue(row, field)
      );
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
  },
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
      this.initialize();
    }
  },
  methods: {
    getLocalStorageValue(key) {
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
      // Si es un string, lo convertimos a array
      const perms = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Retorna true si al menos uno coincide
      return perms.some((p) => this.permissions.includes(p));
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del dÃ­a actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al dÃ­a)
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
    ticketSortIcon(field) {
      if (this.ticketSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.ticketSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    tripSaleSortIcon(field) {
      if (this.tripSaleSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.tripSaleSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    toggleTicketSort(field) {
      if (this.ticketSortBy === field) {
        this.ticketSortOrder = this.ticketSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.ticketSortBy = field;
      this.ticketSortOrder = "asc";
    },
    toggleTripSaleSort(field) {
      if (this.tripSaleSortBy === field) {
        this.tripSaleSortOrder = this.tripSaleSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.tripSaleSortBy = field;
      this.tripSaleSortOrder = "asc";
    },
    getTicketSortValue(row, field) {
      switch (field) {
        case "code":
          return row?.code ?? "";
        case "tripName":
          return row?.tripName ?? "";
        case "date":
          return row?.date ?? "";
        case "schedule":
          return row?.schedule ?? "";
        case "method":
          return row?.method ?? "";
        case "quantity":
          return Number(row?.quantity ?? 0);
        case "seats":
          return Number(row?.seats ?? 0);
        case "price":
          return Number(row?.price ?? 0);
        case "total":
          return Number(row?.total ?? 0);
        default:
          return row?.[field] ?? "";
      }
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
    getTicketFareSegment(ticket) {
      const directSegment =
        ticket?.fareSegment ?? ticket?.fare_segment ?? ticket?.fareSegmentData ?? null;
      if (directSegment) {
        return directSegment;
      }

      const ticketItems = Array.isArray(ticket?.ticketItems) ? ticket.ticketItems : [];
      const firstItem = ticketItems[0] || null;
      const tripFare = firstItem?.tripFare || null;

      return (
        tripFare?.fareSegment ??
        tripFare?.fareSegmentTicketType?.fareSegment ??
        tripFare?.fare_segment?.fareSegment ??
        tripFare?.fareSegmentData ??
        null
      );
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
    getTicketRouteOriginLabel(ticket) {
      const fareSegment = this.getTicketFareSegment(ticket);
      if (fareSegment) {
        return this.getFareSegmentRouteStopLabel(
          fareSegment.originRouteStop ??
          fareSegment.origin_route_stop ??
          fareSegment.originStop ??
          fareSegment.origin
        );
      }

      return ticket?.tripOrigin ?? ticket?.origin ?? "No especificado";
    },
    getTicketRouteDestinationLabel(ticket) {
      const fareSegment = this.getTicketFareSegment(ticket);
      if (fareSegment) {
        return this.getFareSegmentRouteStopLabel(
          fareSegment.destinationRouteStop ??
          fareSegment.destination_route_stop ??
          fareSegment.destinationStop ??
          fareSegment.destination
        );
      }

      return ticket?.tripDestination ?? ticket?.destination ?? "No especificado";
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
    normalizeLocationText(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    },
    getLocationSubtitle(location) {
      if (!location) {
        return "";
      }

      return [location.city, location.country].filter(Boolean).join(" · ") || "Ubicación";
    },
    findLocationIdByText(value) {
      const normalizedValue = this.normalizeLocationText(value);
      if (!normalizedValue) {
        return null;
      }

      const match = (this.locations || []).find((location) => {
        const candidates = [
          location.address,
          location.name,
          location.city,
          location.country,
        ];
        return candidates.some(
          (candidate) => this.normalizeLocationText(candidate) === normalizedValue
        );
      });

      return match?.id ?? null;
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
    isTripStarted(trip = this.selectedTripRecord) {
      if (!trip?.date || !trip?.schedule) {
        return false;
      }

      const tripDate = String(trip.date).split("T")[0];
      const currentDate = this.getChileDate();

      if (tripDate < currentDate) {
        return true;
      }

      if (tripDate > currentDate) {
        return false;
      }

      const currentMinutes = this.timeToMinutes(this.obtenerHoraChile());
      const scheduleMinutes = this.timeToMinutes(String(trip.schedule).slice(0, 5));
      return scheduleMinutes <= currentMinutes;
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
    getPromotionAdjustment(ticket, promotion, basePrice = null) {
      const unitPrice =
        Number(
          ticket.unit_price ??
          ticket.unitPrice ??
          basePrice ??
          this.getSelectedTripBasePrice()
        ) || 0;
      const cant = Math.max(0, Number(ticket.cant) || 0);
      const discountType = this.getPromotionDiscountType(promotion);
      const percentage = Number(promotion?.percentage) || 0;
      const discountPerUnit =
        discountType === "porcentaje" ? (unitPrice * percentage) / 100 : percentage;
      const discount = discountPerUnit * cant;

      return {
        promotion_discount_type: discountType,
        promotionDiscountType: discountType,
        promotion_base_price: unitPrice,
        promotionBasePrice: unitPrice,
        promotion_unit_discount: discountPerUnit,
        promotionUnitDiscount: discountPerUnit,
        promotion_discount: discount,
        promotionDiscount: discount,
        percentage,
      };
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
    getPromotionDiscountType(promotion) {
      return (
        promotion?.discount_type ??
        promotion?.discountType ??
        promotion?.promotion_discount_type ??
        promotion?.promotionDiscountType ??
        promotion?.promotion_details?.discount_type ??
        promotion?.promotion_details?.discountType ??
        promotion?.promotionDetails?.discount_type ??
        promotion?.promotionDetails?.discountType ??
        "monto"
      );
    },
    getPromotionDiscountIcon(promotion) {
      return this.getPromotionDiscountType(promotion) === "porcentaje"
        ? "mdi-percent"
        : "mdi-cash-minus";
    },
    formatPromotionDiscount(promotion) {
      const discountType = this.getPromotionDiscountType(promotion);
      const value = Number(promotion?.percentage) || 0;
      const formattedValue = value.toLocaleString("es-CL");
      return discountType === "porcentaje"
        ? `${formattedValue}%`
        : `${formattedValue} CLP`;
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
      try {
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          this.editedItem.branch_id = this.branches[0].id;
          this.branch_id = this.branches[0].id;
        } else {
          this.mostrarFila = false;
          // Si no hay datos, asignamos un array vacÃ­o
          this.branches = [];
        }
      } catch (error) {
        this.mostrarFila = false;
        // Captura de errores no controlados
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.mostrarFila = true;
        this.loading = false;
        this.initialize();
      }
    },
    getSeatColor(seat) {
      if (!seat.label) return this.paleteColors.gris; // Para elementos sin label

      const seatNumber = Number(seat.label);

      if (this.isSeatReserved(seatNumber)) {
        return this.paleteColors.error; // Asiento reservado (rojo)
      }
      if (this.selectedSeats.includes(seatNumber)) {
        return this.paleteColors.primary; // Asiento seleccionado (azul)
      }
      if (seat.type === "aisle") {
        return this.paleteColors.gris; // Pasillo (gris)
      }
      if (!this.isSeatAvailable(seat)) {
        return this.paleteColors.gris; // Asiento deshabilitado
      }
      return this.paleteColors.green; // Asiento disponible (verde)
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
    updateFareSegment(fareSegmentId) {
      this.editedItem.fare_segment_id = fareSegmentId || null;
      this.editedItem.tickettypes = [];
      const selectedTrip = this.selectedTripRecord;
      if (!selectedTrip) {
        this.editedItem.price = 0;
        this.editedItem.tickettypes = [];
        return;
      }

      const selectedFareSegment = this.selectedFareSegmentRecord;
      this.editedItem.price = 0;
      this.selectedSeats = [];
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
    calculateTotal() {
      this.recalculateTicketTotals();
    },

    updateDate(val) {
      this.input = val;
      this.editedItem.date = this.dateFormatted;
      this.menu = false;
    },
    updateDateSearch(val) {
      this.input2 = val;
      //this.editedItem.date = this.dateFormatted;
      this.menu2 = false;
      this.initialize();
    },
    obtenerHoraChile() {
      return new Date().toLocaleTimeString("en-GB", {
        timeZone: "America/Santiago",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    timeToMinutes(timeStr) {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
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
    async initialize() {
      if (this.branch_id === "null") {
        this.tickets = [];
        this.loading = false;
        return;
      }
      try {
        this.loading = true;
        this.data = {};
        const today = new Date();
        const formattedDate = today
          .toLocaleDateString("es-CL", {
            timeZone: "America/Santiago",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .split("-")
          .reverse()
          .join("-"); // Convierte "DD-MM-YYYY" a "YYYY-MM-DD"
        this.data.date = this.dateFormattedSearch;
        this.data.branch_id = Number(this.branch_id);
        const result = await handleRequest({
          endpoint: "get-tickets-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.tickets = result.data?.tickets || [];
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.tickets = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.loading = false;
      }
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
      this.loading = true;
      let shouldClose = false;
      if (this.editedIndex === -1) {
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
              this.initialize();
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
      } else {
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

        if (this.areSeatsDifferent(this.originalItem.seats, this.selectedSeats)) {
          updatedFields.seats = _.cloneDeep(this.selectedSeats);
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
          updatedFields.id = this.editedItem.id;
          updatedFields.trip_id = this.editedItem.trip_id;
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          updatedFields.price = this.getSelectedTripBasePrice();
          try {
            const result = await handleRequest({
              endpoint: "ticket",
              method: "PUT",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.initialize();
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
        } else {
          this.showAlert("success", "No se realizaron cambios.", 3000);
          shouldClose = true;
        }
      }
      this.loading = false;
      if (shouldClose) {
        this.close();
      }
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
        this.showError("Error al generar códigos QR");
      }
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    },
    async printerItem(item) {
      this.currentTicket = {};

      this.data = {};
      this.data.id = Number(item.id);
      //this.data.date = formattedDate;
      try {
        const result = await handleRequest({
          endpoint: "ticket-show",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.currentTicket = result.data?.ticket || {};
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.currentTicket = {};
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
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
      }
    },
    async handleExpressSaleSaved(ticket = null) {
      await this.initialize();

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
    async editItem(item) {
      this.editedIndex = 1;
      this.aviable = "";
      this.originalItem = _.cloneDeep(item);
      this.editedItem = _.cloneDeep(item);
      this.editedItem.fare_segment_id =
        item.fare_segment_id ?? item.fareSegmentId ?? null;
      this.originalItem.tickettypes = _.cloneDeep(
        item.ticketItems || item.tickettypes || []
      );
      this.editedItem.tickettypes = _.cloneDeep(
        item.ticketItems || item.tickettypes || []
      );
      this.selectedSeats = item.seats;
      this.selectedOriginLocationId = null;
      this.selectedDestinationLocationId = null;
      this.selectedPromotion = null;
      try {
        this.editedItem.branch_id = item.branch_id ?? this.branch_id;
        await this.loadTripLocations(this.editedItem.branch_id);
        this.tickettypes = [];

        const originLabel = item.tripOrigin || item.origin || item.origin_label || "";
        const destinationLabel =
          item.tripDestination || item.destination || item.destination_label || "";
        this.selectedOriginLocationId = this.findLocationIdByText(originLabel);
        this.selectedDestinationLocationId = this.findLocationIdByText(destinationLabel);

        if (this.selectedOriginLocationId && this.selectedDestinationLocationId) {
          await this.loadTripsBySelectedLocations(item.trip_id);
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.updateSeats(item.trip_id, true);
        this.step = this.editedItem.trip_id ? 2 : 1;
        this.dialog = true;
      }
    },
    deleteItem(item) {
      this.editedIndex = -1;
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
          endpoint: "ticket-destroy",
          method: "POST",
          data: request,
        });

        // Manejo de la respuesta segÃƒÂºn el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
          this.loading = false;
        }
      } catch (error) {
        // Este bloque captura errores inesperados fuera del manejo estÃƒÂ¡ndar
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
        this.loading = false;
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
    calculateTotalSelected() {
      return (
        this.normalizeEditedTickettypes().reduce(
          (total, ticket) => total + (Number(ticket.cant) || 0),
          0
        ) || 0
      );
    },
    validateSeatAvailability() {
      this.currentlyEditing = null;
      const totalSelected = this.calculateTotalSelected();
      const available = this.availableSeats.length;

      if (totalSelected > available) {
        this.seatError = `Excedes la capacidad. Máximo: ${available} asientos`;
        return false;
      }

      this.seatError = null;
      return true;
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
    getMaxQuantity(ticket) {
      return (
        this.availableSeats.length -
        (this.totalSelected - this.getCurrentQuantity(ticket.trip_fare_id || ticket.id))
      );
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
    getTicketTypeAdjustment(ticket) {
      const basePrice = Number(ticket.base_price ?? ticket.price ?? 0) || 0;
      return {
        base_price: basePrice,
        basePrice,
        unit_price: basePrice,
        unitPrice: basePrice,
        line_total: basePrice,
        lineTotal: basePrice,
        line_subtotal: basePrice,
        lineSubtotal: basePrice,
        adjustment_amount: 0,
        adjustmentAmount: 0,
        signed_adjustment: 0,
        signedAdjustment: 0,
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
    updateTicketWithPromotion(ticket) {
      const updatedTickets = this.normalizeEditedTickettypes().map((item) => {
        if (
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) !==
          Number(ticket.trip_fare_id || ticket.id)
        ) {
          return item;
        }

        return this.buildTicketTypeRecord(item.id, item.cant, item);
      });

      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = updatedTickets;
      this.recalculateTicketTotals();
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    showPromotionSelect(ticket) {
      const updatedTickets = [...this.normalizeEditedTickettypes()];
      const existingIndex = updatedTickets.findIndex(
        (item) =>
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) ===
          Number(ticket.trip_fare_id || ticket.id)
      );

      if (existingIndex !== -1) {
        updatedTickets[existingIndex] = {
          ...updatedTickets[existingIndex],
          showPromotionSelect: true,
          selectedPromotion: null,
        };
      } else {
        updatedTickets.push(
          this.buildTicketTypeRecord(ticket, Number(ticket.cant) || 0, {
            showPromotionSelect: true,
            selectedPromotion: null,
          })
        );
      }

      this.editedItem.tickettypes = updatedTickets;
      this.$forceUpdate();

      if (this.promotions.length === 0) {
        this.loadPromotions();
      }
    },
    applyPromotion(ticket, promotionId) {
      const promotion = (this.promotions || []).find(
        (item) => Number(item.id) === Number(promotionId)
      );
      if (!promotion) {
        return;
      }

      const updatedTickets = this.normalizeEditedTickettypes();
      const existingIndex = updatedTickets.findIndex(
        (item) =>
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) ===
          Number(ticket.trip_fare_id || ticket.id)
      );
      const currentTicket =
        existingIndex !== -1
          ? updatedTickets[existingIndex]
          : this.buildTicketTypeRecord(ticket, ticket.cant, ticket);
      const updatedTicket = this.attachPromotionDetails(
        {
          ...currentTicket,
          showPromotionSelect: false,
          selectedPromotion: null,
        },
        promotion
      );

      if (existingIndex !== -1) {
        updatedTickets[existingIndex] = updatedTicket;
      } else {
        updatedTickets.push(updatedTicket);
      }

      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = updatedTickets;
      this.recalculateTicketTotals();
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    removePromotion(ticket) {
      const updatedTickets = this.normalizeEditedTickettypes().map((item) => {
        if (
          Number(item.trip_fare_id ?? item.tripFareId ?? item.id) !==
          Number(ticket.trip_fare_id || ticket.id)
        ) {
          return item;
        }

        const normalizedRecord = this.buildTicketTypeRecord(item.id, item.cant, {
          ...item,
          promotion_id: null,
          namePromotion: "",
          percentage: 0,
          discount: 0,
          showPromotionSelect: false,
          selectedPromotion: null,
        });

        const {
          promotion_base_price,
          promotionBasePrice,
          promotion_unit_discount,
          promotionUnitDiscount,
          promotion_discount,
          promotionDiscount,
          promotion_details,
          promotionDetails,
          ...cleanRecord
        } = normalizedRecord;

        return cleanRecord;
      });

      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = updatedTickets;
      this.recalculateTicketTotals();
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    onlyNumbers(evt) {
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
      }
    },
  },
};
</script>
<style>
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

/* OCULTAR HEADER DE v-data-table - Vuetify 3.4.7 */
/* MÃ¡xima especificidad para ocultar el thead */
.v-data-table>.v-data-table__wrapper>table>thead,
.v-data-table>.v-data-table__wrapper>.v-table>table>thead,
.v-data-table__content>table>thead,
.v-data-table__content>thead,
table.v-table>thead,
.v-table>.v-table__wrapper>table>thead {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}

.hidden-header .v-data-table__content>table>thead {
  display: none !important;
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
</style>
