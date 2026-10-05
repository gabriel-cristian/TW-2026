import { createServer, listen } from './server.js';

const server = createServer();
console.log(`Server HTTP minimal: ${await listen(server, Number(process.env.PORT ?? 0))}`);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
