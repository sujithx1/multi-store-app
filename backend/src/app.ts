import express from "express";
import { IUser } from "./types/model-type/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

export default app;
