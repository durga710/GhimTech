import { buildServer } from "./server.js";

const { app, config } = await buildServer();

try {
  await app.listen({ port: config.port, host: config.host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
