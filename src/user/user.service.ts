import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { IUsersRequest } from './interfaces/IUsersRequest';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findMany(params: IUsersRequest): Promise<User[]> {
    const { query, page, pageSize } = params;

    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize || undefined;
    const contains = query || '';

    return this.prismaService.user.findMany({
      skip,
      take,
      where: {
        OR: [
          {
            firstName: {
              contains,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }

  async findOne(params?: Prisma.UserFindFirstArgs): Promise<User> {
    return this.prismaService.user.findFirst(params);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }
}
