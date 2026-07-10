import { Schema, model } from "mongoose";
import { IUser, UserRole } from "../types/model-type/user";

const userSchema = new Schema<IUser>(
  {
    username: {
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

    password: {
      type: String,
      required: true,
      select: false, // this is for  not return password the  password when we get the user from the database  // if you want u can use +password
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

export const UserModel = model<IUser>("User", userSchema);
