import { Schema, model } from "mongoose";
import { IUser, UserRole } from "../types/model-type/user";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.SHOPPER,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);