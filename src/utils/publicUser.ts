import { PublicUser } from "../Modules/user/user.interface";

export type { PublicUser };

type UserRecord = {
  _id: { toString(): string };
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

class PublicUserMapper {
  toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const publicUser = new PublicUserMapper();
