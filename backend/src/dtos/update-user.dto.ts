import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Imię musi być tekstem' })
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  @MaxLength(50, { message: 'Imię może mieć maksymalnie 50 znaków' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Nazwisko musi być tekstem' })
  @MinLength(2, { message: 'Nazwisko musi mieć minimum 2 znaki' })
  @MaxLength(50, { message: 'Nazwisko może mieć maksymalnie 50 znaków' })
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
