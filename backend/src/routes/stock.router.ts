import { Router } from "express";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";
import { listStockController, quantutyChangeController, transferStockController } from "../controller";

const router = Router();

router.use(authenticate)
router.post("/adjust", isAdminOnly, quantutyChangeController);
router.post("/transfer", isAdminOnly, transferStockController);
router.get("/",  listStockController);
