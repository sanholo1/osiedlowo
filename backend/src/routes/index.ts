import { Router } from 'express';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import neighborhoodRoutes from './neighborhood.routes';
import announcementRoutes from './announcement.routes';
import notificationRoutes from './notification.routes';
import ratingRoutes from './rating.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API działa poprawnie',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/', announcementRoutes);
router.use('/', notificationRoutes);
router.use('/neighborhoods', neighborhoodRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);

export default router;


