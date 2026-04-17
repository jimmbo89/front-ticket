<template>
  <v-img
    :src="computedSrc"
    :alt="alt || ''"
    :contain="contain"
    :cover="cover"
    @error="handleError"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'PublicImage', // Renombrado para reflejar su propósito actual
  props: {
    src: {
      type: String,
      required: false,
      default: null
    },
    fallback: {
      type: String,
      default: 'products/default.jpg' // Asegúrate de que sea una ruta pública válida
    },
    contain: {
      type: Boolean,
      default: true
    },
    cover: {
      type: Boolean,
      default: false
    },
    alt: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentSrc: null
    }
  },
  computed: {
    computedSrc() {
      if (!this.src) return this.fallback;

      // Si ya es URL absoluta o blob/data, usar directamente
      if (
        this.src.startsWith('http://') ||
        this.src.startsWith('https://') ||
        this.src.startsWith('blob:') ||
        this.src.startsWith('data:')
      ) {
        return this.src;
      }

      // Ruta relativa → convertir a URL pública con timestamp anti-caché
      const cleanPath = this.src.replace(/^\/+/, ''); // Elimina barras iniciales
      const timestamp = this.getCacheTimestamp();
      return `${this.$axios.defaults.baseURL}images/${cleanPath}?t=${timestamp}`;
    }
  },
  methods: {
    getCacheTimestamp() {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime();
    },
    handleError() {
      if (this.currentSrc !== this.fallback) {
        this.currentSrc = this.fallback;
      }
    }
  },
  watch: {
    computedSrc: {
      immediate: true,
      handler(newSrc) {
        this.currentSrc = newSrc;
      }
    }
  }
}
</script>