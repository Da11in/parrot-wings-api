import { Exclude } from 'class-transformer';
import { UserProfileDTO } from './UserProfile.dto';

export class PublicUserProfileDTO extends UserProfileDTO {
  @Exclude()
  balance: number;
}
