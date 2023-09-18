import { ApiProperty } from '@nestjs/swagger';
import { PublicUserProfileDTO } from 'src/user/dtos/PublicUserProfile.dto';
import { TransactionType } from '../constants/TransactionType';
import { TransactionExtendedInfo } from '../types/TransactionExtendedInfo';

export class TransactionDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  type: TransactionType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  sender: PublicUserProfileDTO;

  @ApiProperty()
  recipient: PublicUserProfileDTO;

  @ApiProperty()
  balanceBeforeTransaction: number;

  @ApiProperty()
  balanceAfterTransaction: number;

  constructor(transaction: TransactionExtendedInfo, userId: number) {
    this.id = transaction.id;
    this.amount = transaction.amount;
    this.createdAt = transaction.createdAt;
    this.sender = transaction.sender;
    this.recipient = transaction.recipient;

    const type =
      transaction.senderId === userId
        ? TransactionType.OUTGOING
        : TransactionType.INCOMING;

    const balanceBeforeTransaction =
      type === TransactionType.INCOMING
        ? transaction.recipientBalanceBeforeTransaction
        : transaction.senderBalanceBeforeTransaction;

    const balanceAfterTransaction =
      type === TransactionType.INCOMING
        ? transaction.recipientBalanceAfterTransaction
        : transaction.senderBalanceAfterTransaction;

    this.type = type;
    this.balanceBeforeTransaction = balanceBeforeTransaction;
    this.balanceAfterTransaction = balanceAfterTransaction;
  }
}
