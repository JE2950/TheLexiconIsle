/* ════════════════════════════════════════════════════════════════
   THE LEXICON ISLE
   A point-and-click verbal reasoning adventure in the style of the
   early-1990s school adventures. Explore first-person screens, click the
   small squares to look at things, talk to the islanders, collect items
   and work the machines that guard the six Word Stones.
   Questions come from the Station Zero engine (vr.js, bank.js, atom.js,
   gl_style.js), copied unchanged from the VR repo.
   ════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const KEY = 'lexicon-isle-v2';

/* ── saved game ── */
function fresh0() { return { name: '', at: 'jetty', seen: {}, visited: {}, items: [], stones: {}, prog: {}, flags: {}, stars: 0, answered: 0, started: 0, finished: 0, voice: true, music: true }; }
let G = fresh0();
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) G = Object.assign(fresh0(), s); } catch (e) {}
function saveG() { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} }

/* ── items and stones ── */
const ITEMS = {
  map: { e: '🗺️', n: "Maren's map" },
  lantern: { e: '🏮', n: "Smugglers' lantern" },
  key: { e: '🗝️', n: 'Brass key' },
  shuttle: { e: '🧶', n: "Weaver's shuttle" },
};
const STONES = [
  { id: 'crates', c: '#3fe0b8', n: 'Sea Stone' },
  { id: 'signs', c: '#86e05a', n: 'Leaf Stone' },
  { id: 'dials', c: '#ff9a3c', n: 'Ember Stone' },
  { id: 'planks', c: '#4fb3ff', n: 'Sky Stone' },
  { id: 'gear', c: '#c48bff', n: 'Dusk Stone' },
  { id: 'loom', c: '#ff5a6e', n: 'Rose Stone' },
];
const has = i => G.items.includes(i);
function give(i) { if (!has(i)) { G.items.push(i); saveG(); drawPocket(); } }
function drawPocket() {
  const cells = Object.keys(ITEMS).map(k => has(k) ? `<div class="item" title="${ITEMS[k].n}">${ITEMS[k].e}</div>` : `<div class="item"></div>`);
  cells.push(`<div class="item" title="Stars: answers right first time" style="font-size:16px;color:#ffcc33;font-weight:700">★${G.stars}</div>`);
  $('items').innerHTML = cells.join('');
  $('stones').innerHTML = STONES.map(s => `<span class="st ${G.stones[s.id] ? 'on' : ''}" title="${G.stones[s.id] ? s.n : 'Word Stone: not found yet'}" style="${G.stones[s.id] ? `background:${s.c};color:${s.c}` : ''}"></span>`).join('');
}

/* ════════ NARRATION ════════
   Every line is shown in the panel and (if the Voice button is on) read aloud.
   "Go on" moves to the next line, as in the old adventures. */
let lines = [], lineAt = 0, lineDone = null, lastSpoken = '';
const plain = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices();
  return vs.find(v => /en-GB/i.test(v.lang) && /Daniel|Serena|Kate|Arthur|Martha|Google UK English Female/i.test(v.name))
    || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
