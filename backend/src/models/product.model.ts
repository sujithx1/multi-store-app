import { Schema, model } from "mongoose";
import { IProduct } from "../types/model-type/product";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const  ProductModel= model<IProduct>("Product", productSchema);