import { Request, Response } from "express";
import mongoose from "mongoose";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { ProductModel } from "../../models/product.model";
import { StockModel } from "../../models/stock.model";
import { StoreModel } from "../../models/store.model";

const zodTransferStockSchema = z.object({
  senderStoreId: z.string("source store is required").min(24).max(24),
  receiverStoreId: z.string("destination store is required").min(24).max(24),
  productId: z.string("product is required").min(24).max(24),
  quantity: z.number("quantity is required").min(1),
});

export const transferStockController = async (req: Request, res: Response) => {
  const body = await zodTransferStockSchema.safeParseAsync(req.body);

  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  const { senderStoreId, receiverStoreId, productId, quantity } = body.data;

  if (senderStoreId === receiverStoreId) {
    return res
      .status(400)
      .json({ error: "Source and destination store must be different" });
  }

  const sourceStore = await StoreModel.findById(senderStoreId);
  const destStore = await StoreModel.findById(receiverStoreId);
  const product = await ProductModel.findById(productId);

  if (!sourceStore || !destStore) {
    return res.status(404).json({ error: "One or both stores do not exist" });
  }

  if (!product) {
    return res.status(404).json({ error: "Product does not exist" });
  }

  // transaction start
  const session = await mongoose.startSession();
  session.startTransaction();

  const sourceStock = await StockModel.findOneAndUpdate(
    { storeId: senderStoreId, productId, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true, session }
  );

  if (!sourceStock) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      error:
        "Insufficient stock at source store or stock entry does not exist to complete the transfer",
    });
  }

  const data = await StockModel.findOneAndUpdate(
    { storeId: receiverStoreId, productId },
    { $inc: { quantity: quantity } },
    { new: true, upsert: true, session, setDefaultsOnInsert: true }
  );

  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({ message: "succes to transfer stock", data });
};
