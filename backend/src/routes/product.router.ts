import { Router } from "express";
import { createProductController, deleteProductController, getProductCOntroller, updateProductController } from "../controller";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";

const productrouter = Router();

productrouter.use(authenticate);

productrouter.post("/", isAdminOnly, createProductController);
productrouter.get("/", getProductCOntroller);
productrouter.put("/:id", isAdminOnly, updateProductController);
productrouter.delete("/:id", isAdminOnly, deleteProductController);

export default productrouter