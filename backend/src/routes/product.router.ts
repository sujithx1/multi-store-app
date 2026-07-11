import { Router } from "express";
import { createProductController, getProductCOntroller } from "../controller";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";

const productrouter = Router();

productrouter.use(authenticate);

productrouter.post("/", isAdminOnly, createProductController);
productrouter.get("/", getProductCOntroller);
export default productrouter