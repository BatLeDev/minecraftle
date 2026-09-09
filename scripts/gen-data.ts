/**
 * Regenerates everything under `src/data` and the item sprite atlas.
 *
 * Run it by hand (`npm run gen-data`) and commit the output. Neither the build
 * nor the CI ever runs it, and the game itself never fetches anything at
 * runtime — the upstream data sources are contacted only when a developer
 * deliberately regenerates, which keeps the load on them to essentially nothing.
 *
 * Sources:
 *  - recipes and item names: misode/mcmeta, pinned to a Minecraft release below;
 *  - item icons: `scripts/source/items.json`, vendored from the upstream project.
 *    These are the rendered inventory icons, which no public asset repository
 *    ships — mcmeta has flat textures, but a block's inventory icon is an
 *    isometric render.
 *
 * To follow a new Minecraft version, bump MC_VERSION, re-run, and review the
 * diff. Recipes whose result has no vendored icon are reported and skipped.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'

/** The Minecraft release the data is pinned to. A release, never a snapshot. */
const MC_VERSION = '26.2'

const MCMETA = 'https://github.com/misode/mcmeta'
const LANG_URL = (code: string) =>
  `https://raw.githubusercontent.com/misode/mcmeta/${MC_VERSION}-assets/assets/minecraft/lang/${code}.json`

const root = (p: string) => fileURLToPath(new URL('../' + p, import.meta.url))

/**
 * Side of one atlas cell, in pixels, and the size a sprite is drawn at.
 *
 * 48 is the best the source material allows: 57 of the icons are already 48px
 * isometric block renders, so they are copied one for one, and the 80 that are
 * flat 16px textures scale up by exactly three. Anything smaller would squash
 * the renders, anything larger would blur them.
 */
const CELL = 48

/**
 * Minecraft spells out every wood species and wool colour, but the puzzle treats
 * them as one ingredient — otherwise the same shape would appear a dozen times
 * under different names. Each family collapses onto one representative.
 */
const WOOD = /^(oak|spruce|birch|jungle|acacia|dark_oak|mangrove|cherry|pale_oak|poplar|bamboo|crimson|warped)_/

/** Item tags, matched as a substring, mapped to the same representatives. */
const TAGS: Record<string, string> = {
  planks: 'minecraft:planks',
  wooden_slabs: 'minecraft:oak_slab',
  logs: 'minecraft:oak_log',
  wool: 'minecraft:white_wool',
  coals: 'minecraft:coal',
  stone_tool_materials: 'minecraft:cobblestone',
  stone_crafting_materials: 'minecraft:cobblestone',
  stone: 'minecraft:cobblestone',
  wooden_tool_materials: 'minecraft:planks',
  iron_tool_materials: 'minecraft:iron_ingot',
  gold_tool_materials: 'minecraft:gold_ingot',
  diamond_tool_materials: 'minecraft:diamond'
}

type SourceItem = { name: string, icon: string, stack: number }
type Names = { en: string, fr: string }
type Cell = string | null
type Recipe = { output: string, input: Cell[][] }

// --- upstream data -------------------------------------------------------

/**
 * Checks out just the recipe folder of a pinned release.
 *
 * A sparse, blobless clone rather than the full repository: the data branch is
 * ~50 MB and all we need is one directory of small JSON files.
 */
