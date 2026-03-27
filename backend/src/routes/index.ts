import { Router } from 'express';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import neighborhoodRoutes from './neighborhood.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API działa poprawnie',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Module routes
router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/neighborhoods', neighborhoodRoutes);



export default router;
