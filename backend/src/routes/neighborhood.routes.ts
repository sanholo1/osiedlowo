import { Router } from 'express';
import { NeighborhoodController } from '../controllers/neighborhood.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const neighborhoodController = new NeighborhoodController();

router.use(authMiddleware);

router.get('/', neighborhoodController.getAllNeighborhoods);

router.get('/:id', neighborhoodController.getNeighborhoodById);

router.post('/', neighborhoodController.createNeighborhood);

router.post('/:id/join', neighborhoodController.joinNeighborhood);

router.post('/:id/leave', neighborhoodController.leaveNeighborhood);

router.delete('/:id', neighborhoodController.deleteNeighborhood);

export default router;
