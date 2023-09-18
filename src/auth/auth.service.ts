import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dtos/Login.dto';
import { SignupDTO } from './dtos/Signup.dto';
import { DEFAULT_BALANCE } from 'src/shared/constants/app-values';
import { ErrorMessages } from 'src/shared/constants/error-messages';
import {
  jwtAccessConfig,
  jwtRefreshConfig,
  saltOrRoundsValue,
} from './constants/auth.config';
import { AuthResponseDTO } from './dtos/AuthResponse.dto';
import { RefreshTokenDTO } from './dtos/RefreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO): Promise<AuthResponseDTO> {
    const { email, password } = loginDto;

    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new HttpException(
        ErrorMessages.INCORRECT_EMAIL_OR_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await this.checkPassword({
      loginPassword: password,
      dbPassword: user.password,
    });

    if (!isPasswordValid) {
      throw new HttpException(
        ErrorMessages.INCORRECT_EMAIL_OR_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessToken = await this.createJwt(user.id, jwtAccessConfig);
    const refreshToken = await this.createJwt(user.id, jwtRefreshConfig);

    return { accessToken, refreshToken };
  }

  async signup(signupDto: SignupDTO): Promise<AuthResponseDTO> {
    const { email, password } = signupDto;

    const user = await this.userService.findOne({ email });

    if (user) {
      throw new HttpException(
        ErrorMessages.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const createdUser = await this.userService.create({
      ...signupDto,
      balance: DEFAULT_BALANCE,
      password: hashedPassword,
    });

    const accessToken = await this.createJwt(createdUser.id, jwtAccessConfig);
    const refreshToken = await this.createJwt(createdUser.id, jwtRefreshConfig);

    return { accessToken, refreshToken };
  }

  async refreshJwt(refreshTokenDto: RefreshTokenDTO): Promise<AuthResponseDTO> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: jwtRefreshConfig.secret,
        },
      );

      if (!payload.hasOwnProperty('sub')) {
        throw new UnauthorizedException();
      }

      const userId: number = payload['sub'];

      const accessToken = await this.createJwt(userId, jwtAccessConfig);
      const refreshToken = await this.createJwt(userId, jwtRefreshConfig);

      return { accessToken, refreshToken };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = saltOrRoundsValue;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async checkPassword(params: { loginPassword: string; dbPassword: string }) {
    const { loginPassword, dbPassword } = params;
    const isMatch = await bcrypt.compare(loginPassword, dbPassword);
    return isMatch;
  }

  async createJwt(userId: number, config: JwtSignOptions): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, config);
  }
}
