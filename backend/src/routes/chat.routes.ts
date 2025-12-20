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
router.delete('/conversations/:id', chatController.deleteConversation);

router.get('/users/search', chatController.searchUsers);
router.get('/unread-count', chatController.getUnreadCount);
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;

