import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterService } from '../register/create/register.service';
import { user } from '../register/create/entity/create.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: RegisterService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateAdmin(username: string, password: string) {
    return this.userService.validateUserPassword(username, password);
  }

  async login(user: Omit<user, 'password'>) {
    try {
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        group_name: user.group_name,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      });

      await this.userService.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('로그인 처리 오류:', error);
      throw new InternalServerErrorException('로그인 실패');
    }
  }

  async logout(id: number) {
    return this.userService.logout(id);
  }

  async generateAdminAccessToken(user: user, refreshToken: string) {
    const tokenData = await this.userService.tokenConfirm(user.id, refreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        group_name: user.group_name,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );
    return { accessToken };
  }
}
