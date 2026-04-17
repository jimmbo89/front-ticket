<template>
  <div class="image-slider-wrapper" :style="{ height: height }">
    <div class="position-relative h-100">
      <PublicImage
      :src="currentImage"
      fallback="products/default.jpg"
      :alt="alt"
      :contain="true"
      cover
      class="image-slider-main"
      />
      
      <!-- Flechas de navegación - SUPERPUESTAS -->
      <div v-if="hasMultipleImages" class="slider-arrows">
        <!-- Flecha izquierda - posicionada a la izquierda -->
        <v-btn 
          v-if="currentIndex > 0"
          icon 
          size="small" 
          color="white" 
          variant="tonal"
          @click.stop="prevImage"
          class="arrow-btn arrow-left"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <!-- Flecha derecha - posicionada a la derecha -->
        <v-btn 
          v-if="currentIndex < images.length - 1"
          icon 
          size="small" 
          color="white" 
          variant="tonal"
          @click.stop="nextImage"
          class="arrow-btn arrow-right"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <!-- Contador de imágenes -->
      <div v-if="hasMultipleImages" class="image-counter">
        <v-chip size="x-small" color="rgba(0,0,0,0.7)" text-color="white">
          {{ currentIndex + 1 }}/{{ images.length }}
        </v-chip>
      </div>
      
      <!-- Indicadores de posición (puntos) -->
      <div v-if="hasMultipleImages && showDots" class="image-indicators">
        <div class="d-flex justify-center gap-1">
          <v-btn
            v-for="(img, imgIndex) in images"
            :key="imgIndex"
            icon
            size="x-small"
            :color="currentIndex === imgIndex ? 'primary' : 'white'"
            @click.stop="goToImage(imgIndex)"
            class="indicator-dot"
          >
            <v-icon size="x-small">mdi-circle</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ImageSlider',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    alt: {
      type: String,
      default: 'Imagen'
    },
    height: {
      type: String,
      default: '160px'
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    showDots: {
      type: Boolean,
      default: true
    },
    contain: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change', 'error'],
  data() {
    return {
      currentIndex: this.initialIndex
    }
  },
  computed: {
    hasMultipleImages() {
      return this.images && this.images.length > 1
    },
    currentImage() {
      if (!this.images || this.images.length === 0) {
        return null
      }
      return this.images[this.currentIndex] || this.images[0]
    }
  },
  methods: {
    nextImage() {
      if (!this.hasMultipleImages) return
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++
        this.$emit('change', this.currentIndex)
      }
    },
    prevImage() {
      if (!this.hasMultipleImages) return
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.$emit('change', this.currentIndex)
      }
    },
    goToImage(index) {
      if (index >= 0 && index < this.images.length) {
        this.currentIndex = index
        this.$emit('change', this.currentIndex)
      }
    },
    handleImageError() {
      this.$emit('error', this.currentImage)
    }
  }
}
</script>

<style scoped>
.image-slider-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.image-slider-main {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.image-slider-main:hover :deep(.v-img__img) {
  transform: scale(1.04);
}

.image-slider-main :deep(.v-img__img) {
  transition: transform 0.35s ease;
}

.position-relative {
  position: relative;
}

.h-100 {
  height: 100%;
}

.image-slider-main {
  transition: opacity 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slider-main :deep(.v-img__img) {
  object-fit: contain !important;
  max-width: 100%;
  max-height: 100%;
}

/* Contenedor de flechas */
.slider-arrows {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Estilos para las flechas */
.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5) !important;
  opacity: 0.9 !important;
  transition: all 0.2s ease;
  pointer-events: auto;
  width: 32px !important;
  height: 32px !important;
  z-index: 2;
}

.arrow-btn:hover {
  opacity: 1 !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  transform: translateY(-50%) scale(1.1);
}

/* Posición específica para cada flecha */
.arrow-left {
  left: 8px;
}

.arrow-right {
  right: 8px;
}

.image-counter {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.image-indicators {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  z-index: 2;
}

.indicator-dot {
  opacity: 0.8;
  transition: all 0.2s ease;
  pointer-events: auto;
  background-color: rgba(255, 255, 255, 0.3) !important;
}

.indicator-dot:hover {
  opacity: 1;
  transform: scale(1.2);
}
</style>