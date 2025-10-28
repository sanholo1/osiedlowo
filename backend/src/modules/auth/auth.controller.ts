import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerDto: RegisterUserDto = req.body;
      const result = await this.authService.register(registerDto);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginUserDto = req.body;
      const result = await this.authService.login(loginDto);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // JWT tokens are stateless, so logout is handled client-side
      // by removing the token from storage
      res.status(200).json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}