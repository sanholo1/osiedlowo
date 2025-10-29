import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '@shared/middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Publiczne endpointy
router.post('/register', userController.register);
router.post('/login', userController.login);

// Chronione endpointy - wymagają autoryzacji
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.update);
router.post('/change-password', authMiddleware, userController.changePassword);

// Endpointy administracyjne (TODO: dodać middleware sprawdzający rolę admin)
router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

export default router;
