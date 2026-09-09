<template>
  <!-- The crafting arrow is part of the GUI texture in the game, not a
       character, so it is drawn on the same pixel grid: 22 by 14, rendered at
       an exact 2x so every edge lands on a whole pixel. -->
  <svg
    class="craft-arrow"
    viewBox="0 0 22 14"
    width="44"
    height="28"
    aria-hidden="true"
    focusable="false"
  >
    <polygon
      points="0,5 13,5 13,0 22,7 13,14 13,9 0,9"
      fill="var(--slot)"
    />
  </svg>
</template>

<style scoped>
.craft-arrow {
  flex: none;
  shape-rendering: crispEdges;
}
</style>
