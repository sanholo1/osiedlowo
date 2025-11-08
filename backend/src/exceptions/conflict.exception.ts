import { HttpException } from './http.exception';

export class ConflictException extends HttpException {
  constructor(message: string = 'Konflikt danych') {
    super(message, 409);
  }
}
