<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    transition="scale-transition"
    location="bottom start"
    min-width="340px"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :model-value="summary"
        variant="outlined"
        hide-details
        single-line
        readonly
        prepend-inner-icon="mdi-calendar-range"
        append-inner-icon="mdi-chevron-down"
        label="Período"
        density="compact"
        class="report-date-range-trigger"
      />
    </template>

    <v-card class="report-date-range-menu" elevation="0">
      <div class="range-menu-header">
        <div class="range-menu-heading">
          <div class="range-menu-icon">
            <v-icon size="19">mdi-calendar-filter</v-icon>
          </div>

          <div>
            <div class="range-menu-title">Período del reporte</div>
            <div class="range-menu-subtitle">
              Selecciona el intervalo que deseas consultar
            </div>
          </div>
        </div>

        <v-btn
          icon="mdi-content-save-outline"
          variant="text"
          size="small"
          class="range-menu-close"
          @click="open = false"
        />
      </div>

      <v-divider />

      <div class="range-menu-body">
        <div class="range-section-label">Rango rápido</div>

        <v-btn-toggle
          :model-value="selectedMode"
          mandatory
          density="compact"
          class="report-date-range-toggle"
        >
          <v-btn
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            size="small"
            class="range-option-button"
            @click="selectMode(option.value)"
          >
            <v-icon :icon="option.icon" size="15" />
            <span class="range-option-copy">
              <strong>{{ option.label }}</strong>
              <small>{{ option.helper }}</small>
            </span>
          </v-btn>
        </v-btn-toggle>

        <div class="active-range-summary">
          <div class="active-range-summary-icon">
            <v-icon size="17">mdi-calendar-check-outline</v-icon>
          </div>
          <div class="active-range-summary-copy">
            <span>Período seleccionado</span>
            <strong>{{ selectedRangeLabel }}</strong>
          </div>
          <v-chip size="x-small" variant="tonal" color="primary" class="active-mode-chip">
            {{ selectedModeLabel }}
          </v-chip>
        </div>

        <div v-if="selectedMode === 'week'" class="range-calendar-section">
          <div class="range-calendar-copy">
            <v-icon size="17">mdi-calendar-week</v-icon>
            <div>
              <strong>Seleccionar Semana</strong>
              <span>BusGo tomará automáticamente desde el lunes hasta el domingo.</span>
            </div>
          </div>

          <div class="period-navigator period-navigator--week">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              class="period-navigation-button"
              aria-label="Semana anterior"
              @click="shiftWeek(-1)"
            />

            <div class="period-navigator-content">
              <div class="period-navigator-icon">
                <v-icon size="21">mdi-calendar-week</v-icon>
              </div>
              <span>Semana seleccionada</span>
              <strong>{{ weekStartLabel }} — {{ weekEndLabel }}</strong>
              <small>{{ selectedWeekYear }}</small>
            </div>

            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              size="small"
              class="period-navigation-button"
              aria-label="Semana siguiente"
              @click="shiftWeek(1)"
            />
          </div>

          <div class="period-shortcuts">
            <v-btn variant="text" size="small" class="period-today-button" @click="goToCurrentWeek">
              Semana actual
            </v-btn>
            <v-btn color="primary" variant="flat" size="small" class="period-confirm-button" @click="confirmWeek">
              Usar esta semana
            </v-btn>
          </div>
        </div>

        <div v-else-if="selectedMode === 'month'" class="range-calendar-section">
          <div class="range-calendar-copy">
            <v-icon size="17">mdi-calendar-month</v-icon>
            <div>
              <strong>Selecciona el mes</strong>
              <span>BusGo tomará automáticamente el mes completo.</span>
            </div>
          </div>

          <div class="period-navigator period-navigator--month">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              class="period-navigation-button"
              aria-label="Mes anterior"
              @click="shiftMonth(-1)"
            />

            <div class="period-navigator-content">
              <div class="period-navigator-icon period-navigator-icon--month">
                <v-icon size="21">mdi-calendar-month-outline</v-icon>
              </div>
              <span>Mes seleccionado</span>
              <strong class="selected-month-name">{{ selectedMonthName }}</strong>
              <small>{{ selectedMonthYear }}</small>
            </div>

            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              size="small"
              class="period-navigation-button"
              aria-label="Mes siguiente"
              @click="shiftMonth(1)"
            />
          </div>

          <div class="period-shortcuts">
            <v-btn variant="text" size="small" class="period-today-button" @click="goToCurrentMonth">
              Mes actual
            </v-btn>
            <v-btn color="primary" variant="flat" size="small" class="period-confirm-button" @click="confirmMonth">
              Usar este mes
            </v-btn>
          </div>
        </div>

        <div v-else-if="selectedMode === 'custom'" class="custom-range-section">
          <div class="range-calendar-copy">
            <v-icon size="17">mdi-calendar-edit</v-icon>
            <div>
              <strong>Rango personalizado</strong>
              <span>Define manualmente la fecha inicial y final.</span>
            </div>
          </div>

          <div class="custom-range-fields">
            <v-menu
              v-model="startMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              location="bottom start"
              min-width="290px"
            >
              <template #activator="{ props: startProps }">
                <v-text-field
                  v-bind="startProps"
                  :model-value="displayStartDate"
                  variant="outlined"
                  hide-details
                  single-line
                  readonly
                  prepend-inner-icon="mdi-calendar-start"
                  label="Fecha de inicio"
                  density="compact"
                  class="custom-date-field"
                />
              </template>

              <v-locale-provider locale="es">
                <v-date-picker
                  header="Calendario"
                  title="Seleccione la fecha"
                  color="primary"
                  :model-value="customStartDate"
                  format="yyyy-MM-dd"
                  class="range-date-picker"
                  @update:model-value="updateStartDate"
                />
              </v-locale-provider>
            </v-menu>

            <div class="custom-range-arrow">
              <v-icon size="18">mdi-arrow-right</v-icon>
            </div>

            <v-menu
              v-model="endMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              location="bottom end"
              min-width="290px"
            >
              <template #activator="{ props: endProps }">
                <v-text-field
                  v-bind="endProps"
                  :model-value="displayEndDate"
                  variant="outlined"
                  hide-details
                  single-line
                  readonly
                  prepend-inner-icon="mdi-calendar-end"
                  label="Fecha final"
                  density="compact"
                  class="custom-date-field"
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
                  class="range-date-picker"
                  @update:model-value="updateEndDate"
                />
              </v-locale-provider>
            </v-menu>
          </div>

          <div class="selected-range-preview">
            <v-icon size="16">mdi-information-outline</v-icon>
            <span>
              Período seleccionado:
              <strong>{{ displayStartDate }}</strong>
              al
              <strong>{{ displayEndDate }}</strong>
            </span>
          </div>
        </div>

      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { addMonths, addWeeks, endOfMonth, endOfWeek, format, isValid, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

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
  { label: 'Hoy', helper: 'Un día', value: 'today', icon: 'mdi-calendar-today' },
  { label: 'Semana', helper: 'Lun a dom', value: 'week', icon: 'mdi-calendar-week' },
  { label: 'Mes', helper: 'Completo', value: 'month', icon: 'mdi-calendar-month' },
  { label: 'Personalizado', helper: 'Dos fechas', value: 'custom', icon: 'mdi-calendar-edit' },
];

