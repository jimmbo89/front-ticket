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

      <v-data-table
        :headers="headers"
        :items="sortedTrips"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        class="busgo-table trips-main-table"
      >
        <template #headers>
<tr><th colspan="100" class="trip-header-shell">
          <div class="busgo-table-head">
            <div class="trip-col-code trip-sortable" @click="toggleTripSort('code')">
              <span>Código</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('code') }}</v-icon>
            </div>
            <div class="trip-col-route trip-sortable" @click="toggleTripSort('routeCode')">
              <span>Ruta</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('routeCode') }}</v-icon>
            </div>
            <div
              class="trip-col-vehicle trip-sortable"
              @click="toggleTripSort('vehicleName')"
            >
              <span>Vehículo</span>
              <v-icon size="16" class="ml-1">
                {{ tripSortIcon('vehicleName') }}
              </v-icon>
            </div>
            <div class="trip-col-workers trip-sortable" @click="toggleTripSort('workers')">
              <span>Trabajadores</span>
              <v-icon size="16" class="ml-1">
                {{ tripSortIcon('workers') }}
              </v-icon>
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
            <div class="trip-col-end trip-sortable" @click="toggleTripSort('end')">
              <span>Llegada</span>
              <v-icon size="16" class="ml-1">{{ tripSortIcon('end') }}</v-icon>
            </div>
            <div class="trip-col-actions">Acciones</div>
          </div>
        
