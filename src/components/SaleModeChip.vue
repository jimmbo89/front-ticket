<template>
  <BusgoChip
    v-bind="$attrs"
    :color="color || getSaleModeColor(value)"
    :size="size"
    :density="density"
    variant="tonal"
  >
    <slot>{{ label || getSaleModeLabel(value) }}</slot>
  </BusgoChip>
</template>

<script>
import BusgoChip from "@/components/BusgoChip.vue";
import {
  getSaleModeColor,
  getSaleModeLabel,
} from "@/utils/saleMode";

export default {
  name: "SaleModeChip",
  inheritAttrs: false,
  components: { BusgoChip },
  props: {
    value: {
      type: [Object, String, Number],
      default: "normal",
    },
    size: {
      type: [String, Number],
      default: "x-small",
    },
    density: {
      type: String,
      default: "compact",
    },
    label: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
  },
  methods: {
    getSaleModeColor,
    getSaleModeLabel,
  },
};
</script>
