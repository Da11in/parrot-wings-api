import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerPaths } from 'src/shared/constants/controller-paths';
import { PublicUserProfileDTO } from './dtos/PublicUserProfile.dto';
import { UserProfileDTO } from './dtos/UserProfile.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller(ControllerPaths.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUsers(
    @Query('query') query: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<PublicUserProfileDTO[]> {
    const users = await this.userService.findMany({ query, page, pageSize });
    return users.map((user) => new PublicUserProfileDTO(user));
  }

  @Get('/me')
  async me(): Promise<UserProfileDTO> {
    const user = await this.userService.findOne();
    return new UserProfileDTO(user);
  }
}
