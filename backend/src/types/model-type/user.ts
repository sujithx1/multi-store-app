import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  SHOPPER = "shopper",
}

export interface IUser {
  _id?: Types.ObjectId;

  username: string;

  email: string;

  password: string;

  role: UserRole;

  createdAt?: Date;

  updatedAt?: Date;
}
