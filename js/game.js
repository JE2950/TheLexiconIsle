/* ════════════════════════════════════════════════════════════════
   THE LEXICON ISLE · GAME
   Runs one island built by story.js. Screens, clicks, narration,
   dialogue, machines, items, saving, Set Up, map and the ending.
   Questions come from the Station Zero engine in js/vr/ (unchanged).
   ════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const KEY = 'lexicon-isle-v3';

/* ════════ SAVED GAME ════════ */
function blankGame(seed) {
  return { seed: seed || randomSeed(), name: '', at: null, visited: {}, seen: {}, items: [], stones: {}, prog: {}, flags: {},
    stars: 0, answered: 0, started: 0, finished: 0, voice: true, music: true, sfx: true };
}
let G = blankGame();
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.seed) G = Object.assign(blankGame(s.seed), s); } catch (e) {}
const saveG = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} };
let PLAN = generateIsland(G.seed);

/* route helpers */
const idx = p => PLAN.route.indexOf(p);
const prevOf = p => PLAN.route[idx(p) - 1];
const nextOf = p => PLAN.route[idx(p) + 1];
const F = (t, p, extra) => fillText(t, PLAN, Object.assign({ stone: PLAN.stones[p], next: nextOf(p), place: p, left: 6 - stoneCount() }, extra || {}));
const stoneCount = () => PLAN.puzzles.filter(p => G.stones[p]).length;
const has = i => G.items.includes(i);
const charAt = p => PLAN.residents[p] || PLAN.visitors[p] || (p === PLAN.route[1] ? PLAN.giver : null);

