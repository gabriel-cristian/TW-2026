import { createInvestigationServer, listen } from './server.js';

const server = createInvestigationServer();
const baseUrl = await listen(server, Number(process.env.PORT ?? 0));
console.log(`Detectiv HTTP: ${baseUrl}`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
