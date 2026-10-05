import assert from 'node:assert/strict';
import test from 'node:test';
import { jsonResponse, useServer } from './helpers.js';

const getBaseUrl = useServer();

test('path greeting route decodes and trims the final path segment', async () => {
  assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}/api/greetings/%20Ada%20Lovelace%20`)), {
    status: 200,
    contentType: 'application/json',
    body: { message: 'Hello, Ada Lovelace!', source: 'path' },
  });
});

test('path greeting route rejects an empty decoded segment', async () => {
  assert.deepEqual(await jsonResponse(await fetch(`${getBaseUrl()}/api/greetings/%20%20`)), {
    status: 400,
    contentType: 'application/json',
    body: { error: 'name_required' },
  });
});
