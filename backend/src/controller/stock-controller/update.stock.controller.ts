import { Request, Response } from "express";
import z from "zod";
import { StockModel } from "../../models/stock.model";

const zodUpdateStockSchema = z.object({
  productId: z.string("product is required").min(24).max(24),
  quantity: z.number("quantity is required").min(1),
  storeId: z.string("store is required").min(24).max(24),
});

export const updateStockController = async (req: Request, res: Response) => {
  const body = await zodUpdateStockSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "invalid request body" });
  }
  const stock = await StockModel.findOneAndUpdate(
    {
      productId: body.data.productId,
      storeId: body.data.storeId,
    },
    { quantity: body.data.quantity },
    { new: true }
  );
  if (!stock) {
    return res.status(400).json({ error: "stock not found" });
  }
  return res.status(200).json({ message: "success", data: stock });
};