function speak(text) {
  lastSpoken = text;
  if (!G.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    voice = voice || pickVoice(); if (voice) u.voice = voice;
    u.lang = 'en-GB'; u.rate = 0.95; u.pitch = 1;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function shush() { try { speechSynthesis.cancel(); } catch (e) {} }
function say(list, done) {
  lines = (Array.isArray(list) ? list : [list]).filter(Boolean); lineAt = 0; lineDone = done || null;
  showLine();
}
function showLine() {
  const l = lines[lineAt]; if (!l) return;
  const who = typeof l === 'object' ? l.who : '', t = typeof l === 'object' ? l.t : l;
  $('sayText').innerHTML = (who ? `<span class="who">${who}:</span> ` : '') + t;
  $('sayText').scrollTop = 0;
  speak((who ? '' : '') + plain(t));
  const more = lineAt < lines.length - 1 || lineDone;
  $('goon').disabled = !more;
}
$('goon').onclick = () => {
  if (lineAt < lines.length - 1) { lineAt++; showLine(); return; }
  const d = lineDone; lineDone = null; $('goon').disabled = true; if (d) d();
};
$('replay').onclick = () => { const was = G.voice; G.voice = true; speak(lastSpoken || plain($('sayText').innerHTML)); G.voice = was; };

/* ════════ THE ISLAND ════════
   Coordinates are percentages of the picture. */
const SCENES = {
  jetty: {
    name: "Smugglers' Jetty", img: 'img/jetty.jpg',
    first: [
      'A storm blew all night. Your little rowing boat smashed onto the rocks, and you staggered up the shingle at dawn.',
      'This is Lexicon Isle. The air is cold and still. You call out, but no one answers. There is not even the cry of a gull.',
      'Click on the small flashing squares to look at things. Click the arrows to move on.',
    ],
    again: "You are back on the smugglers' jetty.",
    hots: [
      { x: 76, y: 56, n: 'Your boat', f: () => say('Your rowing boat lies on its side with a hole in the hull you could put your head through. It will not float again.') },
      { x: 91, y: 19, n: 'Lighthouse', f: () => say('A lighthouse stands on the headland. Its lamp is dark. A path leads round the rocks towards it.') },
      { x: 66, y: 64, n: "Smugglers' crates", f: () => crates() },
      { x: 93, y: 71, n: 'Lobster pots', f: () => say('Empty lobster pots. Even the crabs seem to have gone quiet.') },
      { x: 13, y: 38, n: 'Overgrown path', f: () => say('A narrow path climbs into thick woods. It looks easy to get lost up there. Better to find someone who knows the way.') },
    ],
    arrows: [{ x: 88, y: 88, d: 'right', to: 'village', n: 'To the village' }],
  },
  village: {
    name: 'Lighthouse Village', img: 'img/village.jpg',
    first: ['You follow the path round the rocks into a tiny fishing village. Smoke drifts from the chimneys, but the street is silent.',
      'An old woman in a lighthouse keeper\'s coat stands by the well, watching you.'],
    again: 'You are in the village square.',
    hots: [
      { x: 52, y: 57, n: 'Maren, the lighthouse keeper', f: () => maren() },
      { x: 37, y: 60, n: 'The well', f: () => say('You lean over the well and shout "Hello!" No echo comes back. Even echoes have been stolen here.') },
      { x: 83, y: 55, n: 'Fishing nets', f: () => say('Nets hang drying on poles. Someone has knotted little labels onto them, but every label is blank.') },
      { x: 15, y: 44, n: 'Cottages', f: () => say('Faces watch you from the cottage windows. A girl waves. When she opens her mouth, no sound comes out.') },
      { x: 92, y: 87, n: 'Barrels', f: () => say('Barrels of salted fish. The words painted on the sides have faded to nothing.') },
    ],
    arrows: [
      { x: 50, y: 93, d: 'down', to: 'jetty', n: 'Back to the jetty' },
      { x: 64, y: 40, d: 'up', to: 'wood', n: 'Into the woods', need: () => G.flags.metMaren || 'Maren tugs your sleeve and taps her slate. She wants to talk to you first.' },
    ],
  },
  wood: {
    name: 'Whispering Wood', img: 'img/wood.jpg',
    first: ['The path climbs into an old, old wood. Maren says the trees here used to whisper to travellers and tell them the way.',
      'Now they are silent, and the two signposts at the crossroads have lost their words.'],
    again: 'You are at the crossroads in Whispering Wood.',
    hots: [
      { x: 30, y: 49, n: 'Signposts', f: () => signs() },
      { x: 72, y: 36, n: 'Twisted trees', f: () => say(G.stones.signs ? 'The leaves rustle softly. It sounds almost like words.' : 'You put your ear to a tree trunk. Nothing. The wood is holding its breath.') },
      { x: 56, y: 72, n: 'Footprints', f: () => say('Fresh footprints in the mud. Big boots. They go both ways along the path. Someone else has been here.') },
    ],
    arrows: [
      { x: 50, y: 94, d: 'down', to: 'village', n: 'Back to the village' },
      { x: 7, y: 66, d: 'left', to: 'cave', n: 'To the caves', need: () => G.stones.signs || 'Which way? Both paths look the same. The signposts would tell you, if they had any words.' },
      { x: 93, y: 62, d: 'right', to: 'bridge', n: 'To the gorge', need: () => G.stones.dials || 'You can hear rushing water that way, but brambles block the path. Maybe there is another way round, through the caves.' },
    ],
  },
  cave: {
    name: 'Echo Caves', img: 'img/cave.jpg',
    first: ['You hold up the smugglers\' lantern and step into the old mine. The rails lead deeper and deeper, then stop at a great round door of stone.',
      'Five brass dials are set into the middle of it, like a giant combination lock.'],
    again: 'You are at the round stone door in the Echo Caves.',
    hots: [
      { x: 49, y: 62, n: 'The stone door', f: () => dials() },
      { x: 83, y: 37, n: 'Hanging lantern', f: () => say('A miner\'s lantern, still warm. Someone lit these candles not long ago.') },
      { x: 62, y: 87, n: 'Mine rails', f: () => say('Rusty rails. A note is pinned to a sleeper: "Gone to the tower. Took the key. B." The key part has been crossed out.') },
      { x: 12, y: 57, n: 'Candles', f: () => say('Candles drip onto the rock. Their flames point towards the door. There is a draught coming from behind it.') },
    ],
    arrows: [
      { x: 50, y: 94, d: 'down', to: 'wood', n: 'Back to the wood' },
      { x: 92, y: 70, d: 'right', to: 'bridge', n: 'Through the door', need: () => G.stones.dials || 'The stone door is shut tight.' },
    ],
  },
  bridge: {
    name: 'The Gorge', img: 'img/bridge.jpg',
    first: ['The tunnel opens onto a cliff high above a roaring waterfall. A rope bridge sags across the gorge.',
      'Half its planks are missing. On the far side, through the trees, you can see the top of a clock tower.'],
    again: 'You are at the rope bridge over the gorge.',
    hots: [
      { x: 55, y: 45, n: 'The rope bridge', f: () => planks() },
      { x: 61, y: 66, n: 'Waterfall', f: () => say('The waterfall roars, but strangely it makes no sound at all.') },
      { x: 79, y: 63, n: 'Bridge post', f: () => say('A plank leans against the post. Letters are burnt into it. You can tell from the scorch marks that every plank on this bridge once carried a word.') },
    ],
    arrows: [
      { x: 8, y: 80, d: 'left', to: 'cave', n: 'Back into the caves' },
      { x: 56, y: 30, d: 'up', to: 'tower', n: 'Across to the tower', need: () => G.stones.planks ? (has('key') || 'The tower door is locked. You need a key.') : 'You would fall straight through the gaps. The bridge needs its planks.' },
    ],
  },
  tower: {
    name: 'Clockwork Tower', img: 'img/tower.jpg',
    first: ['You turn the brass key and push open the tower door. Inside, enormous gears fill the tower from floor to roof. None of them is moving.',
      'The biggest wheel has five empty holes around its rim. Something should sit in them.'],
    again: 'You are inside the Clockwork Tower.',
    hots: [
      { x: 56, y: 59, n: 'The great gear', f: () => gear() },
      { x: 86, y: 22, n: 'Clock face', f: () => say(G.stones.gear ? 'The hands sweep round. Tick, tock. The first sound you have heard on the island.' : 'The clock\'s hands are stuck at a quarter to nothing.') },
      { x: 18, y: 62, n: 'Stairs', f: () => say('The stairs spiral up to the roof. From the top you could see a thatched hut on the hillside, with smoke coming from its chimney.') },
      { x: 25, y: 73, n: 'Workbench', f: () => say('A workbench covered in tiny cogs and springs, and a cup of cold tea.') },
    ],
    arrows: [
      { x: 50, y: 94, d: 'down', to: 'bridge', n: 'Back to the bridge' },
      { x: 94, y: 70, d: 'right', to: 'hut', n: "To the weaver's hut", need: () => G.stones.gear || 'The back door is jammed by the gears. They need to turn first.' },
    ],
  },
  hut: {
    name: "Weaver's Hut", img: 'img/hut.jpg',
    first: ['A thatched hut, warm from a crackling fire. Baskets of wool are piled everywhere.',
      'An old weaver sits at a great wooden loom. He turns and looks at you with bright, sad eyes.'],
    again: "You are in the weaver's hut.",
    hots: [
      { x: 44, y: 44, n: 'Ossian the weaver', f: () => ossian() },
      { x: 14, y: 52, n: 'The loom', f: () => loom() },
      { x: 82, y: 60, n: 'Fireplace', f: () => say('A kettle hangs over the fire. Above it, a shelf of jars with blank labels.') },
      { x: 12, y: 88, n: 'Baskets of wool', f: () => say('Wool in every colour. Ossian must have dyed it all himself.') },
    ],
    arrows: [
      { x: 6, y: 70, d: 'left', to: 'tower', n: 'Back to the tower' },
      { x: 94, y: 50, d: 'right', to: 'gate', n: 'Up to the summit', need: () => G.stones.loom || 'Ossian shakes his head and points at his loom. He wants your help first.' },
    ],
  },
  gate: {
    name: "The Keeper's Gate", img: 'img/gate.jpg',
    first: ['You climb to the very top of the island. An ancient stone arch stands against the sunset, carved with spirals.',
      'Around it are six round hollows, each the size of your fist.'],
    again: "You are at the Keeper's Gate.",
    hots: [
      { x: 30, y: 34, n: 'The stone arch', f: () => gate() },
      { x: 80, y: 56, n: 'The view', f: () => say('The whole island lies below you: the wood, the gorge, the tower, and the lighthouse far away on its headland.') },
    ],
    arrows: [{ x: 50, y: 94, d: 'down', to: 'hut', n: "Back to the weaver's hut" }],
  },
  party: { name: 'The Celebration', img: 'img/party.jpg', first: [], again: '', hots: [], arrows: [] },
};
const ORDER = ['jetty', 'village', 'wood', 'cave', 'bridge', 'tower', 'hut', 'gate'];

/* arrows drawn as chunky SVG shapes */
const ARROW = { right: 'M8 24h30V10l22 22-22 22V40H8z', left: 'M58 24H28V10L6 32l22 22V40h30z', up: 'M24 58V28H10L32 6l22 22H40v30z', down: 'M24 8v30H10l22 22 22-22H40V8z' };

function go(id, quiet) {
  const S = SCENES[id]; if (!S) return;
  closeMachine(true);
  G.at = id; const firstTime = !G.visited[id]; G.visited[id] = true; saveG();
  $('scene').classList.add('fade');
  setTimeout(() => {
    $('bg').src = S.img; $('bg').alt = S.name;
    $('tt').textContent = 'The Lexicon Isle  ·  ' + S.name;
    drawHots(); drawMarks();
    $('scene').classList.remove('fade');
    if (!quiet) say(firstTime ? S.first : [S.again]);
  }, 250);
}
function drawHots() {
  const S = SCENES[G.at];
  let h = S.hots.map((p, i) => `<button class="hot ${G.seen[G.at + i] ? 'seen' : ''}" data-h="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="${p.n}"></button><span class="tip" style="left:${p.x}%;top:${p.y}%">${p.n}</span>`).join('');
  h += S.arrows.map((a, i) => {
    const ok = !a.need || a.need() === true;
    return `<button class="arrow ${ok ? '' : 'locked'}" data-a="${i}" style="left:${a.x}%;top:${a.y}%" aria-label="${a.n}"><svg viewBox="0 0 64 64"><path d="${ARROW[a.d]}" fill="#fff" stroke="#000" stroke-width="3" stroke-linejoin="round"/></svg></button><span class="tip" style="left:${a.x}%;top:${a.y}%">${a.n}</span>`;
  }).join('');
  $('hots').innerHTML = h;
}
$('hots').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const S = SCENES[G.at];
  if (b.dataset.h != null) { const i = +b.dataset.h; G.seen[G.at + i] = true; saveG(); b.classList.add('seen'); S.hots[i].f(); }
  if (b.dataset.a != null) {
    const a = S.arrows[+b.dataset.a], r = a.need ? a.need() : true;
    if (r === true) go(a.to); else say(r);
  }
};

/* things drawn onto a scene to show progress */
function drawMarks() {
  let h = '';
  const p = G.prog;
  if (G.at === 'cave') { const w = 'OPENS'; [43.6, 46.6, 49.6, 52.6, 55.6].forEach((x, i) => { if (i < (p.dials || 0) || G.stones.dials) h += `<span class="mark dial" style="left:${x}%;top:45.8%">${w[i]}</span>`; }); }
  if (G.at === 'wood' && G.stones.signs) h += `<span class="mark carve" style="left:23%;top:52%">◀ CAVES</span><span class="mark carve" style="left:45%;top:46%">GORGE ▶</span>`;
  if (G.at === 'tower') [[55.7, 46.9], [65.6, 57.8], [61.3, 70.8], [50.4, 70.8], [46.5, 57.8]].forEach(([x, y], i) => { if (i < (p.gear || 0) || G.stones.gear) h += `<span class="mark cog" style="left:${x}%;top:${y}%"></span>`; });
  if (G.at === 'gate') [[18.9, 27.5], [23.7, 17.7], [29, 13.6], [35, 13.6], [39.4, 18], [43.2, 27.5]].forEach(([x, y], i) => { const s = STONES[i]; if (G.stones[s.id]) h += `<span class="mark gem" style="left:${x}%;top:${y}%;background:${s.c};color:${s.c}"></span>`; });
  $('marks').innerHTML = h;
}

/* ════════ PEOPLE ════════ */
function maren() {
  if (!G.flags.metMaren) {
    say([
      'The old woman smiles, then takes a stick of chalk and writes on her slate.',
      { who: 'Maren (on her slate)', t: '"Welcome, stranger. I am Maren, keeper of the lighthouse. Forgive me. None of us can speak."' },
      { who: 'Maren', t: '"Three nights ago the Hush rolled in with the fog. It stole every word on the island and locked them away behind six seals."' },
      { who: 'Maren', t: '"Each seal guards a Word Stone. Bring all six stones to the Keeper\'s Gate on the summit, and our voices will come back."' },
      { who: 'Maren', t: '"The seals are puzzles of words. You look like someone who is good with words."' },
      'Maren hands you a folded map of the island.',
      { who: 'Maren', t: '"One more thing. The smugglers kept a lantern in the crates on the jetty. You will need light in the caves."' },
    ], () => { G.flags.metMaren = true; give('map'); saveG(); drawHots(); say('Maren\'s map is in your pocket. Click Map at the top to travel to places you have already visited.'); });
    return;
  }
  const n = STONES.filter(s => G.stones[s.id]).length;
  if (!G.stones.crates) say({ who: 'Maren', t: '"Have you looked in the smugglers\' crates on the jetty? Each lid hides a word."' });
  else if (n < 6) say({ who: 'Maren', t: `"${n} Word Stone${n > 1 ? 's' : ''}! I can almost hear the gulls again. Keep going. The path into the woods is behind the cottages."` });
  else say({ who: 'Maren', t: '"All six! Go to the Keeper\'s Gate. Quickly!"' });
}
function ossian() {
  if (!G.stones.loom) {
    say(['The weaver cannot speak, so he mimes instead. He points at his loom, then at the bare, broken threads, then at you.',
      'His cloth used to weave words together. Now every thread has been unpicked. He wants you to weave it again.',
      'He presses a wooden shuttle into your hand.'], () => { give('shuttle'); say('Click the loom to start weaving.'); });
  } else say({ who: 'Ossian', t: '"Thank you, thank you! Up the hill behind my hut is the Keeper\'s Gate. Go!"' });
}

/* ════════ MACHINES ════════
   Each machine asks questions from one group of topics. A right answer fills
   a slot. A wrong answer gets one more try; if that is wrong too, the answer
   and its working are shown and the slot stays empty. */
const T = id => GROUPS.find(g => g.id === id).topics.map(t => t[0]);
const MACH = {
  crates: { title: "The Smugglers' Crates", topics: () => T('find'), need: 5, slot: i => i + 1,
    intro: ['Five crates are stacked on the jetty, each nailed shut. Words are painted on the lids.', 'Under the paint, someone has scratched: "Find the hidden words and the crates will open." These are Finding Words puzzles.'],
    done: () => { G.stones.crates = true; give('lantern');
      say(['The fifth lid springs open. Inside, wrapped in oilcloth, is a brass lantern.', 'Under the lantern lies a stone that glows sea-green. It is warm in your hand. <b>You have found the Sea Stone!</b>', 'Far off, a single gull cries. Then silence again.']); } },
  signs: { title: 'The Signposts', topics: () => T('build'), need: 5, slot: i => 'CAVES'[i],
    intro: ['You brush the moss off the signposts. Each board has empty slots where carved letters used to be.', 'Build the words back, and the signposts will remember the way. These are Building Words puzzles.'],
    done: () => { G.stones.signs = true;
      say(['The last letter clicks into place. The signposts creak and swing round. One points left to the CAVES, the other right to the GORGE.', 'A green stone drops from a hollow in the oak above. <b>You have found the Leaf Stone!</b>', 'The trees begin to whisper, very faintly.']); } },
  dials: { title: 'The Stone Door', topics: () => T('codes'), need: 5, slot: i => 'OPENS'[i],
    intro: ['Above the dials, the miners carved a warning: "Only those who can crack a code may pass."', 'Each right answer turns a dial. These are Codes and Sequences puzzles.'],
    done: () => { G.stones.dials = true; give('key');
      say(['The fifth dial clunks into place. With a grinding rumble, the great door rolls aside.', 'In a niche behind it glows an orange stone, and beside it hangs a brass key with a label: TOWER.', '<b>You have found the Ember Stone and the brass key!</b> A tunnel leads on, and you can hear rushing water.']); } },
  planks: { title: 'The Rope Bridge', topics: () => T('vocab'), need: 6, slot: () => '▬',
    intro: ['A pile of loose planks lies by the post. Each one has two words burnt into it. Only the planks with the right pairs will take your weight.', 'Lay six good planks to cross. These are Vocabulary puzzles.'],
    done: () => { G.stones.planks = true;
      say(['You lay the sixth plank and edge across, step by step, without looking down.', 'Tied to the far post is a sky-blue stone. <b>You have found the Sky Stone!</b>', 'The clock tower is just ahead. Its door has a big brass lock.']); } },
  gear: { title: 'The Great Gear', topics: () => T('logic'), need: 5, slot: () => '⚙',
    intro: ['A tray of small brass cogs sits by the great gear. Each cog is engraved with a riddle.', 'Solve a riddle and its cog fits a hole. Fill all five and the clock will run. These are Logic puzzles.'],
    done: () => { G.stones.gear = true;
      say(['The last cog slides home. With a shudder, the great gear turns. Then the next, and the next.', 'TICK. TOCK. The tower fills with sound!', 'The pendulum swings out a violet stone that rolls to your feet. <b>You have found the Dusk Stone!</b> The back door swings open onto a hillside path.']); } },
  loom: { title: "Ossian's Loom", topics: () => null, need: 6, slot: i => ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'][i], gate: () => has('shuttle') || 'You need something to weave with. Talk to the weaver first.',
    intro: ['Ossian points to six coloured threads. Each needs a different kind of word skill to weave it in.', 'This loom mixes every kind of puzzle you have met so far.'],
    done: () => { G.stones.loom = true;
      say(['The shuttle flies back and forth, and the cloth grows bright with colour.', { who: 'Ossian', t: '"I... I can speak! My dear friend, thank you!"' }, 'Woven into the very end of the cloth is a rose-red stone. <b>You have found the Rose Stone!</b> That makes six.']); } },
  gate: { title: 'Riddles of the Gate', topics: () => null, need: 8, lives: 3, slot: () => '★',
    intro: ['You press the six Word Stones into the hollows. They blaze with light.', 'A deep voice rolls out of the stone: "Answer eight riddles, traveller. Fail three times and the Hush keeps your words."'],
    done: () => ending() },
};
function crates() { openMachine('crates'); }
function signs() { openMachine('signs'); }
function dials() { openMachine('dials'); }
function planks() { openMachine('planks'); }
function gear() { openMachine('gear'); }
function loom() { openMachine('loom'); }
function gate() {
  const n = STONES.filter(s => G.stones[s.id]).length;
  if (n < 6) { say(`The arch has six hollows. You have ${n} Word Stone${n === 1 ? '' : 's'}. Come back when you have all six.`); return; }
  openMachine('gate');
}

let M = null; // machine in use
function openMachine(id) {
  const D = MACH[id];
  if (G.stones[id]) { say('You have already solved this. The stone is in your pocket.'); return; }
  if (D.gate) { const r = D.gate(); if (r !== true) { say(r); return; } }
  const startIt = () => {
    M = { id, D, filled: G.prog[id] || 0, lives: D.lives || 0, q: null, st: null, tries: 0 };
    if (id === 'gate') { M.filled = 0; M.lives = D.lives; }
    $('mTitle').textContent = D.title;
    $('machine').classList.add('open'); $('hots').style.pointerEvents='none';
    drawSlots(); nextQ();
  };
  if (!G.flags['intro_' + id]) { G.flags['intro_' + id] = true; saveG(); say(D.intro, startIt); }
  else { say(D.intro[D.intro.length - 1]); startIt(); }
}
function drawSlots() {
  const D = M.D;
  let h = Array.from({ length: D.need }, (_, i) => `<span class="slot ${i < M.filled ? 'full' : ''}">${i < M.filled ? D.slot(i) : ''}</span>`).join('');
  if (D.lives) h += '<span style="width:14px"></span>' + Array.from({ length: D.lives }, (_, i) => `<span class="slot life ${i < M.lives ? 'full' : ''}">${i < M.lives ? '🔥' : ''}</span>`).join('');
  $('slots').innerHTML = h;
}
function nextQ() {
  const topics = M.D.topics();
  const q = makeQuestion(topics);
  M.q = q; M.tries = 0;
  $('mPrompt').innerHTML = `<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px">${q.label}</div>${q.prompt}`;
  $('mFeed').innerHTML = '';
  $('mNext').disabled = true; $('mNext').textContent = 'Next ▶';
  M.st = answerUI(q, $('ans'), { btn: 'opt', key: 'key', chip: 'chip', wrap: 'opts', onAnswer });
  $('mScreen').scrollTop = 0;
  speak(plain(q.prompt.replace(/<span class="vr-abc">[\s\S]*$/, '')));
}
function onAnswer(sel, st) {
  const q = M.q, ok = isRight(q, sel); M.tries++;
  if (ok) {
    record(q, true); answerReveal(st, $('ans'), sel);
    if (M.tries === 1) G.stars++;
    M.filled++; if (M.id !== 'gate') G.prog[M.id] = M.filled;
    G.answered++; saveG(); drawPocket(); drawSlots(); drawMarks();
    const v = M.tries === 1 ? pick(['Spot on!', 'Correct!', 'Well cracked!', 'Brilliant!']) : 'Got it on the second try!';
    $('mFeed').innerHTML = `<div class="fb good"><b class="v">${v}${M.tries === 1 ? ' ★' : ''}</b>${q.explain || ''}</div>`;
    speak(v);
    finishStep();
  } else if (M.tries === 1) {
    answerRetry(st, $('ans'), sel);
    $('mFeed').innerHTML = `<div class="fb bad"><b class="v">Not quite. Have another go.</b>Press <b>How?</b> if you want a hint about the method.</div>`;
    speak('Not quite. Have another go.');
  } else {
    record(q, false); answerReveal(st, $('ans'), sel);
    G.answered++;
    if (M.D.lives) M.lives--;
    saveG(); drawSlots();
    $('mFeed').innerHTML = `<div class="fb bad"><b class="v">The answer was ${esc(answerText(q))}.</b>${q.explain || ''}</div>`;
    speak('The answer was ' + answerText(q).replace(/^[A-E]: /, ''));
    finishStep();
  }
}
function finishStep() {
  const done = M.filled >= M.D.need, dead = M.D.lives && M.lives <= 0;
  $('mNext').disabled = false;
  $('mNext').textContent = done ? 'Finish ▶' : dead ? 'Oh no ▶' : 'Next ▶';
  setTimeout(() => $('mNext').focus(), 50);
}
$('mNext').onclick = () => {
  if (!M) return;
  if (M.filled >= M.D.need) { const D = M.D, id = M.id; closeMachine(); saveG(); drawPocket(); drawHots(); drawMarks(); D.done(); return; }
  if (M.D.lives && M.lives <= 0) {
    closeMachine();
    say(['The stones flicker and go dark. The Hush swirls round the arch, cold and grey.', 'But the stones are still in the hollows. Take a breath, read the methods again, and try the riddles once more.']);
    return;
  }
  nextQ();
};
$('mHow').onclick = () => {
  if (!M || !M.q) return;
  const el = document.querySelector('#mFeed .fb.how');
  if (el) { el.remove(); return; }
  $('mFeed').insertAdjacentHTML('afterbegin', `<div class="fb how"><b class="v">How to do it</b>${M.q.how}</div>`);
  speak(plain(M.q.how));
};
$('mLeave').onclick = () => { if (!M) return; const id = M.id; closeMachine(); say(id === 'gate' ? 'You step back from the arch. The riddles will start again when you return.' : 'You step back. What you have done so far stays done.'); };
function closeMachine(silent) { $('machine').classList.remove('open'); $('hots').style.pointerEvents=''; M = null; if (silent) shush(); }

/* ════════ THE ENDING ════════ */
function ending() {
  G.flags.won = true; if (!G.finished) G.finished = Date.now(); saveG();
  say(['The eighth riddle is answered. The arch blazes gold, and a wave of light rolls down the hillside.',
    'Then you hear it. Gulls. Waves. The wind in the trees. And from the village far below, voices. Hundreds of voices, all talking at once.'], () => {
    go('party', true);
    setTimeout(() => say(['By sunset the whole village is out in the square. There is bunting, and lanterns, and fireworks over the sea.',
      { who: 'Maren', t: '"You gave us back our words. The island will never forget your name."' }], certificate), 400);
  });
}
function certificate() {
  const d = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const mins = G.started && G.finished ? Math.max(1, Math.round((G.finished - G.started) / 60000)) : null;
  dialog(`<div class="cert"><div style="font-size:18px">This certifies that</div><div class="nm">${esc(G.name || 'Traveller')}</div>
    <div>restored every word to Lexicon Isle and is named</div><h2>Keeper of Words</h2>
    <p style="font-size:22px;color:#a07000;font-weight:700">★ ${G.stars} stars from ${G.answered} answers</p>
    <p style="font-size:14px">${d}${mins ? ` · ${mins} minute${mins === 1 ? '' : 's'} from shipwreck to summit` : ''} · ${AGES.find(a => a.id === age()).label}</p>
    <div class="radios" style="justify-content:center;margin-top:10px"><button onclick="closeDlg()">Wander the island</button><button onclick="closeDlg();newGame()">Play again</button></div></div>`);
}

/* ════════ DIALOGS: title, set up, map ════════ */
function dialog(html) { $('dlgIn').innerHTML = html; $('dlg').classList.add('open'); }
function closeDlg() { $('dlg').classList.remove('open'); }
$('dlg').onclick = e => { if (e.target === $('dlg')) closeDlg(); };

function yearButtons() { return `<div class="radios" id="years">${AGES.map(a => `<button data-age="${a.id}" aria-pressed="${a.id === age()}"><b>${a.label}</b><small>${a.note}</small></button>`).join('')}</div>`; }
function bindYears(root) { root.querySelectorAll('[data-age]').forEach(b => b.onclick = () => { SAVE.age = +b.dataset.age; persist(); root.querySelectorAll('[data-age]').forEach(x => x.setAttribute('aria-pressed', x === b)); }); }

function titleScreen() {
  $('titleArt').classList.add('open');
  const cont = G.name && G.started;
  $('titleBox').innerHTML = `<div class="panel"><div class="ph">${cont ? 'Welcome back' : 'A new adventure'}</div><div class="pb">
    ${cont ? `<p style="font-size:20px">Welcome back, <b>${esc(G.name)}</b>. You have ${STONES.filter(s => G.stones[s.id]).length} of 6 Word Stones.</p>
      <div class="radios" style="margin-top:10px"><button id="tContinue"><b>Continue</b></button><button id="tNew">New game</button></div>`
    : `<h3>What is your name, traveller?</h3><input class="name" id="tName" maxlength="20" placeholder="Your name" autocomplete="off">
      <h3>Which year are you in?</h3>${yearButtons()}
      <div class="radios" style="margin-top:14px"><button id="tStart" style="background:var(--gold)"><b>Set sail ▶</b></button></div>`}
  </div></div>`;
  say('Welcome to The Lexicon Isle. Type your name, choose your year, and set sail.');
  if (cont) {
    $('tContinue').onclick = () => { startMusic(); $('titleArt').classList.remove('open'); if (G.flags.won) go('party'); else go(G.at); };
    $('tNew').onclick = () => { $('titleBox').querySelector('.pb').insertAdjacentHTML('beforeend', `<p style="margin-top:12px">This wipes your Word Stones. Sure?</p><div class="radios"><button id="tWipe"><b>Yes, start again</b></button></div>`); $('tWipe').onclick = newGame; };
  } else {
    bindYears($('titleBox'));
    const n = $('tName'); n.focus(); n.onkeydown = e => { if (e.key === 'Enter') $('tStart').click(); };
    $('tStart').onclick = () => {
      if (!n.value.trim()) { n.focus(); say('Type your name first, then press Set sail.'); return; }
      G = Object.assign(fresh0(), { name: n.value.trim(), started: Date.now(), voice: G.voice, music: G.music });
      saveG(); drawPocket(); startMusic(); $('titleArt').classList.remove('open'); go('jetty');
    };
  }
}
function newGame() { const v = G.voice, m = G.music; G = fresh0(); G.voice = v; G.music = m; saveG(); drawPocket(); titleScreen(); }

function setup() {
  dialog(`<div class="panel"><div class="ph">Set Up</div><div class="pb">
    <h3>Year group</h3><p style="font-size:14px">Changes how hard the questions are. Year 4 and 5 show an alphabet strip for codes.</p>${yearButtons()}
    <h3>Sound</h3><div class="radios"><button id="sVoice" aria-pressed="${G.voice}">Narrator voice</button><button id="sMusic" aria-pressed="${G.music}">Music</button></div>
    <h3>Start from (for teachers)</h3><p style="font-size:14px">Jump to any part of the island. Earlier stones and items are given to you.</p>
    <div class="mapgrid">${ORDER.map(k => `<button data-jump="${k}">${SCENES[k].name}</button>`).join('')}</div>
    <h3>Progress</h3><p>${STONES.filter(s => G.stones[s.id]).length} of 6 stones · ★ ${G.stars} · ${G.answered} answers</p>
    <div class="radios"><button id="sReset">Start a new game</button><button id="sClose" style="margin-left:auto"><b>Close</b></button></div>
  </div></div>`);
  bindYears($('dlgIn'));
  $('sVoice').onclick = e => { G.voice = !G.voice; saveG(); e.target.setAttribute('aria-pressed', G.voice); syncTop(); if (!G.voice) shush(); };
  $('sMusic').onclick = e => { G.music = !G.music; saveG(); e.target.setAttribute('aria-pressed', G.music); syncTop(); startMusic(); };
  $('sClose').onclick = closeDlg;
  $('sReset').onclick = () => { closeDlg(); newGame(); };
  $('dlgIn').querySelectorAll('[data-jump]').forEach(b => b.onclick = () => { jump(b.dataset.jump); closeDlg(); });
}
/* teacher jump: give everything that comes before a place */
function jump(to) {
  const need = { jetty: [], village: [], wood: ['crates'], cave: ['crates', 'signs'], bridge: ['crates', 'signs', 'dials'], tower: ['crates', 'signs', 'dials', 'planks'], hut: ['crates', 'signs', 'dials', 'planks', 'gear'], gate: STONES.map(s => s.id) }[to];
  if (!G.name) G.name = 'Traveller';
  if (!G.started) G.started = Date.now();
  if (to !== 'jetty') { G.flags.metMaren = true; give('map'); G.visited.jetty = G.visited.village = true; }
  need.forEach(s => { G.stones[s] = true; });
  if (need.includes('crates')) give('lantern');
  if (need.includes('dials')) give('key');
  if (need.includes('gear')) G.visited.hut = G.visited.hut || false;
  if (to === 'gate') give('shuttle');
  ORDER.slice(0, ORDER.indexOf(to)).forEach(k => G.visited[k] = true);
  saveG(); drawPocket(); $('titleArt').classList.remove('open'); startMusic(); go(to);
}
function mapDlg() {
  if (!has('map')) { say('You do not have a map yet. Perhaps someone in the village has one.'); return; }
  dialog(`<div class="panel"><div class="ph">Maren's map</div><div class="pb"><p>Click a place you have already visited to travel there.</p>
    <div class="mapgrid">${ORDER.map(k => `<button data-go="${k}" ${G.visited[k] ? '' : 'disabled'}>${SCENES[k].name}<small>${G.visited[k] ? (MACHFOR[k] && G.stones[MACHFOR[k]] ? 'Stone found ✓' : MACHFOR[k] ? 'Stone still to find' : '') : 'Not visited yet'}</small></button>`).join('')}</div>
    <div class="radios" style="margin-top:12px"><button onclick="closeDlg()">Close</button></div></div></div>`);
  $('dlgIn').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { closeDlg(); go(b.dataset.go); });
}
const MACHFOR = { jetty: 'crates', wood: 'signs', cave: 'dials', bridge: 'planks', tower: 'gear', hut: 'loom' };

