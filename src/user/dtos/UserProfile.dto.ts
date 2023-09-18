import { Exclude } from 'class-transformer';
import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDTO implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  balance: number;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<UserProfileDTO>) {
    Object.assign(this, partial);
  }
}
