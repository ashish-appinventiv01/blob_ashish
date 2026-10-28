import { PublicUser } from "../Modules/user/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      authToken?: string;
    }
  }
}

export {};
