/* ════════════════════════════════════════════════════════════════
   THE LEXICON ISLE · DATA
   Everything the story generator can choose from. To add a place,
   character or item: add an entry here with its art, set art: true,
   and the generator starts using it. Text may use {tokens}, filled in
   per island by story.js (see fill()).
   Coordinates are percentages of the 1024 × 768 picture.
   ════════════════════════════════════════════════════════════════ */

/* ── Premises: what has been stolen, by whom, and what you collect ── */
const PREMISES = [
  { id: 'hush', hues: ['sea-green', 'leaf-green', 'ember-orange', 'sky-blue', 'violet', 'rose-red'], villain: 'the Hush', arrive: 'rolled in with the fog', stolen: 'every word on the island', mute: 'None of us can speak',
    one: 'Word Stone', many: 'Word Stones', names: ['Sea', 'Leaf', 'Ember', 'Sky', 'Dusk', 'Rose'], colours: ['#3fe0b8', '#86e05a', '#ff9a3c', '#4fb3ff', '#c48bff', '#ff5a6e'],
    back: 'our voices will come back', heard: 'A single gull cries somewhere. Then silence again.' },
  { id: 'mist', hues: ['pearl-white', 'coral-pink', 'amber', 'azure', 'violet', 'jade-green'], villain: 'the Mumbling Mist', arrive: 'crept up from the sea', stolen: 'all the words in our mouths', mute: 'We have not said a word for three days',
    one: 'Letter Shell', many: 'Letter Shells', names: ['Pearl', 'Coral', 'Amber', 'Azure', 'Violet', 'Jade'], colours: ['#f4efe2', '#ff7f6b', '#ffb43c', '#3fa7ff', '#a77bff', '#2fd08a'],
    back: 'the island will find its voice again', heard: 'Somewhere a dog tries to bark. Nothing comes out.' },
  { id: 'thief', hues: ['gold', 'storm-grey', 'fire-red', 'frost-blue', 'shadow-purple', 'dawn-pink'], villain: 'the Word Thief', arrive: 'came on a black-sailed ship', stolen: 'every word, name and story we had', mute: 'He took our voices too',
    one: 'Rune Feather', many: 'Rune Feathers', names: ['Gold', 'Storm', 'Fire', 'Frost', 'Shadow', 'Dawn'], colours: ['#ffd23f', '#7fa4c8', '#ff5a36', '#9fe8ff', '#8a6bd8', '#ff9ec4'],
    back: 'every story on the island will be told again', heard: 'The wind moves the trees, but makes no sound.' },
  { id: 'storm', hues: ['silver', 'moss-green', 'flame-orange', 'sea-blue', 'twilight-purple', 'blossom-pink'], villain: 'the Silent Storm', arrive: 'broke over the island at midnight', stolen: 'every word and every song', mute: 'The storm swept our voices away',
    one: 'Song Pearl', many: 'Song Pearls', names: ['Moon', 'Moss', 'Flame', 'Wave', 'Twilight', 'Blossom'], colours: ['#e8ecff', '#7ccf6a', '#ff8a3c', '#3fc6e0', '#b48bff', '#ff7aa8'],
    back: 'the island will sing again', heard: 'Waves break on the rocks without a whisper.' },
];

/* ── Items. lock: the kind of obstacle the item gets you past ── */
const ITEMS = {
  map:     { n: "the island map", img: 'img/ui/map.png', art: true },
  lantern: { n: 'a storm lantern', img: 'img/ui/lantern.png', art: true, lock: 'dark' },
  key:     { n: 'a brass key', img: 'img/ui/key.png', art: true, lock: 'locked' },
  shuttle: { n: "a weaver's shuttle", img: 'img/ui/shuttle.png', art: true },
  rope:    { n: 'a coil of rope', img: 'img/ui/rope.png', art: true, lock: 'climb' },
  crowbar: { n: 'an iron crowbar', img: 'img/ui/crowbar.png', art: true, lock: 'boarded' },
  compass: { n: 'a brass compass', img: 'img/ui/compass.png', art: true, lock: 'fog' },
  oilcan:  { n: 'an oil can', img: 'img/ui/oilcan.png', art: true, lock: 'rusted' },
};
/* what a blocked path says, by lock type ({place} is where you are trying to go) */
const LOCKTEXT = {
  dark: 'The way to {place} is pitch black. You would need a light to go any further.',
  locked: 'The door to {place} is locked. You need a key.',
  climb: 'The way to {place} is up a sheer rock face. You would need a rope.',
  boarded: 'The way to {place} is boarded up with thick planks. You need something to lever them off.',
  fog: 'A thick fog hides the path to {place}. You would get lost without a compass.',
  rusted: 'The gate to {place} has rusted solid. A few drops of oil might free it.',
};

