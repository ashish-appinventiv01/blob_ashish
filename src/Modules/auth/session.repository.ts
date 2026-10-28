import { Types } from "mongoose";
import { SessionModel } from "../../model/session.model";

export function createSession(input: {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  userAgent: string;
}) {
  return SessionModel.create(input);
}

export function findSessionByToken(token: string) {
  return SessionModel.findOne({ token });
}

export function deleteSessionByToken(token: string) {
  return SessionModel.deleteOne({ token });
}
