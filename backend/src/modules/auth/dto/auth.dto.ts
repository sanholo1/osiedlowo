import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Length(2, 100, { message: 'First name must be between 2 and 100 characters' })
  firstName: string;

  @IsString()
  @Length(2, 100, { message: 'Last name must be between 2 and 100 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(6, 255, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(1, 255, { message: 'Password is required' })
  password: string;
}