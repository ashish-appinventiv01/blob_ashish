import { app } from "./app";
import { config } from "./constants/config";
import { connectDatabase } from "./providers/database";

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
    console.log(`Connected to database ${config.dbName}`);
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
});