/* ════════ NARRATION (bottom panel, read aloud) ════════ */
const plain = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
let lines = [], lineAt = 0, lineDone = null, lastSpoken = '', voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices();
  return vs.find(v => /en-GB/i.test(v.lang) && /Daniel|Serena|Kate|Arthur|Martha|Google UK English Female/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
function speak(text) {
  lastSpoken = text;
  if (!G.voice || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); voice = voice || pickVoice(); if (voice) u.voice = voice; u.lang = 'en-GB'; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
}
function shush() { try { speechSynthesis.cancel(); } catch (e) {} }
function say(list, done) { lines = (Array.isArray(list) ? list : [list]).filter(Boolean); lineAt = 0; lineDone = done || null; showLine(); }
function showLine() {
  const t = lines[lineAt]; if (t == null) return;
  const el = $('sayText'); el.innerHTML = t; el.scrollTop = 0;
  $('say').classList.remove('pulse'); void $('say').offsetWidth; $('say').classList.add('pulse');
  speak(plain(t));
  $('goon').disabled = !(lineAt < lines.length - 1 || lineDone);
}
$('goon').onclick = () => {
  sfx('click');
  if (lineAt < lines.length - 1) { lineAt++; showLine(); return; }
  const d = lineDone; lineDone = null; $('goon').disabled = true; if (d) d();
};
$('replay').onclick = () => { const was = G.voice; G.voice = true; speak(lastSpoken || plain($('sayText').innerHTML)); G.voice = was; };

/* ════════ DIALOGUE POPUP (characters) ════════ */
let talkLines = [], talkAt = 0, talkDone = null;
function talk(charId, list, done) {
  const C = CHARS[charId];
  $('kFace').src = C.face; $('kName').textContent = C.n; $('kRole').textContent = C.title;
  talkLines = list; talkAt = 0; talkDone = done || null;
  lines = []; lineDone = null; $('goon').disabled = true; $('cap').classList.remove('open');
  $('talk').classList.add('open'); showTalk();
}
function showTalk() {
  const t = talkLines[talkAt];
  $('kText').innerHTML = t; speak(plain(t));
  $('sayText').innerHTML = `<b>${$('kName').textContent}:</b> ${t}`;
  $('kNext').textContent = talkAt < talkLines.length - 1 ? 'Go on ▶' : 'Goodbye';
  $('kNext').focus();
}
$('kNext').onclick = () => {
  sfx('click');
  if (talkAt < talkLines.length - 1) { talkAt++; showTalk(); return; }
  $('talk').classList.remove('open');
  const d = talkDone; talkDone = null; if (d) d();
};

/* ════════ CAPTION (looking at things) ════════ */
let capTimer = null;
function caption(x, y, title, text) {
  const c = $('cap');
  c.innerHTML = `<b>${title}</b>${text}`;
  c.style.left = Math.min(Math.max(x, 18), 82) + '%';
  c.style.top = y + '%';
  c.classList.toggle('below', y < 35);
  c.classList.remove('open'); void c.offsetWidth; c.classList.add('open'); if (document.activeElement) document.activeElement.blur();
  clearTimeout(capTimer); capTimer = setTimeout(() => c.classList.remove('open'), 9000);
  say(text);
}
$('cap').onclick = () => $('cap').classList.remove('open');

/* ════════ POCKETS ════════ */
function give(i) {
  if (has(i)) return;
  G.items.push(i); saveG(); drawPocket(); sfx('item');
  const el = $('items').querySelector(`[data-i="${i}"]`); if (el) el.classList.add('new');
}
function drawPocket() {
  const shown = ['map', ...Object.keys(ITEMS).filter(k => k !== 'map' && has(k))];
  const cells = Array.from({ length: 5 }, (_, i) => {
    const k = shown[i]; if (!k || !has(k)) return '<div class="item"></div>';
    return `<div class="item" data-i="${k}" title="${ITEMS[k].n}"><img src="${ITEMS[k].img}" alt="${ITEMS[k].n}"></div>`;
  });
  $('items').innerHTML = cells.join('');
  $('stones').innerHTML = PLAN.puzzles.map(p => { const S = PLAN.stones[p], got = G.stones[p];
    return `<span class="st ${got ? 'on' : ''}" title="${got ? S.name : PLAN.premise.one + ': not found yet'}" style="${got ? `background:${S.colour};color:${S.colour}` : ''}"></span>`; }).join('');
  $('stars').textContent = '★ ' + G.stars;
}

/* ════════ SCENES ════════ */
const ARROW = { right: 'M8 24h30V10l22 22-22 22V40H8z', left: 'M58 24H28V10L6 32l22 22V40h30z', up: 'M24 58V28H10L32 6l22 22H40v30z', down: 'M24 8v30H10l22 22 22-22H40V8z' };
function go(id, quiet) {
  const P = PLACES[id]; if (!P) return;
  closeMachine(true); $('cap').classList.remove('open'); $('talk').classList.remove('open');
  G.at = id; const firstTime = !G.visited[id]; G.visited[id] = true; saveG();
  $('scene').classList.add('fade'); sfx('step');
  setTimeout(() => {
    $('bg').src = P.img; $('bg').alt = P.name;
    $('tt').textContent = P.name;
    drawScene();
    $('scene').classList.remove('fade');
    if (quiet) return;
    if (firstTime) say(P.first.map(t => F(t, id)));
    else say(`You are back at ${P.name}.`);
  }, 260);
}
function drawScene() { drawHots(); drawMarks(); }
function hotspots(id) {
  const P = PLACES[id], list = [];
  (P.looks || []).forEach((l, i) => list.push({ kind: 'look', x: l.x, y: l.y, n: l.n, i }));
  if (P.pz) list.push({ kind: 'pz', x: P.pz.x, y: P.pz.y, n: P.pz.n });
  const c = charAt(id);
  if (c) { const fixedHere = CHARS[c].fixed === id; const spot = P.spot || { x: 50, y: 50 }; list.push({ kind: 'char', c, x: spot.x, y: spot.y, n: fixedHere || id === PLAN.route[1] ? CHARS[c].n : CHARS[c].n + ', ' + CHARS[c].title }); }
  return list;
}
function drawHots() {
  const id = G.at, P = PLACES[id];
  let h = hotspots(id).map((s, k) => `<button class="hot ${G.seen[id + k] ? 'seen' : ''} ${s.kind}" data-k="${k}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.n}"></button><span class="tip" style="left:${s.x}%;top:${s.y}%">${s.n}</span>`).join('');
  ['back', 'fwd'].forEach(w => {
    const e = P.exits && P.exits[w]; const to = w === 'back' ? prevOf(id) : nextOf(id);
    if (!e || !to) return;
    h += `<button class="arrow" data-w="${w}" style="left:${e.x}%;top:${e.y}%" aria-label="To ${PLACES[to].name}"><svg viewBox="0 0 64 64"><path d="${ARROW[e.d]}" fill="#fff" stroke="#000" stroke-width="3" stroke-linejoin="round"/></svg></button><span class="tip" style="left:${e.x}%;top:${e.y}%">To ${PLACES[to].name}</span>`;
  });
  $('hots').innerHTML = h;
}
$('hots').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  sfx('click');
  if (b.dataset.k != null) {
    const s = hotspots(G.at)[+b.dataset.k]; G.seen[G.at + b.dataset.k] = true; saveG(); b.classList.add('seen');
    if (s.kind === 'look') { const L = PLACES[G.at].looks[s.i]; caption(L.x, L.y, L.n, F(L.t, G.at)); }
    if (s.kind === 'pz') openMachine(G.at);
    if (s.kind === 'char') meet(s.c);
    return;
  }
  if (b.dataset.w) travel(b.dataset.w);
};
function travel(w) {
  const here = G.at, to = w === 'back' ? prevOf(here) : nextOf(here);
  if (!to) return;
  if (w === 'fwd') {
    const block = blocked(here, to);
    if (block) { say(block); sfx('no'); return; }
  }
  go(to);
}
function blocked(here, to) {
  const P = PLACES[here];
  if (here === PLAN.route[1] && !G.flags.metGiver) return `${CHARS[PLAN.giver].n} catches your sleeve and points at her slate. She wants to talk to you first.`;
  if (P.role === 'puzzle' && !G.stones[here]) return F(`Something tells you not to leave ${P.name} yet. The {one} here is still hidden.`, here);
  if (PLACES[to].role === 'final' && stoneCount() < 6) return F(`The path to {final} is wrapped in grey mist. You need all six {many}. You have ${stoneCount()}.`, here);
  const need = PLAN.locks[to];
  if (need && !has(need)) return F(LOCKTEXT[ITEMS[need].lock], here, { place: to });
  if (need && has(need) && !G.flags['used_' + need]) { G.flags['used_' + need] = true; saveG(); setTimeout(() => say(`You use ${ITEMS[need].n}. The way to ${PLACES[to].name} is open.`), 400); }
  return null;
}

