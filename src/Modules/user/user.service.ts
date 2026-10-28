import { MESSAGES } from "../../constants/messages";
import { updateUserName } from "./user.repository";
import { AppError } from "../../utils/AppError";
import { toPublicUser } from "../../utils/publicUser";
import { PublicUser, UpdateNameInput } from "./user.interface";

export async function updateName(input: UpdateNameInput): Promise<PublicUser> {
  const user = await updateUserName(input.userId, input.name);

  if (!user) {
    throw new AppError(MESSAGES.userNotFound, 404);
  }

  return toPublicUser(user);
}
