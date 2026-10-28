import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { AUTH } from "../../constants/auth";
import { MESSAGES } from "../../constants/messages";
import { createUser, findUserByEmailWithPassword } from "../user/user.repository";
import { createSession } from "./session.repository";
import { AppError } from "../../utils/AppError";
import { duplicateKeyIncludes, isDuplicateKeyError } from "../../utils/mongoError";
import { toPublicUser } from "../../utils/publicUser";
import { PublicUser } from "../user/user.interface";
import { LoginInput, LoginResult, SignupInput } from "./auth.interface";

let dummyPasswordHash: Promise<string> | undefined;

function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= bcrypt.hash("placeholder-not-a-user", AUTH.bcryptRounds);
  return dummyPasswordHash;
}

export async function signupUser(input: SignupInput): Promise<PublicUser> {
  try {
    const user = await createUser(input);
    return toPublicUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error) && duplicateKeyIncludes(error, "email")) {
      throw new AppError(MESSAGES.emailTaken, 409);
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await findUserByEmailWithPassword(input.email);

  if (!user) {
    await bcrypt.compare(input.password, await getDummyPasswordHash());
    throw new AppError(MESSAGES.invalidCredentials, 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError(MESSAGES.invalidCredentials, 401);
  }

  const token = randomBytes(AUTH.tokenBytes).toString("hex");
  const expiresAt = new Date(Date.now() + AUTH.sessionTtlMs);

  await createSession({
    userId: user._id,
    token,
    expiresAt,
    userAgent: input.userAgent.slice(0, 512),
  });

  return { token, user: toPublicUser(user) };
}
