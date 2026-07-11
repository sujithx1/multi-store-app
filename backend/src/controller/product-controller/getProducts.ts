import { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import { PaginationSchema } from "../../config/pagination";
import { IProduct } from "../../types/model-type/product";
import { ProductModel } from "../../models/product.model";

export const getProductCOntroller = async (req: Request, res: Response) => {
  const query = PaginationSchema.parse(req.query);

  const filter: QueryFilter<IProduct> = {};

  if (query.search.trim()) {
    const searchterm = `${query.search.trim()}`;

    filter.$or = [
      { name: { $regex: searchterm, $options: "i" } },
      { sku: { $regex: searchterm, $options: "i" } },
    ];
  }

  const products = await ProductModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(query.offcet)
    .limit(query.limit);
  return res.status(200).json({ message: "success", data: products });
};