/* ── Characters. fixed: always lives in that scene (painted into it) ── */
const CHARS = {
  maren:  { n: 'Maren', title: 'the lighthouse keeper', face: 'img/ui/maren.jpg', art: true, fixed: 'village', slate: true },
  ossian: { n: 'Ossian', title: 'the weaver', face: 'img/ui/ossian.jpg', art: true, fixed: 'hut' },
  pip:    { n: 'Pip', title: 'the fisher girl', face: 'img/ui/pip.jpg', art: true },
  aldo:   { n: 'Brother Aldo', title: 'the librarian', face: 'img/ui/aldo.jpg', art: true },
  rook:   { n: 'Captain Rook', title: 'the old sailor', face: 'img/ui/rook.jpg', art: true },
  nell:   { n: 'Nell', title: 'the miller', face: 'img/ui/nell.jpg', art: true },
};
/* things a wandering character can say (they cannot speak, so they write or mime) */
const CHATTER = [
  'scribbles in the sand with a stick: "{villain} hid the last {one} at {final}. Nobody has been up there since."',
  'mimes a tall arch, then six round shapes, then points at you and gives a thumbs up.',
  'writes on the back of a fish label: "My grandmother said the {many} were made from the first words ever spoken here."',
  'points the way you came, then the way ahead, and holds up {left} fingers.',
  'draws a little picture of {villain}: a grey swirl with a wide, empty mouth. Then shudders.',
];

/* ── Places ──
   role 'start' | 'hub' | 'puzzle' | 'final'.
   exits.back / exits.fwd: where the arrows sit.  spot: where a visiting character stands.
   pz: the puzzle machine in this place.  looks: small squares to examine. */
