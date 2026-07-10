import { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import { PaginationSchema } from "../../config/pagination";
import { StoreModel } from "../../models/store.model";
import { IStore } from "../../types/model-type/store";

export const getStoresController = async (req: Request, res: Response) => {
  const query = PaginationSchema.parse(req.query);
  const condition: QueryFilter<IStore> = {};

  if (query.search) {
    condition.name = {
      $regex: query.search,
      $options: "i",
    };
  }

  const stores = await StoreModel.find(condition)
    .populate("products")
    .sort({ createdAt: -1 })
    .skip(query.offcet)
    .limit(query.limit);



    return res.status(200).json({ message: "success", data: stores });
};
