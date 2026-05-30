import { Router } from 'express';
import { listHistory, deleteHistory, toggleFavorite } from '../controllers/history.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', listHistory);
router.delete('/:id', deleteHistory);
router.patch('/:id/favorite', toggleFavorite);

export { router as historyRouter };
