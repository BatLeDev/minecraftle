# Work in progress

Handover note for picking this up on another machine. Everything described here
is committed and pushed to `master`; `npm run quality` passes (94 tests).

## Where the work stands

The game is complete and deployed at <https://batledev.github.io/minecraftle/>.
What is unfinished is a **visual fidelity pass**: making the interface match the
real Minecraft crafting window pixel for pixel, rather than approximating it.

The last committed step replaced every guessed colour and length in
`src/styles/main.css` with values sampled from the game's own GUI textures. That
part is done. Three things are not.

## Reference values, sampled from the game

Taken from `misode/mcmeta` at tag `26.2-assets`, so they can be checked again:

- `assets/minecraft/textures/gui/container/crafting_table.png` (176x166 used)
- `assets/minecraft/textures/gui/sprites/widget/button.png` (200x20)
- `assets/minecraft/textures/gui/sprites/widget/button_highlighted.png`

| Element | Texture value |
|---|---|
| Panel body | `#c6c6c6` |
| Panel edges | 1px `#000000`, then 2px `#ffffff` top/left and 2px `#555555` bottom/right |
| Slot body | `#8b8b8b` |
| Slot bevel | 1px `#373737` top/left, 1px `#ffffff` bottom/right |
| Slot size | 18px input, 26px result — the result slot has **no** extra frame |
| Grid position | slots at x=29, y=16; 18px pitch, touching |
| Arrow | 22x15 at x=90, y=35, fill `#8b8b8b`; **shaft only 3px tall**, head base at x=104 tapering right |
| Gaps | grid to arrow 7px, arrow to result 11px; left margin 26px, right 24px |
| Button | 1px `#000000` border, 1px `#aaaaaa` top/left, body `#6f6f6f`, 1px `#565656` right and 2px bottom |
| Button hovered | border `#ffffff`, top/left `#afafaf`, body `#757575`, shadow `#5c5c5c` |
| Button text | `#e0e0e0`, hovered `#ffffa0`, disabled `#a0a0a0`; shadow is the colour times 0.25 |

Sampling script pattern (sharp is already a devDependency):

```js
const { data, info } = await sharp(file).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true })
const px = (x, y) => { const i = (y * info.width + x) * 4; return [data[i], data[i+1], data[i+2]] }
```

## The scale decision, and why it is mixed

Sprites and slots are drawn at **3x** the texture, chrome at **2x**.

That is deliberate, not an oversight. 57 of the 144 item icons are already 48px
isometric block renders and 80 are flat 16px textures, so a 48px atlas cell
copies the first group one for one and scales the second by exactly three — any
other cell size damages one group or the other (regenerating at 32px visibly
degraded the block renders). Slots therefore sit at 3x, 54px, to hold a 48px
sprite the way an 18px slot holds a 16px one.

A strict 3x of the whole 176px window would make each panel 528px wide, which
does not fit a phone. So the panel border, bevels and buttons stay at 2x and the
side margins are compressed. Every individual element is still an exact integer
multiple of its texture.

## What remains

1. **The arrow is not redrawn yet.** `src/components/CraftArrow.vue` still holds
   the earlier guessed shape (`viewBox="0 0 22 14"`, a 4-unit shaft, rendered
   44x28). The sampled geometry is a 22x15 grid with a **3px shaft** and the
   head base at 14 units, which as a polygon is
   `points="0,6 14,6 14,0 22,7.5 14,15 14,9 0,9"`; at 3x it renders 66x45, which
   also matches the slots' scale.
2. **The crafting row margins are not set to the sampled gaps.** `.crafting-table`
   in `CraftGrid.vue` still centres its content with a uniform gap instead of
   using 21px before the arrow and 33px after (7 and 11 at 3x).
3. **Type sizing is only half done.** Minecraftia is a bitmap face drawn for 12
   or 24 pixels, per its author's readme, and blurs at anything else. `body` is
   now 12px, but the footer still sets `0.7rem` (11.2px) and its lines are too
   tight, which is why the link underline collides with the line below — the
   open report on that is not fixed. Either move everything to 12px with more
   leading, or go to 24px, which would need one button per row.
4. `--icon-size` in `main.css` is unused: `ItemIcon` takes its size as a prop.
   Either wire it up or drop it.

## Open reports not yet addressed

- The footer link underline still collides with the following line (see 3).
- The favicon appears missing in dev. The markup and files are correct and are
  served with HTTP 200; it is a browser negative cache from before they were
  added. A hard reload clears it. No code change needed.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 94 tests, Playwright unit + e2e
npm run quality    # lint, types, build, tests
npm run gen-data   # regenerates src/data and the sprite atlas; run by hand only
```

The original project is worth keeping alongside for comparison; it was cloned to
`../minecraftle-source`.
