import { Router } from "express";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";
import { listStockController, quantutyChangeController, transferStockController } from "../controller";

const stockrouter = Router();

stockrouter.use(authenticate)
stockrouter.post("/adjust",authenticate, isAdminOnly, quantutyChangeController);
stockrouter.post("/transfer", isAdminOnly, transferStockController);
stockrouter.get("/",  listStockController);

export default stockrouter