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
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);


router.get('/announcements', adminController.getAnnouncements);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);


router.get('/ratings', adminController.getRatings);
router.put('/ratings/:id', adminController.updateRating);
router.delete('/ratings/:id', adminController.deleteRating);


router.get('/neighborhoods', adminController.getNeighborhoods);
router.put('/neighborhoods/:id', adminController.updateNeighborhood);
router.delete('/neighborhoods/:id', adminController.deleteNeighborhood);
router.delete('/neighborhoods/:id/member/:userId', adminController.removeMember);

// Logs
router.get('/logs', adminController.getLogs);
router.get('/logs/logins', adminController.getLoginHistory);

// System Announcements
router.get('/system-announcements', adminController.getSystemAnnouncements);
router.post('/system-announcements', adminController.createSystemAnnouncement);
router.put('/system-announcements/:id', adminController.updateSystemAnnouncement);
router.delete('/system-announcements/:id', adminController.deleteSystemAnnouncement);

// Content Moderation
router.put('/announcements/:id/pin', adminController.pinAnnouncement);
router.put('/announcements/:id/flag', adminController.flagAnnouncement);
router.delete('/announcements/bulk', adminController.bulkDeleteAnnouncements);

// Conversation Moderation
router.get('/conversations', adminController.getConversations);
router.get('/conversations/:id/messages', adminController.getConversationMessages);
router.delete('/messages/:id', adminController.deleteMessage);

// Extended Statistics
router.get('/stats/extended', adminController.getExtendedStats);

// Data Export
router.get('/export/users', adminController.exportUsers);
router.get('/export/stats', adminController.exportStats);

export default router;

