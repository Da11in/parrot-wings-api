import { Module } from '@nestjs/common';
import { TransactionsController } from './transaction.controller';
import { TransactionsService } from './transaction.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [JwtModule],
  providers: [TransactionsService, UserService, PrismaService],
  controllers: [TransactionsController],
})
export class TransactionModule {}
