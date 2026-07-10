import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { UserModel } from "../../models/user.model";
import { hashPasseword } from "../../config/bycript";

const zodCreateUserSchema = z.object({
  username: z.string("username is required").min(3),
  email: z.email("invalid email"),
  password: z.string("password is required").min(6),
});
export const createUserController = async (req: Request, res: Response) => {
  const body = await zodCreateUserSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }
  const userExists = await UserModel.findOne({ email: body.data.email });
  if (userExists) {
    return res.status(400).json({ error: "user already exists" });
  }
  const hash = await hashPasseword(body.data.password);
  body.data.password = hash;
  const user = await UserModel.create(body.data);

  return res.status(200).json({ message: "success", data: user });
};
