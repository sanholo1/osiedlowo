import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/app.config';
import { AppError } from '@shared/utils/app-error';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new AppError('Token autoryzacji jest wymagany', 401);
    }

    // Weryfikuj token
    const decoded = jwt.verify(token, appConfig.jwt.secret) as {
      userId: string;
      email: string;
      role: string;
    };

    // Dołącz użytkownika do żądania
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Nieprawidłowy token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token wygasł', 401));
    } else {
      next(error);
    }
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