import data from '@/data/items.json' with { type: 'json' }
import ingredientsData from '@/data/ingredients.json' with { type: 'json' }
import type { Locale } from '@/composables/useOptions.ts'
import type { ItemId } from './types.ts'

export type ItemMeta = {
  name: Record<Locale, string>
  /** Column and row of this item in the sprite atlas. */
  sprite: [number, number]
  stack: number
}

export const atlas = { cell: data.cell, cols: data.cols, rows: data.rows }

export const items = data.items as unknown as Record<ItemId, ItemMeta>

/** The shortlist a player builds from, rather than the whole catalogue. */
export const ingredients = ingredientsData as ItemId[]

export function itemName (id: ItemId, locale: Locale): string {
  return items[id]?.name[locale] ?? id
}