/* things drawn onto a picture to show progress */
function drawMarks() {
  const id = G.at, p = G.prog[id] || 0, done = G.stones[id];
  let h = '';
  if (id === 'cave') ['O', 'P', 'E', 'N', 'S'].forEach((c, i) => { if (i < p || done) h += `<span class="mark dial" style="left:${43.6 + i * 3}%;top:45.8%">${c}</span>`; });
  if (id === 'wood' && done) h += `<span class="mark carve" style="left:23%;top:52%">◀ ${PLACES[prevOf(id)].short}</span><span class="mark carve" style="left:45%;top:46%">${PLACES[nextOf(id)].short} ▶</span>`;
  if (id === 'tower') [[55.7, 46.9], [65.6, 57.8], [61.3, 70.8], [50.4, 70.8], [46.5, 57.8]].forEach(([x, y], i) => { if (i < p || done) h += `<span class="mark cog" style="left:${x}%;top:${y}%"></span>`; });
  if (PLACES[id].hollows) PLAN.puzzles.forEach(q => { const S = PLAN.stones[q]; if (G.stones[q]) { const [x, y] = PLACES[id].hollows[S.slot]; h += `<span class="mark gem" style="left:${x}%;top:${y}%;background:${S.colour};color:${S.colour}"></span>`; } });
  $('marks').innerHTML = h;
}

/* ════════ PEOPLE ════════ */
function meet(c) {
  const C = CHARS[c], here = G.at;
  const writes = C.slate ? 'writes on her slate' : 'cannot speak, so writes in a little notebook';
  if (here === PLAN.route[1] && c === PLAN.giver) {
    if (!G.flags.metGiver) {
      talk(c, [
        F(`<i>She smiles, takes a stick of chalk and ${C.slate ? 'writes on her slate' : 'writes'}.</i><br>"Welcome, stranger. I am ${C.n}, ${C.title}. Forgive me. {mute}."`, here),
        F('"Three nights ago {villain} {arrive}. It took {stolen} and hid them away in six {many}."', here),
        F('"Find all six {many} and take them to {final}. Then {back}."', here),
        F('"The {many} are locked inside puzzles of words. You look like someone who is good with words."', here),
        `<i>${C.n} hands you a folded map of the island.</i>`,
      ], () => { G.flags.metGiver = true; give('map'); saveG(); drawScene(); say(F(`${C.n}'s map is in your pocket. The way on is open. Use Map at the top to travel back to places you have been.`, here)); });
      return;
    }
    const n = stoneCount();
    talk(c, [n >= 6 ? F('"All six! Go to {final}. Quickly!"', here) : F(`"${n ? n + ' of the {many}! I can almost hear the gulls again.' : 'Have you found any {many} yet?'} The next one is waiting at ${PLACES[nextTarget()].name}."`, here)]);
    return;
  }
  if (PLACES[here].resident === c) {           // Ossian and his shuttle
    if (!has(PLACES[here].needs)) {
      talk(c, ['<i>The weaver cannot speak, so he mimes instead. He points at his loom, then at the broken threads, then at you.</i>',
        '<i>His cloth used to weave words together. Now every thread has been unpicked.</i>',
        `<i>He presses a wooden shuttle into your hand.</i>`], () => { give(PLACES[here].needs); say("You have the weaver's shuttle. Now you can use the loom."); });
    } else talk(c, [G.stones[here] ? F('"Thank you, friend! I can speak again. Go on to {nextName}, and good luck."', here) : '<i>He nods at the loom and makes a weaving motion with his hands.</i>']);
    return;
  }
  // a wandering character
  const gift = PLAN.gifts[c], firstMeet = !G.flags['met_' + c];
  const R = makeRng(G.seed + idx(here) * 31);
  const chat = F(`<i>${C.n} ${R.pick(CHATTER).replace('{left}', String(Math.max(1, 6 - stoneCount())))}</i>`, here);
  const ls = firstMeet ? [`<i>${C.n}, ${C.title}, looks up in surprise. ${C.n} ${writes}.</i>`, chat] : [chat];
  if (gift && !has(gift)) ls.push(`<i>${C.n} rummages in a bag and hands you ${ITEMS[gift].n}. "You will need this further on," says the note.</i>`);
  talk(c, ls, () => { G.flags['met_' + c] = true; if (gift) give(gift); saveG(); });
}

