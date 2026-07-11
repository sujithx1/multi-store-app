import { Router } from 'express';
import { isAdminOnly } from '../middleware/authmiddleware';
import { getStoresController, storeCreateController } from '../controller';
const storeRouter = Router();

storeRouter.post('/', isAdminOnly, storeCreateController);
storeRouter.get('/',  getStoresController);

export default storeRouter;
