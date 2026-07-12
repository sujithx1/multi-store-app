import { Router } from 'express';
import { authenticate, isAdminOnly } from '../middleware/authmiddleware';
import { deleteStoreController, getStoresController, storeCreateController, storeUpdateController } from '../controller';
const storeRouter = Router();
storeRouter.use(authenticate);
storeRouter.post('/', isAdminOnly, storeCreateController);
storeRouter.get('/',  getStoresController);
storeRouter.put('/:id', isAdminOnly, storeUpdateController);
storeRouter.delete('/:id', isAdminOnly, deleteStoreController);

export default storeRouter;