const PLACES = {
  jetty: {
    role: 'start', name: "Smugglers' Jetty", short: 'JETTY', img: 'img/jetty.jpg', art: true,
    first: ['A storm blew all night. Your little rowing boat smashed onto the rocks, and you staggered up the shingle at dawn.',
      'This is Lexicon Isle. The air is cold and still. You call out, but no one answers. {heard}'],
    looks: [
      { x: 76, y: 56, n: 'Your boat', t: 'Your rowing boat lies on its side with a hole in the hull you could put your head through. It will not float again.' },
      { x: 91, y: 19, n: 'Lighthouse', t: 'A lighthouse stands on the headland. Its lamp is dark. A path leads round the rocks towards it.' },
      { x: 93, y: 71, n: 'Lobster pots', t: 'Empty lobster pots. Even the crabs seem to have gone quiet.' },
      { x: 13, y: 38, n: 'Overgrown path', t: 'A narrow path climbs into thick woods. It looks easy to get lost up there. Better to find someone who knows the way.' },
    ],
    pz: { x: 66, y: 64, n: "Smugglers' crates", title: "The Smugglers' Crates", slot: i => i + 1,
      intro: 'Five crates are nailed shut. Words are painted on the lids, and someone has scratched underneath: "Solve the lid and the crate springs open."',
      win: 'The fifth lid springs open. Wrapped in oilcloth inside is a {stone}, glowing {colour}.' },
    exits: { fwd: { x: 88, y: 88, d: 'right' } },
  },
  village: {
    role: 'hub', name: 'Lighthouse Village', short: 'VILLAGE', img: 'img/village.jpg', art: true,
    first: ['You follow the path round the rocks into a tiny fishing village. Smoke drifts from the chimneys, but the street is silent.',
      "An old woman in a lighthouse keeper's coat stands by the well, watching you."],
    looks: [
      { x: 37, y: 60, n: 'The well', t: 'You lean over the well and shout "Hello!" No echo comes back. Even the echoes have been taken.' },
      { x: 83, y: 55, n: 'Fishing nets', t: 'Nets hang drying on poles. Someone has knotted little labels onto them, but every label is blank.' },
      { x: 15, y: 44, n: 'Cottages', t: 'Faces watch you from the cottage windows. A girl waves. When she opens her mouth, no sound comes out.' },
      { x: 92, y: 87, n: 'Barrels', t: 'Barrels of salted fish. The words painted on the sides have faded to nothing.' },
    ],
    spot: { x: 53, y: 50 },
    exits: { back: { x: 50, y: 93, d: 'down' }, fwd: { x: 64, y: 40, d: 'up' } },
  },
  wood: {
    role: 'puzzle', name: 'Whispering Wood', short: 'WOOD', img: 'img/wood.jpg', art: true, locks: ['fog', 'boarded'],
    first: ['The path climbs into an old, old wood. The trees here used to whisper to travellers and tell them the way.',
      'Now they are silent, and the two signposts at the crossroads have lost their words.'],
    looks: [
      { x: 72, y: 36, n: 'Twisted trees', t: 'You put your ear to a tree trunk. Nothing. The wood is holding its breath.' },
      { x: 56, y: 72, n: 'Footprints', t: 'Fresh footprints in the mud. Big boots. They go both ways along the path. Someone else has been here.' },
    ],
    pz: { x: 33, y: 60, n: 'The signposts', title: 'The Signposts', slot: i => 'WORDS'[i],
      intro: 'You brush the moss off the signposts. Each board has empty slots where carved letters used to be. Build the words back and the signposts will remember the way.',
      win: 'The last letter clicks into place and the signposts swing round to point the way. A {stone} drops from a hollow in the oak above, glowing {colour}.' },
    spot: { x: 70, y: 58 },
    exits: { back: { x: 50, y: 94, d: 'down' }, fwd: { x: 93, y: 62, d: 'right' } },
  },
  cave: {
    role: 'puzzle', name: 'Echo Caves', short: 'CAVES', img: 'img/cave.jpg', art: true, locks: ['dark'],
    first: ['You step into the old mine. The rails lead deeper and deeper, then stop at a great round door of stone.',
      'Five brass dials are set into the middle of it, like a giant combination lock.'],
    looks: [
      { x: 83, y: 37, n: 'Hanging lantern', t: "A miner's lantern, still warm. Someone lit these candles not long ago." },
      { x: 62, y: 87, n: 'Mine rails', t: 'Rusty rails. A note is pinned to a sleeper. Every word on it has been rubbed away except one: "{nextName}".' },
      { x: 12, y: 57, n: 'Candles', t: 'Candles drip onto the rock. Their flames lean towards the door. There is a draught coming from behind it.' },
    ],
    pz: { x: 49, y: 62, n: 'The stone door', title: 'The Stone Door', slot: i => 'OPENS'[i],
      intro: 'Above the dials the miners carved a warning: "Only those who can crack a code may pass." Each right answer turns a dial.',
      win: 'The fifth dial clunks into place and the great door rolls aside. In a niche behind it glows a {stone}, {colour} as a coal.' },
    spot: { x: 28, y: 62 },
    exits: { back: { x: 50, y: 94, d: 'down' }, fwd: { x: 92, y: 70, d: 'right' } },
  },
  bridge: {
    role: 'puzzle', name: 'The Gorge', short: 'GORGE', img: 'img/bridge.jpg', art: true, locks: ['climb', 'fog'],
    first: ['The path ends at a cliff high above a roaring waterfall. A rope bridge sags across the gorge.', 'Half its planks are missing.'],
    looks: [
      { x: 61, y: 66, n: 'Waterfall', t: 'The waterfall pours and pours, but strangely it makes no sound at all.' },
      { x: 79, y: 63, n: 'Bridge post', t: 'A plank leans against the post with letters burnt into it. Every plank on this bridge once carried a word.' },
    ],
    pz: { x: 55, y: 47, n: 'The rope bridge', title: 'The Rope Bridge', slot: () => '▬',
      intro: 'A pile of loose planks lies by the post, each with words burnt into it. Only the right planks will take your weight.',
      win: 'You lay the last plank and edge across without looking down. Tied to the far post is a {stone}, glowing {colour}.' },
    spot: { x: 20, y: 60 },
    exits: { back: { x: 8, y: 80, d: 'left' }, fwd: { x: 56, y: 30, d: 'up' } },
  },
  tower: {
    role: 'puzzle', name: 'Clockwork Tower', short: 'TOWER', img: 'img/tower.jpg', art: true, locks: ['locked', 'rusted'],
    first: ['Inside the tower, enormous gears fill the space from floor to roof. None of them is moving.', 'The biggest wheel has five empty holes around its rim.'],
    looks: [
      { x: 86, y: 22, n: 'Clock face', t: "The clock's hands are stuck at a quarter to nothing." },
      { x: 18, y: 62, n: 'Stairs', t: 'The stairs spiral up to the roof. From the top you can see {nextName} in the distance.' },
      { x: 25, y: 73, n: 'Workbench', t: 'A workbench covered in tiny cogs and springs, and a cup of cold tea.' },
    ],
    pz: { x: 56, y: 59, n: 'The great gear', title: 'The Great Gear', slot: () => '⚙',
      intro: 'A tray of small brass cogs sits by the great gear, each engraved with a riddle. Solve a riddle and its cog fits a hole.',
      win: 'The last cog slides home and the great gear shudders into motion. TICK. TOCK. The pendulum swings out a {stone}, glowing {colour}.' },
    spot: { x: 34, y: 70 },
    exits: { back: { x: 50, y: 94, d: 'down' }, fwd: { x: 94, y: 70, d: 'right' } },
  },
  hut: {
    role: 'puzzle', name: "Weaver's Hut", short: 'HUT', img: 'img/hut.jpg', art: true, locks: ['locked'], resident: 'ossian', needs: 'shuttle',
    first: ['A thatched hut, warm from a crackling fire. Baskets of wool are piled everywhere.', 'An old weaver sits at a great wooden loom. He turns and looks at you with bright, sad eyes.'],
    looks: [
      { x: 82, y: 60, n: 'Fireplace', t: 'A kettle hangs over the fire. Above it, a shelf of jars with blank labels.' },
      { x: 12, y: 88, n: 'Baskets of wool', t: 'Wool in every colour. Ossian must have dyed it all himself.' },
    ],
    pz: { x: 16, y: 55, n: "Ossian's loom", title: "Ossian's Loom", slot: i => ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'][i % 6],
      intro: 'Six coloured threads hang loose from the loom. Each one needs a word puzzle to weave it back in.',
      win: 'The shuttle flies and the cloth grows bright with colour. Woven into the very end is a {stone}, glowing {colour}.' },
    spot: { x: 46, y: 36 },
    exits: { back: { x: 6, y: 70, d: 'left' }, fwd: { x: 94, y: 50, d: 'right' } },
  },
  /* more puzzle places */
  lamp: {
    role: 'puzzle', name: 'The Lamp Room', short: 'LAMP', img: 'img/lamp.jpg', art: true, locks: ['locked', 'climb'],
    first: ['You climb the spiral stairs to the top of the lighthouse. The great lamp flickers weakly in the middle of the room, and rain lashes the windows.',
      'A brass control panel in front of it has five empty sockets for lenses.'],
    looks: [
      { x: 86, y: 40, n: 'Windows', t: 'The sea rolls grey to the horizon. Without the lamp, ships will steer straight onto the rocks.' },
      { x: 50, y: 30, n: 'The great lamp', t: 'Rings of glass prisms, taller than you. The light inside wavers, too weak to reach the ships.' },
      { x: 91, y: 75, n: 'Oil lamp', t: "The keeper's little oil lamp, and a logbook. The last page is blank except for a drawing of a grey swirl with a wide mouth." },
    ],
    pz: { x: 26, y: 88, n: 'The lens panel', title: 'The Lens Panel', slot: () => '◉',
      intro: 'Each lens is engraved with a puzzle. Solve it and the lens clicks into its socket.',
      win: 'The fifth lens clicks home. The lamp blazes at full strength, and a beam sweeps out across the sea. In its light lies a {stone}, glowing {colour}.' },
    lenses: [[37, 85], [43.5, 85], [50, 85], [56.5, 85], [63, 85]],
    spot: { x: 12, y: 66 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 94, y: 92, d: 'right' } },
  },
  market: {
    role: 'puzzle', name: 'Harbour Market', short: 'MARKET', img: 'img/market.jpg', art: true, locks: ['fog'],
    first: ['A little market on the quay. The stalls are laid out, but nobody is buying or selling. Nobody can haggle without words.',
      'In the middle of the quay stands a great brass weighing scale.'],
    looks: [
      { x: 12, y: 52, n: 'Fish stall', t: 'Fresh mackerel on ice, and a price board with no prices on it.' },
      { x: 90, y: 50, n: 'Moored boats', t: 'Little boats bob at the quay, their names wiped clean off their hulls.' },
      { x: 30, y: 78, n: 'Vegetable baskets', t: 'Carrots, tomatoes, cabbages. Every label says nothing at all.' },
    ],
    pz: { x: 66, y: 74, n: 'The weighing scale', title: 'The Weighing Scale', slot: () => '⚖',
      intro: 'Each brass weight has a puzzle stamped on it. Solve one and hang it on the scale to balance it.',
      win: 'The scale swings level with a ring like a bell. In the pan sits a {stone}, glowing {colour}.' },
    spot: { x: 44, y: 66 }, exits: { back: { x: 6, y: 90, d: 'left' }, fwd: { x: 62, y: 40, d: 'up' } },
  },
  windmill: {
    role: 'puzzle', name: 'The Windmill', short: 'MILL', img: 'img/windmill.jpg', art: true, locks: ['rusted', 'locked'],
    first: ['Inside the windmill the great wooden wheels stand still. Sacks of grain wait to be ground.',
      'By the window, a lever panel has five iron levers, each beside an empty notch.'],
    looks: [
      { x: 14, y: 80, n: 'Grain sacks', t: 'The sacks are labelled, but every label is blank. Is it flour or oats? Nobody can say.' },
      { x: 66, y: 30, n: 'Small window', t: 'Through the window the sails hang still, though the wind is blowing.' },
      { x: 20, y: 52, n: 'Millstones', t: 'Two great round millstones, cold and dusty.' },
    ],
    pz: { x: 63, y: 67, n: 'The lever panel', title: 'The Lever Panel', slot: () => '▮',
      intro: 'Each lever has a puzzle carved into its handle. Solve it and the lever drops into its notch.',
      win: 'The last lever drops, the sails creak round and the millstones begin to grind. Out of the chute rolls a {stone}, glowing {colour}.' },
    spot: { x: 40, y: 82 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 86, y: 36, d: 'up' } },
  },
  abbey: {
    role: 'puzzle', name: 'The Ruined Abbey', short: 'ABBEY', img: 'img/abbey.jpg', art: true, locks: ['boarded', 'dark'],
    first: ['Ivy climbs the walls of the old abbey library. Light falls through a broken window onto shelves of books.',
      'Every page you open is blank. One bookcase looks different from the rest, with a brass panel of empty letter tiles.'],
    looks: [
      { x: 18, y: 46, n: 'Bookshelves', t: 'Thousands of books, and not a single word left in any of them.' },
      { x: 92, y: 28, n: 'Stained glass', t: 'Pictures in coloured glass, but the scroll in the saint\'s hand is blank.' },
      { x: 60, y: 90, n: 'Fallen books', t: 'You pick one up. It is called nothing, by nobody, and it is about nothing.' },
    ],
    pz: { x: 54, y: 50, n: 'The letter tiles', title: 'The Bookcase Door', slot: i => 'ABBEY'[i],
      intro: 'Each letter tile slides into place when you solve the puzzle written on its back.',
      win: 'The bookcase swings open with a groan. On a reading desk behind it lies a {stone}, glowing {colour}.' },
    spot: { x: 36, y: 82 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 76, y: 52, d: 'up' } },
  },
  wreck: {
    role: 'puzzle', name: 'The Shipwreck', short: 'WRECK', img: 'img/wreck.jpg', art: true, locks: ['climb', 'fog'],
    first: ['At low tide, an old galleon lies on its side on the sand. Rock pools shine around it.',
      "Half buried beside the ship's wheel is a sea chest bound with iron, with a lock of five dials."],
    looks: [
      { x: 76, y: 22, n: 'Galleon', t: "The ship's name has been scraped off her bow. Even the ship has forgotten who she was." },
      { x: 14, y: 62, n: 'Rock pools', t: 'A crab waves a claw at you, then looks embarrassed and scuttles off.' },
      { x: 10, y: 22, n: 'Gulls', t: 'Gulls line the cliff, beaks wide open. Not a squawk between them.' },
    ],
    pz: { x: 56, y: 70, n: 'The sea chest', title: 'The Sea Chest', slot: () => '⚓',
      intro: 'Each dial on the chest has a puzzle etched around its rim. Solve one to turn it.',
      win: 'The lid creaks open. Among the old coins lies a {stone}, glowing {colour}.' },
    spot: { x: 84, y: 82 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 94, y: 92, d: 'right' } },
  },
  observatory: {
    role: 'puzzle', name: 'The Observatory', short: 'STARS', img: 'img/observatory.jpg', art: true, locks: ['locked', 'climb'],
    first: ['A small domed observatory perches on the cliff. The dome is open to the night sky.',
      'The great telescope points at nothing. Five brass rings on its barrel need setting.'],
    looks: [
      { x: 24, y: 46, n: 'Star chart', t: 'Every star is drawn, but none of them has a name.' },
      { x: 70, y: 12, n: 'Night sky', t: 'Somewhere up there is a constellation shaped like an arch.' },
      { x: 88, y: 72, n: 'Desk', t: 'An oil lamp, a notebook and a pen. The notebook says nothing, on every page.' },
    ],
    pz: { x: 66, y: 50, n: 'The telescope rings', title: 'The Telescope', slot: () => '✦',
      intro: 'Each brass ring has a puzzle engraved on it. Solve it and the ring clicks to the right setting.',
      win: 'The last ring clicks. Through the eyepiece a star blazes, and something falls with a soft thud onto the desk: a {stone}, glowing {colour}.' },
    spot: { x: 14, y: 76 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 94, y: 92, d: 'right' } },
  },
  glasshouse: {
    role: 'puzzle', name: 'The Glasshouse', short: 'GLASS', img: 'img/glasshouse.jpg', art: true, locks: ['rusted', 'boarded'],
    first: ['An old glasshouse stands in an overgrown orchard. Vines press against the broken panes.',
      'Copper pipes run along the back wall to a big iron valve wheel. Above it, five brass gauges all read zero.'],
    looks: [
      { x: 76, y: 56, n: 'Beehives', t: 'The bees fly in perfect silence. Not a single buzz.' },
      { x: 84, y: 76, n: 'Seed trays', t: 'Rows of seedlings, each with a little wooden label. Every label is blank. Tomato? Pea? Who knows.' },
      { x: 6, y: 30, n: 'Climbing roses', t: 'Roses climb the glass. They should smell wonderful, but the island seems to be holding its breath.' },
    ],
    pz: { x: 50, y: 64, n: 'The valve wheel', title: 'The Valve Wheel', slot: () => '◍',
      intro: 'Each gauge has a puzzle printed on its glass. Solve it and the needle swings up.',
      win: 'Steam hisses through the pipes and the glasshouse warms. In the biggest pot, a {stone} glows {colour}.' },
    gauges: [[31, 35], [41, 35], [50, 35], [60, 35], [69, 35]],
    spot: { x: 28, y: 74 }, exits: { back: { x: 6, y: 92, d: 'left' }, fwd: { x: 94, y: 92, d: 'right' } },
  },
  /* finals */
  gate: {
    role: 'final', name: "The Keeper's Gate", short: 'GATE', img: 'img/gate.jpg', art: true,
    first: ['You climb to the very top of the island. An ancient stone arch stands against the sunset, carved with spirals.', 'Around it are six round hollows, each the size of your fist.'],
    looks: [{ x: 80, y: 56, n: 'The view', t: 'The whole island lies below you, and the lighthouse far away on its headland.' }],
    pz: { x: 31, y: 45, n: 'The stone arch', title: 'Riddles of the Gate', slot: () => '★' },
    hollows: [[18.9, 27.5], [23.7, 17.7], [29, 13.6], [35, 13.6], [39.4, 18], [43.2, 27.5]],
    exits: { back: { x: 50, y: 94, d: 'down' } },
  },
  stones: {
    role: 'final', name: 'The Standing Stones', short: 'STONES', img: 'img/stones.jpg', art: true,
    first: ['On a misty moor at the top of the island, a ring of ancient standing stones waits in the sunset.', 'In the middle lies a flat altar stone with round hollows carved into it.'],
    looks: [{ x: 88, y: 14, n: 'Crows', t: 'Crows sit on the stones, beaks open, making no sound at all.' }, { x: 66, y: 42, n: 'The sea', t: 'The sea glows orange far below. You can see the whole way back to where you started.' }],
    pz: { x: 50, y: 82, n: 'The altar stone', title: 'Riddles of the Stones', slot: () => '★' },
    hollows: [[37, 72], [45.5, 72], [51, 68.5], [56.5, 72], [65.5, 73], [51, 79]],
    exits: { back: { x: 50, y: 95, d: 'down' } },
  },
  party: { role: 'end', name: 'The Celebration', short: '', img: 'img/party.jpg', art: true, first: [], looks: [], exits: {} },
};

/* topic groups from the Station Zero engine (vr.js GROUPS) plus a mixed round */
const GROUP_NAMES = { find: 'Finding words', build: 'Building words', codes: 'Codes and sequences', vocab: 'Vocabulary', logic: 'Logic', mixed: 'Mixed puzzles' };
