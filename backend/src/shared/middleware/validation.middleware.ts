import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from '@shared/utils/app-error';

export const validationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation failed';
        });

        throw new AppError(`Validation failed: ${errorMessages.join('; ')}`, 400);
      }

      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
};