const startDate = computed(() => props.startDate || today);
const endDate = computed(() => props.endDate || startDate.value);
const displayStartDate = computed(() => format(customStartDate.value || todayDate, 'yyyy-MM-dd'));
const displayEndDate = computed(() => format(customEndDate.value || customStartDate.value || todayDate, 'yyyy-MM-dd'));
const selectedModeLabel = computed(() => {
  return options.find((option) => option.value === selectedMode.value)?.label || 'Período';
});

const selectedRangeLabel = computed(() => {
  const start = toDate(startDate.value);
  const end = toDate(endDate.value);

  if (startDate.value === endDate.value) {
    return format(start, "d 'de' MMMM 'de' yyyy", { locale: es });
  }

  return `${format(start, "d 'de' MMM", { locale: es })} — ${format(end, "d 'de' MMM 'de' yyyy", { locale: es })}`;
});

const selectedWeekRange = computed(() => getWeekRange(referenceDate.value));
const weekStartLabel = computed(() => {
  return format(toDate(selectedWeekRange.value.startDate), "d 'de' MMM", { locale: es });
});
const weekEndLabel = computed(() => {
  return format(toDate(selectedWeekRange.value.endDate), "d 'de' MMM", { locale: es });
});
const selectedWeekYear = computed(() => {
  return format(toDate(selectedWeekRange.value.endDate), 'yyyy');
});
const selectedMonthName = computed(() => {
  return format(toDate(referenceDate.value), 'MMMM', { locale: es });
});
const selectedMonthYear = computed(() => {
  return format(toDate(referenceDate.value), 'yyyy');
});

