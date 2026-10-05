import assert from 'node:assert/strict';
import test from 'node:test';
import { useServer } from './helpers.js';

const getBaseUrl = useServer();

test('indiciile păstrează identitatea query-ului în payload și header', async () => {
  const response = await fetch(`${getBaseUrl()}/api/clues?case=missing-cookie`);
  assert.equal(response.headers.get('x-case-id'), 'missing-cookie');
  assert.equal((await response.json()).caseId, 'missing-cookie');
});

test('verdictul reprezintă datele trimise și resursa creată', async () => {
  const submitted = { caseId: 'missing-cookie', verdict: 'cookie-jar' };
  const response = await fetch(`${getBaseUrl()}/api/verdicts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(submitted) });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('location'), '/api/verdicts/verdict-1');
  assert.deepEqual(await response.json(), { id: 'verdict-1', ...submitted });
});

test('căile necunoscute eșuează fără a opri serverul', async () => {
  assert.equal((await fetch(`${getBaseUrl()}/unknown`)).status, 404);
  assert.equal((await fetch(`${getBaseUrl()}/api/clues?case=still-running`)).status, 200);
});
