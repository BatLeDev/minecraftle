# Minecraftle

A daily puzzle game fusing Wordle and Minecraft crafting recipes.

Guess the recipe of the day in ten tries. After each guess every slot is
coloured: green when that item belongs in that exact slot, yellow when the item
is in the recipe but somewhere else, grey otherwise.

A fork of [zachpmanson/minecraftle](https://github.com/zachpmanson/minecraftle),
rewritten as a static Vue 3 bundle with no backend and no database. See
[NOTICE.md](./NOTICE.md).

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit + end-to-end
npm run test-unit    # unit only, no browser
npm run quality      # lint, types, build, tests
```

## Data

Recipes, item names and the sprite atlas under `src/data` and `src/assets` are
generated and committed, so the build needs no network:

```bash
npm run gen-data
```

It reads the vendored recipes and icons from `scripts/source/`, pulls the
official Minecraft item names for English and French from
[misode/mcmeta](https://github.com/misode/mcmeta), and stitches the icons into a
single sprite atlas. Re-run it only when the recipe set changes.

## Licence

AGPL-3.0-only, inherited from the upstream project.
