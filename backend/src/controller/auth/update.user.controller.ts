import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { UserModel } from "../../models/user.model";
import { GlobalIdParamsZodSchema } from "../product-controller/updateProduct-controller";
const zodUpdateUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
});
export const updateUserController = async (req: Request, res: Response) => {
  const body = await zodUpdateUserSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }

  if (body.data.email) {
    const userExists = await UserModel.exists({
      email: body.data.email,
      _id: { $ne: params.data.id },
    });
    if (userExists) {
      return res.status(400).json({ error: "user already exists" });
    }
  }

  const user = await UserModel.findByIdAndUpdate(req.params.id, body.data, {
    new: true,
  });
  return res.status(200).json({ message: "success", data: user });
};
