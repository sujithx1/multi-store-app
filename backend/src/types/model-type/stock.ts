import { Types } from "mongoose";

export interface IStock {
  _id?: Types.ObjectId;

  productId: Types.ObjectId;

  storeId: Types.ObjectId;

  quantity: number;

  createdAt?: Date;

  updatedAt?: Date;
}