/* ════════ MACHINES ════════ */
const groupTopics = g => g === 'mixed' || !g ? null : GROUPS.find(x => x.id === g).topics.map(t => t[0]);
let M = null;
function openMachine(id) {
  const P = PLACES[id], isFinal = P.role === 'final';
  if (G.stones[id] || (isFinal && G.flags.won)) { say('You have already solved this.'); return; }
  if (isFinal && stoneCount() < 6) { say(F(`There are six hollows here. You have ${stoneCount()} of the {many}. Come back with all six.`, id)); return; }
  if (P.needs && !has(P.needs)) { say(`You need something to work the ${P.pz.n.toLowerCase()} with. Perhaps someone nearby can help.`); return; }
  const group = isFinal ? 'mixed' : PLAN.groups[id];
  M = { id, P, group, need: PLAN.need[id], filled: isFinal ? 0 : (G.prog[id] || 0), lives: isFinal ? 3 : 0, q: null, st: null, tries: 0 };
  $('mTitle').textContent = P.pz.title;
  $('mSub').textContent = isFinal ? F('Answer eight riddles. Get three wrong and {villain} keeps its hold.', id) : `${GROUP_NAMES[group]} · ${F(P.pz.intro, id)}`;
  $('machine').classList.add('open'); $('hots').style.pointerEvents = 'none';
  if (isFinal) say(F('You set the six {many} into the hollows. They blaze with light, and a deep voice rolls out of the stone: "Answer my riddles, traveller."', id));
  drawSlots(); nextQ(); sfx('open');
}
function drawSlots() {
  let h = Array.from({ length: M.need }, (_, i) => `<span class="slot ${i < M.filled ? 'full' : ''}">${i < M.filled ? M.P.pz.slot(i) : ''}</span>`).join('');
  if (M.lives) h += '<span class="gap"></span>' + Array.from({ length: 3 }, (_, i) => `<span class="slot life ${i < M.lives ? 'full' : ''}">${i < M.lives ? '♥' : ''}</span>`).join('');
  $('slots').innerHTML = h;
}
function nextQ() {
  const q = makeQuestion(groupTopics(M.group));
  M.q = q; M.tries = 0;
  $('mPrompt').innerHTML = `<div class="qlabel">${q.label}</div>${q.prompt}`;
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
    M.filled++; if (PLACES[M.id].role !== 'final') G.prog[M.id] = M.filled;
    G.answered++; saveG(); drawPocket(); drawSlots(); drawMarks();
    const v = M.tries === 1 ? pick(['Spot on!', 'Correct!', 'Well cracked!', 'Brilliant!', 'Exactly right!']) : 'Got it on the second try!';
    $('mFeed').innerHTML = `<div class="fb good"><b class="v">${v}${M.tries === 1 ? ' ★' : ''}</b>${q.explain || ''}</div>`;
    speak(v); sfx(M.filled >= M.need ? 'win' : 'right');
    finishStep();
  } else if (M.tries === 1) {
    answerRetry(st, $('ans'), sel);
    $('mFeed').innerHTML = `<div class="fb bad"><b class="v">Not quite. Have another go.</b>Press <b>How?</b> for the method.</div>`;
    speak('Not quite. Have another go.'); sfx('wrong');
  } else {
    record(q, false); answerReveal(st, $('ans'), sel); G.answered++;
    if (M.lives) M.lives--;
    saveG(); drawSlots();
    $('mFeed').innerHTML = `<div class="fb bad"><b class="v">The answer was ${esc(answerText(q))}.</b>${q.explain || ''}</div>`;
    speak('The answer was ' + answerText(q).replace(/^[A-E]: /, '')); sfx('wrong');
    finishStep();
  }
}
function finishStep() {
  const done = M.filled >= M.need, dead = M.lives === 0 && PLACES[M.id].role === 'final';
  $('mNext').disabled = false; $('mNext').textContent = done ? 'Finish ▶' : dead ? 'Oh no ▶' : 'Next ▶';
  setTimeout(() => $('mNext').focus(), 50);
}
$('mNext').onclick = () => {
  if (!M) return;
  const id = M.id, P = M.P;
  if (M.filled >= M.need) { closeMachine(); solved(id); return; }
  if (M.lives === 0 && P.role === 'final') {
    closeMachine();
    say([F('The {many} flicker and go dark. {Villain} swirls round you, cold and grey.', id), 'But the stones are still in their hollows. Take a breath, and try the riddles again.']);
    return;
  }
  nextQ();
};
function solved(id) {
  const P = PLACES[id];
  if (P.role === 'final') { ending(); return; }
  G.stones[id] = true; const reward = PLAN.rewards[id]; saveG();
  const ls = [F(P.pz.win, id), F(`<b>You have found the ${PLAN.stones[id].name}!</b> That makes ${stoneCount()} of six.`, id)];
  if (reward) ls.push(`Underneath it you find ${ITEMS[reward].n}. That could be useful.`);
  ls.push(stoneCount() >= 6 ? F('All six {many}! Now to {final}.', id) : F('{heard}', id));
  say(ls); if (reward) give(reward);
  drawPocket(); drawScene(); sfx('stone'); flash();
}
$('mHow').onclick = () => {
  if (!M || !M.q) return;
  const el = $('mFeed').querySelector('.fb.how'); if (el) { el.remove(); return; }
  $('mFeed').insertAdjacentHTML('afterbegin', `<div class="fb how"><b class="v">How to do it</b>${M.q.how}</div>`);
  speak(plain(M.q.how));
};
$('mLeave').onclick = () => { if (!M) return; const fin = M.P.role === 'final'; closeMachine(); say(fin ? 'You step back. The riddles will start again when you return.' : 'You step back. What you have done so far stays done.'); };
function closeMachine(silent) { $('machine').classList.remove('open'); $('hots').style.pointerEvents = ''; M = null; if (silent) shush(); }

