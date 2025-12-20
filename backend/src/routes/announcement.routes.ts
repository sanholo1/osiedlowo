import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const announcementController = new AnnouncementController();

router.use(authMiddleware);


router.get('/neighborhoods/:id/announcements', announcementController.getAnnouncementsByNeighborhood);
router.post('/neighborhoods/:id/announcements', announcementController.createAnnouncement);


router.get('/announcements/:id', announcementController.getAnnouncementById);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.patch('/announcements/:id/status', announcementController.updateAnnouncementStatus);
router.put('/announcements/:id/pin', announcementController.pinAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);


router.post('/announcements/:id/respond', announcementController.respondToAnnouncement);
router.delete('/announcements/:id/respond', announcementController.withdrawResponse);


router.post('/announcements/:id/accept/:responseId', announcementController.acceptOffer);


router.post('/announcements/:id/view', announcementController.recordView);
router.get('/announcements/:id/viewers', announcementController.getViewers);

export default router;

