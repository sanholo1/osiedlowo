import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/app.config';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '@dtos';
import { User } from '../entities/user.entity';
import { 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException,
  HttpException
} from '@exceptions';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Użytkownik z tym emailem już istnieje');
    }

    // Hashuj hasło
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Utwórz użytkownika
    const user = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role || 'user',
    });

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: User }> {
    // Znajdź użytkownika
    const user = await this.userRepository.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Sprawdź czy konto jest aktywne
    if (!user.isActive) {
      throw new ForbiddenException('Konto zostało dezaktywowane');
    }

    // Sprawdź hasło
    const isValidPassword = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Generuj token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      appConfig.jwt.secret,
      { expiresIn: appConfig.jwt.expiresIn }
    );

    return { token, user };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Użytkownik nie został znaleziony');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Użytkownik nie został znaleziony');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new HttpException('Nie udało się zaktualizować użytkownika', 500);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new HttpException('Nie udało się usunąć użytkownika', 500);
    }
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);

    // Sprawdź stare hasło
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('Nieprawidłowe stare hasło');
    }

    // Hashuj nowe hasło
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(id, { password: hashedPassword });
  }
}