/* ════════ HINT ════════ */
function nextTarget() { return PLAN.puzzles.find(p => !G.stones[p]) || PLAN.final; }
function hint() {
  sfx('click');
  const here = G.at, target = nextTarget();
  let t, glow = null;
  if (!G.flags.metGiver && here !== PLAN.route[0]) { t = `Talk to ${CHARS[PLAN.giver].n} in ${PLACES[PLAN.route[1]].name}.`; glow = here === PLAN.route[1] ? '.hot.char' : '.arrow[data-w="fwd"]'; }
  else if (target === here) {
    const P = PLACES[here];
    if (P.needs && !has(P.needs)) { t = `Talk to ${CHARS[P.resident].n}.`; glow = '.hot.char'; }
    else { t = `Solve the puzzle here: ${P.pz.n.toLowerCase()}.`; glow = '.hot.pz'; }
  } else if (!G.flags.metGiver && here === PLAN.route[0]) { t = G.stones[here] ? `Follow the path to ${PLACES[PLAN.route[1]].name}.` : `Solve the puzzle here: ${PLACES[here].pz.n.toLowerCase()}.`; glow = G.stones[here] ? '.arrow[data-w="fwd"]' : '.hot.pz'; }
  else {
    const lock = PLAN.locks[nextOf(here)];
    t = `Head for ${PLACES[target].name}.` + (lock && !has(lock) && idx(target) > idx(here) ? ` The way ahead needs ${ITEMS[lock].n}. Look and talk to people along the way.` : '');
    glow = idx(target) > idx(here) ? '.arrow[data-w="fwd"]' : '.arrow[data-w="back"]';
  }
  say('Hint: ' + t);
  if (glow) document.querySelectorAll(glow).forEach(el => { el.classList.add('hinted'); setTimeout(() => el.classList.remove('hinted'), 4500); });
}

/* ════════ ENDING ════════ */
function ending() {
  G.flags.won = true; if (!G.finished) G.finished = Date.now(); saveG();
  sfx('stone'); flash();
  say([F('The last riddle is answered. Light pours out of the {many} and rolls down the hillside like a wave.', G.at),
    'Then you hear it. Gulls. Waves. Wind in the trees. And from the village far below, voices. Hundreds of voices, all talking at once.'], () => {
    go('party', true);
    setTimeout(() => talk(PLAN.giver, [F('"You did it! Listen to them all!"', 'party'), F('"You gave us back {stolen}. Lexicon Isle will never forget your name."', 'party')], certificate), 700);
  });
}
function certificate() {
  const d = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const mins = G.started && G.finished ? Math.max(1, Math.round((G.finished - G.started) / 60000)) : null;
  dialog(`<div class="cert"><div class="small">This certifies that</div><div class="nm">${esc(G.name || 'Traveller')}</div>
    <div>${F('defeated {villain}, found all six {many}, and is named', 'party')}</div><h2>Keeper of Words</h2>
    <p class="cstars">★ ${G.stars} stars from ${G.answered} answers</p>
    <p class="small">Island No. ${G.seed} · ${d}${mins ? ` · ${mins} minute${mins === 1 ? '' : 's'}` : ''} · ${AGES.find(a => a.id === age()).label}</p>
    <div class="radios" style="justify-content:center;margin-top:10px"><button onclick="closeDlg()">Wander the island</button><button onclick="closeDlg();newIsland()"><b>Sail to a new island</b></button></div></div>`);
}

/* ════════ DIALOGS: title, set up, map, help ════════ */
function dialog(html) { $('dlgIn').innerHTML = html; $('dlg').classList.add('open'); }
function closeDlg() { $('dlg').classList.remove('open'); }
$('dlg').onclick = e => { if (e.target === $('dlg')) closeDlg(); };
function yearButtons() { return `<div class="radios" id="years">${AGES.map(a => `<button data-age="${a.id}" aria-pressed="${a.id === age()}"><b>${a.label}</b><small>${a.note}</small></button>`).join('')}</div>`; }
function bindYears(root) { root.querySelectorAll('[data-age]').forEach(b => b.onclick = () => { SAVE.age = +b.dataset.age; persist(); root.querySelectorAll('[data-age]').forEach(x => x.setAttribute('aria-pressed', x === b)); }); }

