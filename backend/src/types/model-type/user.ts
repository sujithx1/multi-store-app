import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  SHOPPER = "shopper",
}

export interface IUser {
  _id?: Types.ObjectId;

  name: string;

  email: string;

  passwordHash: string;

  role: UserRole;

  createdAt?: Date;

  updatedAt?: Date;
}