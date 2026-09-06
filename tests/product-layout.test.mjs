import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => readFileSync(new URL('../'+name, import.meta.url), 'utf8');
test('homepage exposes two product text cards then three delivery steps, not the nine-item archive', () => {
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
test('Home uses two single-link text cards without images or nested interactive elements', () => {
  const cards=[...read('index.html').matchAll(/<article class="home-product-card">([\s\S]*?)<\/article>/g)].map(x=>x[1]);
  assert.equal(cards.length,2);
  for(const card of cards){
    assert.equal((card.match(/<a /g)||[]).length,1);
    assert.match(card,/class="home-product-copy home-product-link" href="\/(fightgame|niulai).html" aria-label="Read the/);
    assert.doesNotMatch(card,/<img|<button|tabindex|onclick|cropped preview|View full screenshot/);
    assert.match(card,/class="project-name"/);assert.match(card,/class="product-status"/);
    assert.match(card,/<span class="text-link">Read case study/);
  }
  assert.match(read('styles.css'),/\.home-product-link:focus-visible/);
});
