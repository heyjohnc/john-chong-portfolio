import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => readFileSync(new URL('../'+name, import.meta.url), 'utf8');
test('homepage exposes two real product previews then three delivery steps, not the nine-item archive', () => {
  const home=read('index.html');
  assert.equal((home.match(/class="home-product-card"/g)||[]).length,2);
  const flow=home.match(/<ol class="ownership-flow delivery-three">[\s\S]*?<\/ol>/)[0];
  assert.equal((flow.match(/<li>/g)||[]).length,3);
  assert.match(flow,/Build &amp; Integrate/); assert.match(flow,/Test &amp; Deliver/);
  assert.ok(home.indexOf('class="hero wrap"')<home.indexOf('class="section wrap home-products"'));
  assert.ok(home.indexOf('class="section wrap home-products"')<home.indexOf('id="responsibility"'));
  assert.ok(home.indexOf('id="responsibility"')<home.indexOf('id="contact"'));
  assert.doesNotMatch(home,/profile-card-title/);
  assert.match(home,/not a public launch/); assert.match(home,/Read-only public demo/);
});
test('case reading order leads with experience and keeps deeper evidence and limitations', () => {
  for(const file of ['fightgame.html','niulai.html']) {
    const page=read(file);
    assert.ok(page.indexOf('class="case-product-screenshot"')<page.indexOf('class="case-summary-title"'));
    assert.match(page,/<figure class="case-product-screenshot"><a href="\/assets\/[^\"]+" target="_blank" rel="noreferrer">/);
    assert.match(page,/Three product decisions/);
  }
  const fight=read('fightgame.html');
  assert.ok(fight.indexOf('id="fight-avatar-title"')<fight.indexOf('Three product decisions'));
  assert.ok(fight.indexOf('id="fight-acceptance"')<fight.indexOf('id="fight-cards-title"'));
  assert.match(fight,/When multiplayer results differed across devices/);
  const niulai=read('niulai.html');
  assert.ok(niulai.indexOf('id="niulai-user-flow-title"')<niulai.indexOf('Three product decisions'));
  assert.match(niulai,/779\/779 tests at the accepted 29 August 2026 baseline/);
  assert.match(niulai,/not a customer testimonial or formal user research/);
});
test('workflow contributions remain on demand and factual About boundaries stay visible', () => {
  assert.equal((read('projects.html').match(/class="workflow-contribution"/g)||[]).length,5);
  const about=read('about.html');
  for(const text of ['2015–Present','University of Wollongong','Shenzhen University','not ML research','substantial implementation and testing','Hong Kong permanent resident']) assert.ok(about.includes(text));
});
test('Niulai home preview discloses its crop and preserves the approved original image link', () => {
  const home=read('index.html');
  assert.match(home,/product-screenshot--dialogue" href="\/niulai.html"/);
  assert.match(home,/Agent dialogue · cropped preview/);
  assert.match(home,/class="screenshot-original-link" href="\/assets\/niulai\/agent-dialogue-window.png" target="_blank" rel="noreferrer"/);
  assert.match(home,/width="388" height="664"/);
  assert.match(read('styles.css'),/product-screenshot--dialogue img \{ object-fit: cover; object-position: 50% 50%; \}/);
  for(const text of ['Agent dialogue · cropped preview','View full screenshot']) assert.ok(read('site.js').includes('"'+text+'":'));
});
