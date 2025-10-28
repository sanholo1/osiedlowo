import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/app-error';

interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    statusCode = 400;
    message = 'Database query failed';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    console.error('Error:', err);
  }

  res.status(statusCode).json(errorResponse);
};