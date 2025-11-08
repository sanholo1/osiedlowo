import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Brak autoryzacji') {
    super(message, 401);
  }
}
