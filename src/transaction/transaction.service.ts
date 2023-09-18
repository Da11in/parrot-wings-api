import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ErrorMessages } from 'src/shared/constants/error-messages';
import { defaultPaginationValues } from 'src/shared/constants/pagination';
import { PaginatedResponseDTO } from 'src/shared/dtos/PaginatedResponse.dto';
import { TransactionDTO } from './dtos/Transaction.dto';
import { TransactionType } from './constants/TransactionType';
import { PublicUserProfileDTO } from 'src/user/dtos/PublicUserProfile.dto';
import { TransactionExtendedInfo } from './types/TransactionExtendedInfo';
import { CreateTransactionResponseDTO } from './dtos/CreateTransactionResponse.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async findMany(params: {
    userId: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponseDTO<TransactionExtendedInfo>> {
    const { userId, page, pageSize } = params;

    const skip = page && pageSize ? (page - 1) * pageSize : 0;
    const take = pageSize || defaultPaginationValues.pageSize;
    const where: Prisma.TransactionWhereInput = {
      OR: [{ senderId: userId }, { recipientId: userId }],
    };

    const publicUserFields: Prisma.UserSelect = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    };

    const include: Prisma.TransactionInclude = {
      sender: {
        select: { ...publicUserFields },
      },
      recipient: {
        select: { ...publicUserFields },
      },
    };

    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    const [count, transactions] = await this.prismaService.$transaction([
      this.prismaService.transaction.count({ where }),
      this.prismaService.transaction.findMany({
        skip,
        take,
        where,
        include,
        orderBy,
      }),
    ]);

    return {
      page: page || defaultPaginationValues.page,
      totalPages: Math.ceil(count / take),
      data: transactions,
    };
  }

  async create(params: {
    userId: number;
    amount: number;
    recipientId: number;
  }): Promise<CreateTransactionResponseDTO> {
    const { userId, amount, recipientId } = params;

    const [sender, recipient] = await this.prismaService.$transaction([
      this.prismaService.user.findFirst({ where: { id: userId } }),
      this.prismaService.user.findFirst({ where: { id: recipientId } }),
    ]);

    if (sender.id === recipient.id) {
      throw new HttpException(
        ErrorMessages.SELF_TRANSACTION,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!recipient) {
      throw new HttpException(
        ErrorMessages.RECIPIENT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (sender.balance < amount) {
      throw new HttpException(
        ErrorMessages.INSUFFICIENT_FUNDS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const transaction: Prisma.TransactionCreateInput = {
      amount,
      sender: { connect: { id: sender.id } },
      recipient: { connect: { id: recipient.id } },
      senderBalanceBeforeTransaction: sender.balance,
      senderBalanceAfterTransaction: sender.balance - amount,
      recipientBalanceBeforeTransaction: recipient.balance,
      recipientBalanceAfterTransaction: recipient.balance + amount,
    };

    const result = await this.prismaService.$transaction([
      this.prismaService.transaction.create({ data: transaction }),
      this.prismaService.user.update({
        where: { id: sender.id },
        data: { balance: transaction.senderBalanceAfterTransaction },
      }),
      this.prismaService.user.update({
        where: { id: recipient.id },
        data: { balance: transaction.recipientBalanceAfterTransaction },
      }),
    ]);

    const senderPublicProfile = new PublicUserProfileDTO({
      id: sender.id,
      email: sender.email,
      firstName: sender.firstName,
      lastName: sender.lastName,
    });

    const recipientPublicProfile = new PublicUserProfileDTO({
      id: recipient.id,
      email: recipient.email,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
    });

    const responseData: TransactionDTO = {
      id: result[0].id,
      type: TransactionType.OUTGOING,
      amount: result[0].amount,
      createdAt: result[0].createdAt,
      sender: senderPublicProfile,
      recipient: recipientPublicProfile,
      balanceBeforeTransaction: result[0].senderBalanceBeforeTransaction,
      balanceAfterTransaction: result[0].senderBalanceAfterTransaction,
    };

    return {
      balance: transaction.senderBalanceAfterTransaction,
      transaction: responseData,
    };
  }
}
