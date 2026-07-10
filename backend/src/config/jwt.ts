import jwt from "jsonwebtoken";
import { IUser } from "../types/model-type/user";

interface JwtPayload {
  userId: string;
  role: IUser["role"];
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const createToken = (payload: JwtPayload): string => {
  return jwt.sign({ userId: payload.userId, role: payload.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
