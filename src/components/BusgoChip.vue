<template>
  <v-chip
    v-bind="$attrs"
    :size="size"
    :variant="variant"
    :class="['busgo-chip', `busgo-chip--${density}`]"
  >
    <slot />
  </v-chip>
</template>

<script>
export default {
  name: "BusgoChip",
  inheritAttrs: false,
  props: {
    size: {
      type: [String, Number],
      default: "x-small",
    },
    variant: {
      type: String,
      default: "tonal",
    },
    density: {
      type: String,
      default: "compact",
      validator: (value) => ["compact", "standard"].includes(value),
    },
  },
};
</script>

<style>
.busgo-chip {
  display: inline-flex !important;
  box-sizing: border-box !important;
  max-width: 100%;
  min-height: 23px !important;
  padding: 0 8px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  line-height: 1.2 !important;
}

.busgo-chip .v-chip__content {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.busgo-chip--standard {
  min-height: 26px !important;
  padding-inline: 10px !important;
  font-size: 11.5px !important;
}
</style>
