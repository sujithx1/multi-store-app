import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { GlobalIdParamsZodSchema } from "../product-controller/updateProduct-controller";

export const deleteUserController = async (req: Request, res: Response) => {
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }

  await UserModel.findByIdAndDelete(params.data.id);

  return res.status(200).json({ message: "succes to delete  user" });
};
