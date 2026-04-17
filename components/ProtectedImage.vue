<template>
  <v-img
    :src="localSrc"
    :contain="contain"
    :cover="cover"
    v-bind="$attrs"
    @error="handleError"
  />
</template>

<script>
import axiosInstance from '@/axios'

export default {
  name: 'ProtectedImage',
  props: {
    src: {
      type: String,
      required: false,
      default: null
    },
    fallback: {
      type: String,
      default: 'produts/default.jpg'
    },
    // NUEVAS PROPS para controlar cómo se muestra la imagen
    contain: {
      type: Boolean,
      default: true  // Por defecto mostrar completa
    },
    cover: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localSrc: null,
      loading: false,
      error: false
    }
  },
  mounted() {
    // Cargar imagen después de montar
    this.$nextTick(() => {
      this.loadImage(this.src)
    })
  },
  watch: {
    src: {
      immediate: true,
      handler(newSrc) {
        if (newSrc && this.localSrc !== this.fallback) {
          this.loadImage(newSrc)
        }
      }
    }
  },
  methods: {
    async loadImage(imagePath) {
      // Resetear estado de error
      this.error = false
      
      if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
        this.setFallback()
        return
      }

      // Limpiar imagen anterior si existe
      if (this.localSrc && this.localSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.localSrc)
      }

      // Casos especiales:
      if (imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
        this.localSrc = imagePath
        return
      }

      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        this.localSrc = imagePath
        return
      }

      this.loading = true
      
      try {
        // Asegurar que la ruta esté limpia
        const cleanPath = imagePath.replace(/^\/+/, '').trim()
        
        // Validar que tenga formato correcto
        if (!cleanPath || cleanPath === 'undefined' || cleanPath === 'null') {
          throw new Error('Invalid image path')
        }

        const response = await axiosInstance.get(
          `images-protect/${cleanPath}`,
          {
            responseType: 'blob',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`, // Asegurar token
              'Cache-Control': 'no-cache' // Evitar caché
            }
          }
        )
        
        if (response.status === 200 && response.data) {
          const blobUrl = URL.createObjectURL(response.data)
          this.localSrc = blobUrl
        } else {
          throw new Error('Invalid response')
        }
      } catch (error) {
        console.error('Error al cargar imagen protegida:', error.message)
        this.setFallback()
      } finally {
        this.loading = false
      }
    },
    
    setFallback() {
      this.error = true
      this.localSrc = this.fallback
    },
    
    handleError() {
      // Solo manejar errores de carga del blob
      if (this.localSrc && this.localSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.localSrc)
      }
      this.setFallback()
    }
  },
  beforeUnmount() {
    // Limpiar recursos
    if (this.localSrc && this.localSrc.startsWith('blob:')) {
      URL.revokeObjectURL(this.localSrc)
    }
  }
}
</script>