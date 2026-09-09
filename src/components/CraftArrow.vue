<template>
  <!-- The crafting arrow is part of the GUI texture in the game, not a
       character, so it is drawn on a pixel grid rather than typed. -->
  <svg
    class="craft-arrow"
    viewBox="0 0 22 16"
    width="48"
    height="35"
    aria-hidden="true"
    focusable="false"
  >
    <polygon
      points="0,4 11,4 11,0 22,8 11,16 11,12 0,12"
      fill="var(--slot-background)"
    />
  </svg>
</template>

<style scoped>
.craft-arrow {
  flex: none;
  shape-rendering: crispEdges;
}
</style>
