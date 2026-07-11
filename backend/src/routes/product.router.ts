import { Router } from "express";
import { createProductController, getProductCOntroller } from "../controller";
import { authenticate, isAdminOnly } from "../middleware/authmiddleware";

const router = Router();

router.use(authenticate);

router.post("/", isAdminOnly, createProductController);
router.get("/", getProductCOntroller);
