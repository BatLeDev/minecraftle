# Open questions and findings

Points parked during the rewrite, and what was measured about them.

## Settled

- **Deployment**: GitHub Pages, default project URL for now. A custom domain
  (`minecraftle.staging-koumoul.com`) would need a CNAME to `<account>.github.io`
  on the Koumoul zone, overriding the `*.staging-koumoul.com` wildcard that
  points at `146.59.240.102`. The base path already comes from the Pages
  configuration, so switching later needs no change to the build.
- **Repository**: public, which the AGPL requires once the instance is reachable
  (section 13), and which also lets Kubernetes pull a public image if the
  Kubernetes route is ever revived.
- **Name and assets**: kept as they are. See NOTICE.md.
- **Upstream**: no pull request back; this stays a personal fork.
- **Theme**: dark only, plus the high-contrast variant.
- **Hints**: the original's generous green is kept; only the frozen placement is
  gone. See the commit message on `fix: keep the original's generous green`.

## Findings on the ingredient palette

Asked: how were the 18 base ingredients chosen, and could a mode offer more?

**How they were chosen: by hand, with no stated criterion.**
`conversion_scripts/change_puzzles.py` upstream is an interactive prompt where a
developer typed `add <item>` and `remove <item>`. The list was revised several
times ("Update given items" in the history). There is no algorithm behind it.

**The recipe list follows mechanically.** `convert_recipes.py` keeps only
`crafting_shaped` and `crafting_shapeless` recipes whose every ingredient is in
the palette, after collapsing Minecraft's tags onto one representative — every
wood to `minecraft:planks`, every wool to `white_wool`, every stone to
`cobblestone`.

**The catalogue is already almost complete.** Measured against Minecraft
snapshot 26.3-pre-3 (1,202 crafting recipes), 135 distinct puzzle shapes are
buildable from the 18 ingredients. The game holds 132, so three are missing —
including `white_wool_slab` and `white_wool_stairs`, which are recent additions.

**Growing the palette pays poorly.** The best single addition is
`copper_ingot` at +10 recipes; everything else is +6 or less. Greedily adding
ten ingredients takes the catalogue from 135 to 186, and almost every addition
is a stone family — polished blackstone, diorite, andesite, deepslate — whose
recipes are the same stairs-and-slabs patterns over and over. The interesting
recipes are already in the game.

Two things worth doing regardless of any new mode:

- add the three missing recipes;
- pin the generation to a Minecraft *release* rather than a snapshot. `gen-data`
  currently reads a vendored recipe dump; pointing it at mcmeta's data branch at
  a pinned release would make the catalogue maintainable instead of frozen.

## Still open

- **Audio.** The original shipped a music track, commented out in the layout and
  never played. Not carried over.
- **Analytics.** Google Analytics was removed and nothing replaced it.
- **Accessibility.** Keyboard navigation and labels are in place, but no proper
  RGAA pass has been done: measured contrasts, tab order, focus handling in
  dialogs, live announcements.
- **Number of tries.** Ten, as upstream.
