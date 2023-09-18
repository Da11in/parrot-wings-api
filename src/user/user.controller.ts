import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerPaths } from 'src/shared/constants/controller-paths';
import { PublicUserProfileDTO } from './dtos/PublicUserProfile.dto';
import { UserProfileDTO } from './dtos/UserProfile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUsersQueryDTO } from './dtos/GetUsersQuery.dto';
import { PaginatedResponseDTO } from 'src/shared/dtos/PaginatedResponse.dto';
import { ApiOkResponsePaginated } from 'src/shared/dtos/ApiOkResponsePaginated.dto';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller(ControllerPaths.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOkResponsePaginated(PublicUserProfileDTO)
  async getUsers(
    @Query() qs: GetUsersQueryDTO,
  ): Promise<PaginatedResponseDTO<PublicUserProfileDTO>> {
    const { query, page, pageSize } = qs;

    const result = await this.userService.findMany({ query, page, pageSize });
    const usersPublicProfiles = result.data.map(
      (user) => new PublicUserProfileDTO(user),
    );

    return { ...result, data: usersPublicProfiles };
  }

  @ApiOkResponse({
    type: UserProfileDTO,
  })
  @Get('/me')
  async me(@Request() req): Promise<UserProfileDTO> {
    const userId: number = req.userId;
    const user = await this.userService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserProfileDTO(user);
  }
}
