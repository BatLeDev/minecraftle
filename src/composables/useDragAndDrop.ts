import { ref } from 'vue'
import { useGame } from './useGame.ts'
import type { ItemId } from '@/utils/types.ts'

/** Where the held item is drawn, in viewport coordinates. */
const pointer = ref({ x: 0, y: 0, visible: false })

/** True between pressing a slot with a full hand and releasing. */
let armed = false

/** True once a drag has filled at least one slot, which empties the hand. */
let painted = false

/**
 * The slot this gesture took its item from, if any.
 *
 * Releasing back onto it must leave the item in hand: picking something up and
 * letting go without moving should not put it straight back.
 */
let pickedFrom: number | null = null

let listening = false

/**
 * Picking items up and putting them down, the way the real inventory works.
 *
 * Three behaviours, all of them from the game:
 *  - a held item follows the cursor everywhere, not only while a button is down;
 *  - clicking a slot swaps: what is held goes in, what was there comes out;
 *  - dragging across empty slots fills each one, then empties the hand.
 *
 * Everything goes through pointer events, so touch works too, and a release
 * outside the grid resets the gesture instead of losing the held item — that
 * last part is upstream issue #66, where the drag flag stayed set and the next
 * click threw the item away.
 */
export function useDragAndDrop () {
  const { selected, draft, status, placeAt, clearAt } = useGame()

  // The pointer is tracked on the window, because the held item has to follow
  // the cursor across the whole page, not just over the slots.
  if (!listening && typeof window !== 'undefined') {
    listening = true
    window.addEventListener('pointermove', event => {
      pointer.value = { x: event.clientX, y: event.clientY, visible: true }
    }, { passive: true })
    window.addEventListener('pointerup', () => {
      // A release anywhere ends the gesture. Without this the drag flag would
      // survive a release outside the grid and corrupt the next click.
      if (!armed) return
      armed = false
      pickedFrom = null
      if (painted) selected.value = null
      painted = false
    })
  }

  /**
   * Press on an ingredient: take it in hand, or put it back if already held.
   *
   * The gesture is armed, so dragging straight from the list onto a slot drops
   * it there, and sweeping across several fills each one.
   */
  function pressIngredient (item: ItemId) {
    if (status.value !== 'playing') return
    const alreadyHeld = selected.value === item
    selected.value = alreadyHeld ? null : item
    armed = !alreadyHeld
    painted = false
    pickedFrom = null
  }

  /**
   * Keyboard activation, which never arms a drag.
   *
   * Enter on a button fires a click, never a pointerdown, so the pointer path
   * alone would leave the ingredients unreachable without a mouse — and arming
   * here would leave the flag set with no release to clear it.
   */
  function toggleIngredient (item: ItemId) {
    if (status.value !== 'playing') return
    selected.value = selected.value === item ? null : item
  }

  /** Press on a slot: arm a possible drag, or pick the slot's item up. */
  function pressSlot (index: number) {
    if (status.value !== 'playing') return
    if (!selected.value) {
      const item = draft.value[index]
      if (!item) return
      selected.value = item
      clearAt(index)
      // Armed too, so the item can be carried straight to another slot.
      armed = true
      painted = false
      pickedFrom = index
      return
    }
    armed = true
    painted = false
    pickedFrom = null
  }

  /**
   * Moving over an empty slot with the button down fills it.
   *
   * Bound to both enter and move: the slot the gesture starts on never fires an
   * enter, since the pointer is already inside it.
   */
  function enterSlot (index: number) {
    if (!armed || !selected.value) return
    // The slot an item was just taken from must not be filled straight back in
    // by the very move that lifted it.
    if (index === pickedFrom) return
    // Past that slot, the gesture is a genuine drag rather than a pick-up.
    pickedFrom = null
    if (draft.value[index]) return
    placeAt(index)
    painted = true
  }

  /** Release over a slot: swap, unless the gesture already filled slots. */
  function releaseSlot (index: number) {
    if (status.value !== 'playing') return
    if (!armed) return
    armed = false
    if (painted) {
      painted = false
      pickedFrom = null
      selected.value = null
      return
    }
    if (pickedFrom === index) {
      // Taken from this very slot and let go without moving: keep it in hand.
      pickedFrom = null
      return
    }
    pickedFrom = null
    const previous = draft.value[index]
    placeAt(index)
    selected.value = previous ?? null
  }

  return { pointer, selected, pressIngredient, toggleIngredient, pressSlot, enterSlot, releaseSlot }
}
