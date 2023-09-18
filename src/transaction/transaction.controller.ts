import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ControllerPaths } from 'src/shared/constants/controller-paths';
import { TransactionsService } from './transaction.service';
import { CreateTransactionDTO } from './dtos/CreateTransaction.dto';
import { PaginatedResponseDTO } from 'src/shared/dtos/PaginatedResponse.dto';
import { ApiOkResponsePaginated } from 'src/shared/dtos/ApiOkResponsePaginated.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { GetTransactionsQueryDTO } from './dtos/GetTransactionsQuery.dto';
import { CreateTransactionResponseDTO } from './dtos/CreateTransactionResponse.dto';
import { TransactionDTO } from './dtos/Transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller(ControllerPaths.TRANSACTIONS)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOkResponsePaginated(TransactionDTO)
  async getUserTransactions(
    @Request() req,
    @Query() qs: GetTransactionsQueryDTO,
  ): Promise<PaginatedResponseDTO<TransactionDTO>> {
    const userId: number = req.userId;
    const { page, pageSize } = qs;

    const result = await this.transactionsService.findMany({
      userId,
      page,
      pageSize,
    });

    const personalTransactionsData = result.data.map(
      (t) => new TransactionDTO(t, userId),
    );

    return {
      ...result,
      data: personalTransactionsData,
    };
  }

  @Post()
  @ApiCreatedResponse({ type: CreateTransactionResponseDTO })
  async createTransaction(
    @Request() req,
    @Body() transactionDto: CreateTransactionDTO,
  ): Promise<CreateTransactionResponseDTO> {
    const userId: number = req.userId;
    const { amount, recipientId } = transactionDto;

    return this.transactionsService.create({ userId, amount, recipientId });
  }
}
