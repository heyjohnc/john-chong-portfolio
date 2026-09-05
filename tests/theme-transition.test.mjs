import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const start = source.indexOf('  let themeTransitionBusy = false;');
const end = source.indexOf('  themeButton.addEventListener("click", toggleTheme);', start);
function setup({ supported = true, reduced = false, throws = false } = {}) {
  const classes = new Set();
  const styles = new Map();
  let calls = 0;
  let finish;
  const root = { dataset: { theme: 'dark' }, classList: { add: x => classes.add(x), remove: x => classes.delete(x) }, style: { setProperty: (k,v) => styles.set(k,v), removeProperty: k => styles.delete(k) } };
  const doc = { documentElement: root };
  if (supported) doc.startViewTransition = update => {
    if (throws) throw new Error('Capture unavailable');
    update();
    return { finished: new Promise(resolve => { finish = resolve; }), skipTransition: () => finish() };
  };
  const context = vm.createContext({ document: doc, innerWidth: 1440, innerHeight: 900,
    window: { matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }), addEventListener() {}, removeEventListener() {} },
    themeButton: { getBoundingClientRect: () => ({ left: 1200, top: 20, width: 40, height: 40 }) },
    applyTheme: next => { root.dataset.theme = next; calls++; }
  });
  vm.runInContext(source.slice(start, end), context);
  return { run: () => context.toggleTheme(), root, classes, styles, count: () => calls, finish: () => finish() };
}
test('theme reveal originates at button, covers viewport and ignores concurrent clicks', async () => {
  const f = setup(); const pending = f.run();
  assert.equal(f.styles.get('--theme-reveal-x'), '1220px');
  assert.ok(parseFloat(f.styles.get('--theme-reveal-radius')) >= Math.hypot(1220, 860));
  await f.run(); assert.equal(f.count(), 1);
  f.finish(); await pending;
  assert.equal(f.classes.size, 0); assert.equal(f.styles.size, 0);
  const reverse = f.run(); assert.equal(f.root.dataset.theme, 'dark'); f.finish(); await reverse;
});
test('unsupported, reduced-motion and capture failure still switch themes', async () => {
  for (const options of [{ supported: false }, { reduced: true }, { throws: true }]) {
    const f = setup(options); await f.run();
    assert.equal(f.root.dataset.theme, 'light'); assert.equal(f.classes.size, 0);
    await f.run(); assert.equal(f.root.dataset.theme, 'dark');
  }
});
