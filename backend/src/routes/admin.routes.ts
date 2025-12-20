import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const adminController = new AdminController();


router.use(authMiddleware);
router.use(adminMiddleware);


router.get('/stats', adminController.getStats);


router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);


router.get('/announcements', adminController.getAnnouncements);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);


router.get('/ratings', adminController.getRatings);
router.put('/ratings/:id', adminController.updateRating);
router.delete('/ratings/:id', adminController.deleteRating);


router.get('/neighborhoods', adminController.getNeighborhoods);
router.delete('/neighborhoods/:id/member/:userId', adminController.removeMember);

export default router;
