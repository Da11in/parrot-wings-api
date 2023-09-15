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

@UseGuards(AuthGuard)
@Controller(ControllerPaths.TRANSACTIONS)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async getUserTransactions(
    @Request() req,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    const userId: number = req.userId;

    return this.transactionsService.findMany({ userId, page, pageSize });
  }

  @Post()
  async createTransaction(
    @Request() req,
    @Body() transactionDto: CreateTransactionDTO,
  ) {
    const userId: number = req.userId;
    const { amount, recipientId } = transactionDto;

    return this.transactionsService.create({ userId, amount, recipientId });
  }
}
