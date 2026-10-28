import { MESSAGES } from "../../constants/messages";
import { cache, redisConfig } from "../../providers/redis";
import { AppError } from "../../utils/AppError";
import { publicUser } from "../../utils/publicUser";
import { PublicUser, UpdateNameInput } from "./user.interface";
import { userRepository } from "./user.repository";

class UserService {
  async updateName(input: UpdateNameInput): Promise<PublicUser> {
    const user = await userRepository.updateUserName(input.userId, input.name);

    if (!user) {
      throw new AppError(MESSAGES.userNotFound, 404);
    }

    await cache.delKeys([redisConfig.keys.user(input.userId)]);
    return publicUser.toPublicUser(user);
  }
}

export const userService = new UserService();
