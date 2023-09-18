import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { defaultPaginationValues } from 'src/shared/constants/pagination';
import { PaginatedResponseDTO } from 'src/shared/dtos/PaginatedResponse.dto';
import { GetUsersQueryDTO } from './dtos/GetUsersQuery.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findMany(
    params: GetUsersQueryDTO,
  ): Promise<PaginatedResponseDTO<User>> {
    const { query, page, pageSize } = params;

    const skip = page && pageSize ? (page - 1) * pageSize : 0;
    const take = pageSize || defaultPaginationValues.pageSize;
    const contains = query || '';

    const where: Prisma.UserWhereInput = {
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
    };

    const [count, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({ where }),
      this.prismaService.user.findMany({ take, skip, where }),
    ]);

    return {
      page: page || defaultPaginationValues.page,
      totalPages: Math.ceil(count / take),
      data: users,
    };
  }

  async findOne(params: { id?: number; email?: string }): Promise<User> {
    const { id, email } = params;

    const query: Prisma.UserFindFirstArgs = {
      where: {
        id,
        email,
      },
    };

    return this.prismaService.user.findFirst(query);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }
}
