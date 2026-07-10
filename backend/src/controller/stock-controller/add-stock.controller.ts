import { Pretty_Error } from "../../config/error";
import { StockModel } from "../../models/stock.model";

import { Request, Response } from "express";
import { z } from "zod";

const zodAddStockSchema = z.object({
  productId: z.string("product is required").min(24).max(24),
  quantity: z.number("quantity is required").min(1),
  storeId: z.string("store is required").min(24).max(24),
});
export const addStockController = async (req: Request, res: Response) => {
  const body = await zodAddStockSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }
  const stockExists = await StockModel.findOne({
    productId: body.data.productId,
    storeId: body.data.storeId,
  });
  if (stockExists) {
    return res.status(400).json({ error: "stock already exists" });
  }

  const stock = await StockModel.create(body.data);

  return res.status(200).json({ message: "success", data: stock });
};
