import { Schema, model } from "mongoose";
import { IStock } from "../types/model-type/stock";

const stockSchema = new Schema<IStock>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

stockSchema.index(
  {
    productId: 1,
    storeId: 1,
  },
  {
    unique: true,
  }
);

export const StockModel = model<IStock>("Stock", stockSchema);
