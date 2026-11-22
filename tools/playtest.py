"""Plays whole islands through the real page with mouse clicks.
   pip install playwright && python -m playwright install chromium
   python tools/playtest.py [seed ...]"""
import sys, os, threading, functools, http.server
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT); H.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_port}/index.html'
seeds = [int(s) for s in sys.argv[1:]] or [1234, 4821, 77777]
fails = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for seed in seeds:
        pg = b.new_page(viewport={'width': 1024, 'height': 960}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(300)
        pg.evaluate(f"localStorage.clear(); localStorage.setItem('lexicon-isle-helped','1'); G.seed={seed}; PLAN=generateIsland({seed}); $('tSeed').textContent={seed}")
        pg.fill('#tName', 'Tester'); pg.click('#tStart'); pg.wait_for_timeout(500)
        def ev(js): return pg.evaluate(js)
        def goon():
            for _ in range(15):
                if ev("!$('goon').disabled"): pg.click('#goon'); pg.wait_for_timeout(30)
                else: break
        def talk_through():
            for _ in range(12):
                if ev("$('talk').classList.contains('open')"): pg.click('#kNext'); pg.wait_for_timeout(30)
                else: break
        def solve():
            n = 0
            while ev("!!M") and n < 40:
                q = ev("({k:M.q.kind,a:M.q.answer})")
                if q['k'] == 'mc': pg.click(f'#ans [data-o="{q["a"]}"]')
                elif q['k'] == 'pair': pg.click(f'#ans [data-g="0"][data-o="{q["a"][0]}"]'); pg.click(f'#ans [data-g="1"][data-o="{q["a"][1]}"]')
                else: [pg.click(f'#ans [data-o="{a}"]') for a in q['a']]
                pg.click('#mNext'); pg.wait_for_timeout(20); n += 1
            return n
        log = []
        for step in range(30):
            goon()
            at = ev('G.at')
            if ev('G.flags.won'): break
            kinds = ev("hotspots(G.at).map(h=>h.kind)")
            if 'char' in kinds:
                k = kinds.index('char'); pg.click(f'.hot[data-k="{k}"]'); pg.wait_for_timeout(60); talk_through(); goon()
            if 'pz' in kinds and not ev("G.stones[G.at]"):
                k = kinds.index('pz'); pg.click(f'.hot[data-k="{k}"]'); pg.wait_for_timeout(60)
                n = solve(); log.append(f'{at}:{n}'); goon(); pg.wait_for_timeout(100)
                if ev('G.flags.won'): goon(); pg.wait_for_timeout(1200); talk_through(); break
            if ev("!!document.querySelector('.arrow[data-w=fwd]')"):
                pg.click('.arrow[data-w="fwd"]'); pg.wait_for_timeout(450)
                if ev('G.at') == at: log.append(f'BLOCKED at {at}: ' + ev("$('sayText').textContent")); break
        won = ev('G.flags.won'); cert = ev("$('dlg').classList.contains('open') && !!document.querySelector('.cert')")
        route = ev('PLAN.route.join(">")'); locks = ev('JSON.stringify(PLAN.locks)')
        ok = won and cert and not errs
        fails += not ok
        print(f"seed {seed}: {'OK ' if ok else 'FAIL'} route {route} locks {locks}\n   solved {' '.join(log)} stars {ev('G.stars')} errors {errs}")
        if seed == seeds[0]: pg.screenshot(path=os.path.join(ROOT, 'tools', 'last_ending.png'))
        pg.close()
srv.shutdown(); sys.exit(1 if fails else 0)
