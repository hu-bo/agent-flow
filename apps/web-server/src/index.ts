import { startServer } from './server.js';

startServer().catch((error) => {
  console.error('Failed to start @agent-flow/web-server', error);
  process.exitCode = 1;
});
