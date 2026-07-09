import { Types } from "mongoose";

export enum TransactionType {
  ADJUST = "ADJUST",
  TRANSFER = "TRANSFER",
}

export interface IStockTransaction {
  _id?: Types.ObjectId;

  type: TransactionType;

  productId: Types.ObjectId;

  senderStoreId?: Types.ObjectId;

  receiverStoreId?: Types.ObjectId;

  quantity: number;

  userId: Types.ObjectId;

  note?: string;

  createdAt?: Date;
}