</th></tr>
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

                <div class="trip-col-vehicle busgo-name-cell">
                  <div class="trip-vehicle-icon"><v-icon size="18">mdi-bus</v-icon></div>

                  <div class="min-width-0">
                    <div class="busgo-name">
                      {{ slotProps.item.vehicleName }}
                    </div>

                    <div class="busgo-submeta text-truncate">
                      {{ vehicleInternalNumber(slotProps.item) }}
                    </div>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Vehículo: {{ slotProps.item.vehicleName }}<br />
                      Número interno: {{ vehicleInternalNumber(slotProps.item) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-col-workers">
                  <div class="trip-worker-row">
                    <v-tooltip
                      v-for="person in slotProps.item.workers || []"
                      :key="person.id"
                      location="bottom"
                    >
                      <template #activator="{ props }">
                        <v-avatar
                          class="trip-worker-avatar"
                          size="32"
                          elevation="3"
                          v-bind="props"
                        >
                          <v-img :src="getImageUrl(person.image)" alt="image" />
                        </v-avatar>
                      </template>

                      <span>{{ person.name }}</span>
                      <v-spacer />
                      <span class="text-secondary">{{ person.roleName }}</span>
                    </v-tooltip>
                  </div>
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
                      <v-chip
                        v-bind="props"
                        :color="getSaleModeColor(slotProps.item)"
                        size="small"
                        variant="tonal"
                        class="trip-sale-mode-chip"
                      >
                        {{ getSaleModeShortName(slotProps.item) }}
                      </v-chip>
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
                      {{ formatTripDate(slotProps.item.end) }}
                    </span>
                    <span class="trip-datetime-time">
                      {{ formatTripTime(slotProps.item.end) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      {{ formatTripDateTimeTooltip("Llegada", slotProps.item.end) }}
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
      </v-data-table>
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
                        <span class="trip-selected-label">{{ item.raw.routeCode || item.raw.name }} · {{ item.raw.originAddress }} → {{ item.raw.destinationAddress }}</span>
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
                  <v-col cols="12">
                    <section class="trip-time-panel" aria-label="Horario del viaje">
                      <div class="trip-time-panel-heading"><v-icon size="18">mdi-clock-outline</v-icon><strong>Horario del viaje</strong><span>Formato 24 horas</span></div>
                      <div class="trip-time-journey">
                        <v-input
                          :model-value="editedItem.schedule"
                          :rules="selectRules"
                          :disabled="!editedItem.route_id"
                          hide-details="auto"
                          class="trip-departure-input"
                        >
                          <v-menu location="bottom start" :close-on-content-click="true" :disabled="!editedItem.route_id" content-class="trip-time-menu">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="trip-time-trigger" :disabled="!editedItem.route_id" aria-label="Seleccionar hora de salida">
                                <span class="trip-time-label"><v-icon size="17">mdi-clock-start</v-icon>Salida</span>
                                <span class="trip-time-value">{{ editedItem.schedule || '— : —' }}</span>
                                <span class="trip-time-trigger-caption">{{ editedItem.schedule ? 'Cambiar horario' : 'Elegir horario' }}<v-icon size="17">mdi-chevron-down</v-icon></span>
                              </button>
                            </template>
                            <v-card class="trip-time-picker" elevation="8">
                              <div class="trip-time-picker-heading"><strong>Selecciona la salida</strong><span>{{ dateFormatted }} · Horarios disponibles</span></div>
                              <div v-if="filteredTimeSlots.length" class="trip-time-grid" role="group" aria-label="Horarios disponibles">
                                <button
                                  v-for="time in filteredTimeSlots"
                                  :key="time"
                                  type="button"
                                  class="trip-time-option"
                                  :class="{ 'trip-time-option--selected': editedItem.schedule === time }"
                                  :aria-pressed="editedItem.schedule === time"
                                  @click="editedItem.schedule = time; updateArrival()"
                                >{{ time }}</button>
                              </div>
                              <div v-else class="trip-time-empty"><v-icon size="24">mdi-clock-alert-outline</v-icon>No hay horarios disponibles para esta fecha.</div>
                              <div class="trip-time-picker-note"><v-icon size="14">mdi-information-outline</v-icon>Solo se muestran los horarios permitidos para el viaje.</div>
                            </v-card>
                          </v-menu>
                        </v-input>
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

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="editedItem.saleMode"
                      :items="saleModes"
                      label="Modo de venta"
                      :menu-props="{ contentClass: 'trip-standard-menu' }"
                      prepend-inner-icon="mdi-ticket-confirmation-outline"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                    />
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
                <v-sheet border class="trip-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Paradas del viaje</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          La última columna agrega o quita la asociación de la parada al
                          viaje. La tabla muestra la información propia de la parada.
                        </div>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="tripStopsHeaders"
                      :items="tripStopRows"
                      class="elevation-1 trip-step-table"
                      style="max-height: 68vh; overflow-y: auto"
                      :items-per-page-text="'Elementos por páginas'"
                      no-data-text="No hay datos disponibles"
                      :loading="loading"
                      loading-text="Cargando datos..."
                      fixed-header
                    >
                      <template #headers>
<tr><th colspan="100" class="trip-header-shell">
                        <v-card
                          flat
                          color="blue-grey-lighten-5"
                          class="trip-table-manual-head"
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
                            <div style="width: 24%; min-width: 0" class="text-left font-weight-bold">
                              Parada
                            </div>

                            <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                              Orden
                            </div>

                            <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                              Distancia
                            </div>

                            <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                              Minutos
                            </div>

                            <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                              Subir
                            </div>

                            <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                              Bajar
                            </div>

                            <div style="width: 9%; min-width: 0" class="text-left font-weight-bold">
                              Estado
                            </div>

                            <div style="width: 12%; min-width: 0" class="d-flex justify-left font-weight-bold">
                              Asociar al viaje
                            </div>
                          </v-card-text>
                        </v-card>
                      
</th></tr>
</template>

                      <template #item="slotProps">
                        <tr>
                          <td colspan="100%" style="padding: 0; border: none">
                            <v-card
                              class="trip-stop-row-card"
                              elevation="1"
                              density="comfortable"
                              flat
                              :style="{
                                opacity: slotProps.item.included ? 1 : 0.85,
                                border: slotProps.item.included
                                  ? '1px solid #e5e7eb'
                                  : '1px dashed #cbd5e1'
                              }"
                            >
                              <v-card-text
                                class="d-flex align-center pa-2"
                                style="width: 100%; min-width: 0"
                              >
                                <div
                                  class="d-flex align-center"
                                  style="width: 24%; min-width: 0"
                                >
                                  <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                                    <v-img
                                      :src="getImageUrl(slotProps.item.locationImage)"
                                      alt="image"
                                      cover
                                    />
                                  </v-avatar>

                                  <div class="text-truncate">
                                    <div class="font-weight-medium">
                                      {{ slotProps.item.locationName }}
                                    </div>

                                    <div class="text-caption text-grey text-truncate">
                                      {{ slotProps.item.locationCity }},
                                      {{ slotProps.item.locationCountry }}
                                    </div>
                                  </div>
                                </div>

                                <div style="width: 11%; min-width: 0" class="px-1">
                                  <v-text-field
                                    v-model="slotProps.item.stop_order"
                                    type="number"
                                    min="1"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    @update:modelValue="syncTripStopTimes"
                                  />
                                </div>

                                <div style="width: 11%; min-width: 0" class="text-truncate">
                                  <div class="font-weight-medium">
                                    {{ slotProps.item.distance_km }} km
                                  </div>
                                </div>

                                <div style="width: 11%; min-width: 0" class="text-truncate">
                                  <div class="font-weight-medium">
                                    {{ slotProps.item.minutes_from_origin }} min
                                  </div>
                                </div>

                                <div style="width: 11%; min-width: 0" class="d-flex justify-center">
                                  <v-switch
                                    v-model="slotProps.item.can_board"
                                    :true-value="true"
                                    :false-value="false"
                                    :color="
                                      slotProps.item.can_board
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    :base-color="
                                      slotProps.item.can_board
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    density="compact"
                                    hide-details
                                    inset
                                    class="custom-switch compact-inline-switch"
                                    @update:modelValue="onTripStopIncludedChange"
                                  />
                                </div>

                                <div style="width: 11%; min-width: 0" class="d-flex justify-center">
                                  <v-switch
                                    v-model="slotProps.item.can_alight"
                                    :true-value="true"
                                    :false-value="false"
                                    :color="
                                      slotProps.item.can_alight
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    :base-color="
                                      slotProps.item.can_alight
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    density="compact"
                                    hide-details
                                    inset
                                    class="custom-switch compact-inline-switch"
                                    @update:modelValue="onTripStopIncludedChange"
                                  />
                                </div>

                                <div style="width: 9%; min-width: 0" class="d-flex justify-center">
                                  <v-switch
                                    v-model="slotProps.item.active"
                                    :true-value="true"
                                    :false-value="false"
                                    :color="
                                      slotProps.item.active
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    :base-color="
                                      slotProps.item.active
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    density="compact"
                                    hide-details
                                    inset
                                    class="custom-switch compact-inline-switch"
                                    @update:modelValue="onTripStopIncludedChange"
                                  />
                                </div>

                                <div style="width: 12%; min-width: 0" class="d-flex justify-center align-center">
                                  <v-switch
                                    v-model="slotProps.item.included"
                                    :true-value="true"
                                    :false-value="false"
                                    :color="
                                      slotProps.item.included
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    :base-color="
                                      slotProps.item.included
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    "
                                    density="compact"
                                    hide-details
                                    inset
                                    class="custom-switch compact-inline-switch"
                                    @update:modelValue="onTripStopIncludedChange"
                                  />

                                  <span
                                    class="ml-2 text-body-2 font-weight-medium text-no-wrap"
                                    :style="{
                                      color: slotProps.item.included
                                        ? paleteColors.green
                                        : paleteColors.grey
                                    }"
                                  >
                                    {{ slotProps.item.included ? "Asociada" : "Sin asociar" }}
                                  </span>
                                </div>
                              </v-card-text>
                            </v-card>
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
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
                <v-sheet border class="trip-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Tramos y tipos de pasaje</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          Define los tramos disponibles para el viaje y ajusta el precio
                          de cada tipo de pasaje.
                        </div>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="tripFaresHeaders"
                      :items="tripFareRows"
                      class="elevation-1 trip-step-table"
                      style="max-height: 68vh; overflow-y: auto"
                      :items-per-page-text="'Elementos por página'"
                      no-data-text="No hay datos disponibles"
                      :loading="loading"
                      loading-text="Cargando datos..."
                      fixed-header
                    >
                      <template #headers>
<tr><th colspan="100" class="trip-header-shell">
                        <v-card
                          flat
                          color="blue-grey-lighten-5"
                          class="trip-table-manual-head"
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
                            <div style="width: 28%; min-width: 0" class="text-left font-weight-bold">
                              Origen
                            </div>

                            <div style="width: 28%; min-width: 0" class="text-left font-weight-bold">
                              Destino
                            </div>

                            <div style="width: 14%; min-width: 0" class="text-left font-weight-bold">
                              Precio base
                            </div>

                            <div style="width: 18%; min-width: 0" class="text-left font-weight-bold">
                              Vigencia
                            </div>

                            <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                              Estado
                            </div>

                            <div style="width: 2%; min-width: 0" class="d-flex justify-left font-weight-bold"></div>
                          </v-card-text>
                        </v-card>
                      
</th></tr>
</template>

                      <template #item="slotProps">
                        <tr>
                          <td colspan="100%" style="padding: 0; border: none">
                            <v-card
                              class="trip-fare-row-card"
                              elevation="1"
                              density="comfortable"
                              flat
                            >
                              <v-card-text
                                class="d-flex align-center pa-2"
                                style="width: 100%; min-width: 0"
                              >
                                <div style="width: 28%; min-width: 0" class="text-truncate">
                                  <span>{{ slotProps.item.originLabel }}</span>
                                </div>

                                <div style="width: 28%; min-width: 0" class="text-truncate">
                                  <span>{{ slotProps.item.destinationLabel }}</span>
                                </div>

                                <div style="width: 14%; min-width: 0" class="text-truncate">
                                  <span>{{ formatNumber(slotProps.item.base_price) }}</span>
                                </div>

                                <div style="width: 18%; min-width: 0" class="text-truncate">
                                  <div>{{ slotProps.item.valid_from || "-" }}</div>
                                  <div>hasta {{ slotProps.item.valid_to || "-" }}</div>
                                </div>

                                <div style="width: 10%; min-width: 0" class="text-truncate">
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
                                </div>

                                <div
                                  class="d-flex gap-1"
                                  style="
                                    width: 2%;
                                    justify-content: flex-end;
                                    flex-wrap: nowrap;
                                  "
                                >
                                  <v-btn
                                    v-if="
                                      slotProps.item.fareSegmentTicketTypes &&
                                      slotProps.item.fareSegmentTicketTypes.length
                                    "
                                    size="35"
                                    icon
                                    variant="outlined"
                                    :style="{
                                      'border-width': '1px',
                                      'border-style': 'solid'
                                    }"
                                    :color="paleteColors.primary"
                                    @click="toggleTripFareExpanded(slotProps.item)"
                                    class="flex-shrink-0"
                                    title="Ver tipos de pasaje"
                                  >
                                    <v-icon size="20">
                                      {{
                                        isTripFareExpanded(slotProps.item)
                                          ? "mdi-chevron-up"
                                          : "mdi-chevron-down"
                                      }}
                                    </v-icon>
                                  </v-btn>
                                </div>
                              </v-card-text>

                              <v-expand-transition>
                                <div
                                  v-if="
                                    isTripFareExpanded(slotProps.item) &&
                                    slotProps.item.fareSegmentTicketTypes &&
                                    slotProps.item.fareSegmentTicketTypes.length
                                  "
                                  class="px-2 pb-2"
                                >
                                  <v-card
                                    variant="outlined"
                                    class="trip-fare-ticket-types-panel rounded-lg"
                                    elevation="0"
                                  >
                                    <div class="trip-fare-ticket-types-header">
                                      <div class="trip-fare-col-name">
                                        Tipo de pasajero
                                      </div>

                                      <div class="trip-fare-col-price">
                                        Precio (Bs.)
                                      </div>

                                      <div class="trip-fare-col-status">
                                        Habilitado
                                      </div>
                                    </div>

                                    <div
                                      v-for="(ticketType, ticketIndex) in slotProps.item
                                        .fareSegmentTicketTypes"
                                      :key="tripFareTicketTypeKey(ticketType, ticketIndex)"
                                      class="trip-fare-ticket-types-row"
                                    >
                                      <div class="trip-fare-col-name">
                                        <div class="font-weight-medium text-truncate">
                                          {{ ticketType.ticketTypeName }}
                                        </div>
                                      </div>

                                      <div class="trip-fare-col-price">
                                        <v-text-field
                                          v-model="ticketType.price"
                                          type="number"
                                          step="1"
                                          min="0"
                                          variant="outlined"
                                          density="compact"
                                          hide-details
                                        />
                                      </div>

                                      <div class="trip-fare-col-status">
                                        <div class="trip-fare-status-inline">
                                          <v-switch
                                            v-model="ticketType.active"
                                            :true-value="true"
                                            :false-value="false"
                                            :color="
                                              ticketType.active
                                                ? paleteColors.green
                                                : paleteColors.grey
                                            "
                                            :base-color="
                                              ticketType.active
                                                ? paleteColors.green
                                                : paleteColors.grey
                                            "
                                            density="compact"
                                            hide-details
                                            inset
                                            class="trip-fare-row-switch"
                                          />

                                          <span
                                            class="trip-fare-status-label text-body-2"
                                            :style="{
                                              color: ticketType.active
                                                ? paleteColors.green
                                                : paleteColors.grey
                                            }"
                                          >
                                            {{ ticketType.active ? "Si" : "No" }}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </v-card>
                                </div>
                              </v-expand-transition>
                            </v-card>
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
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
                <v-sheet border class="trip-config-section">
                  <v-toolbar class="trip-config-toolbar" color="transparent">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Relación de Trabajadores</strong>
                        </span>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="headersWorkers"
                      :items="filteredWorkers"
                      class="elevation-1 trip-step-table"
                      style="max-height: 68vh; overflow-y: auto"
                      :items-per-page-text="'Elementos por páginas'"
                      no-data-text="No hay datos disponibles"
                      :loading="loading"
                      loading-text="Cargando datos..."
                    >
                      <template #item.workerName="{ item }">
                        <v-avatar
                          class="mr-1"
                          elevation="3"
                          color="grey-lighten-4"
                          size="large"
                        >
                          <v-img :src="getImageUrl(item.workerImage)" alt="image" />
                        </v-avatar>

                        {{ item.workerName }}
                      </template>

                      <template #item.actions="{ item }">
                        <div class="trip-worker-assignment-inline">
                          <v-switch
                            :model-value="isWorkerAssociated(item)"
                            @update:model-value="
                              (value) => {
                                value
                                  ? saveAssignedWorker(item)
                                  : deleteItemWorker(item);
                              }
                            "
                            :true-value="true"
                            :false-value="false"
                            :color="
                              isWorkerAssociated(item)
                                ? paleteColors.green
                                : paleteColors.grey
                            "
                            :base-color="
                              isWorkerAssociated(item)
                                ? paleteColors.green
                                : paleteColors.grey
                            "
                            density="compact"
                            hide-details
                            inset
                            class="trip-worker-assignment-switch"
                            :title="
                              isWorkerAssociated(item)
                                ? 'Quitar trabajador del viaje'
                                : 'Asignar trabajador al viaje'
                            "
                          />
                          <span
                            class="text-body-2 trip-worker-assignment-label"
                            :style="{
                              color: isWorkerAssociated(item)
                                ? paleteColors.green
                                : paleteColors.grey
                            }"
                          >
                            {{ isWorkerAssociated(item) ? "Asignado" : "Sin asignar" }}
                          </span>
                        </div>
                      </template>
                    </v-data-table>
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
    mostrar: false,
    dialog: false,
    timeSlots: [], // Array para almacenar los slots ordenados
    currentTimeSlots: [], // Array para los slots filtrados segÃºn fecha
    dialogDelete: false,
    estimated: 0,
    timeSlotsKey: 0,
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
    filteredWorkers: [],
    tripStopRows: [],
    tripFareRows: [],
    expandedTripFareIds: [],
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
      { title: "Llegada", value: "end" },
      { title: "Acciones", value: "actions", sortable: false, width: "10%" },
    ],

    headersWorkers: [
      { title: "Nombre", value: "workerName", width: "60%" },
      { title: "Rol", value: "roleName", width: "20%" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
    ],
    tripStopsHeaders: [
      { title: "Parada", value: "locationName", width: "24%" },
      { title: "Orden", value: "stop_order", width: "11%" },
      { title: "Distancia", value: "distance_km", width: "11%" },
      { title: "Minutos", value: "minutes_from_origin", width: "11%" },
      { title: "Subir", value: "can_board", width: "11%" },
      { title: "Bajar", value: "can_alight", width: "11%" },
      { title: "Estado", value: "active", width: "9%" },
      { title: "Asociar", value: "included", width: "12%" },
    ],
    tripFaresHeaders: [
      { title: "Origen", value: "originLabel", width: "28%" },
      { title: "Destino", value: "destinationLabel", width: "28%" },
      { title: "Precio base", value: "base_price", width: "14%" },
      { title: "Vigencia", value: "valid_from", width: "18%" },
      { title: "Estado", value: "active", width: "10%" },
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
      workers: [],
      tripStops: [],
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
      workers: [],
      tripStops: [],
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
      workers: [],
      tripStops: [],
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
    filteredTimeSlots() {
      return this.generateTimeSlots();
    },
    vehicleWorkers() {
      const selectedVehicleId = Number(this.editedItem.vehicle_id);

      if (!Number.isFinite(selectedVehicleId) || selectedVehicleId <= 0) {
        return [];
      }

      return (this.workers || []).filter((worker) =>
        (worker.vehicles || []).some(
          (vehicle) => Number(vehicle.id) === Number(selectedVehicleId)
        )
      );
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
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.permissions = LocalStorageService.getItem("permissions");
    if (this.hasPermission("view_trips_company")) {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  watch: {
    // Observar cambios en la fecha para resetear selecciÃ³n
    "editedItem.date"(newDate) {
      this.generateTimeSlots();
      this.syncTripStopTimes();
    },
  },
  methods: {
    getRoutesCollection() {
      return Array.isArray(this.routes) ? this.routes : Object.values(this.routes || {});
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

      if (field === "workers") {
        return (trip.workers || []).map((worker) => worker?.name || "").join(" ");
      }

      if (field === "vehicleName") {
        return trip.vehicleName || trip.plate || "";
      }

      if (field === "saleMode") {
        return this.normalizeTripSaleMode(trip);
      }

      return trip[field] ?? "";
    },
    getDefaultSaleMode() {
      return this.saleModes[0]?.id || "normal";
    },
    normalizeTripSaleMode(trip = {}) {
      return trip.saleMode || trip.sale_mode || this.getDefaultSaleMode();
    },
    normalizeSaleModeOption(mode = {}) {
      const id = mode.id || mode.value || "normal";
      return {
        ...mode,
        id,
        name: String(id).toLowerCase() === "normal" ? "Venta Full" : mode.name,
      };
    },
    normalizeSaleModeOptions(modes = []) {
      const source = Array.isArray(modes) && modes.length
        ? modes
        : [{ id: "normal", name: "Venta Full" }];
      return source.map((mode) => this.normalizeSaleModeOption(mode));
    },
    getSaleModeName(trip = {}) {
      const saleMode = this.normalizeTripSaleMode(trip);
      const fallbackNames = {
        normal: "Venta Full",
        express: "Venta Express",
      };
      if (saleMode === "normal") {
        return fallbackNames.normal;
      }
      return this.saleModes.find((mode) => mode.id === saleMode)?.name || fallbackNames[saleMode] || saleMode;
    },
    getSaleModeShortName(trip = {}) {
      return this.getSaleModeName(trip).replace(/^Venta\s+/i, "");
    },
    getSaleModeColor(trip = {}) {
      return this.normalizeTripSaleMode(trip) === "express" ? "green" : "primary";
    },
    ensureTripSaleMode({ useDefault = false } = {}) {
      if (useDefault || !this.editedItem.saleMode) {
        this.editedItem.saleMode = this.getDefaultSaleMode();
      }
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
    isTripFareExpanded(item) {
      const itemId = Number(item?.id);
      return this.expandedTripFareIds.includes(itemId);
    },
    toggleTripFareExpanded(item) {
      const itemId = Number(item?.id);
      if (!Number.isFinite(itemId) || itemId <= 0) {
        return;
      }

      this.expandedTripFareIds = this.expandedTripFareIds[0] === itemId ? [] : [itemId];
    },
    buildTripFareRows(route = null, tripFares = [], forceIncludeAll = false) {
      const selectedRoute = route || this.selectedRouteRecord;
      const fareSegments = Array.isArray(selectedRoute?.fareSegments)
        ? selectedRoute.fareSegments
        : Array.isArray(selectedRoute?.fare_segments)
          ? selectedRoute.fare_segments
          : [];

      const fareMap = new Map(
        (Array.isArray(tripFares) ? tripFares : []).map((fare) => [
          Number(fare.fare_segment_ticket_type_id ?? fare.fareSegmentTicketTypeId),
          fare,
        ])
      );

      return fareSegments.map((segment) => {
        const originStop = segment.originRouteStop ?? segment.origin_route_stop ?? null;
        const destinationStop =
          segment.destinationRouteStop ?? segment.destination_route_stop ?? null;
        const ticketTypes = Array.isArray(segment.fareSegmentTicketTypes)
          ? segment.fareSegmentTicketTypes
          : Array.isArray(segment.fare_segment_ticket_types)
            ? segment.fare_segment_ticket_types
            : [];

        return {
          ...segment,
          originLabel: this.getRouteStopDisplayLabel(
            originStop?.location || originStop || segment.originStop
          ),
          destinationLabel: this.getRouteStopDisplayLabel(
            destinationStop?.location || destinationStop || segment.destinationStop
          ),
          fareSegmentTicketTypes: ticketTypes.map((ticketType) => {
            const existingFare = fareMap.get(Number(ticketType.id));
            const routeActive =
              ticketType.active ??
              ticketType.ticketTypeActive ??
              ticketType.ticketType?.active ??
              false;

            return {
              id: existingFare?.id || "",
              fare_segment_ticket_type_id: ticketType.id,
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
          included: forceIncludeAll || true,
        };
      });
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
    normalizeTripFaresPayload(rows = []) {
      const payload = [];

      (Array.isArray(rows) ? rows : []).forEach((segment) => {
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

      return payload.sort(
        (a, b) => a.fare_segment_ticket_type_id - b.fare_segment_ticket_type_id
      );
    },
    areTripFaresDifferent(originalFares, editedRows) {
      const normalize = (rows = []) =>
        this.normalizeTripFaresPayload(
          Array.isArray(rows)
            ? rows
            : Array.isArray(rows?.fareSegmentTicketTypes)
              ? rows.fareSegmentTicketTypes
              : []
        ).map(({ source_type, ...rest }) => rest);

      return !_.isEqual(normalize(originalFares), normalize(editedRows));
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
    generateTimeSlots() {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isToday = this.today(
        this.editedItem.date || new Date().toISOString().split("T")[0]
      );
      const slots = [];

      // Generar todos los slots posibles
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          const slotMinutes = hour * 60 + minute;
          const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0"
          )}`;

          slots.push({
            time: timeStr,
            minutes: slotMinutes,
          });
        }
      }

      // Si estamos editando, incluir el slot actual aunque estÃ© en el pasado
      if (this.editedIndex !== -1 && this.editedItem.schedule) {
        const currentSlot = slots.find((s) => s.time === this.editedItem.schedule);
        if (currentSlot && isToday && currentSlot.minutes <= currentMinutes) {
          return [
            this.editedItem.schedule,
            ...slots.filter((s) => s.minutes > currentMinutes).map((s) => s.time),
          ];
        }
      }

      // Para creaciÃ³n o slots futuros
      return isToday
        ? slots.filter((s) => s.minutes > currentMinutes).map((s) => s.time)
        : slots.map((s) => s.time);
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
      const routeStops = Array.isArray(selectedRoute?.routeStops)
        ? selectedRoute.routeStops
        : [];
      const stopMap = new Map(
        (Array.isArray(tripStops) ? tripStops : []).map((stop) => [
          Number(stop.route_stop_id),
          stop,
        ])
      );
      const baseDateTime = this.getTripBaseDateTime();

      return routeStops.map((routeStop) => {
        const existingStop = stopMap.get(Number(routeStop.id));
        const included = forceIncludeAll ? true : !!existingStop;
        return {
          id: existingStop?.id || "",
          route_stop_id: routeStop.id,
          location_id: routeStop.location_id || routeStop.locationId || "",
          companyName: routeStop.companyName || "",
          routeName: routeStop.routeName || "",
          stop_order: routeStop.stop_order ?? routeStop.stopOrder ?? 1,
          distance_km: routeStop.distance_km ?? routeStop.distanceKm ?? 0,
          minutes_from_origin:
            routeStop.minutes_from_origin ?? routeStop.minutesFromOrigin ?? 0,
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
          active: existingStop?.active ?? routeStop.active ?? true,
          source_type: existingStop?.source_type || "auto",
          included,
          locationName: routeStop.locationName || routeStop.address || "",
          locationCity: routeStop.locationCity || "",
          locationCountry: routeStop.locationCountry || "",
          locationImage:
            routeStop.image || routeStop.locationImage || "locations/default.jpg",
        };
      });
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
    },
    normalizeTripStopsPayload(rows = []) {
      return (Array.isArray(rows) ? rows : [])
        .filter((row) => row.included)
        .map((row) => {
          const payload = {
            route_stop_id: Number(row.route_stop_id),
            stop_order: Number(row.stop_order) || 1,
            arrival_time: row.arrival_time,
            departure_time: row.departure_time,
            can_board: !!row.can_board,
            can_alight: !!row.can_alight,
            active: row.active ?? true,
            source_type: row.source_type || "auto",
          };

          if (row.id) {
            payload.id = row.id;
          }

          return payload;
        })
        .sort((a, b) => a.route_stop_id - b.route_stop_id);
    },
    areTripStopsDifferent(originalStops, editedStops) {
      const normalizeForCompare = (rows = []) =>
        this.normalizeTripStopsPayload(rows || []).map(
          ({ arrival_time, departure_time, ...rest }) => rest
        );

      return !_.isEqual(
        normalizeForCompare(originalStops),
        normalizeForCompare(editedStops)
      );
    },
    onTripStopIncludedChange() {
      this.syncTripStopTimes();
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
          this.branches = result.data?.branches || [];
          this.editedItem.branch_id = this.branches[0].id;
          this.branch_id = this.branches[0].id;
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
        this.mostrarFila = true;
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

    today(date) {
      // Obtener la fecha actual
      const hoy = new Date();

      // Formatear la fecha actual al mismo formato YYYY-MM-DD
      const ano = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      const hoyFormateado = `${ano}-${mes}-${dia}`;

      // Comparar con la fecha proporcionada
      return date === hoyFormateado;
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
          this.vehicles = result.data?.tripvehicles || [];
          this.workers = result.data?.tripworkers || [];
          this.saleModes = this.normalizeSaleModeOptions(result.data?.saleModes);
          this.ensureTripSaleMode({ useDefault: resetSelections });
          this.filterWorkers();

          if (resetSelections) {
            this.editedItem.route_id = "";
            this.editedItem.vehicle_id = "";
            this.editedItem.workers = [];
            this.tripStopRows = [];
            this.tripFareRows = [];
            this.expandedTripFareIds = [];
            this.estimated = null;
            this.editedItem.arrival = null;
          }
        } else {
          this.routes = [];
          this.vehicles = [];
          this.workers = [];
          this.filteredWorkers = [];
          this.saleModes = this.normalizeSaleModeOptions();
          this.ensureTripSaleMode();
        }
      } catch (error) {
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
      this.tripStopRows = [];
      this.tripFareRows = [];
      this.expandedTripFareIds = [];
      this.editedIndex = -1;
      this.dialog = false;
      this.file = null;
      this.imgMiniatura = "";
      this.editedItem = Object.assign({}, this.defaultItem);
      this.originalItem = Object.assign({}, this.defaultItem);
      this.editedItem.branch_id = this.branch_id;
      this.timeSlotsKey = Date.now();
      await this.loadTripFormData(this.editedItem.branch_id, {
        resetSelections: true,
      });
      this.syncTripStopsFromRoute(true);
      this.syncTripFareRows(true);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.originalItem = Object.assign({}, this.defaultItem);
      });
      this.file = null;
      this.imgMiniatura = "";
      this.editedIndex = -1;
      this.tripStopRows = [];
      this.tripFareRows = [];
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
        this.workers.find((item) => Number(item.id) === Number(this.selectedWorker)) ||
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
    async initialize() {
      if (this.branch_id === "null") {
        this.trips = [];
        this.loading = false;
        return;
      }
      this.data = {};
      this.data.branch_id = this.branch_id;
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
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "get-trip-branch-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.trips = (result.data?.trips || []).map((trip) => ({
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
          "workers",
          "tripStops",
          "tripFares",
        ];

        let updatedFields = Object.keys(this.editedItem)
          .filter(
            (key) =>
              fieldsToUpdate.includes(key) &&
              (this.originalItem[key], this.editedItem[key])
          )
          .reduce((obj, key) => {
            if (key === "workers") {
              obj[key] = this.normalizeWorkersPayload(this.editedItem.workers);
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTripStopsPayload(this.tripStopRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTripFaresPayload(this.tripFareRows);
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.date = this.editedItem.date ? this.editedItem.date : new Date();
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "trip",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.branch_id = this.editedItem.branch_id ?? this.branch_id;
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
              this.valid = true;
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estÃ¡ndar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
            this.valid = true;
          }
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
          "workers",
          "tripStops",
          "tripFares",
        ];
        let updatedFields = Object.keys(this.editedItem)
          .filter(
            (key) =>
              fieldsToUpdate.includes(key) &&
              (key !== "workers"
                ? key !== "tripStops"
                  ? this.editedItem[key] !== this.originalItem[key]
                  : this.areTripStopsDifferent(
                    this.originalItem.tripStops,
                    this.tripStopRows
                  )
                : this.areWorkersDifferent(this.originalItem[key], this.editedItem[key])) // Compara el array people
          )
          .reduce((obj, key) => {
            if (key === "workers") {
              obj[key] = this.normalizeWorkersPayload(this.editedItem.workers);
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTripStopsPayload(this.tripStopRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTripFaresPayload(this.tripFareRows);
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
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
              this.branch_id = this.editedItem.branch_id ?? this.branch_id;
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estÃ¡ndar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
          }
        } else {
          this.showAlert("success", "No se realizaron cambios.", 3000);
          this.loading = false;
        }
      }
      this.close();
    },
    async editItem(item) {
      this.timeSlotsKey = Date.now();
      this.editedIndex = 1;
      this.step = 1;
      this.originalItem = _.cloneDeep(item);
      this.editedItem = _.cloneDeep(item);
      this.originalItem.saleMode = this.normalizeTripSaleMode(this.originalItem);
      this.editedItem.saleMode = this.normalizeTripSaleMode(this.editedItem);
      this.originalItem.tripFares = Array.isArray(this.originalItem.tripFares)
        ? this.originalItem.tripFares
        : [];
      this.editedItem.tripFares = Array.isArray(this.editedItem.tripFares)
        ? this.editedItem.tripFares
        : [];
      this.editedItem.branch_id = this.editedItem.branch_id ?? this.branch_id;
      await this.loadTripFormData(this.editedItem.branch_id, {
        resetSelections: false,
      });

      const matchedRoute = this.selectedRouteRecord;
      this.estimated = matchedRoute ? matchedRoute.estimated : null;
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

.trip-col-code {
  width: 11%;
  min-width: 0;
}

.trip-col-route {
  width: 22%;
  min-width: 0;
}

.trip-col-vehicle {
  width: 10%;
  min-width: 0;
}

.trip-col-workers {
  width: 12%;
  min-width: 0;
}

.trip-col-date {
  width: 10%;
  min-width: 0;
  white-space: nowrap;
}

.trip-col-schedule {
  width: 9%;
  min-width: 0;
}

.trip-col-sale-mode {
  width: 7%;
  min-width: 0;
}

.trip-col-start {
  width: 5%;
  min-width: 0;
}

.trip-col-end {
  width: 5%;
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
  width: 9%;
  min-width: 0;
}

.trip-sale-mode-chip {
  max-width: 100%;
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
  max-height: 52vh !important;
  overflow-y: auto !important;
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
  .trip-col-workers,
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
.trip-sortable { cursor:pointer; transition:color .15s ease; }.trip-sortable:hover { color:#2454d6; }.trip-code-value,.trip-route-title,.busgo-name { color:#0f172a; font-size:12px; font-weight:850; }.trip-route-meta,.busgo-submeta { color:#64748b; font-size:10px; font-weight:650; }.trip-vehicle-icon { display:grid; flex:0 0 32px; width:32px; height:32px; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:8px; }.trip-worker-avatar { width:30px!important; height:30px!important; border:2px solid #fff; box-shadow:0 2px 7px rgba(15,23,42,.13); }.trip-sale-mode-chip { font-size:9.5px!important; font-weight:800!important; }.trip-datetime-value { color:#334155; font-size:10px; font-weight:700; }.trip-datetime-time { color:#2454d6; font-weight:850; }.busgo-actions .v-btn { border-radius:8px!important; }

.trip-dialog { min-height:100vh; color:#1e293b; background:#f6f8fb; }.trip-dialog-header { z-index:5; display:grid; grid-template-columns:minmax(0,1fr) auto 42px; align-items:center; gap:18px; min-height:72px; padding:11px 22px; color:#fff; background:radial-gradient(circle at 88% -40%,rgba(53,184,232,.38),transparent 230px),linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6); box-shadow:0 5px 18px rgba(15,23,42,.18); }.trip-dialog-heading { display:flex; align-items:center; gap:11px; min-width:0; }.trip-dialog-icon { display:grid; flex:0 0 40px; width:40px; height:40px; place-items:center; color:#fff; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.17); border-radius:10px; }.trip-dialog-title { font-size:17px; font-weight:850; line-height:1.2; }.trip-dialog-subtitle { margin-top:3px; overflow:hidden; color:#dbe7ff; font-size:11px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }.trip-dialog-progress { display:flex; align-items:flex-end; flex-direction:column; }.trip-dialog-progress span { color:#b8cbf5; font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }.trip-dialog-progress strong { margin-top:2px; font-size:12px; font-weight:800; }.trip-dialog-close { color:#fff!important; border-radius:9px!important; }
.trip-dialog-body { background:#f6f8fb; }.trip-stepper { background:transparent!important; box-shadow:none!important; }.trip-stepper .v-stepper-header { min-height:66px; padding:4px 18px; background:#fff; border-bottom:1px solid #e7ecf3; box-shadow:none!important; }.trip-stepper .v-stepper-item { padding:11px 14px; }.trip-stepper .v-stepper-item__avatar { width:30px; height:30px; color:#526176; background:#eef2f7; font-size:11px; font-weight:850; }.trip-stepper .v-stepper-item--selected .v-stepper-item__avatar,.trip-stepper .v-stepper-item--complete .v-stepper-item__avatar { color:#fff; background:#2454d6; }.trip-stepper .v-stepper-item__title { color:#526176; font-size:11px; font-weight:750; }.trip-stepper .v-stepper-item--selected .v-stepper-item__title { color:#0f172a; font-weight:850; }.trip-stepper .v-divider { color:#dfe6ef; }
.trip-step-pane { padding:18px 24px 14px; }.trip-step-pane--summary .trip-step-content { max-width:1120px; width:100%; margin:0 auto; padding:18px 20px 8px; background:#fff; border:1px solid #e4eaf2; border-radius:13px; box-shadow:0 5px 18px rgba(15,23,42,.04); }.trip-step-pane--summary .v-row { margin-top:0!important; }.trip-step-pane--summary .v-col { padding:8px 10px; }.trip-step-pane--summary .v-field { min-height:51px; padding-inline:4px; background:#fff; border:1px solid #dce3ed; border-radius:9px 9px 0 0; }.trip-step-pane--summary .v-field--variant-underlined .v-field__outline::before { border-color:#dce3ed; }.trip-step-pane--summary .v-field__input { color:#1e293b; font-size:12.5px; font-weight:650; }.trip-step-pane--summary .v-label { color:#526176; font-size:12px; font-weight:700; opacity:1; }.trip-step-pane--summary .v-input__prepend .v-icon { color:#2454d6; }
.trip-config-section { overflow:hidden; background:#fff; border:1px solid #e1e8f1!important; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04); }.trip-config-toolbar { min-height:62px!important; color:#0f172a!important; background:#f8fafc!important; border-bottom:1px solid #e6ebf2; box-shadow:none!important; }.trip-config-toolbar .text-subtitle-1 { font-size:14px!important; font-weight:850!important; }.trip-config-toolbar .text-caption { color:#64748b!important; font-size:10.5px!important; font-weight:600; opacity:1!important; }.trip-config-section > .v-card-text { padding:13px!important; }.trip-step-table { max-height:54vh!important; background:transparent!important; box-shadow:none!important; }.trip-step-table .v-data-table-footer { min-height:48px; color:#475569; font-size:11px; }.trip-step-table .v-data-table__th { color:#334155!important; background:#f8fafc!important; font-size:10.5px!important; font-weight:850!important; text-transform:uppercase; }.trip-step-table .v-data-table__td { color:#334155; font-size:12px; font-weight:600; }
.trip-step-actions { max-width:1120px; width:100%; margin:12px auto 0; padding:12px 0 calc(8px + env(safe-area-inset-bottom)); border-top:1px solid #dfe5ed; }.trip-step-actions .v-row { align-items:center; margin:0!important; }.trip-step-actions .v-btn { min-width:108px; min-height:39px; border-radius:9px!important; font-size:12px; font-weight:800; letter-spacing:0; text-transform:none; }.trip-step-actions .v-btn:first-child { color:#475569!important; background:#fff!important; border:1px solid #dce3ed; }.trip-step-actions .v-btn:last-child { color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; box-shadow:0 5px 12px rgba(36,84,214,.18)!important; }.trip-step-actions .v-btn--disabled { color:#94a3b8!important; background:#e8edf4!important; box-shadow:none!important; }
.trip-fare-ticket-types-panel { border-color:#dfe6ef!important; border-radius:10px!important; }.trip-fare-ticket-types-header { color:#334155; background:#f8fafc; border-color:#e7ecf3; font-size:11px; font-weight:850; text-transform:uppercase; }.trip-fare-ticket-types-row { border-color:#edf1f5; font-size:12px; }

.trip-delete-dialog { padding:29px 27px 24px; color:#1e293b; text-align:center; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.trip-delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.trip-delete-title { color:#0f172a; font-size:18px; font-weight:850; }.trip-delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.trip-delete-actions { display:flex; justify-content:center; gap:9px; }.trip-cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; text-transform:none; border-radius:9px!important; }.trip-delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; text-transform:none; }.trip-worker-dialog { color:#1e293b; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.trip-worker-dialog-toolbar { color:#0f172a!important; background:#f8fafc!important; border-bottom:1px solid #e5eaf2; box-shadow:none!important; }.trip-worker-dialog-toolbar .text-subtitle-2 { font-size:14px!important; font-weight:850; }
.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar .v-snackbar__wrapper { border-radius:11px; }

.trip-route-menu { min-width:620px!important; max-width:min(720px,calc(100vw - 24px))!important; }.trip-route-menu .v-list { padding:7px!important; background:#f8fafc!important; }.trip-route-menu .v-card { overflow:hidden; background:#fff; border:1px solid #e5eaf2; border-radius:11px!important; box-shadow:none!important; }.trip-route-menu .v-card:hover { border-color:#cbd8f7; box-shadow:0 5px 15px rgba(36,84,214,.08)!important; }.trip-route-menu .v-list-item { padding:10px 12px!important; }.trip-route-menu .trip-route-title-row { padding-bottom:7px; color:#0f172a; border-bottom:1px solid #edf1f5; }.trip-route-menu .text-caption { color:#64748b!important; font-size:9px!important; font-weight:800; text-transform:uppercase; }.trip-route-menu .text-truncate { color:#1e293b; font-size:11px; font-weight:750; }.trip-route-menu .v-avatar { overflow:hidden; border:1px solid #dce6ff; border-radius:9px!important; }
.trip-vehicle-menu .v-list,.trip-branch-menu .v-list { padding:6px!important; }.trip-vehicle-menu .v-list-item,.trip-branch-menu .v-list-item { min-height:58px; margin:2px 0; border-radius:9px!important; }.trip-vehicle-menu .v-list-item:hover,.trip-branch-menu .v-list-item:hover { background:#f4f7ff!important; }.trip-vehicle-menu .v-list-item-title,.trip-branch-menu .v-list-item-title { color:#0f172a!important; font-size:12.5px!important; font-weight:800!important; }.trip-vehicle-menu .v-list-item-subtitle { color:#64748b!important; font-size:10.5px!important; font-weight:600!important; opacity:1!important; }

@media(max-width:959px) { .busgo-page-header { padding-inline:17px; }.busgo-container { padding:15px 17px 24px!important; }.trip-toolbar { align-items:stretch; }.trip-search { width:100%; }.trip-dialog-header { grid-template-columns:minmax(0,1fr) 42px; }.trip-dialog-progress { display:none; }.trip-step-pane { padding:14px 15px 10px; }.trip-stepper .v-stepper-header { overflow-x:auto; justify-content:flex-start; }.trip-stepper .v-stepper-item { flex:0 0 auto; }.trip-route-menu { min-width:calc(100vw - 24px)!important; } }
/* Una sola cabecera real en el Nivel 1: se conserva la cabecera visual alineada con las filas personalizadas. */
.trips-main-table thead { display:table-header-group!important; }
.busgo-table-head { display:flex!important; visibility:visible!important; }

/* Primer paso: formulario operativo, no formulario genérico. */
.trip-form-intro { display:flex; align-items:center; gap:11px; margin:-2px -2px 17px; padding:12px 13px; color:#1e293b; background:linear-gradient(100deg,#f4f7ff,#f8fbff); border:1px solid #dfe7fb; border-radius:10px; }.trip-form-intro-icon { display:grid; flex:0 0 36px; width:36px; height:36px; place-items:center; color:#2454d6; background:#fff; border:1px solid #dce6ff; border-radius:9px; }.trip-form-intro > div:last-child { display:flex; flex-direction:column; }.trip-form-intro strong { color:#0f172a; font-size:13px; font-weight:850; }.trip-form-intro span { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:600; }.trip-form-section-title { display:flex; align-items:center; gap:7px; margin:0 8px 4px; color:#334155; font-size:10.5px; font-weight:850; letter-spacing:.055em; text-transform:uppercase; }.trip-form-section-title .v-icon { color:#2454d6; }.trip-form-section-title--schedule { margin-top:10px; padding-top:14px; border-top:1px solid #edf1f5; }
.trip-step-pane--summary .v-field { min-height:50px; border:0; border-radius:9px!important; }.trip-step-pane--summary .v-field__outline { color:#d5deea; }.trip-step-pane--summary .v-field--focused .v-field__outline { color:#2454d6; }.trip-step-pane--summary .v-field__prepend-inner .v-icon { color:#64748b; }.trip-step-pane--summary .v-field--focused .v-field__prepend-inner .v-icon { color:#2454d6; }.trip-step-pane--summary .v-input__details { padding-inline:4px; }.trip-step-pane--summary .v-field--disabled { background:#f8fafc; opacity:.78; }

/* Tablas internas con la misma densidad y lenguaje visual del Nivel 1. */
.trip-config-section .trip-table-manual-head { height:40px!important; min-height:40px!important; margin:0!important; color:#334155!important; background:#f8fafc!important; border:1px solid #e8edf5!important; border-radius:9px 9px 0 0!important; box-shadow:none!important; }.trip-config-section .trip-table-manual-head .v-card-text { color:#334155; font-size:10px; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; }
.trip-stop-row-card,.trip-fare-row-card { margin:0!important; background:#fff!important; border:0!important; border-bottom:1px solid #edf1f5!important; border-radius:0!important; box-shadow:none!important; transition:background .15s ease; }.trip-stop-row-card:hover,.trip-fare-row-card:hover { background:#f8faff!important; }.trip-stop-row-card .v-card-text,.trip-fare-row-card .v-card-text { min-height:58px; padding:7px 14px!important; color:#334155; font-size:11.5px; font-weight:650; }.trip-stop-row-card .v-avatar { width:34px!important; height:34px!important; border:1px solid #dce6ff; border-radius:8px!important; }.trip-stop-row-card .font-weight-medium,.trip-fare-row-card .font-weight-medium { color:#1e293b; font-size:11.5px; font-weight:800!important; }.trip-stop-row-card .text-caption { color:#64748b!important; font-size:9.5px!important; }.trip-stop-row-card .v-field,.trip-fare-row-card .v-field,.trip-fare-ticket-types-row .v-field { background:#fff; border-radius:7px!important; }.trip-stop-row-card .v-field__outline,.trip-fare-row-card .v-field__outline { color:#dce3ed; }
.trip-step-table .v-data-table__wrapper { border:1px solid #e8edf5; border-radius:9px; }.trip-step-table thead th { height:40px!important; color:#334155!important; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; font-size:10px!important; font-weight:850!important; letter-spacing:.04em!important; text-transform:uppercase; }.trip-step-table tbody td { height:56px!important; color:#334155!important; border-bottom:1px solid #edf1f5!important; font-size:11.5px!important; font-weight:650!important; }.trip-step-table tbody tr:hover { background:#f8faff!important; }.trip-step-table .v-data-table-footer { border-top:1px solid #e8edf5; }

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
.trip-header-shell .busgo-table-head { white-space:normal; }
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
.trip-time-trigger { display:flex; flex-direction:column; align-items:flex-start; gap:8px; width:100%; padding:14px 16px; border:1px solid #b6cafa; border-radius:11px; background:#fff; text-align:left; cursor:pointer; transition:background .15s,border-color .15s; }
.trip-time-trigger:hover:not(:disabled) { background:#f0f5ff; border-color:#2454d6; }
.trip-time-trigger:focus-visible,.trip-time-option:focus-visible { outline:3px solid #7396eb; outline-offset:3px; }
.trip-time-trigger:disabled { cursor:not-allowed; background:#f1f5f9; border-color:#dce3ed; }
.trip-time-label { display:flex; align-items:center; gap:6px; color:#475569; font-size:12px; font-weight:700; }
.trip-time-value { display:block; color:#183d9c; font-size:32px; font-weight:800; line-height:1.15; letter-spacing:.015em; font-variant-numeric:tabular-nums; }
.trip-time-trigger:disabled .trip-time-value { color:#64748b; }
.trip-time-trigger-caption { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; color:#2454d6; font-size:11px; font-weight:650; }
.trip-time-duration { align-self:center; text-align:center; color:#526176; font-size:11px; font-weight:650; }
.trip-time-duration > div { display:flex; align-items:center; margin-top:8px; color:#8da8d8; }
.trip-time-duration > div > span { flex:1; height:1px; background:#c7d7f1; }
.trip-time-arrival { display:flex; flex-direction:column; gap:8px; padding:15px 0; }
.trip-time-arrival .trip-time-value { color:#0f172a; }
.trip-time-arrival-caption { color:#526176; font-size:11px; line-height:1.5; }
.trip-time-hint { display:flex; align-items:center; gap:7px; margin-top:14px; color:#526176; font-size:12px; }
.trip-time-menu { max-width:calc(100vw - 24px)!important; }
.trip-time-picker { width:360px; max-width:100%; color:#1e293b; background:#fff; border:1px solid #dce6f5; border-radius:13px!important; }
.trip-time-picker-heading { display:flex; flex-direction:column; gap:4px; padding:16px; border-bottom:1px solid #e8edf5; }
.trip-time-picker-heading strong { color:#0f172a; font-size:14px; }
.trip-time-picker-heading span { color:#526176; font-size:12px; }
.trip-time-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; max-height:min(320px,45vh); padding:14px; overflow-y:auto; overscroll-behavior:contain; }
.trip-time-option { min-height:42px; padding:7px; color:#334155; background:#f8fafc; border:1px solid #dce3ed; border-radius:8px; font-size:14px; font-weight:700; font-variant-numeric:tabular-nums; cursor:pointer; }
.trip-time-option:hover { color:#2454d6; background:#eef3ff; border-color:#a8bff8; }
.trip-time-option--selected,.trip-time-option--selected:hover { color:#fff; background:#2454d6; border-color:#2454d6; box-shadow:0 3px 7px #2454d62b; }
.trip-time-picker-note { display:flex; align-items:flex-start; gap:6px; padding:12px 14px; border-top:1px solid #e8edf5; color:#64748b; font-size:11px; line-height:1.5; }
.trip-time-empty { display:flex; align-items:center; gap:10px; padding:24px 16px; color:#526176; font-size:13px; }
@media(max-width:600px) {
 .trip-time-panel { padding:12px; }
 .trip-time-journey { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:12px; }
 .trip-time-duration { grid-column:1 / -1; grid-row:2; display:flex; justify-content:center; gap:8px; }
 .trip-time-duration > div { margin:0; }
 .trip-time-value { font-size:27px; }
 .trip-time-trigger { padding:12px; }
 .trip-time-panel-heading > span { font-size:10px; }
}
</style>
