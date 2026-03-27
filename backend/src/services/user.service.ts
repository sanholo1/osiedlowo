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
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Użytkownik z tym emailem już istnieje');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

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
    const user = await this.userRepository.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Konto zostało dezaktywowane');
    }

    const isValidPassword = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

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

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('Nieprawidłowe stare hasło');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(id, { password: hashedPassword });
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    const { BlockedUserRepository } = await import('../repositories/blocked-user.repository');
    const blockedUserRepository = new BlockedUserRepository();

    if (userId === blockedUserId) {
      throw new BadRequestException('Nie możesz zablokować sam siebie');
    }

    const blockedUser = await this.findById(blockedUserId);
    if (!blockedUser) {
      throw new NotFoundException('Użytkownik nie został znaleziony');
    }

    const isAlreadyBlocked = await blockedUserRepository.isBlocked(userId, blockedUserId);
    if (isAlreadyBlocked) {
      throw new BadRequestException('Ten użytkownik jest już zablokowany');
    }

    await blockedUserRepository.create(userId, blockedUserId);
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    const { BlockedUserRepository } = await import('../repositories/blocked-user.repository');
    const blockedUserRepository = new BlockedUserRepository();

    const deleted = await blockedUserRepository.delete(userId, blockedUserId);
    if (!deleted) {
      throw new NotFoundException('Użytkownik nie był zablokowany');
    }
  }

  async getBlockedUsers(userId: string) {
    const { BlockedUserRepository } = await import('../repositories/blocked-user.repository');
    const blockedUserRepository = new BlockedUserRepository();
    return blockedUserRepository.findBlockedUsers(userId);
  }

  async isUserBlocked(userId: string, blockedUserId: string): Promise<boolean> {
    const { BlockedUserRepository } = await import('../repositories/blocked-user.repository');
    const blockedUserRepository = new BlockedUserRepository();
    return blockedUserRepository.isBlocked(userId, blockedUserId);
  }


  async getAllUsersWithPagination(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository['repository']
      .createQueryBuilder('user');

    if (options?.search) {
      queryBuilder.where(
        'user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search',
        { search: `%${options.search}%` }
      );
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = await this.findById(userId);

    if (!['user', 'admin'].includes(role)) {
      throw new BadRequestException('Nieprawidłowa rola');
    }

    const updated = await this.userRepository.update(userId, { role });
    if (!updated) {
      throw new HttpException('Nie udało się zaktualizować roli użytkownika', 500);
    }

    return updated;
  }

  async deleteUserAsAdmin(userId: string): Promise<void> {
    const user = await this.findById(userId);

    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new HttpException('Nie udało się usunąć użytkownika', 500);
    }
  }

  async updateUserAsAdmin(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    attributes?: string[];
  }): Promise<User> {
    const user = await this.findById(userId);

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException('Użytkownik z tym adresem email już istnieje');
      }
    }

    const updated = await this.userRepository.update(userId, data);
    if (!updated) {
      throw new HttpException('Nie udało się zaktualizować użytkownika', 500);
    }

    return updated;
  }
}

