<template>
  <div>
    <!-- Si tiene múltiples imágenes, usar slider -->
    <ImageSlider
      v-if="hasMultipleImages"
      :images="processedImages"
      :alt="alt"
      :height="height"
      :show-dots="showDots"
      :auto-play="autoPlay"
      @change="onImageChange"
      @error="onImageError"
    />
    <PublicImage
    v-else
      :src="singleImageSrc"
      fallback="products/default.jpg"
      :alt="alt"
      :height="height"
      :width="width"
      v-bind="$attrs"
      :contain="true"
      cover
      />
  </div>
</template>

<script>
import ImageSlider from './ImageSlider.vue'

export default {
  name: 'ProtectedImageWithSlider',
  components: {
    ImageSlider
  },
  props: {
    src: {
      type: [String, Array],
      default: null
    },
    alt: {
      type: String,
      default: 'Imagen'
    },
    height: {
      type: String,
      default: '200px'
    },
    width: {
      type: String,
      default: null
    },
    showDots: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change', 'error'],
  computed: {
    processedImages() {
      if (!this.src) return []
      
      // Si ya es un array
      if (Array.isArray(this.src)) {
        return this.src
      }
      
      // Si es string, intentar parsear como JSON
      if (typeof this.src === 'string') {
        try {
          const parsed = JSON.parse(this.src)
          return Array.isArray(parsed) ? parsed : [this.src]
        } catch {
          return [this.src]
        }
      }
      
      return []
    },
    
    hasMultipleImages() {
      return this.processedImages.length > 1
    },
    
    singleImageSrc() {
      return this.processedImages[0] || null
    }
  },
  methods: {
    onImageChange(index) {
      this.$emit('change', index)
    },
    
    onImageError(error) {
      this.$emit('error', error)
    }
  }
}
</script>