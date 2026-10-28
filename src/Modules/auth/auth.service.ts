import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { AUTH } from "../../constants/auth";
import { MESSAGES } from "../../constants/messages";
import { loginRateLimiter } from "../../middlewares/loginRateLimit";
import { sessionCache } from "../../providers/redis";
import { AppError } from "../../utils/AppError";
import { mongoError } from "../../utils/mongoError";
import { publicUser } from "../../utils/publicUser";
import { PublicUser } from "../user/user.interface";
import { userRepository } from "../user/user.repository";
import { LoginInput, LoginResult, SignupInput } from "./auth.interface";
import { sessionRepository } from "./session.repository";

class AuthService {
  private dummyPasswordHash: Promise<string> | undefined;

  private getDummyPasswordHash(): Promise<string> {
    this.dummyPasswordHash ??= bcrypt.hash("placeholder-not-a-user", AUTH.bcryptRounds);
    return this.dummyPasswordHash;
  }

  async signupUser(input: SignupInput): Promise<PublicUser> {
    try {
      const user = await userRepository.createUser(input);
      return publicUser.toPublicUser(user);
    } catch (error) {
      if (mongoError.isDuplicateKeyError(error) && mongoError.duplicateKeyIncludes(error, "email")) {
        throw new AppError(MESSAGES.emailTaken, 409);
      }
      throw error;
    }
  }

  async loginUser(input: LoginInput): Promise<LoginResult> {
    const user = await userRepository.findUserByEmailWithPassword(input.email);

    if (!user) {
      await bcrypt.compare(input.password, await this.getDummyPasswordHash());
      await loginRateLimiter.recordFailedLogin(input.email);
      throw new AppError(MESSAGES.invalidCredentials, 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      await loginRateLimiter.recordFailedLogin(input.email);
      throw new AppError(MESSAGES.invalidCredentials, 401);
    }

    const token = randomBytes(AUTH.tokenBytes).toString("hex");
    const expiresAt = new Date(Date.now() + AUTH.sessionTtlMs);

    await sessionRepository.createSession({
      userId: user._id,
      token,
      expiresAt,
      userAgent: input.userAgent.slice(0, 512),
    });
    await sessionCache.save(token, user._id.toString(), expiresAt);
    await loginRateLimiter.clearLoginAttempts(input.email);

    return { token, user: publicUser.toPublicUser(user) };
  }
}

export const authService = new AuthService();
