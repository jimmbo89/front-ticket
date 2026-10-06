<template>
  <v-combobox
    v-bind="$attrs"
    :model-value="modelValue"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    :prepend-inner-icon="prependInnerIcon"
    :variant="variant"
    :density="density"
    :no-data-text="noDataText"
    :menu-props="menuProps"
    :custom-filter="customFilter"
    :filter-keys="filterKeys"
    :disabled="disabled"
    :loading="loading"
    :rules="rules"
    :clearable="clearable"
    :hide-selected="hideSelected"
    :return-object="returnObject"
    multiple
    chips
    closable-chips
    class="multi-select-combobox"
    @update:model-value="handleUpdate"
  >
    <template #item="slotProps">
      <slot name="item" v-bind="slotProps">
        <v-list-item v-bind="slotProps.props" :title="getItemTitle(slotProps.item?.raw ?? slotProps.item)" />
      </slot>
    </template>

    <template #selection="slotProps">
      <slot name="selection" v-bind="{ ...slotProps, remove: () => removeSelection(slotProps.item) }">
        <v-chip size="small" closable @click:close="removeSelection(slotProps.item)">
          {{ getItemTitle(slotProps.item?.raw ?? slotProps.item) }}
        </v-chip>
      </slot>
    </template>
  </v-combobox>
</template>

<script>
export default {
  name: "MultiSelectCombobox",
  inheritAttrs: false,
  emits: ["update:modelValue"],
  props: {
    modelValue: { type: Array, default: () => [] },
    items: { type: Array, default: () => [] },
    itemTitle: { type: [String, Function], default: "title" },
    itemValue: { type: [String, Function], default: "value" },
    label: { type: String, default: "Seleccionar" },
    placeholder: { type: String, default: "Buscar y seleccionar" },
    prependInnerIcon: { type: String, default: "mdi-magnify" },
    variant: { type: String, default: "outlined" },
    density: { type: String, default: "comfortable" },
    noDataText: { type: String, default: "No hay opciones disponibles" },
    menuProps: { type: [Object, String, Array], default: undefined },
    customFilter: { type: Function, default: undefined },
    filterKeys: { type: [Array, String], default: () => ["title"] },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    rules: { type: Array, default: () => [] },
    clearable: { type: Boolean, default: true },
    hideSelected: { type: Boolean, default: true },
    returnObject: { type: Boolean, default: true },
  },
  methods: {
    getItemValue(item) {
      if (typeof this.itemValue === "function") return this.itemValue(item);
      return this.itemValue ? item?.[this.itemValue] : item;
    },
    getItemTitle(item) {
      if (typeof this.itemTitle === "function") return this.itemTitle(item);
      return this.itemTitle ? item?.[this.itemTitle] : item;
    },
    normalizeSelection(value) {
      const allowed = new Map(this.items.map((item) => [String(this.getItemValue(item)), item]));
      const seen = new Set();
      return (Array.isArray(value) ? value : []).map((item) => {
        const raw = item?.raw ?? item;
        const normalized = allowed.get(String(this.getItemValue(raw)));
        if (!normalized) return null;
        const key = String(this.getItemValue(normalized));
        if (seen.has(key)) return null;
        seen.add(key);
        return normalized;
      }).filter(Boolean);
    },
    handleUpdate(value) {
      const selected = this.normalizeSelection(value);
      this.$emit("update:modelValue", this.returnObject ? selected : selected.map((item) => this.getItemValue(item)));
    },
    removeSelection(item) {
      const raw = item?.raw ?? item;
      const removedKey = String(this.getItemValue(raw));
      const next = this.normalizeSelection(this.modelValue).filter((selected) => String(this.getItemValue(selected)) !== removedKey);
      this.$emit("update:modelValue", this.returnObject ? next : next.map((selected) => this.getItemValue(selected)));
    },
  },
};
</script>

<style scoped>
.multi-select-combobox :deep(.v-field){border-radius:9px}.multi-select-combobox :deep(.v-label){color:#64748b;font-size:13px;font-weight:650;opacity:1}.multi-select-combobox :deep(.v-field__input){color:#1e293b;font-size:13px;font-weight:650}.multi-select-combobox :deep(.v-chip){color:#2454d6;background:#eef3ff;font-size:11px;font-weight:750}.multi-select-combobox :deep(.v-chip__close){color:#64748b}.multi-select-combobox :deep(.v-chip__close:hover){color:#dc2626}
</style>
