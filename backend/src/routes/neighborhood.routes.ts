import { Router } from 'express';
import { NeighborhoodController } from '../controllers/neighborhood.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const neighborhoodController = new NeighborhoodController();

// Wszystkie endpointy wymagają autoryzacji
router.use(authMiddleware);

// GET /api/neighborhoods - Pobierz wszystkie sąsiedztwa
router.get('/', neighborhoodController.getAllNeighborhoods);

// GET /api/neighborhoods/:id - Pobierz sąsiedztwo po ID
router.get('/:id', neighborhoodController.getNeighborhoodById);

// POST /api/neighborhoods - Utwórz nowe sąsiedztwo
router.post('/', neighborhoodController.createNeighborhood);

// POST /api/neighborhoods/:id/join - Dołącz do sąsiedztwa
router.post('/:id/join', neighborhoodController.joinNeighborhood);

// POST /api/neighborhoods/:id/leave - Opuść sąsiedztwo
router.post('/:id/leave', neighborhoodController.leaveNeighborhood);

// DELETE /api/neighborhoods/:id - Usuń sąsiedztwo
router.delete('/:id', neighborhoodController.deleteNeighborhood);

export default router;