const summary = computed(() => {
  if (selectedMode.value === 'today') {
    return `Hoy · ${format(toDate(startDate.value), 'dd MMM', { locale: es })}`;
  }
  if (selectedMode.value === 'week') {
    return `Semana · ${format(toDate(startDate.value), 'dd MMM', { locale: es })} — ${format(toDate(endDate.value), 'dd MMM', { locale: es })}`;
  }
  if (selectedMode.value === 'month') {
    return `Mes · ${format(toDate(startDate.value), 'MMMM yyyy', { locale: es })}`;
  }
  return `${format(toDate(startDate.value), 'dd MMM', { locale: es })} — ${format(toDate(endDate.value), 'dd MMM', { locale: es })}`;
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

function shiftWeek(amount) {
  referenceDate.value = addWeeks(toDate(referenceDate.value), amount);
  const range = getWeekRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
}

function goToCurrentWeek() {
  referenceDate.value = toDate(today);
  const range = getWeekRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
}

function confirmWeek() {
  const range = getWeekRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
  open.value = false;
}

function shiftMonth(amount) {
  referenceDate.value = addMonths(toDate(referenceDate.value), amount);
  const range = getMonthRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
}

function goToCurrentMonth() {
  referenceDate.value = toDate(today);
  const range = getMonthRange(referenceDate.value);
  emitRange(range.startDate, range.endDate);
}

function confirmMonth() {
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
  width: 220px;
  min-width: 220px;
}

.report-date-range-trigger :deep(.v-field) {
  min-height: 40px;
  color: #334155;
  background: #ffffff;
  border-radius: 9px;
}

.report-date-range-trigger :deep(.v-field__input),
.report-date-range-trigger :deep(.v-label) {
  color: #334155 !important;
  font-size: 12.5px !important;
  font-weight: 650 !important;
  opacity: 1 !important;
}

.report-date-range-trigger :deep(.v-icon) {
  color: #64748b;
}

.report-date-range-menu {
  overflow: hidden;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #dfe6ef;
  border-radius: 13px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18) !important;
}

.range-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
}

.range-menu-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-menu-icon {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #ffffff;
  background:
    radial-gradient(circle at 90% 5%, rgba(53, 184, 232, 0.5), transparent 25px),
    linear-gradient(135deg, #0e1f46, #2454d6);
  border-radius: 9px;
  box-shadow: 0 5px 12px rgba(36, 84, 214, 0.18);
}

.range-menu-title {
  color: #0f172a;
  font-size: 14px;
  font-weight: 850;
  line-height: 1.2;
}

.range-menu-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
}

.range-menu-close {
  color: #044bad !important;
}

.range-menu-body {
  padding: 14px 16px 16px;
}

