import { createServer as createNodeServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const publicUrl = new URL('../public/', import.meta.url);

function json(response, status, value, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createInvestigationServer() {
  return createNodeServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');

    // Păstrăm tratarea cererilor explicită ca studenții să poată urmări
    // verificările de metodă și rută.
    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(await readFile(new URL('index.html', publicUrl)));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/browser.js') {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end(await readFile(new URL('browser.js', publicUrl)));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/assets/detective.css') {
      response.writeHead(200, { 'content-type': 'text/css; charset=utf-8' });
      response.end(await readFile(new URL('detective.css', publicUrl)));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/clues') {
      const caseId = url.searchParams.get('case');
      json(
        response,
        200,
        { caseId, clues: ['firimituri', 'borcan deschis'] },
        { 'x-case-id': caseId ?? '' },
      );
      return;
    }
    if (request.method === 'POST' && url.pathname === '/api/verdicts') {
      try {
        const submitted = await readJson(request);
        const verdict = { id: 'verdict-1', ...submitted };
        json(response, 201, verdict, { location: `/api/verdicts/${verdict.id}` });
      } catch {
        json(response, 400, { error: 'invalid_json' });
      }
      return;
    }

    json(response, 404, { error: 'not_found' });
  });
}

export async function listen(server, port = 0) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}
