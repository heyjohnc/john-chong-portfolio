import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const code = readFileSync(new URL('../assets/profile-card.js', import.meta.url), 'utf8');
function fixture({ fine = true, reduced = false } = {}) {
  const events = {};
  const values = new Map();
  const queries = [];
  let pending;
  const host = { addEventListener: (name, fn) => { events[name] = fn; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) };
  const surface = { parentElement: host, classList: { add() {}, remove() {} }, style: { setProperty: (k, v) => values.set(k, v), removeProperty: k => values.delete(k) } };
  vm.runInNewContext(code, {
    document: { querySelector: () => surface, addEventListener() {} },
    window: { addEventListener: (name, fn) => { events[name] = fn; } },
    matchMedia: query => { const item = { matches: query.includes('reduced') ? reduced : fine, addEventListener: (_, fn) => { item.change = fn; } }; queries.push(item); return item; },
    requestAnimationFrame: fn => { pending = fn; return 1; },
    cancelAnimationFrame: () => { pending = null; }
  });
  return { events, values, queries, move: type => events.pointermove({ pointerType: type, clientX: 200, clientY: -100 }), flush: () => pending?.() };
}
test('profile tilt clamps rotation and cancels queued work on leave', () => {
  const f = fixture();
  f.move('mouse'); f.flush();
  assert.equal(f.values.get('--tilt-x'), '6deg');
  assert.equal(f.values.get('--tilt-y'), '6deg');
  f.move('mouse'); f.events.pointerleave(); f.flush();
  assert.equal(f.values.size, 0);
});
test('touch, coarse pointers and reduced motion never enable profile tilt', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const f = fixture(options); f.move('mouse'); f.flush(); assert.equal(f.values.size, 0);
  }
  const f = fixture(); f.move('touch'); f.flush(); assert.equal(f.values.size, 0);
  f.move('mouse'); f.flush(); f.queries[1].matches = true; f.queries[1].change();
  assert.equal(f.values.size, 0);
});
test('focus and print reset tilt; no storage, network or sensor collection', () => {
  const f = fixture();
  for (const event of ['focusin', 'beforeprint', 'blur', 'resize', 'pointercancel']) {
    f.move('mouse'); f.flush(); f.events[event](); assert.equal(f.values.size, 0);
  }
  assert.doesNotMatch(code, /fetch\(|localStorage|sessionStorage|deviceorientation|devicemotion|sendBeacon|cookie/i);
});
