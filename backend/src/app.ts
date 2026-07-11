import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/error-handler";
import { IUser } from "./types/model-type/user";
import { router } from "./routes";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

connectDB();
app.use(morgan("dev"));
app.use("/api/v1", router);
app.use(errorHandler as express.ErrorRequestHandler);

export default app;
