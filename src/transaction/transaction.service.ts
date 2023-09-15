import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ErrorMessages } from 'src/shared/constants/error-messages';

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService) {}

  async findMany(params: { userId: number; page?: number; pageSize?: number }) {
    const { userId, page, pageSize } = params;

    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize || undefined;
    const query: Prisma.TransactionFindManyArgs = {
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      take,
      skip,
    };

    return this.prismaService.transaction.findMany(query);
  }

  async create(params: {
    userId: number;
    amount: number;
    recipientId: number;
  }) {
    const { userId, amount, recipientId } = params;

    const [sender, recipient] = await this.prismaService.$transaction([
      this.prismaService.user.findFirst({ where: { id: userId } }),
      this.prismaService.user.findFirst({ where: { id: recipientId } }),
    ]);

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

    const { outgoing, incoming } = this.createTransactionsData({
      sender,
      recipient,
      amount,
    });

    await this.prismaService.$transaction([
      this.prismaService.transaction.createMany({ data: [outgoing, incoming] }),
      this.prismaService.user.update({
        where: { id: sender.id },
        data: { balance: outgoing.balanceAfterTransaction },
      }),
      this.prismaService.user.update({
        where: { id: recipient.id },
        data: { balance: incoming.balanceAfterTransaction },
      }),
    ]);

    return { balance: outgoing.balanceAfterTransaction };
  }

  createTransactionsData(params: {
    sender: User;
    recipient: User;
    amount: number;
  }) {
    const { sender, recipient, amount } = params;

    const outgoing: Prisma.TransactionUncheckedCreateInput = {
      type: 'OUTGOING',
      amount,
      senderId: sender.id,
      recipientId: recipient.id,
      balanceBeforeTransaction: sender.balance,
      balanceAfterTransaction: sender.balance - amount,
    };

    const incoming: Prisma.TransactionUncheckedCreateInput = {
      type: 'INCOMING',
      amount,
      senderId: recipient.id,
      recipientId: sender.id,
      balanceBeforeTransaction: recipient.balance,
      balanceAfterTransaction: sender.balance + amount,
    };

    return { outgoing, incoming };
  }
}
