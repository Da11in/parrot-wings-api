import { Transaction } from '@prisma/client';
import { PublicUserProfileDTO } from 'src/user/dtos/PublicUserProfile.dto';

export type TransactionExtendedInfo = Transaction & {
  sender: PublicUserProfileDTO;
  recipient: PublicUserProfileDTO;
};
