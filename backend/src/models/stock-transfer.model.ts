import { Schema, model } from "mongoose";
import { IStockTransaction, TransactionType } from "../types/model-type/stock-transfer";
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

    fromStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },

    toStoreId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    performedBy: {
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

export default model<IStockTransaction>(
  "StockTransaction",
  stockTransactionSchema
);