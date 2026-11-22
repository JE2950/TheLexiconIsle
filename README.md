# The Lexicon Isle

A point-and-click verbal reasoning adventure for Years 4 to 6+, in the style of the early-1990s school adventures.

A storm wrecks your boat on Lexicon Isle. The Hush has stolen every word on the island and locked them behind six seals. Explore, talk to the islanders, collect what you need, and work the six machines that guard the Word Stones. Then take all six stones to the Keeper's Gate.

Open `index.html` in a browser. No install needed.

## How it plays
- **First-person screens.** Each place is one painted picture. Click the small flashing squares to look at things and talk to people. Click the white arrows to move on.
- **Narrated.** Every line appears in the panel at the bottom and is read aloud (Voice button, British voice where the device has one). **Go on** moves the story forward. 🔊 repeats a line.
- **Pockets.** Items you collect and the Word Stones you win sit in the panel at the bottom right. Some paths need an item: the caves need the lantern, the tower needs the brass key.
- **Machines.** Each seal is a contraption with chunky controls. A right answer fills a slot (turns a dial, lays a plank, fits a cog). A wrong answer gets a second try; if that is wrong too, the answer and its working are shown. **How?** shows the method. **Leave** keeps what you have done.
- **Stars** count answers right first time. The certificate at the end shows the pupil's name, stars and time.
- **Set Up** (as in the old games): year group, narrator, music, and **Start from** to jump to any place (earlier stones and items are given). Useful for teaching one skill.
- **Map**: Maren gives you a map. Use it to travel to places you have already visited.
- Keys: A–E or 1–5 to answer, Enter for Go on / Next, H for How?, M for the map.

## The route
| Place | Machine | Question group | Reward |
|---|---|---|---|
| Smugglers' Jetty | The Smugglers' Crates (5) | Finding words | Sea Stone, lantern |
| Lighthouse Village | Maren, the keeper | (story) | Map |
| Whispering Wood | The Signposts (5) | Building words | Leaf Stone |
| Echo Caves | The Stone Door (5 dials) | Codes and sequences | Ember Stone, brass key |
| The Gorge | The Rope Bridge (6 planks) | Vocabulary | Sky Stone |
| Clockwork Tower | The Great Gear (5 cogs) | Logic | Dusk Stone |
| Weaver's Hut | Ossian's Loom (6 threads) | Everything | Rose Stone |
| The Keeper's Gate | Riddles of the Gate (8, three lives) | Everything | The ending |

## Questions
The questions come from the Station Zero engine in the **VR** repo, copied here unchanged: `vr.js` (generators and answer controls), `bank.js` (dictionary-checked word puzzles), `atom.js` (the 187 hand-entered Atom Learning questions) and `gl_style.js` (GL-format questions). All 37 topics and the Year 4 / 5 / 6+ setting work as they do in Station Zero, and topics a pupil gets wrong come back more often. To update the questions, copy those four files across from the VR repo again.

## Files
- `index.html`: the window, styles and layout.
- `game.js`: the island, the story, the machines, narration, saving, Set Up and the map.
- `img/`: the ten painted scenes (made with Gemini).
- `music/theme.mp3`: optional. If it is there, it plays on a loop. If not, the game plays a small tracker-style tune of its own.

Progress saves in the browser (`localStorage`), one game per device and browser.
