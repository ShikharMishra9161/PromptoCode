import { Router } from 'express';
import { generateUIController } from '../controllers/generate.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateUISchema } from '../validators/schemas';

const router = Router();

// All generate routes require auth
router.use(protect);

router.post('/ui', validate(generateUISchema), generateUIController);

export { router as generateRouter };
