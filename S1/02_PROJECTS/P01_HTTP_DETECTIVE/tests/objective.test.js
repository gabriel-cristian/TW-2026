import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { isDeepStrictEqual } from 'node:util';
import { mediaType, useServer } from './helpers.js';

const getBaseUrl = useServer();

function compareEntry(name, submitted, observed) {
  if (JSON.stringify(Object.keys(submitted).sort()) !== JSON.stringify(Object.keys(observed).sort())) {
    throw new Error(`${name}: câmpurile trimise diferă`);
  }
  for (const [field, expected] of Object.entries(observed)) {
    if (!isDeepStrictEqual(submitted[field], expected)) {
      throw new Error(`${name}.${field}: valoare trimisă ${JSON.stringify(submitted[field])}`);
    }
  }
}

test('raportul cazului corespunde observațiilor HTTP reale', async () => {
  const stylesheet = await fetch(`${getBaseUrl()}/assets/detective.css`);
  await stylesheet.text();
  const clues = await fetch(`${getBaseUrl()}/api/clues?case=missing-cookie`);
  await clues.json();
  const verdict = await fetch(`${getBaseUrl()}/api/verdicts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ caseId: 'missing-cookie', verdict: 'cookie-jar' })
  });
  await verdict.json();

  const observed = {
    stylesheet: { method: 'GET', pathname: '/assets/detective.css', query: {}, requestMediaType: null, status: stylesheet.status, responseMediaType: mediaType(stylesheet.headers), bodyRepresentation: 'text' },
    clues: { method: 'GET', pathname: '/api/clues', query: { case: 'missing-cookie' }, requestMediaType: null, status: clues.status, responseMediaType: mediaType(clues.headers), bodyRepresentation: 'json', xCaseId: clues.headers.get('x-case-id') },
    verdict: { method: 'POST', pathname: '/api/verdicts', query: {}, requestMediaType: 'application/json', status: verdict.status, responseMediaType: mediaType(verdict.headers), bodyRepresentation: 'json', location: verdict.headers.get('location') }
  };
  const report = JSON.parse(await readFile(new URL('../case-report.json', import.meta.url), 'utf8'));
  if (JSON.stringify(Object.keys(report).sort()) !== JSON.stringify(Object.keys(observed).sort())) {
    throw new Error('numele schimburilor din raportul trimis diferă');
  }
  for (const name of Object.keys(observed)) compareEntry(name, report[name], observed[name]);
});
