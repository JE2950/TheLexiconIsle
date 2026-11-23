# The Lexicon Isle

A point-and-click verbal reasoning adventure for Years 4 to 6+, in the style of the early-1990s school adventures.

A storm wrecks your boat on Lexicon Isle. A villain has stolen every word on the island and hidden them in six treasures. Explore painted first-person scenes, talk to the islanders, collect items, solve the puzzle machines that guard each treasure, then take all six to the summit for the final riddles.

Open `index.html` in a browser. No install, no build step.

## Every voyage is a different island
`js/story.js` builds each island from a seed number (shown as **Island No.**). From that seed it chooses:
- the **villain and treasure** (the Hush and the Word Stones, the Word Thief and the Rune Feathers, and others), with names and colours shuffled;
- the **route**: which places appear and in what order between the jetty, the village and the final location;
- which **question group** guards each machine (Finding words, Building words, Codes and sequences, Vocabulary, Logic, and one mixed round);
- **locks and keys**: some paths are dark, locked, foggy or boarded up, and the item that opens them is hidden as an earlier puzzle reward or given by a character you meet earlier;
- where the **wandering characters** turn up and what they say.

The same number always builds the same island, so a teacher can give a class one number (Set Up → Island). `tools/test_story.js` builds thousands of islands and checks every one can be finished.

## How it plays
- **Small flashing squares** mark things to click: things to look at (a caption pops up), people (a conversation opens with their portrait), and puzzles (the machine opens).
- **White arrows** move you on or back. A blocked path tells you why.
- **Go on ▶** moves the narration on. Everything is read aloud (Voice button; a British voice where the device has one).
- **Hint** says what to do next and makes the right square or arrow glow for a moment.
- **Machines**: a right answer fills a slot (turns a dial, lays a plank, fits a cog). A wrong answer gets one more try, then the answer and its working are shown. **How?** gives the method. **Leave** keeps what you have done.
- **The final riddles**: eight questions from every topic, three lives.
- **Stars** count answers right first time. The certificate shows the pupil's name, stars, island number and time.
- **Set Up**: year group, voice, music, sound effects, island number, **Start from** (jump to any place; earlier treasures and items are given), and a question record by topic.
- Keys: A to E answer · Enter = Go on / Next · H = How? · M = Map · Esc closes a window.

## Questions
The question engine is the Station Zero engine from the **VR** repo, copied unchanged into `js/vr/`: `vr.js` (generators and answer controls), `bank.js` (dictionary-checked word puzzles), `atom.js` (the hand-entered Atom Learning questions) and `gl_style.js` (GL-format questions). All 37 topics and the Year 4 / 5 / 6+ setting work as in Station Zero, and topics a pupil gets wrong come back more often. To update the questions, copy those four files across again.

## Files
- `index.html`: the window, layout and styles.
- `js/data.js`: everything the generator can choose from: premises, places, characters, items, lock text.
- `js/story.js`: the seeded island generator, text filling and a solvability check.
- `js/game.js`: the game: scenes, clicks, narration, conversations, machines, hints, saving, Set Up, map, ending, music and sound.
- `img/`: painted scenes; `img/ui/`: portraits and item icons (all made with Gemini).
- `music/theme.mp3`: optional. If present it loops; if not, the game plays its own tracker-style tune.

## What's on the island
- **Places:** Smugglers' Jetty (start), Lighthouse Village (hub), then five of Whispering Wood, Echo Caves, The Gorge, Clockwork Tower, Weaver's Hut, The Lamp Room, Harbour Market, The Windmill, The Ruined Abbey, The Shipwreck and The Observatory, ending at The Keeper's Gate or The Standing Stones.
- **Characters:** Maren the lighthouse keeper (gives the map), Ossian the weaver (lives in the hut), and Pip, Brother Aldo, Captain Rook and Nell, who turn up in different places each voyage, chat, and sometimes carry an item you need.
- **Items:** the map, a storm lantern (dark paths), a brass key (locked doors) and the weaver's shuttle.

## Adding a place, character or item
Each entry in `js/data.js` has `art: true` or `art: false`. Two are written and waiting for art: **The Glasshouse** (`img/glasshouse.jpg`) and four lock items, **rope, crowbar, compass and oil can** (`img/ui/rope.png` and so on, 128 × 128 on the dark brown background). Add the picture at the `img` path, check the hotspot and arrow positions against it, set `art: true`, and the generator starts using it. Then run the tests.

## Tests
- `node tools/test_story.js 3000` builds 3,000 islands and checks each can be finished and all text fills. Add `--all-art` to test with every planned place, character and item switched on.
- `python tools/playtest.py 1234 4821` plays whole islands through the real page with mouse clicks (needs `pip install playwright` and `python -m playwright install chromium`).

Progress saves in the browser (`localStorage`), one game per device and browser.
