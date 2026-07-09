import { Schema, model } from "mongoose";
import { IStore } from "../types/model-type/store";

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StoreModel= model<IStore>("Store", storeSchema);