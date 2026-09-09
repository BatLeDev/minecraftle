# Notices

## Upstream project

This is a modified fork of [Minecraftle](https://github.com/zachpmanson/minecraftle)
by Zach Manson, Harrison Oates, Tamura Boog and Ivan Sossa, licensed under the
GNU Affero General Public License v3.0.

The game was rewritten on a different stack (Vue 3 + Vuetify + Vite, no backend
and no database, where the original used Next.js with tRPC, Prisma and
PostgreSQL). The crafting recipes and the item icons under `scripts/source/`
come from that project unchanged.

As required by the AGPL, this fork keeps the same licence and its source is
public. Section 13 in particular means anyone playing a deployed instance is
entitled to its source — the link in the page footer serves that purpose.

## Fonts

**Minecraftia** by Andrew Tyler (<https://www.andrewtyler.net>) is used for the
interface text. The upstream project's Minecraft font has no accented capitals
and is missing several accented lowercase letters, which French needs
constantly; Minecraftia covers the whole of Latin-1.

Its author states: *"Free for personal use. For commercial use, including apps,
a commercial licence is required."* This fork is a personal, non-commercial
project and is used on those terms.

Note that this is narrower than the AGPL-3.0 under which the rest of this
repository is published: the AGPL lets any recipient redistribute and use the
work commercially, and the font's terms do not. **Anyone reusing this repository
for anything commercial must replace the font first**, or obtain a licence from
its author. A drop-in substitute under the SIL Open Font Licence is
[Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans).

**Minecrafter Cracked**, used for the title, comes from the upstream project.

## Minecraft assets

Item icons, item names and the name "Minecraft" belong to Mojang Studios. Item
names are generated from the official language files mirrored by
[misode/mcmeta](https://github.com/misode/mcmeta). This project is unofficial
and not affiliated with or endorsed by Mojang Studios.