/* ════════ TOP BAR, MUSIC, KEYS, SCALING ════════ */
function syncTop() { $('btnVoice').setAttribute('aria-pressed', G.voice); $('btnMusic').setAttribute('aria-pressed', G.music); }
/* Music: plays music/theme.mp3 if it is there. If not, the browser plays a
   small tracker-style tune of its own (Web Audio), so there is always music. */
let useSynth = false;
function startMusic() {
  const a = $('music'); a.volume = 0.3;
  if (!G.music) { a.pause(); synthStop(); return; }
  if (useSynth) { synthStart(); return; }
  const p = a.play();
  if (p && p.catch) p.catch(() => { useSynth = true; synthStart(); });
}
$('music').addEventListener('error', () => { useSynth = true; if (G.music) synthStart(); });
let actx = null, master = null, seqTimer = null, nextT = 0, step = 0;
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];       // Am F C G
const MEL = [76, null, 74, 72, null, 69, null, null, 72, null, 74, null, 76, null, 79, null,
             76, null, 74, 72, null, 67, null, null, 71, null, 72, null, 74, null, null, null,
             81, null, 79, 76, null, 74, null, 72, 74, null, 76, null, 72, null, null, null,
             79, null, 76, 74, null, 72, null, 71, 72, null, null, 74, 71, null, null, null];
