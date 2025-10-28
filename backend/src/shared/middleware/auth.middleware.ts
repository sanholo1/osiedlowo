import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@modules/auth/auth.service';
import { appConfig } from '@config/app.config';
import { AppError } from '@shared/utils/app-error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const authService = new AuthService();

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip authentication if disabled in development
    if (appConfig.disableAuth) {
      // Create a mock user for development
      req.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        firstName: 'Developer',
        lastName: 'User',
        role: 'admin',
      };
      return next();
    }

    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      throw new AppError('User not found or inactive', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};