import { UserModel } from "../../model/user.model";

export function createUser(input: { name: string; email: string; password: string }) {
  return UserModel.create(input);
}

export function findUserByEmailWithPassword(email: string) {
  return UserModel.findOne({ email }).select("+password");
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function updateUserName(id: string, name: string) {
  return UserModel.findByIdAndUpdate(id, { name }, { returnDocument: "after", runValidators: true });
}