function titleScreen() {
  $('titleArt').classList.add('open');
  const cont = G.name && G.started;
  $('titleBox').innerHTML = `<div class="panel"><div class="ph">${cont ? 'Welcome back' : 'A new adventure'}</div><div class="pb">
    ${cont ? `<p style="font-size:20px">Welcome back, <b>${esc(G.name)}</b>. You are on Island No. ${G.seed} with ${stoneCount()} of 6 ${PLAN.premise.many}.</p>
      <div class="radios" style="margin-top:10px"><button id="tContinue"><b>Continue ▶</b></button><button id="tNew">Sail to a new island</button></div>`
    : `<h3>What is your name, traveller?</h3><input class="name" id="tName" maxlength="20" placeholder="Your name" autocomplete="off">
      <h3>Which year are you in?</h3>${yearButtons()}
      <p class="small" style="margin-top:10px">Every voyage finds a different island. This one is <b>Island No. <span id="tSeed">${G.seed}</span></b>. <a href="#" id="tReroll">Choose another</a></p>
      <div class="radios" style="margin-top:12px"><button id="tStart" class="go"><b>Set sail ▶</b></button></div>`}
  </div></div>`;
  say('Welcome to The Lexicon Isle.');
  if (cont) {
    $('tContinue').onclick = () => { startMusic(); $('titleArt').classList.remove('open'); go(G.flags.won ? 'party' : G.at || PLAN.route[0]); };
    $('tNew').onclick = () => { $('titleBox').querySelector('.pb').insertAdjacentHTML('beforeend', `<p style="margin-top:12px">This leaves your current island behind. Sure?</p><div class="radios"><button id="tWipe"><b>Yes, new island</b></button></div>`); $('tWipe').onclick = () => newIsland(); };
  } else {
    bindYears($('titleBox'));
    const n = $('tName'); n.focus(); n.onkeydown = e => { if (e.key === 'Enter') $('tStart').click(); };
    $('tReroll').onclick = e => { e.preventDefault(); G.seed = randomSeed(); PLAN = generateIsland(G.seed); $('tSeed').textContent = G.seed; drawPocket(); };
    $('tStart').onclick = () => {
      if (!n.value.trim()) { n.focus(); n.classList.add('shake'); setTimeout(() => n.classList.remove('shake'), 400); return; }
      G = Object.assign(blankGame(G.seed), { name: n.value.trim(), started: Date.now(), voice: G.voice, music: G.music, sfx: G.sfx });
      PLAN = generateIsland(G.seed);
      saveG(); drawPocket(); startMusic(); $('titleArt').classList.remove('open'); go(PLAN.route[0]);
      if (!localStorage.getItem('lexicon-isle-helped')) { try { localStorage.setItem('lexicon-isle-helped', '1'); } catch (e) {} setTimeout(help, 900); }
    };
  }
}
function newIsland(seed) {
  const keep = { voice: G.voice, music: G.music, sfx: G.sfx, name: G.name };
  G = Object.assign(blankGame(seed || randomSeed()), keep, { name: '' });
  PLAN = generateIsland(G.seed); saveG(); drawPocket(); preload(); closeDlg(); titleScreen();
  if (keep.name) setTimeout(() => { const n = $('tName'); if (n) n.value = keep.name; }, 0);
}
function setup() {
  dialog(`<div class="panel"><div class="ph">Set Up</div><div class="pb">
    <h3>Year group</h3><p class="small">Changes how hard the questions are. Year 4 and 5 show an alphabet strip for codes.</p>${yearButtons()}
    <h3>Sound</h3><div class="radios"><button id="sVoice" aria-pressed="${G.voice}">Narrator voice</button><button id="sMusic" aria-pressed="${G.music}">Music</button><button id="sSfx" aria-pressed="${G.sfx}">Sound effects</button></div>
    <h3>Island</h3><p class="small">You are on <b>Island No. ${G.seed}</b>. Give a class the same number and everyone gets the same island.</p>
    <div class="radios"><input class="name" id="sSeed" inputmode="numeric" placeholder="Island number" style="width:200px;font-size:18px"><button id="sGo">Sail there</button><button id="sRand">Random island</button></div>
    <h3>Start from (for teachers)</h3><p class="small">Jump to any place on this island. Earlier ${PLAN.premise.many} and items are given to you.</p>
    <div class="mapgrid">${PLAN.route.map(k => `<button data-jump="${k}">${PLACES[k].name}<small>${PLAN.groups[k] ? GROUP_NAMES[PLAN.groups[k]] : PLACES[k].role === 'final' ? 'Final riddles' : ''}</small></button>`).join('')}</div>
    <h3>Progress</h3><p>${stoneCount()} of 6 ${PLAN.premise.many} · ★ ${G.stars} · ${G.answered} answers on this island</p>
    ${reportHTML()}
    <div class="radios"><button id="sClose" class="go"><b>Close</b></button></div>
  </div></div>`);
  bindYears($('dlgIn'));
  const tog = (id, k, after) => $(id).onclick = e => { G[k] = !G[k]; saveG(); e.currentTarget.setAttribute('aria-pressed', G[k]); syncTop(); if (after) after(); };
  tog('sVoice', 'voice', () => { if (!G.voice) shush(); }); tog('sMusic', 'music', startMusic); tog('sSfx', 'sfx');
  $('sClose').onclick = closeDlg;
  $('sGo').onclick = () => { const v = parseInt($('sSeed').value, 10); if (v > 0) newIsland(v); };
  $('sRand').onclick = () => newIsland();
  $('dlgIn').querySelectorAll('[data-jump]').forEach(b => b.onclick = () => { jump(b.dataset.jump); closeDlg(); });
}
/* how the pupil is doing on each question type (records kept by the question engine) */
function reportHTML() {
  const rows = GROUPS.map(g => {
    const ts = g.topics.map(([id, name]) => ({ name, s: SAVE.stats['t:' + id] })).filter(x => x.s && x.s.r + x.s.w > 0);
    if (!ts.length) return '';
    return `<tr class="gh"><td colspan="3">${g.name}</td></tr>` + ts.map(x => { const n = x.s.r + x.s.w, pc = Math.round(100 * x.s.r / n);
      return `<tr><td>${x.name}</td><td>${x.s.r} / ${n}</td><td><span class="bar"><i style="width:${pc}%;background:${pc >= 75 ? '#3fae68' : pc >= 50 ? '#e0a52a' : '#c4463a'}"></i></span></td></tr>`; }).join('');
  }).join('');
  return rows ? `<details class="report"><summary>Question record (all islands on this device)</summary><table>${rows}</table><p class="small">Green 75% or more · amber 50 to 74% · red below 50%. Topics answered wrongly come up more often.</p></details>` : '';
}
function jump(to) {
  if (!G.name) G.name = 'Traveller';
  if (!G.started) G.started = Date.now();
  const i = idx(to);
  PLAN.route.slice(0, i).forEach(p => {
    G.visited[p] = true;
    if (PLAN.stones[p]) G.stones[p] = true;
    if (PLAN.rewards[p]) give(PLAN.rewards[p]);
    const v = PLAN.visitors[p]; if (v && PLAN.gifts[v]) give(PLAN.gifts[v]);
    if (PLACES[p].needs) give(PLACES[p].needs);
  });
  if (i > 1) { G.flags.metGiver = true; give('map'); }
  saveG(); drawPocket(); $('titleArt').classList.remove('open'); startMusic(); go(to);
}
function mapDlg() {
  if (!has('map')) { say(`You do not have a map yet. Perhaps someone in ${PLACES[PLAN.route[1]].name} has one.`); return; }
  dialog(`<div class="panel"><div class="ph">${CHARS[PLAN.giver].n}'s map · Island No. ${G.seed}</div><div class="pb"><p>Click a place you have visited to travel there.</p>
    <div class="mapgrid">${PLAN.route.map(k => `<button data-go="${k}" ${G.visited[k] ? '' : 'disabled'}>${G.visited[k] ? PLACES[k].name : '? ? ?'}<small>${!G.visited[k] ? 'Not visited yet' : PLAN.stones[k] ? (G.stones[k] ? PLAN.stones[k].name + ' found ✓' : PLAN.premise.one + ' still hidden') : ''}</small></button>`).join('')}</div>
    <div class="radios" style="margin-top:12px"><button onclick="closeDlg()">Close</button></div></div></div>`);
  $('dlgIn').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { closeDlg(); go(b.dataset.go); });
}
function help() {
  dialog(`<div class="panel"><div class="ph">How to play</div><div class="pb howto">
    <p><span class="k hotk"></span><span>Look closely at each picture. <b>Small flashing squares</b> mark things you can click: things to look at, people to talk to, and the puzzles that hide the treasure.</span></p>
    <p><span class="k ark"><svg viewBox="0 0 64 64"><path d="${ARROW.right}" fill="#fff" stroke="#000" stroke-width="3"/></svg></span><span><b>White arrows</b> take you to the next place or back again. Some paths are blocked until you find the right item.</span></p>
    <p><span class="k gok">Go on ▶</span><span>moves the story on. The narrator reads everything aloud (turn the voice off at the top).</span></p>
    <p><span class="k">💡</span><span>Stuck? Press <b>Hint</b> at the top.</span></p>
    <p style="display:block">In a puzzle: click an answer, read the explanation, then press <b>Next ▶</b>. A wrong answer gets one more try. <b>How?</b> shows the method.</p>
    <p class="small" style="display:block">Keys: A to E answer · Enter = Go on / Next · H = How? · M = Map</p>
    <div class="radios" style="margin-top:10px"><button onclick="closeDlg()" class="go"><b>Got it</b></button></div></div></div>`);
}

