import { HttpException } from './http.exception';

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Dostęp zabroniony') {
    super(message, 403);
  }
}
