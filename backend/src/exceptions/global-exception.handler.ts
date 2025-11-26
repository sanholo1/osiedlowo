import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';

export const globalExceptionHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Wewnętrzny błąd serwera';
  let status = 'error';

  if (err instanceof HttpException) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
  }
  else if (err.name === 'QueryFailedError') {
    statusCode = 400;
    message = 'Błąd zapytania do bazy danych';
    status = 'fail';
  }
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Błąd walidacji danych';
    status = 'fail';
  }
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Nieprawidłowy token';
    status = 'fail';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token wygasł';
    status = 'fail';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  return res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name
    }),
  });
};
