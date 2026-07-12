import { Router } from 'express';
import { authenticate, isAdminOnly } from '../middleware/authmiddleware';
import { getStoresController, storeCreateController } from '../controller';
const storeRouter = Router();
storeRouter.use(authenticate);
storeRouter.post('/', isAdminOnly, storeCreateController);
storeRouter.get('/',  getStoresController);

export default storeRouter;
