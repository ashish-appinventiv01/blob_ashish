import { PublicUser } from "../user/user.interface";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}
