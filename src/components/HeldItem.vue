<script setup lang="ts">
import ItemIcon from './ItemIcon.vue'
import { useDragAndDrop } from '@/composables/useDragAndDrop.ts'

const { pointer, selected } = useDragAndDrop()
</script>

<template>
  <!-- The item riding the cursor, exactly as the inventory does it. It never
       takes pointer events, so `elementFromPoint` still finds the slot below. -->
  <ItemIcon
    v-if="selected && pointer.visible"
    class="held-item"
    :item="selected"
    :size="48"
    :style="{ left: `${pointer.x}px`, top: `${pointer.y}px` }"
  />
</template>