.range-section-label {
  margin-bottom: 8px;
  color: #475569;
  font-size: 9.5px;
  font-weight: 850;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.report-date-range-toggle {
  display: grid !important;
  width: 100%;
  height: auto !important;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  overflow: visible !important;
  background: #f1f5f9;
  border-radius: 9px;
}

.range-option-button {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  min-width: 0 !important;
  min-height: 44px !important;
  padding: 0 7px !important;
  color: #526176 !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 7px !important;
  font-size: 10.5px !important;
  font-weight: 750 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
}

.range-option-copy {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  flex-direction: column;
  line-height: 1.05;
}

.range-option-copy strong {
  color: inherit;
  font-size: 10px;
  font-weight: 800;
}

.range-option-copy small {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 700;
}

.range-option-button.v-btn--active .range-option-copy small {
  color: #5270b4;
}

.range-option-button.v-btn--active {
  color: #17377f !important;
  background: #ffffff !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1) !important;
}

.active-range-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 11px;
  padding: 10px;
  background: linear-gradient(100deg, #f5f8ff, #fbfdff);
  border: 1px solid #dfe7f8;
  border-radius: 9px;
}

.active-range-summary-icon {
  display: grid;
  flex: 0 0 31px;
  width: 31px;
  height: 31px;
  color: #2454d6;
  background: #e8efff;
  border-radius: 8px;
  place-items: center;
}

.active-range-summary-copy {
  min-width: 0;
}

.active-range-summary-copy span,
.active-range-summary-copy strong {
  display: block;
}

.active-range-summary-copy span {
  color: #64748b;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.active-range-summary-copy strong {
  margin-top: 2px;
  overflow: hidden;
  color: #1e293b;
  font-size: 10.5px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-mode-chip {
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 9px !important;
  font-weight: 800 !important;
}

.range-calendar-section,
.custom-range-section {
  margin-top: 13px;
  padding-top: 13px;
  border-top: 1px solid #edf1f5;
}

.range-calendar-copy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 11px;
  color: #2454d6;
}

.range-calendar-copy strong,
.range-calendar-copy span {
  display: block;
}

.period-navigator {
  display: grid;
  min-height: 154px;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 8px;
  padding: 14px 10px;
  background:
    radial-gradient(circle at 50% 0, rgba(36, 84, 214, 0.08), transparent 62%),
    #f8fafc;
  border: 1px solid #dfe6ef;
  border-radius: 11px;
}

.period-navigator--month {
  background:
    radial-gradient(circle at 50% 0, rgba(22, 135, 90, 0.09), transparent 62%),
    #f8fafc;
}

.period-navigation-button {
  color: #334155 !important;
  background: #ffffff !important;
  border: 1px solid #dfe6ef !important;
  border-radius: 9px !important;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.06) !important;
}

.period-navigation-button:hover {
  color: #2454d6 !important;
  background: #eef3ff !important;
  border-color: #cbd9ff !important;
}

