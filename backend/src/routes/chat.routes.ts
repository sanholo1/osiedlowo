import { Router } from 'express';
import { ChatController } from '@controllers/chat.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();
const chatController = new ChatController();

// All chat routes require authentication
router.use(authMiddleware);

// Conversation routes
router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:id/messages', chatController.getConversationMessages);
router.post('/conversations/:id/read', chatController.markAsRead);

// User search
router.get('/users/search', chatController.searchUsers);

export default router;
