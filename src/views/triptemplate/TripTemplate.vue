<template>
<div class="trip-templates-view">
  <v-snackbar class="busgo-snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" v-model="snackbar">
    <div class="template-alert"><v-icon :icon="sb_icon" size="22" /><div><strong>{{ sb_title }}</strong><div>{{ sb_message }}</div></div></div>
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
      Nueva plantilla
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
       
        class="busgo-table template-list-table"
      >
<template #headers><tr><th colspan="100" class="template-header-cell"><div class="template-readable-head"><div class="template-heading-group"><button type="button" class="template-sort-button" @click="toggleTemplateSort('routeCode')">Ruta<v-icon size="14">{{ templateSortIcon('routeCode') }}</v-icon></button></div><div class="template-heading-group"><button type="button" class="template-sort-button" @click="toggleTemplateSort('vehicleName')">Vehículo<v-icon size="14">{{ templateSortIcon('vehicleName') }}</v-icon></button><button type="button" class="template-sort-button template-sort-button--secondary" @click="toggleTemplateSort('workers')">Miembros<v-icon size="12">{{ templateSortIcon('workers') }}</v-icon></button></div><div class="template-heading-group"><button type="button" class="template-sort-button" @click="toggleTemplateSort('schedule')">Horario<v-icon size="14">{{ templateSortIcon('schedule') }}</v-icon></button><button type="button" class="template-sort-button template-sort-button--secondary" @click="toggleTemplateSort('duration')">Duración<v-icon size="12">{{ templateSortIcon('duration') }}</v-icon></button></div><div class="template-heading-group"><button type="button" class="template-sort-button" @click="toggleTemplateSort('recurrence_pattern')">Programación<v-icon size="14">{{ templateSortIcon('recurrence_pattern') }}</v-icon></button><button type="button" class="template-sort-button template-sort-button--secondary" @click="toggleTemplateSort('days_of_week')">Días<v-icon size="12">{{ templateSortIcon('days_of_week') }}</v-icon></button></div><div class="template-heading-group"><button type="button" class="template-sort-button" @click="toggleTemplateSort('saleMode')">Modalidad<v-icon size="14">{{ templateSortIcon('saleMode') }}</v-icon></button><button type="button" class="template-sort-button template-sort-button--secondary" @click="toggleTemplateSort('active')">Estado<v-icon size="12">{{ templateSortIcon('active') }}</v-icon></button></div><div>Acciones</div></div></th></tr></template>
        <template #item="{ item }">
          <tr><td colspan="100" class="pa-0 border-0">
            <div class="template-readable-row">
              <div class="template-route-cell">
                <strong class="template-cell-title">{{ item.routeCode || 'Sin código' }}</strong>
                <div class="template-endpoint"><v-icon size="14">mdi-map-marker-outline</v-icon><span><small>Origen</small>{{ item.origin || '—' }}</span></div>
                <div class="template-endpoint"><v-icon size="14">mdi-map-marker-check-outline</v-icon><span><small>Destino</small>{{ item.destination || '—' }}</span></div>
              </div>
              <div>
                <strong class="template-cell-title">{{ item.vehicleName || 'Sin vehículo' }}</strong>
                <v-chip size="x-small" variant="tonal" color="#2454d6" class="template-uniform-chip mt-2">Interno {{ getVehicleInternalNumber(item) }}</v-chip>
                <v-btn v-if="item.workers?.length" class="template-members-button" variant="text" size="small" color="#2454d6"
                  :aria-expanded="expandedMembersId === item.id" :aria-controls="`template-members-${item.id}`"
                  :append-icon="expandedMembersId === item.id ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  @click="expandedMembersId = expandedMembersId === item.id ? null : item.id">
                  {{ expandedMembersId === item.id ? 'Ocultar miembros' : 'Ver miembros' }} ({{ item.workers.length }})
                </v-btn>
                <span v-else class="template-muted">Sin miembros</span>
              </div>
              <div>
                <div class="template-time"><v-icon size="16" color="#2454d6">mdi-clock-outline</v-icon><strong>{{ item.schedule || '—' }}</strong></div>
                <div class="template-duration"><small>Duración</small><span>{{ item.duration ?? '—' }}</span></div>
              </div>
              <div>
                <div class="template-frequency"><v-icon size="15" color="#64748b">{{ getRecurrenceIcon(item.recurrence_pattern) }}</v-icon><span>{{ item.recurrence_pattern ? translateRecurrence(item.recurrence_pattern) : 'Sin frecuencia' }}</span></div>
                <div v-if="item.days_of_week" class="template-week" :aria-label="formatFullDayNames(getDaysArray(item.days_of_week))">
                  <span v-for="(day, index) in ['D', 'L', 'M', 'X', 'J', 'V', 'S']" :key="index" class="template-week-day" :class="{ 'template-week-day--selected': getDaysArray(item.days_of_week).includes(index) }" :title="['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][index]">{{ day }}</span>
                </div>
                <span v-else class="template-muted">Sin días definidos</span>
              </div>
              <div class="template-chip-stack">
                <v-chip :color="getSaleModeColor(item)" size="x-small" variant="tonal" class="template-uniform-chip">{{ normalizeTemplateSaleMode(item) === 'express' ? 'Express' : 'Full' }}</v-chip>
                <v-chip :color="item.active ? '#16845b' : '#64748b'" size="x-small" variant="tonal" class="template-uniform-chip">{{ item.active ? 'Activa' : 'Inactiva' }}</v-chip>
              </div>
              <div class="template-row-actions">
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="#2454d6" title="Editar plantilla" aria-label="Editar plantilla" @click="editItem(item)" />
                <v-btn icon="mdi-trash-can-outline" variant="text" size="small" color="#dc2626" title="Eliminar plantilla" aria-label="Eliminar plantilla" @click="deleteItem(item)" />
              </div>
            </div>
          </td></tr>
          <tr v-if="expandedMembersId === item.id && item.workers?.length" class="template-members-expanded-row">
            <td colspan="100" class="template-members-expanded-cell">
              <section :id="`template-members-${item.id}`" class="template-members-panel" :aria-label="`Miembros de la plantilla ${item.routeCode || item.id}`">
                <div class="template-members-panel-heading">
                  <div><strong>Miembros asignados</strong><span>{{ item.routeCode || 'Plantilla' }} · {{ item.workers.length }} miembro(s)</span></div>
                  <v-btn icon="mdi-close" variant="text" size="small" aria-label="Ocultar miembros" @click="expandedMembersId = null" />
                </div>
              <div class="template-worker-list">
                <div v-for="person in item.workers || []" :key="person.id" class="template-worker-person">
                  <v-avatar size="26" color="#eef3ff">
                    <v-img v-if="person.workerImage || person.image" :src="`${$axios.defaults.baseURL}images/${person.workerImage || person.image}?t=${getCacheTimestamp()}`" :alt="person.workerName || person.name || 'Trabajador'"><template #error><v-icon size="16" color="#2454d6">mdi-account-outline</v-icon></template></v-img>
                    <v-icon v-else size="16" color="#2454d6">mdi-account-outline</v-icon>
                  </v-avatar>
                  <div><strong>{{ person.workerName || person.name || 'Sin nombre' }}</strong><small v-if="person.roleName">{{ person.roleName }}</small></div>
                </div>
                <span v-if="!item.workers?.length" class="template-muted">Sin trabajadores</span>
              </div>

              </section>
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
    <v-card class="trip-template-dialog" elevation="0">
      <div class="template-dialog-header">
        <span class="template-dialog-icon"><v-icon size="23">mdi-calendar-clock</v-icon></span>
        <div><div class="template-dialog-title">{{ formTitle }}</div><div class="template-dialog-subtitle">Configura el viaje, sus paradas, tarifas y trabajadores</div></div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" aria-label="Cerrar plantilla" class="template-dialog-close" @click="close()" />
      </div>
      <v-card-text class="trip-template-dialog-body pa-0">
        <v-form
          v-model="valid"
          enctype="multipart/form-data"
          class="trip-template-form"
        >
          <v-stepper
            elevation="0"
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
                      prepend-inner-icon="mdi-store"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
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
                      prepend-inner-icon="mdi-road"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
                      :rules="selectRules"
                      density="compact"
                      class="trip-template-frequency-select"
                    >
                      <template #item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :prepend-icon="getRecurrenceIcon(item.raw.value)"
                          :color="getRecurrenceColor(item.raw.value)"
                          :class="{
                            'trip-template-frequency-item--selected':
                              editedItem.recurrence_pattern === item.raw.value,
                          }"
                        >
                          <template
                            v-if="editedItem.recurrence_pattern === item.raw.value"
                            #append
                          >
                            <v-icon
                              :color="getRecurrenceColor(item.raw.value)"
                              icon="mdi-check-circle"
                              size="small"
                            />
                          </template>
                        </v-list-item>
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
                        class="ma-1 trip-template-day-chip"
                        :color="getDayColor(day.value)"
                        :variant="isDaySelected(day.value) ? 'flat' : 'outlined'"
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
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
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
                  <v-btn class="template-secondary-btn" variant="flat" @click="close()">
                    Salir
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    :color="paleteColors.primary"
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
                      <template #headers><tr><th colspan="100" class="template-header-cell">
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
                      </th></tr></template>

                      <template #item="slotProps">
                        <tr>
                          <td colspan="100" style="padding: 0; border: none">
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
                                    variant="outlined"
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
                  <v-btn class="template-secondary-btn" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    :color="paleteColors.primary"
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
                      <template #headers><tr><th colspan="100" class="template-header-cell">
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
                      </th></tr></template>

                      <template #item="slotProps">
                        <tr>
                          <td colspan="100" style="padding: 0; border: none">
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

              <div class="trip-template-step-actions">
                <v-row class="mt-1">
                  <v-btn class="template-secondary-btn" variant="flat" @click="prevStep">
                    Volver
                  </v-btn>

                  <v-spacer />

                  <v-btn :color="paleteColors.primary" variant="flat" @click="nextStep">
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
                  <v-btn class="template-secondary-btn" variant="flat" @click="prevStep">
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
    <v-card class="busgo-dialog-card template-small-dialog">
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
      <v-card class="busgo-dialog-card template-small-dialog">
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
                  prepend-inner-icon="mdi-account"
                  item-title="workerName"
                  item-value="id"
                  variant="outlined"
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
</div>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import _ from "lodash";
export default {
  data: () => ({
    expandedMembersId: null,
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
    saleModes: [{ id: "normal", name: "Venta Full" }],
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
      { text: "Personalizado", value: "weekly" },
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
        ? "Nueva plantilla"
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
    getSaleModeName(template = {}) {
      const saleMode = this.normalizeTemplateSaleMode(template);
      const fallbackNames = {
        normal: "Venta Full",
        express: "Venta Express",
      };
      if (saleMode === "normal") {
        return fallbackNames.normal;
      }
      return this.saleModes.find((mode) => mode.id === saleMode)?.name || fallbackNames[saleMode] || saleMode;
    },
    getSaleModeShortName(template = {}) {
      return this.getSaleModeName(template).replace(/^Venta\s+/i, "");
    },
    getSaleModeColor(template = {}) {
      return this.normalizeTemplateSaleMode(template) === "express" ? "#16845b" : "#2454d6";
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
        weekly: "Personalizado",
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
          this.saleModes = this.normalizeSaleModeOptions(result.data?.saleModes);
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
          this.saleModes = this.normalizeSaleModeOptions();
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
<style scoped>
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

.trip-template-frequency-select :deep(.v-field__input) {
  color: #1f2937;
  font-weight: 500;
}

.trip-template-frequency-item--selected {
  background: #fff3e0;
  border-left: 4px solid #fb8c00;
  color: #e65100;
  font-weight: 700;
}

.trip-template-day-chip {
  min-width: 34px;
  justify-content: center;
  border-color: #b6c5d8;
  color: #334155;
  font-weight: 700;
}

.trip-template-day-chip.v-chip--variant-flat {
  border: 1px solid #1976d2;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.24);
}

.trip-template-day-chip.v-chip--disabled {
  opacity: 0.62;
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

/* Compact BusGo page and dialogs; isolated from other views. */
.trip-templates-view { min-height:100%; background:#f6f8fb; color:#1e293b; }
.busgo-page-header { display:flex; align-items:center; gap:11px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; border-radius:0!important; }
.busgo-page-icon { flex:0 0 38px; width:38px!important; height:38px!important; border-radius:10px!important; color:#fff!important; background:#173b8f!important; }
.busgo-page-title { font-size:19px; font-weight:800; color:#0f172a; line-height:1.2; }
.busgo-page-subtitle { font-size:12px; color:#526176; line-height:1.5; margin-top:4px; }
.busgo-add-btn { min-height:40px; background:#2454d6!important; color:#fff!important; border-radius:9px; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; }
.busgo-container { padding:18px 24px 28px!important; }
.busgo-card { background:#fff; border:1px solid #e4eaf2; border-radius:12px; overflow:hidden; }
.busgo-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 16px; }
.busgo-card-title { font-size:15px; font-weight:800; color:#0f172a; }
.busgo-card-subtitle { font-size:12px; color:#526176; margin-top:4px; line-height:1.5; }
.trip-template-toolbar { padding-inline:20px!important; gap:12px; }
.trip-template-filter { flex:0 1 280px; }
.trip-template-search { flex:0 1 320px; }
.trip-template-toolbar :deep(.v-field),.template-small-dialog :deep(.v-field),.trip-template-dialog :deep(.v-field) { background:#fff; border-radius:9px; color:#233654; }
.trip-template-toolbar :deep(.v-field__input),.template-small-dialog :deep(.v-field__input),.trip-template-dialog :deep(.v-field__input) { font-size:14px; color:#233654; }
.trip-template-dialog :deep(.v-label),.template-small-dialog :deep(.v-label) { color:#475569; opacity:1; font-size:13px; }
.trip-template-dialog :deep(.v-field__outline),.trip-template-toolbar :deep(.v-field__outline) { color:#c5cfdd; }
.template-list-table :deep(.v-table__wrapper > table) { min-width:1390px; }
.template-list-table :deep(thead),.trip-template-table :deep(thead) { display:table-header-group!important; }
.template-header-cell { height:auto!important; padding:0!important; border:0!important; }
.busgo-table-head,.trip-template-row { display:grid!important; grid-template-columns:2.3fr 1fr 1fr .85fr .7fr .9fr 1fr .65fr .65fr 80px; align-items:center; gap:12px; min-width:1390px; padding:12px 17px!important; margin:0!important; border-radius:0!important; }
.busgo-table-head > div,.trip-template-row > div { width:auto!important; min-width:0; }
.busgo-table-head { min-height:42px; background:#f3f6fa; border-bottom:1px solid #e4eaf2; color:#334155; font-size:11px; font-weight:800; }
.busgo-table-head :deep(.v-icon) { font-size:14px!important; }
.trip-template-row { min-height:70px; background:#fff; border-bottom:1px solid #edf1f6; color:#334155; font-size:13px; }
.trip-template-row:hover { background:#f8faff; }
.trip-template-sortable-header:hover { color:#2454d6; }
.template-list-table :deep(.v-data-table-footer) { padding:6px 16px; font-size:12px; color:#475569; min-height:52px; }
.trip-template-route-title,.busgo-name { font-size:13px; font-weight:750; color:#1e293b; }
.trip-template-route-meta { display:grid; grid-template-columns:14px minmax(0,1fr); gap:3px 5px; font-size:12px; color:#526176; }
.trip-template-route-meta .text-truncate { white-space:normal; overflow-wrap:anywhere; }
.trip-template-route-meta :deep(.mx-2) { margin:0!important; }
.template-internal-number { display:inline-block; padding:3px 7px; background:#eef3ff; color:#2454d6; border-radius:6px; font-size:11px; font-weight:750; }
.busgo-actions { display:flex; align-items:center; justify-content:flex-end; gap:2px; }
.busgo-actions :deep(.v-btn) { border-radius:8px; }
.template-alert { display:flex; gap:10px; align-items:center; font-size:12px; }
.template-alert strong { display:block; font-size:13px; margin-bottom:3px; }
.trip-template-dialog { height:100vh; height:100dvh; min-height:0; background:#f6f8fb; color:#1e293b; border-radius:0; }
.template-dialog-header { display:flex; align-items:center; flex-shrink:0; gap:11px; min-height:70px; padding:12px 24px; background:#142b55; color:#fff; }
.template-dialog-icon { display:grid; place-items:center; width:38px; height:38px; flex:0 0 38px; border-radius:10px; background:#294777; }
.template-dialog-title { font-size:19px; font-weight:800; line-height:1.2; }
.template-dialog-subtitle { font-size:12px; color:#d3def1; line-height:1.4; margin-top:4px; }
.template-dialog-close { color:#fff; background:#294777; border-radius:9px; }
.trip-template-stepper { background:#f6f8fb; box-shadow:none!important; }
.trip-template-stepper :deep(.v-stepper-header) { flex-shrink:0; min-height:64px; background:#fff; border-bottom:1px solid #e1e8f1; box-shadow:none; }
.trip-template-stepper :deep(.v-stepper-item) { padding:16px 20px; }
.trip-template-stepper :deep(.v-stepper-item__title) { font-size:13px; font-weight:700; color:#475569; }
.trip-template-stepper :deep(.v-stepper-item--selected .v-stepper-item__avatar) { background:#2454d6; color:#fff; }
.trip-template-step-content,.trip-template-step-pane--summary .trip-template-step-content { overflow:auto; padding:18px 24px; height:auto; }
.trip-template-step-content > .v-row { flex:0 0 auto; background:#fff; border:1px solid #e4eaf2; border-radius:12px; padding:12px; margin:0!important; }
.trip-template-step-actions { flex-shrink:0; padding:14px 24px; background:#fff; border-top:1px solid #e1e8f1; }
.trip-template-step-actions > .v-row { margin:0!important; gap:10px; }
.trip-template-step-actions :deep(.v-btn),.busgo-dialog-actions :deep(.v-btn) { min-height:40px; border-radius:9px; font-size:13px; font-weight:750; letter-spacing:0; text-transform:none; box-shadow:none; }
.template-secondary-btn { color:#475569!important; background:#f1f5f9!important; border:1px solid #dce3ed; }
.trip-template-step-actions :deep(.v-btn--disabled) { background:#dce3ed!important; color:#64748b!important; }
.trip-template-dialog :deep(.v-sheet),.trip-template-dialog :deep(.v-card) { border-radius:10px; }
.trip-template-dialog :deep(.v-toolbar) { border-radius:10px 10px 0 0; }
.trip-template-dialog :deep(.v-toolbar__content) { min-height:48px; height:auto!important; padding-block:8px; }
.trip-template-dialog :deep(.text-subtitle-1) { font-size:14px!important; font-weight:700; }
.trip-template-table { max-height:none!important; height:auto; overflow:visible!important; border:1px solid #e4eaf2; border-radius:10px; box-shadow:none!important; }
.trip-template-table :deep(.v-table__wrapper) { height:auto; overflow:auto; }
.trip-template-table :deep(table) { min-width:950px; }
.trip-template-workers-table :deep(table) { min-width:650px; }
.trip-template-table :deep(th) { font-size:12px; color:#334155; background:#f3f6fa; }
.trip-template-table :deep(td) { font-size:13px; color:#334155; }
.trip-template-workers-sheet,.trip-template-workers-card-text { height:auto; overflow:visible; flex:0 0 auto; }
.trip-template-workers-card-text { display:block; padding:14px; }
.trip-template-step-content--workers { overflow:auto; }
.trip-fare-ticket-types-header { background:#f3f6fa; font-size:12px; }
.trip-fare-ticket-types-row { font-size:13px; }
.template-small-dialog { border:1px solid #e4eaf2; border-radius:12px; background:#fff; color:#1e293b; }
.template-small-dialog :deep(.v-toolbar__content) { min-height:56px; height:auto!important; }
.template-small-dialog :deep(.v-card-text) { font-size:14px; color:#334155; }
.busgo-dialog-actions { background:#f8fafc; padding:14px 18px; gap:8px; }
@media(max-width:959px) {
  .busgo-page-header,.template-dialog-header { padding-inline:17px; }
  .busgo-container { padding:15px 17px 24px!important; }
  .trip-template-filter,.trip-template-search { flex:0 1 auto; width:100%; min-width:0; }
  .trip-template-step-content { padding:15px 17px; }
}
@media(max-width:600px) {
  .busgo-page-header { flex-wrap:wrap; padding:12px; }
  .busgo-add-btn { margin-left:49px; }
  .busgo-container { padding:12px!important; }
  .busgo-page-title,.template-dialog-title { font-size:17px; }
  .template-dialog-header { padding:12px; }
  .template-dialog-subtitle { font-size:11px; }
  .trip-template-step-content { padding:12px; }
  .trip-template-step-actions { padding:12px; }
  .trip-template-stepper :deep(.v-stepper-item) { padding:12px 8px; }
}


/* Group related information into readable columns without hiding fields. */
.template-list-table :deep(.v-table__wrapper > table) { min-width:1100px; }
.template-readable-head,.template-readable-row { display:grid; grid-template-columns:minmax(210px,1.7fr) minmax(115px,1fr) minmax(160px,1.25fr) minmax(90px,.75fr) minmax(176px,1.35fr) 80px 76px; gap:14px; padding:14px 18px; min-width:1100px; }
.template-readable-head { background:#f3f6fa; color:#334155; font-size:11px; font-weight:750; border-bottom:1px solid #e4eaf2; align-items:center; }
.template-heading-group { display:flex; flex-direction:column; gap:5px; }
.template-sort-button { display:flex; align-items:center; gap:5px; text-align:left; font:inherit; color:inherit; cursor:pointer; width:fit-content; }
.template-sort-button:hover { color:#2454d6; }
.template-sort-button:focus-visible { outline:2px solid #2454d6; outline-offset:3px; border-radius:3px; }
.template-sort-button--secondary { color:#64748b; font-size:10px; font-weight:600; }
.template-readable-row { min-height:110px; align-items:start; background:#fff; border-bottom:1px solid #e8edf5; color:#334155; font-size:13px; }
.template-readable-row:hover { background:#f8faff; }
.template-readable-row > div { min-width:0; }
.template-cell-title { display:block; font-size:13px; color:#1e293b; font-weight:750; line-height:1.5; white-space:normal; overflow-wrap:anywhere; }
.template-endpoint { display:flex; align-items:flex-start; gap:6px; margin-top:6px; color:#475569; font-size:12px; line-height:1.45; }
.template-endpoint > .v-icon { margin-top:3px; flex-shrink:0; color:#64748b; }
.template-endpoint span { min-width:0; overflow-wrap:anywhere; }
.template-endpoint small { display:block; font-size:10px; color:#64748b; line-height:1.3; }
.template-worker-list { display:flex; flex-direction:column; gap:9px; }
.template-worker-person { display:flex; align-items:flex-start; gap:7px; }
.template-worker-person > .v-avatar { flex-shrink:0; }
.template-worker-person > div { min-width:0; }
.template-worker-person strong { display:block; color:#334155; font-size:12px; font-weight:650; white-space:normal; overflow-wrap:anywhere; line-height:1.4; }
.template-worker-person small { display:block; font-size:11px; color:#64748b; margin-top:2px; white-space:normal; }
.template-time { display:flex; align-items:center; gap:6px; color:#233654; font-size:14px; }
.template-duration { margin-top:10px; color:#475569; font-size:12px; }
.template-duration small { display:block; font-size:10px; color:#64748b; margin-bottom:3px; }
.template-frequency { display:flex; align-items:center; gap:5px; font-size:12px; font-weight:650; line-height:1.5; }
.template-week { display:flex; flex-wrap:wrap; gap:3px; margin-top:10px; }
.template-week-day { display:grid; place-items:center; width:21px; height:23px; border-radius:5px; background:#f1f5f9; color:#64748b; border:1px solid #e4eaf2; font-size:10px; font-weight:650; }
.template-week-day--selected { background:#eef3ff; border-color:#cbdcff; color:#2454d6; }
.template-chip-stack { display:flex; flex-direction:column; align-items:flex-start; gap:8px; }
.template-uniform-chip { height:23px; border-radius:6px; font-size:11px; font-weight:700; letter-spacing:0; max-width:100%; }
.template-uniform-chip :deep(.v-chip__content) { white-space:normal; overflow-wrap:anywhere; }
.template-row-actions { display:flex; align-items:center; gap:0; }
.template-row-actions .v-btn { border-radius:8px; width:36px; height:36px; }
.template-row-actions :deep(.v-icon) { font-size:18px; }
.template-muted { display:block; color:#64748b; font-size:11px; line-height:1.5; margin-top:5px; }

/* Keep the overview compact and reveal the team on demand. */
.template-list-table :deep(.v-table__wrapper > table) { min-width:980px; }
.template-readable-head,.template-readable-row { grid-template-columns:minmax(230px,1.8fr) minmax(164px,1.2fr) minmax(92px,.75fr) minmax(176px,1.3fr) 80px 76px; min-width:980px; gap:14px; padding:12px 18px; }
.template-readable-row { min-height:86px; align-items:center; }
.template-endpoint { margin-top:4px; }
.template-endpoint small { display:inline; margin-right:5px; }
.template-members-button.v-btn { display:flex; margin:5px 0 0 -8px; padding:0 8px; min-height:28px; height:auto; font-size:11px; font-weight:650; text-transform:none; letter-spacing:0; border-radius:6px; }
.template-members-button:focus-visible { outline:2px solid #2454d6; outline-offset:2px; }
.template-members-expanded-cell { padding:0 18px 14px!important; border-bottom:1px solid #dfe7f2!important; background:#f8faff; }
.template-members-panel { border:1px solid #dfe7f2; border-radius:10px; background:#fff; padding:14px 16px; }
.template-members-panel-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.template-members-panel-heading strong { display:block; color:#233654; font-size:13px; font-weight:750; }
.template-members-panel-heading span { display:block; margin-top:3px; color:#64748b; font-size:11px; }
.template-members-panel .template-worker-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:10px; }
.template-members-panel .template-worker-person { padding:10px 12px; border:1px solid #e8edf5; border-radius:8px; background:#f9fbfe; align-items:center; }
.template-members-panel .template-worker-person strong { font-size:13px; }
</style>
