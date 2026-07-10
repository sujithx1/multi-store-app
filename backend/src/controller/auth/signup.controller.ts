import { Request, Response } from "express";
import z from "zod";
import { hashPasseword } from "../../config/bycript";
import { Pretty_Error } from "../../config/error";
import { UserModel } from "../../models/user.model";

const zodSignUpSchema = z.object({
  username: z.string("username is required").min(3),
  email: z.email("invalid email"),
  password: z.string("password is required").min(6),
});

export const signUpController = async (req: Request, res: Response) => {
  const body = await zodSignUpSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  const { username, email, password } = body.data;

  const user = await UserModel.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "user already exists" });
  }

  const hash = await hashPasseword(password);
  await UserModel.create({
    username,
    email,
    password: hash,
  });

  const userobj = await UserModel.findOne({ email }).select("-password");
  return res.status(201).json({ message: "success", data: userobj });
};
