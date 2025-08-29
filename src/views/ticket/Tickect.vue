<template>
    <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
        :multi-line="true" vertical v-model="snackbar">
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
     <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
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

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Vender ticket
    </v-btn>
  </v-card>
    <!--<v-container style="min-width: 100%; min-height: 100%;">
        <v-card elevation="6" class="mx-2">
              <v-card-text>
                <v-row>
                        <v-cols cols="12" md="12">
                            <v-row v-if="mostrarFila" dense>
                                <v-col cols="12" md="3">
                                    <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id"
                                        v-if="mostrarFila" :items="branches" label="Seleccione una Sucursal"
                                        prepend-inner-icon="mdi-store" item-title="name" item-value="id"
                                        variant="underlined" :rules="selectRules" density="compact">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props"
                                                :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable">
                                        <v-icon>mdi-magnify</v-icon></v-btn>
                                </v-col>
                            </v-row>
                        </v-cols>
                    <v-col cols="12">
                        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar"
                            single-line hide-details>
                        </v-text-field>

                        <v-data-table :headers="headers" :search="search" :items="tickets" class="elevation-1"
                            style="max-height: 65vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
                            no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
                            <template v-slot:item.actions="{ item }">
                                <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)"
                                    :color="paleteColors.primary" variant="tonal" elevation="1"
                                    title="Editar Ticket"></v-btn>
                                <v-btn density="comfortable" icon="mdi-printer" @click="printerItem(item)"
                                    :color="paleteColors.green" variant="tonal" elevation="1"
                                    title="Reimprimir Ticket"></v-btn>
                                <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)"
                                    :color="paleteColors.error" variant="tonal" elevation="1"
                                    title="Eliminar Ticket"></v-btn>
                            </template>
                            <template v-slot:item.tripOrigin="{ item }">
                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                                    <v-img :src="`${this.$axios.defaults.baseURL}images/${item.originImage
                                        }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
                                {{ item.tripOrigin }}
                            </template>
                            <template v-slot:item.tripDestination="{ item }">
                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                                    <v-img :src="`${this.$axios.defaults.baseURL}images/${item.destinationImage
                                        }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
                                {{ item.tripDestination }}
                            </template>
                            <template v-slot:item.price="{ item }">
                                {{ formatNumber(Number(item.price))}}
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-container>-->
    <v-container style="min-width: 100%;">
   <v-card flat>
  <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
  <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
    <!-- Título -->
    <div class="text-subtitle-1 font-weight-bold">Listado deTickets Vendidos</div>

    <!-- Spacer (solo visible en md+) -->
    <v-spacer class="d-none d-md-block"></v-spacer>

    <!-- Grupo: Autocomplete + Botón buscar -->
   <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 400px">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->
          <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id" v-if="mostrarFila"
            :items="branches" label="Seleccione una Sucursal" prepend-inner-icon="mdi-store" item-title="name"
            item-value="id" variant="solo-filled" hide-details single-line flat :rules="selectRules" density="compact">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Botón de búsqueda (actualizar datos) -->
          <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable" :disabled="!branch_id"
            class="mt-2 mt-md-0 mr-5 ml-1">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>

    <!-- Campo de búsqueda global -->
    <div class="flex-grow-1" style="max-width: 300px">
      <v-text-field v-model="search" density="compact" label="Buscar ticket" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" hide-details single-line flat></v-text-field>
    </div>
  </v-card-title>

  <!-- Separador -->
  <v-divider class="my-2"></v-divider>

  <!-- Tabla de viajes con filas personalizadas -->
  <v-data-table :headers="headers" :items="tickets" :search="search" :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." :hide-default-header="true"
        class="elevation-1" style="max-height: 68vh; overflow-y: auto; background: transparent">
        <template v-slot:top>
  <!-- Tarjeta de encabezado con alto fijo -->
  <v-card
    flat
    color="blue-grey-lighten-5"
    class="mb-2 mx-1 rounded-lg"
    elevation="1"
    style="border: 1px solid #ECEFF1; height: 40px; min-height: 40px; display: flex; align-items: center"
  >
    <v-card-text
      class="d-flex pa-2"
      style="width: 100%; min-width: 0; height: 100%; padding: 0 16px !important; display: flex; align-items: center"
    >
              <!-- Negocio (20%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Ruta
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 20%; min-width: 0" class="text-left font-weight-bold">
                Origen
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 20%; min-width: 0" class="text-left font-weight-bold">
                Destino
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 7%; min-width: 0" class="text-left font-weight-bold">
                Fecha
              </div>

              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Horario
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Método
              </div>

              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Pasajes
              </div>

              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Asientos
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Precio
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Total
              </div>



              <!-- Acciones (25%) -->
              <div style="width: 10%; min-width: 0" class="d-flex justify-left font-weight-bold">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
    <!-- Fila personalizada -->
    <template v-slot:item="slotProps">
      <tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">

              <div style="width: 10%; min-width: 0" class="text-truncate">
                <span>{{ slotProps.item.tripName }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Ruta: {{ slotProps.item.tripName }}
                  </span>
                </v-tooltip>
              </div>
              
              <div class="d-flex align-center" style="width: 20%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.originImage}?t=${getCacheTimestamp()}`" class="icono-concavo" cover></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.tripOrigin }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Origen: {{ slotProps.item.tripOrigin }}
                  </span>
                </v-tooltip>
              </div>

              <div class="d-flex align-center" style="width: 20%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.destinationImage}?t=${getCacheTimestamp()}`" class="icono-concavo" cover></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.tripDestination }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Destino: {{ slotProps.item.tripDestination }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 7%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.date }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Fecha: {{ slotProps.item.date }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 5%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.schedule }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Horario: {{ slotProps.item.schedule }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.method }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Método: {{ slotProps.item.method }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 5%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.quantity }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Passajes: {{ slotProps.item.quantity }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 5%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.seats }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Asientos: {{ slotProps.item.seats }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ formatNumber(Number(slotProps.item.price)) }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Precio: {{ formatNumber(Number(slotProps.item.price)) }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ formatNumber(Number(slotProps.item.total)) }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Total: {{ formatNumber(Number(slotProps.item.total)) }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Acciones -->
              <div class="d-flex gap-1" style="width: 10%; justify-content: flex-end; flex-wrap: nowrap">
                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                  title="Editar Ticket">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>

                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.green" @click="printerItem(slotProps.item)" class="flex-shrink-0 mr-1"
                  title="Reimprimir Ticket">
                  <v-icon size="20">mdi-printer</v-icon>
                </v-btn>

                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                  title="Eliminar Ticket">
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
            <v-card style="height: 100vh;">
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
                        label="Selecciona la ruta"
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
                                    <v-icon small color="red darken-4" class="mr-2">mdi mdi-circle-medium</v-icon>
                                    <span><strong>Salida:{{ item.raw.schedule }}</strong> </span>
                                    </div>
                                    <div class="d-flex align-center mb-1">
                                    <v-icon small color="teal darken-1" class="mr-2">mdi-triangle-small-down</v-icon>
                                    <span>Llegada: {{ item.raw.arrival }}</span>
                                    </div>
                                
                                </v-col>
                                <!-- Origen -->
                            

                                <v-col cols="12" md="5" class="d-flex align-start">

                        <div class="ml-3 text-truncate" >
                        <div class="d-flex align-center mb-1" >
                        <strong> {{ item.raw.origin }}</strong>
                        
                        </div>
                        
                        <div class="d-flex align-center  mb-1">
                        
                            {{ item.raw.destination }}
                        </div>
                        
                        </div>
                        </v-col>

                        <v-col cols="12" md="1" class="d-flex align-start">

                        <div class="ml-3 text-truncate" >
                        <div class="d-flex align-center mb-1" >
                        <strong> Vehículo</strong>
                        
                        </div>
                        
                        <div class="d-flex align-center  mb-1">
                        
                            {{ item.raw.plate }}
                        </div>
                        
                        </div>
                        </v-col>

                        <v-col cols="12" md="2" class="d-flex align-start">

                        <div class="ml-3 text-truncate" >
                        
                        <h3 class="mt-3 text-green"> {{ formatNumber(Number(item.raw.price)) }} CLP</h3>
                        
                        
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
                            <v-select v-model="editedItem.method" :items="paymentMethods" label="Método de pago"
                                item-value="value" item-title="text" variant="underlined" density="compact"
                                :rules="[(v) => !!v || 'Seleccione un método de pago']" prepend-icon="mdi-cash">
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props">
                                        <template v-slot:prepend>
                                            <v-icon :icon="item.raw.icon"></v-icon> <!-- Ícono de la opción -->
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>

                        <!-- Fecha -->
                        <v-col cols="12" md="2" v-if="false">
                            <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="190px" disabled="true">
                                <template v-slot:activator="{ props }">
                                    <v-text-field v-bind="props" :modelValue="dateFormatted" variant="underlined"
                                        prepend-icon="mdi-calendar" label="Fecha" density="compact"></v-text-field>
                                </template>
                                <v-locale-provider locale="es">
                                    <v-date-picker header="Calendario" title="Seleccione la fecha"
                                        :color="paleteColors.primary" :modelValue="input"
                                        @update:model-value="updateDate" format="yyyy-MM-dd"
                                        :min="new Date().toISOString().split('T')[0]"></v-date-picker>
                                </v-locale-provider>
                            </v-menu>
                        </v-col>

                        <!-- Precio del pasaje -->
                        <v-col cols="12" md="2" v-if="false">
                            <v-text-field v-model="editedItem.price" label="Precio del pasaje" type="number"
                                variant="underlined" density="compact" prepend-icon="mdi-cash"
                                :rules="[(v) => v > 0 || 'Debe ser un precio válido']"
                                placeholder="Ingrese el precio del pasaje" min="0" step="0.01" readonly></v-text-field>
                        </v-col>

                        <!-- Cantidad de pasajes -->
                        <v-col cols="12" md="2" v-if="false">
                            <v-text-field v-model="editedItem.quantity" label="Cantidad de pasajes" type="number"
                                variant="underlined" density="compact" prepend-icon="mdi-ticket"
                                placeholder="Ingrese la cantidad" min="1" @update:model-value="calculateTotal"
                                :rules="quantityAndPassengerRules" :disabled="!editedItem.trip_id || !aviable"
                                :hint="!editedItem.quantity ? `Asientos disponibles: ${aviable}` : ''"
                                persistent-hint></v-text-field>
                        </v-col>

                        <!-- Selección de asientos -->
                        <v-col cols="12" md="2" v-if="false">
                                        <v-text-field :value="selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Seleccionar Asientos'"
                                            color="primary" dark readonly style="text-transform: none"
                                            :disabled="editedItem.quantity <= 0" prepend-icon="mdi-seat" density="compact"
                                            variant="underlined" :rules="[v => selectedSeats.length > 0 || 'Debe seleccionar al menos un asiento']"></v-text-field>
                                    
                        </v-col>
                    </v-row>
                    <!-- Pasajeros adultos y menores -->
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card>
                            <v-card-title class="bg-primary"><span class="text-subtitle-2 ml-2">Tipos de Pasaje</span></v-card-title>
                            <v-card-text class="bg-white pt-4" style="min-height: 44vh; overflow-y: auto;">
                                <div v-if="mergedTicketTypes.length > 0">
                                    <div v-for="ticket in mergedTicketTypes" :key="ticket.id" class="mb-2">
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
                                                    :error-messages="(currentlyEditing === ticket.id && seatError) || quantityErrors[ticket.id]"
                                                    hide-details="auto"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6" class="d-flex align-center">
                                                <!-- Mostrar autocomplete cuando se está agregando promoción -->
                                                <div v-if="ticket.showPromotionSelect" class="flex-grow-1">
                                                    <v-autocomplete 
                                                        v-model="ticket.selectedPromotion"
                                                        :items="promotions"
                                                        label="Seleccionar promoción"
                                                        item-title="name"
                                                        item-value="id"
                                                        variant="underlined"
                                                        density="compact"
                                                        :no-data-text="'No hay promociones disponibles'"
                                                        @update:model-value="(val) => applyPromotion(ticket, val)"
                                                        @blur="ticket.showPromotionSelect = false"
                                                        autofocus
                                                    >
                                                        <template v-slot:item="{ props, item }">
                                                            <v-list-item v-bind="props">
                                                                <v-list-item-subtitle>
                                                                    <strong>Descuento:</strong> {{ item.raw.percentage }}%
                                                                </v-list-item-subtitle>
                                                            </v-list-item>
                                                        </template>
                                                    </v-autocomplete>
                                                </div>
                                                
                                                <!-- Mostrar chip de promoción cuando está aplicada -->
                                                <div v-else-if="ticket.promotion_id" class="d-flex align-center" style="gap: 8px;">
                                                    <v-chip variant="outlined" color="primary" prepend-icon="mdi-tag">
                                                        {{ ticket.namePromotion }} ({{ ticket.percentage }}%)
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
                            <v-card style="max-width: 100%;">
                                <v-card-title :color="paleteColors.primary" class="bg-primary">
                                    <span class="text-subtitle-2 ml-2">Seleccione los asientos</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-row>
                                        <!-- Mostrar asientos en filas de 2 -->
                                        <v-col cols="12" class="d-flex align-center justify-center">
                                            <div class="seat-map-preview"
                                                style="display: flex; flex-direction: column;">
                                                <div v-for="(row, rowIndex) in seatMap" :key="rowIndex" class="seat-row"
                                                    style="display: flex; flex-direction: row;">
                                                    <template v-for="(seat, seatIndex) in row" :key="seatIndex">
                                                        <div v-if="seat.type" 
                                                            :class="['seat-container', 'ma-1', 
                                                                    {'seat-available': isSeatAvailable(seat),
                                                                    'seat-selected': selectedSeats.includes(Number(seat.label)),
                                                                    'seat-reserved': isSeatReserved(seat.label),
                                                                    'seat-aisle': seat.type === 'aisle'}]" 
                                                            @click="toggleSeat(seat)">
                                                            
                                                            <!-- Icono de asiento con tamaño aumentado -->
                                                            <v-icon v-if="seat.type === 'seat'" class="seat-icon" size="30">mdi-seat</v-icon>
                                                            
                                                            <!-- Icono de pasillo con tamaño aumentado -->
                                                            <v-icon v-if="seat.type === 'aisle'" class="aisle-icon" size="30">''</v-icon>
                                                            
                                                            <!-- Número de asiento más grande -->
                                                            <span v-if="seat.type === 'seat'" class="seat-number">{{ seat.label }}</span>
                                                            
                                                            <!-- Indicador de pasillo más grande -->
                                                            <span v-if="seat.type === 'aisle'" class="aisle-indicator"></span>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </v-col>
                                    </v-row>

                                    <!-- Mensaje de error si se seleccionan demasiados asientos -->
                                    <v-alert v-if="selectedSeats.length != editedItem.quantity" type="error"
                                        class="mt-3">
                                        Debe Seleccionar {{ editedItem.quantity }} asiento(s).
                                    </v-alert>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="3">
                            <!-- Mapa de asientos visible -->
                            <v-card style="max-width: 100%;">
                                <v-card-title :color="paleteColors.primary" class="bg-primary">
                                    <span class="text-subtitle-2 ml-2">Pagos de Pasajes</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-col cols="12">
                                    <div class="d-flex flex-wrap justify-space-between">
                                        <v-card
                                        v-for="method in paymentMethods"
                                        :key="method.value"
                                        class="payment-method-card mx-1 my-2"
                                        :class="getCardClass(method)"
                                        @click="editedItem.method = method.value"
                                        width="80"
                                        height="80"
                                        >
                                        <v-card-text class="d-flex flex-column align-center justify-center">
                                            <v-icon 
                                            size="45"
                                            :color="getMethodColor(method.value)"
                                            class="mb-"
                                            >
                                            {{ method.icon }}
                                            </v-icon>
                                            <div class="text-subtitle-2">{{ method.text }}</div>
                                        </v-card-text>
                                        </v-card>
                                    </div>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field v-model="editedItem.total" label="Total a pagar" type="number"
                                            variant="underlined" density="compact" prepend-icon="mdi-cash"
                                            readonly></v-text-field>
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
                    <v-btn :color="paleteColors.primary" variant="flat" @click="save"
                        :disabled="!valid || Number(selectedSeats.length) !== Number(editedItem.quantity)  || !editedItem.method"
                        :loading="loading">Aceptar</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
            <v-toolbar :color="paleteColors.error">
                <span class="text-subtitle-2 ml-4"> Eliminar un Ticket</span>
            </v-toolbar>

            <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el ticket seleccionado?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete"> Cancelar </v-btn>
                <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm" :loading="loading">
                    Aceptar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showTicketDialog" max-width="500" persistent>
      <v-card>
        <v-card-title style="position: relative;">
        <!-- Contenedor principal centrado -->
        <div class="d-flex flex-column align-center" style="width: 100%;">
            <!-- Logo de la sucursal -->
            <v-avatar v-if="selectedBranch?.image" size="80" class="mb-3">
            <img 
                :src="`${this.$axios.defaults.baseURL}images/${selectedBranch.image}`" 
                :alt="selectedBranch.name"
                style="object-fit: contain;"
            >
            </v-avatar>
            
            <!-- Información de la sucursal -->
            <div class="text-center">
            <div class="text-subtitle-1 font-weight-bold">{{ selectedBranch?.name || 'Nombre Sucursal' }}</div>
            <div class="text-body-2" v-if="selectedBranch?.rut">RUT: {{ selectedBranch.rut }}</div>
            <div class="text-body-2" v-if="selectedBranch?.address">Dirección: {{ selectedBranch.address }}</div>
            <div class="text-body-2" v-if="selectedBranch?.phone">Teléfono: {{ selectedBranch.phone }}</div>
            <div class="text-body-2" v-if="selectedBranch?.id">Folio N° {{ currentTicket.id }}</div>
            </div>
        </div>
        
        <!-- Botón de impresión -->
        <v-btn 
            icon 
            @click="printTicket"
            style="position: absolute; right: 16px; top: 16px;"
        >
            <v-icon>mdi-printer</v-icon>
        </v-btn>
        </v-card-title>
        
        <v-card-text>
        <div class="ticket-container">
            <!-- Ticket original -->
                       
            <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">Fecha: {{ currentTicket.date }}</div>
            <div class="font-weight-medium">Hora: {{ currentTicket.schedule || '--:--' }}</div>
            </div>
            
            <div class="mb-3">
            <div class="font-weight-bold mb-1">Recorrido:</div>
            <div>
                <span class="font-weight-medium mr-1">Origen:</span>
                <span>{{ currentTicket.tripOrigin || 'No especificado' }}</span>
            </div>
            <div>
                <span class="font-weight-medium mr-1">Destino:</span>
                <span>{{ currentTicket.tripDestination || 'No especificado' }}</span>
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
            <br>
            <div class="text-center">
            <canvas ref="qrCanvasOriginal" style="width: 150px; height: 150px;"></canvas>
            </div>
            <br>
            <!-- Línea divisoria que ocupa todo el ancho -->
            <div class="dashed-divider my-3"></div>
            
            <!-- Copia de control -->
            <div class="text-center caption mb-3">
            -Copia de control-
            <div class="text-body-2" v-if="currentTicket?.id">Folio N° {{ currentTicket.id }}</div>
            </div>
            
            <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">Fecha: {{ currentTicket.date }}</div>
            <div class="font-weight-medium">Hora: {{ currentTicket.schedule || '--:--' }}</div>
            </div>
            
            <div class="mb-3">
            <div class="font-weight-bold mb-1">Recorrido:</div>
            <div>
                <span class="font-weight-medium mr-1">Origen:</span>
                <span>{{ currentTicket.tripOrigin || 'No especificado' }}</span>
            </div>
            <div>
                <span class="font-weight-medium mr-1">Destino:</span>
                <span>{{ currentTicket.tripDestination || 'No especificado' }}</span>
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
            <br>
            <div class="text-center">
            <canvas ref="qrCanvasControl" style="width: 150px; height: 150px;"></canvas>
            </div>
            <br>
            <!-- Nota de impresión -->
            <v-divider class="my-2"></v-divider>
            <div v-if="currentTicket.print > 1" class="text-center caption mt-2 uppercase-text">
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
import _ from 'lodash';
import { paleteColors } from "@/assets/colors";
import QRCode from 'qrcode';
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
        dialog: false,
        dialogDelete: false,
        branch_id: '',
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
        nameBranch: '',
        imageBranch: '',
        nameUser: '',
        selectedBranch: {},
        data: {},
        hasStartedSelecting: false,
        seats: 0, // Ejemplo de asientos disponibles
        selectedSeats: [], // Aquí se almacenan los asientos seleccionados
        reservedSeats: [],
        availableSeats: [],
        aviable: '',
        branches: [],
        showSeatsMenu: false,
        showTicketDialog: false,
        headers: [
            { title: "Ruta", key: "tripName", },
            { title: "Origen", key: "tripOrigin", },
            { title: "Destino", key: "tripDestination", },
            { title: "Fecha", key: "date", },
            { title: "Horario", key: "schedule", },
            { title: "Metodo", key: "method", },
            { title: "Pasajes", key: "quantity", },
            //{ title: "Adultos", key: "adults", },
            //{ title: "Menores", key: "minors", },
            { title: "Asientos", key: "seats", },
            { title: "Precio", key: "price", },
            { title: "Total", key: "total", },
            { title: "Acciones", key: "actions", sortable: false, width: "15%" },
        ],

        editedItem: {
            id: "",
            trip_id: "",
            branch_id: "",
            user_id: "",
            date: "",
            method: "",
            status: "",
            quantity: "",
            price: "",
            total: "",
            adults: "",
            minors: "",
            seats: [],
            promotions: [],
            tickettypes: []
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
            total: "",
            seats: [],
            adults: "",
            minors: "",
            promotions: [],
            tickettypes: []
        },
        defaultItem: {
            id: "",
            trip_id: "",
            branch_id: "",
            user_id: "",
            date: "",
            method: "",
            status: "",
            quantity: "",
            price: "",
            total: "",
            seats: [],
            adults: "",
            minors: "",
            promotions: [],
            tickettypes: []
        },
        paymentMethods: [
            { text: "Efectivo", value: "Efectivo", icon: "mdi-cash" },
            { text: "Crédito", value: "Credito", icon: "mdi-credit-card-outline" },
            { text: "Débito", value: "Debito", icon: "mdi-bank-outline" },
        ],
        editedIndex: -1,
        search: "",
        menu: false,
        menu2: false,
        input: null,
        input2: null,
        tab: null,
        route: '',
        seatMap: [],
        appliedPromotions: [],
        selectedPromotionAdults: null,
        selectedPromotionMinors: null,
        selectedPromotion: null,
        showPromotion: false,
        showPromotionAdults: false,
        showPromotionMinors: false,
        normal: '',
        nameRules: [
            (v) => !!v || "El campo es requerido",
            (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
            (v) => (v && v.length >= 3) || "El campo debe tener al menos de 3 caracteres",
        ],
        selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
        //prueba borrar  
        currentPage: 1, // Página actual
        itemsPerPage: 6, // Elementos por página
        quantityErrors: {}
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
        evenSeats() {
            return this.availableSeats.filter((seat, index) => index % 2 === 0);
        },
        oddSeat() {
            return this.availableSeats.length % 2 !== 0 ? this.availableSeats[this.availableSeats.length - 1] : null;
        },
        quantityAndPassengerRules() {
            return [
                () => {
                    // Calcular la cantidad actual sumando todos los tickets
                    const currentQuantity = this.editedItem.tickettypes?.reduce((sum, t) => sum + (t.cant || 0), 0) || 0;
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
        showPromotionFieldAdults() {
            return this.editedItem.adults > 0 && this.promotions.length > 0;
        },
        showPromotionFieldMinors() {
            return this.editedItem.minors > 0 && this.promotions.length > 0;
        },
        showPromotionField() {
            return this.normal > 0 && this.promotions.length > 0;
        },
        isDisabledNormal() {
            return (Number(this.editedItem.adults) + Number(this.editedItem.minors)) >= Number(this.editedItem.quantity);
        },
        isDisabledAdult() {
            return (Number(this.normal) + Number(this.editedItem.minors)) >= Number(this.editedItem.quantity);
        },
        isDisabledMinor() {
            return (Number(this.normal) + Number(this.editedItem.adults)) >= Number(this.editedItem.quantity);
        },
         mergedTicketTypes() {
            const editedTickets = this.editedItem.tickettypes || [];
            const result = this.tickettypes.map(ticket => {
                const editedTicket = editedTickets.find(t => t.id === ticket.id) || {};
                return {
                ...ticket,
                cant: editedTicket.cant ?? 0,
                promotion_id: editedTicket.promotion_id ?? null,
                namePromotion: editedTicket.namePromotion ?? '',
                percentage: editedTicket.percentage ?? 0,
                discount: editedTicket.discount ?? 0,
                showPromotionSelect: editedTicket.showPromotionSelect ?? false
                };
            });
            
            console.log('mergedTicketTypes result:', JSON.parse(JSON.stringify(result)));
            return result;
        },
        totalSelected() {
        return this.editedItem.tickettypes.reduce((sum, t) => sum + t.cant, 0);
        }
        },
        watch: {
            selectedSeats(newValue) {
                if (typeof newValue === 'string') {
                    this.selectedSeats = JSON.parse(newValue);
                }
            },
            'editedItem.quantity'(newValue) {
                this.editedItem.adults = Math.min(this.editedItem.adults, newValue);
                this.editedItem.minors = Math.min(this.editedItem.minors, newValue);
                this.normal = Math.min(this.normal, newValue);
            },
        },
        mounted() {
            this.role = JSON.parse(LocalStorageService.getItem('role'));
            this.nameUser = JSON.parse(LocalStorageService.getItem('name'));
            if (this.role === 'Administrador') {
                this.showBranches();
            } else {
                this.branch_id = LocalStorageService.getItem('branch_id');
                this.initialize();
            }
        },
        methods: {
        getCacheTimestamp() {
        // Usamos medianoche (00:00:00) del día actual
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
        },
        getMethodColor(methodValue) {
            const colors = {
            'Efectivo': 'green-darken-2',
            'Debito': 'purple-darken-2',
            'Credito': 'blue-darken-2'
            };
            return colors[methodValue] || '';
        },
        getCardClass(method) {
            const baseClass = {
            'payment-method-card': true,
            'cursor-pointer': true
            };
            
            if (this.editedItem.method === method.value) {
            return {
                ...baseClass,
                [`selected-${method.value.toLowerCase()}`]: true,
                'elevation-1': true
            };
            }
            return baseClass;
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
        applyPromotionAdults(promotionId) {
            // Buscar la promoción seleccionada
            const selectedPromotion = this.promotions.find((promo) => promo.id === promotionId);

            if (selectedPromotion) {
                // Calcular el nuevo descuento
                const newDiscountAmount = this.editedItem.adults * [(this.editedItem.price * selectedPromotion.percentage) / 100];

                // Buscar si ya existe un registro de tipo "adults"
                const existingPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "adults"
                );

                if (existingPromotionIndex !== -1) {
                    // Obtener la promoción existente
                    const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                    // Calcular la diferencia entre el descuento anterior y el nuevo
                    const discountDifference = newDiscountAmount - existingPromotion.discountedPrice;

                    // Actualizar TODOS los campos del registro existente
                    this.editedItem.promotions[existingPromotionIndex] = {
                        id: selectedPromotion.id, // Actualizar el ID de la promoción
                        percentage: selectedPromotion.percentage, // Actualizar el porcentaje
                        originalPrice: this.editedItem.price, // Actualizar el precio original
                        discountedPrice: newDiscountAmount, // Actualizar el descuento calculado
                        type: "adults", // Mantener el tipo
                    };

                    // Actualizar el total sumando o restando la diferencia
                    this.editedItem.total -= discountDifference;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción actualizada adults:", selectedPromotion);
                    console.log("Diferencia de descuento adults:", discountDifference);
                    console.log("Total actualizado adults:", this.editedItem.total);
                } else {
                    // Si no existe un registro, agregar uno nuevo
                    this.editedItem.promotions.push({
                        id: selectedPromotion.id,
                        percentage: selectedPromotion.percentage,
                        originalPrice: this.editedItem.price,
                        discountedPrice: newDiscountAmount,
                        type: "adults",
                    });

                    // Actualizar el total restando el nuevo descuento
                    this.editedItem.total -= newDiscountAmount;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción aplicada adults:", selectedPromotion);
                    console.log("Total después del descuento adults:", this.editedItem.total);
                }

                console.log("Promociones aplicadas adults:", this.editedItem.promotions);
            }
        },
        removePromotionAdult() {
            // Buscar la promoción de tipo "normal"
            const existingPromotionIndex = this.editedItem.promotions.findIndex(
                (promo) => promo.type === "adults"
            );

            if (existingPromotionIndex !== -1) {
                // Obtener la promoción existente
                const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                // Sumar el valor del descuento al total
                this.editedItem.total += existingPromotion.discountedPrice;

                // Eliminar la promoción de la lista
                this.editedItem.promotions.splice(existingPromotionIndex, 1);

                // Reiniciar la promoción seleccionada
                this.selectedPromotionAdults = null;
                this.showPromotionAdults = false;

                // Mostrar un mensaje de éxito (opcional)
                console.log("Promoción eliminada:", existingPromotion);
                console.log("Total restaurado:", this.editedItem.total);
            }
        },
        onAdultsChange(newValue) {
            if (newValue == 0) {
                // Buscar y eliminar la promoción de tipo "adults"
                const adultPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "adults"
                );

                if (adultPromotionIndex !== -1) {
                    // Obtener la promoción eliminada
                    const removedPromotion = this.editedItem.promotions[adultPromotionIndex];

                    // Eliminar la promoción del array
                    this.editedItem.promotions.splice(adultPromotionIndex, 1);

                    // Actualizar el total sumando el descuento que se había aplicado
                    this.editedItem.total += removedPromotion.discountedPrice;
                    this.selectedPromotionAdults = null;
                    this.showPromotionAdults = false;
                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción eliminada adults:", removedPromotion);
                    console.log("Total actualizado adults:", this.total);
                    console.log("Promociones aplicadas adults:", this.editedItem.promotions);
                }
            } else {
                if (this.selectedPromotionAdults) {
                    this.applyPromotionAdults(this.selectedPromotionAdults);
                }
            }
        },
        applyPromotionMinors(promotionId) {
            // Buscar la promoción seleccionada
            const selectedPromotion = this.promotions.find((promo) => promo.id === promotionId);

            if (selectedPromotion) {
                // Calcular el nuevo descuento
                const newDiscountAmount = this.editedItem.minors * [(this.editedItem.price * selectedPromotion.percentage) / 100];

                // Buscar si ya existe un registro de tipo "adults"
                const existingPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "minors"
                );

                if (existingPromotionIndex !== -1) {
                    // Obtener la promoción existente
                    const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                    // Calcular la diferencia entre el descuento anterior y el nuevo
                    const discountDifference = newDiscountAmount - existingPromotion.discountedPrice;

                    // Actualizar TODOS los campos del registro existente
                    this.editedItem.promotions[existingPromotionIndex] = {
                        id: selectedPromotion.id, // Actualizar el ID de la promoción
                        percentage: selectedPromotion.percentage, // Actualizar el porcentaje
                        originalPrice: this.editedItem.price, // Actualizar el precio original
                        discountedPrice: newDiscountAmount, // Actualizar el descuento calculado
                        type: "minors", // Mantener el tipo
                    };

                    // Actualizar el total sumando o restando la diferencia
                    this.editedItem.total -= discountDifference;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción actualizada minors:", selectedPromotion);
                    console.log("Diferencia de descuento minors:", discountDifference);
                    console.log("Total actualizado minors:", this.editedItem.total);
                } else {
                    // Si no existe un registro, agregar uno nuevo
                    this.editedItem.promotions.push({
                        id: selectedPromotion.id,
                        percentage: selectedPromotion.percentage,
                        originalPrice: this.editedItem.price,
                        discountedPrice: newDiscountAmount,
                        type: "minors",
                    });

                    // Actualizar el total restando el nuevo descuento
                    this.editedItem.total -= newDiscountAmount;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción aplicada minors:", selectedPromotion);
                    console.log("Total después del descuento minors:", this.editedItem.total);
                }

                console.log("Promociones aplicadas minors:", this.editedItem.promotions);
            }
        },
        removePromotionMinor() {
            // Buscar la promoción de tipo "normal"
            const existingPromotionIndex = this.editedItem.promotions.findIndex(
                (promo) => promo.type === "minors"
            );

            if (existingPromotionIndex !== -1) {
                // Obtener la promoción existente
                const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                // Sumar el valor del descuento al total
                this.editedItem.total += existingPromotion.discountedPrice;

                // Eliminar la promoción de la lista
                this.editedItem.promotions.splice(existingPromotionIndex, 1);

                // Reiniciar la promoción seleccionada
                this.selectedPromotionMinors = null;
                this.showPromotionMinors = false;

                // Mostrar un mensaje de éxito (opcional)
                console.log("Promoción eliminada:", existingPromotion);
                console.log("Total restaurado:", this.editedItem.total);
            }
        },
        onMinorsChange(newValue) {
            if (newValue == 0) {
                // Buscar y eliminar la promoción de tipo "adults"
                const minorPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "minors"
                );

                if (minorPromotionIndex !== -1) {
                    // Obtener la promoción eliminada
                    const removedPromotion = this.editedItem.promotions[minorPromotionIndex];

                    // Eliminar la promoción del array
                    this.editedItem.promotions.splice(minorPromotionIndex, 1);

                    // Actualizar el total sumando el descuento que se había aplicado
                    this.editedItem.total += removedPromotion.discountedPrice;
                    this.selectedPromotionMinors = null;
                    this.showPromotionMinors = false;
                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción eliminada minors:", removedPromotion);
                    console.log("Total actualizado minors:", this.total);
                    console.log("Promociones aplicadas minors:", this.editedItem.promotions);
                }
            } else {
                if (this.selectedPromotionMinors) {
                    this.applyPromotionMinors(this.selectedPromotionMinors);
                }
            }
        },
        applyPromotionNormal(promotionId) {
            // Buscar la promoción seleccionada
            const selectedPromotion = this.promotions.find((promo) => promo.id === promotionId);

            if (selectedPromotion) {
                // Calcular el nuevo descuento
                const newDiscountAmount = this.normal * [(this.editedItem.price * selectedPromotion.percentage) / 100];

                // Buscar si ya existe un registro de tipo "adults"
                const existingPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "normal"
                );

                if (existingPromotionIndex !== -1) {
                    // Obtener la promoción existente
                    const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                    // Calcular la diferencia entre el descuento anterior y el nuevo
                    const discountDifference = newDiscountAmount - existingPromotion.discountedPrice;

                    // Actualizar TODOS los campos del registro existente
                    this.editedItem.promotions[existingPromotionIndex] = {
                        id: selectedPromotion.id, // Actualizar el ID de la promoción
                        percentage: selectedPromotion.percentage, // Actualizar el porcentaje
                        originalPrice: this.editedItem.price, // Actualizar el precio original
                        discountedPrice: newDiscountAmount, // Actualizar el descuento calculado
                        type: "normal", // Mantener el tipo
                    };

                    // Actualizar el total sumando o restando la diferencia
                    this.editedItem.total -= discountDifference;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción actualizada:", selectedPromotion);
                    console.log("Diferencia de descuento:", discountDifference);
                    console.log("Total actualizado:", this.editedItem.total);
                } else {
                    // Si no existe un registro, agregar uno nuevo
                    this.editedItem.promotions.push({
                        id: selectedPromotion.id,
                        percentage: selectedPromotion.percentage,
                        originalPrice: this.editedItem.price,
                        discountedPrice: newDiscountAmount,
                        type: "normal",
                    });

                    // Actualizar el total restando el nuevo descuento
                    this.editedItem.total -= newDiscountAmount;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción aplicada:", selectedPromotion);
                    console.log("Total después del descuento:", this.editedItem.total);
                }

                console.log("Promociones aplicadas:", this.editedItem.promotions);
            }
        },
        removePromotionNormal() {
            // Buscar la promoción de tipo "normal"
            const existingPromotionIndex = this.editedItem.promotions.findIndex(
                (promo) => promo.type === "normal"
            );

            if (existingPromotionIndex !== -1) {
                // Obtener la promoción existente
                const existingPromotion = this.editedItem.promotions[existingPromotionIndex];

                // Sumar el valor del descuento al total
                this.editedItem.total += existingPromotion.discountedPrice;

                // Eliminar la promoción de la lista
                this.editedItem.promotions.splice(existingPromotionIndex, 1);

                // Reiniciar la promoción seleccionada
                this.selectedPromotion = null;
                this.showPromotion = false;

                // Mostrar un mensaje de éxito (opcional)
                console.log("Promoción eliminada:", existingPromotion);
                console.log("Total restaurado:", this.editedItem.total);
            }
        },
        onNormalsChange(newValue) {
            if (newValue == 0) {
                // Buscar y eliminar la promoción de tipo "adults"
                const minorPromotionIndex = this.editedItem.promotions.findIndex(
                    (promo) => promo.type === "normal"
                );

                if (minorPromotionIndex !== -1) {
                    // Obtener la promoción eliminada
                    const removedPromotion = this.editedItem.promotions[minorPromotionIndex];

                    // Eliminar la promoción del array
                    this.editedItem.promotions.splice(minorPromotionIndex, 1);

                    // Actualizar el total sumando el descuento que se había aplicado
                    this.editedItem.total += removedPromotion.discountedPrice;
                    this.selectedPromotion = null;
                    this.showPromotion = false;

                    // Mostrar un mensaje de éxito (opcional)
                    console.log("Promoción eliminada:", removedPromotion);
                    console.log("Promociones aplicadas:", this.editedItem.promotions);
                }
            } else {
                if (this.selectedPromotion) {
                    this.applyPromotionNormal(this.selectedPromotion);
                }
            }
        },
        async showBranches() {
            try {
                const result = await handleRequest({
                    endpoint: 'branch',
                    method: 'GET',
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
                this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
            } finally {
                this.mostrarFila = true;
                this.loading = false;
                this.initialize();
            }
        },
        /*getSeatColor(seat) {
            if (this.isSeatReserved(seat.label)) {
                return this.paleteColors.error; // Asiento reservado
            } else if (this.selectedSeats.includes(Number(seat.label))) {
                return this.paleteColors.primary; // Asiento seleccionado
            } else if (seat.type === 'aisle') {
                return this.paleteColors.gris; // Asiento seleccionado
            }
            else {
                return this.paleteColors.green; // Asiento disponible
            }
        },*/
        getSeatColor(seat) {
            if (!seat.label) return this.paleteColors.gris; // Para elementos sin label
            
            const seatNumber = Number(seat.label);
            
            if (this.isSeatReserved(seatNumber)) {
                return this.paleteColors.error; // Asiento reservado (rojo)
            } 
            if (this.selectedSeats.includes(seatNumber)) {
                return this.paleteColors.primary; // Asiento seleccionado (azul)
            }
            if (seat.type === 'aisle') {
                return this.paleteColors.gris; // Pasillo (gris)
            }
            return this.paleteColors.green; // Asiento disponible (verde)
            },
        /*isSeatAvailable(seat) {
            return seat.label && !this.isSeatReserved(seat.label);
        },*/
        isSeatAvailable(seat) {
        // Verificar que sea un asiento válido, no reservado y no sea pasillo
        return seat.type === 'seat' && 
                seat.label && 
                !this.isSeatReserved(Number(seat.label));
        },
        /*updateSeats(tripId) {
            this.seats = 0;
                this.availableSeats = [];
                this.reservedSeats = [];
                this.aviable = 0;
                //this.editedItem.quantity = '';
            this.selectedSeats = [];
            const selectedTrip = this.trips.find((trip) => trip.id === tripId);

            if (selectedTrip) {
                this.seats = selectedTrip.seats;
                this.editedItem.price = selectedTrip.price;
                this.reservedSeats = selectedTrip.reservedSeats;
                this.seatMap = selectedTrip.seatMap;

                // Generar asientos disponibles y reservados
                this.availableSeats = this.generateAvailableSeats(this.seatMap, this.reservedSeats);
                this.aviable = this.availableSeats.length;
                console.log('this.aviable');
                console.log(this.aviable);

            } else {
                this.seats = 0;
                this.availableSeats = [];
                this.reservedSeats = [];
                this.aviable = 0;
            }
        },*/
        updateSeats(tripId) {
        this.availableSeats = [];
        this.reservedSeats = [];
        this.aviable = 0;
        this.selectedSeats = [];
        
        const selectedTrip = this.trips.find(trip => trip.id === tripId);
        
        if (selectedTrip) {
            this.seats = selectedTrip.seats;
            this.editedItem.price = selectedTrip.price;
            this.reservedSeats = selectedTrip.reservedSeats.map(Number); // Asegurar que sean números
            this.seatMap = selectedTrip.seatMap;
            
            this.availableSeats = this.generateAvailableSeats(this.seatMap, this.reservedSeats);
            this.aviable = this.availableSeats.length;
            
            // Si estamos editando, restaurar los asientos seleccionados
            if (this.editedIndex > -1 && this.editedItem.seats) {
            this.selectedSeats = this.editedItem.seats.map(Number);
            }
        }
        },
        /*generateAvailableSeats(seatMap, reservedSeats) {

            const availableSeats = [];
            seatMap.forEach((row) => {
                row.forEach((seat) => {
                    if (seat.label && !reservedSeats.includes(Number(seat.label))) {
                        availableSeats.push(Number(seat.label));
                    }
                });
            });

            return availableSeats;
        },*/
        /*isSeatReserved(seat) {
            return this.reservedSeats.includes(Number(seat));
        },*/
        generateAvailableSeats(seatMap, reservedSeats) {
        const availableSeats = [];
        const reservedNumbers = reservedSeats.map(Number); // Convertir a números
        
        seatMap.forEach(row => {
            row.forEach(seat => {
            if (seat.type === 'seat' && seat.label) {
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
        /*toggleSeat(seat) {
            if (this.isSeatAvailable(seat)) {
                const seatLabel = Number(seat.label);
                const index = this.selectedSeats.indexOf(seatLabel);
                if (index === -1) {
                    // Si el asiento no está seleccionado, agregarlo
                    this.selectedSeats.push(seatLabel);
                } else {
                    // Si el asiento ya está seleccionado, removerlo
                    this.selectedSeats.splice(index, 1);
                }
                // Forzar la validación del campo después de cambiar selectedSeats
                //this.$refs.seatsField.validate();
            }
        },*/
        toggleSeat(seat) {
        // Validación adicional de seguridad
        if (!this.isSeatAvailable(seat)) return;
        
        const seatNumber = Number(seat.label);
        const index = this.selectedSeats.indexOf(seatNumber);
        
        // Limitar la selección al quantity definido
        if (index === -1) {
            if (this.selectedSeats.length >= this.editedItem.quantity) {
            this.showAlert("warning", `Solo puede seleccionar ${this.editedItem.quantity} asientos`, 2000);
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
             this.editedItem.tickettypes = this.originalItem.tickettypes;
             this.editedItem.total = this.editedItem.price * this.editedItem.quantity;
            /*this.editedItem.adults = 0;
            this.editedItem.minors = 0;
            this.normal = 0;
            this.selectedPromotionAdults= null;
            this.selectedPromotionMinors= null;
            this.selectedPromotion= null;
            this.showPromotion= false;
            this.showPromotionAdults= false;
            this.showPromotionMinors= false;
            //this.editedItem.total = this.editedItem.price * this.editedItem.quantity;
            const price = Number(this.editedItem.price) || 0;
            const quantity = Number(this.editedItem.quantity) || 0;
            const adults = Number(this.editedItem.adults) || 0;
            const minors = Number(this.editedItem.minors) || 0;

            if (adults === 0 && minors === 0) {
                // Si no hay adultos ni menores, calcular el total por cantidad total
                this.editedItem.total = price * quantity;
            } else {
                // Si hay adultos o menores, calcular el total considerando el 50%
                const discountedTickets = adults + minors;
                this.editedItem.total = price * quantity - discountedTickets * (price * 0.5);
            }*/
        },
        /*validateQuantity() {
            const adults = Number(this.editedItem.adults);
            const minors = Number(this.editedItem.minors);
            const normal = Number(this.normal);
            const quantity = Number(this.editedItem.quantity);
            return adults + minors + normal <= quantity;
        },*/
        updateDate(val) {
            this.input = val;
            this.editedItem.date = this.dateFormatted;
            this.menu = false;
        },
        async showAdd() {
            this.aviable = '';
            this.normal = '';
            this.selectedPromotion = '';
            this.data = {};
            this.seatMap = [];
            this.data.branch_id = Number(this.branch_id);
            const today = new Date();
            const formattedDate = [
                today.getFullYear(),
                (today.getMonth() + 1).toString().padStart(2, '0'),
                today.getDate().toString().padStart(2, '0')
            ].join('-');
            this.data.date = formattedDate;
            try {
                const result = await handleRequest({
                    endpoint: "get-trip-date",
                    method: "POST",
                    data: this.data,
                });

                if (result.success) {
                    // Si la solicitud es exitosa, asignamos las sucursales
                    //this.trips = result.data?.trips || [];
                    this.trips = (result.data?.trips || []).filter(trip => trip.start == null || trip.start === "");
                    this.promotions = result.data?.promotions || [];
                    this.tickettypes = result.data?.tickettypes || [];
                } else {
                    // Si no hay datos, asignamos un array vacío
                    this.trips = [];
                    this.promotions = [];
                    this.tickettypes = [];
                }
            } catch (error) {
                this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
        },
        async initialize() {
            try {
                this.loading = true;
                this.data = {};
                const today = new Date();
                const formattedDate = today.toLocaleDateString('es-CL', {
                    timeZone: 'America/Santiago',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('-').reverse().join('-'); // Convierte "DD-MM-YYYY" a "YYYY-MM-DD"
                this.data.date = formattedDate;
                this.data.branch_id = Number(this.branch_id);
                const result = await handleRequest({
                    endpoint: "get-tickets-date",
                    method: "POST",
                    data: this.data
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
                    "total",
                    "seats",
                    "adults",
                    "minors",
                    "promotions",
                    "tickettypes"
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
                if (this.areSeatsDifferent(this.editedItem.tickettypes, this.originalItem.seats)) {
                    updatedFields.tickettypes = this.editedItem.tickettypes;
                }
                if (Object.keys(updatedFields).length > 0) {
                    updatedFields.date = this.editedItem.date ? this.editedItem.date : new Date();
                    updatedFields.branch_id = this.branch_id;
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
                                const branchEncontrada = this.branches.find(branch => 
                                        branch.id === branchIdBuscado
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
                    "total",
                    "seats",
                    "adults",
                    "minors",
                    "promotions",
                    "tickettypes"
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
                if (this.areSeatsDifferent(this.editedItem.tickettypes, this.originalItem.seats)) {
                    updatedFields.tickettypes = this.editedItem.tickettypes;
                }
                if (Object.keys(updatedFields).length > 0) {
                    updatedFields.id = this.editedItem.id;
                    updatedFields.trip_id = this.editedItem.trip_id;
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
                const qrData = this.currentTicket.qr
                
                if (!qrData) return;
                
                // Opciones comunes para ambos QR
                const qrOptions = {
                width: 150,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
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
                console.error('Error generando QR codes:', error);
                this.showError('Error al generar códigos QR');
            }
        },
        formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
        },
        async printerItem(item){
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
                this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
            } finally {                
            this.showTicketDialog = true;
            const branchIdBuscado = this.currentTicket.branch_id; // o el ID que necesitas comparar
            
            // Encuentra la branch que coincide
            const branchEncontrada = this.branches.find(branch => 
                    branch.id === branchIdBuscado
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
            const printWindow = window.open('', '_blank');
            
            // Generar ambos códigos QR
            let qrImageOriginal = '';
            let qrImageControl = '';
            const qrData = this.currentTicket.qr || this.currentTicket.id;
            
            if (qrData) {
            qrImageOriginal = await QRCode.toDataURL(qrData, {
                width: 150,
                margin: 1,
                color: {
                dark: '#000000',
                light: '#ffffff'
                }
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
                    ${this.selectedBranch?.image ? `
                    <img src="${this.$axios.defaults.baseURL}images/${this.selectedBranch.image}" 
                        class="branch-logo" 
                        alt="${this.selectedBranch.name}">
                    ` : ''}
                    
                    <div class="branch-name">${this.selectedBranch?.name || 'Nombre Sucursal'}</div>
                    
                    ${this.selectedBranch?.rut ? `
                    <div class="branch-info">RUT: ${this.selectedBranch.rut}</div>
                    ` : ''}
                    
                    ${this.selectedBranch?.address ? `
                    <div class="branch-info">Dirección: ${this.selectedBranch.address}</div>
                    ` : ''}
                    
                    ${this.selectedBranch?.phone ? `
                    <div class="branch-info">Teléfono: ${this.selectedBranch.phone}</div>
                    ` : ''}
                    
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <!-- Ticket original -->
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date}</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || '--:--'}</div>
                </div>
                
                <div class="mb-3">
                    <div class="font-weight-bold mb-1">Recorrido:</div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || 'No especificado'}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || 'No especificado'}</span>
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
                
                ${qrImageOriginal ? `
                    <div class="text-center">
                    <img src="${qrImageOriginal}" style="width: 150px; height: 150px;">
                    </div>
                ` : ''}
                
                <br>
                
                <!-- Línea divisoria -->
                <div class="dashed-divider"></div>
                
                <!-- Copia de control -->
                <div class="text-center caption control-copy-title">
                    -Copia de control-
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date}</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || '--:--'}</div>
                </div>
                
                <div class="mb-3">
                    <div class="font-weight-bold mb-1">Recorrido:</div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || 'No especificado'}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || 'No especificado'}</span>
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
                
                ${qrImageControl ? `
                    <div class="text-center">
                    <img src="${qrImageControl}" style="width: 150px; height: 150px;">
                    </div>
                ` : ''}
                
                <br>
                
                <!-- Nota de impresión -->
                
                
                ${this.currentTicket.print >= 1 ? `
                    <div class="text-center caption mt-2 uppercase-text">
                    (COPIA REIMPRESA POR EL OPERADOR ${this.nameUser})
                    </div>
                ` : ''}
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
            console.error('Error al imprimir:', error);
            this.showAlert('error', 'Error al imprimir el ticket', 3000);
        }
        },
        async editItem(item) {
            this.editedIndex = 1;
            this.aviable = '';
            //this.originalItem = Object.assign({}, item);
            //this.editedItem = Object.assign({}, item);
            this.originalItem = _.cloneDeep(item);
            this.editedItem = _.cloneDeep(item);
            this.selectedSeats = item.seats;
            this.data = {};
            this.data.branch_id = this.branch_id;
            this.data.ticket_id = item.id;

            // Inicializar las variables de promoción
            this.selectedPromotion = null;
           
            const today = new Date();
            const formattedDate = [
                today.getFullYear(),
                (today.getMonth() + 1).toString().padStart(2, '0'),
                today.getDate().toString().padStart(2, '0')
            ].join('-');
            this.data.date = formattedDate;
            try {
                const result = await handleRequest({
                    endpoint: "get-trip-date",
                    method: "POST",
                    data: this.data,
                });

                if (result.success) {
                    // Si la solicitud es exitosa, asignamos las sucursales
                    //this.trips = result.data?.trips || [];
                    this.trips = (result.data?.trips || []).filter(trip => trip.start == null || trip.start === "");
                    this.promotions = result.data?.promotions || [];
                    this.tickettypes = result.data?.tickettypes || [];
                } else {
                    // Si no hay datos, asignamos un array vacío
                    this.trips = [];
                    this.promotions = [];
                    this.tickettypes = [];
                }
            } catch (error) {
                this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
            return this.editedItem.tickettypes?.reduce((total, ticket) => total + (ticket.cant || 0), 0) || 0;
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

        // Versión optimizada de calculateTotal
        calculateNewTotal() {
            const subtotal = this.editedItem.tickettypes?.reduce((sum, t) => {
                return sum + (t.cant * this.editedItem.price);
            }, 0) || 0;

            const totalDiscount = this.editedItem.tickettypes?.reduce((sum, t) => {
                return sum + (t.discount || 0);
            }, 0) || 0;

            return subtotal - totalDiscount;
        },
        handleQuantityChange(ticket, newValue) {
            this.currentlyEditing = ticket.id;
            // 1. Validación y preparación inicial
            const numericValue = Math.max(0, Number(newValue) || 0);
            const updatedTickets = [...(this.editedItem.tickettypes || [])];
            const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id);
            
            // 2. Obtener datos actuales para comparación
            const existingTicket = existingIndex !== -1 ? updatedTickets[existingIndex] : null;
            const previousQty = existingTicket?.cant || 0;
            const previousDiscount = existingTicket?.discount || 0;

            // 3. Verificar disponibilidad de asientos antes de continuar
            const totalSelectedWithoutThis = this.calculateTotalSelected() - previousQty;
            const totalWithNewValue = totalSelectedWithoutThis + numericValue;
            const available = this.availableSeats.length;

            if (totalWithNewValue > available) {
                // No actualizar el valor si supera la disponibilidad
                this.seatError = `Excede la capacidad. Máximo: ${available} asientos`;
                
                // Emitir el valor anterior para mantener la consistencia en la UI
                this.$emit('update:editedItem', {
                    ...this.editedItem,
                    tickettypes: updatedTickets
                });
                
                return; // Salir del método sin hacer cambios
            }

            // Limpiar error si todo está bien
            this.seatError = null;

            // 4. Preparar el ticket actualizado (manteniendo promoción si existe)
            const updatedTicket = {
                ...(existingTicket || {}),
                id: ticket.id,
                name: ticket.name,
                cant: numericValue,
                discount: 0 // Se recalculará abajo
            };

            // 5. Recalcular descuento si tiene promoción
            if (updatedTicket.promotion_id && updatedTicket.percentage) {
                const discountPerTicket = this.editedItem.price * (updatedTicket.percentage / 100);
                updatedTicket.discount = discountPerTicket * numericValue;
            }

            // 6. Actualizar la lista de tickets
            if (numericValue > 0) {
                if (existingIndex !== -1) {
                    updatedTickets[existingIndex] = updatedTicket;
                } else {
                    updatedTickets.push(updatedTicket);
                }
            } else if (existingIndex !== -1) {
                updatedTickets.splice(existingIndex, 1);
            }

            // 7. Calcular nuevos valores globales
            this.editedItem.quantity = updatedTickets.reduce((sum, t) => sum + (t.cant || 0), 0);
            
            // 8. Actualizar el total considerando:
            //    - Cambio en la cantidad base
            //    - Cambio en el descuento (si aplica)
            const priceChange = (numericValue - previousQty) * this.editedItem.price;
            const discountChange = (updatedTicket.discount - previousDiscount);
            
            this.editedItem.total = (this.editedItem.total || 0) + priceChange - discountChange;

            // 9. Actualizar estado y emitir cambios
            this.editedItem.tickettypes = updatedTickets;
            this.$emit('update:editedItem', {
                ...this.editedItem,
                tickettypes: updatedTickets
            });

            // 10. Limpiar errores de cantidad
            this.quantityErrors = {
                ...this.quantityErrors,
                [ticket.id]: null
            };
        },
        /*handleQuantityChange(ticket, newValue) {
            // 1. Validación y preparación inicial
            const numericValue = Math.max(0, Number(newValue) || 0);
            const updatedTickets = [...(this.editedItem.tickettypes || [])];
            const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id);
            
            // 2. Obtener datos actuales para comparación
            const existingTicket = existingIndex !== -1 ? updatedTickets[existingIndex] : null;
            const previousQty = existingTicket?.cant || 0;
            const previousDiscount = existingTicket?.discount || 0;

            // 3. Preparar el ticket actualizado (manteniendo promoción si existe)
            const updatedTicket = {
                ...(existingTicket || {}),
                id: ticket.id,
                name: ticket.name,
                cant: numericValue,
                discount: 0 // Se recalculará abajo
            };

            // 4. Recalcular descuento si tiene promoción
            if (updatedTicket.promotion_id && updatedTicket.percentage) {
                const discountPerTicket = this.editedItem.price * (updatedTicket.percentage / 100);
                updatedTicket.discount = discountPerTicket * numericValue;
            }

            // 5. Actualizar la lista de tickets
            if (numericValue > 0) {
                if (existingIndex !== -1) {
                    updatedTickets[existingIndex] = updatedTicket;
                } else {
                    updatedTickets.push(updatedTicket);
                }
            } else if (existingIndex !== -1) {
                updatedTickets.splice(existingIndex, 1);
            }

            // 6. Calcular nuevos valores globales
            this.editedItem.quantity = updatedTickets.reduce((sum, t) => sum + (t.cant || 0), 0);
            
            // 7. Actualizar el total considerando:
            //    - Cambio en la cantidad base
            //    - Cambio en el descuento (si aplica)
            const priceChange = (numericValue - previousQty) * this.editedItem.price;
            const discountChange = (updatedTicket.discount - previousDiscount);
            
            this.editedItem.total = (this.editedItem.total || 0) + priceChange - discountChange;

            // 8. Actualizar estado y emitir cambios
            this.editedItem.tickettypes = updatedTickets;
            this.$emit('update:editedItem', {
                ...this.editedItem,
                tickettypes: updatedTickets
            });

            // 9. Limpiar errores y validar
            this.quantityErrors = {
                ...this.quantityErrors,
                [ticket.id]: null
            };
            this.validateSeatAvailability();
        },*/
        //logic de tios de pasajes
         validateQuantity(ticket) {
            // Resetear errores
            this.quantityErrors = {
                ...this.quantityErrors,
                [ticket.id]: null
            };
            
            // Validar que sea número válido
            if (isNaN(ticket.cant)) {
                ticket.cant = 0;
            }
            
            // Asegurar que no sea negativo
            ticket.cant = Math.max(0, ticket.cant);
            
            // Calcular la cantidad actual antes del cambio
            const currentQty = this.getCurrentQuantity(ticket.id);
            
            // Calcular el nuevo total considerando:
            // totalSelected - cantidad actual + nueva cantidad
            const newTotal = this.totalSelected - currentQty + ticket.cant;
            
            // Validar que no exceda el total disponible
            if (newTotal > this.editedItem.quantity) {
                const available = this.editedItem.quantity - (this.totalSelected - currentQty);
                
                // Establecer error y ajustar cantidad
                this.quantityErrors = {
                    ...this.quantityErrors,
                    [ticket.id]: `Máximo disponible: ${available}`
                };
                ticket.cant = available;
            }
            
            // Actualizar los datos (incluyendo promociones)
            this.updateTicketWithPromotion(ticket);
        },

        // Método actualizado para manejar promociones
        updateTicketWithPromotion(ticket) {
            const finalQty = Math.min(
                ticket.cant,
                this.editedItem.quantity - (this.totalSelected - this.getCurrentQuantity(ticket.id))
            );
            
            const updatedTickets = [...(this.editedItem.tickettypes || [])];
            const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id);
            
            // Obtener el descuento anterior para actualizar el total
            const previousDiscount = existingIndex !== -1 ? 
                (updatedTickets[existingIndex].discount || 0) : 0;
            
            // Preparar datos del ticket
            const ticketData = {
                id: ticket.id,
                name: ticket.name,
                cant: finalQty,
                // Mantener datos de promoción si existen
                promotion_id: existingIndex !== -1 ? updatedTickets[existingIndex].promotion_id : null,
                namePromotion: existingIndex !== -1 ? updatedTickets[existingIndex].namePromotion : '',
                percentage: existingIndex !== -1 ? updatedTickets[existingIndex].percentage : 0,
                discount: 0 // Lo calcularemos después
            };
            
            // Recalcular descuento si tiene promoción
            if (ticketData.promotion_id && ticketData.percentage > 0) {
                const discountPerTicket = this.editedItem.price * (ticketData.percentage / 100);
                ticketData.discount = discountPerTicket * finalQty;
            }
            
            // Actualizar el total general
            if (this.editedItem.total === undefined) {
                this.editedItem.total = 0;
            }
            
            // Ajustar el total: sumar descuento anterior y restar el nuevo
            this.editedItem.total += previousDiscount;
            this.editedItem.total -= ticketData.discount;
            
            // Actualizar o añadir el ticket
            if (finalQty > 0) {
                if (existingIndex !== -1) {
                    updatedTickets[existingIndex] = ticketData;
                } else {
                    updatedTickets.push(ticketData);
                }
            } else if (existingIndex !== -1) {
                updatedTickets.splice(existingIndex, 1);
            }
            
            // Emitir el cambio
            this.$emit('update:editedItem', {
                ...this.editedItem,
                tickettypes: updatedTickets
            });
        },

        // Métodos auxiliares (se mantienen igual)
        getMaxQuantity(ticket) {
            return this.editedItem.quantity - (this.totalSelected - this.getCurrentQuantity(ticket.id));
        },

        getCurrentQuantity(ticketId) {
            const ticket = this.editedItem.tickettypes?.find(t => t.id === ticketId);
            return ticket ? ticket.cant : 0;
        },


        showPromotionSelect(ticket) {
            // Encontrar el índice del ticket en editedItem.tickettypes
            const updatedTickets = [...(this.editedItem.tickettypes || [])];
            const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id);
            
            if (existingIndex !== -1) {
                // Actualizar el ticket existente
                updatedTickets[existingIndex] = {
                    ...updatedTickets[existingIndex],
                    showPromotionSelect: true,
                    selectedPromotion: null
                };
            } else {
                // Crear un nuevo ticket si no existe
                updatedTickets.push({
                    id: ticket.id,
                    name: ticket.name,
                    cant: ticket.cant,
                    showPromotionSelect: true,
                    selectedPromotion: null
                });
            }
            
            // Actualizar editedItem
            this.editedItem.tickettypes = updatedTickets;
            
            // Forzar la actualización de la vista
            this.$forceUpdate();
            
            // Cargar promociones si no están cargadas
            if (this.promotions.length === 0) {
                this.loadPromotions();
            }
        },
        applyPromotion(ticket, promotionId) {
        const promotion = this.promotions.find(p => p.id === promotionId);
        if (!promotion) return;
        
        // Calcular el descuento
        const discountPerTicket = this.editedItem.price * (promotion.percentage / 100);
        const totalDiscount = discountPerTicket * ticket.cant;
        
        // Obtener el descuento anterior
        const previousDiscount = ticket.discount || 0;
        
        // Actualizar el ticket
        const updatedTickets = [...(this.editedItem.tickettypes || [])];
        const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id);
        
        const updatedTicket = {
            id: ticket.id,
            name: ticket.name,
            cant: ticket.cant,
            promotion_id: promotion.id,
            namePromotion: promotion.name,
            percentage: promotion.percentage,
            discount: totalDiscount,
            showPromotionSelect: false,
            selectedPromotion: null
        };
        
        if (existingIndex !== -1) {
            updatedTickets[existingIndex] = updatedTicket;
        } else {
            updatedTickets.push(updatedTicket);
        }
        
        // Actualizar el total
        if (this.editedItem.total === undefined) {
            this.editedItem.total = 0;
        }
        
        this.editedItem.total += previousDiscount; // Eliminar descuento anterior
        this.editedItem.total -= totalDiscount;   // Aplicar nuevo descuento
        
        // Actualizar editedItem
        this.editedItem.tickettypes = updatedTickets;
        
        // Emitir evento
        this.$emit('update:editedItem', {
            ...this.editedItem,
            tickettypes: updatedTickets
        });
        },
        
        removePromotion(ticket) {
            // Obtener el descuento anterior para este ticket
            const previousDiscount = ticket.discount || 0;
            
            // Actualizar el ticket en editedItem
            const updatedTickets = this.editedItem.tickettypes.map(t => {
                if (t.id === ticket.id) {
                    // Eliminar todos los datos de promoción
                    const { promotion_id, namePromotion, percentage, discount, ...rest } = t;
                    return rest;
                }
                return t;
            });
            
            // Actualizar el total
            if (this.editedItem.total === undefined) {
                this.editedItem.total = 0;
            }
            
            // Sumar el descuento anterior al total (para "eliminarlo")
            this.editedItem.total += previousDiscount;
            
            // Actualizar la lista de tickets
            this.editedItem.tickettypes = updatedTickets;
            
            // Emitir evento si es necesario
            this.$emit('update:editedItem', {
                ...this.editedItem,
                tickettypes: updatedTickets
            });
        },

    // Validar solo números
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
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
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
.seat-icon, .aisle-icon {
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
  text-shadow: 0 0 2px rgba(255,255,255,0.8);
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
  color: #4CAF50; /* Verde para disponibles */
}

.seat-selected {
  color: #2196F3; /* Azul para seleccionados */
}

.seat-reserved {
  color: #F44336; /* Rojo para reservados */
  cursor: not-allowed;
}

.seat-aisle {
  color: #9E9E9E; /* Gris para pasillos */
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
  .seat-container {
    width: 40px;
    height: 40px;
    margin: 4px;
  }
  
  .seat-icon, .aisle-icon {
    font-size: 32px !important;
  }
  
  .seat-number, .aisle-indicator {
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
