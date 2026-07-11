import { Router } from "express";
import authrouter from "./auth.router";
import productRouter from "./product.router";
import stockRouter from "./stock.router";
import storeRouter from "./store.router";
export const router = Router();


router.use('/auth',authrouter);
router.use('/product',productRouter);
router.use('/stock',stockRouter);
router.use('/store',storeRouter);


