<!-- src/components/CustomTooltip.vue -->
<template>
  <!-- Modo 'activator="parent"' -->
  <div v-if="activator === 'parent'" ref="wrapperRef" @mouseenter="show" @mouseleave="hide">
    <slot />
    <!-- El contenido del tooltip se renderiza aquí solo para captura -->
    <div ref="contentRef" style="display: none;">
      <slot name="default" />
    </div>
  </div>

  <!-- Modo con slot 'activator' -->
  <div v-else ref="wrapperRef">
    <slot name="activator" :props="activatorProps" />
    <div ref="contentRef" style="display: none;">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, useSlots } from 'vue'
import { useTooltipStore } from '@/stores/tooltip'

const props = defineProps({
  activator: { type: [String, null], default: null }, // 'parent' o null
  location: { type: String, default: 'bottom' },
  maxWidth: { type: String, default: '300px' },
  color: { type: String, default: 'primary' },
  timeout: { type: Number, default: 3000 },
  closable: { type: Boolean, default: false }
})

const slots = useSlots()
const wrapperRef = ref(null)
const contentRef = ref(null)
const tooltipStore = useTooltipStore()

// Solo para modo 'activator' (no parent)
const activatorProps = {
  onMouseenter: show,
  onMouseleave: hide
}

let showTimeout = null
const HOVER_DELAY = 200 // ms

function show() {
  if (showTimeout) clearTimeout(showTimeout)
  showTimeout = setTimeout(() => {
    if (!contentRef.value) return

    // Clonar el contenido para obtener HTML limpio
    const cloned = contentRef.value.cloneNode(true)
    const div = document.createElement('div')
    div.appendChild(cloned)

    // Extraer texto plano si no hay HTML complejo (opcional)
    const hasComplexContent = slots.default && slots.default().some(vnode => vnode.children && typeof vnode.children !== 'string')
    let contentHtml = ''

    if (hasComplexContent) {
      // Renderizar como HTML (requiere v-html en TooltipAlert)
      contentHtml = div.innerHTML.trim()
    } else {
      // Texto plano
      contentHtml = div.textContent.trim()
    }

    tooltipStore.showTooltip({
      content: contentHtml,
      title: '', // Sin título por defecto (puedes añadir prop si lo deseas)
      color: props.color,
      activator: wrapperRef.value,
      location: props.location,
      maxWidth: props.maxWidth,
      closable: props.closable,
      timeout: props.timeout > 0 ? props.timeout : 0
    })
  }, HOVER_DELAY)
}

function hide() {
  if (showTimeout) clearTimeout(showTimeout)
  tooltipStore.close()
}

onBeforeUnmount(() => {
  if (showTimeout) clearTimeout(showTimeout)
  tooltipStore.close()
})
</script>