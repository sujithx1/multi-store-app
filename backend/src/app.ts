import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { IUser } from "./types/model-type/user";
import connectDB from "./config/db";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
const app = express();
app.use(cors())
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

connectDB();
app.use(morgan("dev"));
app.use(errorHandler as express.ErrorRequestHandler);

export default app;
