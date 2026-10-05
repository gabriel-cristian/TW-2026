import { after, before } from 'node:test';
import { createServer, listen } from '../src/server.js';

export function useServer() {
  let server;
  let baseUrl;
  before(async () => {
    server = createServer();
    baseUrl = await listen(server);
  });
  after(() => new Promise((resolve) => server.close(resolve)));
  return () => baseUrl;
}

export async function jsonResponse(response) {
  return { status: response.status, contentType: response.headers.get('content-type')?.split(';', 1)[0], body: await response.json() };
}

export async function textResponse(response) {
  return { status: response.status, contentType: response.headers.get('content-type')?.split(';', 1)[0], body: await response.text() };
}
