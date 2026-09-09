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
generated and committed:

```bash
npm run gen-data
```

Recipes and item names come from [misode/mcmeta](https://github.com/misode/mcmeta),
pinned to a Minecraft release by the `MC_VERSION` constant at the top of
`scripts/gen-data.ts`. Item icons come from `scripts/source/items.json`, vendored
from the upstream project — these are the rendered inventory icons, which no
public asset repository ships.

**Nothing reads mcmeta at build time or at runtime.** This script is run by hand
and its output is committed, so their servers are only contacted when a developer
deliberately regenerates. To follow a new Minecraft version, bump `MC_VERSION`,
re-run, and review the diff; recipes whose result has no icon are reported and
skipped.

## Licence

AGPL-3.0-only, inherited from the upstream project.
