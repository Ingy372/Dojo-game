# Download size check (CW-4), Nov 25

Measured by Claude Code on a fresh build of `main` (`npm run build`).

## The short version

- **The whole game is 235 MB.** Art is 225 MB of that, sound 7.5 MB, and the game's code about 2 MB (0.6 MB once compressed).
- **In a browser, a player never downloads all of it.** Each screen loads only the art it needs, and only for the player's own look (one hair style, one outfit), so the first screen is a few MB.
- **Fixed today:** every Tower climb used to load all the monster art for every belt (about 30 MB), even for a white belt. Now each room loads only its own monsters, anything they call in or split into, and the boss's later forms. A white belt now skips about 21 MB of Orange belt art, and the 8 MB Floor Keeper second form loads only in the boss room.
- **The real problem is the phone app.** An app from the store contains every file up front, so it would be about 235 MB. Apple asks before a download over 200 MB on mobile data, and parents notice big apps. It is worth shrinking before the store builds (B-CI).

## Where the 225 MB of art goes

| What | Size | Why so big |
|---|---|---|
| Hair styles | 68 MB | Every style × 2 bodies × the normal and kata animations |
| Monsters | 50 MB | The White belt monsters alone are 20 MB (rendered at double sharpness, Jay's "sharper and bigger", Nov 18). The Hearth Cook's three forms are 19 MB. |
| Outfits | 36 MB | 10 outfits × 2 bodies |
| Hats and back pieces | 22 MB | |
| Other player art | 19 MB | Body, turns, faces |
| Everything else | 16 MB | Town, dojo, props, icons |
| Kata animations | 12 MB | |
| Tower floors | 1 MB | |

## Ideas to shrink the phone app (not done: each one changes how art looks or works, so Jay decides)

1. **Download extra looks on first use.** Keep the starting looks in the app and fetch the rest (outfits, hats, hair styles) the first time a player picks one. This cuts the most (about 100 MB) and the art isn't touched. It needs the game server or a file host, so it fits with the server milestone.
2. **Pack the art a little smaller.** Slightly stronger compression and trimming the empty space around frames, checked side by side on a phone so Jay can say whether he sees a difference. Likely 20–40% smaller.
3. **Load belt art per belt in the app too.** Ship White and Yellow, and fetch the Orange art (and later belts) on the first climb there. This matches CLAUDE.md's "load art per tier".

Claude suggests 2 first (cheap, and Jay can judge it on his phone), then 1 when the server work starts.
