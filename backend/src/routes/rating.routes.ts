import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const ratingController = new RatingController();


router.use(authMiddleware);


router.post('/', ratingController.createRating);


router.put('/:id', ratingController.updateRating);


router.delete('/:id', ratingController.deleteRating);


router.get('/user/:userId', ratingController.getUserRatings);


router.get('/user/:userId/stats', ratingController.getRatingStats);

export default router;
