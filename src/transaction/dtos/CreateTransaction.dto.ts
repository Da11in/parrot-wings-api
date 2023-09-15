import { IsNumber, IsPositive } from 'class-validator';

export class CreateTransactionDTO {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  recipientId: number;
}
