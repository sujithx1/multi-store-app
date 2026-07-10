import { Request, Response } from "express";
import { StoreModel } from "../../models/store.model";
import { GlobalIdParamsZodSchema } from "../product-controller/updateProduct-controller";

export const deleteStoreController = async (req: Request, res: Response) => {
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }

  await StoreModel.findByIdAndDelete(params.data.id);

  //FIXME: in future need to check   transfer of stock etc....

  return res.status(200).json({ message: "succes to delete  store" });
};