function withRecipes<T> (use: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), 'mcmeta-'))
  try {
    execFileSync('git', [
      '-c', 'advice.detachedHead=false',
      'clone', '--depth', '1', '--branch', `${MC_VERSION}-data`,
      '--filter=blob:none', '--sparse', '--quiet', MCMETA, dir
    ], { stdio: ['ignore', 'ignore', 'inherit'] })
    execFileSync('git', ['sparse-checkout', 'set', '--no-cone', 'data/minecraft/recipe'],
      { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] })
    return use(join(dir, 'data/minecraft/recipe'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function fetchLang (code: string): Promise<Record<string, string>> {
  const res = await fetch(LANG_URL(code))
  if (!res.ok) throw new Error(`${LANG_URL(code)} → HTTP ${res.status}`)
  return res.json() as Promise<Record<string, string>>
}

/**
 * Minecraft splits its translation keys between items and blocks with no marker
 * on the id itself, so both namespaces are tried before giving up.
 */
function translate (lang: Record<string, string>, id: string) {
  const short = id.replace(/^minecraft:/, '')
  return lang[`item.minecraft.${short}`] ?? lang[`block.minecraft.${short}`]
}

// --- recipes -------------------------------------------------------------

function collapse (id: string): string {
  const short = id.replace('minecraft:', '')
  if (WOOD.test(short)) {
    if (short.endsWith('_planks')) return 'minecraft:planks'
    if (/_(log|wood|stem|hyphae)$/.test(short)) return 'minecraft:oak_log'
    if (short.endsWith('_slab')) return 'minecraft:oak_slab'
  }
  if (short.endsWith('_wool')) return 'minecraft:white_wool'
  return id
}

/** Every item id an ingredient accepts, after collapsing. Empty means unusable. */
function ingredientIds (value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(ingredientIds)
  let id = value
  if (id && typeof id === 'object') {
    id = (id as Record<string, unknown>).item ?? (id as Record<string, unknown>).tag ?? (id as Record<string, unknown>).id
  }
  if (typeof id !== 'string') return []
  if (id.startsWith('#')) {
    for (const [tag, item] of Object.entries(TAGS)) if (id.slice(1).includes(tag)) return [item]
    return []
  }
  return [collapse(id)]
}

/** Lays a recipe out as the compact grid the game stores. */
function toGrid (recipe: Record<string, any>, type: string): Cell[][] | null {
  if (type === 'crafting_shaped') {
    const keys = Object.fromEntries(
      Object.entries(recipe.key ?? {}).map(([k, v]) => [k, ingredientIds(v)[0] ?? null])
    )
    const pattern: string[] = recipe.pattern ?? []
    if (!pattern.length) return null
    const width = Math.max(...pattern.map(row => row.length))
    return pattern.map(row => [...row.padEnd(width)].map(c => keys[c] ?? null))
  }
  // A shapeless recipe has no layout; the game lays it out on one row, so
  // anything that would not fit is out of reach of a 3x3 puzzle anyway.
  const ingredients = (recipe.ingredients ?? []).map((v: unknown) => ingredientIds(v)[0] ?? null)
  return ingredients.length > 0 && ingredients.length <= 3 ? [ingredients] : null
}

/** A grid's identity, ignoring the mirroring the game accepts. */
function canonical (grid: Cell[][]): string {
  const straight = JSON.stringify(grid)
  const mirrored = JSON.stringify(grid.map(row => [...row].reverse()))
  return straight < mirrored ? straight : mirrored
}

/**
 * Which name to keep when several recipes collapse onto the same grid.
 *
 * Collapsing wood and wool makes a dozen recipes identical, so the name of the
 * representative species is preferred — `oak_door` rather than `acacia_door` —
 * which is also what keeps the catalogue stable across regenerations.
 */
function rank (name: string): number {
  if (name.startsWith('oak_')) return 0
  if (name.startsWith('white_')) return 1
  if (name.startsWith('stone_')) return 2
  return 3
}

function readRecipes (dir: string, palette: Set<string>) {
  const best = new Map<string, { name: string, output: string, input: Cell[][] }>()

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const recipe = JSON.parse(readFileSync(join(dir, file), 'utf8'))
    const type = String(recipe.type ?? '').replace('minecraft:', '')
    if (type !== 'crafting_shaped' && type !== 'crafting_shapeless') continue

    const parts = type === 'crafting_shaped'
      ? Object.values(recipe.key ?? {})
      : (recipe.ingredients ?? [])
    const ingredients = (parts as unknown[]).map(ingredientIds)
    if (!ingredients.length || ingredients.some(ids => ids.length === 0)) continue
    // Every ingredient must be one the player is offered, or the puzzle is unsolvable.
    if (!ingredients.every(ids => ids.some(id => palette.has(id)))) continue

    const input = toGrid(recipe, type)
    if (!input || input.flat().every(cell => cell === null)) continue

    const name = file.slice(0, -5)
    const output = recipe.result?.id
    if (typeof output !== 'string') continue

    const key = canonical(input)
    const previous = best.get(key)
    if (!previous || rank(name) < rank(previous.name) ||
      (rank(name) === rank(previous.name) && name < previous.name)) {
      best.set(key, { name, output, input })
    }
  }
  return [...best.values()]
}

// --- main ----------------------------------------------------------------

async function main () {
  const items = JSON.parse(await readFile(root('scripts/source/items.json'), 'utf8')) as Record<string, SourceItem>
  const overrides = JSON.parse(await readFile(root('scripts/source/name-overrides.json'), 'utf8')) as Record<string, Names>
  const ingredients = JSON.parse(await readFile(root('scripts/source/ingredients.json'), 'utf8')) as string[]
  const palette = new Set(ingredients)
  const ids = Object.keys(items).sort()

  console.log(`Minecraft ${MC_VERSION}`)

  // --- recipes ---------------------------------------------------------
  const candidates = withRecipes(dir => readRecipes(dir, palette))
  const outRecipes: Record<string, Recipe> = {}
  const skipped: string[] = []
  for (const { name, output, input } of candidates.sort((a, b) => a.name.localeCompare(b.name))) {
    // No icon means nothing to show for the result, so the recipe is unusable.
    if (!items[output]) { skipped.push(`${name} (${output})`); continue }
    for (const cell of input.flat()) {
      if (cell !== null && !items[cell]) throw new Error(`recipe ${name}: no icon for ingredient ${cell}`)
    }
    outRecipes[name] = { output, input }
  }
  await writeFile(root('src/data/recipes.json'), JSON.stringify(outRecipes, null, 2) + '\n')

  // --- names -----------------------------------------------------------
  const [en, fr] = await Promise.all([fetchLang('en_us'), fetchLang('fr_fr')])
  const names: Record<string, Names> = {}
  const untranslated: string[] = []
  for (const id of ids) {
    const override = overrides[id]
    if (override?.en && override?.fr) { names[id] = override; continue }
    const e = translate(en, id)
    const f = translate(fr, id)
    if (!e || !f) { untranslated.push(id); continue }
    names[id] = { en: e, fr: f }
  }
  if (untranslated.length) {
    throw new Error(
      `no translation for ${untranslated.join(', ')} — add them to scripts/source/name-overrides.json`
    )
  }

  // --- sprite atlas ----------------------------------------------------
  // A square-ish grid keeps the atlas close to a power of two and avoids a very
  // long strip, which some GPUs handle poorly as a background image.
  const cols = Math.ceil(Math.sqrt(ids.length))
  const rows = Math.ceil(ids.length / cols)
  const sprite: Record<string, [number, number]> = {}

  const tiles = await Promise.all(ids.map(async (id, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    sprite[id] = [col, row]

    // The source declares every icon as PNG but a couple are actually GIF or
    // WebP, so the declared media type is ignored and sharp sniffs the format.
    const icon = items[id].icon
    const input = Buffer.from(icon.slice(icon.indexOf(',') + 1), 'base64')
    const meta = await sharp(input).metadata()
    // An exact integer upscale is the only case where nearest-neighbour is the
    // right choice; anything else is a smooth render and reads better resampled.
    const isPixelArt = meta.width != null && CELL % meta.width === 0 && CELL / meta.width >= 1
    const buffer = await sharp(input)
      .resize(CELL, CELL, {
        fit: 'contain',
        kernel: isPixelArt ? 'nearest' : 'lanczos3',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()
    return { input: buffer, left: col * CELL, top: row * CELL }
  }))

  const atlas = await sharp({
    create: { width: cols * CELL, height: rows * CELL, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite(tiles)
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  await writeFile(root('src/assets/items.png'), atlas)

  // --- items and ingredients -------------------------------------------
  const outItems: Record<string, { name: Names, sprite: [number, number], stack: number }> = {}
  for (const id of ids) outItems[id] = { name: names[id], sprite: sprite[id], stack: items[id].stack }
  await writeFile(
    root('src/data/items.json'),
    JSON.stringify({ cell: CELL, cols, rows, items: outItems }, null, 2) + '\n'
  )

  for (const id of ingredients) if (!outItems[id]) throw new Error(`ingredient ${id} is not a known item`)
  await writeFile(root('src/data/ingredients.json'), JSON.stringify(ingredients, null, 2) + '\n')

  console.log(`${ids.length} items → atlas ${cols}x${rows} of ${CELL}px (${(atlas.length / 1024).toFixed(0)} kB)`)
  console.log(`${Object.keys(outRecipes).length} recipes from ${ingredients.length} ingredients`)
  if (skipped.length) console.log(`skipped, no icon for the result: ${skipped.join(', ')}`)
}

await main()
