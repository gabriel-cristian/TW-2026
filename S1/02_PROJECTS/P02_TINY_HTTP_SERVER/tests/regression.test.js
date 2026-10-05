import assert from 'node:assert/strict';
import test from 'node:test';
import { jsonResponse, useServer } from './helpers.js';

const getBaseUrl = useServer();

test('query greeting route still validates and uses the query value', async () => {
  assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}/api/greetings?name=%20Ada%20`)), {
    status: 200,
    contentType: 'application/json',
    body: { message: 'Hello, Ada!', source: 'query' },
  });

  for (const query of ['', '?name=%20%20']) {
    assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}/api/greetings${query}`)), {
      status: 400,
      contentType: 'application/json',
      body: { error: 'name_required' },
    });
  }
});

test('echo route creates an unchanged JSON representation and rejects invalid requests', async () => {
  const response = await fetch(`${getBaseUrl()}/api/echo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ clue: 'crumbs', count: 2 }),
  });
  assert.equal(response.headers.get('x-echoed-method'), 'POST');
  assert.deepEqual(await jsonResponse(response), {
    status: 201,
    contentType: 'application/json',
    body: { clue: 'crumbs', count: 2 },
  });

  const cases = [
    [{ method: 'POST', body: 'plain' }, 415, 'json_required'],
    [{ method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }, 400, 'invalid_json'],
  ];

  for (const [options, status, error] of cases) {
    assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}/api/echo`, options)), {
      status,
      contentType: 'application/json',
      body: { error },
    });
  }
});

test('unknown path and unsupported method use the supplied fallback', async () => {
  for (const [path, options] of [['/unknown', {}], ['/api/greetings?name=Ada', { method: 'POST' }], ['/api/greetings/Ada/extra', {}]]) {
    assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}${path}`, options)), { status: 404, contentType: 'application/json', body: { error: 'not_found' } });
  }
});

test('a failed request does not stop health behavior', async () => {
  await fetch(`${getBaseUrl()}/api/echo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal((await fetch(`${getBaseUrl()}/health`)).status, 200);
});
