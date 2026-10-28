import { app } from "./app";
import { config } from "./constants/config";
import { mongoConnection } from "./providers/database";
import { redisConnection } from "./providers/redis";

class Server {
  constructor() {
    this.start().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start server";
      console.error(message);
      process.exit(1);
    });
  }

  private async start(): Promise<void> {
    await mongoConnection.initConnection();
    await redisConnection.initConnection();

    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`Connected to database ${config.dbName}`);
    });
  }
}

new Server();