/* ════════ MUSIC AND SOUND (Web Audio; music/theme.mp3 is used if present) ════════ */
let actx = null, master = null, seqTimer = null, nextT = 0, step = 0, useSynth = false;
function ac() { try { if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0.8; master.connect(actx.destination); } if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; } }
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
function tone(t, f, dur, type, vol) {
  const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const MEL = [76, 0, 74, 72, 0, 69, 0, 0, 72, 0, 74, 0, 76, 0, 79, 0, 76, 0, 74, 72, 0, 67, 0, 0, 71, 0, 72, 0, 74, 0, 0, 0,
  81, 0, 79, 76, 0, 74, 0, 72, 74, 0, 76, 0, 72, 0, 0, 0, 79, 0, 76, 74, 0, 72, 0, 71, 72, 0, 0, 74, 71, 0, 0, 0];
function synthTick() {
  const spb = 60 / 84 / 2;
  while (nextT < actx.currentTime + 0.25) {
    const ch = CHORDS[Math.floor(step / 8) % 4], s8 = step % 8;
    tone(nextT, mf(ch[[0, 1, 2, 1, 0, 1, 2, 1][s8]] + (s8 >= 4 ? 12 : 0)), 0.35, 'triangle', 0.03);
    if (s8 === 0) ch.forEach(n => tone(nextT, mf(n), 2.6, 'sine', 0.016));
    if (s8 % 4 === 0) tone(nextT, mf(ch[0] - 24), 0.6, 'sine', 0.06);
    const m = MEL[step % 64]; if (m && step >= 32) tone(nextT, mf(m), 0.45, 'square', 0.01);
    nextT += spb; step = (step + 1) % 128;
  }
}
function synthStart() { if (!ac() || seqTimer) return; nextT = actx.currentTime + 0.1; seqTimer = setInterval(synthTick, 60); }
function synthStop() { if (seqTimer) { clearInterval(seqTimer); seqTimer = null; } }
function startMusic() {
  const a = $('music'); a.volume = 0.3;
  if (!G.music) { a.pause(); synthStop(); return; }
  if (useSynth) { synthStart(); return; }
  const p = a.play(); if (p && p.catch) p.catch(() => { useSynth = true; synthStart(); });
}
$('music').addEventListener('error', () => { useSynth = true; if (G.music) synthStart(); });
function sfx(kind) {
  if (!G.sfx) return; const a = ac(); if (!a) return; const t = a.currentTime + 0.01;
  ({ click: [[880, 0, .04, 'square', .02]], step: [[220, 0, .08, 'triangle', .04], [180, .09, .08, 'triangle', .04]], no: [[150, 0, .2, 'square', .03]],
    open: [[392, 0, .1, 'triangle', .06], [523, .08, .15, 'triangle', .06]], item: [[660, 0, .12, 'triangle', .08], [990, .1, .2, 'triangle', .08]],
    right: [[784, 0, .12, 'triangle', .08], [1047, .09, .25, 'triangle', .08]], wrong: [[196, 0, .22, 'sawtooth', .035], [165, .12, .3, 'sawtooth', .035]],
    win: [[523, 0, .15, 'triangle', .08], [659, .12, .15, 'triangle', .08], [784, .24, .15, 'triangle', .08], [1047, .36, .5, 'triangle', .09]],
    stone: [[523, 0, .2, 'sine', .1], [784, .15, .2, 'sine', .1], [1047, .3, .2, 'sine', .1], [1319, .45, .8, 'sine', .1]] }[kind] || [])
    .forEach(([f, d, dur, type, vol]) => tone(t + d, f, dur, type, vol));
}
function flash() { const el = $('flash'); el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }

/* ════════ TOP BAR, KEYS, SCALING, START ════════ */
function syncTop() { $('btnVoice').setAttribute('aria-pressed', G.voice); $('btnMusic').setAttribute('aria-pressed', G.music); }
$('btnVoice').onclick = () => { G.voice = !G.voice; saveG(); syncTop(); if (!G.voice) shush(); };
$('btnMusic').onclick = () => { G.music = !G.music; saveG(); syncTop(); startMusic(); };
$('btnSetup').onclick = setup; $('btnMap').onclick = mapDlg; $('btnHelp').onclick = help; $('btnHint').onclick = hint;
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (M && M.st) { const i = 'abcde'.indexOf(e.key.toLowerCase()), n = '12345'.indexOf(e.key); if (i >= 0 || n >= 0) { answerKey(M.st, i >= 0 ? i : n); return; } }
  if (e.key === 'Escape') { if ($('dlg').classList.contains('open')) closeDlg(); else $('cap').classList.remove('open'); }
  if (e.key === 'Enter' || e.key === ' ') {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    if ($('talk').classList.contains('open')) { $('kNext').click(); e.preventDefault(); }
    else if (M && !$('mNext').disabled) { $('mNext').click(); e.preventDefault(); }
    else if (!$('goon').disabled) { $('goon').click(); e.preventDefault(); }
  }
  if (e.key === 'm' || e.key === 'M') mapDlg();
  if ((e.key === 'h' || e.key === 'H') && M) $('mHow').click();
});
function fit() { const s = Math.min(innerWidth / 1024, innerHeight / 960); $('win').style.transform = `scale(${s})`; }
addEventListener('resize', fit); fit();
function preload() { PLAN.route.concat('party').forEach(p => { const i = new Image(); i.src = PLACES[p].img; }); Object.values(CHARS).forEach(c => { if (c.art) { const i = new Image(); i.src = c.face; } }); }
syncTop(); drawPocket(); preload();
$('bg').src = PLACES[G.at || PLAN.route[0]].img;
titleScreen();
