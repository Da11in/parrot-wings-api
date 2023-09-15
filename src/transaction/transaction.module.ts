import { Module } from '@nestjs/common';
import { TransactionsController } from './transaction.controller';
import { TransactionsService } from './transaction.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [JwtModule],
  providers: [TransactionsService, PrismaService],
  controllers: [TransactionsController],
})
export class TransactionModule {}
