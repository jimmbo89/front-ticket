<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="340px"
  >
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        :model-value="summary"
        variant="solo-filled"
        hide-details
        single-line
        flat
        readonly
        prepend-inner-icon="mdi-filter-variant"
        label="Período"
        density="compact"
        class="report-date-range-trigger"
      />
    </template>

    <v-card class="pa-2 report-date-range-menu" elevation="6">
      <v-btn-toggle
        :model-value="selectedMode"
        mandatory
        variant="outlined"
        density="compact"
        class="w-100 report-date-range-toggle"
      >
        <v-btn
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          size="small"
          class="text-none px-3"
          @click="selectMode(option.value)"
        >
          {{ option.label }}
        </v-btn>
      </v-btn-toggle>

      <div v-if="selectedMode === 'week'" class="mt-3">
        <div class="text-caption text-grey mb-2">Selecciona una fecha de referencia para la semana</div>
        <v-locale-provider locale="es">
          <v-date-picker
            header="Calendario"
            title="Seleccione la fecha"
            color="primary"
            :model-value="referenceDate"
            format="yyyy-MM-dd"
            @update:model-value="updateWeekReference"
          />
        </v-locale-provider>
      </div>

      <div v-else-if="selectedMode === 'month'" class="mt-3">
        <div class="text-caption text-grey mb-2">Selecciona una fecha de referencia para el mes</div>
        <v-locale-provider locale="es">
          <v-date-picker
            header="Calendario"
            title="Seleccione la fecha"
            color="primary"
            :model-value="referenceDate"
            format="yyyy-MM-dd"
            @update:model-value="updateMonthReference"
          />
        </v-locale-provider>
      </div>

      <div v-else-if="selectedMode === 'custom'" class="mt-3 d-flex flex-wrap gap-2">
        <v-menu
          v-model="startMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="displayStartDate"
              variant="solo-filled"
              hide-details
              single-line
              flat
              prepend-inner-icon="mdi-calendar"
              label="Fecha de inicio"
              density="compact"
              style="min-width: 150px;"
            />
          </template>
        <v-locale-provider locale="es">
          <v-date-picker
            header="Calendario"
            title="Seleccione la fecha"
            color="primary"
            :model-value="customStartDate"
            format="yyyy-MM-dd"
            @update:model-value="updateStartDate"
          />
          </v-locale-provider>
        </v-menu>

        <v-menu
          v-model="endMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="displayEndDate"
              variant="solo-filled"
              hide-details
              single-line
              flat
              prepend-inner-icon="mdi-calendar"
              label="Fecha final"
              density="compact"
              style="min-width: 150px;"
            />
          </template>
        <v-locale-provider locale="es">
          <v-date-picker
            header="Calendario"
            title="Seleccione la fecha"
            color="primary"
            :model-value="customEndDate"
            :min="startDate"
            format="yyyy-MM-dd"
            @update:model-value="updateEndDate"
          />
          </v-locale-provider>
        </v-menu>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { endOfMonth, endOfWeek, format, isValid, parseISO, startOfMonth, startOfWeek } from 'date-fns';

const props = defineProps({
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:startDate', 'update:endDate']);

const todayDate = new Date();
const today = format(todayDate, 'yyyy-MM-dd');
const open = ref(false);
const selectedMode = ref('today');
const referenceDate = ref(toDate(props.startDate || today));
const customStartDate = ref(toDate(props.startDate || today));
const customEndDate = ref(toDate(props.endDate || today));
const startMenu = ref(false);
const endMenu = ref(false);

const options = [
  { label: 'Hoy', value: 'today' },
  { label: 'Por semana', value: 'week' },
  { label: 'Por mes', value: 'month' },
  { label: 'Personalizado', value: 'custom' },
];

const startDate = computed(() => props.startDate || today);
const endDate = computed(() => props.endDate || startDate.value);
const displayStartDate = computed(() => format(customStartDate.value || todayDate, 'yyyy-MM-dd'));
const displayEndDate = computed(() => format(customEndDate.value || customStartDate.value || todayDate, 'yyyy-MM-dd'));

const summary = computed(() => {
  if (selectedMode.value === 'today') {
    return 'Hoy';
  }
  if (selectedMode.value === 'week') {
    return 'Por semana';
  }
  if (selectedMode.value === 'month') {
    return 'Por mes';
  }
  return 'Personalizado';
});

function toDate(value) {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return new Date(value);
}

function toDateString(value) {
  const date = toDate(value);
  return format(date, 'yyyy-MM-dd');
}

function emitRange(nextStart, nextEnd) {
  emit('update:startDate', nextStart);
  emit('update:endDate', nextEnd);
}

function getWeekRange(reference) {
  const date = toDate(reference);
  return {
    startDate: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

function getMonthRange(reference) {
  const date = toDate(reference);
  return {
    startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

function selectMode(mode) {
  selectedMode.value = mode;

  if (mode === 'today') {
    emitRange(today, today);
    open.value = false;
    return;
  }

  if (mode === 'week') {
    const range = getWeekRange(referenceDate.value);
    emitRange(range.startDate, range.endDate);
    return;
  }

  if (mode === 'month') {
    const range = getMonthRange(referenceDate.value);
    emitRange(range.startDate, range.endDate);
    return;
  }

  emitRange(startDate.value, endDate.value);
}

function updateWeekReference(value) {
  referenceDate.value = toDate(value || today);
  const range = getWeekRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
  open.value = false;
}

function updateMonthReference(value) {
  referenceDate.value = toDate(value || today);
  const range = getMonthRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
  open.value = false;
}

function updateStartDate(value) {
  customStartDate.value = toDate(value || today);
  const nextStart = toDateString(customStartDate.value);
  const nextEnd = toDateString(
    customEndDate.value < customStartDate.value ? customStartDate.value : customEndDate.value
  );
  customEndDate.value = toDate(nextEnd);
  emitRange(nextStart, nextEnd);
  startMenu.value = false;
}

function updateEndDate(value) {
  customEndDate.value = toDate(value || today);
  const nextEnd = toDateString(customEndDate.value);
  const nextStart = toDateString(
    customStartDate.value > customEndDate.value ? customEndDate.value : customStartDate.value
  );
  customStartDate.value = toDate(nextStart);
  emitRange(nextStart, nextEnd);
  endMenu.value = false;
}

watch(
  () => props.startDate,
  (value) => {
    if (value) {
      referenceDate.value = toDate(value);
      customStartDate.value = toDate(value);
    }
  }
);

watch(
  () => props.endDate,
  (value) => {
    if (value) {
      customEndDate.value = toDate(value);
    }
  }
);
</script>

<style scoped>
.report-date-range-trigger {
  min-width: 220px;
}

.report-date-range-menu {
  border-radius: 12px;
}

.report-date-range-toggle {
  border-radius: 10px;
  overflow: hidden;
}
</style>
