import { Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;

  name: string;

  sku: string;

  createdAt?: Date;

  updatedAt?: Date;
}
