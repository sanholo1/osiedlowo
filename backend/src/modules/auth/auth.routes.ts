import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validationMiddleware } from '@shared/middleware/validation.middleware';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';

const router = Router();
const authController = new AuthController();

// Register new user
router.post(
  '/register',
  validationMiddleware(RegisterUserDto),
  authController.register.bind(authController)
);

// Login user
router.post(
  '/login',
  validationMiddleware(LoginUserDto),
  authController.login.bind(authController)
);

// Logout user (client-side token removal)
router.post('/logout', authController.logout.bind(authController));

export { router as authRouter };