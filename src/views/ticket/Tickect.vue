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
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>
  <v-card
    class="d-flex align-center pa-3"
    elevation="0"
    style="background-color: #f9f9f9"
  >
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-ticket</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Tickets</div>
      <div class="text-body-2 text-grey">Gestionar Tickets</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn
      class="text-subtitle-1 ml-12"
      :color="paleteColors.primary"
      variant="tonal"
      elevation="2"
      prepend-icon="mdi-plus-circle"
      @click="showAdd()"
    >
      Vender ticket
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%">
    <v-card flat>
      <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-subtitle-1 font-weight-bold">Listado deTickets Vendidos</div>

        <!-- Spacer (solo visible en md+) -->
        <v-spacer class="d-none d-md-block"></v-spacer>

        <!-- Grupo: Autocomplete + Botón buscar -->
        <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 25%">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->
          <v-autocomplete
            :no-data-text="'No hay datos disponibles'"
            v-model="branch_id"
            v-if="mostrarFila"
            :items="branches"
            label="Seleccione una Sucursal"
            prepend-inner-icon="mdi-store"
            item-title="name"
            class="mr-1"
            item-value="id"
            variant="solo-filled"
            hide-details
            single-line
            flat
            :rules="selectRules"
            density="compact"
            @update:modelValue="initialize"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
              >
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Botón de búsqueda (actualizar datos) 
          <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable" :disabled="!branch_id"
            class="mt-2 mt-md-0 mr-5 ml-1">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>-->
        </div>

        <div class="flex-grow-1 mr-1" style="max-width: 15%">
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :modelValue="dateFormattedSearch"
                prepend-inner-icon="mdi-calendar"
                label="Fecha"
                density="compact"
                variant="solo-filled"
                hide-details
                single-line
                flat
              ></v-text-field>
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
              ></v-date-picker>
            </v-locale-provider>
          </v-menu>
        </div>

        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 20%">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar ticket"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <!-- Separador -->
      <v-divider class="my-2"></v-divider>

      <!-- Tabla de viajes con filas personalizadas -->
      <v-data-table
        :headers="headers"
        :items="tickets"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="elevation-1"
        style="max-height: 68vh; overflow-y: auto; background: transparent"
      >
        <template v-slot:top>
          <!-- Tarjeta de encabezado con alto fijo -->
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
              <!-- Negocio (20%) -->
              <div style="width: 34%; min-width: 0" class="text-left font-weight-bold">
                Ruta
              </div>

              <!-- Nombre (20%) -->

              <!-- Teléfono (10%) -->

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Fecha
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Horario
              </div>

              <div style="width: 8%; min-width: 0" class="text-left font-weight-bold">
                Método
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Pasajes
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Asientos
              </div>

              <div style="width: 8%; min-width: 0" class="text-left font-weight-bold">
                Precio
              </div>

              <div style="width: 8%; min-width: 0" class="text-left font-weight-bold">
                Total
              </div>

              <!-- Acciones (25%) -->
              <div
                style="width: 10%; min-width: 0"
                class="d-flex justify-left font-weight-bold"
              ></div>
            </v-card-text>
          </v-card>
        </template>
        <!-- Fila personalizada -->
        <template v-slot:item="slotProps">
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
                  <div style="width: 34%; min-width: 0" class="text-truncate pr-2">
                    <div class="d-flex align-center gap-2 text-truncate">
                      <div class="font-weight-medium text-truncate">
                        {{ slotProps.item.tripName }}
                      </div>
                      <v-chip
                        v-if="getTicketFareSegment(slotProps.item)"
                        size="x-small"
                        :color="paleteColors.primary"
                        variant="tonal"
                        class="flex-shrink-0 ml-2"
                      >
                        Tramo
                      </v-chip>
                    </div>
                    <div class="d-flex align-center flex-wrap text-caption text-grey text-truncate mt-1">
                      <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                      <span class="text-truncate">
                        Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}
                      </span>
                      <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>
                      <span class="text-truncate">
                        Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                      </span>
                    </div>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Ruta: {{ slotProps.item.tripName }}<br />
                        Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}<br />
                        Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.date }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Fecha: {{ slotProps.item.date }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.schedule }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Horario: {{ slotProps.item.schedule }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 8%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.method }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Método: {{ slotProps.item.method }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.quantity }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Passajes: {{ slotProps.item.quantity }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                    <span>{{ slotProps.item.seats }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Asientos: {{ slotProps.item.seats }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 8%; min-width: 0" class="text-truncate text-left">
                    <span>{{ formatNumber(Number(slotProps.item.price)) }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Precio: {{ formatNumber(Number(slotProps.item.price)) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 8%; min-width: 0" class="text-truncate text-left">
                    <span>{{ formatNumber(Number(slotProps.item.total)) }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Total: {{ formatNumber(Number(slotProps.item.total)) }}
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Acciones -->
                  <div
                    class="d-flex gap-1"
                    style="width: 10%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <!--<v-btn size="35" icon variant="outlined"
                                            :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                                            :color="paleteColors.primary" @click="editItem(slotProps.item)"
                                            class="flex-shrink-0 mr-1" title="Editar Ticket">
                                            <v-icon size="20">mdi-pencil</v-icon>
                                        </v-btn>-->

                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.green"
                      @click="printerItem(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Reimprimir Ticket"
                    >
                      <v-icon size="20">mdi-printer</v-icon>
                    </v-btn>

                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error"
                      @click="deleteItem(slotProps.item)"
                      class="flex-shrink-0"
                      title="Eliminar Ticket"
                    >
                      <v-icon size="20">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card style="height: 100vh">
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-row style="margin-top: 5px">
            <!-- Selección de viaje -->
            <v-col cols="12" md="12">
              <v-autocomplete
                v-model="editedItem.trip_id"
                :items="trips"
                label="Selecciona el viaje"
                prepend-icon="mdi-road"
                item-title="name"
                item-value="id"
                variant="underlined"
                :rules="selectRules"
                density="compact"
                :no-data-text="'No hay datos disponibles'"
                @update:model-value="updateSeats"
                :menu-props="{ maxHeight: 400, maxWidth: 600 }"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" title="" class="pa-3">
                    <v-container fluid>
                      <v-row dense>
                        <v-col cols="12" md="2" class="d-flex flex-column justify-center">
                          <div class="d-flex align-center mb-1">
                            <span><strong>Ruta</strong> </span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <span>{{ item.raw.name }}</span>
                          </div>
                        </v-col>

                        <!-- Horarios y Vehículo -->
                        <v-col cols="12" md="2" class="d-flex flex-column justify-center">
                          <div class="d-flex align-center mb-1">
                            <v-icon small color="red darken-4" class="mr-2"
                              >mdi mdi-circle-medium</v-icon
                            >
                            <span
                              ><strong>Salida:{{ item.raw.schedule }}</strong>
                            </span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <v-icon small color="teal darken-1" class="mr-2"
                              >mdi-triangle-small-down</v-icon
                            >
                            <span>Llegada: {{ item.raw.arrival }}</span>
                          </div>
                        </v-col>
                        <!-- Origen -->

                        <v-col cols="12" md="4" class="d-flex align-start">
                          <div class="ml-3 text-truncate">
                            <div class="d-flex align-center mb-1">
                              <strong> {{ item.raw.origin }}</strong>
                            </div>

                            <div class="d-flex align-center mb-1">
                              {{ item.raw.destination }}
                            </div>
                          </div>
                        </v-col>

                        <v-col cols="12" md="2" class="d-flex align-start">
                          <div class="ml-3 text-truncate">
                            <div class="d-flex align-center mb-1">
                              <strong> Vehículo</strong>
                            </div>

                            <div class="d-flex flex-column align-start mb-1">
                              <span class="text-truncate">{{ item.raw.plate }}</span>
                              <span class="text-caption text-grey text-truncate">
                                {{ getTripInternalNumber(item.raw) }}
                              </span>
                            </div>
                          </div>
                        </v-col>

                        <v-col cols="12" md="2" class="d-flex align-start">
                          <div class="ml-3 text-truncate">
                            <div class="d-flex align-center mb-1">
                              <strong> Precio</strong>
                            </div>
                            <div class="d-flex align-center mb-1">
                              <span>{{ formatNumber(Number(item.raw.price)) }} CLP</span>
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Método de pago -->
            <v-col cols="12" md="2" v-if="false">
              <v-select
                v-model="editedItem.method"
                :items="paymentMethods"
                label="Método de pago"
                item-value="value"
                item-title="text"
                variant="underlined"
                density="compact"
                :rules="[(v) => !!v || 'Seleccione un método de pago']"
                prepend-icon="mdi-cash"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :disabled="item.raw.disabled">
                    <template v-slot:prepend>
                      <v-icon :icon="item.raw.icon"></v-icon>
                      <!-- Ícono de la opción -->
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="12">
              <v-autocomplete
                v-model="editedItem.fare_segment_id"
                :items="fareSegmentOptions"
                label="Selecciona el tramo"
                prepend-icon="mdi-vector-line"
                item-title="label"
                item-value="id"
                variant="underlined"
                :rules="fareSegmentRules"
                density="compact"
                :no-data-text="'No hay datos disponibles'"
                :disabled="!editedItem.trip_id"
                clearable
                :menu-props="{ maxHeight: 420, maxWidth: 760 }"
                @update:model-value="updateFareSegment"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" title="" class="pa-3">
                    <v-container fluid>
                      <v-row dense>
                        <v-col cols="12" md="4" class="d-flex flex-column justify-center">
                          <div class="d-flex align-center mb-1">
                            <strong>{{ item.raw.label }}</strong>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <span class="text-caption text-grey">
                              {{ item.raw.service_class_label }}
                            </span>
                          </div>
                        </v-col>

                        <v-col cols="12" md="4" class="d-flex flex-column justify-center">
                          <div class="d-flex align-center mb-1">
                            <span class="font-weight-medium">Origen:</span>
                            <span class="ml-1">{{ item.raw.origin_label }}</span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <span class="font-weight-medium">Destino:</span>
                            <span class="ml-1">{{ item.raw.destination_label }}</span>
                          </div>
                        </v-col>

                        <v-col cols="12" md="4" class="d-flex flex-column justify-center">
                          <div class="d-flex align-center mb-1">
                            <span class="font-weight-medium">Precio:</span>
                            <span class="ml-1">
                              {{ formatNumber(Number(item.raw.base_price)) }} CLP
                            </span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <span class="text-caption text-grey">
                              Vigencia: {{ item.raw.valid_from || "-" }} a
                              {{ item.raw.valid_to || "-" }}
                            </span>
                          </div>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item>
                </template>
              </v-autocomplete>
              <div class="text-caption text-grey mt-1">
                Si no seleccionas tramo, se venderá el viaje completo.
              </div>

            </v-col>

            <!-- Fecha -->
            <v-col cols="12" md="2" v-if="false">
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="190px"
                disabled="true"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    :modelValue="dateFormatted"
                    variant="underlined"
                    prepend-icon="mdi-calendar"
                    label="Fecha"
                    density="compact"
                  ></v-text-field>
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
                  ></v-date-picker>
                </v-locale-provider>
              </v-menu>
            </v-col>

            <!-- Precio del pasaje -->
            <v-col cols="12" md="2" v-if="false">
              <v-text-field
                v-model="editedItem.price"
                label="Precio del pasaje"
                type="number"
                variant="underlined"
                density="compact"
                prepend-icon="mdi-cash"
                :rules="[(v) => v > 0 || 'Debe ser un precio válido']"
                placeholder="Ingrese el precio del pasaje"
                min="0"
                step="0.01"
                readonly
              ></v-text-field>
            </v-col>

            <!-- Cantidad de pasajes -->
            <v-col cols="12" md="2" v-if="false">
              <v-text-field
                v-model="editedItem.quantity"
                label="Cantidad de pasajes"
                type="number"
                variant="underlined"
                density="compact"
                prepend-icon="mdi-ticket"
                placeholder="Ingrese la cantidad"
                min="1"
                @update:model-value="calculateTotal"
                :rules="quantityAndPassengerRules"
                :disabled="!editedItem.trip_id || !aviable"
                :hint="!editedItem.quantity ? `Asientos disponibles: ${aviable}` : ''"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Selección de asientos -->
            <v-col cols="12" md="2" v-if="false">
              <v-text-field
                :value="
                  selectedSeats.length > 0
                    ? selectedSeats.join(', ')
                    : 'Seleccionar Asientos'
                "
                color="primary"
                dark
                readonly
                style="text-transform: none"
                :disabled="editedItem.quantity <= 0"
                prepend-icon="mdi-seat"
                density="compact"
                variant="underlined"
                :rules="[
                  (v) =>
                    selectedSeats.length > 0 || 'Debe seleccionar al menos un asiento',
                ]"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Pasajeros adultos y menores -->
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="bg-primary"
                  ><span class="text-subtitle-2 ml-2">Tipos de Pasaje</span></v-card-title
                >
                <v-card-text
                  class="bg-white pt-4"
                  style="min-height: 44vh; overflow-y: auto"
                >
                  <div v-if="mergedTicketTypes.length > 0">
                    <div
                      v-for="ticket in mergedTicketTypes"
                      :key="ticket.id"
                      class="mb-2"
                    >
                      <v-row align="center">
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model.number="ticket.cant"
                            @update:model-value="handleQuantityChange(ticket, $event)"
                            @blur="validateQuantity(ticket)"
                            :label="ticket.name"
                            variant="underlined"
                            density="compact"
                            type="number"
                            min="0"
                            :error-messages="
                              (currentlyEditing === ticket.id && seatError) ||
                              quantityErrors[ticket.id]
                            "
                            hide-details="auto"
                          ></v-text-field>
                          <div
                            v-if="Number(ticket.cant) > 0"
                            class="ticket-total-preview text-caption text-primary mt-1"
                          >
                            Total a pagar:
                            <strong>
                              {{ formatNumber(getTicketTypePayableAmount(ticket)) }} CLP
                            </strong>
                          </div>
                        </v-col>
                        <v-col cols="12" md="6" class="d-flex align-center">
                          <!-- Mostrar autocomplete cuando se está agregando tarifa -->
                          <div v-if="ticket.showPromotionSelect" class="flex-grow-1">
                            <v-autocomplete
                              v-model="ticket.selectedPromotion"
                              :items="promotions"
                              label="Seleccionar tarifa"
                              item-title="name"
                              item-value="id"
                              variant="underlined"
                              density="compact"
                              :no-data-text="'No hay tarifas disponibles'"
                              @update:model-value="(val) => applyPromotion(ticket, val)"
                              @blur="ticket.showPromotionSelect = false"
                              autofocus
                            >
                              <template v-slot:item="{ props, item }">
                                <v-list-item v-bind="props">
                                  <template v-slot:prepend>
                                    <v-icon :icon="getPromotionDiscountIcon(item.raw)"></v-icon>
                                  </template>
                                  <v-list-item-subtitle>
                                    <strong>Descuento:</strong>
                                    {{ formatPromotionDiscount(item.raw) }}
                                  </v-list-item-subtitle>
                                </v-list-item>
                              </template>
                            </v-autocomplete>
                          </div>

                          <!-- Mostrar chip de promoción cuando está aplicada -->
                          <div
                            v-else-if="ticket.promotion_id"
                            class="d-flex align-center"
                            style="gap: 8px"
                          >
                            <v-chip
                              variant="outlined"
                              color="primary"
                              :prepend-icon="getPromotionDiscountIcon(ticket)"
                            >
                              {{ ticket.namePromotion }} ({{ formatPromotionDiscount(ticket) }})
                            </v-chip>
                            <v-btn
                              @click="removePromotion(ticket)"
                              variant="flat"
                              color="error"
                              icon="mdi-tag"
                              size="small"
                            ></v-btn>
                          </div>

                          <!-- Mostrar botón para agregar promoción cuando no hay -->
                          <v-btn
                            v-else
                            @click="showPromotionSelect(ticket)"
                            variant="flat"
                            color="primary"
                            icon="mdi-tag"
                            size="small"
                            elevation="1"
                            :disabled="ticket.cant === 0"
                          ></v-btn>
                        </v-col>
                      </v-row>
                      <v-divider class="my-2"></v-divider>
                    </div>
                  </div>
                  <div v-else class="text-center py-8">
                    <v-icon size="large">mdi-ticket-confirmation-outline</v-icon>
                    <p class="text-body-1 mt-2">No hay tipos de pasaje disponibles</p>
                  </div>
                </v-card-text>
              </v-card>
              <!-- Total a pagar 
                            <v-card class="pa-4">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-text-field v-model="editedItem.total" label="Total a pagar" type="number"
                                            variant="underlined" density="compact" prepend-icon="mdi-cash"
                                            readonly></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card>-->
            </v-col>
            <v-col cols="12" md="3">
              <!-- Mapa de asientos visible -->
              <v-card style="max-width: 100%">
                <v-card-title :color="paleteColors.primary" class="bg-primary">
                  <span class="text-subtitle-2 ml-2">Seleccione los asientos</span>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <!-- Mostrar asientos en filas de 2 -->
                    <v-col cols="12" class="d-flex align-center justify-center">
                      <div
                        class="seat-map-preview"
                        style="display: flex; flex-direction: column"
                      >
                        <div
                          v-for="(row, rowIndex) in seatMap"
                          :key="rowIndex"
                          class="seat-row"
                          style="display: flex; flex-direction: row"
                        >
                          <template v-for="(seat, seatIndex) in row" :key="seatIndex">
                            <div
                              v-if="seat.type"
                              :class="[
                                'seat-container',
                                'ma-1',
                                {
                                  'seat-available': isSeatAvailable(seat),
                                  'seat-selected': selectedSeats.includes(
                                    Number(seat.label)
                                  ),
                                  'seat-reserved': isSeatReserved(seat.label),
                                  'seat-aisle': seat.type === 'aisle',
                                },
                              ]"
                              @click="toggleSeat(seat)"
                            >
                              <!-- Icono de asiento con tamaño aumentado -->
                              <v-icon
                                v-if="seat.type === 'seat'"
                                class="seat-icon"
                                size="30"
                                >mdi-seat</v-icon
                              >

                              <!-- Icono de pasillo con tamaño aumentado -->
                              <v-icon
                                v-if="seat.type === 'aisle'"
                                class="aisle-icon"
                                size="30"
                                >''</v-icon
                              >

                              <!-- Número de asiento más grande -->
                              <span v-if="seat.type === 'seat'" class="seat-number">{{
                                seat.label
                              }}</span>

                              <!-- Indicador de pasillo más grande -->
                              <span
                                v-if="seat.type === 'aisle'"
                                class="aisle-indicator"
                              ></span>
                            </div>
                          </template>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Mensaje de error si se seleccionan demasiados asientos -->
                  <v-alert
                    v-if="selectedSeats.length != editedItem.quantity"
                    type="error"
                    class="mt-3"
                  >
                    Debe Seleccionar {{ editedItem.quantity }} asiento(s).
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="3">
              <!-- Mapa de asientos visible -->
              <v-card style="max-width: 100%">
                <v-card-title :color="paleteColors.primary" class="bg-primary">
                  <span class="text-subtitle-2 ml-2">Pagos de Pasajes</span>
                </v-card-title>
                <v-card-text>
                  <v-col cols="12">
                    <div class="payment-methods-grid">
                      <v-card
                        v-for="method in paymentMethods"
                        :key="method.value"
                        class="payment-method-card"
                        :class="[
                          getCardClass(method),
                          { 'payment-method-disabled': method.disabled },
                        ]"
                        @click="!method.disabled && (editedItem.method = method.value)"
                      >
                        <v-card-text
                          class="d-flex flex-column align-center justify-center payment-method-content pa-2"
                        >
                          <v-icon
                            size="32"
                            :color="getMethodColor(method.value)"
                            class="mb-1"
                          >
                            {{ method.icon }}
                          </v-icon>
                          <div class="payment-method-label text-center">
                            {{ method.text }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editedItem.total"
                      label="Total a pagar"
                      type="number"
                      variant="underlined"
                      density="compact"
                      prepend-icon="mdi-cash"
                      readonly
                    ></v-text-field>
                  </v-col>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="save"
            :disabled="
              !valid ||
              Number(selectedSeats.length) !== Number(editedItem.quantity) ||
              !editedItem.method
            "
            :loading="loading"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar un Ticket</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el ticket seleccionado?</v-card-text
      >
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">
          Cancelar
        </v-btn>
        <v-btn
          :color="paleteColors.error"
          variant="flat"
          @click="deleteItemConfirm"
          :loading="loading"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showTicketDialog" max-width="500" persistent>
    <v-card>
      <v-card-title style="position: relative">
        <!-- Contenedor principal centrado -->
        <div class="d-flex flex-column align-center" style="width: 100%">
          <!-- Logo de la sucursal -->
          <v-avatar v-if="selectedBranch?.image" size="80" class="mb-3">
            <img
              :src="`${this.$axios.defaults.baseURL}images/${selectedBranch.image}`"
              :alt="selectedBranch.name"
              style="object-fit: contain"
            />
          </v-avatar>

          <!-- Información de la sucursal -->
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

        <!-- Botón de impresión -->
        <v-btn
          icon
          @click="printTicket"
          style="position: absolute; right: 16px; top: 16px"
        >
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="ticket-container">
          <!-- Ticket original -->

          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">Fecha: {{ currentTicket.date }}</div>
            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="font-weight-bold mb-1">Recorrido:</div>
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
          <!-- Línea divisoria que ocupa todo el ancho -->
          <div class="dashed-divider my-3"></div>

          <!-- Copia de control -->
          <div class="text-center caption mb-3">
            -Copia de control-
            <div class="text-body-2" v-if="currentTicket?.id">
              Folio N° {{ currentTicket.id }}
            </div>
          </div>

          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">Fecha: {{ currentTicket.date }}</div>
            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="font-weight-bold mb-1">Recorrido:</div>
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
          <!-- Nota de impresión -->
          <v-divider class="my-2"></v-divider>
          <div
            v-if="currentTicket.print > 1"
            class="text-center caption mt-2 uppercase-text"
          >
            (COPIA REIMPRESA POR EL OPERADOR {{ nameUser }})
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showTicketDialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import _ from "lodash";
import { paleteColors } from "@/assets/colors";
import QRCode from "qrcode";
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
    mostrarFila: false,
    permissions: "",
    dialog: false,
    dialogDelete: false,
    branch_id: "",
    seatError: null,
    currentlyEditing: null,
    trips: [],
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
    selectedSeats: [], // Aquí se almacenan los asientos seleccionados
    reservedSeats: [],
    availableSeats: [],
    aviable: "",
    branches: [],
    showSeatsMenu: false,
    showTicketDialog: false,
    headers: [
      { title: "Ruta", key: "tripName" },
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
    currentPage: 1, // Página actual
    itemsPerPage: 6, // Elementos por página
    quantityErrors: {},
    isRecalculatingTickettypes: false,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Venta de Ticket" : "Editar Ticket";
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
            this.editedItem.tickettypes?.reduce((sum, t) => sum + (t.cant || 0), 0) || 0;
          const availableSeats = this.availableSeats.length;

          // Validación 1: Debe haber al menos un pasaje
          if (currentQuantity <= 0) {
            return "Debe haber al menos un pasaje seleccionado.";
          }

          // Validación 2: La suma total no puede superar los asientos disponibles
          if (currentQuantity > availableSeats) {
            return `La cantidad total de pasajes (${currentQuantity}) no puede ser mayor a los asientos disponibles (${availableSeats}).`;
          }

          return true;
        },
      ];
    },
    mergedTicketTypes() {
      const editedTickets = this.editedItem.tickettypes || [];
      const ticketDefinitions = Array.isArray(this.tickettypes)
        ? this.tickettypes
        : Object.values(this.tickettypes || {});
      const result = ticketDefinitions.map((ticket) => {
        const editedTicket = editedTickets.find((t) => t.id === ticket.id) || {};
        const mergedTicket = this.buildTicketTypeRecord(
          ticket,
          editedTicket.cant ?? 0,
          editedTicket
        );

        return {
          ...ticket,
          ...mergedTicket,
          adjustment_label: `${
            mergedTicket.adjustment_type === "recargo" ? "Recargo" : "Descuento"
          } · ${mergedTicket.value_type === "porcentaje" ? "Porcentaje" : "Monto"}`,
          adjustmentTypeLabel: `${
            mergedTicket.adjustmentType === "recargo" ? "Recargo" : "Descuento"
          } · ${mergedTicket.valueType === "porcentaje" ? "Porcentaje" : "Monto"}`,
        };
      });

      console.log("mergedTicketTypes result:", JSON.parse(JSON.stringify(result)));
      return result;
    },
    totalSelected() {
      return (
        this.editedItem.tickettypes?.reduce((sum, t) => sum + (Number(t.cant) || 0), 0) ||
        0
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
    "editedItem.price"() {
      if (this.isRecalculatingTickettypes) {
        return;
      }
      this.recalculateTicketTotals();
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
    hasPermission(requiredPermissions) {
      // Si es un string, lo convertimos a array
      const perms = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Retorna true si al menos uno coincide
      return perms.some((p) => this.permissions.includes(p));
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    getTripInternalNumber(trip) {
      return trip?.internal_number ?? trip?.internalNumber ?? "No asignado";
    },
    getTicketFareSegment(ticket) {
      return ticket?.fareSegment ?? ticket?.fare_segment ?? ticket?.fareSegmentData ?? null;
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
    getTripStopsCollection(trip, key = "routeStops") {
      const value = trip?.[key];
      return Array.isArray(value) ? value.filter(Boolean) : [];
    },
    getTripOriginStop(trip) {
      const stops = this.getTripStopsCollection(trip, "routeStops");
      if (!stops.length) {
        return null;
      }

      return [...stops].sort((a, b) => Number(a.stop_order) - Number(b.stop_order))[0] || null;
    },
    getTripDestinationStop(trip) {
      const stops = this.getTripStopsCollection(trip, "routeStops");
      if (!stops.length) {
        return null;
      }

      const sorted = [...stops].sort((a, b) => Number(a.stop_order) - Number(b.stop_order));
      return sorted[sorted.length - 1] || null;
    },
    getRouteStopLabel(stop) {
      if (!stop) return "";

      return (
        stop.location?.address ||
        stop.locationName ||
        stop.address ||
        stop.name ||
        "Sin nombre"
      );
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
      }

      return segment.originRouteStop || segment.origin_route_stop || segment.originStop || null;
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
        const direct = routeStops.find((stop) => Number(stop.id) === Number(destinationId));
        if (direct) {
          return direct;
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
          (stop) => Number(stop.route_stop_id ?? stop.routeStopId ?? stop.routeStop?.id) ===
            Number(routeStopId)
        ) || null
      );
    },
    getTripFareSegments(trip = this.selectedTripRecord) {
      return Array.isArray(trip?.fareSegments) ? trip.fareSegments.filter(Boolean) : [];
    },
    formatFareSegmentLabel(segment, trip = this.selectedTripRecord) {
      const range = this.getSegmentRange(segment, trip);
      if (!range) {
        return "Tramo sin datos";
      }

      return `${this.getRouteStopLabel(range.originStop)} → ${this.getRouteStopLabel(
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
      const destinationTripStop = this.getTripStopForRouteStop(trip, range.destinationStop?.id);

      const routeCanBoard = range.originStop?.allows_boarding !== false;
      const routeCanAlight = range.destinationStop?.allows_alighting !== false;
      const tripCanBoard = originTripStop ? originTripStop.can_board !== false : true;
      const tripCanAlight = destinationTripStop ? destinationTripStop.can_alight !== false : true;

      return routeCanBoard && routeCanAlight && tripCanBoard && tripCanAlight;
    },
    getFareSegmentOptions(trip = this.selectedTripRecord) {
      const originStop = this.getTripOriginStop(trip);
      const originOrder = this.getStopOrderFromStop(originStop);
      const started = this.isTripStarted(trip);

      return this.getTripFareSegments(trip)
        .map((segment) => this.normalizeFareSegmentOption(segment, trip))
        .filter((segment) => {
          if (!this.isFareSegmentSelectable(segment, trip)) {
            return false;
          }

          if (segment.origin_order === null || segment.destination_order === null) {
            return false;
          }

          if (segment.origin_order >= segment.destination_order) {
            return false;
          }

          if (originOrder === null) {
            return true;
          }

          if (!started) {
            return Number(segment.origin_order) === Number(originOrder);
          }

          return Number(segment.origin_order) > Number(originOrder);
        })
        .sort((a, b) => Number(a.origin_order) - Number(b.origin_order));
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

      const currentTicketId = this.editedIndex > -1 ? Number(this.editedItem?.id) || null : null;
      const records = [];

      sources.forEach((source) => {
        if (!Array.isArray(source)) {
          return;
        }

        source.filter(Boolean).forEach((ticket) => {
          if (currentTicketId !== null && Number(ticket?.id) === Number(currentTicketId)) {
            return;
          }

          records.push(ticket);
        });
      });

      return records;
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

      const segmentId =
        ticket.fare_segment_id ??
        ticket.fareSegmentId ??
        ticket.fareSegment?.id ??
        ticket.fare_segment?.id ??
        null;

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
    isTicketIntervalOverlapping(ticket, originOrder, destinationOrder, trip = this.selectedTripRecord) {
      const range = this.getTicketSegmentRange(ticket, trip);
      if (!range) {
        return false;
      }

      return (
        Number(range.originOrder) < Number(destinationOrder) &&
        Number(range.destinationOrder) > Number(originOrder)
      );
    },
    getOccupiedSeatsForSelection(trip = this.selectedTripRecord, fareSegment = this.selectedFareSegmentRecord) {
      const baseReserved = this.normalizeSeatNumbers(
        trip?.reservedSeats || trip?.occupiedSeats || trip?.reserved_seats || []
      );

      const range = fareSegment
        ? this.getSegmentRange(fareSegment, trip)
        : this.getTripFullRange(trip);

      if (!range) {
        return [...new Set(baseReserved)];
      }

      const occupied = new Set(baseReserved);
      const occupancyRecords = this.getTripOccupancyRecords(trip);

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

        this.normalizeSeatNumbers(ticket?.seats || ticket?.seatMap || ticket?.selectedSeats).forEach(
          (seat) => occupied.add(seat)
        );
      });

      return [...occupied];
    },
    formatNumber(value) {
      // Verificar si el valor es 0, null, undefined o no es un número
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

      // Convierte el valor a cadena con formato de número local (en-US)
      let formattedValue = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return formattedValue;
    },
    getSelectedTripBasePrice() {
      const selectedFareSegment = this.selectedFareSegmentRecord;
      if (selectedFareSegment) {
        return Number(selectedFareSegment.base_price) || 0;
      }

      const selectedTrip = this.selectedTripRecord;

      return (
        Number(this.editedItem.price) ||
        Number(selectedTrip?.price) ||
        Number(selectedTrip?.raw?.price) ||
        0
      );
    },
    getTicketTypeAdjustment(ticket, basePrice = this.getSelectedTripBasePrice()) {
      const normalizedBasePrice = Number(basePrice) || 0;
      const adjustmentType =
        ticket.adjustment_type ?? ticket.adjustmentType ?? "descuento";
      const valueType = ticket.value_type ?? ticket.valueType ?? "monto";
      const adjustmentValue =
        Number(ticket.adjustment_value ?? ticket.adjustmentValue ?? 0) || 0;
      const adjustmentAmount =
        valueType === "porcentaje"
          ? (normalizedBasePrice * adjustmentValue) / 100
          : adjustmentValue;
      const signedAdjustment =
        adjustmentType === "recargo" ? adjustmentAmount : -adjustmentAmount;
      const unitPrice = normalizedBasePrice + signedAdjustment;

      return {
        adjustment_type: adjustmentType,
        adjustmentType: adjustmentType,
        value_type: valueType,
        valueType: valueType,
        adjustment_value: adjustmentValue,
        adjustmentValue: adjustmentValue,
        base_price: normalizedBasePrice,
        basePrice: normalizedBasePrice,
        adjustment_amount: adjustmentAmount,
        adjustmentAmount,
        signed_adjustment: signedAdjustment,
        signedAdjustment,
        unit_price: unitPrice,
        unitPrice,
      };
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
      return (Array.isArray(promotions) ? promotions : Object.values(promotions || {})).map(
        (promotion) => ({
          ...promotion,
          discount_type: promotion.discount_type ?? promotion.discountType ?? "monto",
        })
      );
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
      return discountType === "porcentaje" ? `${formattedValue}%` : `${formattedValue} CLP`;
    },
    getTicketTypePayableAmount(ticket) {
      const cant = Math.max(0, Number(ticket?.cant) || 0);
      if (!cant) {
        return 0;
      }

      const definition = this.getTicketTypeDefinition(ticket);
      const adjustment = this.getTicketTypeAdjustment(definition);
      const lineTotal = adjustment.unit_price * cant;
      const promotion = ticket?.promotion_id
        ? (this.promotions || []).find(
            (item) => Number(item.id) === Number(ticket.promotion_id)
          )
        : null;
      const promotionDiscount = promotion
        ? this.getPromotionAdjustment(ticket, promotion, adjustment.unit_price)
            .promotionDiscount
        : Number(
            ticket?.promotion_discount ??
              ticket?.promotionDiscount ??
              ticket?.discount ??
              ticket?.promotion_details?.total_discount ??
              ticket?.promotionDetails?.totalDiscount ??
              0
          ) || 0;

      return Math.max(0, lineTotal - promotionDiscount);
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
          // Si no hay datos, asignamos un array vacío
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
      return this.paleteColors.green; // Asiento disponible (verde)
    },
    isSeatAvailable(seat) {
      // Verificar que sea un asiento válido, no reservado y no sea pasillo
      return (
        seat.type === "seat" && seat.label && !this.isSeatReserved(Number(seat.label))
      );
    },
    updateSeats(tripId) {
      this.availableSeats = [];
      this.reservedSeats = [];
      this.aviable = 0;
      this.selectedSeats = [];

      const selectedTrip = this.trips.find((trip) => Number(trip.id) === Number(tripId));
      if (!selectedTrip) {
        this.editedItem.price = 0;
        this.editedItem.fare_segment_id = null;
        return;
      }

      const validFareSegments = this.getFareSegmentOptions(selectedTrip);
      const hasSelectedSegment = validFareSegments.some(
        (segment) => Number(segment.id) === Number(this.editedItem.fare_segment_id)
      );

      if (!hasSelectedSegment) {
        this.editedItem.fare_segment_id = null;
      }

      const selectedFareSegment = hasSelectedSegment ? this.selectedFareSegmentRecord : null;
      this.editedItem.price = Number(
        selectedFareSegment?.base_price ?? selectedTrip.price ?? selectedTrip.raw?.price ?? 0
      );
      this.seats = Number(selectedTrip.seats) || 0;
      this.seatMap = Array.isArray(selectedTrip.seatMap) ? selectedTrip.seatMap : [];
      this.reservedSeats = this.getOccupiedSeatsForSelection(selectedTrip, selectedFareSegment);

      this.availableSeats = this.generateAvailableSeats(this.seatMap, this.reservedSeats);
      this.aviable = this.availableSeats.length;

      if (this.editedIndex > -1 && this.editedItem.seats?.length) {
        this.selectedSeats = this.editedItem.seats.map(Number);
      }

      this.recalculateTicketTotals();
    },
    updateFareSegment(fareSegmentId) {
      this.editedItem.fare_segment_id = fareSegmentId || null;
      const selectedTrip = this.selectedTripRecord;
      if (!selectedTrip) {
        this.editedItem.price = 0;
        return;
      }

      const selectedFareSegment = this.selectedFareSegmentRecord;
      this.editedItem.price = Number(
        selectedFareSegment?.base_price ?? selectedTrip.price ?? selectedTrip.raw?.price ?? 0
      );
      this.selectedSeats = [];
      this.reservedSeats = this.getOccupiedSeatsForSelection(selectedTrip, selectedFareSegment);
      this.availableSeats = this.generateAvailableSeats(this.seatMap, this.reservedSeats);
      this.aviable = this.availableSeats.length;
      this.recalculateTicketTotals();
    },
    generateAvailableSeats(seatMap, reservedSeats) {
      const availableSeats = [];
      const reservedNumbers = reservedSeats.map(Number); // Convertir a números

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
      // Validación adicional de seguridad
      if (!this.isSeatAvailable(seat)) return;

      const seatNumber = Number(seat.label);
      const index = this.selectedSeats.indexOf(seatNumber);

      // Limitar la selección al quantity definido
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

      // Forzar actualización si es necesario
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
    filterTripsForReservation(trips, currentDate, currentTripId = null) {
      const horaActualChile = this.obtenerHoraChile(); // Ej: '14:25'
      const ahoraMinutos = this.timeToMinutes(horaActualChile); // Ej: 865

      return trips.filter((trip) => {
        // ✅ 1. Siempre incluir el viaje que se está editando
        if (currentTripId !== null && trip.id === currentTripId) {
          return true;
        }

        // ❌ 2. Excluir si no tiene fecha o schedule
        if (!trip.date || !trip.schedule) {
          return false;
        }

        // 📅 Comparar fechas: asumimos formato 'YYYY-MM-DD'
        const esHoy = trip.date === currentDate;
        const esFuturo = trip.date > currentDate;

        // ❌ Si es una fecha pasada (menor que hoy), excluir
        if (trip.date < currentDate) {
          return false;
        }

        // ✅ Si es futuro, incluir sin importar la hora
        if (esFuturo) {
          return true;
        }

        // 🕒 Si es HOY, verificar que la hora de salida aún no ha pasado
        if (esHoy) {
          const scheduleMinutos = this.timeToMinutes(trip.schedule);
          // Incluir solo si la hora de salida es >= hora actual
          return scheduleMinutos >= ahoraMinutos;
        }

        // Por defecto, excluir (esto no debería ocurrir si las fechas son válidas)
        return false;
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
      this.editedItem.method = "Efectivo";
      this.editedItem.fare_segment_id = null;
      this.aviable = "";
      this.normal = "";
      this.selectedPromotion = "";
      this.data = {};
      this.seatMap = [];
      this.data.branch_id = Number(this.branch_id);
      this.data.date = this.dateFormattedSearch;
      const formattedDate = this.dateFormattedSearch;
      try {
        const result = await handleRequest({
          endpoint: "get-trip-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.trips = this.filterTripsForReservation(
            result.data.allTrips || [],
            formattedDate,
            null
          );
          this.promotions = this.normalizePromotions(result.data?.promotions || []);
          this.tickettypes = result.data?.tickettypes || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.trips = [];
          this.promotions = [];
          this.tickettypes = [];
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
      this.selectedSeats = [];
      this.editedIndex = -1;
      this.reservedSeats = [];
      this.availableSeats = [];
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
          // Si no hay datos, asignamos un array vacío
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
      // Convertir ambos arrays en cadenas de texto para una comparación profunda
      const originalSeatsString = JSON.stringify(originalSeats);
      const editedSeatsString = JSON.stringify(editedSeats);
      // Comparar las cadenas generadas
      return originalSeatsString !== editedSeatsString;
    },
    async save() {
      this.loading = true;
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
          "tickettypes",
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
          this.areSeatsDifferent(this.editedItem.tickettypes, this.originalItem.seats)
        ) {
          updatedFields.tickettypes = this.editedItem.tickettypes;
        }
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.date = this.editedItem.date ? this.editedItem.date : new Date();
          updatedFields.branch_id = this.branch_id;
          updatedFields.method = this.editedItem.method || "Efectivo";
          updatedFields.price = this.getSelectedTripBasePrice();
          try {
            const result = await handleRequest({
              endpoint: "ticket-web",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              // Aquí llamamos a la función de impresión con los datos del ticket
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
                // Genera el QR después de que el componente se haya renderizado
                await this.$nextTick();
                await this.generateQRCode();
                //this.printTicket(result.data.ticket);
              }
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
              this.valid = true;
              this.editedIndex = -1;
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
            this.valid = true;
            this.editedIndex = -1;
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
          "tickettypes",
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
          this.areSeatsDifferent(this.editedItem.tickettypes, this.originalItem.seats)
        ) {
          updatedFields.tickettypes = this.editedItem.tickettypes;
        }
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          updatedFields.trip_id = this.editedItem.trip_id;
          updatedFields.price = this.getSelectedTripBasePrice();
          try {
            const result = await handleRequest({
              endpoint: "ticket",
              method: "PUT",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
            } else {
              this.editedIndex = -1;
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            this.editedIndex = -1;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
          }
        } else {
          this.editedIndex = -1;
          this.showAlert("success", "No se realizaron cambios.", 3000);
          this.loading = false;
        }
      }
      this.close();
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
          // Si no hay datos, asignamos un array vacío
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
        // Genera el QR después de que el componente se haya renderizado
        await this.$nextTick();
        await this.generateQRCode();
      }
    },
    async printTicket() {
      try {
        const printWindow = window.open("", "_blank");

        // Generar ambos códigos QR
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
                        width: 80px;
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
                            width: 40px !important;
                            height: 40px !important;
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
                <!-- Encabezado con logo e información de sucursal -->
                <div class="header">
                    ${
                      this.selectedBranch?.image
                        ? `
                    <img src="${this.$axios.defaults.baseURL}images/${this.selectedBranch.image}" 
                        class="branch-logo" 
                        alt="${this.selectedBranch.name}">
                    `
                        : ""
                    }
                    
                    <div class="branch-name">${
                      this.selectedBranch?.name || "Nombre Sucursal"
                    }</div>
                    
                    ${
                      this.selectedBranch?.rut
                        ? `
                    <div class="branch-info">RUT: ${this.selectedBranch.rut}</div>
                    `
                        : ""
                    }
                    
                    ${
                      this.selectedBranch?.address
                        ? `
                    <div class="branch-info">Dirección: ${this.selectedBranch.address}</div>
                    `
                        : ""
                    }
                    
                    ${
                      this.selectedBranch?.phone
                        ? `
                    <div class="branch-info">Teléfono: ${this.selectedBranch.phone}</div>
                    `
                        : ""
                    }
                    
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <!-- Ticket original -->
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${
                      this.currentTicket.date
                    }</div>
                    <div class="font-weight-medium">Hora: ${
                      this.currentTicket.schedule || "--:--"
                    }</div>
                </div>
                
                <div class="mb-3">
                    <div class="font-weight-bold mb-1">Recorrido:</div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${
                      this.currentTicket.tripDestination || "No especificado"
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
                
                ${
                  qrImageOriginal
                    ? `
                    <div class="text-center">
                    <img src="${qrImageOriginal}" style="width: 150px; height: 150px;">
                    </div>
                `
                    : ""
                }
                
                <br>
                
                <!-- Línea divisoria -->
                <div class="dashed-divider"></div>
                
                <!-- Copia de control -->
                <div class="text-center caption control-copy-title">
                    -Copia de control-
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${
                      this.currentTicket.date
                    }</div>
                    <div class="font-weight-medium">Hora: ${
                      this.currentTicket.schedule || "--:--"
                    }</div>
                </div>
                
                <div class="mb-3">
                    <div class="font-weight-bold mb-1">Recorrido:</div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${
                      this.currentTicket.tripDestination || "No especificado"
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
                
                ${
                  qrImageControl
                    ? `
                    <div class="text-center">
                    <img src="${qrImageControl}" style="width: 150px; height: 150px;">
                    </div>
                `
                    : ""
                }
                
                <br>
                
                <!-- Nota de impresión -->
                
                
                ${
                  this.currentTicket.print >= 1
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
      //this.originalItem = Object.assign({}, item);
      //this.editedItem = Object.assign({}, item);
      this.originalItem = _.cloneDeep(item);
      this.editedItem = _.cloneDeep(item);
      this.editedItem.fare_segment_id = item.fare_segment_id ?? item.fareSegmentId ?? null;
      this.selectedSeats = item.seats;
      this.data = {};
      this.data.branch_id = this.branch_id;
      this.data.ticket_id = item.id;

      // Inicializar las variables de promoción
      this.selectedPromotion = null;

      const formattedDate = this.dateFormattedSearch;
      this.data.date = this.dateFormattedSearch;
      try {
        const result = await handleRequest({
          endpoint: "get-trip-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          const currentTripId = item.trip_id; // El viaje al que pertenece este ticket

          this.trips = this.filterTripsForReservation(
            result.data.allTrips || [],
            formattedDate,
            currentTripId
          );
          this.promotions = this.normalizePromotions(result.data?.promotions || []);
          this.tickettypes = result.data?.tickettypes || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.trips = [];
          this.promotions = [];
          this.tickettypes = [];
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.updateSeats(item.trip_id);
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

        // Manejo de la respuesta según el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
          this.loading = false;
        }
      } catch (error) {
        // Este bloque captura errores inesperados fuera del manejo estándar
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
    getTicketTypeDefinitions(collection = this.tickettypes) {
      const source =
        collection && typeof collection === "object" && !Array.isArray(collection)
          ? Array.isArray(collection.tickettypes)
            ? collection.tickettypes
            : Object.values(collection)
          : collection;

      if (Array.isArray(source)) {
        return source.filter((item) => item && typeof item === "object");
      }

      return [];
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
            item && typeof item === "object" && item.id !== undefined && item.id !== null
        );
      }

      return [];
    },
    getCurrentQuantity(ticketId) {
      const ticket = this.normalizeEditedTickettypes().find(
        (item) => Number(item.id) === Number(ticketId)
      );
      return ticket ? Number(ticket.cant) || 0 : 0;
    },
    getMaxQuantity(ticket) {
      return (
        this.availableSeats.length -
        (this.totalSelected - this.getCurrentQuantity(ticket.id))
      );
    },
    getTicketTypeDefinition(ticketOrId) {
      const ticketId = typeof ticketOrId === "object" ? ticketOrId?.id : ticketOrId;
      const currentTicket =
        typeof ticketOrId === "object" && ticketOrId ? ticketOrId : {};
      const sourceTicket =
        this.getTicketTypeDefinitions().find(
          (ticket) => Number(ticket.id) === Number(ticketId)
        ) || {};

      return {
        ...sourceTicket,
        ...currentTicket,
        id: ticketId ?? sourceTicket.id ?? currentTicket.id,
      };
    },
    getTicketTypeAdjustment(ticket) {
      const basePrice = Number(this.editedItem.price) || 0;
      const adjustmentType =
        ticket.adjustment_type ?? ticket.adjustmentType ?? "descuento";
      const valueType = ticket.value_type ?? ticket.valueType ?? "monto";
      const adjustmentValue =
        Number(ticket.adjustment_value ?? ticket.adjustmentValue ?? 0) || 0;
      const adjustmentAmount =
        valueType === "porcentaje"
          ? (basePrice * adjustmentValue) / 100
          : adjustmentValue;
      const signedAdjustment =
        adjustmentType === "recargo" ? adjustmentAmount : -adjustmentAmount;
      const unitPrice = basePrice + signedAdjustment;

      return {
        adjustment_type: adjustmentType,
        adjustmentType,
        value_type: valueType,
        valueType,
        adjustment_value: adjustmentValue,
        adjustmentValue,
        base_price: basePrice,
        basePrice,
        adjustment_amount: adjustmentAmount,
        adjustmentAmount,
        signed_adjustment: signedAdjustment,
        signedAdjustment,
        unit_price: unitPrice,
        unitPrice,
      };
    },
    buildTicketTypeRecord(ticketOrId, quantity, existing = {}) {
      const definition = this.getTicketTypeDefinition(ticketOrId);
      const adjustment = this.getTicketTypeAdjustment(definition);
      const cant = Math.max(0, Number(quantity) || 0);
      const lineSubtotal = adjustment.base_price * cant;
      const lineTotal = adjustment.unit_price * cant;
      const adjustmentTotal = adjustment.signed_adjustment * cant;
      const tariffDetails = {
        adjustment_type: adjustment.adjustment_type,
        adjustmentType: adjustment.adjustmentType,
        value_type: adjustment.value_type,
        valueType: adjustment.valueType,
        adjustment_value: adjustment.adjustment_value,
        adjustmentValue: adjustment.adjustmentValue,
        base_price: adjustment.base_price,
        basePrice: adjustment.basePrice,
        adjustment_amount: adjustment.adjustment_amount,
        adjustmentAmount: adjustment.adjustmentAmount,
        signed_adjustment: adjustment.signed_adjustment,
        signedAdjustment: adjustment.signedAdjustment,
        unit_price: adjustment.unit_price,
        unitPrice: adjustment.unitPrice,
        line_subtotal: lineSubtotal,
        lineSubtotal,
        adjustment_total: adjustmentTotal,
        adjustmentTotal,
        line_total: lineTotal,
        lineTotal,
      };

      const record = {
        ...existing,
        id: definition.id,
        name: definition.name,
        description: definition.description ?? existing.description ?? "",
        cant,
        adjustment_details: tariffDetails,
        adjustmentDetails: tariffDetails,
        adjustment_type: adjustment.adjustment_type,
        adjustmentType: adjustment.adjustmentType,
        value_type: adjustment.value_type,
        valueType: adjustment.valueType,
        adjustment_value: adjustment.adjustment_value,
        adjustmentValue: adjustment.adjustmentValue,
        base_price: adjustment.base_price,
        basePrice: adjustment.basePrice,
        adjustment_amount: adjustment.adjustment_amount,
        adjustmentAmount: adjustment.adjustmentAmount,
        signed_adjustment: adjustment.signed_adjustment,
        signedAdjustment: adjustment.signedAdjustment,
        unit_price: adjustment.unit_price,
        unitPrice: adjustment.unitPrice,
        line_subtotal: lineSubtotal,
        lineSubtotal,
        adjustment_total: adjustmentTotal,
        adjustmentTotal,
        line_total: lineTotal,
        lineTotal,
        promotion_id: existing.promotion_id ?? null,
        namePromotion: existing.namePromotion ?? "",
        percentage: existing.percentage ?? 0,
        discount: Number(existing.discount) || 0,
        showPromotionSelect: existing.showPromotionSelect ?? false,
        selectedPromotion: existing.selectedPromotion ?? null,
      };

      if (record.promotion_id) {
        const promotion = (this.promotions || []).find(
          (item) => Number(item.id) === Number(record.promotion_id)
        );
        if (promotion) {
          return this.attachPromotionDetails(record, promotion);
        }

        record.promotion_id = null;
        record.namePromotion = "";
        record.percentage = 0;
        record.discount = 0;
      }

      return record;
    },
    attachPromotionDetails(ticketRecord, promotion) {
      const promoData = this.getPromotionAdjustment(ticketRecord, promotion);
      const discountType = this.getPromotionDiscountType(promotion);
      return {
        ...ticketRecord,
        promotion_id: promotion.id,
        namePromotion: promotion.name,
        percentage: promotion.percentage,
        discount_type: discountType,
        discountType,
        discount: promoData.promotionDiscount,
        promotion_base_price: promoData.promotion_base_price,
        promotionBasePrice: promoData.promotionBasePrice,
        promotion_unit_discount: promoData.promotion_unit_discount,
        promotionUnitDiscount: promoData.promotionUnitDiscount,
        promotion_discount: promoData.promotion_discount,
        promotionDiscount: promoData.promotionDiscount,
        promotion_discount_type: discountType,
        promotionDiscountType: discountType,
        promotion_details: {
          promotion_id: promotion.id,
          promotion_name: promotion.name,
          percentage: promotion.percentage,
          discount_type: discountType,
          base_price: promoData.promotion_base_price,
          unit_discount: promoData.promotion_unit_discount,
          total_discount: promoData.promotionDiscount,
        },
        promotionDetails: {
          promotionId: promotion.id,
          promotionName: promotion.name,
          percentage: promotion.percentage,
          discountType,
          basePrice: promoData.promotion_base_price,
          unitDiscount: promoData.promotion_unit_discount,
          totalDiscount: promoData.promotionDiscount,
        },
      };
    },
    normalizeTickettypes(tickettypes = this.editedItem.tickettypes || []) {
      return this.normalizeEditedTickettypes(tickettypes).map((ticket) =>
        this.buildTicketTypeRecord(ticket, Number(ticket?.cant) || 0, ticket)
      );
    },
    recalculateTicketTotals() {
      const normalizedTickettypes = this.normalizeTickettypes();
      const quantity = normalizedTickettypes.reduce(
        (sum, ticket) => sum + (Number(ticket.cant) || 0),
        0
      );
      const total = normalizedTickettypes.reduce((sum, ticket) => {
        const cant = Number(ticket.cant) || 0;
        const details = ticket.adjustment_details ?? ticket.adjustmentDetails ?? {};
        const lineTotal =
          Number(
            details.line_total ??
              details.lineTotal ??
              ticket.line_total ??
              ticket.lineTotal ??
              0
          ) || 0;
        const discount =
          Number(
            ticket.discount ??
              details.promotion_discount ??
              details.promotionDiscount ??
              0
          ) || 0;
        return sum + lineTotal - discount;
      }, 0);

      this.isRecalculatingTickettypes = true;
      this.editedItem.tickettypes = normalizedTickettypes;
      this.editedItem.quantity = quantity;
      this.editedItem.total = total;
      this.$nextTick(() => {
        this.isRecalculatingTickettypes = false;
      });
    },
    validateQuantity(ticket) {
      this.quantityErrors = {
        ...this.quantityErrors,
        [ticket.id]: null,
      };

      const currentQty = this.getCurrentQuantity(ticket.id);
      const requestedQty = Math.max(0, Number(ticket.cant) || 0);
      const maxAllowed = Math.max(
        0,
        this.availableSeats.length - (this.totalSelected - currentQty)
      );

      if (requestedQty > maxAllowed) {
        ticket.cant = maxAllowed;
        this.quantityErrors = {
          ...this.quantityErrors,
          [ticket.id]: `Máximo disponible: ${maxAllowed}`,
        };
      }

      this.handleQuantityChange(ticket, ticket.cant);
    },
    handleQuantityChange(ticket, newValue) {
      const numericValue = Math.max(0, Number(newValue) || 0);
      const currentQty = this.getCurrentQuantity(ticket.id);
      const maxAllowed = Math.max(
        0,
        this.availableSeats.length - (this.totalSelected - currentQty)
      );

      if (numericValue > maxAllowed) {
        this.seatError = `Excede la capacidad. Máximo: ${this.availableSeats.length} asientos`;
        this.quantityErrors = {
          ...this.quantityErrors,
          [ticket.id]: `Máximo disponible: ${maxAllowed}`,
        };
        return;
      }

      this.seatError = null;
      const updatedTickets = [...this.normalizeEditedTickettypes()];
      const existingIndex = updatedTickets.findIndex(
        (item) => Number(item.id) === Number(ticket.id)
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

      this.currentlyEditing = ticket.id;
      this.quantityErrors = {
        ...this.quantityErrors,
        [ticket.id]: null,
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
        if (Number(item.id) !== Number(ticket.id)) {
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
        (item) => Number(item.id) === Number(ticket.id)
      );

      if (existingIndex !== -1) {
        updatedTickets[existingIndex] = {
          ...updatedTickets[existingIndex],
          showPromotionSelect: true,
          selectedPromotion: null,
        };
      } else {
        updatedTickets.push(
          this.buildTicketTypeRecord(ticket.id, Number(ticket.cant) || 0, {
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
        (item) => Number(item.id) === Number(ticket.id)
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
        if (Number(item.id) !== Number(ticket.id)) {
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
.payment-method-card {
  border: 3px solid #e0e0e0 !important;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent !important;
  width: clamp(78px, 22vw, 90px);
  min-width: 78px;
  height: clamp(84px, 24vw, 96px);
  min-height: 84px;
  overflow: hidden;
  flex: 0 1 auto;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

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

/* Tamaño moderado para iconos */
.seat-icon,
.aisle-icon {
  font-size: 36px !important;
  width: 100%;
  height: 100%;
}

/* Número de asiento mejor posicionado y visible */
.seat-number {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #333; /* Color oscuro para mejor contraste */
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
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
.seat-available {
  color: #4caf50; /* Verde para disponibles */
}

.seat-selected {
  color: #2196f3; /* Azul para seleccionados */
}

.seat-reserved {
  color: #f44336; /* Rojo para reservados */
  cursor: not-allowed;
}

.seat-aisle {
  color: #9e9e9e; /* Gris para pasillos */
  cursor: default;
}

/* Efecto hover para asientos disponibles */
.seat-available:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

/* Números más oscuros en asientos claros */
.seat-available .seat-number,
.seat-available .aisle-indicator,
.seat-aisle .aisle-indicator {
  color: #333;
}

/* Números claros en asientos oscuros */
.seat-selected .seat-number,
.seat-reserved .seat-number {
  color: #333;
  font-weight: bold;
}
@media (max-width: 768px) {
  .payment-methods-grid {
    gap: 6px;
    justify-content: space-between;
  }

  .payment-method-card {
    width: clamp(74px, 28vw, 84px);
    min-width: 74px;
    height: clamp(80px, 30vw, 90px);
    min-height: 80px;
  }

  .payment-method-label {
    font-size: 0.68rem;
  }

  .ticket-total-preview {
    font-size: 0.72rem;
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

  /* Ajuste fino para móviles */
  .seat-number {
    top: 28%; /* Puedes ajustar este valor según necesidad */
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
  /* Mantenemos solo el efecto cóncavo en el ícono 
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
/* Máxima especificidad para ocultar el thead */
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
</style>



