import { readFile } from 'node:fs/promises';
import { createServer as createNodeServer } from 'node:http';
import { handleApplicationRequest } from './application-handler.js';
import { sendJson, sendText } from './http-utils.js';

const staticFiles = new Map([
  ['/', { fileUrl: new URL('../public/index.html', import.meta.url), contentType: 'text/html; charset=utf-8' }],
  ['/assets/site.css', { fileUrl: new URL('../public/site.css', import.meta.url), contentType: 'text/css; charset=utf-8' }],
]);

export function createServer() {
  return createNodeServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');

      // Route the small health check inline before delegating application paths.
      if (request.method === 'GET' && url.pathname === '/health') {
        sendJson(response, 200, { status: 'ok' });
        return;
      }

      const staticFile = staticFiles.get(url.pathname);
      if (request.method === 'GET' && staticFile) {
        const body = await readFile(staticFile.fileUrl, 'utf8');
        sendText(response, 200, body, staticFile.contentType);
        return;
      }

      if (await handleApplicationRequest(request, response, url)) return;
      sendJson(response, 404, { error: 'not_found' });
    } catch {
      if (!response.headersSent) {
        sendJson(response, 500, { error: 'internal_error' });
      }
      else response.destroy();
    }
  });
}

export async function listen(server, port = 0) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  const { port: assignedPort } = server.address();
  return `http://127.0.0.1:${assignedPort}`;
}
