import { Types } from "mongoose";
import { SessionModel } from "../../model/session.model";

class SessionRepository {
  createSession(input: { userId: Types.ObjectId; token: string; expiresAt: Date; userAgent: string }) {
    return SessionModel.create(input);
  }

  findSessionByToken(token: string) {
    return SessionModel.findOne({ token });
  }

  deleteSessionByToken(token: string) {
    return SessionModel.deleteOne({ token });
  }
}

export const sessionRepository = new SessionRepository();
