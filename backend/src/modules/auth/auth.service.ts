import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '@config/database';
import { appConfig } from '@config/app.config';
import { User } from '@modules/user/entities/user.entity';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { AppError } from '@shared/utils/app-error';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(registerDto: RegisterUserDto): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName } = registerDto;

      const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const token = this.generateToken(savedUser.id);

    return {
      user: savedUser,
      token,
    };
  }

  async login(loginDto: LoginUserDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      appConfig.jwt.secret,
      { expiresIn: appConfig.jwt.expiresIn }
    );
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, appConfig.jwt.secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}