<script setup lang="ts">
import { computed } from 'vue'
import atlasUrl from '@/assets/items.png'
import { atlas, items } from '@/utils/items.ts'

const props = withDefaults(defineProps<{ item: string, size?: number }>(), { size: 40 })

const meta = computed(() => items[props.item])

/**
 * One sprite out of the atlas, addressed by cell rather than loaded as its own
 * image: 144 icons in a single 53 kB request instead of 144 requests, and no
 * base64 data URI to blow the JSON up.
 */
const style = computed(() => {
  if (!meta.value) return { display: 'none' }
  const [col, row] = meta.value.sprite
  const size = props.size
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${atlasUrl})`,
    backgroundSize: `${atlas.cols * size}px ${atlas.rows * size}px`,
    backgroundPosition: `-${col * size}px -${row * size}px`
  }
})
</script>

<template>
  <span
    class="item-icon"
    :style="style"
    aria-hidden="true"
  />
</template>

<style scoped>
.item-icon {
  display: block;
  /* the icons are pixel art: never let the browser smooth them */
  image-rendering: pixelated;
  background-repeat: no-repeat;
  flex: none;
}
</style>
