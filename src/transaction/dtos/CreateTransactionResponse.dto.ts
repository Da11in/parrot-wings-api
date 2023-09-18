import { ApiProperty } from '@nestjs/swagger';
import { TransactionDTO } from './Transaction.dto';

export class CreateTransactionResponseDTO {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  transaction: TransactionDTO;
}
