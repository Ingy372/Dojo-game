# Street Smarts lessons 2-5: design (Jay approved, Nov 24)

**Ask (Jay, Nov 24):** "lets plan the next 4 street smart lessons, making a total of 5. i need to step away after the planning phase and you will do all the blender work, build everything, and add it to the live game."

**Topics (Jay: "Yes, these four"):** together the five lessons cover awareness, avoidance, de-escalation, escape and getting help.

| # | Lesson | Place | Ages | Teaches |
|---|---|---|---|---|
| 2 | Candy at the park | park | 6-9 | Say "No thank you", go straight to your grown-up, tell them |
| 3 | A ride from the bus stop | bus stop | 10-13 | Wait where people can see you, keep your distance, loud "NO!", tell the crossing guard |
| 4 | Picked on at recess | school playground | 6-9 | Stand tall, walk away, tell a teacher (a martial artist doesn't start fights) |
| 5 | A new friend online | living room | 10-13 | Keep private things private, stop chatting, tell your grown-up |

**Scripts:** approved as sent in chat (Jay: "Yes, build them"). The exact words are in `content/street-smarts/park-candy.json`, `busstop-ride.json`, `playground-teasing.json` and `home-online.json`. A few connecting lines were needed where the chat script showed only a picture, and Claude wrote them: "{player} steps back from the car.", "The car drives away.", "{player} walks away to friends.", "{player} closes the game.", "{grownup} is cooking in the kitchen." and "{player} is playing ball at recess." Jay didn't answer the three check questions (the "It's our secret" line, "Push them" as a wrong answer, and Sensei's end lines), so they went in as written.

**Approach (Claude's calls, the same format as the store):** each lesson is a cut scene in its own Blender place with the same camera and kit as the store. It stops only for 3 questions, one of which is a tap-a-person-or-place moment. A not-best answer is talked over, never acted out, and 3 stars are possible.

**What was built**
- Places: `incoming-art/claude-street-places/source/build_place.py` (park, bus stop, playground, home) and `make_game_place.py`, which writes `content/street-smarts/<place>-room.json`.
- People: the crossing guard (orange safety vest), the teacher (school badge), and three kids at the hero's size (`kid=True`) in `build_staff.py`. The park stranger reuses the shopper.
- The car is a cast prop (`"static:car"`) that the script drives in and out.
- New pop-ups: shout (the cue's own words, like "NO!"), message (a chat bubble over the tablet), ball and candy.
- The Mom/Dad question is asked per place ("Who's home with you?"), and skipped in a lesson with no grown-up (the playground).
- The camera stays inside each place.
- The lesson board in the Street Smarts House shows two columns, and the whole card is the Play button.
