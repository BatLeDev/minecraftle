/**
 * Regenerates everything under `src/data` and the item sprite atlas.
 *
 * Run it by hand (`npm run gen-data`) and commit the output: the build stays
 * offline and reproducible, and this only needs re-running when Minecraft ships
 * new items or recipes.
 *
 * Inputs live in `scripts/source/`, vendored from the upstream project so the
 * repository is self-contained — `items.json` in particular is the only place
 * the rendered inventory icons exist, since no public asset repository ships
 * the isometric block renders.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'

const root = (p: string) => fileURLToPath(new URL('../' + p, import.meta.url))

/** Minecraft's own language files, used for both display languages. */
const LANG_URL = (code: string) =>
  `https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft/lang/${code}.json`

/**
 * Side of one atlas cell, in pixels. 48 keeps the 16px sources on an exact x3
 * nearest-neighbour upscale, which is what preserves the pixel art; the handful
 * of larger sources are smooth renders that downscale fine.
 */
const CELL = 48

type SourceItem = { name: string, icon: string, stack: number }
type SourceRecipe = { type: string, group: string, output: string, input: (string | null)[][] }

type Names = { en: string, fr: string }

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

/**
 * Decodes one data URI. The source declares every icon as PNG but a couple are
 * actually GIF or WebP, so the declared media type is ignored and sharp is left
 * to sniff the real format.
 */
function decodeDataUri (icon: string): Buffer {
  const comma = icon.indexOf(',')
  if (comma === -1) throw new Error('not a data URI')
  return Buffer.from(icon.slice(comma + 1), 'base64')
}

async function main () {
  const items = JSON.parse(await readFile(root('scripts/source/items.json'), 'utf8')) as Record<string, SourceItem>
  const recipes = JSON.parse(await readFile(root('scripts/source/recipes.json'), 'utf8')) as Record<string, SourceRecipe>
  const overrides = JSON.parse(await readFile(root('scripts/source/name-overrides.json'), 'utf8')) as Record<string, Names>
  const ingredients = JSON.parse(await readFile(root('scripts/source/ingredients.json'), 'utf8')) as string[]

  const ids = Object.keys(items).sort()

  // --- names -------------------------------------------------------------
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

  // --- sprite atlas ------------------------------------------------------
  // A square-ish grid keeps the atlas close to a power of two and avoids a very
  // long strip, which some GPUs handle poorly as a background image.
  const cols = Math.ceil(Math.sqrt(ids.length))
  const rows = Math.ceil(ids.length / cols)
  const sprite: Record<string, [number, number]> = {}

  const tiles = await Promise.all(ids.map(async (id, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    sprite[id] = [col, row]

    const input = decodeDataUri(items[id].icon)
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
    create: {
      width: cols * CELL,
      height: rows * CELL,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(tiles)
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  await writeFile(root('src/assets/items.png'), atlas)

  // --- items -------------------------------------------------------------
  const outItems: Record<string, { name: Names, sprite: [number, number], stack: number }> = {}
  for (const id of ids) {
    outItems[id] = { name: names[id], sprite: sprite[id], stack: items[id].stack }
  }
  await writeFile(
    root('src/data/items.json'),
    JSON.stringify({ cell: CELL, cols, rows, items: outItems }, null, 2) + '\n'
  )

  // --- recipes -----------------------------------------------------------
  // Validated here rather than at runtime: a malformed recipe must break the
  // generation, never a player's game.
  const outRecipes: Record<string, { output: string, input: (string | null)[][] }> = {}
  for (const [key, recipe] of Object.entries(recipes).sort(([a], [b]) => a.localeCompare(b))) {
    const { input, output } = recipe
    if (!Array.isArray(input) || input.length === 0 || input.length > 3) {
      throw new Error(`recipe ${key}: expected 1 to 3 rows, got ${input?.length}`)
    }
    const width = input[0].length
    if (width === 0 || width > 3) throw new Error(`recipe ${key}: expected 1 to 3 columns, got ${width}`)
    for (const row of input) {
      if (row.length !== width) throw new Error(`recipe ${key}: ragged rows`)
      for (const cell of row) {
        if (cell !== null && !outItems[cell]) throw new Error(`recipe ${key}: unknown ingredient ${cell}`)
      }
    }
    if (!outItems[output]) throw new Error(`recipe ${key}: unknown output ${output}`)
    outRecipes[key] = { output, input }
  }
  await writeFile(root('src/data/recipes.json'), JSON.stringify(outRecipes, null, 2) + '\n')

  // --- ingredients -------------------------------------------------------
  // The palette the player builds from: a fixed shortlist, not the whole
  // catalogue, which is what keeps the puzzle tractable.
  for (const id of ingredients) {
    if (!outItems[id]) throw new Error(`ingredient ${id} is not a known item`)
  }
  await writeFile(root('src/data/ingredients.json'), JSON.stringify(ingredients, null, 2) + '\n')

  const atlasKb = (atlas.length / 1024).toFixed(0)
  console.log(`${ids.length} items → atlas ${cols}x${rows} of ${CELL}px (${atlasKb} kB)`)
  console.log(`${Object.keys(outRecipes).length} recipes and ${ingredients.length} ingredients validated`)
}

await main()
