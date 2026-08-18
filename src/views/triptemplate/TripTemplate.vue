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
      <v-icon>mdi-calendar-clock</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Plantillas de viajes</div>
      <div class="busgo-page-subtitle">
        Gestionar plantillas, horarios, paradas, tarifas y trabajadores
      </div>
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
      Agregar Plantilla de Viaje
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">
            Listado de plantillas de viajes
          </div>

          <div class="busgo-card-subtitle">
            Administra rutas programadas, vehículos, trabajadores y recurrencias.
          </div>
        </div>
      </div>

      <div class="trip-template-toolbar px-6 pb-4">
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
          class="trip-template-filter"
          :rules="selectRules"
          @update:modelValue="initialize"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
            />
          </template>
        </v-autocomplete>

        <v-spacer />

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar plantilla de viaje..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="trip-template-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="sortedTemplates"
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
            <div class="trip-template-col-route trip-template-sortable-header" @click="toggleTemplateSort('routeCode')">
              <span>Ruta</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('routeCode') }}
              </v-icon>
            </div>
            <div class="trip-template-col-vehicle trip-template-sortable-header" @click="toggleTemplateSort('vehicleName')">
              <span>Vehículo</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('vehicleName') }}
              </v-icon>
            </div>
            <div class="trip-template-col-workers trip-template-sortable-header" @click="toggleTemplateSort('workers')">
              <span>Trabajadores</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('workers') }}
              </v-icon>
            </div>
            <div class="trip-template-col-schedule trip-template-sortable-header" @click="toggleTemplateSort('schedule')">
              <span>Hora Programada</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('schedule') }}
              </v-icon>
            </div>
            <div class="trip-template-col-duration trip-template-sortable-header" @click="toggleTemplateSort('duration')">
              <span>Duración</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('duration') }}
              </v-icon>
            </div>
            <div class="trip-template-col-frequency trip-template-sortable-header" @click="toggleTemplateSort('recurrence_pattern')">
              <span>Frecuencia</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('recurrence_pattern') }}
              </v-icon>
            </div>
            <div class="trip-template-col-days trip-template-sortable-header" @click="toggleTemplateSort('days_of_week')">
              <span>Días</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('days_of_week') }}
              </v-icon>
            </div>
            <div class="trip-template-col-sale-mode trip-template-sortable-header" @click="toggleTemplateSort('saleMode')">
              <span>Modo</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('saleMode') }}
              </v-icon>
            </div>
            <div class="trip-template-col-status trip-template-sortable-header" @click="toggleTemplateSort('active')">
              <span>Estado</span>
              <v-icon size="16" class="ml-1">
                {{ templateSortIcon('active') }}
              </v-icon>
            </div>
            <div class="trip-template-col-actions">Acciones</div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row trip-template-row">
                <div class="trip-template-col-route">
                  <div class="trip-template-route-title-row">
                    <div class="trip-template-route-title">
                      {{ slotProps.item.routeCode || "-" }}
                    </div>
                  </div>

                  <div class="trip-template-route-meta">
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
                      Código ruta: {{ slotProps.item.routeCode || "-" }}<br />
                      Origen: {{ slotProps.item.origin }}<br />
                      Destino: {{ slotProps.item.destination }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-template-col-vehicle busgo-name-cell">
                  <div class="min-width-0">
                    <div class="busgo-name">
                      {{ slotProps.item.vehicleName }}
                    </div>

                    <div class="busgo-submeta text-truncate">
                      {{ getVehicleInternalNumber(slotProps.item) }}
                    </div>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Vehículo: {{ slotProps.item.vehicleName }}<br />
                      Número interno: {{ getVehicleInternalNumber(slotProps.item) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="trip-template-col-workers">
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
                          <v-img
                            :src="`${this.$axios.defaults.baseURL}images/${
                              person.workerImage || person.image
                            }?t=${getCacheTimestamp()}`"
                            alt="image"
                          />
                        </v-avatar>
                      </template>

                      <span>{{ person.workerName || person.name }}</span>
                      <v-spacer />
                      <span class="text-secondary">{{ person.roleName }}</span>
                    </v-tooltip>
                  </div>
                </div>

                <div class="trip-template-col-schedule busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-clock-outline
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.schedule }}
                  </span>
                </div>

                <div class="trip-template-col-duration busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-timer-outline
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.duration }}
                  </span>
                </div>

                <div class="trip-template-col-frequency busgo-meta">
                  <div
                    v-if="slotProps.item.recurrence_pattern"
                    class="d-flex align-center min-width-0"
                  >
                    <v-icon
                      size="16"
                      class="me-1"
                      :color="getRecurrenceColor(slotProps.item.recurrence_pattern)"
                    >
                      {{ getRecurrenceIcon(slotProps.item.recurrence_pattern) }}
                    </v-icon>

                    <span class="text-truncate">
                      {{ translateRecurrence(slotProps.item.recurrence_pattern) }}
                    </span>
                  </div>

                  <span v-else>-</span>
                </div>

                <div class="trip-template-col-days">
                  <div v-if="slotProps.item.days_of_week" class="d-flex justify-center">
                    <v-tooltip location="bottom">
                      <template #activator="{ props: activatorProps }">
                        <div
                          v-bind="activatorProps"
                          class="d-flex flex-wrap gap-1 justify-center"
                        >
                          <v-avatar
                            v-for="day in 7"
                            :key="day"
                            size="24"
                            :color="
                              getDaysArray(slotProps.item.days_of_week).includes(day - 1)
                                ? 'primary'
                                : 'grey-lighten-4'
                            "
                            class="text-caption"
                          >
                            {{ ["D", "L", "M", "X", "J", "V", "S"][day - 1] }}
                          </v-avatar>
                        </div>
                      </template>

                      <span>
                        {{ formatFullDayNames(getDaysArray(slotProps.item.days_of_week)) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <span v-else>-</span>
                </div>

                <div class="trip-template-col-sale-mode">
                  <v-tooltip location="bottom">
                    <template #activator="{ props }">
                      <v-chip
                        v-bind="props"
                        :color="getSaleModeColor(slotProps.item)"
                        size="small"
                        variant="tonal"
                        class="trip-template-sale-mode-chip"
                      >
                        {{ getSaleModeShortName(slotProps.item) }}
                      </v-chip>
                    </template>

                    <span>{{ getSaleModeName(slotProps.item) }}</span>
                  </v-tooltip>
                </div>

                <div class="trip-template-col-status">
                  <v-chip
                    :color="
                      slotProps.item.active
                        ? paleteColors.active
                        : paleteColors.inactive
                    "
                    :text-color="paleteColors.white"
                    size="small"
                  >
                    {{ slotProps.item.active ? "Activa" : "Inactiva" }}
                  </v-chip>
                </div>

                <div class="trip-template-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar plantilla de viaje"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar plantilla de viaje"
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
    <v-card class="trip-template-dialog">
      <v-card-text class="trip-template-dialog-body pa-0">
        <v-form
          v-model="valid"
          enctype="multipart/form-data"
          class="trip-template-form"
        >
          <v-stepper
            elevation="6"
            v-model="step"
            :items="items"
            hide-actions
            class="trip-template-stepper"
          >
            <template #item.1>
              <div class="trip-template-step-pane trip-template-step-pane--summary">
                <div class="trip-template-step-content">
                <v-row style="margin-top: 5px">
                  <v-col v-if="mostrarFila" cols="12" md="6">
                    <v-autocomplete
                      :no-data-text="'No hay datos disponibles'"
                      v-model="editedItem.branch_id"
                      :items="branches"
                      label="Sucursal"
                      prepend-icon="mdi-store"
                      item-title="name"
                      item-value="id"
                      variant="underlined"
                      :rules="selectRules"
                      density="compact"
                      :disabled="editedIndex !== -1"
                      @update:model-value="onTemplateBranchChange"
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
                          <v-list-item v-bind="{ ...props, title: undefined }">
                            <v-row align="center" no-gutters>
                              <v-col cols="12" class="d-flex align-center mb-2">
                                <div class="trip-template-route-title-row">
                                  <div class="text-subtitle-2 font-weight-bold text-truncate">
                                    {{ item.raw.routeCode || "-" }}
                                  </div>
                                </div>
                              </v-col>

                              <v-col cols="12" md="4" class="d-flex align-center">
                                <v-avatar>
                                  <v-img
                                    :src="`${this.$axios.defaults.baseURL}images/${item.raw.originImage}`"
                                    max-width="40"
                                  />
                                </v-avatar>

                                <div class="ml-2">
                                  <div class="text-caption text-grey">
                                    <v-icon small class="mr-1">mdi-map-marker</v-icon>
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
                                    :src="`${this.$axios.defaults.baseURL}images/${item.raw.destinationImage}`"
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
                            </v-row>
                          </v-list-item>
                        </v-card>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="3">
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
                          :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.vehicleImage}`"
                          :title="item.raw.vehicleName"
                        >
                          <v-list-item-subtitle class="d-flex flex-column">
                            <div>Marca: {{ item.raw.brand }}</div>
                            <div>Asientos: {{ item.raw.seats }}</div>
                            <div>
                              Número interno: {{ getVehicleInternalNumber(item.raw) }}
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-select
                      v-model="editedItem.recurrence_pattern"
                      :items="frequencyOptions"
                      item-title="text"
                      item-value="value"
                      label="Frecuencia"
                      variant="underlined"
                      :rules="selectRules"
                      density="compact"
                    >
                      <template #item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :prepend-icon="getRecurrenceIcon(item.raw.value)"
                          :color="getRecurrenceColor(item.raw.value)"
                        />
                      </template>

                      <template #selection="{ item }">
                        <div class="d-flex align-center">
                          <v-icon
                            :icon="getRecurrenceIcon(item.raw.value)"
                            :color="getRecurrenceColor(item.raw.value)"
                            size="small"
                            class="me-2"
                          />
                          <span>{{ item.raw.text }}</span>
                        </div>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="3">
                    <div class="d-flex flex-wrap">
                      <v-chip
                        v-for="day in daysOfWeekOptions"
                        :key="day.value"
                        class="ma-1"
                        :color="getDayColor(day.value)"
                        @click="handleDayClick(day.value)"
                        :disabled="isDaySelectionDisabled"
                      >
                        {{ getDayInitial(day.text) }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-autocomplete
                      v-model="editedItem.schedule"
                      :items="filteredTimeSlots"
                      label="Hora de salida"
                      variant="underlined"
                      density="compact"
                      prepend-icon="mdi-calendar-clock"
                      :rules="selectRules"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.duration"
                      label="Duración (Minutos)"
                      prepend-icon="mdi-timer"
                      variant="underlined"
                      :rules="durationRules"
                      density="compact"
                    />
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-select
                      v-model="editedItem.saleMode"
                      :items="saleModes"
                      label="Modo de venta"
                      prepend-icon="mdi-ticket-confirmation"
                      item-title="name"
                      item-value="id"
                      variant="underlined"
                      :rules="selectRules"
                      density="compact"
                    />
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-switch
                      v-model="editedItem.active"
                      :true-value="true"
                      :false-value="false"
                      :color="paleteColors.active"
                      hide-details
                      inset
                      class="custom-switch"
                    >
                      <template #label>
                        <span
                          class="text-body-1"
                          :style="{
                            color: editedItem.active
                              ? paleteColors.active
                              : paleteColors.grey
                          }"
                        >
                          {{ editedItem.active ? "Activa" : "Inactiva" }}
                        </span>
                      </template>
                    </v-switch>
                  </v-col>
                </v-row>
              </div>

              <v-divider />

              <div class="trip-template-step-actions">
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
              </div>
            </template>

            <template #item.2>
              <div class="trip-template-step-content">
                <v-sheet border>
                  <v-toolbar :color="paleteColors.primary">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Paradas de la plantilla</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          La última columna agrega o quita la asociación de la parada a la
                          plantilla. La tabla muestra la información propia de la parada.
                        </div>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="tripStopsHeaders"
                      :items="templateStopRows"
                      class="elevation-1 trip-template-table"
                      height="100%"
                      fixed-header
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
                              Asociar
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
                              <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                                <div class="d-flex align-center" style="width: 24%; min-width: 0">
                                  <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                                    <v-img
                                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.locationImage}`"
                                      alt="image"
                                      cover
                                    />
                                  </v-avatar>

                                  <div class="text-truncate">
                                    <div class="font-weight-medium">
                                      {{ slotProps.item.locationName }}
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
                                    @update:modelValue="onTemplateStopFieldChange"
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
                                    @update:modelValue="onTemplateStopFieldChange"
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
                                    @update:modelValue="onTemplateStopFieldChange"
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
                                    @update:modelValue="onTemplateStopFieldChange"
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
                                    @update:modelValue="onTemplateStopIncludedChange"
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

              <div class="trip-template-step-actions">
                <v-row class="mt-1">
                  <v-btn color="#E7E9E9" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    color="#E7E9E9"
                    variant="flat"
                    @click="nextStep"
                    :disabled="!templateStopRows.length"
                  >
                    Siguiente
                  </v-btn>
                </v-row>
                </div>
            </template>

            <template #item.3>
              <div class="trip-template-step-content">
                <v-sheet border>
                  <v-toolbar :color="paleteColors.primary">
                    <v-row align="center">
                      <v-col cols="12" md="7" class="grow ml-4">
                        <span class="text-subtitle-1">
                          <strong>Tramos y tipos de pasaje</strong>
                        </span>

                        <div class="text-caption" style="opacity: 0.85">
                          Define los tramos disponibles para la plantilla y ajusta el
                          precio de cada tipo de pasaje.
                        </div>
                      </v-col>
                    </v-row>
                  </v-toolbar>

                  <v-card-text>
                    <v-data-table
                      :headers="tripFaresHeaders"
                      :items="templateFareRows"
                      class="elevation-1 trip-template-table"
                      height="100%"
                      fixed-header
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
                              <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
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

                                <div class="d-flex gap-1" style="width: 2%; justify-content: flex-end; flex-wrap: nowrap">
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
                                    @click="toggleTemplateFareExpanded(slotProps.item)"
                                    class="flex-shrink-0"
                                    title="Ver tipos de pasaje"
                                  >
                                    <v-icon size="20">
                                      {{
                                        isTemplateFareExpanded(slotProps.item)
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
                                    isTemplateFareExpanded(slotProps.item) &&
                                    slotProps.item.fareSegmentTicketTypes &&
                                    slotProps.item.fareSegmentTicketTypes.length
                                  "
                                  class="px-4 pb-4"
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
                                      :key="
                                        templateFareTicketTypeKey(ticketType, ticketIndex)
                                      "
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

              <div class="trip-template-step-actions">
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
              <div class="trip-template-step-pane trip-template-step-pane--workers">
                <div class="trip-template-step-content trip-template-step-content--workers">
                  <v-sheet border class="trip-template-workers-sheet">
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

                  <v-card-text class="trip-template-workers-card-text">
                    <v-data-table
                      :headers="headersWorkers"
                      :items="filteredWorkers"
                      class="elevation-1 trip-template-table trip-template-workers-table"
                      height="100%"
                      fixed-header
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
                          <v-img
                            :src="`${this.$axios.defaults.baseURL}images/${item.workerImage}?t=${Date.now()}`"
                            alt="image"
                          />
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

              <div class="trip-template-step-actions">
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
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card class="busgo-dialog-card">
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar una plantilla de viaje
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la plantilla viaje seleccionada?
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
                  :items="filteredWorkers"
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
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.workerImage}`"
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
            @click="saveAssignedWorker"
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
    templates: [],
    routes: [],
    vehicles: [],
    workers: [],
    branches: [],
    saleModes: [{ id: "normal", name: "Venta Normal" }],
    filteredWorkers: [],
    templateStopRows: [],
    templateFareRows: [],
    expandedTemplateFareIds: [],
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
    frequencyOptions: [
      { text: "Diario", value: "daily" },
      { text: "Días laborables (L-V)", value: "weekdays" },
      { text: "Fin de semana (S-D)", value: "weekends" }, // ¡Nueva opción!
      { text: "Semanal", value: "weekly" },
      // Eliminamos 'custom' que no existe en el backend
    ],
    daysOfWeekOptions: [
      { text: "Lunes", value: 1, icon: "mdi-calendar" },
      { text: "Martes", value: 2, icon: "mdi-calendar" },
      { text: "Miércoles", value: 3, icon: "mdi-calendar" },
      { text: "Jueves", value: 4, icon: "mdi-calendar" },
      { text: "Viernes", value: 5, icon: "mdi-calendar" },
      { text: "Sábado", value: 6, icon: "mdi-calendar" },
      { text: "Domingo", value: 0, icon: "mdi-calendar" },
    ],
    statusOptions: [
      { text: "Activo", value: true },
      { text: "Inactivo", value: false },
    ],
    headers: [
      { title: "Ruta", value: "routeCode" },
      { title: "Origen", value: "origin" },
      { title: "Destino", value: "destination" },
      { title: "Vehículo", value: "vehicleName" },
      { title: "Trabajadores", value: "workers" },
      { title: "Hora Programada", value: "schedule" },
      { title: "Duración (minutos)", value: "duration" },
      { title: "Frecuencia", value: "recurrence_pattern" },
      { title: "Dias de la Semana", value: "days_of_week" },
      { title: "Modo", value: "saleMode" },
      { title: "Estado", value: "active" },
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
      schedule: "",
      duration: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
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
      schedule: "",
      duration: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
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
      duration: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
      saleMode: "normal",
      workers: [],
      tripStops: [],
      tripFares: [],
    },
    editedIndex: -1,
    search: "",
    templateSortBy: "name",
    templateSortOrder: "asc",
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
    durationRules: [
      (v) => !isNaN(v) || "La duración debe ser un número",
      (v) => v > 0 || "La duración debe ser mayor a 0",
    ],
  }),
  computed: {
    sortedTemplates() {
      return this.sortRows(this.templates, this.templateSortBy, this.templateSortOrder, (row, field) =>
        this.getTemplateSortValue(row, field)
      );
    },
    formTitle() {
      return this.editedIndex === -1
        ? "Agregar Plantilla de Viaje"
        : "Editar Plantilla de Viaje";
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
    filteredTimeSlots() {
      return this.generateTimeSlots();
    },
    isDaySelectionDisabled() {
      // Deshabilitar selecciÃ³n manual para estas opciones
      return ["daily", "weekdays", "weekends"].includes(
        this.editedItem.recurrence_pattern
      );
    },

    shouldPreselectDays() {
      // Determinar si debemos preseleccionar dÃ­as
      return this.editedItem.recurrence_pattern && this.isDaySelectionDisabled;
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.permissions = LocalStorageService.getItem("permissions");
    if (this.hasPermission("view_triptemplates_company")) {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  watch: {
    "editedItem.recurrence_pattern": {
      handler(newVal) {
        // Primero limpiar los dÃ­as seleccionados
        this.editedItem.days_of_week = "";

        // Luego llamar al mÃ©todo de preselecciÃ³n
        this.$nextTick(() => {
          this.preselectDays();
        });
      },
      immediate: true,
    },
  },
  methods: {
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
    templateSortIcon(field) {
      if (this.templateSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.templateSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    toggleTemplateSort(field) {
      if (this.templateSortBy === field) {
        this.templateSortOrder = this.templateSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.templateSortBy = field;
      this.templateSortOrder = "asc";
    },
    getTemplateSortValue(row, field) {
      switch (field) {
        case "name":
          return row?.name ?? "";
        case "vehicleName":
          return row?.vehicleName ?? "";
        case "workers":
          return Array.isArray(row?.workers) ? row.workers.length : 0;
        case "schedule":
          return row?.schedule ?? "";
        case "duration":
          return Number(row?.duration ?? 0);
        case "recurrence_pattern":
          return row?.recurrence_pattern ?? "";
        case "days_of_week":
          return row?.days_of_week ?? "";
        case "saleMode":
          return this.normalizeTemplateSaleMode(row);
        case "active":
          return row?.active ? 1 : 0;
        default:
          return row?.[field] ?? "";
      }
    },
    getSelectedRouteRecord() {
      return (
        (this.routes || []).find(
          (route) => Number(route.id) === Number(this.editedItem.route_id)
        ) || null
      );
    },
    getSelectedRouteStopLabel(stop) {
      if (!stop) {
        return "";
      }

      return (
        stop.location?.address || stop.locationName || stop.address || stop.name || "-"
      );
    },
    normalizeTemplateWorkerRecord(worker = {}) {
      return {
        ...worker,
        workerName: worker.workerName ?? worker.name ?? "",
        workerImage: worker.workerImage ?? worker.image ?? "workers/default.jpg",
      };
    },
    normalizeTemplateWorkersList(workers = []) {
      return workers.map((worker) => this.normalizeTemplateWorkerRecord(worker));
    },
    getDefaultSaleMode() {
      return this.saleModes[0]?.id || "normal";
    },
    normalizeTemplateSaleMode(template = {}) {
      return template.saleMode || template.sale_mode || this.getDefaultSaleMode();
    },
    getSaleModeName(template = {}) {
      const saleMode = this.normalizeTemplateSaleMode(template);
      const fallbackNames = {
        normal: "Venta Normal",
        express: "Venta Express",
      };
      return this.saleModes.find((mode) => mode.id === saleMode)?.name || fallbackNames[saleMode] || saleMode;
    },
    getSaleModeShortName(template = {}) {
      return this.getSaleModeName(template).replace(/^Venta\s+/i, "");
    },
    getSaleModeColor(template = {}) {
      return this.normalizeTemplateSaleMode(template) === "express" ? "primary" : "grey";
    },
    ensureTemplateSaleMode({ useDefault = false } = {}) {
      if (useDefault || !this.editedItem.saleMode) {
        this.editedItem.saleMode = this.getDefaultSaleMode();
      }
    },
    parseTemplateStops(value) {
      if (Array.isArray(value)) return value;
      if (!value) return [];
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }
      return [];
    },
    buildTemplateStopRows(route = null, tripStops = [], forceIncludeAll = false) {
      const selectedRoute = route || this.getSelectedRouteRecord();
      const routeStops = Array.isArray(selectedRoute?.routeStops)
        ? selectedRoute.routeStops
        : [];
      const stopMap = new Map(
        (Array.isArray(tripStops) ? tripStops : []).map((stop) => [
          Number(stop.route_stop_id),
          stop,
        ])
      );

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
          can_board: existingStop?.can_board ?? routeStop.allows_boarding ?? true,
          can_alight: existingStop?.can_alight ?? routeStop.allows_alighting ?? true,
          active: existingStop?.active ?? routeStop.active ?? true,
          included,
          locationName: routeStop.locationName || routeStop.address || "",
          locationCity: routeStop.locationCity || "",
          locationCountry: routeStop.locationCountry || "",
          locationImage:
            routeStop.image || routeStop.locationImage || "locations/default.jpg",
        };
      });
    },
    parseTemplateFares(value) {
      if (Array.isArray(value)) return value;
      if (!value) return [];
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      }
      return [];
    },
    buildTemplateFareRows(route = null, tripFares = [], forceIncludeAll = false) {
      const selectedRoute = route || this.getSelectedRouteRecord();
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
          originLabel: this.getSelectedRouteStopLabel(
            originStop?.location || originStop || segment.originStop
          ),
          destinationLabel: this.getSelectedRouteStopLabel(
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
    templateFareTicketTypeKey(ticketType, index) {
      return ticketType.id || ticketType.fare_segment_ticket_type_id || index;
    },
    isTemplateFareExpanded(item) {
      const itemId = Number(item?.id);
      return this.expandedTemplateFareIds.includes(itemId);
    },
    toggleTemplateFareExpanded(item) {
      const itemId = Number(item?.id);
      if (!Number.isFinite(itemId) || itemId <= 0) {
        return;
      }

      this.expandedTemplateFareIds =
        this.expandedTemplateFareIds[0] === itemId ? [] : [itemId];
    },
    syncTemplateFareRows(forceIncludeAll = false) {
      const route = this.getSelectedRouteRecord();
      if (!route) {
        this.templateFareRows = [];
        this.expandedTemplateFareIds = [];
        return;
      }

      const tripFares = this.parseTemplateFares(this.editedItem.tripFares);
      const shouldIncludeAll =
        forceIncludeAll ||
        this.editedIndex === -1 ||
        Number(this.originalItem.route_id) !== Number(this.editedItem.route_id);

      this.templateFareRows = this.buildTemplateFareRows(
        route,
        tripFares,
        shouldIncludeAll
      );
      this.expandedTemplateFareIds = [];
    },
    normalizeTemplateFaresPayload(rows = []) {
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
    areTemplateFaresDifferent(originalFares, editedRows) {
      const normalize = (rows = []) =>
        this.normalizeTemplateFaresPayload(
          Array.isArray(rows)
            ? rows
            : Array.isArray(rows?.fareSegmentTicketTypes)
            ? rows.fareSegmentTicketTypes
            : []
        ).map(({ source_type, ...rest }) => rest);

      return !_.isEqual(normalize(originalFares), normalize(editedRows));
    },
    syncTemplateStopsFromRoute(forceIncludeAll = false) {
      const route = this.getSelectedRouteRecord();
      if (!route) {
        this.templateStopRows = [];
        return;
      }

      const storedStops = this.parseTemplateStops(this.editedItem.tripStops);
      const shouldIncludeAll =
        forceIncludeAll ||
        this.editedIndex === -1 ||
        Number(this.originalItem.route_id) !== Number(this.editedItem.route_id);

      this.templateStopRows = this.buildTemplateStopRows(
        route,
        storedStops,
        shouldIncludeAll
      );
    },
    normalizeTemplateStopsPayload(rows = []) {
      return (Array.isArray(rows) ? rows : [])
        .filter((row) => row.included)
        .map((row) => ({
          route_stop_id: Number(row.route_stop_id),
          stop_order: Number(row.stop_order) || 1,
          can_board: !!row.can_board,
          can_alight: !!row.can_alight,
          active: row.active ?? true,
        }))
        .sort((a, b) => a.route_stop_id - b.route_stop_id);
    },
    areTemplateStopsDifferent(originalStops, editedStops) {
      return !_.isEqual(
        this.normalizeTemplateStopsPayload(originalStops || []),
        this.normalizeTemplateStopsPayload(editedStops || [])
      );
    },
    onTemplateStopIncludedChange() {
      this.$forceUpdate();
    },
    onTemplateStopFieldChange() {
      this.$forceUpdate();
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
      return `${this.$axios.defaults.baseURL}images/${imagePath}?t=${this.getCacheTimestamp()}`;
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del dÃ­a actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al dÃ­a)
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
    getVehicleInternalNumber(vehicle) {
      return vehicle?.internal_number ?? vehicle?.internalNumber ?? "No asignado";
    },
    filterTimeSlots(item, queryText) {
      // Permite buscar formatos como "8:30", "0830" o "830"
      const normalizedQuery = queryText.toLowerCase().replace(/[:\s]/g, "");
      const normalizedItem = item.toLowerCase().replace(/[:\s]/g, "");
      return normalizedItem.includes(normalizedQuery);
    },
    getDayInitial(text) {
      // Retorna la primera letra del dÃ­a
      return text.charAt(0);
    },
    getDaysArray(daysString) {
      if (!daysString) return [];
      // Convertir "1,2,5" en [1, 2, 5]
      return daysString.split(",").map(Number);
    },
    getDayColor(dayValue) {
      if (this.isDaySelected(dayValue)) {
        return "primary";
      }
      return "default";
    },
    isDaySelected(dayValue) {
      if (!this.editedItem.days_of_week) return false;
      return this.editedItem.days_of_week.split(",").includes(dayValue.toString());
    },

    handleDayClick(dayValue) {
      if (!this.isDaySelectionDisabled) {
        this.toggleDay(dayValue);
      }
    },
    toggleDay(dayValue) {
      const daysArray = this.editedItem.days_of_week
        ? this.editedItem.days_of_week.split(",").filter(Boolean).map(Number)
        : [];

      const index = daysArray.indexOf(dayValue);

      if (index === -1) {
        daysArray.push(dayValue);
      } else {
        daysArray.splice(index, 1);
      }

      this.editedItem.days_of_week = daysArray.sort((a, b) => a - b).join(",");
    },
    preselectDays() {
      // Preseleccionar dÃ­as segÃºn el patrÃ³n
      switch (this.editedItem.recurrence_pattern) {
        case "daily":
          this.editedItem.days_of_week = "0,1,2,3,4,5,6"; // Todos los dÃ­as
          break;
        case "weekdays":
          this.editedItem.days_of_week = "1,2,3,4,5"; // L-V
          break;
        case "weekends":
          this.editedItem.days_of_week = "0,6"; // S-D
          break;
        case "weekly":
          if (!this.editedItem.days_of_week) {
            // Valor por defecto para semanal (Lunes)
            this.editedItem.days_of_week = "1";
          }
          break;
      }
    },
    formatFullDayNames(daysArray) {
      const dayNames = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      return daysArray?.map((day) => dayNames[day]).join(", ") || "";
    },
    translateRecurrence(pattern) {
      const translations = {
        daily: "Diario",
        weekdays: "Días laborables (L-V)",
        weekends: "Fin de semana (S-D)",
        weekly: "Semanal",
      };
      return translations[pattern] || pattern;
    },
    activeName(pattern) {
      const translations = {
        false: "Inactivo",
        true: "Activo",
      };
      return translations[pattern] || pattern;
    },
    getRecurrenceIcon(pattern) {
      const icons = {
        daily: "mdi-calendar-today",
        weekdays: "mdi-calendar-week-begin",
        weekends: "mdi-calendar-weekend", // Nuevo Ã­cono
        weekly: "mdi-calendar-week",
      };
      return icons[pattern] || "mdi-calendar-question";
    },
    getRecurrenceColor(pattern) {
      const colors = {
        daily: "blue",
        weekdays: "orange",
        weekends: "cyan", // Nuevo color
        weekly: "green",
      };
      return colors[pattern] || "grey";
    },
    generateTimeSlots() {
      const slots = [];

      // Generar todos los slots posibles (de 00:00 a 23:55)
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

      // Ordenar: primero de 08:00 en adelante, luego los anteriores
      return [
        ...slots.filter((s) => s.minutes >= 480), // 480 minutos = 8:00 AM
        ...slots.filter((s) => s.minutes < 480),
      ].map((s) => s.time);
    },
    updateStimated(selectedRouteId) {
      try {
        const selectedRoute =
          this.routes.find((route) => route.id === selectedRouteId) ||
          this.getSelectedRouteRecord();

        if (!selectedRoute) {
          throw new Error("Ruta no encontrada");
        }

        this.editedItem.duration = selectedRoute.estimated || 0;
        this.syncTemplateStopsFromRoute();
        this.syncTemplateFareRows();
      } catch (error) {
        //console.error("Error al actualizar ruta:", error);
        this.editedItem.duration = 0;
        this.templateStopRows = [];
        this.templateFareRows = [];
      }
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
      const selectedVehicleId = Number(this.editedItem.vehicle_id);
      console.log("this.editedItem.vehicle_id");
      console.log(Number(this.editedItem.vehicle_id));
      // Filtramos los trabajadores que estÃ¡n relacionados con el vehÃ­culo seleccionado
      this.filteredWorkers = this.workers.filter((worker) =>
        worker.vehicles.some((vehicle) => vehicle.id === selectedVehicleId)
      );
    },
    today(date) {
      // Obtener la fecha actual
      const hoy = new Date();

      // Formatear la fecha actual al mismo formato YYYY-MM-DD
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      const hoyFormateado = `${anio}-${mes}-${dia}`;

      // Comparar con la fecha proporcionada
      return date === hoyFormateado;
    },
    updateDate(val) {
      this.input = val;
      this.editedItem.date = this.dateFormatted;
      this.menu = false;
    },
    async showAdd() {
      this.step = 1;
      this.data = {};
      this.filteredWorkers = [];
      this.templateStopRows = [];
      this.templateFareRows = [];
      this.expandedTemplateFareIds = [];
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.originalItem = Object.assign({}, this.defaultItem);
      this.editedItem.branch_id = this.branch_id;
      this.timeSlotsKey = Date.now();
      await this.loadTripTemplateFormData(this.editedItem.branch_id, {
        resetSelections: true,
      });
      this.syncTemplateStopsFromRoute(true);
      this.syncTemplateFareRows(true);
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
      this.templateStopRows = [];
      this.templateFareRows = [];
      this.expandedTemplateFareIds = [];
    },
    async showAssiegnedWorker() {
      // Clonar filteredWorkers para evitar referencias compartidas
      const clonedFilteredWorkers = this.filteredWorkers.map((worker) => ({ ...worker }));

      // Ahora puedes filtrar el arreglo clonado sin afectar a los objetos originales
      this.filteredWorkers = clonedFilteredWorkers.filter((worker) => {
        // Verificar si la persona no estÃ¡ en editedItem.workers
        return !this.editedItem.workers.some(
          (editedWorker) => editedWorker.id === worker.id
        );
      });
      this.dialogAssignedWorkers = true;
    },
    closeAssignedWorker() {
      this.dialogAssignedWorkers = false;
      this.selectedWorker = null;
    },
    saveAssignedWorker(worker) {
      //if (this.selectedWorker) {
      //const worker = this.workers.find((p) => p.id === this.selectedWorker);
      const newWorkers = this.normalizeTemplateWorkerRecord(worker);
      // Verificar si la relaciÃ³n ya existe en editedItem.people
      const existingPersonIndex = this.editedItem.workers.findIndex(
        (p) => p.id === newWorkers.id
      );

      if (existingPersonIndex === -1) {
        // No existe, por lo tanto, se agrega uno nuevo
        this.editedItem.workers.push(newWorkers);
      } else {
        // Existe, por lo tanto se edita el existente
        this.editedItem.workers.splice(existingPersonIndex, 1, newWorkers); // Actualiza el elemento en el array
      }
      //}

      // Reiniciar selecciÃ³n y cerrar diÃ¡logo
      this.filterWorkers();
    },
    deleteItemWorker(item) {
      const index = this.editedItem.workers.findIndex((p) => p.id === item.id);
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
        this.templates = [];
        this.loading = false;
        return;
      }
      this.data = {};
      this.data.branch_id = this.branch_id;
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "get-trip-template",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.templates = (result.data?.templates || []).map((template) => ({
            ...template,
            saleMode: this.normalizeTemplateSaleMode(template),
            workers: this.normalizeTemplateWorkersList(template.workers || []),
          }));
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.templates = [];
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
    async loadTripTemplateFormData(branchId, { resetSelections = false } = {}) {
      const normalizedBranchId =
        branchId ?? this.editedItem.branch_id ?? this.branch_id;

      if (
        normalizedBranchId === "null" ||
        normalizedBranchId === null ||
        normalizedBranchId === ""
      ) {
        this.routes = [];
        this.vehicles = [];
        this.workers = [];
        this.filteredWorkers = [];

        if (resetSelections) {
          this.editedItem.route_id = "";
          this.editedItem.vehicle_id = "";
          this.editedItem.workers = [];
          this.templateStopRows = [];
          this.templateFareRows = [];
          this.expandedTemplateFareIds = [];
          this.estimated = 0;
        }

        return;
      }

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
          this.workers = this.normalizeTemplateWorkersList(result.data.tripworkers || []);
          this.saleModes = result.data?.saleModes?.length
            ? result.data.saleModes
            : [{ id: "normal", name: "Venta Normal" }];
          this.ensureTemplateSaleMode({ useDefault: resetSelections });

          if (resetSelections) {
            this.editedItem.route_id = "";
            this.editedItem.vehicle_id = "";
            this.editedItem.workers = [];
            this.templateStopRows = [];
            this.templateFareRows = [];
            this.expandedTemplateFareIds = [];
            this.estimated = 0;
            this.filteredWorkers = [];
          } else {
            this.filterWorkers();
          }
        } else {
          this.routes = [];
          this.vehicles = [];
          this.workers = [];
          this.filteredWorkers = [];
          this.saleModes = [{ id: "normal", name: "Venta Normal" }];
          this.ensureTemplateSaleMode();
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      }
    },
    async onTemplateBranchChange(branchId) {
      this.editedItem.branch_id = branchId;
      await this.loadTripTemplateFormData(branchId, { resetSelections: true });
      this.syncTemplateStopsFromRoute(true);
      this.syncTemplateFareRows(true);
    },
    async save() {
      this.loading = true;
      if (this.editedIndex === -1) {
        this.valid = false;
        const fieldsToUpdate = [
          "route_id",
          "branch_id",
          "vehicle_id",
          "schedule",
          "duration",
          "recurrence_pattern",
          "days_of_week",
          "active",
          "saleMode",
          "workers",
          "tripStops",
          "tripFares",
        ];

        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key))
          .reduce((obj, key) => {
            if (key === "workers") {
              // Transformar el campo `people`
              obj[key] = this.editedItem.workers.map((worker) => ({
                id: Number(worker.id),
                workerName: worker.workerName,
                workerImage: worker.workerImage,
                roleId: Number(worker.roleId),
                roleName: worker.roleName,
              }));
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTemplateStopsPayload(this.templateStopRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTemplateFaresPayload(this.templateFareRows);
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.branch_id = this.editedItem.branch_id ?? this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "trip-template",
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
          "schedule",
          "duration",
          "recurrence_pattern",
          "days_of_week",
          "active",
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
                  ? key !== "tripFares"
                    ? this.editedItem[key] !== this.originalItem[key]
                    : this.areTemplateFaresDifferent(
                        this.originalItem.tripFares,
                        this.templateFareRows
                      )
                  : this.areTemplateStopsDifferent(
                      this.originalItem.tripStops,
                      this.templateStopRows
                    )
                : this.areWorkersDifferent(this.originalItem[key], this.editedItem[key])) // Compara el array people
          )
          .reduce((obj, key) => {
            if (key === "workers") {
              // Transformar el campo `people`
              obj[key] = this.editedItem.workers.map((worker) => ({
                id: Number(worker.id),
                workerName: worker.workerName,
                workerImage: worker.workerImage,
                roleId: Number(worker.roleId),
                roleName: worker.roleName,
              }));
            } else if (key === "tripStops") {
              obj[key] = this.normalizeTemplateStopsPayload(this.templateStopRows);
            } else if (key === "tripFares") {
              obj[key] = this.normalizeTemplateFaresPayload(this.templateFareRows);
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
              endpoint: "trip-template",
              method: "PUT",
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
      this.originalItem.saleMode = this.normalizeTemplateSaleMode(this.originalItem);
      this.editedItem.saleMode = this.normalizeTemplateSaleMode(this.editedItem);
      this.originalItem.tripStops = this.parseTemplateStops(this.originalItem.tripStops);
      this.editedItem.tripStops = this.parseTemplateStops(this.editedItem.tripStops);
      this.originalItem.tripFares = this.parseTemplateFares(this.originalItem.tripFares);
      this.editedItem.tripFares = this.parseTemplateFares(this.editedItem.tripFares);
      this.templateStopRows = [];
      this.templateFareRows = [];
      this.editedItem.branch_id = this.editedItem.branch_id ?? this.branch_id;
      await this.loadTripTemplateFormData(this.editedItem.branch_id, {
        resetSelections: false,
      });

      const matchedRoute = this.getSelectedRouteRecord();
      this.estimated = matchedRoute ? matchedRoute.estimated : null;
      this.syncTemplateStopsFromRoute(false);
      this.syncTemplateFareRows(false);
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
          endpoint: "trip-template-destroy",
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
.avatar-border {
  border: 2px solid #000;
  /* AquÃ­ se define el borde */
}

.avatar-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: start;
}

.avatar-col {
  margin-right: -10px;
  /* Reduce the space between avatars */
}

.avatar-item {
  margin-right: -5px;
  border: 2px solid #1976d2;
  /* Cambia el color del borde segÃºn desees */
  border-radius: 50%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* Para que siga siendo redondo */
  box-sizing: border-box;
  /* Asegura que el borde no afecte el tamaÃ±o del avatar */
  /* Optional: reduce the space even further between avatars */
}

.avatar-item.hover-expand:hover {
  transform: scale(1.5);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.3);
}

.text-secondary {
  color: #6c757d;
  /* Color gris claro */
  font-size: 0.85rem;
  /* TamaÃ±o de texto mÃ¡s pequeÃ±o */
}

.custom-tooltip {
  background-color: #f5f5f5 !important;
  /* Fondo claro */
  color: #e5e5e5 !important;
  /* Texto oscuro */
  border-radius: 8px;
  /* Bordes redondeados */
  padding: 8px;
  /* Espaciado interno */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  /* Sombra suave */
}

.gap-1 {
  gap: 4px;
}

.selection-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px; /* Ajuste para alinear con el diseÃ±o */
}

.selection-icon {
  margin-right: 4px;
}

.selection-text {
  font-size: 0.875rem; /* TamaÃ±o consistente con Vuetify */
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
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* OCULTAR HEADER DE v-data-table - Vuetify 3.4.7 */
/* MÃ¡xima especificidad para ocultar el thead */
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

.trip-template-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.trip-template-filter {
  width: 280px;
  min-width: 260px;
}

.trip-template-search {
  width: 320px;
  min-width: 260px;
}

.trip-template-col-route {
  width: 25%;
  min-width: 0;
}

.trip-template-sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.trip-template-sortable-header:hover {
  color: #0f172a;
}

.trip-template-col-vehicle {
  width: 10%;
  min-width: 0;
}

.trip-template-col-workers {
  width: 12%;
  min-width: 0;
}

.trip-template-col-schedule {
  width: 7%;
  min-width: 0;
}

.trip-template-col-duration {
  width: 7%;
  min-width: 0;
}

.trip-template-col-frequency {
  width: 9%;
  min-width: 0;
}

.trip-template-col-days {
  width: 8%;
  min-width: 0;
}

.trip-template-col-sale-mode {
  width: 8%;
  min-width: 0;
}

.trip-template-col-status {
  width: 7%;
  min-width: 0;
}

.trip-template-col-actions {
  width: 7%;
  min-width: 0;
}

.trip-template-sale-mode-chip {
  max-width: 100%;
}

.trip-template-row {
  min-height: 70px;
}

.trip-template-route-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.trip-template-route-title {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-template-route-code-chip {
  max-width: 100%;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.trip-template-route-meta {
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
  transition: transform 0.15s ease;
}

.trip-worker-avatar:hover {
  transform: translateY(-1px) scale(1.05);
}

.avatar-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.avatar-item {
  border: 2px solid #ffffff;
  margin-left: -8px;
}

.avatar-item:first-child {
  margin-left: 0;
}

.hover-expand {
  transition: transform 0.15s ease;
}

.hover-expand:hover {
  transform: translateY(-2px) scale(1.05);
  z-index: 2;
}

.trip-template-dialog {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
}

.trip-template-dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.trip-template-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.trip-template-stepper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.trip-template-stepper :deep(.v-stepper-window),
.trip-template-stepper :deep(.v-window),
.trip-template-stepper :deep(.v-window__container),
.trip-template-stepper :deep(.v-stepper-window-item),
.trip-template-stepper :deep(.v-stepper-window-item > .v-window-item) {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.trip-template-stepper :deep(.v-stepper-window) {
  margin: 0;
}

.trip-template-stepper :deep(.v-window__container) {
  height: 100%;
}

.trip-template-stepper :deep(.v-stepper-window-item),
.trip-template-stepper :deep(.v-stepper-window-item > .v-window-item) {
  display: flex;
  flex-direction: column;
}

.trip-template-step-pane {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.trip-template-step-pane--workers {
  height: 100%;
}

.trip-template-step-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
  padding: 16px;
  height: 100%;
}

.trip-template-step-pane--summary .trip-template-step-content {
  overflow: visible;
}

.trip-template-step-content--workers {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  height: 100%;
}

.trip-template-workers-sheet {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.trip-template-workers-card-text {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  height: 100%;
}

.trip-template-table {
  min-height: 0;
  height: 100%;
}

.trip-template-table :deep(.v-table) {
  height: 100%;
}

.trip-template-table :deep(.v-table__wrapper) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.trip-template-workers-table {
  flex: 1;
  min-height: 0;
}

.trip-template-table {
  max-height: 52vh !important;
  overflow-y: auto !important;
}

.trip-template-workers-table :deep(.v-table__wrapper),
.trip-template-workers-table :deep(.v-data-table__wrapper) {
  max-height: 100%;
  overflow-y: auto;
}

.trip-template-step-actions {
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
  .trip-template-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .trip-template-filter,
  .trip-template-search {
    width: 100%;
    min-width: 100%;
  }

  .trip-template-col-route,
  .trip-template-col-vehicle,
  .trip-template-col-workers,
  .trip-template-col-schedule,
  .trip-template-col-duration,
  .trip-template-col-frequency,
  .trip-template-col-days,
  .trip-template-col-sale-mode,
  .trip-template-col-status,
  .trip-template-col-actions {
    width: 100%;
  }

  .trip-template-route-meta {
    flex-wrap: wrap;
  }

  .trip-template-route-title-row {
    flex-wrap: wrap;
  }
}
</style>
