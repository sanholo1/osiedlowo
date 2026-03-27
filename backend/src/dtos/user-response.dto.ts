import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  attributes: string[];
  role: string;
  isActive: boolean;
  averageRating?: number;
  totalRatings?: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User, ratingStats?: { average: number; count: number }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.address = user.address;
    dto.attributes = user.attributes;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    if (ratingStats) {
      dto.averageRating = ratingStats.average;
      dto.totalRatings = ratingStats.count;
    }

    return dto;
  }

  static fromEntities(users: User[]): UserResponseDto[] {
    return users.map(user => this.fromEntity(user));
  }
}

export class AuthResponseDto {
  token: string;
  user: UserResponseDto;

  constructor(token: string, user: User) {
    this.token = token;
    this.user = UserResponseDto.fromEntity(user);
  }
}
