import { Router } from 'express'
import { login, signUpController } from '../controller';
import { authenticate } from '../middleware/authmiddleware';
const router = Router();

router.post('/sig-up',signUpController);
router.post('/login', login);

export default router;
