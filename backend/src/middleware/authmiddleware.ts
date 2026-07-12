import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../config/jwt";
import { UserModel } from "../models/user.model";
import { IUser } from "../types/model-type/user";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
console.log('authHeader',authHeader)
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
console.log('token',token)
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.log('payload',payload)
    const user = await UserModel.findById(payload.userId).select(
      "-passwordHash"
    );
console.log("user",user)
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.user)
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};


// this one we can use without optional 

export const getAuthContext = async (req: Request, res: Response) => {
  const val = req.user;
  if (!val) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return val as IUser;
};
