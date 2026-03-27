import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto, UserResponseDto, AuthResponseDto } from '@dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Walidacja DTO
      const createUserDto = plainToInstance(CreateUserDto, req.body);
      const errors = await validate(createUserDto);
      
      if (errors.length > 0) {
        const messages = errors.map(err => Object.values(err.constraints || {})).flat();
        res.status(400).json({
          status: 'ERROR',
          message: 'Błąd walidacji',
          errors: messages
        });
        return;
      }

      const user = await this.userService.register(createUserDto);
      const responseDto = UserResponseDto.fromEntity(user);

      res.status(201).json({
        status: 'OK',
        message: 'Użytkownik został zarejestrowany',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Walidacja DTO
      const loginUserDto = plainToInstance(LoginUserDto, req.body);
      const errors = await validate(loginUserDto);
      
      if (errors.length > 0) {
        const messages = errors.map(err => Object.values(err.constraints || {})).flat();
        res.status(400).json({
          status: 'ERROR',
          message: 'Błąd walidacji',
          errors: messages
        });
        return;
      }

      const { token, user } = await this.userService.login(loginUserDto);
      const responseDto = new AuthResponseDto(token, user);

      res.json({
        status: 'OK',
        message: 'Logowanie zakończone sukcesem',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      const responseDto = UserResponseDto.fromEntities(users);

      res.json({
        status: 'OK',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      const responseDto = UserResponseDto.fromEntity(user);

      res.json({
        status: 'OK',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User ID pochodzi z middleware auth
      const userId = (req as any).user.userId;
      const user = await this.userService.findById(userId);
      const responseDto = UserResponseDto.fromEntity(user);

      res.json({
        status: 'OK',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Walidacja DTO
      const updateUserDto = plainToInstance(UpdateUserDto, req.body);
      const errors = await validate(updateUserDto);
      
      if (errors.length > 0) {
        const messages = errors.map(err => Object.values(err.constraints || {})).flat();
        res.status(400).json({
          status: 'ERROR',
          message: 'Błąd walidacji',
          errors: messages
        });
        return;
      }

      const user = await this.userService.update(id, updateUserDto);
      const responseDto = UserResponseDto.fromEntity(user);

      res.json({
        status: 'OK',
        message: 'Użytkownik został zaktualizowany',
        data: responseDto
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.delete(id);

      res.json({
        status: 'OK',
        message: 'Użytkownik został usunięty'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Stare i nowe hasło są wymagane'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Nowe hasło musi mieć minimum 6 znaków'
        });
        return;
      }

      await this.userService.changePassword(userId, oldPassword, newPassword);

      res.json({
        status: 'OK',
        message: 'Hasło zostało zmienione'
      });
    } catch (error) {
      next(error);
    }
  };
}
