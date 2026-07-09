import { Types } from "mongoose";

export interface IStore {
  _id?: Types.ObjectId;

  name: string;

  location: string;

  createdAt?: Date;

  updatedAt?: Date;
}