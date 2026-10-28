import bcrypt from "bcrypt";
import mongoose, { InferSchemaType } from "mongoose";
import { AUTH } from "../constants/auth";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be between 2 and 50 characters"],
      maxlength: [50, "Name must be between 2 and 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, AUTH.bcryptRounds);
});

function hidePassword(_doc: unknown, ret: Record<string, unknown>) {
  delete ret.password;
  return ret;
}

userSchema.set("toJSON", { transform: hidePassword });
userSchema.set("toObject", { transform: hidePassword });

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel = mongoose.model("User", userSchema);
