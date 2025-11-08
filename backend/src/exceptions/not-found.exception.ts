import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Nie znaleziono zasobu') {
    super(message, 404);
  }
}
