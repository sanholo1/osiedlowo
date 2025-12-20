import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/app.config';
import { UnauthorizedException } from '@exceptions';
import { UserRepository } from '@repositories/user.repository';

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
      throw new UnauthorizedException('Token autoryzacji jest wymagany');
    }

    const decoded = jwt.verify(token, appConfig.jwt.secret) as {
      userId: string;
      email: string;
      role: string;
    };

    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedException('Użytkownik nie istnieje');
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedException('Nieprawidłowy token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedException('Token wygasł'));
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

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
