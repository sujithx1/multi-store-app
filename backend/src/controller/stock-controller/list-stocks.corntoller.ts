import { Request, Response } from "express";
import mongoose, { QueryFilter } from "mongoose";
import { PaginationSchema } from "../../config/pagination";
import { StockModel } from "../../models/stock.model";
import { IStock } from "../../types/model-type/stock";

export const listStockController = async (req: Request, res: Response) => {
  const query = PaginationSchema.parse(req.query);

  const { storeId, productId, threshold } = req.query;
  const filter: QueryFilter<IStock> = {};

  if (
    storeId &&
    typeof storeId === "string" &&
    mongoose.Types.ObjectId.isValid(storeId)
  ) {
    filter.storeId = storeId;
  }
  if (
    productId &&
    typeof productId === "string" &&
    mongoose.Types.ObjectId.isValid(productId)
  ) {
    filter.productId = productId;
  }

  if (threshold) {
    filter.quantity = { $lt: Number(threshold) };
  }

  const stocks = await StockModel.find(filter)
    .populate("productId")
    .populate("storeId")
    .sort({ quantity: -1 });

  return res.status(200).json({ message: "success", data: stocks });
};
