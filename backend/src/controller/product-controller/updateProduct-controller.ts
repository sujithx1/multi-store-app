import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { ProductModel } from "../../models/product.model";

const zodUpdateProductSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
});

export const GlobalIdParamsZodSchema = z.object({
  id: z.string(),
});
export const updateProductController = async (req: Request, res: Response) => {
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }
  const body = await zodUpdateProductSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  const { name, sku } = body.data;
  if (sku) {
    const productExists = await ProductModel.exists({
      sku,
      _id: { $ne: params.data.id },
    });

    if (productExists) {
      return res.status(400).json({
        error: "Product SKU already exists! Please use a unique SKU.",
      });
    }
    
  }

  await ProductModel.findByIdAndUpdate(
    params.data.id,
    {
      name,
      sku,
    },
    {
      runValidators: true,
    }
  );
};
