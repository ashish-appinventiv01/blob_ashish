import mongoose from "mongoose";
import { config } from "../../constants/config";

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongodbUri, {
    dbName: config.dbName,
  });

  return mongoose;
}
