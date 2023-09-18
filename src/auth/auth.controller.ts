import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ControllerPaths } from 'src/shared/constants/controller-paths';
import { AuthService } from './auth.service';
import { LoginDTO } from './dtos/Login.dto';
import { SignupDTO } from './dtos/Signup.dto';
import { RefreshTokenDTO } from './dtos/RefreshToken.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDTO } from './dtos/AuthResponse.dto';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller(ControllerPaths.AUTH)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOkResponse({ type: AuthResponseDTO })
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Post('/signup')
  @ApiOkResponse({ type: AuthResponseDTO })
  async signup(@Body() signupDto: SignupDTO) {
    return this.authService.signup(signupDto);
  }

  @Post('/refresh-token')
  @ApiOkResponse({ type: AuthResponseDTO })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDTO) {
    return this.authService.refreshJwt(refreshTokenDto);
  }
}
