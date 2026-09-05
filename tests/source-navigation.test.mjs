import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('  function preserveStripeSource()'), source.indexOf('  const zh ='));
function run(pathname) {
  const values = ['/projects.html#projects','/services.html','/index.html#contact','#top','/presentation/','/api/ask','mailto:aryipc@gmail.com','https://example.com/about.html','/assets/example.png','/from-github'];
  const links = values.map(href => ({ href, getAttribute() { return this.href; }, setAttribute(_, value) { this.href = value; } }));
  vm.runInNewContext(code, { URL, location: { pathname, href: 'https://johnchong.info' + pathname, origin: 'https://johnchong.info' }, document: { querySelectorAll: () => links } });
  return { values, result: links.map(x => x.href) };
}
test('Stripe navigation maps public pages, preserves fragments, excludes private/external destinations', () => {
  for (const path of ['/from-stripe','/from-stripe/projects','/from-stripe/home']) {
    const {values,result} = run(path);
    assert.deepEqual(result.slice(0,3), ['/from-stripe/projects#projects','/from-stripe','/from-stripe/home#contact']);
    assert.deepEqual(result.slice(3),values.slice(3));
  }
});
test('normal and unapproved entry paths never inherit Stripe attribution', () => {
  for (const path of ['/','/projects.html','/from-github','/cv-product-20260907','/from-stripe/private']) {
    const {values,result} = run(path); assert.deepEqual(result,values);
  }
  assert.doesNotMatch(code, /localStorage|cookie|fetch\(|sendBeacon|sessionStorage/);
});
