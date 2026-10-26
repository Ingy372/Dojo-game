# Research note: textured and Black hair in stylized games (Batch 6, 2026-10-16)

Jay asked for this after the first samples: the afro read as a smooth "helmet". This note sums up what well-regarded games and community guides do, so our options follow good practice. **No game art was copied.** Our hair is built from our own simple 3D shapes in the house style.

## Sources

- **Code My Crown** (Dove with the Open Source Afro Hair Library; written by Black artists, stylists and academics): a free guide to Black hair textures and protective styles in games. [Guide page](https://www.dove.com/us/en/campaigns/purpose/code-my-crown.html), [PDF](https://assets.unileversolutions.com/v1/117113827.pdf), [GitHub](https://github.com/dove-us/code-my-crown). Styles it covers:
  - twist out, locs, Bantu knots, twists;
  - braided bob, cornrows, braids with a fade;
  - afro puff, afro with a fade.
- **Open Source Afro Hair Library:** https://afrohairlibrary.org/ (free 3D Black hair models and styling guidelines).
- **"More Than Killmonger Locs: A Style Guide for Black Hair (in Computer Graphics)",** ACM SIGGRAPH 2024 course: https://dl.acm.org/doi/abs/10.1145/3664475.3664535
- **Animal Crossing: New Horizons,** winter update 2020. It added an afro, afro puffs, cornrows, voluminous curls, a buzz cut with a fade, and a bald option. Black players widely welcomed it ("the afros follow the art style of the game but don't take away from the detail"), and loved that the puffs bounce.
  - [Medium / The Interlude](https://medium.com/the-interlude/why-animal-crossing-players-are-loving-their-new-hair-and-reactions-88b7f59fb587)
  - [Dexerto](https://www.dexerto.com/animal-crossing/why-animal-crossings-hairstyles-are-dividing-the-community-1460186/)
  - [Polygon on the "space buns" naming issue](https://www.polygon.com/2020/11/30/21734131/animal-crossing-space-buns-puffs-black-hairstyles-nintendo-switch/)
- **The Sims 4, Growing Together** (2023): hairstylist Lacy Redway designed box braids, an afro, short coils, afro puffs with front braids, and braided buns. She focused on coil texture, how braids leave the scalp, and baby hairs at the hairline. [Polygon](https://www.polygon.com/23696351/lacy-redway-black-hair-sims-4/)
- **Pokémon Scarlet/Violet:** a counter-example. Players criticised that only cornrows, a side fade and short locs were available, with no afro, puffs or box braids.
  - [The Mary Sue](https://www.themarysue.com/pokemon-scarlet-violet-black-hair-options-lacking/)
  - [Gamepur](https://www.gamepur.com/news/the-pokemon-community-expresses-disappointment-in-the-lack-of-hairstyle-inclusivity-in-scarlet-and-violet)
- **Spider-Man: Miles Morales** (Insomniac): Miles' fade was treated as a key representation task, with dedicated hair artists and cultural consultants. [Polygon video](https://www.polygon.com/videos/22484056/spider-man-miles-morales-dope-fade-polygon-video/), [Jayson Fitch](https://www.jaysonfitch.com/marvels-spiderman-miles-morales-grooms)
- **Not checked in detail:** Fortnite and Stardew Valley. I didn't find a good source on them, so I make no claims about them.

## What works (takeaways)

1. **Defined shapes, not one smooth shell.** In a simple art style, texture is suggested by clumps, coils or twists on the outline, with a few lighter tops (highlights). A smooth helmet is the most common complaint.
2. **Readable silhouettes.** Each style should be recognisable from its outline at small size:
   - an afro is a round cloud of clumps;
   - puffs are two round balls;
   - twists and locs are a spiky-soft outline of short, rounded tubes;
   - cornrows are neat raised lines;
   - a high-top is a tall flat top over short sides.
3. **A natural hairline:** soft and slightly uneven, with small coils at the edge. Not a hard cut straight across the forehead. The Sims work stresses baby hairs and how braids leave the scalp.
4. **A range of styles, not one token afro:** puffs, coils, twists and locs, braids and cornrows, fades and high-tops. Several should suit girls too (Pokémon was criticised for this).
5. **Neutral options for everyone, with respect for the context.** All options are open to every player. The *names* matter, though: for example, "afro puffs", not "space buns". Naming is Jay's and the Content Writer's call (see DECIDE).
6. **Movement:** puffs that bounce were a highlight in Animal Crossing. Our hair is rigid on the head bone for now; a small bounce would be a later idea (DECIDE).

## How we applied it

- **`hair-04`, the afro (redesigned):** a round core covered with about 70 soft coil clumps, some with lighter tops, and a softly scalloped hairline of small coils above the brows.
- **New options:**
  - `hair-09`: two puffs;
  - `hair-10`: short twists;
  - `hair-11`: cornrows into braids at the back;
  - `hair-12`: a high-top fade.
- **The same tinted-layer system:** two neutral greys (base and highlight) still take one multiply tint.
- **Checks:** every hairline stays above the brows (the eyes are never covered), and the forehead stays free for a headband.
