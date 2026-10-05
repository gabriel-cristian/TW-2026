import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { useServer } from './helpers.js';

const getBaseUrl = useServer();

test('pagina și resursele investigației sunt disponibile', async () => {
  for (const path of ['/', '/browser.js', '/assets/detective.css']) {
    const response = await fetch(`${getBaseUrl()}${path}`);
    assert.equal(response.status, 200);
  }
});

test('modulul browserului conține cele trei cereri ale investigației', async () => {
  const source = await readFile(new URL('../public/browser.js', import.meta.url), 'utf8');
  assert.match(source, /assets\/detective\.css/);
  assert.match(source, /api\/clues\?case=missing-cookie/);
  assert.match(source, /api\/verdicts/);
});
