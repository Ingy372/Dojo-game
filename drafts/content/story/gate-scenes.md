# C-STORY-e: Gate scenes, White to Brown/Black (DRAFT)

Data: `gate-scenes.json`. One short sentence per screen, ages 6-9. The real belt earned at the dojo opens each Gate. Guardian lines come from `guardian-arcs.json` and Sensei/Senpai hints from `mystery-ladder.json`. **visibleChange is a PLACEHOLDER waiting on C-STORY-f (town vs sign).** Black/summit is out of scope.

## white (lamp-keeper)
Visible change (placeholder): dojo window glows a little

1. **narrator**: Your new belt from the dojo opens the white Gate.
2. **narrator**: The first piece of light rises up the Tower.
3. **narrator**: Sensei glances at an old lantern, then smiles.
4. **sensei**: Let's train.

## yellow (sun-gardener)
Visible change (placeholder): flowers open in the dojo window box

5. **narrator**: Your new belt from the dojo opens the yellow Gate.
6. **guardian**: The thorns are gone. The storm wasn't my fault!
7. **narrator**: Flowers open along the stairs as the light rises.
8. **sensei**: Nobody broke it on purpose. How does that feel?

## orange (hearth-cook)
Visible change (placeholder): a warm lamp lights in the dojo kitchen

9. **narrator**: Your new belt from the dojo opens the orange Gate.
10. **guardian**: Is it supper time? I would love some company.
11. **narrator**: Sensei sets out one extra cup of tea, just in case.
12. **sensei**: Who would you save a seat for?

## green (stone-giant)
Visible change (placeholder): dojo window glows brighter

13. **narrator**: Your new belt from the dojo opens the green Gate.
14. **guardian**: I was stones and worry. Thank you for staying!
15. **narrator**: One by one, the worry stones roll away.
16. **sensei**: Worries feel smaller when we name them. *(faith: gate-green-screen-16)*

## blue (river-watcher)
Visible change (placeholder): the dojo pond turns clear and bright

17. **narrator**: Your new belt from the dojo opens the blue Gate.
18. **guardian**: The water is clear. I can see you now, friend.
19. **senpai**: Sensei used to climb with a friend. Sensei never says who.
20. **sensei**: Clear water helps you see who is beside you. *(faith: gate-blue-screen-20)*

## red (ember-knight)
Visible change (placeholder): a lantern lights over the dojo door

21. **narrator**: Your new belt from the dojo opens the red Gate.
22. **guardian**: I was guarding the wrong thing. Shields are for helping.
23. **narrator**: The Ember Knight steps aside, and the light rises.
24. **sensei**: What are you strong enough to protect? *(faith: gate-red-screen-24)*

## red-black (echo-mask)
Visible change (placeholder): dojo window glows brighter

25. **narrator**: Your new belt opens the red and black Gate.
26. **guardian**: I copied what I heard. Now I hear kindness.
27. **narrator**: Sensei rereads an old note, then tucks it away.
28. **sensei**: Keep climbing.

## brown (root-keeper)
Visible change (placeholder): a lamp lights on the dojo bookshelf

29. **narrator**: Your new belt from the dojo opens the brown Gate.
30. **guardian**: Take a book, little one. Your story belongs here too.
31. **narrator**: An old sash rests in the book, its name too faded to read.
32. **sensei**: Look how far you have come. *(faith: gate-brown-screen-32)*

## brown-black (storm-herald)
Visible change (placeholder): the whole dojo glows warm

33. **narrator**: Your new belt opens the brown and black Gate.
34. **guardian**: The wind is still. Listen. Someone is calling from the top.
35. **sensei**: They were my friend. Let's bring them home together. *(faith: gate-brown-black-screen-35)*
36. **narrator**: The light rises, and the whole dojo glows warm.

## Faith layer
Verses on green, blue, red, brown and brown/black screens are in `faith/guardian-faith-overlay.json` → `storyScreens` (KJV checked on bible-api.com, 2026-10-26). Story screens carry no Scripture.

## Notes for review
- New speaker `senpai` (Blue screen 19); the Programmer may need to support it.
- White scene overlaps chapter-1 screens 14-17; use one.
- Open for Jay: the Blue Senpai hint timing (asked in #335).
