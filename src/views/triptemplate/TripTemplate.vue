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
    <v-container style="min-width: 100%">
        <v-card elevation="6" class="mx-2">
            <v-toolbar :color="paleteColors.primary">
                <v-row align="center">
                    <v-col cols="12" md="8" class="grow ml-4">
                        <span class="text-subtitle-1"><strong>Plantillas de Viajes</strong></span>
                    </v-col>
                    <v-col cols="12" md="3" class="text-right">
                        <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.white" variant="tonal" elevation="2"
                            prepend-icon="mdi-plus-circle" @click="showAdd">
                            Agregar Plantilla de Viaje
                        </v-btn>
                    </v-col>
                </v-row>
            </v-toolbar>
            <v-card-text>
                <v-row>
                    <v-container fluid>
                        <v-col cols="12" md="12">
                            <v-row v-if="mostrarFila" dense>
                                <v-col cols="12" md="3">
                                    <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id"
                                        :items="branches" label="Seleccione una Sucursal" prepend-inner-icon="mdi-store"
                                        item-title="name" item-value="id" variant="underlined" :rules="selectRules"
                                        density="compact">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props"
                                                :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
                                            </v-list-item>
                                        </template> </v-autocomplete><!-- @update:model-value="initialize()">-->
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable">
                                        <v-icon>mdi-magnify</v-icon></v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-container>
                </v-row>
                <v-row dense>
                    <v-col cols="12">
                        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar"
                            single-line hide-details>
                        </v-text-field>
                        <v-data-table :headers="headers" :search="search" :items="templates" class="elevation-1"
                            style="max-height: 68vh; overflow-y: auto" :items-per-page-text="'Elementos por páginas'"
                            no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
                            <template v-slot:item.actions="{ item }">
                                <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)"
                                    :color="paleteColors.primary" variant="tonal" elevation="1"
                                    title="Editar Viaje"></v-btn>
                                <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)"
                                    :color="paleteColors.error" variant="tonal" elevation="1"
                                    title="Eliminar Viaje"></v-btn>
                            </template>
                            <template v-slot:item.origin="{ item }">
                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                                <v-img :src="`${this.$axios.defaults.baseURL}images/${
                                    item.originImage
                                    }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
                                {{ item.origin }}
                            </template>
                            <!--<template v-slot:item.origin="{ item }">
                                <div class="avatar-row">
                                    <v-tooltip v-if="item.origin && item.originImage" bottom
                                        content-class="custom-tooltip">
                                        <template v-slot:activator="{ props }">
                                            <div class="d-flex align-center" v-bind="props">
                                                <v-avatar class="avatar-item me-2" size="32" elevation="3">
                                                    <v-img
                                                        :src="`${this.$axios.defaults.baseURL}images/${item.originImage}?t=${Date.now()}`"
                                                        alt="Origin image" />
                                                </v-avatar>
                                            </div>
                                        </template>
                                        <span>{{ item.origin }}</span>
                                    </v-tooltip>
                                    <span v-else>{{ item.origin || 'N/A' }}</span>
                                </div>
                            </template>-->
                            <template v-slot:item.destination="{ item }">
                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                                <v-img :src="`${this.$axios.defaults.baseURL}images/${
                                    item.destinationImage
                                    }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
                                {{ item.destination }}
                            </template>
                            <!--<template v-slot:item.destination="{ item }">
                                <div class="avatar-row">
                                    <v-tooltip v-if="item.destination && item.destinationImage" bottom
                                        content-class="custom-tooltip">
                                        <template v-slot:activator="{ props }">
                                            <div class="d-flex align-center" v-bind="props">
                                                <v-avatar class="avatar-item me-2" size="32" elevation="3">
                                                    <v-img
                                                        :src="`${this.$axios.defaults.baseURL}images/${item.destinationImage}?t=${Date.now()}`"
                                                        alt="Origin image" />
                                                </v-avatar>
                                            </div>
                                        </template>
                                        <span>{{ item.destination }}</span>
                                    </v-tooltip>
                                    <span v-else>{{ item.destination || 'N/A' }}</span>
                                </div>
                            </template>-->
                            <template v-slot:item.vehicleName="{ item }">
                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                                    <v-img :src="`${this.$axios.defaults.baseURL}images/${
                      item.vehicleImage
                    }?t=${Date.now()}`" alt="image"></v-img> </v-avatar>
                                {{ item.vehicleName }}
                            </template>
                            <template v-slot:item.workers="{ item }">
                                <div class="avatar-row">
                                    <!-- Mostrar los avatares de las personas con tooltip -->
                                    <v-tooltip v-for="person in item.workers" :key="person.id" bottom
                                        content-class="custom-tooltip">
                                        <template v-slot:activator="{ props }">
                                            <v-avatar class="avatar-item hover-expand" size="32" elevation="3"
                                                v-bind="props">
                                                <v-img
                                                    :src="`${this.$axios.defaults.baseURL}images/${person.workerImage}?t=${Date.now()}`"
                                                    alt="image" />
                                            </v-avatar>
                                        </template>
                                        <!-- Información en el tooltip -->
                                        <span>{{ person.workerName }}</span>
                                        <v-spacer></v-spacer>
                                        <span class="text-secondary">{{ person.roleName }}</span> <!-- Segundo dato -->
                                    </v-tooltip>
                                </div>
                            </template>
                            <template v-slot:item.recurrence_pattern="{ item }">
                            <div class="d-flex align-center" v-if="item.recurrence_pattern">
                                <v-icon small class="me-1" :color="getRecurrenceColor(item.recurrence_pattern)">{{ getRecurrenceIcon(item.recurrence_pattern) }}</v-icon>
                                <span >{{ translateRecurrence(item.recurrence_pattern) }}</span>
                            </div>
                            <span v-else>—</span>
                            </template>
                            <template v-slot:item.days_of_week="{ item }">
                            <div v-if="item.days_of_week" class="d-flex">
                                <v-tooltip location="bottom">
                                <template v-slot:activator="{ props: activatorProps }">
                                    <div v-bind="activatorProps" class="d-flex flex-wrap gap-1">
                                    <v-avatar
                                        v-for="day in 7"
                                        :key="day"
                                        size="24"
                                        :color="getDaysArray(item.days_of_week).includes(day - 1) ? 'primary' : 'grey-lighten-4'"
                                        class="text-caption"
                                    >
                                        {{ ['D', 'L', 'M', 'X', 'J', 'V', 'S'][day - 1] }}
                                    </v-avatar>
                                    </div>
                                </template>
                                <span>{{ formatFullDayNames(getDaysArray(item.days_of_week)) }}</span>
                                </v-tooltip>
                            </div>
                            <span v-else>-</span>
                            </template>
                             <template v-slot:item.active="{ item }">
                            <div class="selection-content">
                                                    <v-icon :size="20"
                                                            :color="item.active ? 'success' : 'error'"
                                                            :icon="item.active ? 'mdi-check-circle' : 'mdi-close-circle'"
                                                            class="selection-icon"></v-icon>
                                                    <span class="selection-text">{{ activeName(item.active) }}</span>
                                                </div>
                            </template>
                            
                            <template v-slot:item.price="{ item }">
                                {{ formatNumber(item.price)}}
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-container>
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition" :no-click-animation="true">
        <v-card style="display: flex; flex-direction: column; min-height: 100vh;">
            <v-card-text style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <v-form v-model="valid" enctype="multipart/form-data"
                    style="flex: 1; display: flex; flex-direction: column;">
                    <v-stepper elevation="6" bg-color="" v-model="step" :items="items" hide-actions
                        style="max-height: 100vh; min-height: 95vh; overflow-y: auto">
                        <template v-slot:item.1>
                            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                                <v-row style="margin-top: 5px">
                                    <v-col cols="12" md="12">
                                        <v-autocomplete :no-data-text="'No hay datos disponibles'"
                                            v-model="editedItem.route_id" :items="routes" label="Ruta"
                                            prepend-icon="mdi-road" item-title="name" item-value="id"
                                            variant="underlined" :rules="selectRules" density="compact"
                                            @update:model-value="updateStimated">
                                            <template v-slot:item="{ props, item }">
                                                <v-card class="mx-1 my-2" elevation="2">
                                                    <v-list-item v-bind="props">
                                                        <v-list-item-content>
                                                            <v-row align="center" no-gutters>
                                                                <!-- Columna 1: Origen -->
                                                                <v-col cols="12" md="4" class="d-flex align-center">
                                                                    <v-avatar>
                                                                        <v-img
                                                                            :src="`${this.$axios.defaults.baseURL}images/${item.raw.originImage}`"
                                                                            max-width="40" />
                                                                    </v-avatar>
                                                                    <div class="ml-2">
                                                                        <div class="text-caption text-grey">
                                                                            <v-icon small
                                                                                class="mr-1">mdi-map-marker</v-icon>
                                                                            Origen
                                                                        </div>
                                                                        <v-tooltip location="top">
                                                                            <template
                                                                                v-slot:activator="{ props: tooltipProps }">
                                                                                <div v-bind="tooltipProps"
                                                                                    class="text-truncate"
                                                                                    style="max-width: 100%">
                                                                                    {{ item.raw.originAddress }}
                                                                                </div>
                                                                            </template>
                                                                            <span>{{ item.raw.originAddress }}</span>
                                                                            <!-- Texto completo en el tooltip -->
                                                                        </v-tooltip>
                                                                    </div>
                                                                </v-col>

                                                                <!-- Columna 2: Destino -->
                                                                <v-col cols="12" md="4" class="d-flex align-center">
                                                                    <v-avatar>
                                                                        <v-img
                                                                            :src="`${this.$axios.defaults.baseURL}images/${item.raw.destinationImage}`"
                                                                            max-width="40" />
                                                                    </v-avatar>
                                                                    <div class="ml-2">
                                                                        <div class="text-caption text-grey">
                                                                            <v-icon small
                                                                                class="mr-1">mdi-map-marker-check</v-icon>
                                                                            Destino
                                                                        </div>
                                                                        <v-tooltip location="top">
                                                                            <template
                                                                                v-slot:activator="{ props: tooltipProps }">
                                                                                <div v-bind="tooltipProps"
                                                                                    class="text-truncate"
                                                                                    style="max-width: 100%">
                                                                                    {{ item.raw.destinationAddress }}
                                                                                </div>
                                                                            </template>
                                                                            <span>{{ item.raw.destinationAddress
                                                                                }}</span>
                                                                            <!-- Texto completo en el tooltip -->
                                                                        </v-tooltip>
                                                                    </div>
                                                                </v-col>
                                                            </v-row>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                                </v-card>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-autocomplete :no-data-text="'No hay datos disponibles'"
                                            v-model="editedItem.vehicle_id" :items="vehicles" label="Vehículo"
                                            prepend-icon="mdi-car-side" item-title="vehicleName" item-value="id"
                                            variant="underlined" :rules="selectRules" density="compact"
                                            @update:model-value="filterWorkers">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.vehicleImage}`"
                                                    :title="item.raw.vehicleName">
                                                    <v-list-item-subtitle class="d-flex flex-column">
                                                        <div>Marca: {{ item.raw.brand }}</div>
                                                        <div>Asientos: {{ item.raw.seats }}</div>
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
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item
                                            v-bind="props"
                                            :prepend-icon="getRecurrenceIcon(item.raw.value)"
                                            :color="getRecurrenceColor(item.raw.value)"
                                            >
                                            </v-list-item>
                                        </template>

                                        <template v-slot:selection="{ item }">
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
                                            ></v-autocomplete>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="editedItem.price" label="Precio"
                                            prepend-icon="mdi-currency-usd" variant="underlined" :rules="priceRules"
                                            type="number" density="compact" min="0" disabled="true"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="editedItem.duration" label="Duración (Minutos)"
                                        prepend-icon="mdi-timer" variant="underlined" :rules="durationRules"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                      <v-select
                                            v-model="editedItem.active"
                                            :items="statusOptions"
                                            item-value="value"
                                            item-title="text"
                                            label="Estado"
                                            variant="underlined"
                                            :prepend-icon="editedItem.active ? 'mdi-check-circle' : 'mdi-close-circle'"
                                            :color="editedItem.active ? 'success' : 'error'"
                                        >
                                            <template v-slot:item="{ props, item }">
                                            <v-list-item
                                                v-bind="props"
                                                :prepend-icon="item.raw.value ? 'mdi-check-circle' : 'mdi-close-circle'"
                                                :color="item.raw.value ? 'success' : 'error'"
                                            ></v-list-item>
                                            </template>
                                            
                                            <template v-slot:selection="{ item }">
                                             <div class="selection-content">
                                                    <v-icon :size="20"
                                                            :color="item.raw.value ? 'success' : 'error'"
                                                            :icon="item.raw.value ? 'mdi-check-circle' : 'mdi-close-circle'"
                                                            class="selection-icon"></v-icon>
                                                    <span class="selection-text">{{ item.raw.text }}</span>
                                                </div>
                                            </template>
                                        </v-select>
                                    </v-col>
                                </v-row>
                            </div>
                            <v-divider></v-divider>
                            <div style="padding: 16px; border-top: 1px solid #eee;">
                                <!-- BOTONES -->
                                <v-row class="mt-1">
                                    <v-btn color="#E7E9E9" variant="flat" @click="close()">Salir</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn color="#E7E9E9" variant="flat" @click="nextStep" :disabled="
                                        !editedItem.vehicle_id ||
                                        !editedItem.route_id ||
                                        !editedItem.schedule ||
                                        !editedItem.price
                                        ">
                                        Siguiente
                                    </v-btn>
                                </v-row>
                            </div>
                        </template>
                        <template v-slot:item.2>
                            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                                <v-sheet border>
                                    <v-toolbar :color="paleteColors.primary">
                                        <v-row align="center">
                                            <v-col cols="12" md="7" class="grow ml-4">
                                                <span class="text-subtitle-1"><strong>Relación de
                                                        Trabajadores</strong></span>
                                            </v-col>
                                            <v-col cols="12" md="4" class="text-right">
                                                <v-btn class="text-subtitle-1" :color="paleteColors.white"
                                                    variant="tonal" elevation="2" prepend-icon="mdi-plus-circle"
                                                    @click="showAssiegnedWorker">
                                                    Asignar Trabajador
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-toolbar>

                                    <v-card-text>
                                        <v-data-table :headers="headersWorkers" :items="filteredWorkers"
                                            class="elevation-1" style="max-height: 68vh; overflow-y: auto"
                                            :items-per-page-text="'Elementos por páginas'"
                                            no-data-text="No hay datos disponibles" :loading="loading"
                                            loading-text="Cargando datos...">
                                            <!--<template v-slot:item.actions="{ item }">
                      <v-btn density="comfortable" icon="mdi-delete" @click="deleteItemWorker(item)"
                        :color="paleteColors.error" variant="tonal" elevation="1" title="Eliminar Relación"></v-btn>
                    </template>-->
                                            <template v-slot:item.workerName="{ item }">
                                                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4"
                                                    size="large">
                                                    <v-img :src="`${this.$axios.defaults.baseURL}images/${
                            item.workerImage
                          }?t=${Date.now()}`" alt="image"></v-img> </v-avatar><!--+'?$'+Date.now()-->
                                                {{ item.workerName }}
                                            </template>
                                            <template v-slot:item.actions="{ item }">
                                                <v-btn density="comfortable"
                                                    :icon="isWorkerAssociated(item) ? 'mdi-delete' : 'mdi-plus'"
                                                    @click="isWorkerAssociated(item) ? deleteItemWorker(item) : saveAssignedWorker(item)"
                                                    :color="isWorkerAssociated(item) ? paleteColors.error : paleteColors.success"
                                                    variant="tonal" elevation="1"
                                                    :title="isWorkerAssociated(item) ? 'Eliminar Relación' : 'Agregar Relación'"></v-btn>
                                            </template>
                                        </v-data-table>
                                    </v-card-text>
                                </v-sheet>
                            </div>
                            <v-divider></v-divider>
                            <div style="padding: 16px; border-top: 1px solid #eee;">
                                <!-- BOTONES -->
                                <v-row class="mt-1">
                                    <v-btn color="#E7E9E9" variant="flat" @click="prevStep">Volver</v-btn>
                                    <v-spacer></v-spacer>
                                    <!--<v-btn color="#E7E9E9" :disabled="hasInvalidState" variant="flat"
                    @click="dialogDeleteDiario = true">Siguiente</v-btn>-->
                                    <v-btn :color="paleteColors.primary" variant="flat" @click="save()"
                                        :disabled="!valid || !editedItem.workers.length"
                                        :loading="loading">Aceptar</v-btn>
                                </v-row>
                            </div>
                        </template>
                    </v-stepper>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
            <v-toolbar :color="paleteColors.error">
                <span class="text-subtitle-2 ml-4"> Eliminar una plantilla de viaje</span>
            </v-toolbar>

            <v-card-text class="mt-2 mb-2"> ¿Desea eliminar la plantilla viaje seleccionada?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">
                    Cancelar
                </v-btn>
                <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm">
                    Aceptar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogAssignedWorkers" max-width="400px">
        <v-form ref="form" v-model="valid" enctype="multipart/form-data">
            <v-card>
                <v-toolbar :color="paleteColors.primary">
                    <span class="text-subtitle-2 ml-4">Asignar trabajadores al viaje</span>
                </v-toolbar>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="12">
                                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="selectedWorker"
                                    :items="filteredWorkers" label="Personas" prepend-icon="mdi-account"
                                    item-title="workerName" item-value="id" variant="underlined" :rules="selectRules">
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props"
                                            :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.workerImage}`"
                                            :title="item.raw.workerName">
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
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :color="paleteColors.gris" variant="flat" @click="closeAssignedWorker">Cancelar</v-btn>
                    <v-btn :color="paleteColors.primary" variant="flat" @click="saveAssignedWorker"
                        :disabled="!valid">Aceptar</v-btn>
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
    currentTimeSlots: [], // Array para los slots filtrados según fecha
    dialogDelete: false,
    estimated: 0,
    timeSlotsKey: 0,
    mostrarFila: false,
    templates: [],
    routes: [],
    vehicles: [],
    workers: [],
    branches: [],
    filteredWorkers: [],
    data: {},
    selectedWorker: "",
    route: "",
    branch_id: "",
    step: 1,
    items: ["Datos Generales", "Asignar Trabajadores"],
    dialogAssignedWorkers: false,
    frequencyOptions: [
    { text: 'Diario', value: 'daily' },
    { text: 'Días laborables (L-V)', value: 'weekdays' },
    { text: 'Fin de semana (S-D)', value: 'weekends' }, // ¡Nueva opción!
    { text: 'Semanal', value: 'weekly' }
    // Eliminamos 'custom' que no existe en el backend
    ],
     daysOfWeekOptions: [
      { text: 'Lunes', value: 1, icon: 'mdi-calendar' },
      { text: 'Martes', value: 2, icon: 'mdi-calendar' },
      { text: 'Miércoles', value: 3, icon: 'mdi-calendar' },
      { text: 'Jueves', value: 4, icon: 'mdi-calendar' },
      { text: 'Viernes', value: 5, icon: 'mdi-calendar' },
      { text: 'Sábado', value: 6, icon: 'mdi-calendar' },
      { text: 'Domingo', value: 0, icon: 'mdi-calendar' },
    ],
     statusOptions: [
      { text: 'Activo', value: true },
      { text: 'Inactivo', value: false },
    ],
    headers: [
      { title: "Ruta", value: "name" },
      { title: "Origen", value: "origin" },
      { title: "Destino", value: "destination" },
      { title: "Vehículo", value: "vehicleName"},
      { title: "Trabajadores", value: "workers"},
      { title: "Horario", value: "schedule" },
      { title: "Duración (minutos)", value: "duration" },
      { title: "Precio", value: "price" },
      { title: "Frecuencia", value: "recurrence_pattern" },
      { title: "Dias de la Semana", value: "days_of_week" },
        { title: "Estado", value: "active" },
      { title: "Acciones", value: "actions", sortable: false, width: "10%" },
    ],

    headersWorkers: [
      { title: "Nombre", value: "workerName", width: "60%" },
      { title: "Rol", value: "roleName", width: "20%" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
    ],

    editedItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      schedule: "",
      duration: "",
      price: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
      workers: [],
    },
    originalItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      schedule: "",
      duration: "",
      price: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
      workers: [],
    },
    defaultItem: {
      id: "",
      route_id: "",
      branch_id: "",
      vehicle_id: "",
      date: "",
      schedule: "",
      duration: "",
      price: "",
      recurrence_pattern: "",
      days_of_week: "",
      active: true,
      workers: [],
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
    priceRules: [
      (v) => !!v || "El precio es obligatorio", // El campo es obligatorio
      (v) =>
        /^[0-9]+(\.[0-9]{1,2})?$/.test(v) ||
        "El precio debe ser un número válido con hasta 2 decimales", // Valida el formato del precio
      (v) => v > 0 || "El precio debe ser un número positivo", // El precio debe ser positivo
    ],
    durationRules: [
      (v) => !isNaN(v) || "La duración debe ser un número",
      (v) => v > 0 || "La duración debe ser mayor a 0",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Plantilla de Viaje" : "Editar Plantilla de Viaje";
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
    // Deshabilitar selección manual para estas opciones
    return ['daily', 'weekdays', 'weekends'].includes(this.editedItem.recurrence_pattern);
  },
  
  shouldPreselectDays() {
    // Determinar si debemos preseleccionar días
    return this.editedItem.recurrence_pattern && this.isDaySelectionDisabled;
  }
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    if (this.role === "Administrador") {
      this.showBranches();
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  watch: {
  'editedItem.recurrence_pattern': {
    handler(newVal) {
      // Primero limpiar los días seleccionados
      this.editedItem.days_of_week = '';
      
      // Luego llamar al método de preselección
      this.$nextTick(() => {
        this.preselectDays();
      });
    },
    immediate: true
  }
},
  methods: {
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
    filterTimeSlots(item, queryText) {
    // Permite buscar formatos como "8:30", "0830" o "830"
    const normalizedQuery = queryText.toLowerCase().replace(/[:\s]/g, '');
    const normalizedItem = item.toLowerCase().replace(/[:\s]/g, '');
    return normalizedItem.includes(normalizedQuery);
  },
     getDayInitial(text) {
    // Retorna la primera letra del día
    return text.charAt(0);
  },
  getDaysArray(daysString) {
    if (!daysString) return [];
    // Convertir "1,2,5" en [1, 2, 5]
    return daysString.split(',').map(Number);
  },
  getDayColor(dayValue) {
    if (this.isDaySelected(dayValue)) {
      return 'primary';
    }
    return 'default';
  },
  isDaySelected(dayValue) {
    if (!this.editedItem.days_of_week) return false;
    return this.editedItem.days_of_week.split(',').includes(dayValue.toString());
  },
  
  handleDayClick(dayValue) {
    if (!this.isDaySelectionDisabled) {
      this.toggleDay(dayValue);
    }
  },
  toggleDay(dayValue) {
    const daysArray = this.editedItem.days_of_week 
      ? this.editedItem.days_of_week.split(',').filter(Boolean).map(Number) 
      : [];
    
    const index = daysArray.indexOf(dayValue);
    
    if (index === -1) {
      daysArray.push(dayValue);
    } else {
      daysArray.splice(index, 1);
    }
    
    this.editedItem.days_of_week = daysArray.sort((a, b) => a - b).join(',');
  },
  preselectDays() {
    // Preseleccionar días según el patrón
    switch(this.editedItem.recurrence_pattern) {
      case 'daily':
        this.editedItem.days_of_week = '0,1,2,3,4,5,6'; // Todos los días
        break;
      case 'weekdays':
        this.editedItem.days_of_week = '1,2,3,4,5'; // L-V
        break;
      case 'weekends':
        this.editedItem.days_of_week = '0,6'; // S-D
        break;
      case 'weekly':
        if (!this.editedItem.days_of_week) {
          // Valor por defecto para semanal (Lunes)
          this.editedItem.days_of_week = '1';
        }
        break;
    }
  },
    formatFullDayNames(daysArray) {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return daysArray?.map(day => dayNames[day]).join(', ') || '';
    },
    translateRecurrence(pattern) {
    const translations = {
        'daily': 'Diario',
        'weekdays': 'Días laborables (L-V)',
        'weekends': 'Fin de semana (S-D)',
        'weekly': 'Semanal'
    };
    return translations[pattern] || pattern;
    },
    activeName(pattern) {
    const translations = {
        false: 'Inactivo',
        true: 'Activo',
    };
    return translations[pattern] || pattern;
    },
  getRecurrenceIcon(pattern) {
    const icons = {
      'daily': 'mdi-calendar-today',
      'weekdays': 'mdi-calendar-week-begin',
      'weekends': 'mdi-calendar-weekend', // Nuevo ícono
      'weekly': 'mdi-calendar-week'
    };
    return icons[pattern] || 'mdi-calendar-question';
  },
  getRecurrenceColor(pattern) {
    const colors = {
      'daily': 'blue',
      'weekdays': 'orange',
      'weekends': 'cyan', // Nuevo color
      'weekly': 'green'
    };
    return colors[pattern] || 'grey';
  },
  generateTimeSlots() {
  const slots = [];

  // Generar todos los slots posibles (de 00:00 a 23:55)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const slotMinutes = hour * 60 + minute;
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      
      slots.push({
        time: timeStr,
        minutes: slotMinutes
      });
    }
  }

  // Ordenar: primero de 08:00 en adelante, luego los anteriores
  return [
    ...slots.filter(s => s.minutes >= 480),  // 480 minutos = 8:00 AM
    ...slots.filter(s => s.minutes < 480)
    ].map(s => s.time);
    },
    updateStimated(selectedRouteId) {
    try {
      const selectedRoute = this.routes.find(route => route.id === selectedRouteId);
      
      if (!selectedRoute) {
        throw new Error('Ruta no encontrada');
      }
      
      this.editedItem.price = selectedRoute.price || 0;
      this.editedItem.duration = selectedRoute.estimated || 0;
      
    } catch (error) {
      //console.error("Error al actualizar ruta:", error);
      this.editedItem.price = 0;
      this.editedItem.duration = 0;
    }
  },
    // Método para verificar si un trabajador ya está asociado al viaje
  isWorkerAssociated(worker) {
    return this.editedItem.workers?.some(w => w.id === worker.id);
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
          // Si no hay datos, asignamos un array vacío
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
    // Filtramos los trabajadores según el vehículo seleccionado
    filterWorkers() {
      const selectedVehicleId = Number(this.editedItem.vehicle_id);
      console.log('this.editedItem.vehicle_id');
      console.log(Number(this.editedItem.vehicle_id));
      // Filtramos los trabajadores que están relacionados con el vehículo seleccionado
      this.filteredWorkers = this.workers.filter((worker) =>
        worker.vehicles.some((vehicle) => vehicle.id === selectedVehicleId)
      );
    },
    today(date) {
      // Obtener la fecha actual
      const hoy = new Date();

      // Formatear la fecha actual al mismo formato YYYY-MM-DD
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      const hoyFormateado = `${año}-${mes}-${dia}`;

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
        } else {
          // Si no hay datos, asignamos un array vacío
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
    },
    async showAssiegnedWorker() {
      // Clonar filteredWorkers para evitar referencias compartidas
      const clonedFilteredWorkers = this.filteredWorkers.map((worker) => ({ ...worker }));

      // Ahora puedes filtrar el arreglo clonado sin afectar a los objetos originales
      this.filteredWorkers = clonedFilteredWorkers.filter((worker) => {
        // Verificar si la persona no está en editedItem.workers
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
        const newWorkers = {
          id: worker.id,
          workerName: worker.workerName,
          workerImage: worker.workerImage,
          roleId: worker.roleId,
          roleName: worker.roleName,
        };
        // Verificar si la relación ya existe en editedItem.people
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

      // Reiniciar selección y cerrar diálogo
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

      // Ordenar ambos arrays para una comparación consistente
      const sortedOriginal = [...originalWorkers].sort((a, b) => a.id - b.id);
      const sortedEdited = [...editedWorkers].sort((a, b) => a.id - b.id);

      // Comparar cada objeto en los arrays
      return sortedOriginal.some((original, index) => {
        const edited = sortedEdited[index];
        return Object.keys(original).some((key) => original[key] !== edited[key]);
      });
    },
    async initialize() {
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
          this.templates = result.data?.templates || [];
        } else {
          // Si no hay datos, asignamos un array vacío
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
          "price",
          "active",
          "workers",
        ];

        let updatedFields = Object.keys(this.editedItem)
          .filter(
            (key) =>
              fieldsToUpdate.includes(key) &&
              (this.originalItem[key], this.editedItem[key])
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
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.branch_id = this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "trip-template",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
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
            // Este bloque captura errores inesperados fuera del manejo estándar
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
          "price",
          "active",
          "workers",
        ];
        let updatedFields = Object.keys(this.editedItem)
          .filter(
            (key) =>
              fieldsToUpdate.includes(key) &&
              (key !== "workers"
                ? this.editedItem[key] !== this.originalItem[key]
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
            } else {
              obj[key] = this.editedItem[key];
            }
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          try {
            const result = await handleRequest({
              endpoint: "trip-template",
              method: "PUT",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
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

          const matchedRoute = this.routes.find(route => route.id === this.editedItem.route_id);
          this.estimated = matchedRoute ? matchedRoute.estimated : null;
        } else {
          // Si no hay datos, asignamos un array vacío
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
          endpoint: "trip-template-destroy",
          method: "POST",
          data: request,
        });

        // Manejo de la respuesta según el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        // Este bloque captura errores inesperados fuera del manejo estándar
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
  /* Aquí se define el borde */
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
  /* Cambia el color del borde según desees */
  border-radius: 50%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* Para que siga siendo redondo */
  box-sizing: border-box;
  /* Asegura que el borde no afecte el tamaño del avatar */
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
  /* Tamaño de texto más pequeño */
}

.custom-tooltip {
  background-color: #f5f5f5 !important;
  /* Fondo claro */
  color: #E5E5E5 !important;
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
  padding-left: 4px; /* Ajuste para alinear con el diseño */
}

.selection-icon {
  margin-right: 4px;
}

.selection-text {
  font-size: 0.875rem; /* Tamaño consistente con Vuetify */
}


</style>
