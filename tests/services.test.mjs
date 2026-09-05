import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('service draft separates recruitment, discloses proposed terms and has no checkout or Ask', async () => {
  const page = await readFile(new URL('../services.html', import.meta.url), 'utf8');
  for (const id of ['services-en','delivery-en','refunds-en','privacy-en','services-zh','delivery-zh','refunds-zh','privacy-zh']) assert.ok(page.includes(`id="${id}"`));
  assert.match(page, /mailto:aryipc@gmail.com/);
  assert.match(page, /JohnChong/);
  assert.match(page, /Review draft/);
  assert.match(page, /name="robots" content="noindex"/);
  assert.doesNotMatch(page, /<form|ask-widget\.js|buy\.stripe\.com|js\.stripe\.com/);
  assert.match(page, /href="https:\/\/johnchong.info\/services.html"/);
  const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(home, /<footer[\s\S]*data-services-entry/);
  assert.doesNotMatch(home.split('<footer')[0], /services\.html/);
  assert.match(home, /Open to Hong Kong roles/);
});
