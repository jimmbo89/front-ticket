<template>
  <v-menu v-model="menu" :close-on-content-click="false" min-width="290px">
    <template #activator="{ props }">
      <v-text-field
        :model-value="displayDate"
        :label="label"
        :placeholder="placeholder"
        readonly
        :variant="variant"
        :density="density"
        v-bind="{ ...props, ...$attrs }"
        :style="`min-width: ${minWidth}px`"
        :hide-details="hideDetails"
        :clearable="clearable"
        @click:clear="onClear"
      />
    </template>

    <v-date-picker
      :model-value="pickerValue"
      @update:model-value="onDateChange"
      :color="color"
      :min="normalizeDateToYmd(minDate) || undefined"
      :max="normalizeDateToYmd(maxDate) || undefined"
    />
  </v-menu>
</template>

<script>
export default {
  name: "DatePicker",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Date],
      default: null,
    },
    label: {
      type: String,
      default: "Fecha",
    },
    placeholder: {
      type: String,
      default: "",
    },
    variant: {
      type: String,
      default: "underlined",
    },
    density: {
      type: String,
      default: "compact",
    },
    minWidth: {
      type: Number,
      default: 140,
    },
    minDate: {
      type: String,
      default: null,
    },
    maxDate: {
      type: String,
      default: null,
    },
    hideDetails: {
      type: [Boolean, String],
      default: true,
    },
    color: {
      type: String,
      default: "primary",
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    date: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    pickerValue() {
      return this.parseDateToPickerValue(this.date);
    },
    displayDate: {
      get() {
        return this.formatDateDisplay(this.date);
      },
      set() {},
    },
  },
  methods: {
    parseDateToPickerValue(value) {
      if (!value) return null;

      if (value instanceof Date) {
        return value;
      }

      if (typeof value === "string") {
        const normalized = value.split("T")[0];
        const [year, month, day] = normalized.split("-").map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
      }

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    },
    normalizeDateToYmd(value) {
      if (!value) return null;

      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      if (typeof value === "string") {
        return value.split("T")[0];
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;

      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    onDateChange(value) {
      const normalized = this.normalizeDateToYmd(value);
      this.$emit("update:modelValue", normalized);
      this.menu = false;
    },
    onClear() {
      this.$emit("update:modelValue", null);
    },
    formatDateDisplay(dateString) {
      if (!dateString) return "";
      if (dateString instanceof Date) {
        return this.normalizeDateToYmd(dateString) || "";
      }
      return this.normalizeDateToYmd(dateString) || "";
    },
  },
};
</script>
