import { IsString, IsStrongPassword, MinLength } from 'class-validator';
import { LoginDTO } from './Login.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDTO extends LoginDTO {
  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @MinLength(1)
  @IsString()
  firstName: string;

  @ApiProperty()
  @MinLength(1)
  @IsString()
  lastName: string;
}
