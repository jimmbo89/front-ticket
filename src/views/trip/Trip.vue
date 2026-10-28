<template>
  <v-snackbar
    class="busgo-snackbar"
    location="right top"
    :timeout="sb_timeout"
    :color="sb_type"
    elevation="10"
    v-model="snackbar"
  >
    <div class="snackbar-content">
      <v-icon :icon="sb_icon" size="22" />
      <div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div>
    </div>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <div class="trip-page-icon"><v-icon size="21">mdi-steering</v-icon></div>

    <div>
      <div class="busgo-page-title">Viajes</div>
      <div class="busgo-page-subtitle">Planificación y control de viajes operacionales</div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn"
      @click="showAdd()"
    >
      Crear viaje
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-row class="trip-summary-row">
      <v-col cols="12" sm="6">
        <div class="trip-summary-card">
          <div class="trip-summary-icon trip-summary-icon--blue"><v-icon size="19">mdi-bus-clock</v-icon></div>
          <div><div class="trip-summary-value">{{ trips.length }}</div><div class="trip-summary-label">Viajes en la fecha seleccionada</div></div>
        </div>
      </v-col>
      <v-col cols="12" sm="6">
        <div class="trip-summary-card">
          <div class="trip-summary-icon trip-summary-icon--green"><v-icon size="19">mdi-calendar-check-outline</v-icon></div>
          <div><div class="trip-summary-value trip-summary-date">{{ dateFormattedSearch }}</div><div class="trip-summary-label">Período operativo consultado</div></div>
        </div>
      </v-col>
    </v-row>

    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Listado de viajes</div>
          <div class="busgo-card-subtitle">
            Administra rutas, vehículos, trabajadores, horarios y paradas.
          </div>
        </div>
      </div>

      <div class="trip-toolbar">
        <v-autocomplete
          v-if="mostrarFila"
          :no-data-text="'No hay datos disponibles'"
          v-model="branch_id"
          :items="branches"
          placeholder="Seleccione una sucursal"
          prepend-inner-icon="mdi-store"
          item-title="name"
          item-value="id"
          variant="outlined"
          hide-details
          single-line
          density="compact"
          class="trip-filter"
          :rules="selectRules"
          @update:modelValue="initialize"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="getImageUrl(item.raw.image)"
            />
          </template>
        </v-autocomplete>

        <v-menu
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :modelValue="dateFormattedSearch"
              prepend-inner-icon="mdi-calendar"
              placeholder="Fecha"
              density="compact"
              variant="outlined"
              hide-details
              single-line
              class="trip-date-filter"
            />
          </template>

          <v-locale-provider locale="es">
            <v-date-picker
              header="Calendario"
              title="Seleccione la fecha"
              :color="paleteColors.primary"
              :modelValue="input2"
              @update:model-value="updateDateSearch"
              format="yyyy-MM-dd"
              :min="new Date().toISOString().split('T')[0]"
            />
          </v-locale-provider>
        </v-menu>

        <v-spacer />

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar viaje..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="trip-search"
        />
      </div>

      <StandardDataTable
        :headers="headers"
        :items="sortedTrips"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        class="busgo-table trips-main-table"
        :hide-default-header="true"
      >
        <template #top>
          <div class="trip-main-table-head standard-table-header">
            <div class="trip-col-code trip-sortable" @click="toggleTripSort('code')">
              <span>Código</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('code') }}</v-icon>
            </div>
            <div class="trip-col-route trip-sortable" @click="toggleTripSort('routeCode')">
              <span>Ruta</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('routeCode') }}</v-icon>
            </div>
            <div class="trip-col-vehicle trip-sortable" @click="toggleTripSort('vehicleName')">
              <span>Vehículo</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('vehicleName') }}</v-icon>
            </div>
            <div class="trip-col-date trip-sortable" @click="toggleTripSort('date')">
              <span>Fecha</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('date') }}</v-icon>
            </div>
            <div
              class="trip-col-schedule trip-sortable"
              @click="toggleTripSort('schedule')"
            >
              <span>Hora Programada</span>
              <v-icon size="16" class="ml-1">
                {{ tripSortIcon('schedule') }}
              </v-icon>
            </div>
            <div class="trip-col-sale-mode trip-sortable" @click="toggleTripSort('saleMode')">
              <span>Modo</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('saleMode') }}</v-icon>
            </div>
            <div class="trip-col-start trip-sortable" @click="toggleTripSort('start')">
              <span>Salida</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('start') }}</v-icon>
            </div>
            <div class="trip-col-end trip-sortable" @click="toggleTripSort('arrival')">
              <span>Llegada estimada</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('arrival') }}</v-icon>
            </div>
            <div class="trip-col-actions standard-table-actions-heading">ACCIONES</div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td colspan="100" class="pa-0 border-0">
              <div class="busgo-row trip-row">
                <div class="trip-col-code busgo-meta trip-code-cell">
                  <span class="trip-code-value text-truncate">
                    {{ slotProps.item.code || "-" }}
                  </span>
                </div>

                <div class="trip-col-route">
                  <div class="trip-route-title-row">
                    <div class="trip-route-title">
                      {{ slotProps.item.routeCode || "-" }}
                    </div>
                  </div>

                  <div class="trip-route-meta">
                    <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>

                    <span class="text-truncate">
                       {{ slotProps.item.origin }}
                    </span>

                    <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>

                    <span class="text-truncate">
                      {{ slotProps.item.destination }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Código viaje: {{ slotProps.item.code || "-" }}<br />
                      Código ruta: {{ slotProps.item.routeCode || "-" }}<br />
                      Origen: {{ slotProps.item.origin }}<br />
                      Destino: {{ slotProps.item.destination }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-col-vehicle trip-vehicle-cell">
                  <strong class="trip-cell-title">{{ slotProps.item.vehicleName || 'Sin vehículo' }}</strong>
                  <BusgoChip size="x-small" color="#2454d6" class="mt-2">
                    Interno {{ vehicleInternalNumber(slotProps.item) }}
                  </BusgoChip>

                </div>

                <div class="trip-col-date busgo-meta">
                  <v-icon size="16" color="primary">mdi-calendar</v-icon>
                  <span class="text-truncate">{{ slotProps.item.date }}</span>
                </div>

                <div class="trip-col-schedule busgo-meta">
                  <v-icon size="16" color="primary">mdi-clock-outline</v-icon>
                  <span class="text-truncate">{{ slotProps.item.schedule }}</span>
                </div>

                <div class="trip-col-sale-mode">
                  <v-tooltip location="bottom">
                    <template #activator="{ props }">
                      <SaleModeChip v-bind="props" :value="slotProps.item" />
                    </template>

                    <span>{{ getSaleModeName(slotProps.item) }}</span>
                  </v-tooltip>
                </div>

                <div class="trip-col-start busgo-meta trip-datetime-cell">
                  <div class="trip-datetime-value">
                    <span >
                      {{ formatTripDate(slotProps.item.start) }}
                    </span>
                    <span class="trip-datetime-time">
                      {{ formatTripTime(slotProps.item.start) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      {{ formatTripDateTimeTooltip("Salida", slotProps.item.start) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-col-end busgo-meta trip-datetime-cell">
                  <div class="trip-datetime-value">
                    <span >
                      {{ formatTripDate(getTripArrivalValue(slotProps.item)) }}
                    </span>
                    <span class="trip-datetime-time">
                      {{ formatTripTime(getTripArrivalValue(slotProps.item)) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      {{ formatTripDateTimeTooltip("Llegada estimada", getTripArrivalValue(slotProps.item)) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-col-actions busgo-actions">
                  <v-tooltip text="Editar viaje" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-pencil-outline"
                        variant="text"
                        size="small"
                        class="action-button action-button--edit"
                        @click="editItem(slotProps.item)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Eliminar viaje" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-trash-can-outline"
                        variant="text"
                        size="small"
                        class="action-button action-button--delete"
                        @click="deleteItem(slotProps.item)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </StandardDataTable>
    </v-card>
  </v-container>

  <v-dialog
    v-model="dialog"
    fullscreen
    transition="dialog-bottom-transition"
    :no-click-animation="true"
  >
    <v-card class="trip-dialog">
      <header class="trip-dialog-header">
        <div class="trip-dialog-heading">
          <div class="trip-dialog-icon"><v-icon size="21">mdi-bus-clock</v-icon></div>
          <div>
            <div class="trip-dialog-title">{{ formTitle }}</div>
            <div class="trip-dialog-subtitle">Configura la operación, las paradas, las tarifas y el equipo del viaje</div>
          </div>
        </div>
        <div class="trip-dialog-progress">
          <span>Paso {{ step }} de {{ items.length }}</span>
          <strong>{{ items[step - 1] }}</strong>
        </div>
        <v-btn icon="mdi-close" variant="text" class="trip-dialog-close" :disabled="loading" @click="close()" />
      </header>
      <v-card-text class="trip-dialog-body pa-0">
        <div class="trip-progress-nav">
          <div
            v-for="(progressItem, progressIndex) in items"
            :key="progressItem"
            class="trip-progress-item"
            :class="{
              'trip-progress-item--active': step === progressIndex + 1,
              'trip-progress-item--complete': step > progressIndex + 1
            }"
          >
            <div class="trip-progress-number">
              <v-icon v-if="step > progressIndex + 1" size="16">mdi-check</v-icon>
              <span v-else>{{ progressIndex + 1 }}</span>
            </div>
            <div class="trip-progress-copy">
              <span>Etapa {{ String(progressIndex + 1).padStart(2, '0') }}</span>
              <strong>{{ progressItem }}</strong>
            </div>
          </div>
        </div>
        <v-form
          v-model="valid"
          enctype="multipart/form-data"
          class="trip-form"
        >
          <v-stepper
            elevation="0"
            bg-color=""
            v-model="step"
            :items="items"
            hide-actions
            class="trip-stepper"
          >
            <template #item.1>
              <div class="trip-step-pane trip-step-pane--summary">
                <div class="trip-step-content">
                <div class="trip-form-intro">
                  <div class="trip-form-intro-icon"><v-icon size="21">mdi-tune-variant</v-icon></div>
                  <div><strong>Configuración operativa</strong><span>Selecciona los recursos y horarios que definirán este viaje.</span></div>
                </div>
                <div class="trip-form-section-title"><v-icon size="17">mdi-map-marker-path</v-icon><span>Ruta y recursos</span></div>
                <v-row style="margin-top: 5px">
                  <v-col v-if="mostrarFila" cols="12" md="6">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.branch_id"
                      :items="branches"
                      label="Sucursal"
                      prepend-inner-icon="mdi-store"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                      :menu-props="{ contentClass: 'trip-branch-menu' }"
                      :disabled="editedIndex !== -1"
                      @update:model-value="onTripBranchChange"
                    >
                      <template #item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :prepend-avatar="getImageUrl(item.raw.image)"
                        />
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.route_id"
                      :items="routes"
                      label="Ruta"
                      prepend-inner-icon="mdi-road-variant"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                      :menu-props="{ contentClass: 'trip-route-menu' }"
                      @update:model-value="updateStimated"
                    >
                      <template #selection="{ item }">
                        <span class="trip-selected-label">{{ item.raw.routeCode || item.raw.name }} · {{ item.raw.originAddress || 'Sin dirección' }} → {{ item.raw.destinationAddress || 'Sin dirección' }}</span>
                      </template>
                      <template #item="{ props, item }">
                        <v-list-item v-bind="{ ...props, title: undefined, subtitle: undefined }" class="trip-route-option">
                          <div class="trip-option-heading">
                            <strong>{{ item.raw.routeCode || item.raw.name || 'Ruta' }}</strong>
                            <span><v-icon size="15">mdi-clock-outline</v-icon>{{ formatDuration(item.raw.estimated) }}</span>
                          </div>
                          <div class="trip-option-journey">
                            <div class="trip-option-place">
                              <v-avatar size="40" rounded="lg"><v-img :src="getImageUrl(item.raw.originImage)" cover /></v-avatar>
                              <div><small>Origen</small><strong>{{ item.raw.originAddress || 'Sin dirección' }}</strong></div>
                            </div>
                            <v-icon class="trip-option-arrow" size="20">mdi-arrow-right</v-icon>
                            <div class="trip-option-place">
                              <v-avatar size="40" rounded="lg"><v-img :src="getImageUrl(item.raw.destinationImage)" cover /></v-avatar>
                              <div><small>Destino</small><strong>{{ item.raw.destinationAddress || 'Sin dirección' }}</strong></div>
                            </div>
                          </div>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.vehicle_id"
                      :items="vehicles"
                      label="Vehículo"
                      prepend-inner-icon="mdi-bus"
                      item-title="vehicleName"
                      item-value="id"
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                      :menu-props="{ contentClass: 'trip-vehicle-menu' }"
                      @update:model-value="filterWorkers"
                    >
                      <template #item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :prepend-avatar="getImageUrl(item.raw.vehicleImage)"
                          :title="item.raw.vehicleName"
                        >
                          <v-list-item-subtitle class="trip-vehicle-option-meta">
                            <div><v-icon size="13">mdi-pound</v-icon><span>{{ vehicleInternalNumber(item.raw) }}</span></div>
                            <div><v-icon size="13">mdi-factory</v-icon><span>{{ item.raw.brand || "Sin marca" }}</span></div>
                            <div><v-icon size="13">mdi-seat-passenger</v-icon><span>{{ item.raw.seats ?? "N/D" }} asientos</span></div>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-menu
                      v-model="menu"
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
                          variant="outlined"
                          prepend-inner-icon="mdi-calendar"
                          label="Fecha"
                          density="compact"
                        />
                      </template>

                      <v-locale-provider locale="es">
                        <v-date-picker
                          header="Calendario"
                          title="Seleccione la fecha"
                          :color="paleteColors.primary"
                          :modelValue="input"
                          @update:model-value="updateDate"
                          format="yyyy-MM-dd"
                          :min="new Date().toISOString().split('T')[0]"
                        />
                      </v-locale-provider>
                    </v-menu>
                  </v-col>
                </v-row>

                <div class="trip-form-section-title trip-form-section-title--schedule"><v-icon size="17">mdi-clock-outline</v-icon><span>Programación y venta</span></div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="editedItem.saleMode"
                      :items="saleModes"
                      label="Tipo de venta"
                      :menu-props="{ contentClass: 'trip-standard-menu' }"
                      prepend-inner-icon="mdi-ticket-confirmation-outline"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                      @update:model-value="onTripSaleModeChange"
                    >
                      <template #selection="{ item }">
                        <SaleModeChip :value="item.raw?.id || editedItem.saleMode" />
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      :model-value="ticketTemplateSelection[0] ?? null"
                      :items="ticketTemplates"
                      item-title="name"
                      item-value="id"
                      label="Plantilla de ticket"
                      placeholder="Selecciona una plantilla o usa la predeterminada"
                      prepend-inner-icon="mdi-ticket-confirmation-outline"
                      :menu-props="{ contentClass: 'trip-standard-menu' }"
                      variant="outlined"
                      density="compact"
                      clearable
                      no-data-text="No hay plantillas de tickets activas."
                      :disabled="loading"
                      :loading="loading"
                      @update:model-value="onTripTicketTemplateChange"
                    >
                      <template #selection="{ item }">
                        <v-chip size="small" color="#2454d6" variant="tonal">
                          {{ item.raw?.name || item.title }}
                        </v-chip>
                      </template>
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" :title="item.raw.name" :subtitle="ticketTemplateOptionSubtitle(item.raw)">
                          <template #prepend><v-icon color="primary">mdi-ticket-confirmation-outline</v-icon></template>
                          <template #append><v-chip v-if="isDefaultTicketTemplate(item.raw)" size="x-small" color="success" variant="tonal">Predeterminada</v-chip></template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12">
                    <section class="trip-time-panel" aria-label="Horario del viaje">
                      <div class="trip-time-panel-heading"><v-icon size="18">mdi-clock-outline</v-icon><strong>Horario del viaje</strong><span>Formato 24 horas</span></div>
                      <div class="trip-time-journey">
                        <v-menu
                          v-model="timeMenu"
                          location="bottom start"
                          :offset="8"
                          :close-on-content-click="false"
                          :disabled="!editedItem.route_id"
                          content-class="trip-time-menu"
                        >
                          <template #activator="{ props }">
                            <v-text-field
                              v-bind="props"
                              :model-value="editedItem.schedule || '— : —'"
                              label="Hora de salida"
                              prepend-inner-icon="mdi-clock-start"
                              variant="outlined"
                              density="comfortable"
                              :rules="timeRules"
                              :disabled="!editedItem.route_id"
                              readonly
                              hide-details="auto"
                              class="trip-departure-input"
                              aria-label="Seleccionar hora de salida"
                            />
                          </template>

                          <v-card class="trip-time-picker" elevation="8">
                            <div class="trip-time-picker-heading">
                              <strong>Selecciona la salida</strong>
                              <span>Elige hora y minutos · Formato 24 horas</span>
                            </div>
                            <div class="trip-time-selectors">
                              <v-select
                                :model-value="scheduleHour"
                                :items="timeHours"
                                label="Hora"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="trip-time-part-select"
                                :menu-props="{ contentClass: 'trip-time-part-menu' }"
                                @update:model-value="updateScheduleHour"
                              />
                              <span class="trip-time-separator">:</span>
                              <v-select
                                :model-value="scheduleMinute"
                                :items="timeMinutes"
                                label="Minutos"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="trip-time-part-select"
                                :menu-props="{ contentClass: 'trip-time-part-menu' }"
                                @update:model-value="updateScheduleMinute"
                              />
                            </div>
                            <div class="trip-time-picker-footer">
                              <span><v-icon size="14">mdi-information-outline</v-icon>Se permiten todos los minutos.</span>
                              <v-btn color="primary" variant="flat" size="small" @click="timeMenu = false">Aplicar hora</v-btn>
                            </div>
                          </v-card>
                        </v-menu>
                        <div class="trip-time-duration"><span>{{ selectedRouteRecord ? formatDuration(selectedRouteRecord.estimated) : 'Duración estimada' }}</span><div><span></span><v-icon size="20">mdi-arrow-right</v-icon></div></div>
                        <div class="trip-time-arrival" aria-live="polite">
                          <span class="trip-time-label"><v-icon size="17">mdi-clock-end</v-icon>Llegada estimada</span>
                          <span class="trip-time-value">{{ editedItem.arrival || '— : —' }}</span>
                          <span class="trip-time-arrival-caption">Calculada automáticamente</span>
                        </div>
                      </div>
                      <div v-if="!editedItem.route_id" class="trip-time-hint"><v-icon size="16">mdi-map-marker-path</v-icon>Selecciona una ruta para consultar los horarios.</div>
                    </section>
                  </v-col>
                </v-row>
                </div>

              <v-divider />

              <div class="trip-step-actions">
                <v-row class="mt-1">
                  <v-btn color="#E7E9E9" variant="flat" @click="close()">
                    Salir
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    color="#E7E9E9"
                    variant="flat"
                    @click="nextStep"
                    :disabled="
                      !editedItem.vehicle_id ||
                      !editedItem.route_id ||
                      !editedItem.schedule
                    "
                  >
                    Continuar a paradas
                  </v-btn>
                </v-row>
              </div>
              </div>
            </template>

            <template #item.2>
              <div class="trip-step-pane">
                <div class="trip-step-content">
                <v-sheet border class="trip-config-section trip-stop-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center" no-gutters>
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Paradas del viaje</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          La columna de asociación agrega o quita la parada del viaje. La tabla muestra la información propia de la parada.
                        </div>
                      </v-col>
                      <v-spacer />
                      <v-col cols="12" md="4" class="trip-stop-toolbar-actions">
                        <v-text-field
                          v-model="tripStopSearch"
                          class="trip-stop-search"
                          density="compact"
                          variant="outlined"
                          prepend-inner-icon="mdi-magnify"
                          placeholder="Buscar parada..."
                          hide-details
                          clearable
                        />
                        <v-btn
                          :color="paleteColors.primary"
                          variant="flat"
                          prepend-icon="mdi-plus"
                          class="trip-add-stop-button"
                          :disabled="!editedItem.route_id"
                          @click="openAddTripStop"
                        >
                          Agregar parada
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text class="trip-config-list-content">
                    <div class="trip-list-scroll trip-stop-list" role="table" aria-label="Paradas del viaje">
                      <div class="trip-list-header trip-stop-list-header" role="row">
                        <div style="width:40%" role="columnheader">Parada</div>
                        <div class="trip-stop-column-header" role="columnheader"><span>Subir</span></div>
                        <div class="trip-stop-column-header" role="columnheader"><span>Bajar</span></div>
                        <div class="trip-stop-column-header" role="columnheader"><span>Activa</span></div>
                        <div class="trip-stop-column-header" role="columnheader"><span>Asociar al viaje</span></div>
                        <div class="trip-stop-column-header" role="columnheader"><span>Editar</span></div>
                      </div>

                      <div v-if="loading" class="trip-list-state">Cargando datos...</div>
                      <div v-else-if="!filteredTripStopRows.length" class="trip-list-state">No hay paradas disponibles.</div>

                      <div
                        v-for="stop in filteredTripStopRows"
                        :key="getTripStopRowKey(stop)"
                        class="trip-list-row trip-stop-list-row"
                        role="row"
                        :style="{ opacity: stop.included ? 1 : 0.85 }"
                      >
                        <div class="trip-stop-place" style="width:40%" role="cell">
                          <v-avatar class="trip-list-avatar" color="grey-lighten-4">
                            <v-img :src="getImageUrl(stop.locationImage)" alt="image" cover />
                          </v-avatar>
                          <div class="trip-list-copy">
                            <strong>{{ stop.locationName }}</strong>
                            <span>{{ [stop.locationCity, stop.locationCountry].filter(Boolean).join(', ') || 'Sin localidad' }}</span>
                          </div>
                        </div>

                        <div style="width:12%" class="trip-list-control" role="cell">
                          <v-switch v-model="stop.can_board" :true-value="true" :false-value="false" :color="stop.can_board ? paleteColors.green : paleteColors.grey" :base-color="stop.can_board ? paleteColors.green : paleteColors.grey" density="compact" hide-details inset class="custom-switch compact-inline-switch" @update:modelValue="onTripStopFieldChange" />
                        </div>
                        <div style="width:12%" class="trip-list-control" role="cell">
                          <v-switch v-model="stop.can_alight" :true-value="true" :false-value="false" :color="stop.can_alight ? paleteColors.green : paleteColors.grey" :base-color="stop.can_alight ? paleteColors.green : paleteColors.grey" density="compact" hide-details inset class="custom-switch compact-inline-switch" @update:modelValue="onTripStopFieldChange" />
                        </div>
                        <div style="width:12%" class="trip-list-control" role="cell">
                          <v-switch v-model="stop.active" :true-value="true" :false-value="false" :color="stop.active ? paleteColors.green : paleteColors.grey" :base-color="stop.active ? paleteColors.green : paleteColors.grey" density="compact" hide-details inset class="custom-switch compact-inline-switch" @update:modelValue="onTripStopFieldChange" />
                        </div>
                        <div style="width:17%" class="trip-list-association" role="cell">
                          <v-btn
                            class="trip-association-button"
                            variant="text"
                            :color="stop.included ? paleteColors.green : paleteColors.grey"
                            :title="stop.included ? 'Quitar parada del viaje' : 'Asociar parada al viaje'"
                            :aria-label="stop.included ? 'Quitar parada del viaje' : 'Asociar parada al viaje'"
                            @click="toggleTripStopIncluded(stop)"
                          >
                            <v-icon size="24">{{ stop.included ? 'mdi-link-off' : 'mdi-link-plus' }}</v-icon>
                          </v-btn>
                          <span :style="{ color: stop.included ? paleteColors.green : paleteColors.grey }">{{ stop.included ? "Quitar" : "Asociar" }}</span>
                        </div>
                        <div style="width:7%" class="trip-list-action" role="cell">
                          <v-btn
                            v-if="isEditableTripStop(stop)"
                            icon="mdi-pencil-outline"
                            size="30"
                            variant="text"
                            :color="paleteColors.primary"
                            title="Editar parada del viaje"
                            @click="openEditTripStop(stop)"
                          />
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-sheet>
                </div>

              <v-divider />

              <div class="trip-step-actions">
                <v-row class="mt-1">
                  <v-btn color="#E7E9E9" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    color="#E7E9E9"
                    variant="flat"
                    @click="nextStep"
                    :disabled="!tripStopRows.length"
                  >
                    Continuar a tarifas
                  </v-btn>
                </v-row>
              </div>
              </div>
            </template>

            <template #item.3>
              <div class="trip-step-pane">
                <div class="trip-step-content">
                <v-sheet border class="trip-config-section trip-fare-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center" no-gutters>
                      <v-col cols="12" md="5" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Tramos y tipos de pasaje</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          Define los tramos disponibles para el viaje y ajusta el precio
                          de cada tipo de pasaje.
                        </div>
                      </v-col>
                      <v-spacer />
                      <v-col cols="12" md="4" class="trip-fare-toolbar-actions">
                        <v-text-field
                          v-model="tripFareSearch"
                          class="trip-fare-search"
                          density="compact"
                          variant="outlined"
                          prepend-inner-icon="mdi-magnify"
                          placeholder="Buscar tramo..."
                          hide-details
                          clearable
                        />
                        <v-btn
                          :color="paleteColors.primary"
                          variant="flat"
                          prepend-icon="mdi-plus"
                          class="trip-add-fare-button"
                          :disabled="!editedItem.route_id"
                          @click="openAddTripFare"
                        >
                          Agregar tramo
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text class="trip-config-list-content">
                    <div class="trip-list-scroll trip-fare-list" role="table" aria-label="Tramos y tipos de pasaje">
                      <div class="trip-list-header trip-fare-list-header" role="row">
                        <div style="width:22%" role="columnheader">Origen</div>
                        <div style="width:22%" role="columnheader">Destino</div>
                        <div style="width:12%" role="columnheader">Precio base</div>
                        <div style="width:16%" role="columnheader">Vigencia</div>
                        <div style="width:8%" class="trip-list-column-centered" role="columnheader">Estado</div>
                        <div style="width:12%" class="trip-list-column-centered" role="columnheader">Asociar</div>
                        <div style="width:4%" role="columnheader">Editar</div>
                        <div style="width:4%" role="columnheader">Tipos</div>
                      </div>

                      <div v-if="loading" class="trip-list-state">Cargando datos...</div>
                      <div v-else-if="!filteredTripFareRows.length" class="trip-list-state">No hay tramos disponibles.</div>

                      <div
                        v-for="fare in filteredTripFareRows"
                        :key="tripFareRowKey(fare)"
                        class="trip-list-row trip-fare-list-row"
                        role="row"
                      >
                        <div style="width:22%" class="trip-list-value trip-list-primary" role="cell">{{ fare.originLabel }}</div>
                        <div style="width:22%" class="trip-list-value trip-list-primary" role="cell">{{ fare.destinationLabel }}</div>
                        <div style="width:12%" class="trip-list-value" role="cell">{{ formatNumber(fare.base_price) }}</div>
                        <div style="width:16%" class="trip-list-validity" role="cell">
                          <span>{{ fare.valid_from || '-' }}</span>
                          <span>hasta {{ fare.valid_to || '-' }}</span>
                        </div>
                        <div style="width:8%" class="trip-list-status" role="cell">
                          <v-switch
                            v-model="fare.active"
                            :true-value="true"
                            :false-value="false"
                            :color="fare.active ? paleteColors.green : paleteColors.grey"
                            :base-color="fare.active ? paleteColors.green : paleteColors.grey"
                            density="compact"
                            hide-details
                            inset
                            class="custom-switch compact-inline-switch"
                          />
                          <v-chip
                            v-if="fare.included && tripFareUsesInactiveStop(fare)"
                            class="trip-fare-unavailable-chip"
                            color="warning"
                            size="x-small"
                            variant="tonal"
                            title="El tramo está asociado, pero no está disponible para venta porque una parada está inactiva."
                          >
                            No disponible
                          </v-chip>
                        </div>
                        <div style="width:12%" class="trip-list-association" role="cell">
                          <v-btn
                            class="trip-association-button"
                            variant="text"
                            :color="fare.included ? paleteColors.green : paleteColors.grey"
                            :title="fare.included ? 'Quitar tramo del viaje' : 'Asociar tramo al viaje'"
                            :aria-label="fare.included ? 'Quitar tramo del viaje' : 'Asociar tramo al viaje'"
                            @click="toggleTripFareIncluded(fare)"
                          >
                            <v-icon size="24">{{ fare.included ? 'mdi-link-off' : 'mdi-link-plus' }}</v-icon>
                          </v-btn>
                          <span :style="{ color: fare.included ? paleteColors.green : paleteColors.grey }">{{ fare.included ? 'Quitar' : 'Asociar' }}</span>
                        </div>
                        <div style="width:4%" class="trip-list-action" role="cell">
                          <v-btn
                            v-if="isEditableTripFare(fare)"
                            icon="mdi-pencil-outline"
                            size="30"
                            variant="text"
                            :color="paleteColors.primary"
                            title="Editar tramo del viaje"
                            @click="openEditTripFare(fare)"
                          />
                        </div>
                        <div style="width:4%" class="trip-list-action" role="cell">
                          <v-btn v-if="fare.fareSegmentTicketTypes && fare.fareSegmentTicketTypes.length" size="32" icon variant="outlined" :color="paleteColors.primary" class="trip-fare-expand-button" title="Ver tipos de pasaje" @click="toggleTripFareExpanded(fare)">
                            <v-icon size="18">{{ isTripFareExpanded(fare) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                          </v-btn>
                        </div>

                        <v-expand-transition>
                          <div v-if="isTripFareExpanded(fare) && fare.fareSegmentTicketTypes && fare.fareSegmentTicketTypes.length" class="trip-fare-expanded">
                            <v-card variant="outlined" class="trip-fare-ticket-types-panel rounded-lg" elevation="0">
                              <div class="trip-fare-ticket-types-header">
                                <div class="trip-fare-col-name">Tipo de pasajero</div>
                                <div class="trip-fare-col-price">Precio (Bs.)</div>
                                <div class="trip-fare-col-status">Habilitado</div>
                              </div>
                              <div v-for="(ticketType, ticketIndex) in fare.fareSegmentTicketTypes" :key="tripFareTicketTypeKey(ticketType, ticketIndex)" class="trip-fare-ticket-types-row">
                                <div class="trip-fare-col-name"><div class="font-weight-medium text-truncate">{{ ticketType.ticketTypeName }}</div></div>
                                <div class="trip-fare-col-price"><v-text-field v-model="ticketType.price" type="number" step="1" min="0" variant="outlined" density="compact" hide-details /></div>
                                <div class="trip-fare-col-status">
                                  <div class="trip-fare-status-inline">
                                    <v-switch v-model="ticketType.active" :true-value="true" :false-value="false" :color="ticketType.active ? paleteColors.green : paleteColors.grey" :base-color="ticketType.active ? paleteColors.green : paleteColors.grey" density="compact" hide-details inset class="trip-fare-row-switch" />
                                    <span class="trip-fare-status-label text-body-2" :style="{ color: ticketType.active ? paleteColors.green : paleteColors.grey }">{{ ticketType.active ? 'Si' : 'No' }}</span>
                                  </div>
                                </div>
                              </div>
                            </v-card>
                          </div>
                        </v-expand-transition>
                      </div>
                    </div>
                  </v-card-text>
                </v-sheet>
                </div>

              <v-divider />

              <div class="trip-step-actions">
                <v-row class="mt-1">
                  <v-btn color="#E7E9E9" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn color="#E7E9E9" variant="flat" @click="nextStep">
                    Asignar trabajadores
                  </v-btn>
                </v-row>
              </div>
              </div>
            </template>

            <template #item.4>
              <div class="trip-step-pane">
                <div class="trip-step-content">
                <v-sheet border class="trip-config-section trip-worker-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center" no-gutters>
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Trabajadores del viaje</strong>
                        </span>
                        <div class="text-caption">Selecciona los trabajadores que participarán en este viaje.</div>
                      </v-col>
                      <v-spacer />
                      <v-col cols="12" md="4" class="trip-worker-toolbar-actions">
                        <v-text-field
                          v-model="workerSearch"
                          class="trip-worker-search"
                          density="compact"
                          variant="outlined"
                          prepend-inner-icon="mdi-magnify"
                          placeholder="Buscar trabajador..."
                          hide-details
                          clearable
                        />
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text class="trip-config-list-content">
                    <div class="trip-list-scroll trip-worker-assignment-list" role="table" aria-label="Trabajadores del viaje">
                      <div class="trip-list-header trip-worker-list-header" role="row">
                        <div style="width:50%" role="columnheader">Trabajador</div>
                        <div style="width:25%" role="columnheader">Rol</div>
                        <div style="width:25%" class="trip-list-column-centered" role="columnheader">Asignar al viaje</div>
                      </div>

                      <div v-if="loading" class="trip-list-state">Cargando datos...</div>
                      <div v-else-if="!tripWorkersForDisplay.length" class="trip-list-state">No hay trabajadores disponibles.</div>

                      <div v-for="worker in tripWorkersForDisplay" :key="worker.id" class="trip-list-row trip-worker-list-row" role="row">
                        <div style="width:50%" class="trip-worker-place" role="cell">
                          <v-avatar class="trip-list-avatar" elevation="3" color="grey-lighten-4">
                            <v-img :src="getImageUrl(worker.workerImage)" alt="image" />
                          </v-avatar>
                          <div class="trip-list-copy"><strong>{{ worker.workerName }}</strong></div>
                        </div>
                        <div style="width:25%" class="trip-list-value" role="cell">{{ worker.roleName || '-' }}</div>
                        <div style="width:25%" class="trip-list-association" role="cell">
                          <v-switch
                            :model-value="isWorkerAssociated(worker)"
                            @update:model-value="(value) => value ? saveAssignedWorker(worker) : deleteItemWorker(worker)"
                            :true-value="true"
                            :false-value="false"
                            :color="isWorkerAssociated(worker) ? paleteColors.green : paleteColors.grey"
                            :base-color="isWorkerAssociated(worker) ? paleteColors.green : paleteColors.grey"
                            density="compact"
                            hide-details
                            inset
                            class="custom-switch compact-inline-switch"
                            :title="isWorkerAssociated(worker) ? 'Quitar trabajador del viaje' : 'Asignar trabajador al viaje'"
                          />
                          <span :style="{ color: isWorkerAssociated(worker) ? paleteColors.green : paleteColors.grey }">{{ isWorkerAssociated(worker) ? 'Asignado' : 'Sin asignar' }}</span>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-sheet>
                </div>

              <v-divider />

              <div class="trip-step-actions">
                <v-row class="mt-1">
                  <v-btn color="#E7E9E9" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    :color="paleteColors.primary"
                    variant="flat"
                    @click="save()"
                    :disabled="!valid || !editedItem.workers.length"
                    :loading="loading"
                  >
                    Aceptar
                  </v-btn>
                </v-row>
              </div>
              </div>
            </template>
          </v-stepper>
          <aside class="trip-live-summary" aria-label="Resumen del viaje">
            <div class="trip-summary-heading"><v-icon size="20">mdi-clipboard-text-outline</v-icon><div><strong>Tu viaje</strong><span>Resumen de la configuración actual</span></div></div>
            <section class="trip-route-preview">
              <div class="trip-preview-eyebrow">Recorrido</div>
              <template v-if="selectedRouteRecord">
                <div class="trip-preview-route-code">{{ selectedRouteRecord.routeCode || selectedRouteRecord.name }}</div>
                <div class="trip-preview-stop"><span class="trip-preview-dot"></span><div><small>Origen</small><strong>{{ selectedRouteRecord.originAddress || 'Sin dirección' }}</strong></div></div>
                <div class="trip-preview-stop trip-preview-stop--destination"><span class="trip-preview-dot"></span><div><small>Destino</small><strong>{{ selectedRouteRecord.destinationAddress || 'Sin dirección' }}</strong></div></div>
                <div class="trip-preview-duration"><v-icon size="16">mdi-clock-outline</v-icon>{{ formatDuration(selectedRouteRecord.estimated) }} estimados</div>
              </template>
              <div v-else class="trip-preview-empty"><v-icon size="26">mdi-map-marker-path</v-icon><span>Selecciona una ruta para ver el recorrido.</span></div>
            </section>
            <section class="trip-vehicle-preview">
              <div class="trip-preview-eyebrow">Vehículo asignado</div>
              <template v-if="vehicles.some(vehicle => String(vehicle.id) === String(editedItem.vehicle_id))">
                <div v-for="vehicle in vehicles.filter(vehicle => String(vehicle.id) === String(editedItem.vehicle_id)).slice(0, 1)" :key="vehicle.id">
                  <v-img :src="getImageUrl(vehicle.vehicleImage)" height="120" class="trip-preview-vehicle-image" contain>
                    <template #error><div class="trip-preview-image-fallback"><v-icon size="44">mdi-bus</v-icon></div></template>
                  </v-img>
                  <strong class="trip-preview-vehicle-name">{{ vehicle.vehicleName }}</strong>
                  <div class="trip-preview-vehicle-meta"><span><v-icon size="14">mdi-pound</v-icon>{{ vehicleInternalNumber(vehicle) }}</span><span><v-icon size="14">mdi-seat-passenger</v-icon>{{ vehicle.seats ?? 'N/D' }} asientos</span></div>
                  <div class="trip-preview-brand">{{ vehicle.brand || 'Sin marca' }}</div>
                </div>
              </template>
              <div v-else class="trip-preview-empty"><v-icon size="26">mdi-bus</v-icon><span>Selecciona el vehículo del viaje.</span></div>
            </section>
            <section class="trip-sale-mode-preview">
              <div class="trip-preview-eyebrow">Tipo de venta</div>
              <div class="trip-preview-sale-mode">
                <span>Tipo de Venta:</span>
                <SaleModeChip :value="editedItem.saleMode" size="small" density="standard" />
              </div>
            </section>
            <section class="trip-schedule-preview">
              <div class="trip-preview-eyebrow">Programación</div>
              <div class="trip-preview-date"><v-icon size="17">mdi-calendar-outline</v-icon>{{ dateFormatted || 'Fecha pendiente' }}</div>
              <div class="trip-preview-times"><div><small>Salida</small><strong>{{ editedItem.schedule || '—' }}</strong></div><v-icon size="19">mdi-arrow-right</v-icon><div><small>Llegada estimada</small><strong>{{ editedItem.arrival || '—' }}</strong></div></div>
            </section>
            <div class="trip-preview-note"><v-icon size="16">mdi-information-outline</v-icon><span>Los cambios se guardan al confirmar el viaje en la última etapa.</span></div>
          </aside>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="addTripStopDialog" max-width="720" persistent>
    <v-form ref="tripStopForm" v-model="addTripStopValid" @submit.prevent="addTripStop">
      <v-card class="trip-add-stop-dialog" elevation="0">
        <div class="trip-add-stop-header">
          <div class="trip-add-stop-heading">
            <div class="trip-add-stop-icon"><v-icon size="20">mdi-map-marker-plus-outline</v-icon></div>
            <div>
              <strong>{{ editingTripStopKey ? "Editar parada" : "Agregar parada" }}</strong>
              <span>{{ editingTripStopKey ? "Actualiza la configuración de la parada en este viaje" : "Incorpora una parada al viaje" }}</span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" :disabled="addingTripStop" @click="closeAddTripStop" />
        </div>
        <v-divider />

        <v-card-text class="trip-add-stop-body">
          <div class="trip-add-stop-section-label">Ubicación</div>
          <v-autocomplete
            v-model="newTripStop.location_id"
            v-model:search="tripStopLocationSearch"
            :items="availableTripStopLocations"
            :item-title="locationLabel"
            item-value="id"
            label="Parada"
            placeholder="Busca por nombre, ciudad o país"
            prepend-inner-icon="mdi-map-marker-outline"
            variant="outlined"
            density="comfortable"
            no-data-text="No hay ubicaciones disponibles"
            :rules="tripStopLocationRules"
            :custom-filter="tripStopLocationFilter"
            :menu-props="{ contentClass: 'trip-location-menu', maxHeight: 330 }"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="{ ...props, title: undefined, subtitle: undefined }" class="trip-location-option">
                <template #prepend>
                  <v-avatar size="36" rounded="lg" class="trip-location-avatar">
                    <v-img :src="getImageUrl(item.raw.image || 'locations/default.jpg')" cover>
                      <template #error><v-icon size="18">mdi-map-marker-outline</v-icon></template>
                    </v-img>
                  </v-avatar>
                </template>
                <div class="trip-location-copy">
                  <strong>{{ locationLabel(item.raw) }}</strong>
                  <span>{{ locationArea(item.raw) }}</span>
                </div>
                <template #append>
                  <v-chip size="x-small" :color="item.raw.active === false ? 'grey' : 'success'" variant="tonal">
                    {{ item.raw.active === false ? 'Inactiva' : 'Activa' }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>

          <div class="trip-add-stop-section-label trip-add-stop-section-label--spaced">Secuencia del recorrido</div>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="newTripStop.stop_order"
                label="Orden"
                prepend-inner-icon="mdi-numeric"
                variant="outlined"
                density="comfortable"
                type="number"
                min="1"
                :rules="tripStopOrderRules"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="newTripStop.distance_km"
                label="Distancia"
                suffix="km"
                prepend-inner-icon="mdi-ruler"
                variant="outlined"
                density="comfortable"
                type="number"
                min="0"
                step="0.1"
                :rules="tripStopNumberRules"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="newTripStop.minutes_from_origin"
                label="Tiempo desde origen"
                suffix="min"
                prepend-inner-icon="mdi-timer-outline"
                variant="outlined"
                density="comfortable"
                type="number"
                min="0"
                :rules="tripStopNumberRules"
              />
            </v-col>
          </v-row>

          <div class="trip-add-stop-section-label trip-add-stop-section-label--spaced">Operación en la parada</div>
          <div class="trip-add-stop-switch-grid">
            <div class="trip-add-stop-switch-card">
              <div><strong>Permitir subida</strong><small>Los pasajeros pueden abordar.</small></div>
              <v-switch v-model="newTripStop.can_board" color="success" hide-details inset />
            </div>
            <div class="trip-add-stop-switch-card">
              <div><strong>Permitir bajada</strong><small>Los pasajeros pueden descender.</small></div>
              <v-switch v-model="newTripStop.can_alight" color="success" hide-details inset />
            </div>
            <div class="trip-add-stop-switch-card">
              <div><strong>Parada activa</strong><small>Disponible para nuevas ventas.</small></div>
              <v-switch v-model="newTripStop.active" color="success" hide-details inset />
            </div>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="trip-add-stop-actions">
          <v-btn variant="text" :disabled="addingTripStop" @click="closeAddTripStop">Cancelar</v-btn>
          <v-btn type="submit" :color="paleteColors.primary" variant="flat" :loading="addingTripStop" :disabled="!addTripStopValid || !newTripStop.location_id">
            {{ editingTripStopKey ? "Guardar cambios" : "Agregar parada" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="addTripFareDialog" max-width="980" persistent>
    <v-form ref="tripFareForm" v-model="addTripFareValid" @submit.prevent="addTripFare">
      <v-card class="trip-add-fare-dialog" elevation="0">
        <div class="trip-add-fare-header">
          <div class="trip-add-fare-heading">
            <div class="trip-add-fare-icon"><v-icon size="20">mdi-vector-line</v-icon></div>
            <div>
              <strong>{{ editingTripFareKey ? "Editar tramo" : "Agregar tramo" }}</strong>
              <span>{{ editingTripFareKey ? "Actualiza el tramo tarifario de este viaje" : "Incorpora un tramo tarifario al viaje" }}</span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" :disabled="addingTripFare" @click="closeAddTripFare" />
        </div>
        <v-divider />

        <v-card-text class="trip-add-fare-body">
          <div class="trip-add-fare-section-label">Recorrido del tramo</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="newTripFare.origin_route_stop_id"
                :items="tripFareOriginStops"
                :item-title="tripFareStopLabel"
                item-value="id"
                label="Origen"
                prepend-inner-icon="mdi-map-marker-up-outline"
                variant="outlined"
                density="comfortable"
                no-data-text="No hay paradas de subida disponibles"
                :rules="tripFareSelectRules"
                :menu-props="{ contentClass: 'trip-fare-stop-menu', maxHeight: 330 }"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="{ ...props, title: undefined, subtitle: undefined }"
                    :class="['trip-fare-stop-option', { 'trip-fare-stop-option--inactive': item.raw.active === false }]"
                  >
                    <div class="trip-fare-stop-copy">
                      <strong>{{ tripFareStopLabel(item.raw) }}</strong>
                      <span>{{ tripFareStopArea(item.raw) }}</span>
                    </div>
                    <template #append>
                      <v-chip v-if="item.raw.active === false" size="x-small" color="warning" variant="tonal">
                        Inactiva
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="newTripFare.destination_route_stop_id"
                :items="tripFareDestinationStops"
                :item-title="tripFareStopLabel"
                item-value="id"
                label="Destino"
                prepend-inner-icon="mdi-map-marker-down-outline"
                variant="outlined"
                density="comfortable"
                no-data-text="No hay paradas de bajada disponibles"
                :rules="tripFareSelectRules"
                :menu-props="{ contentClass: 'trip-fare-stop-menu', maxHeight: 330 }"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="{ ...props, title: undefined, subtitle: undefined }"
                    :class="['trip-fare-stop-option', { 'trip-fare-stop-option--inactive': item.raw.active === false }]"
                  >
                    <div class="trip-fare-stop-copy">
                      <strong>{{ tripFareStopLabel(item.raw) }}</strong>
                      <span>{{ tripFareStopArea(item.raw) }}</span>
                    </div>
                    <template #append>
                      <v-chip v-if="item.raw.active === false" size="x-small" color="warning" variant="tonal">
                        Inactiva
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <v-alert
            v-if="newTripFareUsesInactiveStop"
            type="warning"
            variant="tonal"
            density="compact"
            class="trip-fare-inactive-warning"
            prepend-icon="mdi-alert-outline"
          >
            Este tramo no estará disponible para la venta mientras su origen o destino esté inactivo.
          </v-alert>

          <div class="trip-add-fare-section-label trip-add-fare-section-label--spaced">Precio y vigencia</div>
          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="newTripFare.base_price"
                label="Precio base"
                prefix="$"
                prepend-inner-icon="mdi-cash"
                variant="outlined"
                density="comfortable"
                type="number"
                min="0"
                :rules="tripFareNumberRules"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="newTripFare.valid_from"
                label="Vigente desde"
                prepend-inner-icon="mdi-calendar-start"
                variant="outlined"
                density="comfortable"
                type="date"
                :min="todayYmd"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="newTripFare.valid_to"
                label="Vigente hasta"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                density="comfortable"
                type="date"
                :min="newTripFare.valid_from || todayYmd"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="newTripFare.priority"
                label="Prioridad"
                prepend-inner-icon="mdi-sort-numeric-ascending"
                variant="outlined"
                density="comfortable"
                type="number"
                min="1"
                :rules="tripFarePriorityRules"
              />
            </v-col>
          </v-row>

          <div class="trip-add-fare-active-control">
            <div><strong>Estado del tramo</strong><small>Los tramos inactivos no estarán disponibles para nuevas ventas.</small></div>
            <div class="trip-add-fare-active-toggle">
              <span>{{ newTripFare.active ? "Activo" : "Inactivo" }}</span>
              <v-switch v-model="newTripFare.active" color="success" hide-details inset />
            </div>
          </div>

          <div class="trip-add-fare-section-label trip-add-fare-section-label--spaced">Precios por tipo de pasajero</div>
          <div v-if="newTripFare.fareSegmentTicketTypes.length" class="trip-add-fare-ticket-editor">
            <div
              v-for="(ticketType, ticketIndex) in newTripFare.fareSegmentTicketTypes"
              :key="`new-trip-fare-ticket-${ticketType.ticket_type_id || ticketIndex}`"
              class="trip-add-fare-ticket-row"
            >
              <div class="trip-add-fare-ticket-name">
                <v-icon size="17">mdi-ticket-outline</v-icon>
                <strong>{{ ticketType.ticketTypeName || "Tipo de pasajero" }}</strong>
              </div>
              <v-text-field
                v-model.number="ticketType.base_price"
                label="Precio"
                prefix="$"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="tripFareTicketPriceRules(ticketType)"
                :disabled="ticketType.active === false"
              />
              <div class="trip-add-fare-ticket-status" :class="ticketType.active !== false ? 'enabled-text' : 'disabled-text'">
                <span>{{ ticketType.active !== false ? "Habilitado" : "Deshabilitado" }}</span>
                <v-switch v-model="ticketType.active" color="success" hide-details inset />
              </div>
            </div>
          </div>
          <div v-else class="trip-add-fare-empty-types">
            <v-icon size="22">mdi-ticket-off-outline</v-icon>
            No hay tipos de pasajero disponibles.
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="trip-add-fare-actions">
          <v-btn variant="text" :disabled="addingTripFare" @click="closeAddTripFare">Cancelar</v-btn>
          <v-btn type="submit" :color="paleteColors.primary" variant="flat" :loading="addingTripFare" :disabled="!addTripFareValid">
            {{ editingTripFareKey ? "Guardar cambios" : "Crear tramo" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="430px" persistent>
    <v-card class="trip-delete-dialog" elevation="0">
      <div class="trip-delete-icon"><v-icon size="27">mdi-bus-alert</v-icon></div>
      <div class="trip-delete-title">Eliminar viaje</div>
      <div class="trip-delete-message">¿Deseas eliminar el viaje seleccionado? Esta acción no se puede deshacer.</div>
      <div class="trip-delete-actions">
        <v-btn variant="text" class="trip-cancel-button" @click="closeDelete">Cancelar</v-btn>
        <v-btn class="trip-delete-button" elevation="0" @click="deleteItemConfirm">Eliminar</v-btn>
      </div>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogAssignedWorkers" max-width="400px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="busgo-dialog-card trip-worker-dialog">
        <v-toolbar class="trip-worker-dialog-toolbar" color="transparent">
          <span class="text-subtitle-2 ml-4">
            Asignar trabajadores al viaje
          </span><v-spacer /><v-btn icon="mdi-close" variant="text" size="small" @click="closeAssignedWorker" />
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="selectedWorker"
                  :items="dialogAssignableWorkers"
                  label="Personas"
                  prepend-inner-icon="mdi-account-search-outline"
                  item-title="workerName"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  :menu-props="{ contentClass: 'trip-worker-menu' }"
                  :rules="selectRules"
                >
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="getImageUrl(item.raw.workerImage)"
                      :title="item.raw.workerName"
                    >
                      <v-list-item-subtitle class="d-flex flex-column">
                        <div>Rol: {{ item.raw.roleName }}</div>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions class="busgo-dialog-actions">
          <v-spacer />

          <v-btn
            :color="paleteColors.gris"
            variant="flat"
            @click="closeAssignedWorker"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="saveAssignedWorker()"
            :disabled="!valid"
          >
                    {{ editedIndex === -1 ? 'Crear viaje' : 'Guardar cambios' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import _ from "lodash";
import BusgoChip from "@/components/BusgoChip.vue";
import SaleModeChip from "@/components/SaleModeChip.vue";
import {
  getTicketTemplatesForSaleMode,
  isTicketTemplateCompatibleWithTripType,
  normalizeTripType,
  ticketTemplateTripTypeLabel,
} from "@/services/ticketTemplateService";
import {
  getSaleModeLabel as getSharedSaleModeLabel,
  normalizeSaleMode as normalizeSharedSaleMode,
} from "@/utils/saleMode";
export default {
  components: { BusgoChip, SaleModeChip },
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
    dialog: false,
    timeMenu: false,
    dialogDelete: false,
    estimated: 0,
    mostrarFila: false,
    permissions: "",
    trips: [],
    tripSortBy: "date",
    tripSortOrder: "desc",
    routes: [],
    vehicles: [],
    workers: [],
    branches: [],
    saleModes: [{ id: "normal", name: "Venta Full" }],
    ticketTemplates: [],
    ticketTypes: [],
    ticketTemplateSelection: [],
    ticketTemplateSelectionManual: false,
    filteredWorkers: [],
    workerSearch: "",
    locations: [],
    tripClientKeySequence: 0,
    tripStopRows: [],
    tripStopSearch: "",
    tripStopLocationSearch: "",
    addTripStopDialog: false,
    editingTripStopKey: "",
    addTripStopValid: false,
    addingTripStop: false,
    newTripStop: {
      location_id: "",
      stop_order: 1,
      distance_km: 0,
      minutes_from_origin: 0,
      can_board: true,
      can_alight: true,
      active: true,
    },
    tripFareRows: [],
    tripSegments: [],
    tripFareSearch: "",
    expandedTripFareIds: [],
    addTripFareDialog: false,
    editingTripFareKey: "",
    addTripFareValid: false,
    addingTripFare: false,
    newTripFare: {
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
      fareSegmentTicketTypes: [],
    },
    data: {},
    selectedWorker: "",
    route: "",
    branch_id: "",
    step: 1,
    items: [
      "Datos Generales",
      "Paradas",
      "Tramos y tipos de pasaje",
      "Asignar Trabajadores",
    ],
    dialogAssignedWorkers: false,
    headers: [
      { title: "Código", value: "code" },
      { title: "Ruta", value: "routeCode" },
      { title: "Origen", value: "origin" },
      { title: "Destino", value: "destination" },
      { title: "Vehículo", value: "vehicleName" },
      { title: "Fecha", value: "date" },
      { title: "Hora Programada", value: "schedule" },
      { title: "Modo", value: "saleMode" },
      { title: "Salida", value: "start" },
      { title: "Llegada estimada", value: "arrival" },
      { title: "Acciones", value: "actions", sortable: false, width: "10%" },
    ],

    headersWorkers: [
      { title: "Nombre", value: "workerName", width: "60%" },
      { title: "Rol", value: "roleName", width: "20%" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
    ],
    tripStopsHeaders: [
      { title: "Parada", value: "locationName", width: "40%" },
      { title: "Subir", value: "can_board", width: "12%" },
      { title: "Bajar", value: "can_alight", width: "12%" },
      { title: "Activa", value: "active", width: "12%" },
      { title: "Asociar al viaje", value: "included", width: "17%" },
      { title: "Editar", value: "actions", width: "7%" },
    ],
    tripFaresHeaders: [
      { title: "Origen", value: "originLabel", width: "24%" },
      { title: "Destino", value: "destinationLabel", width: "24%" },
      { title: "Precio base", value: "base_price", width: "12%" },
      { title: "Vigencia", value: "valid_from", width: "16%" },
      { title: "Estado", value: "active", width: "8%" },
      { title: "Asociar", value: "included", width: "14%" },
      { title: "Tipos", value: "actions", sortable: false, width: "2%" },
    ],

    editedItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      date: "",
      schedule: "",
      arrival: "",
      start: "",
      end: "",
      saleMode: "normal",
      ticket_template_id: null,
      workers: [],
      tripStops: [],
      tripSegments: [],
      tripFares: [],
    },
    originalItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      date: "",
      schedule: "",
      arrival: "",
      start: "",
      end: "",
      saleMode: "normal",
      ticket_template_id: null,
      workers: [],
      tripStops: [],
      tripSegments: [],
      tripFares: [],
    },
    defaultItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      date: "",
      schedule: "",
      arrival: "",
      start: "",
      end: "",
      saleMode: "normal",
      ticket_template_id: null,
      workers: [],
      tripStops: [],
      tripSegments: [],
      tripFares: [],
    },
    editedIndex: -1,
    search: "",
    menu: false,
    menu2: false,
    input: null,
    input2: null,
    tab: null,
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    timeRules: [
      (v) => !!v || "Selecciona la hora de salida",
      (v) =>
        !v || /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v) ||
        "Ingresa una hora válida en formato 24 horas",
    ],
  }),
  computed: {
    sortedTrips() {
      return [...(this.trips || [])].sort((a, b) => this.compareTrips(a, b));
    },
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Viaje" : "Editar Viaje";
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
    timeHours() {
      return Array.from({ length: 24 }, (_, hour) =>
        String(hour).padStart(2, "0")
      );
    },
    timeMinutes() {
      return Array.from({ length: 60 }, (_, minute) =>
        String(minute).padStart(2, "0")
      );
    },
    scheduleHour() {
      return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(this.editedItem.schedule || "")
        ? this.editedItem.schedule.slice(0, 2)
        : "00";
    },
    scheduleMinute() {
      return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(this.editedItem.schedule || "")
        ? this.editedItem.schedule.slice(3, 5)
        : "00";
    },
    vehicleWorkers() {
      const selectedVehicleId = Number(this.editedItem.vehicle_id);

      if (!Number.isFinite(selectedVehicleId) || selectedVehicleId <= 0) {
        return [];
      }

      const selectedVehicle = (this.vehicles || []).find(
        (vehicle) => Number(vehicle.id) === selectedVehicleId
      );

      return Array.isArray(selectedVehicle?.workers)
        ? selectedVehicle.workers
        : [];
    },
    dialogAssignableWorkers() {
      return (this.vehicleWorkers || []).filter(
        (worker) =>
          !this.editedItem.workers.some(
            (editedWorker) => Number(editedWorker.id) === Number(worker.id)
          )
      );
    },
    selectedRouteRecord() {
      return (
        this.getRoutesCollection().find(
          (route) => Number(route.id) === Number(this.editedItem.route_id)
        ) || null
      );
    },
    todayYmd() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
    },
    tripFareStops() {
      return (Array.isArray(this.tripStopRows) ? this.tripStopRows : [])
        .filter((stop) => stop?.included)
        .map((stop) => ({
          ...stop,
          id: this.getTripStopReference(stop),
        }));
    },
    tripFareOriginStops() {
      return this.tripFareStops.filter(
        (stop) =>
          (this.isTripStopInactive(stop) || stop.can_board !== false) &&
          Number(stop.id ?? stop.route_stop_id) !== Number(this.newTripFare.destination_route_stop_id)
      );
    },
    tripFareDestinationStops() {
      return this.tripFareStops.filter(
        (stop) =>
          (this.isTripStopInactive(stop) || stop.can_alight !== false) &&
          Number(stop.id ?? stop.route_stop_id) !== Number(this.newTripFare.origin_route_stop_id)
      );
    },
    newTripFareUsesInactiveStop() {
      const selectedIds = [
        this.newTripFare.origin_route_stop_id,
        this.newTripFare.destination_route_stop_id,
      ].filter((id) => id !== null && id !== undefined && id !== "");

      return this.tripFareStops.some(
        (stop) => selectedIds.map(String).includes(String(this.getTripStopReference(stop))) && this.isTripStopInactive(stop)
      );
    },
    tripFareUsesInactiveStop() {
      return (fare = {}) => {
        const references = [
          this.getTripFareSegmentStopId(fare, "origin"),
          this.getTripFareSegmentStopId(fare, "destination"),
        ].filter((reference) => reference !== null && reference !== undefined && reference !== "");

        return references.some((reference) => {
          const stop = this.getTripStopByReference(reference);
          return stop && this.isTripStopInactive(stop);
        });
      };
    },
    filteredTripStopRows() {
      const query = String(this.tripStopSearch ?? "").trim().toLowerCase();
      if (!query) return Array.isArray(this.tripStopRows) ? this.tripStopRows : [];

      return (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).filter((stop) =>
        [stop.locationName, stop.locationCity, stop.locationCountry, stop.stop_order]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    },
    filteredTripFareRows() {
      const query = String(this.tripFareSearch ?? "").trim().toLowerCase();
      if (!query) return Array.isArray(this.tripFareRows) ? this.tripFareRows : [];

      return (Array.isArray(this.tripFareRows) ? this.tripFareRows : []).filter((fare) =>
        [fare.originLabel, fare.destinationLabel, fare.base_price, fare.valid_from, fare.valid_to]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    },
    tripWorkersForDisplay() {
      const query = String(this.workerSearch ?? "").trim().toLowerCase();
      if (!query) return Array.isArray(this.filteredWorkers) ? this.filteredWorkers : [];

      return (Array.isArray(this.filteredWorkers) ? this.filteredWorkers : []).filter((worker) =>
        [worker.workerName, worker.roleName]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    },
    tripFareSelectRules() {
      return [(value) => !!value || "Debes seleccionar una parada"];
    },
    tripFareNumberRules() {
      return [
        (value) => value !== null && value !== undefined && value !== "" || "El precio es requerido",
        (value) => Number.isFinite(Number(value)) || "Debe ser un número válido",
        (value) => Number(value) >= 0 || "No puede ser negativo",
      ];
    },
    tripFarePriorityRules() {
      return [
        (value) => Number.isFinite(Number(value)) || "Debe ser un número válido",
        (value) => Number(value) >= 1 || "Debe ser mayor o igual a 1",
      ];
    },
    availableTripStopLocations() {
      const editingStop = (Array.isArray(this.tripStopRows) ? this.tripStopRows : [])
        .find((stop) => this.getTripStopRowKey(stop) === String(this.editingTripStopKey));
      const editingLocationId = editingStop?.location_id;
      const usedLocationIds = new Set(
        (Array.isArray(this.tripStopRows) ? this.tripStopRows : [])
          .filter((stop) => this.getTripStopRowKey(stop) !== String(this.editingTripStopKey))
          .map((stop) => stop?.location_id)
          .filter((locationId) => locationId !== null && locationId !== undefined && locationId !== "")
          .map((locationId) => String(locationId))
      );

      return (Array.isArray(this.locations) ? this.locations : []).filter(
        (location) =>
          String(location.id) === String(editingLocationId) ||
          !usedLocationIds.has(String(location.id))
      );
    },
    tripStopOrderRules() {
      return [
        (value) => value !== null && value !== undefined && value !== "" || "El orden es requerido",
        (value) => Number.isFinite(Number(value)) || "Debe ser un número válido",
        (value) => Number(value) >= 1 || "Debe ser mayor o igual a 1",
        (value) => !this.hasTripStopDuplicateOrder(value, this.editingTripStopKey) || "Ya existe una parada con ese orden",
      ];
    },
    tripStopLocationRules() {
      return [
        (value) => !!value || "Selecciona una ubicación",
        (value) => !this.hasTripStopLocation(value, this.editingTripStopKey) || "Esta ubicación ya está asociada al viaje",
      ];
    },
    tripStopNumberRules() {
      return [
        (value) => value !== null && value !== undefined && value !== "" || "El campo es requerido",
        (value) => Number.isFinite(Number(value)) || "Debe ser un número válido",
        (value) => Number(value) >= 0 || "No puede ser negativo",
      ];
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.permissions = LocalStorageService.getItem("permissions");
    this.mostrarFila = this.hasPermission("view_trips_company");
    if (!this.mostrarFila) this.branch_id = LocalStorageService.getItem("branch_id");
    this.showBranches();
  },
  watch: {
    // Observar cambios en la fecha para resetear selecciÃ³n
    "editedItem.date"(newDate) {
      this.syncTripStopTimes();
      if (newDate && this.editedItem.schedule) {
        this.updateArrival();
      }
    },
  },
  methods: {
    toArray(value) {
      return Array.isArray(value)
        ? value
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
    },
    getRoutesCollection() {
      return Array.isArray(this.routes) ? this.routes : Object.values(this.routes || {});
    },
    normalizeTripLocation(location = {}) {
      return {
        ...location,
        id: location.id ?? location.location_id ?? location.locationId ?? "",
        address: location.address ?? location.name ?? "",
        city: location.city ?? "",
        country: location.country ?? "",
        image: location.image ?? "locations/default.jpg",
        active: this.normalizeTripBoolean(location.active, true),
      };
    },
    locationLabel(location = {}) {
      return location.address || location.name || "Sin nombre";
    },
    locationArea(location = {}) {
      return [location.city, location.country].filter(Boolean).join(", ") || "Sin localidad";
    },
    normalizeTripTicketType(ticketType = {}) {
      return {
        ...ticketType,
        id: ticketType.id ?? ticketType.ticket_type_id ?? ticketType.ticketTypeId ?? "",
        name: ticketType.name ?? ticketType.ticketTypeName ?? ticketType.ticket_type_name ?? "",
        description: ticketType.description ?? "",
        active: this.normalizeTripBoolean(ticketType.active, true),
      };
    },
    normalizeTripTicketTypes(ticketTypes = []) {
      return this.toArray(ticketTypes)
        .filter(Boolean)
        .map((ticketType) => this.normalizeTripTicketType(ticketType));
    },
    normalizeTripFareTicketTypes(ticketTypes = [], { preserveFareId = false } = {}) {
      return this.toArray(ticketTypes)
        .filter(Boolean)
        .map((ticketType) => {
          const nestedType = ticketType.ticketType ?? ticketType.ticket_type ?? {};
          const ticketTypeId =
            ticketType.ticket_type_id ??
            ticketType.ticketTypeId ??
            nestedType.id ??
            ticketType.type_id ??
            "";
          const definition = (Array.isArray(this.ticketTypes) ? this.ticketTypes : []).find(
            (item) => String(item.id) === String(ticketTypeId)
          );

          return {
            ...ticketType,
            id:
              preserveFareId
                ? ticketType.id ?? ticketType.trip_fare_id ?? ticketType.tripFareId ?? ""
                : ticketType.fare_segment_ticket_type_id ??
                  ticketType.fareSegmentTicketTypeId ??
                  ticketType.id ??
                  "",
            ticket_type_id: ticketTypeId,
            ticketTypeName:
              ticketType.ticketTypeName ??
              ticketType.ticket_type_name ??
              nestedType.name ??
              definition?.name ??
              ticketType.name ??
              "",
            base_price:
              ticketType.base_price ??
              ticketType.basePrice ??
              ticketType.price ??
              0,
            active: this.normalizeTripBoolean(ticketType.active, true),
          };
        });
    },
    getTripFareRelationInfo(fare = {}) {
      const relation =
        fare?.fareSegmentTicketType ??
        fare?.fare_segment_ticket_type ??
        {};
      const nestedTicketType = relation.ticketType ?? relation.ticket_type ?? {};
      const fareSegment = relation.fareSegment ?? relation.fare_segment ?? {};

      return {
        relationId:
          fare?.fare_segment_ticket_type_id ??
          fare?.fareSegmentTicketTypeId ??
          relation.id ??
          null,
        ticketTypeId:
          fare?.ticket_type_id ??
          fare?.ticketTypeId ??
          relation.ticket_type_id ??
          relation.ticketTypeId ??
          nestedTicketType.id ??
          null,
        fareSegmentId:
          fare?.fare_segment_id ??
          fare?.fareSegmentId ??
          relation.fare_segment_id ??
          relation.fareSegmentId ??
          fareSegment.id ??
          null,
      };
    },
    getRouteFareTicketTypeInfo(ticketType = {}) {
      const relation =
        ticketType?.fareSegmentTicketType ??
        ticketType?.fare_segment_ticket_type ??
        {};
      const nestedTicketType = ticketType.ticketType ?? ticketType.ticket_type ?? {};
      const fareSegment = relation.fareSegment ?? relation.fare_segment ?? {};

      return {
        relationId:
          ticketType?.fare_segment_ticket_type_id ??
          ticketType?.fareSegmentTicketTypeId ??
          ticketType?.id ??
          relation.id ??
          null,
        explicitRelationId:
          ticketType?.fare_segment_ticket_type_id ??
          ticketType?.fareSegmentTicketTypeId ??
          relation.id ??
          null,
        ticketTypeId:
          ticketType?.ticket_type_id ??
          ticketType?.ticketTypeId ??
          nestedTicketType.id ??
          ticketType?.type_id ??
          null,
        fareSegmentId:
          ticketType?.fare_segment_id ??
          ticketType?.fareSegmentId ??
          relation.fare_segment_id ??
          relation.fareSegmentId ??
          fareSegment.id ??
          null,
      };
    },
    findLegacyTripFare(fareSegment, ticketType, legacyTripFares = []) {
      const routeSegmentId =
        fareSegment?.id ?? fareSegment?.fare_segment_id ?? fareSegment?.fareSegmentId ?? null;
      const routeInfo = this.getRouteFareTicketTypeInfo(ticketType);

      const sameValue = (left, right) =>
        left !== null &&
        left !== undefined &&
        left !== "" &&
        right !== null &&
        right !== undefined &&
        right !== "" &&
        String(left) === String(right);

      const candidates = this.toArray(legacyTripFares);
      const byExplicitRelationId = candidates.find((fare) => {
        const fareInfo = this.getTripFareRelationInfo(fare);
        return (
          routeInfo.explicitRelationId !== null &&
          routeInfo.explicitRelationId !== undefined &&
          routeInfo.explicitRelationId !== "" &&
          sameValue(fareInfo.relationId, routeInfo.explicitRelationId)
        );
      });

      if (byExplicitRelationId) {
        return byExplicitRelationId;
      }

      const bySegmentAndTicketType = candidates.find((fare) => {
        const fareInfo = this.getTripFareRelationInfo(fare);
        return (
          sameValue(fareInfo.fareSegmentId, routeSegmentId) &&
          sameValue(fareInfo.ticketTypeId, routeInfo.ticketTypeId)
        );
      });

      if (bySegmentAndTicketType) {
        return bySegmentAndTicketType;
      }

      return candidates.find((fare) => {
        const fareInfo = this.getTripFareRelationInfo(fare);
        return (
          sameValue(fareInfo.fareSegmentId, routeSegmentId) &&
          sameValue(fareInfo.relationId, routeInfo.relationId)
        );
      }) || null;
    },
    getNewTripFareTicketTypes() {
      return (Array.isArray(this.ticketTypes) ? this.ticketTypes : []).map((ticketType) => ({
        id: "",
        ticket_type_id: ticketType.id,
        ticketTypeName: ticketType.name,
        base_price: 0,
        active: ticketType.active !== false,
      }));
    },
    createTripClientKey(prefix) {
      this.tripClientKeySequence += 1;
      return `${prefix}_${Date.now()}_${this.tripClientKeySequence}`;
    },
    getTripStopRowKey(stop = {}) {
      return String(
        stop.client_key ||
        stop.clientKey ||
        stop.id ||
        `${stop.route_stop_id || "route"}-${stop.location_id || "location"}`
      );
    },
    getTripFareFormStopReference(reference) {
      const stop = this.getTripStopByReference(reference);
      return stop ? this.getTripStopReference(stop) : reference;
    },
    isEditableTripStop(stop = {}) {
      return Boolean(stop);
    },
    isEditableTripFare(fare = {}) {
      return Boolean(fare);
    },
    isUnsavedTripStop(stop = {}) {
      return Boolean(
        !stop.id &&
        (stop.is_trip_specific === true || stop.source_type === "manual")
      );
    },
    isUnsavedTripFare(fare = {}) {
      return Boolean(
        !fare.id &&
        (fare.direct === true ||
          fare.is_trip_specific === true ||
          fare.source_type === "manual")
      );
    },
    isRouteFareCatalogRow(fare = {}) {
      return Boolean(
        fare &&
        fare.direct !== true &&
        fare.is_trip_specific !== true &&
        fare.origin_trip_stop_id === undefined &&
        fare.destination_trip_stop_id === undefined &&
        fare.origin_stop_key === undefined &&
        fare.destination_stop_key === undefined
      );
    },
    ensureTripFareStopsIncluded(fare = {}) {
      const references = [
        this.getTripFareSegmentStopId(fare, "origin"),
        this.getTripFareSegmentStopId(fare, "destination"),
      ].filter((reference) => reference !== null && reference !== undefined && reference !== "");

      if (!references.length) {
        return false;
      }

      let changed = false;
      this.tripStopRows = (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).map((stop) => {
        const isEndpoint = references.some((reference) =>
          this.tripStopMatchesReference(stop, reference)
        );

        if (isEndpoint && stop.included !== true) {
          changed = true;
          return { ...stop, included: true };
        }

        return stop;
      });

      if (changed) {
        this.editedItem.tripStops = this.normalizeTripStopsPayload(this.tripStopRows);
      }

      return changed;
    },
    prepareTripFareAssociation(fare = {}) {
      if (!fare || fare.included !== true || !this.isRouteFareCatalogRow(fare)) {
        return fare;
      }

      const sourceFareSegmentId =
        fare.source_fare_segment_id ??
        fare.sourceFareSegmentId ??
        fare.id ??
        fare.fare_segment_id ??
        fare.fareSegmentId;
      if (sourceFareSegmentId === null || sourceFareSegmentId === undefined || sourceFareSegmentId === "") {
        return fare;
      }

      const clientKey =
        fare.client_key ??
        fare.clientKey ??
        fare.segment_key ??
        fare.segmentKey ??
        `segment_route_${sourceFareSegmentId}`;

      Object.assign(fare, {
        source_fare_segment_id: sourceFareSegmentId,
        client_key: clientKey,
        segment_key: clientKey,
        pendingDirectAssociation: true,
        direct: true,
        is_trip_specific: true,
        source_type: fare.source_type || "auto",
      });

      return fare;
    },
    tripFareSegmentUsesStop(segment = {}, stop = {}) {
      const stopReferences = [
        this.getTripStopReference(stop),
        stop.client_key,
        stop.clientKey,
        stop.id,
      ].filter((value) => value !== null && value !== undefined && value !== "");

      return ["origin", "destination"].some((side) => {
        const segmentReference = this.getTripFareSegmentStopId(segment, side);
        return stopReferences.some(
          (stopReference) =>
            segmentReference !== null &&
            segmentReference !== undefined &&
            segmentReference !== "" &&
            String(segmentReference) === String(stopReference)
        );
      });
    },
    getTripStopReference(stop = {}) {
      const routeStopId = stop.route_stop_id ?? stop.routeStopId;
      if (routeStopId !== null && routeStopId !== undefined && routeStopId !== "") {
        return routeStopId;
      }

      const tripStopId = stop.trip_stop_id ?? stop.tripStopId ?? stop.id;
      if (tripStopId !== null && tripStopId !== undefined && tripStopId !== "") {
        return tripStopId;
      }

      return stop.client_key ?? stop.clientKey ?? stop.stop_key ?? null;
    },
    getTripStopClientKey(stop = {}) {
      const explicitKey = stop.client_key ?? stop.clientKey ?? stop.stop_key;
      if (explicitKey !== null && explicitKey !== undefined && explicitKey !== "") {
        return explicitKey;
      }

      const routeStopId = stop.route_stop_id ?? stop.routeStopId;
      if (routeStopId !== null && routeStopId !== undefined && routeStopId !== "") {
        return `stop_route_${routeStopId}`;
      }

      const locationId =
        stop.location_id ??
        stop.locationId ??
        stop.location?.id ??
        stop.locationData?.id ??
        "";
      const matchingRouteStop = this.toArray(this.selectedRouteRecord?.routeStops).find((routeStop) =>
        String(
          routeStop?.location_id ??
          routeStop?.locationId ??
          routeStop?.location?.id ??
          ""
        ) === String(locationId) && locationId !== ""
      );
      const matchingRouteStopId =
        matchingRouteStop?.id ??
        matchingRouteStop?.route_stop_id ??
        matchingRouteStop?.routeStopId;
      if (matchingRouteStopId !== null && matchingRouteStopId !== undefined && matchingRouteStopId !== "") {
        return `stop_route_${matchingRouteStopId}`;
      }

      const tripStopId = stop.trip_stop_id ?? stop.tripStopId ?? stop.id;
      return tripStopId !== null && tripStopId !== undefined && tripStopId !== ""
        ? `stop_${tripStopId}`
        : "";
    },
    tripStopMatchesReference(stop = {}, reference) {
      if (reference === null || reference === undefined || reference === "") {
        return false;
      }

      const matchesDirectReference = [
        this.getTripStopReference(stop),
        stop.client_key,
        stop.clientKey,
        stop.route_stop_id,
        stop.routeStopId,
        stop.id,
      ].some((value) => value !== null && value !== undefined && value !== "" && String(value) === String(reference));

      if (matchesDirectReference) {
        return true;
      }

      const routeStop = this.toArray(this.selectedRouteRecord?.routeStops).find((item) =>
        String(item?.id ?? item?.route_stop_id ?? item?.routeStopId ?? "") === String(reference)
      );
      const routeLocationId =
        routeStop?.location_id ??
        routeStop?.locationId ??
        routeStop?.location?.id ??
        "";
      const stopLocationId =
        stop?.location_id ??
        stop?.locationId ??
        stop?.location?.id ??
        stop?.locationData?.id ??
        "";

      return routeLocationId !== "" &&
        stopLocationId !== "" &&
        String(routeLocationId) === String(stopLocationId);
    },
    tripFareStopLabel(stop = {}) {
      if (typeof stop === "string" || typeof stop === "number") {
        if (typeof stop === "number") {
          const resolvedStop = this.getTripStopByReference(stop);
          if (resolvedStop && resolvedStop !== stop) {
            return this.tripFareStopLabel(resolvedStop);
          }
        }

        return String(stop);
      }

      const name = stop.locationName || stop.location?.address || stop.address || stop.name || "Sin nombre";
      return `${stop.stop_order ?? "-"}. ${name}`;
    },
    tripFareStopArea(stop = {}) {
      return [
        stop.locationCity || stop.location?.city || stop.city,
        stop.locationCountry || stop.location?.country || stop.country,
      ].filter(Boolean).join(", ") || "Sin localidad";
    },
    tripFareTicketPriceRules(ticketType) {
      return [
        (value) => ticketType.active === false || (value !== "" && value !== null && value !== undefined) || "El precio es obligatorio",
        (value) => ticketType.active === false || Number.isFinite(Number(value)) || "Debe ser un número válido",
        (value) => ticketType.active === false || Number(value) >= 0 || "No puede ser negativo",
      ];
    },
    resetNewTripFare() {
      this.newTripFare = {
        origin_route_stop_id: "",
        destination_route_stop_id: "",
        base_price: 0,
        currency: "CLP",
        valid_from: "",
        valid_to: "",
        priority: 1,
        active: true,
        fareSegmentTicketTypes: this.getNewTripFareTicketTypes(),
      };
      this.addTripFareValid = false;
    },
    openAddTripFare() {
      if (!this.editedItem.route_id) {
        this.showAlert("warning", "Selecciona una ruta antes de agregar un tramo.", 3000);
        return;
      }

      this.editingTripFareKey = "";
      this.resetNewTripFare();
      this.addTripFareDialog = true;
      this.$nextTick(() => this.$refs.tripFareForm?.resetValidation());
    },
    openEditTripFare(fare) {
      if (!fare || !this.isEditableTripFare(fare)) return;

      this.editingTripFareKey = this.tripFareRowKey(fare);
      this.newTripFare = {
        origin_route_stop_id: this.getTripFareFormStopReference(
          this.getTripFareSegmentStopId(fare, "origin")
        ),
        destination_route_stop_id: this.getTripFareFormStopReference(
          this.getTripFareSegmentStopId(fare, "destination")
        ),
        base_price: Number(fare.base_price) || 0,
        currency: fare.currency || "CLP",
        valid_from: fare.valid_from || "",
        valid_to: fare.valid_to || "",
        priority: Number(fare.priority) || 1,
        active: fare.active !== false,
        fareSegmentTicketTypes: this.toArray(fare.fareSegmentTicketTypes).map((ticketType) => ({
          ...ticketType,
          base_price: Number(ticketType.base_price ?? ticketType.price) || 0,
          price: Number(ticketType.price ?? ticketType.base_price) || 0,
          active: ticketType.active !== false,
        })),
      };
      this.addTripFareDialog = true;
      this.$nextTick(() => this.$refs.tripFareForm?.resetValidation());
    },
    closeAddTripFare() {
      if (this.addingTripFare) return;

      this.addTripFareDialog = false;
      this.editingTripFareKey = "";
      this.$nextTick(() => {
        this.resetNewTripFare();
        this.$refs.tripFareForm?.resetValidation();
      });
    },
    hasTripFareDuplicateSegment(originId, destinationId, ignoredKey = "") {
      const currentSegments = Array.isArray(this.tripFareRows) ? this.tripFareRows : [];
      return currentSegments.some(
        (segment) =>
          this.tripFareRowKey(segment) !== String(ignoredKey) &&
          String(this.getTripFareSegmentStopId(segment, "origin")) === String(originId) &&
          String(this.getTripFareSegmentStopId(segment, "destination")) === String(destinationId)
      );
    },
    async addTripFare() {
      const validation = await this.$refs.tripFareForm?.validate();
      if (!validation?.valid || !this.validateNewTripFare()) return;

      const origin = this.tripFareStops.find(
        (stop) => String(this.getTripStopReference(stop)) === String(this.newTripFare.origin_route_stop_id)
      );
      const destination = this.tripFareStops.find(
        (stop) => String(this.getTripStopReference(stop)) === String(this.newTripFare.destination_route_stop_id)
      );
      const editingKey = this.editingTripFareKey;
      const existingSegment = editingKey
        ? this.tripFareRows.find((row) => this.tripFareRowKey(row) === String(editingKey))
        : null;
      const clientKey = existingSegment?.client_key || existingSegment?.segment_key || this.createTripClientKey("segment");
      const ticketRelations = this.newTripFare.fareSegmentTicketTypes.map((ticketType) => {
        const price = Number(ticketType.base_price) || 0;
        return {
          id: ticketType.id || "",
          ticket_type_id: ticketType.ticket_type_id,
          base_price: price,
          price,
          active: ticketType.active !== false,
          ticketTypeName: ticketType.ticketTypeName || "",
        };
      });
      const segment = {
        ...(existingSegment || {}),
        id: "",
        client_key: clientKey,
        segment_key: clientKey,
        route_id: this.editedItem.route_id,
        origin_route_stop_id: this.newTripFare.origin_route_stop_id,
        destination_route_stop_id: this.newTripFare.destination_route_stop_id,
        origin_stop_key: origin?.client_key || null,
        destination_stop_key: destination?.client_key || null,
        base_price: Number(this.newTripFare.base_price) || 0,
        currency: "CLP",
        valid_from: this.newTripFare.valid_from,
        valid_to: this.newTripFare.valid_to,
        priority: Number(this.newTripFare.priority) || 1,
        active: !!this.newTripFare.active,
        source_type: "manual",
        is_trip_specific: true,
        direct: true,
        included: true,
        originRouteStop: origin || null,
        destinationRouteStop: destination || null,
        originLabel: this.tripFareStopLabel(origin || {}),
        destinationLabel: this.tripFareStopLabel(destination || {}),
        fareSegmentTicketTypes: ticketRelations,
      };
      if (
        existingSegment?.id &&
        this.isTripSpecificFareSegment(existingSegment) &&
        existingSegment.pendingDirectAssociation !== true
      ) {
        segment.id = existingSegment.id;
      }

      this.addingTripFare = true;
      try {
        const nextFareRows = [...(Array.isArray(this.tripFareRows) ? this.tripFareRows : [])];
        const fareRowIndex = editingKey
          ? nextFareRows.findIndex((row) => this.tripFareRowKey(row) === String(editingKey))
          : -1;
        if (fareRowIndex >= 0) {
          nextFareRows.splice(fareRowIndex, 1, segment);
        } else {
          nextFareRows.push(segment);
        }

        const nextTripSegments = [...(Array.isArray(this.tripSegments) ? this.tripSegments : [])];
        const segmentIndex = editingKey
          ? nextTripSegments.findIndex((row) => this.tripFareRowKey(row) === String(editingKey))
          : -1;
        if (segmentIndex >= 0) {
          nextTripSegments.splice(segmentIndex, 1, segment);
        } else {
          nextTripSegments.push(segment);
        }

        this.tripSegments = nextTripSegments;
        this.editedItem.tripSegments = this.tripSegments;
        this.tripFareRows = nextFareRows.sort(
          (a, b) => Number(a.priority ?? 1) - Number(b.priority ?? 1)
        );
        this.editedItem.tripFares = this.normalizeTripFaresPayload(this.tripFareRows);

        this.addTripFareDialog = false;
        this.editingTripFareKey = "";
        this.resetNewTripFare();
        this.$nextTick(() => this.$refs.tripFareForm?.resetValidation());
        this.showAlert(
          "success",
          `${editingKey ? "Tramo actualizado" : "Tramo agregado al viaje"}. Se guardará al confirmar.`,
          3000
        );
      } catch (error) {
        this.showAlert("error", "No fue posible agregar el tramo al viaje.", 3000);
      } finally {
        this.addingTripFare = false;
      }
    },
    validateNewTripFare() {
      const origin = this.tripFareStops.find(
        (stop) => String(this.getTripStopReference(stop)) === String(this.newTripFare.origin_route_stop_id)
      );
      const destination = this.tripFareStops.find(
        (stop) => String(this.getTripStopReference(stop)) === String(this.newTripFare.destination_route_stop_id)
      );

      if (!origin || !destination) {
        this.showAlert("warning", "Selecciona un origen y un destino válidos.", 3000);
        return false;
      }

      if (Number(origin.stop_order) >= Number(destination.stop_order)) {
        this.showAlert("warning", "El origen debe estar antes que el destino.", 3000);
        return false;
      }

      if (this.hasTripFareDuplicateSegment(
        this.getTripStopReference(origin),
        this.getTripStopReference(destination),
        this.editingTripFareKey
      )) {
        this.showAlert("warning", "Ya existe un tramo con ese origen y destino.", 3000);
        return false;
      }

      if (
        this.newTripFare.valid_from &&
        this.newTripFare.valid_to &&
        this.newTripFare.valid_from > this.newTripFare.valid_to
      ) {
        this.showAlert("warning", "La fecha inicial no puede superar la fecha final.", 3000);
        return false;
      }

      if (
        this.newTripFare.fareSegmentTicketTypes.some(
          (ticketType) =>
            ticketType.active !== false &&
            (ticketType.base_price === "" ||
              ticketType.base_price === null ||
              ticketType.base_price === undefined ||
              !Number.isFinite(Number(ticketType.base_price)) ||
              Number(ticketType.base_price) < 0)
        )
      ) {
        this.showAlert("warning", "Cada tipo habilitado debe tener un precio válido.", 3000);
        return false;
      }

      return true;
    },
    tripStopLocationFilter(value, query, item) {
      const search = String(query ?? "").trim().toLowerCase();
      if (!search) return 1;

      const location = item?.raw ?? item ?? {};
      const searchable = [
        value,
        location.address,
        location.city,
        location.country,
      ].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(search) ? 1 : -1;
    },
    getNextTripStopOrder() {
      const orders = (Array.isArray(this.tripStopRows) ? this.tripStopRows : [])
        .map((stop) => Number(stop?.stop_order))
        .filter((order) => Number.isFinite(order) && order > 0);

      return orders.length ? Math.max(...orders) + 1 : 1;
    },
    hasTripStopLocation(locationId, ignoredKey = "") {
      if (locationId === null || locationId === undefined || locationId === "") {
        return false;
      }

      return (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).some(
        (stop) =>
          this.getTripStopRowKey(stop) !== String(ignoredKey) &&
          String(stop?.location_id) === String(locationId)
      );
    },
    hasTripStopDuplicateOrder(order, ignoredKey = "") {
      const normalizedOrder = Number(order);
      if (!Number.isFinite(normalizedOrder)) return false;

      return (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).some(
        (stop) =>
          this.getTripStopRowKey(stop) !== String(ignoredKey) &&
          Number(stop?.stop_order) === normalizedOrder
      );
    },
    resetNewTripStop() {
      this.newTripStop = {
        location_id: "",
        stop_order: this.getNextTripStopOrder(),
        distance_km: 0,
        minutes_from_origin: 0,
        can_board: true,
        can_alight: true,
        active: true,
      };
      this.tripStopLocationSearch = "";
      this.addTripStopValid = false;
    },
    openAddTripStop() {
      if (!this.editedItem.route_id) {
        this.showAlert("warning", "Selecciona una ruta antes de agregar una parada.", 3000);
        return;
      }

      this.editingTripStopKey = "";
      this.resetNewTripStop();
      this.addTripStopDialog = true;
      this.$nextTick(() => this.$refs.tripStopForm?.resetValidation());
    },
    openEditTripStop(stop) {
      if (!stop || !this.isEditableTripStop(stop)) return;

      this.editingTripStopKey = this.getTripStopRowKey(stop);
      this.newTripStop = {
        location_id: stop.location_id ?? stop.location?.id ?? "",
        stop_order: Number(stop.stop_order) || 1,
        distance_km: Number(stop.distance_km) || 0,
        minutes_from_origin: Number(stop.minutes_from_origin) || 0,
        can_board: stop.can_board !== false,
        can_alight: stop.can_alight !== false,
        active: stop.active !== false,
      };
      this.tripStopLocationSearch = "";
      this.addTripStopDialog = true;
      this.$nextTick(() => this.$refs.tripStopForm?.resetValidation());
    },
    closeAddTripStop() {
      if (this.addingTripStop) return;

      this.addTripStopDialog = false;
      this.editingTripStopKey = "";
      this.$nextTick(() => {
        this.resetNewTripStop();
        this.$refs.tripStopForm?.resetValidation();
      });
    },
    async addTripStop() {
      const validation = await this.$refs.tripStopForm?.validate();
      if (!validation?.valid) return;

      const location = (Array.isArray(this.locations) ? this.locations : []).find(
        (item) => String(item.id) === String(this.newTripStop.location_id)
      );

      if (!location) {
        this.showAlert("warning", "Selecciona una ubicación válida.", 3000);
        return;
      }

      if (this.hasTripStopLocation(location.id, this.editingTripStopKey)) {
        this.showAlert("warning", "Esta ubicación ya está asociada al viaje.", 3000);
        return;
      }

      if (this.hasTripStopDuplicateOrder(this.newTripStop.stop_order, this.editingTripStopKey)) {
        this.showAlert("warning", "Ya existe una parada con ese orden.", 3000);
        return;
      }

      const stopOrder = Number(this.newTripStop.stop_order);
      const minutesFromOrigin = Number(this.newTripStop.minutes_from_origin) || 0;
      const editingKey = this.editingTripStopKey;
      const existingStop = editingKey
        ? this.tripStopRows.find((row) => this.getTripStopRowKey(row) === String(editingKey))
        : null;
      const clientKey = existingStop?.client_key || existingStop?.clientKey || this.createTripClientKey("stop");
      const tripStopRow = {
        ...(existingStop || {}),
        id: "",
        client_key: clientKey,
        route_stop_id: existingStop?.id
          ? (existingStop.route_stop_id ?? existingStop.routeStopId ?? null)
          : null,
        route_id: existingStop?.route_id ?? this.editedItem.route_id,
        location_id: location.id,
        stop_order: stopOrder,
        distance_km: Number(this.newTripStop.distance_km) || 0,
        minutes_from_origin: minutesFromOrigin,
        can_board: !!this.newTripStop.can_board,
        can_alight: !!this.newTripStop.can_alight,
        allows_boarding: !!this.newTripStop.can_board,
        allows_alighting: !!this.newTripStop.can_alight,
        active: !!this.newTripStop.active,
        source_type: "manual",
        is_trip_specific: true,
        included: true,
        locationName: location.address || location.name || "",
        locationCity: location.city || "",
        locationCountry: location.country || "",
        locationImage: location.image || "locations/default.jpg",
      };
      if (existingStop?.id) {
        tripStopRow.id = existingStop.id;
      }

      this.addingTripStop = true;
      try {
        const nextTripStops = [...(Array.isArray(this.tripStopRows) ? this.tripStopRows : [])];
        const stopIndex = editingKey
          ? nextTripStops.findIndex((row) => this.getTripStopRowKey(row) === String(editingKey))
          : -1;
        if (stopIndex >= 0) {
          nextTripStops.splice(stopIndex, 1, tripStopRow);
        } else {
          nextTripStops.push(tripStopRow);
        }

        this.tripStopRows = nextTripStops.sort(
          (a, b) => Number(a.stop_order) - Number(b.stop_order)
        );
        this.editedItem.tripStops = this.normalizeTripStopsPayload(this.tripStopRows);

        this.addTripStopDialog = false;
        this.editingTripStopKey = "";
        this.resetNewTripStop();
        this.$nextTick(() => this.$refs.tripStopForm?.resetValidation());
        this.showAlert(
          "success",
          `${editingKey ? "Parada actualizada" : "Parada agregada al viaje"}. Se guardará al confirmar.`,
          3000
        );
      } catch (error) {
        this.showAlert("error", "No fue posible agregar la parada al viaje.", 3000);
      } finally {
        this.addingTripStop = false;
      }
    },
    normalizeTripWorkerRecord(worker = {}) {
      const workerId = worker.id ?? worker.workerId ?? worker.worker_id;

      return {
        ...worker,
        id: workerId,
        workerId: worker.workerId ?? worker.worker_id ?? workerId,
        worker_id: worker.worker_id ?? worker.workerId ?? workerId,
        workerName: worker.workerName ?? worker.name ?? "",
        workerImage: worker.workerImage ?? worker.image ?? "workers/default.jpg",
        roleId: worker.roleId ?? worker.role_id,
        roleName: worker.roleName ?? worker.role ?? "",
      };
    },
    normalizeTripWorkersList(workers = []) {
      return (Array.isArray(workers) ? workers : []).map((worker) =>
        this.normalizeTripWorkerRecord(worker)
      );
    },
    normalizeTripVehicles(vehicles = []) {
      const vehicleList = Array.isArray(vehicles)
        ? vehicles
        : Object.values(vehicles || {});

      return vehicleList.filter(Boolean).map((vehicle) => ({
        ...vehicle,
        workers: this.normalizeTripWorkersList(vehicle.workers),
      }));
    },
    toggleTripSort(field) {
      if (this.tripSortBy === field) {
        this.tripSortOrder = this.tripSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.tripSortBy = field;
      this.tripSortOrder = "asc";
    },
    tripSortIcon(field) {
      if (this.tripSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.tripSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    getTripSortValue(trip, field) {
      if (!trip) {
        return "";
      }

      if (field === "vehicleName") {
        return trip.vehicleName || trip.plate || "";
      }

      if (field === "saleMode") {
        return this.normalizeTripSaleMode(trip);
      }

      if (field === "arrival") {
        return trip.arrival || trip.end || "";
      }

      return trip[field] ?? "";
    },
    getDefaultSaleMode() {
      return this.saleModes[0]?.id || "normal";
    },
    normalizeTripSaleMode(trip = {}) {
      return normalizeSharedSaleMode(trip);
    },
    normalizeSaleModeOption(mode = {}) {
      const id = normalizeSharedSaleMode(mode.id || mode.value || "normal");
      return {
        ...mode,
        id,
        name:
          id === "on_board"
            ? getSharedSaleModeLabel(id)
            : String(id).toLowerCase() === "normal"
              ? "Venta Full"
              : mode.name,
      };
    },
    normalizeSaleModeOptions(modes = []) {
      const source = Array.isArray(modes) && modes.length
        ? modes
        : [{ id: "normal", name: "Venta Full" }];
      return source.map((mode) => this.normalizeSaleModeOption(mode));
    },
    getSaleModeName(trip = {}) {
      return `Venta ${getSharedSaleModeLabel(trip)}`;
    },
    ensureTripSaleMode({ useDefault = false } = {}) {
      if (useDefault || !this.editedItem.saleMode) {
        this.editedItem.saleMode = this.getDefaultSaleMode();
      }
    },
    ticketTemplateOptionSubtitle(template = {}) {
      const defaults = Array.isArray(template.defaultTripTypes) && template.defaultTripTypes.length
        ? `Predeterminada para: ${template.defaultTripTypes.map(ticketTemplateTripTypeLabel).join(", ")}`
        : `Tipo: ${ticketTemplateTripTypeLabel(template.tripType)}`;
      return `${defaults} · Activa`;
    },
    isSystemTicketTemplate(template = {}) {
      const source = template?.ticket_template
        ?? template?.ticketTemplate
        ?? template;
      return normalizeTripType(source?.trip_type ?? source?.tripType) === "system";
    },
    syncTripTicketTemplatesWithSaleMode() {
      this.ticketTemplates = getTicketTemplatesForSaleMode(this.saleModes, this.editedItem.saleMode);
    },
    isDefaultTicketTemplate(template = {}) {
      const defaultTemplate = this.ticketTemplates[0];
      return String(defaultTemplate?.id) === String(template.id);
    },
    applyDefaultTripTicketTemplate() {
      const defaultTemplate = this.ticketTemplates[0];
      const id = defaultTemplate?.id ?? null;
      this.ticketTemplateSelectionManual = false;
      this.editedItem.ticket_template_id = id;
      this.ticketTemplateSelection = id === null ? [] : [id];
    },
    syncTripTicketTemplateWithSaleMode() {
      if (this.isSystemTicketTemplate(this.originalItem) && !this.ticketTemplateSelectionManual) {
        return;
      }

      const currentTemplate = this.ticketTemplates.find(
        (template) => String(template.id) === String(this.editedItem.ticket_template_id),
      );

      if (isTicketTemplateCompatibleWithTripType(currentTemplate, this.editedItem.saleMode)) {
        return;
      }

      this.applyDefaultTripTicketTemplate();
    },
    ensureTripTicketTemplateSelection({ useDefault = false } = {}) {
      if (useDefault) this.ticketTemplateSelectionManual = false;

      if (!useDefault && this.isSystemTicketTemplate(this.originalItem)) {
        this.ticketTemplateSelection = [];
        this.ticketTemplateSelectionManual = false;
        return;
      }

      if (!useDefault && this.editedItem.ticket_template_id !== null && this.editedItem.ticket_template_id !== undefined && this.editedItem.ticket_template_id !== "") {
        this.ticketTemplateSelection = [this.editedItem.ticket_template_id];
        this.ticketTemplateSelectionManual = true;
        return;
      }

      if (!this.ticketTemplateSelectionManual) this.applyDefaultTripTicketTemplate();
    },
    onTripSaleModeChange() {
      this.syncTripTicketTemplatesWithSaleMode();
      this.syncTripTicketTemplateWithSaleMode();
    },
    onTripTicketTemplateChange(selection) {
      const ids = Array.isArray(selection)
        ? selection
        : selection === null || selection === undefined || selection === ""
          ? []
          : [selection];
      const id = ids.length ? ids[ids.length - 1] : null;

      if (id === null) {
        if (this.isSystemTicketTemplate(this.originalItem)) {
          this.editedItem.ticket_template_id = this.originalItem.ticket_template_id;
          this.ticketTemplateSelection = [];
          this.ticketTemplateSelectionManual = false;
          return;
        }

        const currentId = this.editedItem.ticket_template_id;
        this.ticketTemplateSelection = currentId === null || currentId === undefined || currentId === ""
          ? []
          : [currentId];
        return;
      }

      this.ticketTemplateSelection = id === null ? [] : [id];
      this.editedItem.ticket_template_id = id;
      this.ticketTemplateSelectionManual = id !== null;
    },
    compareTrips(a, b) {
      const direction = this.tripSortOrder === "asc" ? 1 : -1;
      const aValue = this.getTripSortValue(a, this.tripSortBy);
      const bValue = this.getTripSortValue(b, this.tripSortBy);

      const aEmpty = aValue === null || aValue === undefined || aValue === "";
      const bEmpty = bValue === null || bValue === undefined || bValue === "";

      if (aEmpty && bEmpty) {
        return 0;
      }

      if (aEmpty) {
        return 1;
      }

      if (bEmpty) {
        return -1;
      }

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
        return (aNumber - bNumber) * direction;
      }

      return (
        String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase(), "es", {
          sensitivity: "base",
        }) * direction
      );
    },
    getRouteStopDisplayLabel(stop) {
      if (!stop) {
        return "";
      }

      if (typeof stop === "string" || typeof stop === "number") {
        const numericReference = Number(stop);
        if (Number.isFinite(numericReference)) {
          const resolvedStop = this.getTripStopByReference(numericReference);
          if (resolvedStop && resolvedStop !== stop) {
            return this.getRouteStopDisplayLabel(resolvedStop.location || resolvedStop);
          }
        }
        return String(stop);
      }

      return (
        stop.location?.address || stop.locationName || stop.address || stop.name || "-"
      );
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
    tripFareTicketTypeKey(ticketType, index) {
      return ticketType.id || ticketType.fare_segment_ticket_type_id || index;
    },
    tripFareRowKey(item = {}) {
      return String(
        item.id ||
        item.client_key ||
        `${this.getTripFareSegmentStopId(item, "origin")}-${this.getTripFareSegmentStopId(item, "destination")}`
      );
    },
    isTripFareExpanded(item) {
      return this.expandedTripFareIds.includes(this.tripFareRowKey(item));
    },
    toggleTripFareExpanded(item) {
      const itemKey = this.tripFareRowKey(item);
      if (!itemKey || itemKey === "-") {
        return;
      }

      this.expandedTripFareIds = this.expandedTripFareIds[0] === itemKey ? [] : [itemKey];
    },
    normalizeTripBoolean(value, fallback = false) {
      if (value === undefined || value === null || value === "") {
        return fallback;
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["false", "0", "no", "inactive", "inactivo"].includes(normalized)) {
          return false;
        }
        if (["true", "1", "yes", "active", "activo"].includes(normalized)) {
          return true;
        }
      }

      return Boolean(value);
    },
    isTripStopInactive(stop = {}) {
      return !this.normalizeTripBoolean(
        stop?.active ?? stop?.is_active ?? stop?.isActive,
        true
      );
    },
    getSelectedTripId() {
      return this.editedItem?.id ?? this.originalItem?.id ?? "";
    },
    isTripRelationFromSelectedTrip(relation = {}, { allowUnsaved = true } = {}) {
      const selectedTripId = this.getSelectedTripId();
      if (selectedTripId === null || selectedTripId === undefined || selectedTripId === "") {
        return true;
      }

      const relationTripId = relation?.trip_id ?? relation?.tripId;
      if (relationTripId !== null && relationTripId !== undefined && relationTripId !== "") {
        return Number(relationTripId) === Number(selectedTripId);
      }

      return allowUnsaved && !relation?.id;
    },
    filterTripRelationsForSelectedTrip(relations = []) {
      return this.toArray(relations).filter((relation) =>
        this.isTripRelationFromSelectedTrip(relation, { allowUnsaved: false })
      );
    },
    getTripFareSegmentStopId(segment, side) {
      const nestedStop = side === "origin"
        ? segment?.originTripStop ??
          segment?.origin_trip_stop ??
          segment?.originRouteStop ??
          segment?.origin_route_stop
        : segment?.destinationTripStop ??
          segment?.destination_trip_stop ??
          segment?.destinationRouteStop ??
          segment?.destination_route_stop;

      return segment?.[`${side}_stop_key`]
        ?? segment?.[`${side}StopKey`]
        ?? segment?.[`${side}_trip_stop_id`]
        ?? segment?.[`${side}TripStopId`]
        ?? segment?.[`${side}_route_stop_id`]
        ?? segment?.[`${side}RouteStopId`]
        ?? nestedStop?.id
        ?? nestedStop?.route_stop_id
        ?? null;
    },
    isTripFareSegmentEligible(
      segment,
      tripStops = this.tripStopRows,
      { allowInactive = false } = {}
    ) {
      const selectedRouteId = this.editedItem.route_id ?? this.selectedRouteRecord?.id;
      const segmentRouteId = segment?.route_id ?? segment?.routeId;
      if (
        segmentRouteId !== undefined &&
        segmentRouteId !== null &&
        selectedRouteId !== undefined &&
        selectedRouteId !== null &&
        Number(segmentRouteId) !== Number(selectedRouteId)
      ) {
        return false;
      }

      if (!allowInactive && !this.normalizeTripBoolean(
        segment?.active ?? segment?.is_active ?? segment?.isActive,
        true
      )) {
        return false;
      }

      const includedStops = (Array.isArray(tripStops) ? tripStops : [])
        .filter((stop) => stop?.included);
      const stopReferences = includedStops.map((stop) => String(this.getTripStopReference(stop)));
      if (new Set(stopReferences).size !== stopReferences.length) {
        return false;
      }

      const originId = this.getTripFareSegmentStopId(segment, "origin");
      const destinationId = this.getTripFareSegmentStopId(segment, "destination");
      if (
        originId === null || originId === undefined || originId === "" ||
        destinationId === null || destinationId === undefined || destinationId === "" ||
        String(originId) === String(destinationId)
      ) {
        return false;
      }

      const originStop = includedStops.find(
        (stop) => this.tripStopMatchesReference(stop, originId)
      );
      const destinationStop = includedStops.find(
        (stop) => this.tripStopMatchesReference(stop, destinationId)
      );
      if (!originStop || !destinationStop) {
        return false;
      }

      return Number(originStop.stop_order) < Number(destinationStop.stop_order);
    },
    isTripFareSegmentDisplayable(segment) {
      const selectedRouteId = this.editedItem.route_id ?? this.selectedRouteRecord?.id;
      const segmentRouteId = segment?.route_id ?? segment?.routeId;
      if (
        segmentRouteId !== undefined &&
        segmentRouteId !== null &&
        selectedRouteId !== undefined &&
        selectedRouteId !== null &&
        Number(segmentRouteId) !== Number(selectedRouteId)
      ) {
        return false;
      }

      const originId = this.getTripFareSegmentStopId(segment, "origin");
      const destinationId = this.getTripFareSegmentStopId(segment, "destination");
      return Boolean(
        originId !== null && originId !== undefined && originId !== "" &&
        destinationId !== null && destinationId !== undefined && destinationId !== "" &&
        String(originId) !== String(destinationId)
      );
    },
    isTripSpecificFareSegment(segment = {}) {
      const hasValue = (value) =>
        value !== undefined && value !== null && value !== "";

      return Boolean(
        segment.direct === true ||
        segment.is_trip_specific === true ||
        segment.pendingDirectAssociation === true ||
        hasValue(segment.origin_trip_stop_id) ||
        hasValue(segment.destination_trip_stop_id) ||
        hasValue(segment.origin_stop_key) ||
        hasValue(segment.destination_stop_key) ||
        hasValue(segment.trip_segment_id) ||
        hasValue(segment.tripSegmentId)
      );
    },
    buildTripDirectFareRows(tripSegments = [], tripFares = []) {
      const directFareList = this.toArray(tripFares).filter((fare) =>
        (fare?.trip_segment_id !== undefined || fare?.tripSegmentId !== undefined) &&
        this.isTripRelationFromSelectedTrip(fare)
      );

      return this.toArray(tripSegments)
        .filter((segment) => this.isTripRelationFromSelectedTrip(segment))
        .filter((segment) => this.isTripSpecificFareSegment(segment))
        .filter((segment) => this.isTripFareSegmentDisplayable(segment))
        .map((segment) => {
          const segmentId = segment.id ?? segment.trip_segment_id ?? segment.tripSegmentId ?? "";
          const segmentKey = segment.client_key ?? segment.segment_key ?? segment.segmentKey ?? "";
          const segmentFares = directFareList.filter((fare) =>
            segmentId !== ""
              ? String(fare.trip_segment_id ?? fare.tripSegmentId) === String(segmentId)
              : String(fare.segment_key ?? fare.segmentKey) === String(segmentKey)
          );
          const nestedFares = this.toArray(
            segment.tripFares ?? segment.trip_fares ?? segment.fareSegmentTicketTypes
          );
          const relations = this.normalizeTripFareTicketTypes(
            segmentFares.length ? segmentFares : nestedFares,
            { preserveFareId: true }
          );
          const originReference = this.getTripFareSegmentStopId(segment, "origin");
          const destinationReference = this.getTripFareSegmentStopId(segment, "destination");
          const originStop = this.getTripStopByReference(originReference) || this.tripFareStops.find(
            (stop) => this.tripStopMatchesReference(stop, originReference)
          ) || segment.originTripStop || segment.origin_trip_stop || segment.originRouteStop || segment.origin_route_stop || null;
          const destinationStop = this.getTripStopByReference(destinationReference) || this.tripFareStops.find(
            (stop) => this.tripStopMatchesReference(stop, destinationReference)
          ) || segment.destinationTripStop || segment.destination_trip_stop || segment.destinationRouteStop || segment.destination_route_stop || null;

          return {
            ...segment,
            id: segment.id ?? segment.trip_segment_id ?? "",
            trip_segment_id: segment.trip_segment_id ?? segment.tripSegmentId ?? segment.id ?? "",
            client_key: segmentKey,
            segment_key: segmentKey,
            origin_route_stop_id: originReference,
            destination_route_stop_id: destinationReference,
            originRouteStop: originStop || segment.originRouteStop || null,
            destinationRouteStop: destinationStop || segment.destinationRouteStop || null,
            originLabel: this.tripFareStopLabel(originStop || segment.originRouteStop || {}),
            destinationLabel: this.tripFareStopLabel(destinationStop || segment.destinationRouteStop || {}),
            base_price:
              segment.base_price ??
              segment.basePrice ??
              relations.find((relation) => relation.active !== false)?.price ??
              relations.find((relation) => relation.active !== false)?.base_price ??
              0,
            fareSegmentTicketTypes: relations,
            source_type: segment.source_type || "manual",
            is_trip_specific: true,
            direct: true,
            included: true,
          };
        });
    },
    buildTripFareRows(route = null, tripFares = [], forceIncludeAll = false) {
      const selectedRoute = route || this.selectedRouteRecord;
      const fareSegments = Array.isArray(selectedRoute?.fareSegments)
        ? selectedRoute.fareSegments
        : Array.isArray(selectedRoute?.fare_segments)
          ? selectedRoute.fare_segments
          : [];

      const scopedTripFares = this.filterTripRelationsForSelectedTrip(tripFares);
      const legacyTripFares = scopedTripFares.filter(
        (fare) => {
          const tripSegmentId = fare?.trip_segment_id ?? fare?.tripSegmentId;
          return tripSegmentId === undefined || tripSegmentId === null || tripSegmentId === "";
        }
      );

      const routeRows = fareSegments
        .filter((segment) => this.isTripFareSegmentDisplayable(segment))
        .filter((segment) => {
          const routeSegmentId = segment?.id ?? segment?.fare_segment_id;
          return !this.toArray(this.editedItem.tripSegments).some(
            (tripSegment) =>
              tripSegment?.source_fare_segment_id !== undefined &&
              String(tripSegment.source_fare_segment_id) === String(routeSegmentId)
          );
        })
        .map((segment) => {
        const originStop =
          segment.originRouteStop ??
          segment.origin_route_stop ??
          (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).find(
            (stop) => Number(stop.route_stop_id) === Number(this.getTripFareSegmentStopId(segment, "origin"))
          ) ??
          null;
        const destinationStop =
          segment.destinationRouteStop ??
          segment.destination_route_stop ??
          (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).find(
            (stop) => Number(stop.route_stop_id) === Number(this.getTripFareSegmentStopId(segment, "destination"))
          ) ??
          null;
        const ticketTypes = this.normalizeTripFareTicketTypes(
          segment.fareSegmentTicketTypes ?? segment.fare_segment_ticket_types ?? []
        );
        const existingFares = ticketTypes.map((ticketType) => ({
          ticketType,
          fare: this.findLegacyTripFare(segment, ticketType, legacyTripFares),
        }));
        const hasExistingFare = existingFares.some(({ fare }) => Boolean(fare));
        const segmentEligible = this.isTripFareSegmentEligible(segment);

        return {
          ...segment,
          originLabel: this.getRouteStopDisplayLabel(
            originStop?.location || originStop || segment.originStop
          ),
          destinationLabel: this.getRouteStopDisplayLabel(
            destinationStop?.location || destinationStop || segment.destinationStop
          ),
          direct: false,
          is_trip_specific: false,
          pendingDirectAssociation: false,
          fareSegmentTicketTypes: existingFares.map(({ ticketType, fare: existingFare }) => {
            const routeInfo = this.getRouteFareTicketTypeInfo(ticketType);
            const existingInfo = existingFare
              ? this.getTripFareRelationInfo(existingFare)
              : {};
            const routeActive = this.normalizeTripBoolean(
              ticketType.active ??
                ticketType.ticketTypeActive ??
                ticketType.ticketType?.active,
              true
            );

            return {
              id: existingFare?.id || "",
              fare_segment_ticket_type_id:
                existingInfo.relationId ?? routeInfo.relationId ?? "",
              ticket_type_id: existingInfo.ticketTypeId ?? routeInfo.ticketTypeId ?? "",
              base_price: Number(
                existingFare?.base_price ??
                  existingFare?.basePrice ??
                  existingFare?.fareSegmentTicketType?.base_price ??
                  existingFare?.fare_segment_ticket_type?.base_price ??
                  ticketType.base_price ??
                  ticketType.basePrice ??
                  0
              ) || 0,
              price:
                existingFare?.price ?? ticketType.base_price ?? ticketType.basePrice ?? 0,
              active: existingFare?.active ?? routeActive,
              source_type: existingFare?.source_type || "auto",
              ticketTypeName:
                ticketType.ticketTypeName ||
                ticketType.ticketType?.name ||
                ticketType.name ||
                "",
            };
          }),
          included: segmentEligible && (forceIncludeAll || hasExistingFare),
          };
        });

      const directRows = this.buildTripDirectFareRows(
        this.editedItem.tripSegments,
        scopedTripFares
      );

      return [...routeRows, ...directRows];
    },
    syncTripFareRows(forceIncludeAll = false) {
      const route = this.selectedRouteRecord;
      if (!route) {
        this.tripFareRows = [];
        this.expandedTripFareIds = [];
        return;
      }

      const tripFares = Array.isArray(this.editedItem.tripFares)
        ? this.editedItem.tripFares
        : [];
      const shouldIncludeAll =
        forceIncludeAll ||
        this.editedIndex === -1 ||
        Number(this.originalItem.route_id) !== Number(this.editedItem.route_id);

      this.tripFareRows = this.buildTripFareRows(route, tripFares, shouldIncludeAll);
      this.expandedTripFareIds = [];
    },
    isTripFareSegmentReadyForPayload(segment = {}) {
      if (!segment?.included || !this.isTripSpecificFareSegment(segment)) {
        return false;
      }

      if (this.isTripFareSegmentEligible(segment, this.tripStopRows, { allowInactive: true })) {
        return true;
      }

      const originReference = this.getTripFareSegmentStopId(segment, "origin");
      const destinationReference = this.getTripFareSegmentStopId(segment, "destination");

      return Boolean(
        segment.pendingDirectAssociation === true &&
        originReference !== null &&
        originReference !== undefined &&
        originReference !== "" &&
        destinationReference !== null &&
        destinationReference !== undefined &&
        destinationReference !== "" &&
        String(originReference) !== String(destinationReference)
      );
    },
    isLegacyTripFareSegmentReadyForPayload(segment = {}) {
      return Boolean(
        segment?.included !== false &&
        !this.isTripSpecificFareSegment(segment) &&
        this.isTripFareSegmentDisplayable(segment) &&
        Array.isArray(segment?.fareSegmentTicketTypes)
      );
    },
    normalizeTripFaresPayload(rows = []) {
      const payload = [];
      const directSegmentKeys = new Set(
        this.normalizeTripSegmentsPayload(rows)
          .map((segment) => segment.client_key)
          .filter(Boolean)
          .map(String)
      );

      (Array.isArray(rows) ? rows : [])
        .filter((segment) =>
          this.isTripSpecificFareSegment(segment)
            ? this.isTripFareSegmentReadyForPayload(segment)
            : this.isLegacyTripFareSegmentReadyForPayload(segment)
        )
        .forEach((segment) => {
        if (this.isTripSpecificFareSegment(segment)) {
          (Array.isArray(segment.fareSegmentTicketTypes)
            ? segment.fareSegmentTicketTypes
            : []
          ).forEach((ticketType) => {
            const ticketTypeId = Number(
              ticketType.ticket_type_id ??
              ticketType.ticketTypeId ??
              ticketType.type_id
            );

            if (!Number.isFinite(ticketTypeId) || ticketTypeId <= 0) {
              return;
            }

            const segmentId = segment.pendingDirectAssociation
              ? ""
              : segment.id ?? segment.trip_segment_id ?? segment.tripSegmentId;
            const segmentKey = segment.client_key ?? segment.segment_key ?? segment.segmentKey;
            if (!segmentId && !segmentKey) {
              return;
            }
            const basePrice = Number(
              ticketType.base_price ?? ticketType.basePrice ?? segment.base_price ?? 0
            ) || 0;
            const item = {
              ticket_type_id: ticketTypeId,
              base_price: basePrice,
              price: Number(ticketType.price ?? basePrice) || 0,
              active: ticketType.active ?? true,
              source_type: ticketType.source_type || segment.source_type || "manual",
            };

            // El id identifica al precio del viaje, incluso cuando el tramo
            // todavía se está convirtiendo desde una asociación legacy.
            if (ticketType.id) {
              item.id = ticketType.id;
            }

            if (segmentId) {
              item.trip_segment_id = segmentId;
            } else if (segmentKey) {
              // Un segment_key solo es válido junto al tripSegment que lo
              // declara en la misma petición.
              if (!directSegmentKeys.has(String(segmentKey))) {
                return;
              }
              item.segment_key = segmentKey;
            }

            payload.push(item);
          });
          return;
        }

        (Array.isArray(segment.fareSegmentTicketTypes)
          ? segment.fareSegmentTicketTypes
          : []
        ).forEach((ticketType) => {
          const fareSegmentTicketTypeId = Number(
            ticketType.fare_segment_ticket_type_id ??
            ticketType.fareSegmentTicketTypeId ??
            ticketType.id
          );

          if (!Number.isFinite(fareSegmentTicketTypeId) || fareSegmentTicketTypeId <= 0) {
            return;
          }

          const item = {
            fare_segment_ticket_type_id: fareSegmentTicketTypeId,
            base_price:
              Number(
                ticketType.base_price ??
                  ticketType.basePrice ??
                  ticketType.price ??
                  0
              ) || 0,
            price: Number(ticketType.price) || 0,
            active: ticketType.active ?? true,
            source_type: ticketType.source_type || (ticketType.id ? "manual" : "auto"),
          };

          if (ticketType.id) {
            item.id = ticketType.id;
          }

          payload.push(item);
          });
      });

      return payload.sort((a, b) =>
        String(a.id ?? a.segment_key ?? a.fare_segment_ticket_type_id ?? "")
          .localeCompare(String(b.id ?? b.segment_key ?? b.fare_segment_ticket_type_id ?? ""))
      );
    },
    getTripSpecificUiRows(rows = []) {
      return this.toArray(rows).filter(
        (row) =>
          row?.included !== false &&
          this.isTripSpecificFareSegment(row) &&
          this.isTripRelationFromSelectedTrip(row, { allowUnsaved: true })
      );
    },
    synchronizeTripSegmentPayload(fields = {}) {
      const fares = Array.isArray(fields.tripFares) ? fields.tripFares : [];
      const hasUnresolvedSegmentReference = fares.some(
        (fare) => fare?.segment_key && !fare?.trip_segment_id
      );

      if (!hasUnresolvedSegmentReference) {
        return fields;
      }

      return {
        ...fields,
        tripSegments: this.normalizeTripSegmentsPayload(this.tripFareRows),
      };
    },
    areTripFaresDifferent(originalFares, editedRows) {
      const normalize = (rows = []) => {
        const list = this.toArray(rows);
        const isUiRows = list.some(
          (row) => row?.included !== undefined && Array.isArray(row?.fareSegmentTicketTypes)
        );

        if (isUiRows) {
          return this.normalizeTripFaresPayload(list.filter((row) => row?.included !== false)).map((item) =>
            Object.fromEntries(Object.entries(item).filter(([key]) => key !== "source_type"))
          );
        }

        return list
          .map((fare) => {
            const directSegmentId = fare?.trip_segment_id ?? fare?.tripSegmentId;
            const isDirectFare =
              directSegmentId !== undefined &&
              directSegmentId !== null &&
              directSegmentId !== "";
            if (isDirectFare) {
              const normalized = {
                  id: fare?.id ?? "",
                  trip_segment_id: directSegmentId,
                  ticket_type_id: fare?.ticket_type_id ?? fare?.ticketTypeId ?? "",
                  price: Number(fare?.price) || 0,
                  base_price: Number(fare?.base_price) || 0,
                  active: fare?.active ?? true,
                };
              const segmentKey = fare?.segment_key ?? fare?.segmentKey;
              if (segmentKey) {
                normalized.segment_key = segmentKey;
              }
              return normalized;
            }

            return {
                  id: fare?.id ?? "",
                  fare_segment_ticket_type_id:
                    fare?.fare_segment_ticket_type_id ?? fare?.fareSegmentTicketTypeId ?? "",
                  base_price: Number(fare?.base_price ?? fare?.basePrice ?? 0) || 0,
                  price: Number(fare?.price) || 0,
                  active: fare?.active ?? true,
                };
          })
          .sort((a, b) => String(a.id || a.segment_key || a.fare_segment_ticket_type_id).localeCompare(
            String(b.id || b.segment_key || b.fare_segment_ticket_type_id)
          ));
      };

      return !_.isEqual(normalize(originalFares), normalize(editedRows));
    },
    areTripSegmentsDifferent(originalSegments, editedRows) {
      const normalize = (rows = []) => {
        const list = this.toArray(rows);
        const isUiRows = list.some(
          (row) => row?.included !== undefined && Array.isArray(row?.fareSegmentTicketTypes)
        );

        if (isUiRows) {
          return this.normalizeTripSegmentsPayload(this.getTripSpecificUiRows(list)).map((item) =>
            Object.fromEntries(Object.entries(item).filter(([key]) => key !== "source_type"))
          );
        }

        return list
          .map((segment) => ({
            id: segment?.id ?? "",
            client_key: segment?.client_key ?? segment?.segment_key ?? "",
            origin_trip_stop_id: segment?.origin_trip_stop_id ?? "",
            destination_trip_stop_id: segment?.destination_trip_stop_id ?? "",
            origin_stop_key: segment?.origin_stop_key ?? "",
            destination_stop_key: segment?.destination_stop_key ?? "",
            currency: segment?.currency ?? "CLP",
            active: segment?.active ?? true,
            valid_from: segment?.valid_from || segment?.validFrom || null,
            valid_to: segment?.valid_to || segment?.validTo || null,
            priority: Number(segment?.priority ?? 0) || 0,
            source_fare_segment_id:
              segment?.source_fare_segment_id ?? segment?.sourceFareSegmentId ?? "",
          }))
          .sort((a, b) => String(a.id || a.client_key).localeCompare(String(b.id || b.client_key)));
      };

      return !_.isEqual(normalize(originalSegments), normalize(editedRows));
    },
    formatDuration(minutes) {
      if (minutes == null || minutes <= 0) return "â€”";

      const mins = Math.floor(minutes);
      const hours = Math.floor(mins / 60);
      const remainingMinutes = mins % 60;

      const parts = [];
      if (hours > 0) parts.push(`${hours} h`);
      if (remainingMinutes > 0) parts.push(`${remainingMinutes} min`);

      return parts.length ? parts.join(" ") : "0 min";
    },
    hasPermission(requiredPermissions) {
      // Si es un string, lo convertimos a array
      const perms = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Retorna true si al menos uno coincide
      return perms.some((p) => this.permissions.includes(p));
    },
    getImageUrl(imagePath) {
      return `${this.$axios.defaults.baseURL
        }images/${imagePath}?t=${this.getCacheTimestamp()}`;
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del dÃ­a actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al dÃ­a)
    },
    getCurrentTime() {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
    },
    updateScheduleHour(value) {
      this.updateSchedulePart(value, this.scheduleMinute);
    },
    updateScheduleMinute(value) {
      this.updateSchedulePart(this.scheduleHour, value);
    },
    updateSchedulePart(hour, minute) {
      const normalizePart = (value, max) => {
        const numericValue = Number(value);
        const boundedValue = Number.isFinite(numericValue)
          ? Math.min(Math.max(numericValue, 0), max)
          : 0;

        return String(boundedValue).padStart(2, "0");
      };

      this.editedItem.schedule = `${normalizePart(hour, 23)}:${normalizePart(
        minute,
        59
      )}`;
      this.updateArrival();
    },
    // MÃ©todo para verificar si un trabajador ya estÃ¡ asociado al viaje
    isWorkerAssociated(worker) {
      return this.editedItem.workers?.some((w) => w.id === worker.id);
    },
    async nextStep() {
      if (this.step < this.items.length) {
        this.step++;
      }
    },

    prevStep() {
      if (this.step > 1) {
        this.step--;
      }
    },
    getTripBaseDateTime() {
      const tripDate =
        this.editedItem.date ||
        this.dateFormatted ||
        new Date().toISOString().split("T")[0];
      const schedule = this.editedItem.schedule || "00:00";
      return `${tripDate} ${schedule.length === 5 ? `${schedule}:00` : schedule}`;
    },
    formatTripStopDateTime(baseDateTime, minutesOffset = 0) {
      const parsed = new Date(baseDateTime.replace(" ", "T"));
      if (Number.isNaN(parsed.getTime())) {
        return baseDateTime;
      }

      const adjusted = new Date(parsed.getTime() + Number(minutesOffset || 0) * 60000);
      const pad = (n) => String(n).padStart(2, "0");
      return `${adjusted.getFullYear()}-${pad(adjusted.getMonth() + 1)}-${pad(
        adjusted.getDate()
      )} ${pad(adjusted.getHours())}:${pad(adjusted.getMinutes())}:00`;
    },
    buildTripStopRows(route = null, tripStops = [], forceIncludeAll = false) {
      const selectedRoute = route || this.selectedRouteRecord;
      const rawRouteStops = Array.isArray(selectedRoute?.routeStops)
        ? selectedRoute.routeStops
        : [];
      const seenRouteStopIds = new Set();
      const routeStops = rawRouteStops.filter((routeStop) => {
        const routeStopId = Number(routeStop?.id ?? routeStop?.route_stop_id ?? routeStop?.routeStopId);
        if (!Number.isFinite(routeStopId) || seenRouteStopIds.has(routeStopId)) {
          return false;
        }
        seenRouteStopIds.add(routeStopId);
        return true;
      });
      const stopMap = new Map(
        (Array.isArray(tripStops) ? tripStops : [])
          .map((stop) => [
            Number(
              stop?.route_stop_id ??
              stop?.routeStopId ??
              stop?.routeStop?.id ??
              stop?.route_stop?.id
            ),
            stop,
          ])
          .filter(([routeStopId]) => Number.isFinite(routeStopId))
      );
      const stopLocationMap = new Map(
        (Array.isArray(tripStops) ? tripStops : [])
          .map((stop) => [
            String(
              stop?.location_id ??
              stop?.locationId ??
              stop?.location?.id ??
              stop?.locationData?.id ??
              ""
            ),
            stop,
          ])
          .filter(([locationId]) => locationId !== "")
      );
      const baseDateTime = this.getTripBaseDateTime();

      const inheritedRows = routeStops.map((routeStop) => {
        const routeStopId = routeStop.id ?? routeStop.route_stop_id ?? routeStop.routeStopId;
        const routeLocationId =
          routeStop.location_id ?? routeStop.locationId ?? routeStop.location?.id ?? "";
        const existingStop =
          stopMap.get(Number(routeStopId)) ?? stopLocationMap.get(String(routeLocationId));
        const existingStopRouteId = existingStop?.route_stop_id ?? existingStop?.routeStopId;
        const isDirectTripStop =
          existingStop &&
          (existingStopRouteId === null || existingStopRouteId === undefined || existingStopRouteId === "");
        const routeActive = this.normalizeTripBoolean(
          routeStop.active ?? routeStop.is_active ?? routeStop.isActive,
          true
        );
        const existingActive = this.normalizeTripBoolean(
          existingStop?.active ?? existingStop?.is_active ?? existingStop?.isActive,
          routeActive
        );
        const existingIncluded = this.normalizeTripBoolean(
          existingStop?.included ?? existingStop?.is_included ?? existingStop?.isIncluded,
          true
        );
        const included = (
          forceIncludeAll ? true : existingStop ? existingIncluded : false
        );
        return {
          id: existingStop?.id || "",
          client_key:
            existingStop?.client_key ||
            existingStop?.clientKey ||
            routeStop.client_key ||
            routeStop.clientKey ||
            `stop_route_${routeStopId}`,
          route_stop_id: isDirectTripStop ? null : routeStopId,
          route_id: selectedRoute?.id ?? selectedRoute?.route_id ?? this.editedItem.route_id,
          location_id:
            routeStop.location_id ||
            routeStop.locationId ||
            routeStop.location?.id ||
            "",
          companyName: routeStop.companyName || "",
          routeName: routeStop.routeName || "",
          stop_order: routeStop.stop_order ?? routeStop.stopOrder ?? 1,
          distance_km:
            existingStop?.distance_km ??
            existingStop?.distanceKm ??
            routeStop.distance_km ??
            routeStop.distanceKm ??
            0,
          minutes_from_origin:
            existingStop?.minutes_from_origin ??
            existingStop?.minutesFromOrigin ??
            routeStop.minutes_from_origin ??
            routeStop.minutesFromOrigin ??
            0,
          arrival_time:
            existingStop?.arrival_time ||
            this.formatTripStopDateTime(baseDateTime, routeStop.minutes_from_origin || 0),
          departure_time:
            existingStop?.departure_time ||
            this.formatTripStopDateTime(
              baseDateTime,
              (routeStop.minutes_from_origin || 0) + 5
            ),
          can_board: existingStop?.can_board ?? routeStop.allows_boarding ?? true,
          can_alight: existingStop?.can_alight ?? routeStop.allows_alighting ?? true,
          active: existingActive && routeActive,
          source_type: existingStop?.source_type || "auto",
          is_trip_specific: Boolean(isDirectTripStop),
          included,
          locationName:
            routeStop.locationName ||
            routeStop.location_name ||
            routeStop.location?.address ||
            routeStop.address ||
            "",
          locationCity: routeStop.locationCity || routeStop.location_city || routeStop.location?.city || "",
          locationCountry: routeStop.locationCountry || routeStop.location_country || routeStop.location?.country || "",
          locationImage:
            routeStop.image ||
            routeStop.locationImage ||
            routeStop.location?.image ||
            "locations/default.jpg",
        };
      });

      const routeStopIds = new Set(routeStops.map((routeStop) => Number(
        routeStop.id ?? routeStop.route_stop_id ?? routeStop.routeStopId
      )));
      const routeLocationIds = new Set(routeStops.map((routeStop) => String(
        routeStop.location_id ?? routeStop.locationId ?? routeStop.location?.id ?? ""
      )).filter(Boolean));
      const tripSpecificRows = (Array.isArray(tripStops) ? tripStops : [])
        .filter((stop) => {
          const routeStopId = Number(
            stop?.route_stop_id ??
            stop?.routeStopId ??
            stop?.routeStop?.id ??
            stop?.route_stop?.id
          );

          const locationId = String(
            stop?.location_id ??
            stop?.locationId ??
            stop?.location?.id ??
            stop?.locationData?.id ??
            ""
          );

          return (
            (!Number.isFinite(routeStopId) || !routeStopIds.has(routeStopId)) &&
            !routeLocationIds.has(locationId)
          );
        })
        .map((stop) => {
          const nestedLocation = stop?.location ?? stop?.locationData ?? {};
          const locationId =
            stop?.location_id ??
            stop?.locationId ??
            nestedLocation?.id ??
            "";
          const location = (Array.isArray(this.locations) ? this.locations : []).find(
            (item) => String(item.id) === String(locationId)
          );
          const minutesFromOrigin = Number(
            stop?.minutes_from_origin ?? stop?.minutesFromOrigin ?? 0
          ) || 0;
          const active = this.normalizeTripBoolean(
            stop?.active ?? stop?.is_active ?? stop?.isActive,
            true
          );

          return {
            ...stop,
            id: stop?.id || "",
            client_key: this.getTripStopClientKey(stop),
            route_stop_id: stop?.route_stop_id ?? stop?.routeStopId ?? null,
            route_id: stop?.route_id ?? stop?.routeId ?? this.editedItem.route_id,
            location_id: locationId,
            stop_order: stop?.stop_order ?? stop?.stopOrder ?? 1,
            distance_km: stop?.distance_km ?? stop?.distanceKm ?? 0,
            minutes_from_origin: minutesFromOrigin,
            arrival_time:
              stop?.arrival_time ||
              this.formatTripStopDateTime(baseDateTime, minutesFromOrigin),
            departure_time:
              stop?.departure_time ||
              this.formatTripStopDateTime(baseDateTime, minutesFromOrigin + 5),
            can_board: stop?.can_board ?? stop?.allows_boarding ?? true,
            can_alight: stop?.can_alight ?? stop?.allows_alighting ?? true,
            active,
            source_type: stop?.source_type || "manual",
            is_trip_specific: true,
            included: this.normalizeTripBoolean(
              stop?.included ?? stop?.is_included ?? stop?.isIncluded,
              true
            ),
            locationName:
              stop?.locationName ||
              stop?.location_name ||
              nestedLocation?.address ||
              location?.address ||
              stop?.address ||
              "",
            locationCity:
              stop?.locationCity ||
              stop?.location_city ||
              nestedLocation?.city ||
              location?.city ||
              "",
            locationCountry:
              stop?.locationCountry ||
              stop?.location_country ||
              nestedLocation?.country ||
              location?.country ||
              "",
            locationImage:
              stop?.locationImage ||
              stop?.location_image ||
              nestedLocation?.image ||
              location?.image ||
              "locations/default.jpg",
          };
        });

      return [...inheritedRows, ...tripSpecificRows].sort(
        (a, b) => Number(a.stop_order) - Number(b.stop_order)
      );
    },
    syncTripStopsFromRoute(forceIncludeAll = false) {
      const route = this.selectedRouteRecord;
      if (!route) {
        this.tripStopRows = [];
        this.tripFareRows = [];
        this.expandedTripFareIds = [];
        return;
      }

      const tripStops = Array.isArray(this.editedItem.tripStops)
        ? this.editedItem.tripStops
        : [];
      const shouldIncludeAll =
        forceIncludeAll ||
        this.editedIndex === -1 ||
        Number(this.originalItem.route_id) !== Number(this.editedItem.route_id);

      this.tripStopRows = this.buildTripStopRows(route, tripStops, shouldIncludeAll);
    },
    syncTripStopTimes() {
      if (!Array.isArray(this.tripStopRows) || this.tripStopRows.length === 0) {
        if (this.editedIndex === -1 && !this.editedItem.id) {
          this.editedItem.tripStops = [];
        }
        this.syncTripFareRows();
        return;
      }

      const baseDateTime = this.getTripBaseDateTime();
      this.tripStopRows = this.tripStopRows.map((row) => {
        if (!row.included) {
          return row;
        }

        const routeStop = this.selectedRouteRecord?.routeStops?.find(
          (item) => Number(item.id) === Number(row.route_stop_id)
        );
        const minutesOffset =
          row.minutes_from_origin !== undefined && row.minutes_from_origin !== null
            ? Number(row.minutes_from_origin)
            : routeStop?.minutes_from_origin || 0;

        return {
          ...row,
          arrival_time:
            row.source_type === "manual"
              ? row.arrival_time
              : this.formatTripStopDateTime(baseDateTime, minutesOffset),
          departure_time:
            row.source_type === "manual"
              ? row.departure_time
              : this.formatTripStopDateTime(baseDateTime, minutesOffset + 5),
        };
      });
      this.editedItem.tripStops = this.normalizeTripStopsPayload(this.tripStopRows);
      this.syncTripFareRows();
    },
    getTripStopByReference(reference) {
      return (Array.isArray(this.tripStopRows) ? this.tripStopRows : []).find(
        (stop) => this.tripStopMatchesReference(stop, reference)
      ) || null;
    },
    normalizeTripStopsPayload(rows = []) {
      return (Array.isArray(rows) ? rows : [])
        .filter((row) => row.included === undefined || row.included)
        .map((row) => {
          const routeStopId = row.route_stop_id ?? row.routeStopId;
          const payload = {
            route_stop_id:
              routeStopId === null || routeStopId === undefined || routeStopId === ""
                ? null
                : Number(routeStopId),
            location_id:
              row.location_id === null || row.location_id === undefined || row.location_id === ""
                ? undefined
                : Number(row.location_id),
            stop_order: Number(row.stop_order) || 1,
            distance_km: Number(row.distance_km) || 0,
            minutes_from_origin: Number(row.minutes_from_origin) || 0,
            arrival_time: row.arrival_time,
            departure_time: row.departure_time,
            can_board: !!row.can_board,
            can_alight: !!row.can_alight,
            active: row.active ?? true,
            source_type: row.source_type || "auto",
          };

          const clientKey = this.getTripStopClientKey(row);
          if (clientKey) {
            payload.client_key = clientKey;
          }

          if (row.id) {
            payload.id = row.id;
          }

          return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
          );
        })
        .sort((a, b) => Number(a.stop_order) - Number(b.stop_order));
    },
    normalizeTripSegmentsPayload(rows = []) {
      return (Array.isArray(rows) ? rows : [])
        .filter((segment) => this.isTripFareSegmentReadyForPayload(segment))
        .map((segment) => {
          const originReference = this.getTripFareSegmentStopId(segment, "origin");
          const destinationReference = this.getTripFareSegmentStopId(segment, "destination");
          const originStop = this.getTripStopByReference(originReference);
          const destinationStop = this.getTripStopByReference(destinationReference);
          const segmentId = segment.pendingDirectAssociation
            ? ""
            : segment.id ?? segment.trip_segment_id ?? segment.tripSegmentId ?? "";
          const clientKey = segment.client_key ?? segment.segment_key ?? segment.segmentKey;
          const payload = {
            currency: segment.currency || "CLP",
            active: segment.active ?? true,
            valid_from: segment.valid_from || segment.validFrom || null,
            valid_to: segment.valid_to || segment.validTo || null,
            priority: Number(segment.priority ?? 0) || 0,
            source_type: segment.source_type || "manual",
          };

          if (segmentId) {
            payload.id = segmentId;
          }
          if (clientKey) {
            payload.client_key = clientKey;
          }

          const originTripStopId = originStop?.id;
          const destinationTripStopId = destinationStop?.id;
          const canUseTripStopIds = Boolean(originTripStopId && destinationTripStopId);

          if (canUseTripStopIds) {
            payload.origin_trip_stop_id = originTripStopId;
            payload.destination_trip_stop_id = destinationTripStopId;
          } else {
            const originStopKey =
              this.getTripStopClientKey(originStop) ||
              (originReference !== null && originReference !== undefined
                ? String(originReference).startsWith("stop_")
                  ? originReference
                  : `stop_route_${originReference}`
                : originReference);
            const destinationStopKey =
              this.getTripStopClientKey(destinationStop) ||
              (destinationReference !== null && destinationReference !== undefined
                ? String(destinationReference).startsWith("stop_")
                  ? destinationReference
                  : `stop_route_${destinationReference}`
                : destinationReference);

            payload.origin_stop_key = originStopKey;
            payload.destination_stop_key = destinationStopKey;
          }

          if (segment.source_fare_segment_id) {
            payload.source_fare_segment_id = segment.source_fare_segment_id;
          }

          return payload;
        });
    },
    areTripStopsDifferent(originalStops, editedStops) {
      const normalizeForCompare = (rows = []) =>
        this.normalizeTripStopsPayload(rows || []).map((item) =>
          Object.fromEntries(
            Object.entries(item).filter(([key]) => key !== "arrival_time" && key !== "departure_time")
          )
        );

      return !_.isEqual(
        normalizeForCompare(originalStops),
        normalizeForCompare(editedStops)
      );
    },
    toggleTripStopIncluded(stop) {
      if (!stop) return;

      stop.included = !stop.included;
      this.onTripStopIncludedChange(stop);
    },
    onTripStopIncludedChange(stop) {
      if (stop?.included === false && this.isUnsavedTripStop(stop)) {
        const stopKey = this.getTripStopRowKey(stop);
        const nextTripStops = (Array.isArray(this.tripStopRows) ? this.tripStopRows : [])
          .filter((row) => this.getTripStopRowKey(row) !== stopKey);
        const nextFareRows = (Array.isArray(this.tripFareRows) ? this.tripFareRows : [])
          .map((segment) => {
            if (!this.tripFareSegmentUsesStop(segment, stop)) {
              return segment;
            }

            return this.isUnsavedTripFare(segment)
              ? null
              : { ...segment, included: false };
          })
          .filter(Boolean);

        this.tripStopRows = nextTripStops;
        this.tripFareRows = nextFareRows;
        this.tripSegments = nextFareRows.filter((segment) =>
          this.isTripSpecificFareSegment(segment)
        );
        this.editedItem.tripSegments = this.normalizeTripSegmentsPayload(nextFareRows);
        this.editedItem.tripFares = this.normalizeTripFaresPayload(nextFareRows);
      }

      this.syncTripStopTimes();
      this.$forceUpdate();
    },
    toggleTripFareIncluded(fare) {
      if (!fare) return;

      fare.included = !fare.included;
      this.onTripFareIncludedChange(fare);
    },
    onTripStopFieldChange() {
      this.syncTripStopTimes();
    },
    onTripFareIncludedChange(fare) {
      if (fare?.included === true && this.isRouteFareCatalogRow(fare)) {
        this.prepareTripFareAssociation(fare);
        this.ensureTripFareStopsIncluded(fare);

        if (this.tripFareUsesInactiveStop(fare)) {
          this.showAlert(
            "warning",
            "Tramo asociado al viaje, pero no estará disponible para venta porque una de sus paradas está inactiva.",
            4500
          );
        }
      }

      const sourceFareSegmentId = fare?.source_fare_segment_id ?? fare?.sourceFareSegmentId;
      if (fare?.included === false && sourceFareSegmentId !== undefined && sourceFareSegmentId !== null && sourceFareSegmentId !== "") {
        this.tripSegments = (Array.isArray(this.tripSegments) ? this.tripSegments : [])
          .filter((segment) =>
            String(segment?.source_fare_segment_id ?? segment?.sourceFareSegmentId) !==
            String(sourceFareSegmentId)
          );
      } else if (fare?.included === false && this.isUnsavedTripFare(fare)) {
        const fareKey = this.tripFareRowKey(fare);
        this.tripFareRows = (Array.isArray(this.tripFareRows) ? this.tripFareRows : [])
          .filter((row) => this.tripFareRowKey(row) !== fareKey);
        this.tripSegments = (Array.isArray(this.tripSegments) ? this.tripSegments : [])
          .filter((segment) => this.tripFareRowKey(segment) !== fareKey);
      }

      this.tripSegments = (Array.isArray(this.tripFareRows) ? this.tripFareRows : [])
        .filter((segment) => segment?.included && this.isTripSpecificFareSegment(segment));
      this.editedItem.tripFares = this.normalizeTripFaresPayload(this.tripFareRows);
      this.editedItem.tripSegments = this.normalizeTripSegmentsPayload(this.tripFareRows);
      this.$forceUpdate();
    },
    async showBranches() {
      try {
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = Array.isArray(result.data?.branches) ? result.data.branches : [];
          this.mostrarFila = this.hasPermission("view_trips_company") || this.branches.length > 1;
          if (this.branches.length && !this.branches.some((branch) => String(branch.id) === String(this.branch_id))) {
            this.branch_id = this.branches[0].id;
          }
          this.editedItem.branch_id = this.branch_id;
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.branches = [];
          this.mostrarFila = false;
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
        this.loading = false;
        this.initialize();
      }
    },
    // Filtramos los trabajadores segÃºn el vehÃ­culo seleccionado
    filterWorkers() {
      this.filteredWorkers = [...this.vehicleWorkers];
    },
    updateStimated() {
      this.estimated = null;
      const matchedRoute = this.selectedRouteRecord;
      // Si se encuentra el objeto, asignamos su propiedad 'estimated' a this.estimated
      this.estimated = matchedRoute ? matchedRoute.estimated : null;
      this.editedItem.arrival = null;
      if (this.editedItem.schedule) {
        this.updateArrival();
      }
      this.syncTripStopsFromRoute();
      this.syncTripFareRows();
    },
    updateArrival() {
      // ValidaciÃ³n mejorada
      if (
        !this.editedItem.schedule ||
        !this.estimated ||
        !this.editedItem.schedule.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      ) {
        this.editedItem.arrival = null;
        return;
      }

      try {
        // Usar fecha del item o fecha actual si es null
        const baseDate = this.editedItem.date
          ? new Date(this.editedItem.date + "T00:00:00")
          : new Date();

        // Extraer horas y minutos del schedule
        const [hours, minutes] = this.editedItem.schedule.split(":").map(Number);

        // Configurar la hora en la fecha base (en zona horaria local)
        const departureDate = new Date(baseDate);
        departureDate.setHours(hours, minutes, 0, 0);

        // Sumar los minutos estimados
        const arrivalDate = new Date(departureDate.getTime() + this.estimated * 60000);

        // Formatear a YYYY-MM-DD HH:MM:SS en hora local
        const pad = (n) => n.toString().padStart(2, "0");
        const formattedArrival =
          `${arrivalDate.getFullYear()}-${pad(arrivalDate.getMonth() + 1)}-${pad(
            arrivalDate.getDate()
          )} ` + `${pad(arrivalDate.getHours())}:${pad(arrivalDate.getMinutes())}:00`;

        this.editedItem.arrival = formattedArrival;
        console.log("Hora de llegada calculada:", this.editedItem.arrival);
        this.syncTripStopTimes();
      } catch (error) {
        console.error("Error calculando hora de llegada:", error);
        this.editedItem.arrival = null;
      }
    },

    updateDate(val) {
      this.input = val;
      this.editedItem.date = this.dateFormatted;
      this.menu = false;
      this.syncTripStopTimes();
    },
    updateDateSearch(val) {
      this.input2 = val;
      //this.editedItem.date = this.dateFormatted;
      this.menu2 = false;
      this.initialize();
    },
    async loadTripFormData(branchId, { resetSelections = false } = {}) {
      const normalizedBranchId = branchId ?? this.editedItem.branch_id ?? this.branch_id;
      this.data = {};
      this.data.branch_id = normalizedBranchId;

      try {
        const result = await handleRequest({
          endpoint: "get-routes-vehicle-workers",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.routes = result.data?.triproutes || [];
          this.ticketTypes = this.normalizeTripTicketTypes(
            result.data?.tickettypes ?? result.data?.ticketTypes ?? result.data?.ticket_types
          );
          this.locations = this.toArray(result.data?.locations).map((location) =>
            this.normalizeTripLocation(location)
          );
          this.vehicles = this.normalizeTripVehicles(result.data?.tripvehicles);
          this.workers = [];
          this.saleModes = this.normalizeSaleModeOptions(result.data?.saleModes);
          this.ensureTripSaleMode({ useDefault: resetSelections });
          this.syncTripTicketTemplatesWithSaleMode();

          if (resetSelections) {
            this.editedItem.route_id = "";
            this.editedItem.vehicle_id = "";
            this.editedItem.workers = [];
            this.filteredWorkers = [];
            this.tripStopRows = [];
            this.tripFareRows = [];
            this.tripSegments = [];
            this.editedItem.tripSegments = [];
            this.expandedTripFareIds = [];
            this.estimated = null;
            this.editedItem.arrival = null;
            this.editedItem.ticket_template_id = null;
            this.ticketTemplateSelection = [];
            this.ticketTemplateSelectionManual = false;
          } else {
            this.filterWorkers();
          }

          this.ensureTripTicketTemplateSelection({ useDefault: resetSelections });
        } else {
          this.routes = [];
          this.ticketTypes = [];
          this.locations = [];
          this.vehicles = [];
          this.ticketTemplates = [];
          this.ticketTemplateSelection = [];
          this.ticketTemplateSelectionManual = false;
          this.workers = [];
          this.filteredWorkers = [];
          this.saleModes = this.normalizeSaleModeOptions();
          this.ensureTripSaleMode();
        }
      } catch (error) {
        this.ticketTypes = [];
        this.locations = [];
        this.ticketTemplates = [];
        this.ticketTemplateSelection = [];
        this.ticketTemplateSelectionManual = false;
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      }
    },
    async onTripBranchChange(branchId) {
      this.editedItem.branch_id = branchId;
      await this.loadTripFormData(branchId, { resetSelections: true });
    },
    async showAdd() {
      this.step = 1;
      this.data = {};
      this.filteredWorkers = [];
      this.workerSearch = "";
      this.tripStopRows = [];
      this.tripStopSearch = "";
      this.addTripStopDialog = false;
      this.tripFareRows = [];
      this.tripSegments = [];
      this.tripFareSearch = "";
      this.addTripFareDialog = false;
      this.expandedTripFareIds = [];
      this.editedIndex = -1;
      this.dialog = false;
      this.file = null;
      this.imgMiniatura = "";
      this.editedItem = Object.assign({}, this.defaultItem, {
        schedule: this.getCurrentTime(),
      });
      this.originalItem = Object.assign({}, this.defaultItem);
      this.ticketTemplateSelection = [];
      this.ticketTemplateSelectionManual = false;
      this.editedItem.branch_id = this.branch_id;
      await this.loadTripFormData(this.editedItem.branch_id, {
        resetSelections: true,
      });
      this.syncTripStopsFromRoute(true);
      this.syncTripFareRows(true);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.addTripStopDialog = false;
      this.tripStopSearch = "";
      this.addTripFareDialog = false;
      this.tripFareSearch = "";
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.originalItem = Object.assign({}, this.defaultItem);
      });
      this.ticketTemplateSelection = [];
      this.ticketTemplateSelectionManual = false;
      this.file = null;
      this.imgMiniatura = "";
      this.editedIndex = -1;
      this.tripStopRows = [];
      this.tripFareRows = [];
      this.tripSegments = [];
      this.expandedTripFareIds = [];
    },
    async showAssiegnedWorker() {
      this.selectedWorker = null;
      this.dialogAssignedWorkers = true;
    },
    closeAssignedWorker() {
      this.dialogAssignedWorkers = false;
      this.selectedWorker = null;
    },
    saveAssignedWorker(worker = null) {
      const workerSource =
        worker ||
        this.vehicleWorkers.find((item) => Number(item.id) === Number(this.selectedWorker)) ||
        this.dialogAssignableWorkers.find(
          (item) => Number(item.id) === Number(this.selectedWorker)
        );

      const workerId = Number(workerSource?.id);

      if (!workerSource || !Number.isFinite(workerId) || workerId <= 0) {
        this.showAlert("warning", "Seleccione un trabajador válido.", 2500);
        return;
      }

      const newWorkers = {
        id: workerId,
        workerName: workerSource.workerName,
        workerImage: workerSource.workerImage,
        roleId: workerSource.roleId,
        roleName: workerSource.roleName,
      };

      const existingPersonIndex = this.editedItem.workers.findIndex(
        (p) => Number(p.id) === Number(newWorkers.id)
      );

      if (existingPersonIndex === -1) {
        this.editedItem.workers.push(newWorkers);
      } else {
        this.editedItem.workers.splice(existingPersonIndex, 1, newWorkers);
      }

      this.filterWorkers();
      this.closeAssignedWorker();
    },
    normalizeWorkersPayload(workers = []) {
      return (Array.isArray(workers) ? workers : [])
        .map((worker) => {
          const workerId = Number(worker?.id ?? worker?.worker_id ?? worker?.workerId);
          if (!Number.isFinite(workerId) || workerId <= 0) {
            return null;
          }

          return {
            worker_id: workerId,
          };
        })
        .filter(Boolean);
    },
    deleteItemWorker(item) {
      const index = this.editedItem.workers.findIndex(
        (p) => Number(p.id) === Number(item.id)
      );
      if (index !== -1) {
        this.editedItem.workers.splice(index, 1);
      }
    },
    areWorkersDifferent(originalWorkers, editedWorkers) {
      if (originalWorkers.length !== editedWorkers.length) {
        return true; // Si tienen longitudes diferentes, son diferentes
      }

      // Ordenar ambos arrays para una comparaciÃ³n consistente
      const sortedOriginal = [...originalWorkers].sort((a, b) => a.id - b.id);
      const sortedEdited = [...editedWorkers].sort((a, b) => a.id - b.id);

      // Comparar cada objeto en los arrays
      return sortedOriginal.some((original, index) => {
        const edited = sortedEdited[index];
        return Object.keys(original).some((key) => original[key] !== edited[key]);
      });
    },
    async initialize({ branchId = this.branch_id, date = this.dateFormattedSearch } = {}) {
      if (branchId === "null") {
        this.trips = [];
        this.loading = false;
        return;
      }
      this.data = {
        branch_id: branchId,
        date,
      };
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "get-trip-branch-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.trips = this.toArray(result.data?.trips).map((trip) => ({
            ...trip,
            saleMode: this.normalizeTripSaleMode(trip),
          }));
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.trips = [];
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
    async save() {
      this.loading = true;
      this.syncTripTicketTemplateWithSaleMode();
      if (this.editedIndex === -1) {
        this.valid = false;
        const fieldsToUpdate = [
          "route_id",
          "branch_id",
          "vehicle_id",
          "date",
          "schedule",
          "arrival",
          "start",
          "end",
          "saleMode",
          "ticket_template_id",
          "workers",
          "tripStops",
          "tripSegments",
          "tripFares",
        ];

        let updatedFields = Object.keys(this.editedItem)
          .filter(
            (key) =>
              fieldsToUpdate.includes(key) &&
              this.editedItem[key] !== undefined &&
              this.editedItem[key] !== null &&
              this.editedItem[key] !== ""
          )
          .reduce((obj, key) => {
            if (key === "workers") {
              obj[key] = this.normalizeWorkersPayload(this.editedItem.workers);
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTripStopsPayload(this.tripStopRows);
            } else if (key === "tripSegments") {
              obj[key] = this.normalizeTripSegmentsPayload(this.tripFareRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTripFaresPayload(this.tripFareRows);
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        updatedFields = this.synchronizeTripSegmentPayload(updatedFields);
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.date = this.editedItem.date ? this.editedItem.date : new Date();
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          if (this.editedItem.ticket_template_id !== null
            && this.editedItem.ticket_template_id !== undefined
            && this.editedItem.ticket_template_id !== "") {
            updatedFields.ticket_template_id = this.editedItem.ticket_template_id;
          }
          try {
            const result = await handleRequest({
              endpoint: "trip",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              const savedBranchId = this.editedItem.branch_id ?? this.branch_id;
              const savedDate = this.editedItem.date || this.dateFormattedSearch;
              this.branch_id = savedBranchId;
              await this.initialize({
                branchId: savedBranchId,
                date: savedDate,
              });
              this.loading = false;
              this.close();
            } else {
              this.showAlert(
                "warning",
                this.getTripRequestMessage(result, "No fue posible crear el viaje."),
                5000
              );
              this.loading = false;
              this.valid = true;
            }
          } catch (error) {
            this.showAlert(
              "error",
              this.getTripRequestMessage(
                error,
                "Ocurrió un error inesperado al procesar la solicitud."
              ),
              5000
            );
            this.loading = false;
            this.valid = true;
          }
        } else {
          this.showAlert("warning", "Completa los datos requeridos antes de guardar el viaje.", 5000);
          this.loading = false;
          this.valid = true;
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = [
          "route_id",
          "branch_id",
          "vehicle_id",
          "date",
          "schedule",
          "arrival",
          "start",
          "end",
          "saleMode",
          "ticket_template_id",
          "workers",
          "tripStops",
          "tripSegments",
          "tripFares",
        ];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => {
            if (!fieldsToUpdate.includes(key)) return false;
            if (key === "workers") {
              return this.areWorkersDifferent(this.originalItem[key], this.editedItem[key]);
            }
            if (key === "tripStops") {
              return this.areTripStopsDifferent(this.originalItem.tripStops, this.tripStopRows);
            }
            if (key === "tripSegments") {
              return this.areTripSegmentsDifferent(this.originalItem.tripSegments, this.tripFareRows);
            }
            if (key === "tripFares") {
              return this.areTripFaresDifferent(this.originalItem.tripFares, this.tripFareRows);
            }
            return this.editedItem[key] !== this.originalItem[key];
          })
          .reduce((obj, key) => {
            if (key === "workers") {
              obj[key] = this.normalizeWorkersPayload(this.editedItem.workers);
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTripStopsPayload(this.tripStopRows);
            } else if (key === "tripSegments") {
              obj[key] = this.normalizeTripSegmentsPayload(this.tripFareRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTripFaresPayload(this.tripFareRows);
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        updatedFields = this.synchronizeTripSegmentPayload(updatedFields);
        if (updatedFields.ticket_template_id === null
          || updatedFields.ticket_template_id === undefined
          || updatedFields.ticket_template_id === "") {
          delete updatedFields.ticket_template_id;
        }
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "trip-update",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              const savedBranchId = this.editedItem.branch_id ?? this.branch_id;
              const savedDate = this.editedItem.date || this.dateFormattedSearch;
              this.branch_id = savedBranchId;
              await this.initialize({
                branchId: savedBranchId,
                date: savedDate,
              });
              this.loading = false;
              this.close();
            } else {
              this.showAlert(
                "warning",
                this.getTripRequestMessage(result, "No fue posible actualizar el viaje."),
                5000
              );
              this.loading = false;
              this.valid = true;
            }
          } catch (error) {
            this.showAlert(
              "error",
              this.getTripRequestMessage(
                error,
                "Ocurrió un error inesperado al procesar la solicitud."
              ),
              5000
            );
            this.loading = false;
            this.valid = true;
          }
        } else {
          this.showAlert("success", "No se realizaron cambios.", 3000);
          this.loading = false;
        }
      }
    },
    async editItem(item) {
      this.editedIndex = 1;
      this.step = 1;
      this.workerSearch = "";
      this.tripStopSearch = "";
      this.addTripStopDialog = false;
      this.tripFareSearch = "";
      this.addTripFareDialog = false;
      this.tripStopRows = [];
      this.tripFareRows = [];
      this.tripSegments = [];
      this.expandedTripFareIds = [];
      const trip = item?.raw || item;
      this.originalItem = _.cloneDeep(trip);
      this.editedItem = _.cloneDeep(trip);
      this.ticketTemplateSelection = [];
      this.ticketTemplateSelectionManual = !this.isSystemTicketTemplate(this.editedItem.ticket_template)
        && this.editedItem.ticket_template_id !== null
        && this.editedItem.ticket_template_id !== undefined
        && this.editedItem.ticket_template_id !== "";
      this.originalItem.saleMode = this.normalizeTripSaleMode(this.originalItem);
      this.editedItem.saleMode = this.normalizeTripSaleMode(this.editedItem);
      this.originalItem.tripStops = Array.isArray(this.originalItem.tripStops)
        ? this.originalItem.tripStops
        : Array.isArray(this.originalItem.trip_stops)
          ? this.originalItem.trip_stops
          : [];
      this.editedItem.tripStops = Array.isArray(this.editedItem.tripStops)
        ? this.editedItem.tripStops
        : Array.isArray(this.editedItem.trip_stops)
          ? this.editedItem.trip_stops
          : [];
      this.originalItem.tripFares = Array.isArray(this.originalItem.tripFares)
        ? this.originalItem.tripFares
        : Array.isArray(this.originalItem.trip_fares)
          ? this.originalItem.trip_fares
          : [];
      this.editedItem.tripFares = Array.isArray(this.editedItem.tripFares)
        ? this.editedItem.tripFares
        : Array.isArray(this.editedItem.trip_fares)
          ? this.editedItem.trip_fares
          : [];
      this.originalItem.tripSegments = Array.isArray(this.originalItem.tripSegments)
        ? this.originalItem.tripSegments
        : Array.isArray(this.originalItem.trip_segments)
          ? this.originalItem.trip_segments
          : [];
      this.editedItem.tripSegments = Array.isArray(this.editedItem.tripSegments)
        ? this.editedItem.tripSegments
        : Array.isArray(this.editedItem.trip_segments)
          ? this.editedItem.trip_segments
          : [];
      this.originalItem.tripStops = this.filterTripRelationsForSelectedTrip(this.originalItem.tripStops);
      this.editedItem.tripStops = this.filterTripRelationsForSelectedTrip(this.editedItem.tripStops);
      this.originalItem.tripSegments = this.filterTripRelationsForSelectedTrip(this.originalItem.tripSegments);
      this.editedItem.tripSegments = this.filterTripRelationsForSelectedTrip(this.editedItem.tripSegments);
      this.originalItem.tripFares = this.filterTripRelationsForSelectedTrip(this.originalItem.tripFares);
      this.editedItem.tripFares = this.filterTripRelationsForSelectedTrip(this.editedItem.tripFares);
      this.tripSegments = this.editedItem.tripSegments;
      this.editedItem.branch_id = this.editedItem.branch_id ?? this.branch_id;
      await this.loadTripFormData(this.editedItem.branch_id, {
        resetSelections: false,
      });

      const matchedRoute = this.selectedRouteRecord;
      this.estimated = matchedRoute ? matchedRoute.estimated : null;
      if (!this.editedItem.arrival) {
        this.updateArrival();
      }
      this.syncTripStopsFromRoute(false);
      this.syncTripFareRows(false);
      this.filterWorkers();
      this.dialog = true;
    },
    deleteItem(item) {
      this.tab = 1;
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
      try {
        let request = {
          id: this.editedItem.id,
        };
        const result = await handleRequest({
          endpoint: "trip-destroy",
          method: "POST",
          data: request,
        });

        // Manejo de la respuesta segÃºn el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          this.initialize();
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
      } finally {
        this.closeDelete();
      }
    },
    vehicleInternalNumber(vehicle) {
      return (
        vehicle?.internal_number ??
        vehicle?.internalNumber ??
        vehicle?.vehicleInternalNumber ??
        "No asignado"
      );
    },
    splitTripDateTime(value) {
      if (!value) {
        return { date: "-", time: "-" };
      }

      const rawValue = String(value).trim();
      if (!rawValue) {
        return { date: "-", time: "-" };
      }

      if (/^\d{2}:\d{2}(:\d{2})?$/.test(rawValue)) {
        return { date: "-", time: rawValue.slice(0, 5) };
      }

      const normalizedValue = rawValue.includes("T")
        ? rawValue.replace("T", " ")
        : rawValue;
      const [datePart = "", timePart = ""] = normalizedValue.split(" ");

      return {
        date: datePart || "-",
        time: timePart ? timePart.slice(0, 5) : "-",
      };
    },
    formatTripDate(value) {
      return this.splitTripDateTime(value).date;
    },
    formatTripTime(value) {
      return this.splitTripDateTime(value).time;
    },
    formatTripDateTimeTooltip(label, value) {
      const { date, time } = this.splitTripDateTime(value);

      if (date === "-" && time === "-") {
        return `${label}: -`;
      }

      if (date === "-") {
        return `${label}: ${time}`;
      }

      if (time === "-") {
        return `${label}: ${date}`;
      }

      return `${label}: ${date} ${time}`;
    },
    getTripArrivalValue(trip) {
      return trip?.arrival || trip?.end || null;
    },
    getTripRequestMessage(result, fallback = "No fue posible completar la operación.") {
      const collectMessages = (value) => {
        if (Array.isArray(value)) {
          return value.flatMap((item) => collectMessages(item));
        }
        if (typeof value === "string" && value.trim()) {
          return [value.trim()];
        }
        if (value && typeof value === "object") {
          return Object.values(value).flatMap((item) => collectMessages(item));
        }
        return [];
      };

      const details = [
        result?.details,
        result?.data?.details,
        result?.response?.data?.details,
      ].flatMap((value) => collectMessages(value));

      if (details.length) {
        return [...new Set(details)].join(". ");
      }

      return (
        result?.message ||
        result?.msg ||
        result?.data?.msg ||
        result?.response?.data?.msg ||
        fallback
      );
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
  },
};
</script>
<style>
.selected-tab {
  background-color: #1976d2;
  /* Fondo del tab seleccionado */
  color: white;
  /* Texto blanco */
  border-radius: 4px;
  /* Esquinas redondeadas, opcional */
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

.vehicle-details {
  min-width: 0;
  max-width: calc(100% - 56px);
}

.trip-fare-ticket-types-panel {
  border-color: #d9e1ef;
  background: #ffffff;
  overflow: hidden;
}

.trip-fare-ticket-types-header {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr 0.8fr;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%);
  border-bottom: 1px solid #d9e1ef;
  font-weight: 700;
  font-size: 14px;
  color: #1f2a44;
}

.trip-fare-ticket-types-row {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr 0.8fr;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e5eaf2;
}

.trip-fare-ticket-types-row:last-child {
  border-bottom: none;
}

.trip-fare-col-name,
.trip-fare-col-price,
.trip-fare-col-status {
  min-width: 0;
}

.trip-fare-col-price {
  max-width: 150px;
}

.trip-fare-status-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.trip-fare-status-label {
  white-space: nowrap;
  line-height: 1;
}

.trip-fare-row-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
}

.trip-fare-row-switch :deep(.v-switch__track) {
  transform: scale(0.7);
  transform-origin: left center;
}

.trip-fare-row-switch :deep(.v-switch__thumb) {
  transform: scale(0.7);
}

.trip-worker-assignment-inline {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: max-content;
  gap: 4px;
  min-height: 44px;
  margin: 0 auto;
}

.trip-worker-assignment-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
  width: auto;
}

.trip-worker-assignment-switch :deep(.v-selection-control__input) {
  color: inherit;
}

.trip-worker-assignment-switch :deep(.v-switch__track),
.trip-worker-assignment-switch :deep(.v-selection-control--dirty .v-switch__track) {
  transform: scale(0.62);
  transform-origin: left center;
  border-radius: 999px;
  opacity: 0.92;
}

.trip-worker-assignment-switch :deep(.v-switch__thumb),
.trip-worker-assignment-switch :deep(.v-selection-control--dirty .v-switch__thumb) {
  transform: scale(0.68);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
}

.trip-worker-assignment-switch :deep(.v-icon) {
  font-size: 16px;
}

.trip-worker-assignment-label {
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  margin-left: 0;
}

.trip-worker-avatar {
  transition: transform 0.15s ease;
}

.trip-worker-avatar:hover {
  transform: translateY(-1px) scale(1.05);
}

.trip-members-button.v-btn {
  display: flex;
  max-width: 100%;
  min-height: 28px;
  height: auto;
  margin: 5px 0 0 -8px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0;
  text-transform: none;
}

.trip-members-button :deep(.v-btn__content) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trip-members-button:focus-visible {
  outline: 2px solid #2454d6;
  outline-offset: 2px;
}

.trip-members-expanded-cell {
  padding: 0 18px 14px !important;
  border-bottom: 1px solid #dfe7f2 !important;
  background: #f8faff;
}

.trip-members-panel {
  padding: 14px 16px;
  border: 1px solid #dfe7f2;
  border-radius: 10px;
  background: #fff;
}

.trip-members-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.trip-members-panel-heading strong {
  display: block;
  color: #233654;
  font-size: 13px;
  font-weight: 750;
}

.trip-members-panel-heading span {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
}

.trip-worker-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}

.trip-worker-person {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  background: #f9fbfe;
}

.trip-worker-person > .v-avatar {
  flex-shrink: 0;
}

.trip-worker-person > div {
  min-width: 0;
}

.trip-worker-person strong {
  display: block;
  overflow-wrap: anywhere;
  color: #334155;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.4;
}

.trip-worker-person small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 11px;
  white-space: normal;
}

.trip-muted {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}



.trip-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.trip-filter {
  width: 270px;
  min-width: 250px;
}

.trip-date-filter {
  width: 180px;
  min-width: 170px;
}

.trip-search {
  width: 300px;
  min-width: 260px;
}

.trip-heading-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.trip-sort-button {
  display: flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.trip-sort-button:hover {
  color: #2454d6;
}

.trip-sort-button:focus-visible {
  outline: 2px solid #2454d6;
  outline-offset: 3px;
  border-radius: 3px;
}

.trip-sort-button--secondary {
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
}

.trip-col-code {
  width: 10%;
  min-width: 0;
}

.trip-col-route {
  width: 24%;
  min-width: 0;
}

.trip-col-vehicle {
  width: 12%;
  min-width: 0;
}

.trip-col-date {
  width: 12%;
  min-width: 0;
  white-space: nowrap;
}

.trip-col-schedule {
  width: 12%;
  min-width: 0;
}

.trip-col-sale-mode {
  width: 8%;
  min-width: 0;
}

.trip-col-start {
  width: 7%;
  min-width: 0;
}

.trip-col-end {
  width: 7%;
  min-width: 0;
}

.trip-sortable {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.trip-datetime-cell {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.trip-datetime-value {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}

.trip-datetime-date {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
}

.trip-datetime-time {
  font-size: 12px;
  color: #6b7280;
}

.trip-col-actions {
  width: 8%;
  min-width: 0;
}

.trip-vehicle-cell {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}

.trip-cell-title {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: #1e293b;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.5;
}

.trip-row {
  min-height: 70px;
}

.trip-code-cell {
  flex-direction: column;
  align-items: flex-start !important;
  justify-content: center;
  gap: 2px;
  text-align: left;
}

.trip-code-value {
  display: block;
  max-width: 100%;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
  text-align: left;
}

.trip-route-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.trip-route-title {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-route-code-chip {
  max-width: 100%;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.trip-route-meta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  min-width: 0;
}

.trip-worker-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.trip-worker-avatar {
  border: 2px solid #ffffff;
}

.trip-dialog {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
}

.trip-dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.trip-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.trip-stepper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.trip-stepper :deep(.v-stepper-window),
.trip-stepper :deep(.v-window),
.trip-stepper :deep(.v-window__container),
.trip-stepper :deep(.v-stepper-window-item),
.trip-stepper :deep(.v-stepper-window-item > .v-window-item) {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.trip-stepper :deep(.v-stepper-window) {
  margin: 0;
}

.trip-stepper :deep(.v-window__container) {
  height: 100%;
}

.trip-stepper :deep(.v-stepper-window-item),
.trip-stepper :deep(.v-stepper-window-item > .v-window-item) {
  display: flex;
  flex-direction: column;
}

.trip-step-pane {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  padding: 24px 24px 20px;
  box-sizing: border-box;
}

.trip-step-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  height: 100%;
  overflow: visible;
}

.trip-step-pane--summary .trip-step-content {
  overflow: visible;
}

.trip-step-actions {
  flex-shrink: 0;
  padding: 16px 0 calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #eeeeee;
  margin-top: 16px;
}

.trip-step-table {
  min-height: 0;
}

.busgo-submeta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .trip-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .trip-filter,
  .trip-date-filter,
  .trip-search {
    width: 100%;
    min-width: 100%;
  }

  .trip-col-code,
  .trip-col-route,
  .trip-col-vehicle,
  .trip-col-date,
  .trip-col-schedule,
  .trip-col-sale-mode,
  .trip-col-start,
  .trip-col-end,
  .trip-col-actions {
    width: 100%;
  }

  .trip-route-meta {
    flex-wrap: wrap;
  }

  .trip-route-title-row {
    flex-wrap: wrap;
  }
}

/* =======================================================
   BUSGO DESIGN SYSTEM
   ======================================================= */

:root{

--busgo-border:#E5E7EB;

--busgo-border-soft:#EEF2F7;

--busgo-surface:#FFFFFF;

--busgo-surface-alt:#F8FAFC;

--busgo-text:#111827;

--busgo-text-soft:#64748B;

--busgo-radius-lg:18px;

--busgo-radius-md:12px;

--busgo-shadow:

0 1px 2px rgba(15,23,42,.04),

0 4px 12px rgba(15,23,42,.05);

}


/* =======================================================
   LAYOUT
   ======================================================= */

.busgo-page{

padding:24px;

}

.busgo-card{

background:var(--busgo-surface);

border:1px solid var(--busgo-border);

border-radius:var(--busgo-radius-lg);

overflow:hidden;

box-shadow:var(--busgo-shadow);

}

.busgo-section{

padding:24px;

}


/* =======================================================
   HEADER
   ======================================================= */

.busgo-page-header{

display:flex;

align-items:center;

gap:16px;

padding:18px 24px;

background:var(--busgo-surface-alt);

border-bottom:1px solid var(--busgo-border);

}

.busgo-page-icon{

border-radius:14px;

}

.busgo-page-title{

font-size:22px;

font-weight:700;

color:var(--busgo-text);

}

.busgo-page-subtitle{

font-size:13px;

color:var(--busgo-text-soft);

margin-top:2px;

}

.busgo-page-actions{

margin-left:auto;

display:flex;

gap:8px;

}


/* =======================================================
   SEARCH
   ======================================================= */

.busgo-search{

max-width:380px;

min-width:280px;

}


/* =======================================================
   CARD HEADER
   ======================================================= */

.busgo-card-header{

display:flex;

justify-content:space-between;

align-items:center;

gap:24px;

padding:20px 24px;

}

.busgo-card-title{

font-size:16px;

font-weight:700;

color:var(--busgo-text);

}

.busgo-card-subtitle{

font-size:13px;

color:var(--busgo-text-soft);

}


/* =======================================================
   TABLE
   ======================================================= */

.busgo-table{

background:transparent;

max-height:68vh;

overflow:auto;

}

.busgo-table-head{

display:flex;

align-items:center;

padding:0 20px;

height:42px;

margin:0 16px 6px;

border-radius:12px;

background:var(--busgo-surface-alt);

font-size:12px;

font-weight:700;

text-transform:uppercase;

color:var(--busgo-text-soft);

}

.busgo-row{

display:flex;

align-items:center;

min-height:58px;

padding:8px 20px;

margin:0 16px 6px;

border:1px solid var(--busgo-border-soft);

border-radius:12px;

background:white;

transition:all .15s ease;

}

.busgo-row:hover{

background:#fafafa;

border-color:#dbeafe;

}


/* =======================================================
   CELLS
   ======================================================= */

.busgo-name-cell{

display:flex;

align-items:center;

gap:12px;

}

.busgo-avatar{

border:1px solid var(--busgo-border);

}

.busgo-name{

font-size:14px;

font-weight:600;

overflow:hidden;

white-space:nowrap;

text-overflow:ellipsis;

}

.busgo-meta{

display:flex;

align-items:center;

gap:6px;

font-size:13px;

color:#374151;

}


/* =======================================================
   BUTTONS
   ======================================================= */

.busgo-actions{

display:flex;

justify-content:flex-end;

gap:5px;

}

.busgo-action{

width:30px;

height:30px;

}


/* =======================================================
   FOOTER
   ======================================================= */

.busgo-footer{

padding:14px 24px;

border-top:1px solid var(--busgo-border-soft);

}


/* =======================================================
   SCROLL
   ======================================================= */

.busgo-table::-webkit-scrollbar{

width:8px;

}

.busgo-table::-webkit-scrollbar-thumb{

background:#CBD5E1;

border-radius:30px;

}


/* =======================================================
   RESPONSIVE
   ======================================================= */

@media(max-width:960px){

.busgo-card-header{

flex-direction:column;

align-items:stretch;

}

.busgo-search{

max-width:100%;

min-width:100%;

}

.busgo-table-head{

display:none;

}

.busgo-row{

flex-direction:column;

align-items:stretch;

gap:12px;

}

.busgo-actions{

justify-content:flex-start;

}

}

/* ======================================================
   BUSGO · REFINAMIENTO VISUAL DE VIAJES
   ====================================================== */
body { color:#1e293b; }
.busgo-page-header { min-height:70px; padding:12px 24px; gap:11px; background:#fff; border-bottom:1px solid #e8edf5; box-shadow:none; }
.trip-page-icon { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }
.busgo-page-title { color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }.busgo-page-subtitle { margin-top:3px; color:#526176; font-size:12px; font-weight:650; }
.busgo-add-btn { min-height:40px; padding-inline:16px!important; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }
.busgo-container { padding:18px 24px 28px!important; background:#f6f8fb; }
.trip-summary-row { margin-bottom:4px; }.trip-summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }.trip-summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }.trip-summary-icon--blue { color:#2454d6; background:#eef3ff; }.trip-summary-icon--green { color:#16875a; background:#eaf8f1; }.trip-summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.trip-summary-date { font-size:16px; }.trip-summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }
.busgo-card { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }.busgo-card-header { min-height:67px; padding:13px 17px; }.busgo-card-title { color:#0f172a; font-size:15px; font-weight:850; }.busgo-card-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.trip-toolbar { gap:9px; padding:10px 17px 13px; border-top:1px solid #f1f4f8; }.trip-filter,.trip-date-filter,.trip-search { min-width:0; }.trip-filter { width:260px; }.trip-date-filter { width:170px; }.trip-search { width:285px; }.trip-toolbar .v-field { min-height:40px; color:#1e293b; border-radius:9px!important; font-size:12px; }.trip-toolbar .v-field__outline { color:#dce3ed; }.trip-toolbar .v-field__input { color:#1e293b; font-size:12px; font-weight:650; }.trip-toolbar .v-icon { color:#64748b; }
.busgo-table { max-height:none; color:#1e293b; background:transparent; }.busgo-table .v-data-table__wrapper { overflow-x:auto; }.busgo-table-head { min-width:1120px; height:40px; margin:0; padding:0 17px; color:#334155; background:#f8fafc; border-top:1px solid #e8edf5; border-bottom:1px solid #e8edf5; border-radius:0; font-size:10px; font-weight:850; letter-spacing:.04em; }.busgo-row { min-width:1120px; min-height:66px; margin:0; padding:7px 17px; background:#fff; border:0; border-bottom:1px solid #eef2f6; border-radius:0; }.busgo-row:hover { background:#f8faff; border-color:#eef2f6; }.busgo-table .v-data-table-footer { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; border-top:1px solid #edf1f5; }
.trip-sortable { cursor:pointer; transition:color .15s ease; }.trip-sortable:hover { color:#2454d6; }.trip-code-value,.trip-route-title,.busgo-name { color:#0f172a; font-size:12px; font-weight:850; }.trip-route-meta,.busgo-submeta { color:#64748b; font-size:10px; font-weight:650; }.trip-vehicle-icon { display:grid; flex:0 0 32px; width:32px; height:32px; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }.trip-worker-avatar { width:30px!important; height:30px!important; border:2px solid #fff; box-shadow:0 2px 7px rgba(15,23,42,.13); }.trip-datetime-value { color:#334155; font-size:10px; font-weight:700; }.trip-datetime-time { color:#2454d6; font-weight:850; }.busgo-actions .v-btn { border-radius:8px!important; }

.trip-dialog { min-height:100vh; color:#1e293b; background:#f6f8fb; }.trip-dialog-header { z-index:5; display:grid; grid-template-columns:minmax(0,1fr) auto 42px; align-items:center; gap:18px; min-height:72px; padding:11px 22px; color:#fff; background:radial-gradient(circle at 88% -40%,rgba(53,184,232,.38),transparent 230px),linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6); box-shadow:0 5px 18px rgba(15,23,42,.18); }.trip-dialog-heading { display:flex; align-items:center; gap:11px; min-width:0; }.trip-dialog-icon { display:grid; flex:0 0 40px; width:40px; height:40px; place-items:center; color:#fff; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.17); border-radius:10px; }.trip-dialog-title { font-size:17px; font-weight:850; line-height:1.2; }.trip-dialog-subtitle { margin-top:3px; overflow:hidden; color:#dbe7ff; font-size:11px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }.trip-dialog-progress { display:flex; align-items:flex-end; flex-direction:column; }.trip-dialog-progress span { color:#b8cbf5; font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }.trip-dialog-progress strong { margin-top:2px; font-size:12px; font-weight:800; }.trip-dialog-close { color:#fff!important; border-radius:9px!important; }
.trip-dialog-body { background:#f6f8fb; }.trip-stepper { background:transparent!important; box-shadow:none!important; }.trip-stepper .v-stepper-header { min-height:66px; padding:4px 18px; background:#fff; border-bottom:1px solid #e7ecf3; box-shadow:none!important; }.trip-stepper .v-stepper-item { padding:11px 14px; }.trip-stepper .v-stepper-item__avatar { width:30px; height:30px; color:#526176; background:#eef2f7; font-size:11px; font-weight:850; }.trip-stepper .v-stepper-item--selected .v-stepper-item__avatar,.trip-stepper .v-stepper-item--complete .v-stepper-item__avatar { color:#fff; background:#2454d6; }.trip-stepper .v-stepper-item__title { color:#526176; font-size:11px; font-weight:750; }.trip-stepper .v-stepper-item--selected .v-stepper-item__title { color:#0f172a; font-weight:850; }.trip-stepper .v-divider { color:#dfe6ef; }
.trip-step-pane { padding:18px 24px 14px; }.trip-step-pane--summary .trip-step-content { max-width:1120px; width:100%; margin:0 auto; padding:18px 20px 8px; background:#fff; border:1px solid #e4eaf2; border-radius:13px; box-shadow:0 5px 18px rgba(15,23,42,.04); }.trip-step-pane--summary .v-row { margin-top:0!important; }.trip-step-pane--summary .v-col { padding:8px 10px; }.trip-step-pane--summary .v-field { min-height:51px; padding-inline:4px; background:#fff; border:1px solid #dce3ed; border-radius:9px 9px 0 0; }.trip-step-pane--summary .v-field--variant-underlined .v-field__outline::before { border-color:#dce3ed; }.trip-step-pane--summary .v-field__input { color:#1e293b; font-size:12.5px; font-weight:650; }.trip-step-pane--summary .v-label { color:#526176; font-size:12px; font-weight:700; opacity:1; }.trip-step-pane--summary .v-input__prepend .v-icon { color:#2454d6; }
 .trip-config-section { overflow:hidden; background:#fff; border:1px solid #e1e8f1!important; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04); }.trip-config-toolbar { min-height:62px!important; color:#0f172a!important; background:#f8fafc!important; border-bottom:1px solid #e6ebf2; box-shadow:none!important; }.trip-config-toolbar .text-subtitle-1 { font-size:14px!important; font-weight:850!important; }.trip-config-toolbar .text-caption { color:#64748b!important; font-size:10.5px!important; font-weight:600; opacity:1!important; }.trip-config-section > .v-card-text { padding:13px!important; }.trip-step-table { min-height:0; background:transparent!important; box-shadow:none!important; }.trip-step-table .v-data-table-footer { min-height:48px; color:#475569; font-size:11px; }.trip-step-table .v-data-table__th { color:#334155!important; background:#f8fafc!important; font-size:10.5px!important; font-weight:850!important; text-transform:uppercase; }.trip-step-table .v-data-table__td { color:#334155; font-size:12px; font-weight:600; }
.trip-step-actions { max-width:1120px; width:100%; margin:12px auto 0; padding:12px 0 calc(8px + env(safe-area-inset-bottom)); border-top:1px solid #dfe5ed; }.trip-step-actions .v-row { align-items:center; margin:0!important; }.trip-step-actions .v-btn { min-width:108px; min-height:39px; border-radius:9px!important; font-size:12px; font-weight:800; letter-spacing:0; text-transform:none; }.trip-step-actions .v-btn:first-child { color:#475569!important; background:#fff!important; border:1px solid #dce3ed; }.trip-step-actions .v-btn:last-child { color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; box-shadow:0 5px 12px rgba(36,84,214,.18)!important; }.trip-step-actions .v-btn--disabled { color:#94a3b8!important; background:#e8edf4!important; box-shadow:none!important; }
.trip-fare-ticket-types-panel { border-color:#dfe6ef!important; border-radius:10px!important; }.trip-fare-ticket-types-header { color:#334155; background:#f8fafc; border-color:#e7ecf3; font-size:11px; font-weight:850; text-transform:uppercase; }.trip-fare-ticket-types-row { border-color:#edf1f5; font-size:12px; }

.trip-delete-dialog { padding:29px 27px 24px; color:#1e293b; text-align:center; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.trip-delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.trip-delete-title { color:#0f172a; font-size:18px; font-weight:850; }.trip-delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.trip-delete-actions { display:flex; justify-content:center; gap:9px; }.trip-cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; text-transform:none; border-radius:9px!important; }.trip-delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; text-transform:none; }.trip-worker-dialog { color:#1e293b; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.trip-worker-dialog-toolbar { color:#0f172a!important; background:#f8fafc!important; border-bottom:1px solid #e5eaf2; box-shadow:none!important; }.trip-worker-dialog-toolbar .text-subtitle-2 { font-size:14px!important; font-weight:850; }
.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar .v-snackbar__wrapper { border-radius:11px; }

.trip-route-menu { min-width:620px!important; max-width:min(720px,calc(100vw - 24px))!important; }.trip-route-menu .v-list { padding:7px!important; background:#f8fafc!important; }.trip-route-menu .v-card { overflow:hidden; background:#fff; border:1px solid #e5eaf2; border-radius:11px!important; box-shadow:none!important; }.trip-route-menu .v-card:hover { border-color:#cbd8f7; box-shadow:0 5px 15px rgba(36,84,214,.08)!important; }.trip-route-menu .v-list-item { padding:10px 12px!important; }.trip-route-menu .trip-route-title-row { padding-bottom:7px; color:#0f172a; border-bottom:1px solid #edf1f5; }.trip-route-menu .text-caption { color:#64748b!important; font-size:9px!important; font-weight:800; text-transform:uppercase; }.trip-route-menu .text-truncate { color:#1e293b; font-size:11px; font-weight:750; }.trip-route-menu .v-avatar { overflow:hidden; border:1px solid #dce6ff; border-radius:9px!important; }
.trip-vehicle-menu .v-list,.trip-branch-menu .v-list { padding:6px!important; }.trip-vehicle-menu .v-list-item,.trip-branch-menu .v-list-item { min-height:58px; margin:2px 0; border-radius:9px!important; }.trip-vehicle-menu .v-list-item:hover,.trip-branch-menu .v-list-item:hover { background:#f4f7ff!important; }.trip-vehicle-menu .v-list-item-title,.trip-branch-menu .v-list-item-title { color:#0f172a!important; font-size:12.5px!important; font-weight:800!important; }.trip-vehicle-menu .v-list-item-subtitle { color:#64748b!important; font-size:10.5px!important; font-weight:600!important; opacity:1!important; }

@media(max-width:959px) { .busgo-page-header { padding-inline:17px; }.busgo-container { padding:15px 17px 24px!important; }.trip-toolbar { align-items:stretch; }.trip-search { width:100%; }.trip-dialog-header { grid-template-columns:minmax(0,1fr) 42px; }.trip-dialog-progress { display:none; }.trip-step-pane { padding:14px 15px 10px; }.trip-stepper .v-stepper-header { overflow-x:auto; justify-content:flex-start; }.trip-stepper .v-stepper-item { flex:0 0 auto; }.trip-route-menu { min-width:calc(100vw - 24px)!important; } }
/* Una sola cabecera real en el Nivel 1: se conserva la cabecera visual alineada con las filas personalizadas. */
.trips-main-table thead { display:none!important; }
.busgo-table-head { display:flex!important; visibility:visible!important; }

/* Primer paso: formulario operativo, no formulario genérico. */
.trip-form-intro { display:flex; align-items:center; gap:11px; margin:-2px -2px 17px; padding:12px 13px; color:#1e293b; background:linear-gradient(100deg,#f4f7ff,#f8fbff); border:1px solid #dfe7fb; border-radius:10px; }.trip-form-intro-icon { display:grid; flex:0 0 36px; width:36px; height:36px; place-items:center; color:#2454d6; background:#fff; border:1px solid #dce6ff; border-radius:9px; }.trip-form-intro > div:last-child { display:flex; flex-direction:column; }.trip-form-intro strong { color:#0f172a; font-size:13px; font-weight:850; }.trip-form-intro span { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:600; }.trip-form-section-title { display:flex; align-items:center; gap:7px; margin:0 8px 4px; color:#334155; font-size:10.5px; font-weight:850; letter-spacing:.055em; text-transform:uppercase; }.trip-form-section-title .v-icon { color:#2454d6; }.trip-form-section-title--schedule { margin-top:10px; padding-top:14px; border-top:1px solid #edf1f5; }
.trip-step-pane--summary .v-field { min-height:50px; border:0; border-radius:9px!important; }.trip-step-pane--summary .v-field__outline { color:#d5deea; }.trip-step-pane--summary .v-field--focused .v-field__outline { color:#2454d6; }.trip-step-pane--summary .v-field__prepend-inner .v-icon { color:#64748b; }.trip-step-pane--summary .v-field--focused .v-field__prepend-inner .v-icon { color:#2454d6; }.trip-step-pane--summary .v-input__details { padding-inline:4px; }.trip-step-pane--summary .v-field--disabled { background:#f8fafc; opacity:.78; }

/* Tablas internas con la misma densidad y lenguaje visual del Nivel 1. */
.trip-config-section .trip-table-manual-head { height:40px!important; min-height:40px!important; margin:0!important; color:#334155!important; background:#f8fafc!important; border:1px solid #e8edf5!important; border-radius:9px 9px 0 0!important; box-shadow:none!important; }.trip-config-section .trip-table-manual-head .v-card-text { color:#334155; font-size:11px; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; }
.trip-stop-row-card,.trip-fare-row-card { margin:0!important; background:#fff!important; border:0!important; border-bottom:1px solid #edf1f5!important; border-radius:0!important; box-shadow:none!important; transition:background .15s ease; }.trip-stop-row-card:hover,.trip-fare-row-card:hover { background:#f8faff!important; }.trip-stop-row-card .v-card-text,.trip-fare-row-card .v-card-text { min-height:58px; padding:7px 14px!important; color:#334155; font-size:11.5px; font-weight:650; }.trip-stop-row-card .v-avatar { width:34px!important; height:34px!important; border:1px solid #dce6ff; border-radius:8px!important; }.trip-stop-row-card .font-weight-medium,.trip-fare-row-card .font-weight-medium { color:#1e293b; font-size:11.5px; font-weight:800!important; }.trip-stop-row-card .text-caption { color:#64748b!important; font-size:9.5px!important; }.trip-stop-row-card .v-field,.trip-fare-row-card .v-field,.trip-fare-ticket-types-row .v-field { background:#fff; border-radius:7px!important; }.trip-stop-row-card .v-field__outline,.trip-fare-row-card .v-field__outline { color:#dce3ed; }
.trip-step-table .v-data-table__wrapper { border:1px solid #e8edf5; border-radius:9px; }.trip-step-table thead th { height:40px!important; color:#334155!important; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em!important; text-transform:uppercase; }.trip-step-table tbody td { height:56px!important; color:#334155!important; border-bottom:1px solid #edf1f5!important; font-size:11.5px!important; font-weight:650!important; }.trip-step-table tbody tr:hover { background:#f8faff!important; }.trip-step-table .v-data-table-footer { border-top:1px solid #e8edf5; }

/* Menús de selección estructurados. */
.trip-route-menu .v-card { margin:4px!important; }.trip-route-menu .v-list-item__content { overflow:visible!important; }.trip-route-menu .v-row { margin:0!important; }.trip-route-menu .v-col { padding:5px 7px!important; }.trip-route-menu .v-col:first-child { padding-bottom:8px!important; border-bottom:1px solid #edf1f5; }.trip-route-menu .trip-route-title-row::before { content:'Código de ruta'; margin-right:8px; color:#94a3b8; font-size:8px; font-weight:850; letter-spacing:.05em; text-transform:uppercase; }.trip-route-menu .trip-route-title-row { display:flex; align-items:center; }.trip-route-menu .v-col:nth-child(2),.trip-route-menu .v-col:nth-child(3) { position:relative; min-height:58px; }.trip-route-menu .v-col:nth-child(4) { color:#334155; background:#f8fafc; border-radius:8px; }.trip-route-menu .v-avatar { flex:0 0 38px; width:38px!important; height:38px!important; }.trip-route-menu .v-img__img { object-fit:cover; }
.trip-vehicle-menu { min-width:370px!important; }.trip-vehicle-menu .v-list-item { min-height:76px!important; padding-block:8px!important; }.trip-vehicle-menu .v-avatar { width:42px!important; height:42px!important; overflow:hidden; border:1px solid #dce6ff; border-radius:9px!important; }.trip-vehicle-option-meta { display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px 10px; margin-top:5px; opacity:1!important; }.trip-vehicle-option-meta div { display:flex; align-items:center; gap:4px; min-width:0; padding:3px 5px; color:#526176; background:#f8fafc; border-radius:5px; font-size:9px; font-weight:700; }.trip-vehicle-option-meta .v-icon { color:#2454d6; }.trip-branch-menu .v-list-item { min-height:54px!important; }.trip-branch-menu .v-avatar { overflow:hidden; border:1px solid #dce6ff; border-radius:8px!important; }
.trip-worker-menu .v-list { padding:6px!important; }.trip-worker-menu .v-list-item { min-height:58px!important; margin:2px 0; border-radius:9px!important; }.trip-worker-menu .v-list-item:hover { background:#f4f7ff!important; }.trip-worker-menu .v-avatar { width:38px!important; height:38px!important; overflow:hidden; border:1px solid #dce6ff; }.trip-worker-menu .v-list-item-title { color:#0f172a!important; font-size:12.5px!important; font-weight:800!important; }.trip-worker-menu .v-list-item-subtitle { color:#64748b!important; font-size:10.5px!important; font-weight:650!important; opacity:1!important; }

@media(max-width:600px) { .busgo-page-header { align-items:flex-start; padding:11px 12px; }.busgo-page-subtitle { max-width:190px; }.busgo-add-btn { min-width:40px!important; padding-inline:9px!important; }.busgo-add-btn .v-btn__content { font-size:0; }.busgo-add-btn .v-icon { margin:0!important; }.busgo-container { padding:11px 12px 20px!important; }.trip-filter,.trip-date-filter,.trip-search { width:100%; }.trip-dialog-header { padding:10px 12px; }.trip-dialog-subtitle { max-width:230px; }.trip-stepper .v-stepper-header { min-height:58px; padding-inline:6px; }.trip-stepper .v-stepper-item { padding:8px; }.trip-stepper .v-stepper-item__title { display:none; }.trip-step-pane--summary .trip-step-content { padding:10px 10px 4px; }.trip-config-section > .v-card-text { padding:8px!important; }.trip-vehicle-menu { min-width:calc(100vw - 24px)!important; }.trip-vehicle-option-meta { grid-template-columns:1fr; } }
/* Cabeceras únicas: el slot headers sustituye por completo la cabecera nativa. */
.trips-main-table .trip-header-shell,.trip-step-table .trip-header-shell { padding:0!important; height:auto!important; border:0!important; }
.trips-main-table .v-table__wrapper > table { min-width:1120px; }
.trip-step-table .v-table__wrapper > table { min-width:900px; }
.trip-header-shell .trip-table-manual-head { border-radius:0!important; border-inline:0!important; }
.trips-main-table .v-data-table__top {
  padding:0!important;
}
.trips-main-table .trip-main-table-head {
  display:flex!important;
  align-items:center;
  box-sizing:border-box;
  width:100%;
  min-width:1120px;
  height:40px;
  margin:0;
  padding:0 17px;
  color:#334155;
  background:#f8fafc;
  border-top:1px solid #e8edf5;
  border-bottom:1px solid #e8edf5;
  font-size:11px;
  font-weight:850;
  letter-spacing:.04em;
  text-transform:uppercase;
  white-space:normal;
  visibility:visible!important;
}
.trips-main-table .trip-main-table-head > * {
  min-width:0;
  overflow:hidden;
}
.trips-main-table .trip-main-table-head .v-icon {
  flex-shrink:0;
}
.busgo-row { flex-direction:row!important; align-items:center!important; gap:0!important; }
.action-button { border-radius:8px!important; }
.action-button--edit { color:#2454d6!important; }
.action-button--edit:hover { background:#eef3ff!important; }
.action-button--delete { color:#dc2626!important; }
.action-button--delete:hover { background:#fff1f2!important; }
.trip-progress-nav { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; flex-shrink:0; padding:18px 24px; background:#fff; border-bottom:1px solid #e5eaf2; }
.trip-progress-item { display:flex; align-items:center; gap:11px; padding:12px 14px; border:1px solid #e5eaf2; border-radius:11px; background:#f8fafc; }
.trip-progress-number { display:grid; place-items:center; flex:0 0 34px; height:34px; border-radius:10px; background:#e8edf4; color:#475569; font-weight:800; }
.trip-progress-copy { display:flex; flex-direction:column; gap:3px; }
.trip-progress-copy > span { font-size:10px; font-weight:750; letter-spacing:.06em; text-transform:uppercase; color:#64748b; }
.trip-progress-copy strong { color:#334155; font-size:13px; line-height:1.3; }
.trip-progress-item--active { border-color:#a8bff8; background:#eef3ff; box-shadow:0 3px 10px #2454d610; }
.trip-progress-item--active .trip-progress-number { background:#2454d6; color:#fff; }
.trip-progress-item--active strong { color:#183d9c; }
.trip-progress-item--complete .trip-progress-number { background:#e0f5eb; color:#16875a; }
.trip-stepper .v-stepper-header { display:none!important; }
.trip-stepper .v-stepper-window { flex:1; min-height:0; overflow:auto; margin:0; }
.trip-step-pane--summary .trip-step-content { max-width:1120px; padding:24px 26px 16px; }
.trip-form-intro { padding:18px; margin-bottom:22px; }
.trip-form-intro strong { font-size:17px; }
.trip-form-intro span { font-size:13px; line-height:1.5; }
.trip-form-section-title { font-size:12px; margin-bottom:12px; }
.trip-dialog .v-label,.trip-dialog .v-field__input,.trip-dialog .v-select__selection-text,.trip-dialog .v-autocomplete__selection-text { font-size:14px!important; font-weight:600; color:#334155; opacity:1; }
.trip-dialog .v-field { border-radius:9px!important; }
.trip-config-section > .v-card-text { padding:0!important; }
.trip-stop-row-card .v-card-text,.trip-fare-row-card .v-card-text { font-size:13px; }
.trip-stop-row-card .font-weight-medium,.trip-fare-row-card .font-weight-medium { font-size:13px; }
.trip-selected-label { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; color:#1e293b; font-size:14px; }
.trip-route-menu { min-width:0!important; width:640px; max-width:calc(100vw - 24px)!important; }
.trip-route-menu .trip-route-option { margin:4px 0; padding:13px!important; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
.trip-route-menu .trip-route-option:hover { background:#f5f8ff; border-color:#b5c9f7; }
.trip-option-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid #e8edf5; }
.trip-option-heading strong { color:#0f172a; font-size:14px; }
.trip-option-heading > span { display:flex; align-items:center; gap:5px; color:#475569; font-size:12px; }
.trip-option-journey { display:grid; grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr); gap:12px; align-items:center; }
.trip-option-place { display:flex; align-items:center; gap:10px; min-width:0; }
.trip-option-place > div { min-width:0; }
.trip-option-place small { display:block; color:#526176; font-size:11px; font-weight:700; margin-bottom:3px; }
.trip-option-place strong { display:block; color:#1e293b; font-size:13px; line-height:1.5; font-weight:650; white-space:normal; overflow-wrap:anywhere; }
.trip-option-arrow { color:#2454d6; }
.trip-vehicle-option-meta { display:flex!important; flex-wrap:wrap; gap:6px; -webkit-line-clamp:unset!important; overflow:visible!important; }
.trip-vehicle-option-meta div { font-size:12px; padding:4px 7px; }
.trip-vehicle-menu .v-list-item-title,.trip-branch-menu .v-list-item-title,.trip-worker-menu .v-list-item-title,.trip-standard-menu .v-list-item-title { color:#1e293b!important; font-size:14px!important; font-weight:700!important; white-space:normal; }
.trip-standard-menu .v-list { padding:6px; border:1px solid #e2e8f0; border-radius:11px; }
.trip-standard-menu .v-list-item { border-radius:8px; margin:2px 0; }
.trip-standard-menu .v-list-item--active { color:#2454d6; background:#eef3ff; }
@media(max-width:700px) {
  .trip-progress-nav { grid-template-columns:repeat(2,minmax(0,1fr)); padding:10px; gap:7px; }
  .trip-progress-item { padding:8px; gap:7px; }
  .trip-progress-copy strong { font-size:11px; }
  .trip-progress-number { flex-basis:28px; height:28px; }
  .trip-option-journey { grid-template-columns:1fr; gap:10px; }
  .trip-option-arrow { display:none; }
  .trip-step-pane--summary .trip-step-content { padding:16px 12px; }
}
/* Espacio de planificación: el resumen no introduce campos ni modifica el guardado. */
.trip-dialog .trip-form { display:grid; grid-template-columns:minmax(0,1fr) 300px; height:auto; flex:1; min-height:0; }
.trip-dialog .trip-stepper { min-width:0; height:100%; }
.trip-dialog .trip-stepper .v-stepper-window { height:100%; min-height:0; overflow:hidden; }
.trip-dialog .trip-stepper .v-window__container { height:100%; min-height:0; }
.trip-dialog .trip-stepper .v-stepper-window-item { height:100%; min-height:0; }
.trip-dialog .trip-step-pane { height:100%; padding:20px 22px 0; overflow:hidden; }
.trip-dialog .trip-step-content { min-height:0; height:auto; overflow:auto; overscroll-behavior:contain; flex:1 1 auto; }
.trip-dialog .trip-step-pane:not(.trip-step-pane--summary) .trip-step-content { overflow:hidden; }
.trip-dialog .trip-step-pane:not(.trip-step-pane--summary) .trip-config-section { display:flex; flex:1 1 auto; flex-direction:column; min-height:0; }
.trip-dialog .trip-step-pane:not(.trip-step-pane--summary) .trip-config-section > .v-card-text { display:flex; flex:1 1 auto; flex-direction:column; min-height:0; overflow:hidden; }
.trip-dialog .trip-step-pane:not(.trip-step-pane--summary) .trip-step-table { display:flex; flex:1 1 auto; height:100%; min-height:0; max-height:none!important; overflow:visible!important; }
.trip-dialog .trip-step-pane:not(.trip-step-pane--summary) .trip-step-table > .v-table__wrapper { min-height:0; overflow-y:auto; }
.trip-dialog .trip-step-pane--summary .trip-step-content { max-width:none; }
.trip-dialog .trip-step-actions { position:relative; z-index:2; flex:0 0 auto; max-width:none; margin:14px 0 0; padding:14px 0 calc(14px + env(safe-area-inset-bottom)); background:#f6f8fb; box-shadow:0 -8px 16px #f6f8fb; }
.trip-dialog .trip-step-actions .v-btn { min-height:42px; font-size:13px; }
.trip-dialog .trip-step-actions .v-btn--disabled { opacity:.55; }
.trip-live-summary { min-height:0; overflow-y:auto; padding:22px 18px; background:#fff; border-left:1px solid #e1e8f1; }
.trip-summary-heading { display:flex; align-items:center; gap:9px; margin-bottom:20px; color:#2454d6; }
.trip-summary-heading strong { display:block; color:#0f172a; font-size:16px; font-weight:800; }
.trip-summary-heading span { display:block; margin-top:3px; color:#64748b; font-size:11px; }
.trip-route-preview,.trip-vehicle-preview,.trip-schedule-preview { padding:15px; margin-bottom:14px; border:1px solid #e4eaf3; border-radius:12px; }
.trip-route-preview { background:linear-gradient(145deg,#f0f5ff,#fff); border-color:#dce6fb; }
.trip-preview-eyebrow { color:#526176; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; }
.trip-preview-route-code { margin-bottom:15px; color:#183d9c; font-size:15px; font-weight:800; overflow-wrap:anywhere; }
.trip-preview-stop { position:relative; display:flex; gap:12px; padding-bottom:22px; }
.trip-preview-stop::before { content:''; position:absolute; width:2px; left:5px; top:12px; bottom:0; background:#cbdafa; }
.trip-preview-dot { position:relative; z-index:1; flex:0 0 12px; height:12px; margin-top:4px; border:3px solid #2454d6; border-radius:50%; background:#fff; }
.trip-preview-stop small { display:block; color:#64748b; font-size:11px; margin-bottom:3px; }
.trip-preview-stop strong { display:block; color:#1e293b; font-size:13px; font-weight:700; line-height:1.5; overflow-wrap:anywhere; }
.trip-preview-stop--destination { padding-bottom:0; }
.trip-preview-stop--destination::before { display:none; }
.trip-preview-stop--destination .trip-preview-dot { border-color:#16875a; }
.trip-preview-duration { display:flex; align-items:center; gap:6px; margin-top:16px; padding-top:12px; border-top:1px solid #dfe7f5; color:#475569; font-size:12px; font-weight:650; }
.trip-preview-empty { display:flex; align-items:center; gap:10px; color:#64748b; font-size:12px; line-height:1.6; padding-block:8px; }
.trip-preview-empty .v-icon { color:#7692be; }
.trip-preview-vehicle-image { background:#f5f8fc; border-radius:9px; margin-bottom:12px; }
.trip-preview-image-fallback { display:grid; place-items:center; width:100%; height:100%; color:#2454d6; }
.trip-preview-vehicle-name { display:block; color:#0f172a; font-size:14px; }
.trip-preview-vehicle-meta { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.trip-preview-vehicle-meta > span { display:flex; align-items:center; gap:4px; padding:4px 6px; color:#475569; background:#f1f5f9; border-radius:5px; font-size:11px; }
.trip-preview-brand { margin-top:8px; color:#64748b; font-size:12px; }
.trip-preview-date { display:flex; align-items:center; gap:7px; color:#334155; font-size:13px; font-weight:650; }
.trip-preview-times { display:flex; align-items:center; justify-content:space-between; gap:7px; margin-top:14px; }
.trip-preview-times small { display:block; color:#64748b; font-size:10px; }
.trip-preview-times strong { display:block; margin-top:5px; color:#0f172a; font-size:18px; font-variant-numeric:tabular-nums; }
.trip-preview-times .v-icon { color:#8aa1c5; }
.trip-preview-note { display:flex; align-items:flex-start; gap:6px; color:#64748b; font-size:11px; line-height:1.6; }
.trip-preview-note .v-icon { flex-shrink:0; margin-top:2px; }
@media(max-width:1199px) {
  .trip-dialog .trip-form { grid-template-columns:minmax(0,1fr) 260px; }
  .trip-live-summary { padding:16px 12px; }
  .trip-dialog .trip-step-pane { padding-inline:14px; }
}
@media(max-width:959px) {
  .trip-dialog .trip-form { display:flex; flex-direction:column; }
  .trip-live-summary { order:-1; display:flex; gap:10px; flex:0 0 auto; max-height:148px; padding:10px 14px; border-left:0; border-bottom:1px solid #e1e8f1; overflow:auto; }
  .trip-summary-heading,.trip-vehicle-preview,.trip-preview-note { display:none; }
  .trip-route-preview,.trip-schedule-preview { flex:1 0 220px; margin:0; padding:10px 12px; }
  .trip-live-summary .trip-preview-eyebrow,.trip-preview-duration,.trip-preview-route-code { display:none; }
  .trip-preview-stop { padding-bottom:8px; }
  .trip-preview-stop small { display:none; }
  .trip-preview-stop strong { font-size:12px; }
  .trip-dialog .trip-stepper { flex:1 1 auto; height:auto; }
  .trip-dialog .trip-step-actions .v-btn { font-size:12px; min-width:80px; }
}
.trip-time-panel { padding:18px; margin-bottom:8px; border:1px solid #dce6f5; border-radius:13px; background:linear-gradient(115deg,#f4f8ff,#fff 70%); }
.trip-time-panel-heading { display:flex; align-items:center; gap:7px; margin-bottom:16px; color:#2454d6; }
.trip-time-panel-heading strong { color:#1e293b; font-size:13px; }
.trip-time-panel-heading > span { margin-left:auto; color:#64748b; font-size:11px; }
.trip-time-journey { display:grid; grid-template-columns:minmax(0,1fr) minmax(80px,.65fr) minmax(0,1fr); align-items:start; gap:16px; }
.trip-departure-input { min-width:0; }
.trip-departure-input .v-input__control { display:block; width:100%; }
.trip-departure-input .v-field { min-height:74px; border:1px solid #b6cafa; border-radius:11px!important; background:#fff; }
.trip-departure-input .v-field:focus-within { border-color:#2454d6; box-shadow:0 0 0 3px #2454d61c; }
.trip-departure-input .v-field__input { color:#183d9c; font-size:32px; font-weight:800; line-height:1.15; font-variant-numeric:tabular-nums; }
.trip-time-label { display:flex; align-items:center; gap:6px; color:#475569; font-size:12px; font-weight:700; }
.trip-time-value { display:block; color:#183d9c; font-size:32px; font-weight:800; line-height:1.15; letter-spacing:.015em; font-variant-numeric:tabular-nums; }
.trip-time-duration { align-self:center; text-align:center; color:#526176; font-size:11px; font-weight:650; }
.trip-time-duration > div { display:flex; align-items:center; margin-top:8px; color:#8da8d8; }
.trip-time-duration > div > span { flex:1; height:1px; background:#c7d7f1; }
.trip-time-arrival { display:flex; flex-direction:column; gap:8px; padding:15px 0; }
.trip-time-arrival .trip-time-value { color:#0f172a; }
.trip-time-arrival-caption { color:#526176; font-size:11px; line-height:1.5; }
.trip-time-hint { display:flex; align-items:center; gap:7px; margin-top:14px; color:#526176; font-size:12px; }
.trip-time-menu { max-width:calc(100vw - 24px)!important; }
.trip-time-picker { width:360px; max-width:calc(100vw - 24px); color:#1e293b; background:#fff; border:1px solid #dce6f5; border-radius:13px!important; }
.trip-time-picker-heading { display:flex; flex-direction:column; gap:4px; padding:16px; border-bottom:1px solid #e8edf5; }
.trip-time-picker-heading strong { color:#0f172a; font-size:14px; }
.trip-time-picker-heading span { color:#526176; font-size:12px; }
.trip-time-selectors { display:grid; grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr); align-items:center; gap:8px; padding:16px; }
.trip-time-part-select .v-field { min-height:50px; border-radius:9px!important; }
.trip-time-part-select .v-field__input { font-size:15px; font-weight:750; }
.trip-time-separator { color:#2454d6; font-size:25px; font-weight:850; text-align:center; }
.trip-time-picker-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px 14px; border-top:1px solid #e8edf5; }
.trip-time-picker-footer > span { display:flex; align-items:center; gap:5px; color:#64748b; font-size:10.5px; line-height:1.4; }
.trip-time-picker-footer .v-btn { min-height:34px; border-radius:8px!important; font-size:11px; font-weight:800; text-transform:none; }
.trip-time-part-menu .v-list { max-height:260px; padding:6px; border:1px solid #e2e8f0; border-radius:10px; }
.trip-time-part-menu .v-list-item { min-height:38px; border-radius:7px; font-size:13px; font-weight:700; }
.trip-time-part-menu .v-list-item--active { color:#2454d6; background:#eef3ff; }
.trip-sale-mode-preview { padding:15px; margin-bottom:14px; border:1px solid #e4eaf3; border-radius:12px; background:#fff; }
.trip-preview-sale-mode { display:flex; align-items:center; justify-content:space-between; gap:9px; }
.trip-preview-sale-mode > span { color:#334155; font-size:13px; font-weight:700; }
.trip-stop-toolbar-actions { display:flex; align-items:center; justify-content:flex-end; gap:9px; padding:0 14px 0 0; }
.trip-stop-search { min-width:180px; max-width:240px; }
.trip-stop-search .v-field { border-radius:9px!important; background:#fff; }
.trip-add-stop-button { min-height:39px; border-radius:9px!important; color:#fff!important; font-size:12px; font-weight:800; letter-spacing:0; text-transform:none; white-space:nowrap; }
.trip-add-stop-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }
.trip-add-stop-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }
.trip-add-stop-heading { display:flex; align-items:center; gap:11px; min-width:0; }
.trip-add-stop-heading > div:last-child { display:flex; flex-direction:column; min-width:0; }
.trip-add-stop-heading strong { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }
.trip-add-stop-heading span { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }
.trip-add-stop-icon { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }
.trip-add-stop-body { max-height:70vh; padding:21px 22px 16px!important; overflow-y:auto; }
.trip-add-stop-body .v-field { border-radius:9px!important; }
.trip-add-stop-body .v-label { color:#64748b; font-size:13px; font-weight:650; opacity:1; }
.trip-add-stop-body .v-field__input { color:#1e293b; font-size:13px; font-weight:650; }
.trip-add-stop-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }
.trip-add-stop-section-label--spaced { margin-top:8px; }
.trip-add-stop-switch-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
.trip-add-stop-switch-card { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 11px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }
.trip-add-stop-switch-card strong { display:block; color:#334155; font-size:11.5px; font-weight:800; }
.trip-add-stop-switch-card small { display:block; margin-top:3px; color:#64748b; font-size:9.5px; line-height:1.35; }
.trip-add-stop-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }
.trip-add-stop-actions .v-btn { min-height:39px; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.trip-add-stop-actions .v-btn:first-child { color:#475569!important; }
.trip-location-menu .v-list { max-height:330px!important; padding:6px!important; border:1px solid #e2e8f0; border-radius:10px; }
.trip-location-option { min-height:58px!important; margin:2px 0; padding:7px 10px!important; border-radius:9px!important; }
.trip-location-option:hover { background:#f5f8ff!important; }
.trip-location-option .v-list-item__spacer { width:0!important; }
.trip-location-option .v-list-item__prepend { align-self:center!important; margin-inline-end:11px!important; }
.trip-location-option .v-list-item__append { margin-inline-start:10px; }
.trip-location-avatar { overflow:hidden; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; }
.trip-location-copy { display:flex; flex-direction:column; min-width:0; }
.trip-location-copy strong { overflow:hidden; color:#1e293b; font-size:12.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.trip-location-copy span { margin-top:3px; overflow:hidden; color:#64748b; font-size:10.5px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.trip-fare-toolbar-actions { display:flex; align-items:center; justify-content:flex-end; gap:9px; padding:0 14px 0 0; }
.trip-fare-search { min-width:180px; max-width:240px; }
.trip-fare-search .v-field { border-radius:9px!important; background:#fff; }
.trip-add-fare-button { min-height:39px; border-radius:9px!important; color:#fff!important; font-size:12px; font-weight:800; letter-spacing:0; text-transform:none; white-space:nowrap; }
.trip-add-fare-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }
.trip-add-fare-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }
.trip-add-fare-heading { display:flex; align-items:center; gap:11px; min-width:0; }
.trip-add-fare-heading > div:last-child { display:flex; flex-direction:column; min-width:0; }
.trip-add-fare-heading strong { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }
.trip-add-fare-heading span { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }
.trip-add-fare-icon { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }
.trip-add-fare-body { max-height:72vh; padding:21px 22px 16px!important; overflow-y:auto; }
.trip-add-fare-body .v-field { border-radius:9px!important; }
.trip-add-fare-body .v-label { color:#64748b; font-size:13px; font-weight:650; opacity:1; }
.trip-add-fare-body .v-field__input { color:#1e293b; font-size:13px; font-weight:650; }
.trip-add-fare-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }
.trip-add-fare-section-label--spaced { margin-top:8px; }
.trip-fare-stop-menu .v-list { max-height:330px!important; padding:6px!important; border:1px solid #e2e8f0; border-radius:10px; }
.trip-fare-stop-option { min-height:58px!important; margin:2px 0; padding:7px 10px!important; border-radius:9px!important; }
.trip-fare-stop-option:hover { background:#f5f8ff!important; }
.trip-fare-stop-option--inactive { background:#fffaf0!important; }
.trip-fare-stop-option--inactive:hover { background:#fff6df!important; }
.trip-fare-stop-copy { display:flex; flex-direction:column; min-width:0; }
.trip-fare-stop-copy strong { overflow:hidden; color:#1e293b; font-size:12.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.trip-fare-stop-copy span { margin-top:3px; overflow:hidden; color:#64748b; font-size:10.5px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.trip-fare-stop-option .v-chip { flex:0 0 auto; font-size:9px!important; font-weight:800!important; }
.trip-fare-inactive-warning { margin-top:12px; font-size:11.5px; font-weight:650; }
.trip-fare-unavailable-chip { display:block; width:max-content; margin-top:4px; font-size:9px!important; font-weight:800!important; }
.trip-add-fare-active-control { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:11px 13px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }
.trip-add-fare-active-control strong { display:block; color:#334155; font-size:11.5px; font-weight:800; }
.trip-add-fare-active-control small { display:block; margin-top:3px; color:#64748b; font-size:9.5px; line-height:1.35; }
.trip-add-fare-active-toggle { display:flex; align-items:center; gap:7px; color:#16875a; font-size:11px; font-weight:800; white-space:nowrap; }
.trip-add-fare-ticket-editor { overflow:hidden; border:1px solid #e5eaf1; border-radius:10px; }
.trip-add-fare-ticket-row { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(130px,.9fr) minmax(140px,.8fr); align-items:center; gap:12px; padding:10px 12px; border-bottom:1px solid #edf1f5; }
.trip-add-fare-ticket-row:last-child { border-bottom:0; }
.trip-add-fare-ticket-name { display:flex; align-items:center; gap:7px; min-width:0; color:#334155; }
.trip-add-fare-ticket-name strong { overflow:hidden; font-size:11.5px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.trip-add-fare-ticket-status { display:flex; align-items:center; justify-content:flex-end; gap:7px; font-size:10.5px; font-weight:800; white-space:nowrap; }
.enabled-text { color:#16875a; }
.disabled-text { color:#94a3b8; }
.trip-add-fare-empty-types { display:flex; align-items:center; justify-content:center; gap:7px; min-height:70px; color:#64748b; font-size:11px; font-weight:650; border:1px dashed #dce3ed; border-radius:10px; }
.trip-add-fare-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }
.trip-add-fare-actions .v-btn { min-height:39px; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.trip-add-fare-actions .v-btn:first-child { color:#475569!important; }
.trip-stop-config-section,
.trip-fare-config-section {
  overflow:hidden;
  background:#fff;
  border-color:#e1e5eb!important;
  border-radius:16px!important;
  box-shadow:0 3px 14px rgba(15,23,42,.035)!important;
}
.trip-stop-config-section .trip-config-toolbar,
.trip-fare-config-section .trip-config-toolbar {
  min-height:76px!important;
  padding:0 10px!important;
  background:#fff!important;
  border-bottom:1px solid #edf0f4;
}
.trip-stop-config-section .trip-config-toolbar .text-subtitle-1,
.trip-fare-config-section .trip-config-toolbar .text-subtitle-1 {
  color:#111827!important;
  font-size:15px!important;
  font-weight:800!important;
}
.trip-stop-config-section .trip-config-toolbar .text-caption,
.trip-fare-config-section .trip-config-toolbar .text-caption {
  color:#6b7280!important;
  font-size:11px!important;
  font-weight:500;
}
.trip-stop-config-section > .v-card-text,
.trip-fare-config-section > .v-card-text {
  padding:0!important;
}
.trip-stop-config-section .trip-table-manual-head,
.trip-fare-config-section .trip-table-manual-head {
  height:43px!important;
  min-height:43px!important;
  color:#374151!important;
  background:#f8fafc!important;
  border:0!important;
  border-bottom:1px solid #e5e7eb!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.trip-stop-config-section .trip-table-manual-head .v-card-text,
.trip-fare-config-section .trip-table-manual-head .v-card-text {
  padding:0 16px!important;
  color:#6b7280!important;
  font-size:10px!important;
  font-weight:800!important;
  letter-spacing:.045em;
  text-transform:uppercase;
}
.trip-stop-config-section .trip-step-table .v-data-table__wrapper,
.trip-fare-config-section .trip-step-table .v-data-table__wrapper {
  border:0!important;
  border-radius:0!important;
}
.trip-stop-config-section .trip-stop-row-card,
.trip-fare-config-section .trip-fare-row-card {
  min-height:54px;
  border:0!important;
  border-bottom:1px solid #edf0f3!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.trip-stop-config-section .trip-stop-row-card:hover,
.trip-fare-config-section .trip-fare-row-card:hover {
  background:#fbfcfe!important;
}
.trip-stop-config-section .trip-stop-row-card .v-card-text,
.trip-fare-config-section .trip-fare-row-card .v-card-text {
  min-height:54px;
  padding:6px 16px!important;
  color:#1f2937;
  font-size:12px;
  font-weight:600;
}
.trip-stop-config-section .trip-stop-row-card .font-weight-medium,
.trip-fare-config-section .trip-fare-row-card .font-weight-medium,
.trip-fare-config-section .trip-fare-row-card > .v-card-text > div > span {
  color:#1f2937!important;
  font-size:12px!important;
  font-weight:750!important;
}
.trip-stop-config-section .trip-stop-row-card .text-caption {
  color:#6b7280!important;
  font-size:10px!important;
}
.trip-stop-config-section .trip-stop-row-card .v-avatar {
  width:32px!important;
  height:32px!important;
  margin-right:10px!important;
  border-radius:8px!important;
}
.trip-stop-config-section .trip-stop-row-card .v-field {
  min-height:34px!important;
  border-radius:999px!important;
}
.trip-stop-config-section .trip-stop-row-card .v-field__input {
  justify-content:center;
  padding:0 7px!important;
  color:#374151;
  font-size:12px;
  font-weight:750;
  text-align:center;
}
.trip-stop-config-section .compact-inline-switch,
.trip-fare-config-section .compact-inline-switch {
  transform:scale(.86);
  transform-origin:center;
}
.trip-stop-association,
.trip-fare-association {
  gap:3px;
  overflow:hidden;
  white-space:nowrap;
}
.trip-stop-association .v-switch,
.trip-fare-association .v-switch {
  flex:0 0 auto;
  margin-inline:0!important;
}
.trip-stop-association > span,
.trip-fare-association > span {
  display:block;
  max-width:calc(100% - 39px);
  overflow:hidden;
  font-size:10px!important;
  font-weight:800!important;
  line-height:1.2;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.trip-stop-config-section .trip-step-table .v-data-table-footer,
.trip-fare-config-section .trip-step-table .v-data-table-footer {
  min-height:48px;
  padding:5px 16px;
  color:#6b7280;
  border-top:0;
  font-size:10.5px;
}
.trip-add-stop-button,
.trip-add-fare-button {
  min-height:38px!important;
  color:#fff!important;
  background:#111827!important;
  border-radius:999px!important;
  box-shadow:none!important;
}
.trip-add-stop-button:hover,
.trip-add-fare-button:hover {
  background:#000!important;
}
.trip-stop-search .v-field,
.trip-fare-search .v-field {
  min-height:38px!important;
  border-color:#d1d5db!important;
  border-radius:9px!important;
  box-shadow:none!important;
}
.trip-fare-config-section .trip-fare-row-card .v-chip {
  min-height:26px!important;
  padding-inline:8px!important;
  font-size:10px!important;
  font-weight:800!important;
}
.trip-fare-config-section .trip-fare-ticket-types-panel {
  margin:0 16px 8px;
  border-color:#e5e7eb!important;
  border-radius:10px!important;
}
.trip-add-stop-button,
.trip-add-fare-button {
  color:#fff!important;
  background:linear-gradient(100deg,#2454d6,#3266e4)!important;
  border-radius:9px!important;
}
.trip-add-stop-button:hover,
.trip-add-fare-button:hover {
  background:linear-gradient(100deg,#1e46b9,#2454d6)!important;
}
.trip-worker-toolbar-actions {
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:9px;
  padding:0 36px 0 0!important;
}
.trip-worker-search {
  min-width:180px;
  max-width:240px;
  margin-right:8px;
}
.trip-worker-search .v-field {
  min-height:38px!important;
  border-color:#d1d5db!important;
  border-radius:9px!important;
  background:#fff;
  box-shadow:none!important;
}
.trip-config-list-content {
  display:flex;
  flex:1 1 auto;
  flex-direction:column;
  min-height:0;
  padding:0!important;
  overflow:hidden;
}
.trip-list-scroll {
  flex:1 1 auto;
  min-height:0;
  overflow:auto;
  overscroll-behavior:contain;
}
.trip-list-header,
.trip-list-row {
  box-sizing:border-box;
  display:flex;
  align-items:center;
  min-width:900px;
}
.trip-list-header > div,
.trip-list-row > div {
  box-sizing:border-box;
  flex:0 0 auto;
  min-width:0;
}
.trip-list-column-centered {
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}
.trip-list-header {
  position:sticky;
  z-index:1;
  top:0;
  min-height:43px;
  padding:0 16px;
  color:#64748b;
  background:#f8fafc;
  border-bottom:1px solid #e5e7eb;
  font-size:10px;
  font-weight:800;
  letter-spacing:.045em;
  text-transform:uppercase;
}
.trip-list-row {
  min-height:58px;
  padding:7px 16px;
  color:#1f2937;
  background:#fff;
  border-bottom:1px solid #edf0f3;
  font-size:12px;
  font-weight:600;
  transition:background .15s ease;
}
.trip-list-row:hover {
  background:#fbfcfe;
}
.trip-list-avatar {
  flex:0 0 32px;
  width:32px!important;
  height:32px!important;
  margin-right:10px;
  border:1px solid #dce6ff;
  border-radius:8px!important;
}
.trip-stop-place,
.trip-worker-place {
  display:flex;
  align-items:center;
  min-width:0;
}
.trip-list-copy {
  display:flex;
  flex-direction:column;
  min-width:0;
}
.trip-list-copy strong {
  overflow:hidden;
  color:#1f2937;
  font-size:12px;
  font-weight:800;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.trip-list-copy span {
  margin-top:3px;
  overflow:hidden;
  color:#6b7280;
  font-size:10px;
  font-weight:600;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.trip-list-value {
  overflow:hidden;
  color:#374151;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.trip-list-primary {
  color:#1f2937;
  font-weight:800;
}
.trip-list-validity {
  display:flex;
  flex-direction:column;
  gap:2px;
  overflow:hidden;
  color:#374151;
  font-size:11px;
  line-height:1.2;
  white-space:nowrap;
}
.trip-list-status {
  display:flex;
  align-items:center;
  flex-direction:column;
  justify-content:center;
  gap:2px;
  overflow:hidden;
}
.trip-list-status .v-chip {
  min-height:26px!important;
  padding-inline:8px!important;
  font-size:10px!important;
  font-weight:800!important;
}
.trip-list-control,
.trip-list-action {
  display:flex;
  align-items:center;
  justify-content:center;
}
.trip-list-association {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  min-width:0;
  overflow:hidden;
  white-space:nowrap;
}
.trip-list-association .v-switch {
  flex:0 0 auto;
  margin-inline:0!important;
}
.trip-association-button {
  flex:0 0 40px;
  min-width:40px!important;
  width:40px!important;
  height:40px!important;
  margin-inline:0!important;
  padding:0!important;
}
.trip-list-association > span {
  display:block;
  max-width:calc(100% - 44px);
  overflow:hidden;
  font-size:10px;
  font-weight:800;
  line-height:1.2;
  text-overflow:ellipsis;
  white-space:nowrap;
}
/* Encabezado y filas comparten exactamente la misma grilla para mantener cada
   switch y acción bajo su columna, sin depender de porcentajes independientes. */
.trip-stop-list-header,
.trip-stop-list-row {
  display:grid!important;
  grid-template-columns:minmax(0, 1fr) 88px 88px 88px 150px 60px;
}
.trip-stop-list-header > div,
.trip-stop-list-row > div {
  width:auto!important;
  min-width:0;
}
.trip-stop-list-header > div:not(:first-child),
.trip-stop-list-row > div:nth-child(2),
.trip-stop-list-row > div:nth-child(3),
.trip-stop-list-row > div:nth-child(4),
.trip-stop-list-row > div:nth-child(5),
.trip-stop-list-row > div:nth-child(6) {
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}
.trip-stop-list-header > div.trip-stop-column-header {
  display:block!important;
  align-self:center;
  justify-self:stretch;
  padding:0!important;
  text-align:center!important;
}
.trip-stop-list-header > div.trip-stop-column-header > span {
  display:block;
  width:100%;
  text-align:center!important;
}
.trip-stop-list-row > div:nth-child(2) .v-switch,
.trip-stop-list-row > div:nth-child(3) .v-switch,
.trip-stop-list-row > div:nth-child(4) .v-switch {
  flex:0 0 52px!important;
  width:52px!important;
  min-width:52px!important;
  max-width:52px!important;
  margin-inline:auto!important;
}
.trip-stop-order-cell {
  padding-inline:7px;
}
.trip-stop-order-cell .v-field {
  min-height:34px!important;
  border-radius:999px!important;
}
.trip-stop-order-cell .v-field__input {
  justify-content:center;
  padding-inline:6px!important;
  color:#374151;
  font-size:12px;
  font-weight:750;
  text-align:center;
}
.trip-list-state {
  display:flex;
  align-items:center;
  justify-content:center;
  min-width:900px;
  min-height:90px;
  padding:16px;
  color:#64748b;
  font-size:12px;
  font-weight:600;
}
.trip-fare-list-row {
  flex-wrap:wrap;
}
.trip-fare-expanded {
  flex:0 0 100%!important;
  width:100%;
  padding:8px 0 0;
}
.trip-fare-expanded .trip-fare-ticket-types-panel {
  margin:0;
}
.trip-fare-expand-button {
  width:30px!important;
  height:30px!important;
  border-color:#2454d6!important;
}
@media(max-width:600px) {
 .trip-time-panel { padding:12px; }
 .trip-time-journey { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:12px; }
 .trip-time-duration { grid-column:1 / -1; grid-row:2; display:flex; justify-content:center; gap:8px; }
 .trip-time-duration > div { margin:0; }
 .trip-time-value { font-size:27px; }
   .trip-departure-input .v-field__input { font-size:27px; }
  .trip-time-panel-heading > span { font-size:10px; }
  .trip-stop-toolbar-actions { align-items:stretch; flex-direction:column; padding:8px 14px 0 0; }
  .trip-stop-search { width:100%; max-width:none; }
  .trip-add-stop-button { width:100%; }
  .trip-add-stop-body { padding:17px 14px 12px!important; }
  .trip-add-stop-switch-grid { grid-template-columns:1fr; }
  .trip-add-stop-header { padding:14px; }
  .trip-add-stop-actions { padding-inline:14px!important; }
  .trip-fare-toolbar-actions { align-items:stretch; flex-direction:column; padding:8px 14px 0 0; }
  .trip-fare-search { width:100%; max-width:none; }
  .trip-add-fare-button { width:100%; }
  .trip-add-fare-body { padding:17px 14px 12px!important; }
  .trip-add-fare-header { padding:14px; }
  .trip-add-fare-ticket-row { grid-template-columns:1fr; gap:7px; }
  .trip-add-fare-ticket-status { justify-content:space-between; }
  .trip-add-fare-actions { padding-inline:14px!important; }
  .trip-worker-toolbar-actions { align-items:stretch; flex-direction:column; padding:8px 36px 0 0!important; }
  .trip-worker-search { width:100%; max-width:none; }
}
</style>
