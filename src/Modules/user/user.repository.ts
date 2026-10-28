import { UserModel } from "../../model/user.model";

class UserRepository {
  createUser(input: { name: string; email: string; password: string }) {
    return UserModel.create(input);
  }

  findUserByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select("+password");
  }

  findUserById(id: string) {
    return UserModel.findById(id);
  }

  updateUserName(id: string, name: string) {
    return UserModel.findByIdAndUpdate(id, { name }, { returnDocument: "after", runValidators: true });
  }
}

export const userRepository = new UserRepository();
