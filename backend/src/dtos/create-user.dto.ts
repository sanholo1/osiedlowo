import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Nieprawidłowy format email' })
  email: string;

  @IsString({ message: 'Hasło musi być tekstem' })
  @MinLength(6, { message: 'Hasło musi mieć minimum 6 znaków' })
  @MaxLength(50, { message: 'Hasło może mieć maksymalnie 50 znaków' })
  password: string;

  @IsString({ message: 'Imię musi być tekstem' })
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  @MaxLength(50, { message: 'Imię może mieć maksymalnie 50 znaków' })
  firstName: string;

  @IsString({ message: 'Nazwisko musi być tekstem' })
  @MinLength(2, { message: 'Nazwisko musi mieć minimum 2 znaki' })
  @MaxLength(50, { message: 'Nazwisko może mieć maksymalnie 50 znaków' })
  lastName: string;

  @IsOptional()
  @IsString()
  role?: string;
}
