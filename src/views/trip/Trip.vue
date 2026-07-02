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
      <v-icon>mdi-steering</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Viajes</div>
      <div class="busgo-page-subtitle">Gestionar viajes operacionales</div>
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
      Agregar Viaje
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Listado de viajes</div>
          <div class="busgo-card-subtitle">
            Administra rutas, vehículos, trabajadores, horarios y paradas.
          </div>
        </div>
      </div>

      <div class="trip-toolbar px-6 pb-4">
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
        :items="trips"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="busgo-table"
      >
        <template #top>
          <div class="busgo-table-head">
            <div class="trip-col-route">Ruta</div>
            <div class="trip-col-vehicle">Vehículo</div>
            <div class="trip-col-workers">Trabajadores</div>
            <div class="trip-col-date">Fecha</div>
            <div class="trip-col-schedule">Horario</div>
            <div class="trip-col-start">Salida</div>
            <div class="trip-col-end">Llegada</div>
            <div class="trip-col-actions">Acciones</div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row trip-row">
                <div class="trip-col-route">
                  <div class="trip-route-title">
                    {{ slotProps.item.name }}
                  </div>

                  <div class="trip-route-meta">
                    <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>

                    <span class="text-truncate">
                      Origen: {{ slotProps.item.origin }}
                    </span>

                    <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>

                    <span class="text-truncate">
                      Destino: {{ slotProps.item.destination }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Ruta: {{ slotProps.item.name }}<br />
                      Origen: {{ slotProps.item.origin }}<br />
                      Destino: {{ slotProps.item.destination }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-col-vehicle busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="getImageUrl(slotProps.item.vehicleImage)"
                      cover
                    />
                  </v-avatar>

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

                <div class="trip-col-start busgo-meta">
                  <span class="text-truncate">{{ slotProps.item.start }}</span>
                </div>

                <div class="trip-col-end busgo-meta">
                  <span class="text-truncate">{{ slotProps.item.end }}</span>
                </div>

                <div class="trip-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar Viaje"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar Viaje"
                  >
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

  <v-dialog
    v-model="dialog"
    fullscreen
    transition="dialog-bottom-transition"
    :no-click-animation="true"
  >
    <v-card class="trip-dialog">
      <v-card-text class="trip-dialog-body">
        <v-form
          v-model="valid"
          enctype="multipart/form-data"
          class="trip-form"
        >
          <v-stepper
            elevation="6"
            bg-color=""
            v-model="step"
            :items="items"
            hide-actions
            class="trip-stepper"
          >
            <template #item.1>
              <div class="trip-step-content">
                <v-row style="margin-top: 5px">
                  <v-col cols="12" md="12">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.route_id"
                      :items="routes"
                      label="Ruta"
                      prepend-icon="mdi-road"
                      item-title="name"
                      item-value="id"
                      variant="underlined"
                      :rules="selectRules"
                      density="compact"
                      @update:model-value="updateStimated"
                    >
                      <template #item="{ props, item }">
                        <v-card class="mx-1 my-2" elevation="2">
                          <v-list-item v-bind="props">
                            <v-list-item>
                              <v-row align="center" no-gutters>
                                <v-col cols="12" md="4" class="d-flex align-center">
                                  <v-avatar>
                                    <v-img
                                      :src="getImageUrl(item.raw.originImage)"
                                      max-width="40"
                                    />
                                  </v-avatar>

                                  <div class="ml-2">
                                    <div class="text-caption text-grey">
                                      <v-icon small class="mr-1">
                                        mdi-map-marker
                                      </v-icon>
                                      Origen
                                    </div>

                                    <v-tooltip location="top">
                                      <template #activator="{ props: tooltipProps }">
                                        <div
                                          v-bind="tooltipProps"
                                          class="text-truncate"
                                          style="max-width: 100%"
                                        >
                                          {{ item.raw.originAddress }}
                                        </div>
                                      </template>

                                      <span>{{ item.raw.originAddress }}</span>
                                    </v-tooltip>
                                  </div>
                                </v-col>

                                <v-col cols="12" md="4" class="d-flex align-center">
                                  <v-avatar>
                                    <v-img
                                      :src="getImageUrl(item.raw.destinationImage)"
                                      max-width="40"
                                    />
                                  </v-avatar>

                                  <div class="ml-2">
                                    <div class="text-caption text-grey">
                                      <v-icon small class="mr-1">
                                        mdi-map-marker-check
                                      </v-icon>
                                      Destino
                                    </div>

                                    <v-tooltip location="top">
                                      <template #activator="{ props: tooltipProps }">
                                        <div
                                          v-bind="tooltipProps"
                                          class="text-truncate"
                                          style="max-width: 100%"
                                        >
                                          {{ item.raw.destinationAddress }}
                                        </div>
                                      </template>

                                      <span>{{ item.raw.destinationAddress }}</span>
                                    </v-tooltip>
                                  </div>
                                </v-col>

                                <v-col
                                  cols="12"
                                  md="4"
                                  class="align-center justify-md-left justify-center text-left"
                                >
                                  <div class="text-caption text-grey ml-1">
                                    Duración estimada
                                  </div>

                                  <div class="text-body-2 font-weight-medium">
                                    <v-icon small class="mr-1" color="primary">
                                      mdi-clock-time-four-outline
                                    </v-icon>
                                    {{ formatDuration(item.raw.estimated) }}
                                  </div>
                                </v-col>
                              </v-row>
                            </v-list-item>
                          </v-list-item>
                        </v-card>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.vehicle_id"
                      :items="vehicles"
                      label="Vehículo"
                      prepend-icon="mdi-car-side"
                      item-title="vehicleName"
                      item-value="id"
                      variant="underlined"
                      :rules="selectRules"
                      density="compact"
                      @update:model-value="filterWorkers"
                    >
                      <template #item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :prepend-avatar="getImageUrl(item.raw.vehicleImage)"
                          :title="item.raw.vehicleName"
                        >
                          <v-list-item-subtitle class="d-flex flex-column">
                            <div>{{ vehicleInternalNumber(item.raw) }}</div>
                            <div>Marca: {{ item.raw.brand }}</div>
                            <div>Asientos: {{ item.raw.seats }}</div>
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
                          variant="underlined"
                          prepend-icon="mdi-calendar"
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

                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="editedItem.schedule"
                      :items="filteredTimeSlots"
                      label="Hora de salida"
                      variant="underlined"
                      density="compact"
                      prepend-icon="mdi-calendar-clock"
                      @update:modelValue="updateArrival"
                      :disabled="!editedItem.route_id"
                      :rules="selectRules"
                      :key="
                        'timeslot-' +
                        (editedItem.date || '') +
                        (editedItem.schedule || '')
                      "
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editedItem.arrival"
                      label="Hora de llegada"
                      :disabled="true"
                      variant="underlined"
                      density="compact"
                      prepend-icon="mdi-calendar-clock"
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
                    Siguiente
                  </v-btn>
                </v-row>
              </div>
            </template>

            <template #item.2>
              <div class="trip-step-content">
                <v-sheet border>
                  <v-toolbar :color="paleteColors.primary">
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
                      class="elevation-1"
                      style="max-height: 68vh; overflow-y: auto"
                      :items-per-page-text="'Elementos por páginas'"
                      no-data-text="No hay datos disponibles"
                      :loading="loading"
                      loading-text="Cargando datos..."
                      hide-default-header
                    >
                      <template #top>
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
                      </template>

                      <template #item="slotProps">
                        <tr>
                          <td colspan="100%" style="padding: 0; border: none">
                            <v-card
                              class="mb-2 mx-1 rounded-lg"
                              elevation="1"
                              density="comfortable"
                              flat
                              :style="{
                                opacity: slotProps.item.included ? 1 : 0.55,
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
                                    variant="underlined"
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
                    Siguiente
                  </v-btn>
                </v-row>
              </div>
            </template>

            <template #item.3>
              <div class="trip-step-content">
                <v-sheet border>
                  <v-toolbar :color="paleteColors.primary">
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
                      class="elevation-1"
                      style="max-height: 68vh; overflow-y: auto"
                      :items-per-page-text="'Elementos por página'"
                      no-data-text="No hay datos disponibles"
                      :loading="loading"
                      loading-text="Cargando datos..."
                      hide-default-header
                    >
                      <template #top>
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
                      </template>

                      <template #item="slotProps">
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
                                          variant="underlined"
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
                    Siguiente
                  </v-btn>
                </v-row>
              </div>
            </template>

            <template #item.4>
              <div class="trip-step-content">
                <v-sheet border>
                  <v-toolbar :color="paleteColors.primary">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Relación de Trabajadores</strong>
                        </span>
                      </v-col>

                      <v-col cols="12" md="4" class="text-right">
                        <v-btn
                          class="text-subtitle-1"
                          :color="paleteColors.white"
                          variant="tonal"
                          elevation="2"
                          prepend-icon="mdi-plus-circle"
                          @click="showAssiegnedWorker"
                        >
                          Asignar Trabajador
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="headersWorkers"
                      :items="filteredWorkers"
                      class="elevation-1"
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
                        <v-btn
                          density="comfortable"
                          :icon="isWorkerAssociated(item) ? 'mdi-delete' : 'mdi-plus'"
                          @click="
                            isWorkerAssociated(item)
                              ? deleteItemWorker(item)
                              : saveAssignedWorker(item)
                          "
                          :color="
                            isWorkerAssociated(item)
                              ? paleteColors.error
                              : paleteColors.success
                          "
                          variant="tonal"
                          elevation="1"
                          :title="
                            isWorkerAssociated(item)
                              ? 'Eliminar Relación'
                              : 'Agregar Relación'
                          "
                        />
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
            </template>
          </v-stepper>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card class="busgo-dialog-card">
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar un viaje
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el viaje seleccionado?
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn
          :color="paleteColors.gris"
          variant="flat"
          @click="closeDelete"
        >
          Cancelar
        </v-btn>

        <v-btn
          :color="paleteColors.error"
          variant="flat"
          @click="deleteItemConfirm"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogAssignedWorkers" max-width="400px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="busgo-dialog-card">
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">
            Asignar trabajadores al viaje
          </span>
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
                  prepend-icon="mdi-account"
                  item-title="workerName"
                  item-value="id"
                  variant="underlined"
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
            Aceptar
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
    routes: [],
    vehicles: [],
    workers: [],
    branches: [],
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
      { title: "Ruta", value: "name" },
      { title: "Origen", value: "origin" },
      { title: "Destino", value: "destination" },
      { title: "Vehículo", value: "vehicleName" },
      { title: "Fecha", value: "date" },
      { title: "Horario", value: "schedule" },
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
            return {
              id: existingFare?.id || "",
              fare_segment_ticket_type_id: ticketType.id,
              price:
                existingFare?.price ?? ticketType.base_price ?? ticketType.basePrice ?? 0,
              active: existingFare?.active ?? true,
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
    async showAdd() {
      this.close();
      this.step = 1;
      this.data = {};
      this.filteredWorkers = [];
      this.tripStopRows = [];
      this.tripFareRows = [];
      this.expandedTripFareIds = [];
      this.data.branch_id = this.branch_id;
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.originalItem = Object.assign({}, this.defaultItem);
      this.timeSlotsKey = Date.now();
      try {
        const result = await handleRequest({
          endpoint: "get-routes-vehicle-workers",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.routes = result.data?.triproutes || [];
          this.vehicles = result.data?.tripvehicles || [];
          this.workers = result.data.tripworkers || [];
          this.syncTripStopsFromRoute(true);
          this.syncTripFareRows(true);
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.routes = [];
          this.vehicles = [];
          this.workers = [];
        }
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
          this.trips = result.data?.trips || [];
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
          updatedFields.branch_id = this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "trip",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
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
          try {
            const result = await handleRequest({
              endpoint: "trip-update",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta segÃºn el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
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
      this.originalItem.tripFares = Array.isArray(this.originalItem.tripFares)
        ? this.originalItem.tripFares
        : [];
      this.editedItem.tripFares = Array.isArray(this.editedItem.tripFares)
        ? this.editedItem.tripFares
        : [];
      this.data = {};
      this.data.branch_id = this.branch_id;
      try {
        const result = await handleRequest({
          endpoint: "get-routes-vehicle-workers",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.routes = result.data?.triproutes || [];
          this.vehicles = result.data?.tripvehicles || [];
          this.workers = result.data.tripworkers || [];

          const matchedRoute = this.selectedRouteRecord;
          this.estimated = matchedRoute ? matchedRoute.estimated : null;
          this.syncTripStopsFromRoute(false);
          this.syncTripFareRows(false);
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.routes = [];
          this.vehicles = [];
          this.workers = [];
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        //this.updateStimated();
        this.filterWorkers();
        this.dialog = true;
      }
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

.trip-worker-avatar {
  transition: transform 0.15s ease;
}

.trip-worker-avatar:hover {
  transform: translateY(-1px) scale(1.05);
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

.trip-col-route {
  width: 34%;
  min-width: 0;
}

.trip-col-vehicle {
  width: 12%;
  min-width: 0;
}

.trip-col-workers {
  width: 12%;
  min-width: 0;
}

.trip-col-date {
  width: 9%;
  min-width: 0;
}

.trip-col-schedule {
  width: 9%;
  min-width: 0;
}

.trip-col-start {
  width: 6%;
  min-width: 0;
}

.trip-col-end {
  width: 6%;
  min-width: 0;
}

.trip-col-actions {
  width: 12%;
  min-width: 0;
}

.trip-row {
  min-height: 70px;
}

.trip-route-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.trip-dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.trip-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trip-stepper {
  max-height: 100vh;
  min-height: 95vh;
  overflow-y: auto;
}

.trip-step-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.trip-step-actions {
  padding: 16px;
  border-top: 1px solid #eeeeee;
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

  .trip-col-route,
  .trip-col-vehicle,
  .trip-col-workers,
  .trip-col-date,
  .trip-col-schedule,
  .trip-col-start,
  .trip-col-end,
  .trip-col-actions {
    width: 100%;
  }

  .trip-route-meta {
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
</style>
