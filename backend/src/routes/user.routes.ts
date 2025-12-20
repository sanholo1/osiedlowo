import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.update);
router.post('/change-password', authMiddleware, userController.changePassword);


router.post('/block/:blockedUserId', authMiddleware, userController.blockUser);
router.delete('/block/:blockedUserId', authMiddleware, userController.unblockUser);
router.get('/blocked', authMiddleware, userController.getBlockedUsers);

router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

export default router;
