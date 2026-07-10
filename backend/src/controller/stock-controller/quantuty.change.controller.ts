import { Request, Response } from "express";
import z from "zod";
import { StockModel } from "../../models/stock.model";
import { GlobalIdParamsZodSchema } from "../product-controller/updateProduct-controller";

const zodQuantityChangeSchema = z.object({
  quantity: z.number("quantity is required").min(1),
  type: z.enum(["inc", "dec"]).default("inc"),
});
export const quantutyChangeController = async (req: Request, res: Response) => {
  const body = await zodQuantityChangeSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "invalid request body" });
  }
  const { quantity, type } = body.data;

  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }

  const id = params.data.id;
  const exists = await StockModel.exists({
    _id: params.data.id,
  }).lean();
  if (!exists) {
    return res.status(400).json({ error: "stock not found" });
  }

  if (type == "inc") {
    await StockModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          quantity,
        },
      },
      {
        new: true,
      }
    );
  }

  const stock = await StockModel.findOneAndUpdate(
    {
      _id: id,
      quantity: {
        $gte: quantity,
      },
    },
    {
      $inc: {
        quantity: -quantity,
      },
    },
    {
      new: true,
    }
  );

  if (!stock) {
    return res.status(400).json({
      error: "Insufficient stock",
    });
  }

  return res.status(200).json({ message: "success"});
};
