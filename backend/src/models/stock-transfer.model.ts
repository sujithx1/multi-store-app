import { Schema, model } from "mongoose";
import {
  IStockTransaction,
  TransactionType,
} from "../types/model-type/stock-transfer";
const stockTransactionSchema = new Schema<IStockTransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    senderStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },

    receiverStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const StockTransactionModel = model<IStockTransaction>(
  "StockTransaction",
  stockTransactionSchema
);
