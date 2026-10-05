import assert from 'node:assert/strict';
import test from 'node:test';
import { jsonResponse, textResponse, useServer } from './helpers.js';

const getBaseUrl = useServer();

test('server starts and health route works independently', async () => {
  const result = await jsonResponse(await fetch(`${getBaseUrl()}/health`));
  assert.deepEqual(result, { status: 200, contentType: 'application/json', body: { status: 'ok' } });
});

test('root page and stylesheet are served from disk', async () => {
  const page = await textResponse(await fetch(`${getBaseUrl()}/`));
  assert.equal(page.status, 200);
  assert.equal(page.contentType, 'text/html');
  assert.match(page.body, /Server HTTP minimal/);

  const stylesheet = await textResponse(await fetch(`${getBaseUrl()}/assets/site.css`));
  assert.equal(stylesheet.status, 200);
  assert.equal(stylesheet.contentType, 'text/css');
  assert.match(stylesheet.body, /font-family/);
});
