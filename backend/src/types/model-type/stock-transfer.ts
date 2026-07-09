import { Types } from "mongoose";

export enum TransactionType {
  ADJUST = "ADJUST",
  TRANSFER = "TRANSFER",
}

export interface IStockTransaction {
  _id?: Types.ObjectId;

  type: TransactionType;

  productId: Types.ObjectId;

  fromStoreId?: Types.ObjectId;

  toStoreId?: Types.ObjectId;

  quantity: number;

  performedBy: Types.ObjectId;

  note?: string;

  createdAt?: Date;
}