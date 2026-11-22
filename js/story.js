/* ════════════════════════════════════════════════════════════════
   THE LEXICON ISLE · STORY GENERATOR
   generateIsland(seed) builds one island from the data in data.js:
   the villain and treasure, which places appear and in what order,
   which question group guards each machine, which items lock which
   paths (and where you find them), and where the characters live.
   The same seed always builds the same island.
   Works in the browser and in Node (tools/test_story.js).
   ════════════════════════════════════════════════════════════════ */

/* small seeded random number generator (mulberry32) */
function makeRng(seed) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next: r,
    int: n => Math.floor(r() * n),
    pick: arr => arr[Math.floor(r() * arr.length)],
    shuffle: arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; },
    chance: p => r() < p,
  };
}
function randomSeed() { return 1000 + Math.floor(Math.random() * 99000); }

const PUZZLE_COUNT = 6;          // stones to collect (start puzzle + 5 more)

function generateIsland(seed, opts) {
  const R = makeRng(seed * 7919 + 17);
  const avail = id => PLACES[id] && PLACES[id].art;
  const premise = R.pick(PREMISES);

  /* the route: start, hub, five puzzle places, final */
  const start = Object.keys(PLACES).filter(k => PLACES[k].role === 'start' && avail(k))[0];
  const hub = Object.keys(PLACES).filter(k => PLACES[k].role === 'hub' && avail(k))[0];
  const pool = R.shuffle(Object.keys(PLACES).filter(k => PLACES[k].role === 'puzzle' && avail(k)));
  const middle = pool.slice(0, PUZZLE_COUNT - 1);
  const final = R.pick(Object.keys(PLACES).filter(k => PLACES[k].role === 'final' && avail(k)));
  const route = [start, hub, ...middle, final];
  const puzzles = [start, ...middle];                        // in the order you meet them

  /* treasure: each puzzle place guards one, colours shuffled */
  const order = R.shuffle([0, 1, 2, 3, 4, 5]);
  const stones = {};
  puzzles.forEach((p, i) => { const k = order[i]; stones[p] = { name: premise.names[k] + ' ' + premise.one.split(' ').slice(-1)[0], colour: premise.colours[k], hue: premise.hues[k], slot: i }; });

  /* question groups: one each, plus a mixed round, shuffled */
  const groups = {};
  R.shuffle(['find', 'build', 'codes', 'vocab', 'logic', 'mixed']).forEach((g, i) => { if (puzzles[i]) groups[puzzles[i]] = g; });
  const need = {};
  puzzles.forEach(p => { need[p] = groups[p] === 'mixed' ? 6 : 5; });
  need[final] = 8;

  /* characters: residents are fixed; the rest wander to random places */
  const residents = {};
  Object.keys(CHARS).forEach(c => { const f = CHARS[c].fixed; if (f && route.includes(f) && CHARS[c].art) residents[f] = c; });
  const giver = residents[hub] || 'maren';
  const wanderers = R.shuffle(Object.keys(CHARS).filter(c => CHARS[c].art && !CHARS[c].fixed));
  const visitors = {};
  const openSpots = R.shuffle(middle.filter(p => !residents[p] && PLACES[p].spot));
  wanderers.slice(0, 3).forEach((c, i) => { if (openSpots[i]) visitors[openSpots[i]] = c; });

  /* locks and keys: a place may need an item to enter. The item is the reward of an
     earlier puzzle, or a gift from a character you meet earlier on the route. */
  const locks = {}, rewards = {}, gifts = {};           // gifts: charId -> item
  const usedItems = new Set(['map', 'shuttle']);
  middle.forEach((p, idx) => {
    const P = PLACES[p];
    if (!P.locks || !R.chance(idx === 0 ? 0.5 : 0.7)) return;
    const options = R.shuffle(P.locks.map(l => Object.keys(ITEMS).find(k => ITEMS[k].lock === l && ITEMS[k].art)).filter(it => it && !usedItems.has(it)));
    const item = options[0]; if (!item) return;
    const posI = route.indexOf(p);
    // possible sources: puzzle places before this one without a reward yet, or visitors earlier on the route
    const srcPuzzles = puzzles.filter(q => route.indexOf(q) < posI && !rewards[q]);
    const srcChars = Object.keys(visitors).filter(q => route.indexOf(q) < posI && !gifts[visitors[q]]).map(q => visitors[q]);
    const pickChar = srcChars.length && (R.chance(0.4) || !srcPuzzles.length);
    if (pickChar) gifts[R.pick(srcChars)] = item;
    else if (srcPuzzles.length) rewards[R.pick(srcPuzzles)] = item;
    else return;
    locks[p] = item; usedItems.add(item);
  });

  /* the hut's loom needs the shuttle, which Ossian gives you */
  return { seed, premise, route, puzzles, final, stones, groups, need, residents, giver, visitors, locks, rewards, gifts };
}

/* fill {tokens} in a line of text */
function fillText(text, plan, ctx) {
  ctx = ctx || {};
  const P = plan.premise;
  const map = {
    villain: P.villain, Villain: P.villain[0].toUpperCase() + P.villain.slice(1), one: P.one, many: P.many,
    arrive: P.arrive, stolen: P.stolen, mute: P.mute, back: P.back, heard: P.heard,
    final: PLACES[plan.final].name, stone: ctx.stone ? 'the ' + ctx.stone.name : '', colour: ctx.stone ? ctx.stone.hue : '',
    nextName: ctx.next ? PLACES[ctx.next].name : 'the top of the island', left: String(ctx.left != null ? ctx.left : 6),
    place: ctx.place ? PLACES[ctx.place].name : '',
  };
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

/* can this island be finished? Walks the route collecting items. Used by the tests. */
function checkIsland(plan) {
  const have = new Set(['map']);
  for (let i = 0; i < plan.route.length; i++) {
    const p = plan.route[i];
    if (plan.locks[p] && !have.has(plan.locks[p])) return `locked out of ${p}: need ${plan.locks[p]}`;
    const v = plan.visitors[p]; if (v && plan.gifts[v]) have.add(plan.gifts[v]);
    if (PLACES[p].needs) have.add(PLACES[p].needs);     // resident gives it when you talk
    if (plan.rewards[p]) have.add(plan.rewards[p]);
  }
  if (plan.puzzles.length !== PUZZLE_COUNT) return 'puzzle count ' + plan.puzzles.length;
  if (new Set(Object.values(plan.groups)).size !== PUZZLE_COUNT) return 'groups not distinct';
  return null;
}

if (typeof module !== 'undefined') module.exports = { generateIsland, checkIsland, fillText, makeRng };
