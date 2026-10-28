import mongoose from "mongoose";
import { config } from "../../constants/config";
import { CommentModel } from "../../model/comment.model";
import { PostModel } from "../../model/post.model";
import { SessionModel } from "../../model/session.model";
import { UserModel } from "../../model/user.model";

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongodbUri, {
    dbName: config.dbName,
  });

  await Promise.all([
    UserModel.syncIndexes(),
    SessionModel.syncIndexes(),
    PostModel.syncIndexes(),
    CommentModel.syncIndexes(),
  ]);

  return mongoose;
}