function tone(t, f, dur, type, vol) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function synthTick() {
  const spb = 60 / 84 / 2;
  while (nextT < actx.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % 4, ch = CHORDS[bar], s8 = step % 8;
    const arp = [0, 1, 2, 1, 0, 1, 2, 1][s8]; tone(nextT, mf(ch[arp] + (s8 >= 4 ? 12 : 0)), 0.35, 'triangle', 0.035);
    if (s8 === 0) ch.forEach(n => tone(nextT, mf(n), 2.6, 'sine', 0.018));
    if (s8 % 4 === 0) tone(nextT, mf(ch[0] - 24), 0.6, 'sine', 0.07);
    const m = MEL[step % 64]; if (m && step >= 32) tone(nextT, mf(m), 0.45, 'square', 0.012);
    nextT += spb; step = (step + 1) % 128;
  }
}
function synthStart() {
  try {
    if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0.8; master.connect(actx.destination); }
    if (actx.state === 'suspended') actx.resume();
    if (seqTimer) return;
    nextT = actx.currentTime + 0.1; seqTimer = setInterval(synthTick, 60);
  } catch (e) {}
}
function synthStop() { if (seqTimer) { clearInterval(seqTimer); seqTimer = null; } }
$('btnVoice').onclick = () => { G.voice = !G.voice; saveG(); syncTop(); if (!G.voice) shush(); };
$('btnMusic').onclick = () => { G.music = !G.music; saveG(); syncTop(); startMusic(); };
$('btnSetup').onclick = setup;
$('btnMap').onclick = mapDlg;
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (M && M.st) { const i = 'abcde'.indexOf(e.key.toLowerCase()); const n = '12345'.indexOf(e.key); if (i >= 0 || n >= 0) { answerKey(M.st, i >= 0 ? i : n); return; } }
  if (e.key === 'Enter' || e.key === ' ') {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON' && document.activeElement !== document.body) return;
    if (M && !$('mNext').disabled) { $('mNext').click(); e.preventDefault(); }
    else if (!$('goon').disabled) { $('goon').click(); e.preventDefault(); }
  }
  if (e.key === 'm' || e.key === 'M') mapDlg();
  if ((e.key === 'h' || e.key === 'H') && M) $('mHow').click();
});
function fit() { const s = Math.min(innerWidth / 1024, innerHeight / 960); $('win').style.transform = `scale(${s})`; }
addEventListener('resize', fit); fit();

/* ════════ START ════════ */
syncTop(); drawPocket();
$('bg').src = SCENES[G.at] ? SCENES[G.at].img : SCENES.jetty.img;
titleScreen();
