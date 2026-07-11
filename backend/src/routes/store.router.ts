import { Router } from 'express';
import { isAdminOnly } from '../middleware/authmiddleware';
import { getStoresController, storeCreateController } from '../controller';
const router = Router();

router.post('/', isAdminOnly, storeCreateController);
router.get('/',  getStoresController);

export default router;
