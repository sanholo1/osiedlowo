import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenException } from '@exceptions';

export const adminMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new ForbiddenException('Wymagana autoryzacja');
        }

        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Brak uprawnień administratora');
        }

        next();
    } catch (error) {
        next(error);
    }
};
