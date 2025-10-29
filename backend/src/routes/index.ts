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

// TODO: Dodaj tutaj kolejne moduły
// router.use('/properties', propertyRoutes);
// router.use('/announcements', announcementRoutes);
// router.use('/payments', paymentRoutes);

export default router;
