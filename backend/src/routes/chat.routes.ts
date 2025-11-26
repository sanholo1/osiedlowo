import { Router } from 'express';
import { ChatController } from '@controllers/chat.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();
const chatController = new ChatController();

router.use(authMiddleware);

router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:id/messages', chatController.getConversationMessages);
router.post('/conversations/:id/read', chatController.markAsRead);

router.get('/users/search', chatController.searchUsers);

export default router;
