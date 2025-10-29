import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Nieprawidłowy format email' })
  email: string;

  @IsString({ message: 'Hasło musi być tekstem' })
  @MinLength(6, { message: 'Hasło musi mieć minimum 6 znaków' })
  password: string;
}
