<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <!-- Two elements, as upstream: the outer carries the texture and the black
       border, the inner the bevel and the text shadow. -->
  <button
    type="button"
    class="mc-button"
    :disabled="disabled"
  >
    <span class="title"><slot /></span>
  </button>
</template>
