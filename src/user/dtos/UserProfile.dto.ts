import { Exclude } from 'class-transformer';
import { IUser } from '../interfaces/IUser';

export class UserProfileDTO implements IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
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
