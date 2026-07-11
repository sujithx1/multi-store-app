import { Router } from "express";
import { login, signUpController } from "../controller";
const authrouter = Router();

authrouter.post("/sig-up", signUpController);
authrouter.post("/login", login);

export default authrouter;
