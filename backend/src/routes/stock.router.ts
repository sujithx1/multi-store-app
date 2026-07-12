import { Router } from "express";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";
import { listStockController, quantutyChangeController, transferStockController, addStockController, updateStockController } from "../controller";

const stockrouter = Router();

stockrouter.use(authenticate)
stockrouter.post("/adjust/:id",authenticate, isAdminOnly, quantutyChangeController);
stockrouter.post("/transfer", isAdminOnly, transferStockController);
stockrouter.post("/add", isAdminOnly, addStockController);
stockrouter.post("/update", isAdminOnly, updateStockController);
stockrouter.get("/",  listStockController);

export default stockrouter;