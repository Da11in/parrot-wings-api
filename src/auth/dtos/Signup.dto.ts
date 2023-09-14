import { IsString, IsStrongPassword, MinLength } from 'class-validator';
import { LoginDTO } from './Login.dto';

export class SignupDTO extends LoginDTO {
  @IsStrongPassword()
  password: string;

  @MinLength(1)
  @IsString()
  firstName: string;

  @MinLength(1)
  @IsString()
  lastName: string;
}
