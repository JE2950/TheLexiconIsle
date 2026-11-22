// node tools/test_story.js [islands] [--all-art]
// Builds many islands and checks every one can be finished, and that all text tokens fill.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { console, Math, JSON, Set, Object, Array, String, Number };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'js/story.js'), 'utf8') +
  '\nthis.PLACES=PLACES;this.CHARS=CHARS;this.ITEMS=ITEMS;this.generateIsland=generateIsland;this.checkIsland=checkIsland;this.fillText=fillText;', ctx);
const N = +process.argv[2] || 3000;
if (process.argv.includes('--all-art')) { [ctx.PLACES, ctx.CHARS, ctx.ITEMS].forEach(o => Object.values(o).forEach(v => v.art = true)); console.log('(pretending all art exists)'); }
let bad = 0; const seen = { routes: new Set(), locks: 0, gifts: 0, visitors: 0 };
for (let s = 1; s <= N; s++) {
  const plan = ctx.generateIsland(s);
  const err = ctx.checkIsland(plan);
  if (err) { bad++; if (bad < 10) console.log('seed', s, err); }
  // same seed, same island
  if (JSON.stringify(ctx.generateIsland(s).route) !== JSON.stringify(plan.route)) { bad++; console.log('seed', s, 'not repeatable'); }
  // every text line fills
  plan.route.forEach((p, i) => {
    const P = ctx.PLACES[p];
    const lines = [...(P.first || []), ...(P.looks || []).map(l => l.t), P.pz && P.pz.intro, P.pz && P.pz.win].filter(Boolean);
    lines.forEach(t => { const f = ctx.fillText(t, plan, { stone: plan.stones[p], next: plan.route[i + 1], place: p, left: 3 }); if (/\{\w+\}/.test(f)) { bad++; if (bad < 10) console.log('seed', s, p, 'unfilled:', f); } });
  });
  seen.routes.add(plan.route.join('>')); seen.locks += Object.keys(plan.locks).length; seen.gifts += Object.keys(plan.gifts).length; seen.visitors += Object.keys(plan.visitors).length;
}
console.log(`${N} islands · ${seen.routes.size} different routes · ${(seen.locks / N).toFixed(2)} locked paths, ${(seen.gifts / N).toFixed(2)} character gifts, ${(seen.visitors / N).toFixed(2)} visitors per island`);
console.log(bad ? `${bad} PROBLEMS` : 'every island can be finished');
process.exit(bad ? 1 : 0);
