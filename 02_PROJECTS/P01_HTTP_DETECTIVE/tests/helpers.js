import { after, before } from 'node:test';
import { createInvestigationServer, listen } from '../src/server.js';

export function useServer() {
  let server;
  let baseUrl;
  before(async () => {
    server = createInvestigationServer();
    baseUrl = await listen(server);
  });
  after(() => new Promise((resolve) => server.close(resolve)));
  return () => baseUrl;
}

export function mediaType(headers) {
  return headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? null;
}
