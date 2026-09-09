# Extending the ingredient palette — work in progress

**Status: investigation only. Nothing under `src/` or `scripts/` has been
changed yet.**

The question this note answers: the game offers a 6x3 palette of 18
ingredients; which three extra ingredients would unlock the largest number of
genuinely interesting recipes?

## Where things stand

`src/data/ingredients.json` holds 18 ingredients and `src/data/recipes.json`
holds 132 recipes. `gen-data` keeps a recipe only when every one of its
ingredients is in the palette *and* the result has a vendored icon.

Running the same parsing rules over the pinned mcmeta release (26.2, 1585
recipe files) gives:

| stage | count |
| --- | --- |
| shaped or shapeless, all ingredients resolvable, fits the grid | 993 |
| after collapsing mirrored/duplicate grids | 807 |
| reachable with today's 18 ingredients | 133 |
| locked behind at least one missing ingredient | 674 |

Of those 674, **402 need exactly one new ingredient** and 268 need two, so the
palette — not the recipe set — is what is small.

### The blocker nobody expected

`scripts/source/items.json` only vendors **144 icons**, and that set is very
nearly the exact closure of the current 18 ingredients. Wheat, sugar, paper,
feather, flint, obsidian, emerald, copper ingot, bamboo — none of them have an
icon. Since `gen-data` drops any recipe whose result has no icon, and refuses
to build at all when an *ingredient* has no icon, **no ingredient can be added
until the icon set is extended**.

So the work splits in two:

1. extend `scripts/source/items.json` with the icons for the chosen items (and
   for everything those items unlock as a result);
2. add the ids to `scripts/source/ingredients.json` and re-run `npm run gen-data`.

Step 1 is the real cost. Upstream (`zachpmanson/minecraftle`) is where the
current icons come from; a wider set has to be rendered or sourced elsewhere.

## Ranking, raw

Counting bluntly, the best single additions are:

| new ingredient | recipes unlocked alone |
| --- | --- |
| `copper_ingot` | 10 |
| `diorite` | 6 |
| `polished_blackstone` | 6 |
| `andesite`, `blackstone`, `cinnabar`, `tuff`, `sandstone`, `granite`, … | 4 each |

And the best raw triple is `diorite + copper_ingot + polished_blackstone` at
22 recipes.

That ranking is misleading. Every stone family contributes the same three
shapes — slab, stairs, wall — so `diorite` and `tuff` and `sandstone` all
"unlock four recipes" that are the identical puzzle four times over. For a
guessing game those are filler, and worse, near-duplicate answers make the
daily puzzle ambiguous.

## Ranking, decorative variants excluded

Dropping outputs matching `_slab | _stairs | _wall | _button |
_pressure_plate | ^polished_ | ^cut_ | _bricks$ | ^waxed_`:

| new ingredient | recipes unlocked alone |
| --- | --- |
| `copper_ingot` | 10 — copper bars, block, door, trapdoor, nugget, full armour set, lightning rod |
| `honeycomb` | 3 — beehive, candle, honeycomb block |
| `brick` | 3 — bricks, flower pot, decorated pot |
| `amethyst_shard` | 2 — amethyst block, tinted glass |
| `iron_block` | 2 — anvil, iron ingot |
| `blaze_rod` | 2 — blaze powder, brewing stand |
| `lapis_lazuli` | 2 — blue dye, lapis block |
| `bone_meal` | 2 — bone block, white dye |

**Best triple: `copper_ingot + amethyst_shard + honeycomb` → 16 recipes.**

    amethyst_block, beehive, candle, copper_bars, copper_block, copper_boots,
    copper_chestplate, copper_door, copper_helmet, copper_leggings,
    copper_nugget, copper_trapdoor, honeycomb_block, lightning_rod, spyglass,
    tinted_glass

`spyglass` is the reason this triple beats the alternatives: it is the one
recipe that needs *two* of the three new ingredients at once, so the three pull
together instead of sitting in separate corners of the palette.

`copper_ingot + amethyst_shard + brick` also reaches 16 (flower pot, decorated
pot and bricks instead of the bee family). Honeycomb is the better pick if the
armour-shape repetition is a worry, brick if recognisability is.

### Why copper is the standout

Copper is a full material tier the palette is missing: it reuses the ingot
shapes the player already knows (armour, door, trapdoor, bars) with a different
material, which is exactly the kind of near-miss a Wordle-like puzzle wants.
The cost is that copper armour shares its shapes with iron and gold armour,
which already exist — the puzzle stays solvable but the shape alone stops being
a tell.

## Open questions

- The 6x3 grid is full. Do three more ingredients become 7x3, 6x4, or does
  something get dropped?
- `InventoryPanel.vue` lays the palette out; check it does not hardcode 18.
- Copper armour makes four ingots ambiguous by shape. Acceptable, or a reason
  to prefer non-armour additions?
- The parser drops any recipe carrying a tag absent from `TAGS` in
  `gen-data.ts` (`#minecraft:eggs`, and others). Adding tag mappings is a
  second, independent way to widen the recipe set — not yet measured.

## Reproducing the numbers

Not committed as a script yet. It clones the pinned recipe data and re-uses
`gen-data.ts`'s own `collapse` / `ingredientIds` / `toGrid` / `canonical`
helpers, then:

```js
// a recipe is reachable under palette P when every cell is in P
const avail = P => recipes.filter(r =>
  r.cells.every(c => P.has(c)) && r.sets.every(s => s.some(i => P.has(i))))

// what a locked recipe is missing
const need = r => r.cells.filter(c => !palette.has(c))

// brute force every triple over the ids that appear in a need of size <= 3
```

Re-running it against a newer `MC_VERSION` will shift the counts.