.period-navigator-content {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.period-navigator-icon {
  display: grid;
  width: 37px;
  height: 37px;
  margin-bottom: 8px;
  color: #2454d6;
  background: #e8efff;
  border-radius: 10px;
  place-items: center;
}

.period-navigator-icon--month {
  color: #16875a;
  background: #e8f7ef;
}

.period-navigator-content span,
.period-navigator-content strong,
.period-navigator-content small {
  display: block;
}

.period-navigator-content span {
  color: #64748b;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.period-navigator-content strong {
  margin-top: 5px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.015em;
  text-transform: capitalize;
}

.period-navigator-content small {
  margin-top: 4px;
  color: #64748b;
  font-size: 10px;
  font-weight: 750;
}

.period-navigator-content .selected-month-name {
  font-size: 20px;
}

.period-shortcuts {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.period-today-button,
.period-confirm-button {
  min-height: 36px !important;
  border-radius: 8px !important;
  font-size: 10.5px !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
}

.period-today-button {
  color: #526176 !important;
}

.period-confirm-button {
  min-width: 137px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(36, 84, 214, 0.17) !important;
}

.range-result-preview {
  margin-bottom: 10px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #e3e9f1;
  border-radius: 9px;
}

.range-result-preview--week {
  background: linear-gradient(100deg, #f6f9ff, #fbfdff);
  border-color: #dfe7f8;
}

.range-result-preview--month {
  background: linear-gradient(100deg, #f7fbf9, #fbfefc);
  border-color: #dcefe5;
}

.range-result-badge {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 8.5px;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.range-result-dates {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr);
  align-items: center;
  gap: 7px;
  color: #2454d6;
}

.range-result-dates > div:last-child {
  text-align: right;
}

.range-result-dates span,
.range-result-dates strong,
.month-result-copy span,
.month-result-copy strong {
  display: block;
}

.range-result-dates span,
.month-result-copy span {
  color: #64748b;
  font-size: 8.5px;
  font-weight: 750;
  text-transform: uppercase;
}

.range-result-dates strong,
.month-result-copy strong {
  margin-top: 3px;
  color: #1e293b;
  font-size: 11px;
  font-weight: 850;
  text-transform: capitalize;
}

.month-result-copy {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #16875a;
}

.calendar-action-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 2px 2px 8px;
  color: #526176;
  font-size: 9.5px;
  font-weight: 700;
}

.calendar-action-label .v-icon {
  color: #2454d6;
}

.range-calendar-copy strong {
  color: #334155;
  font-size: 11.5px;
  font-weight: 800;
}

.range-calendar-copy span {
  margin-top: 2px;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
}

.range-date-picker {
  width: 100% !important;
  max-width: 356px !important;
  margin: auto;
  overflow: hidden;
  border: 1px solid #e5eaf1;
  border-radius: 10px;
  box-shadow: none !important;
}

.range-date-picker :deep(.v-picker-title) {
  display: none;
}

.range-date-picker :deep(.v-picker__header) {
  padding: 12px 15px 6px;
  color: #0f172a;
  background: #f8fafc;
}

.custom-range-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 26px minmax(0, 1fr);
  align-items: center;
  gap: 7px;
}

.custom-date-field {
  min-width: 0;
}

.custom-date-field :deep(.v-field) {
  min-height: 42px;
  color: #334155;
  background: #ffffff;
  border-radius: 9px;
}

.custom-date-field :deep(.v-field__input),
.custom-date-field :deep(.v-label) {
  color: #334155 !important;
  font-size: 11.5px !important;
  font-weight: 700 !important;
  opacity: 1 !important;
}

.custom-range-arrow {
  display: grid;
  color: #94a3b8;
  place-items: center;
}

.selected-range-preview {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 11px;
  padding: 9px 10px;
  color: #526176;
  background: #f8fafc;
  border: 1px solid #e7ecf3;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 650;
}

.selected-range-preview .v-icon,
.selected-range-preview strong {
  color: #2454d6;
}

.today-range-state {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
  padding: 12px;
  background: #f7fbf9;
  border: 1px solid #dcefe5;
  border-radius: 9px;
}

.today-range-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #16875a;
  background: #e8f7ef;
  border-radius: 9px;
}

.today-range-state strong,
.today-range-state span {
  display: block;
}

.today-range-state strong {
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 800;
}

.today-range-state span {
  margin-top: 2px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 650;
}

.today-check {
  margin-left: auto;
  color: #16875a;
}

@media (max-width: 600px) {
  .report-date-range-trigger {
    width: 100%;
    min-width: 100%;
  }

  .range-menu-header {
    padding: 13px;
  }

  .range-menu-body {
    padding: 12px 13px 14px;
  }

  .range-menu-subtitle {
    max-width: 215px;
  }

  .report-date-range-toggle {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .active-mode-chip {
    display: none;
  }

  .custom-range-fields {
    grid-template-columns: 1fr;
  }

  .custom-range-arrow {
    transform: rotate(90deg);
  }
}
</style>
