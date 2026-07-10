import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { ProductModel } from "../../models/product.model";

const zodCreateProductSchema = z
  .object({
    name: z.string("name is required").min(3),
    sku: z.string("sku is required").min(3),
  })
  .transform((data) => {
    return {
      name: data.name,
      sku: data.sku.toUpperCase(),
    };
  });

export const createProductController = async (req: Request, res: Response) => {
  const body = await zodCreateProductSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  const { name, sku } = body.data;

  const productExists = await ProductModel.findOne({ sku });
  if (productExists) {
    return res.status(400).json({ error: "Product SKU already exists ! Try to Make Unique" });
  }

  const product = await ProductModel.create({
    name,
    sku,
  });

  return res.status(201).json({ message: "success", product });
};
