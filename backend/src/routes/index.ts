import { Router } from 'express';
import { userRoutes } from '@modules/user';

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



export default router;
