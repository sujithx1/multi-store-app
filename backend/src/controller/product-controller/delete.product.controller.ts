import { ProductModel } from "../../models/product.model";
import { GlobalIdParamsZodSchema } from "./updateProduct-controller";
import { Request, Response } from "express";
export const  deleteProductController = async (req: Request, res: Response) => {
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }

  await ProductModel.findByIdAndDelete(params.data.id);

  //FIXME: in future need to check   transfer of stock etc....



  return res.status(200).json({ message: "succes to delete  product" });
};