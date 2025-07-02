import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(userId: string, password: string): Promise<any> {
    const userWithoutPassword = await this.userService.validateUserPassword(userId, password);
    if (userWithoutPassword) {
      return userWithoutPassword;
    }
    return null;
  }

  async login(user: User): Promise<any> {
    const payload = {
      id: user.id,
      userId: user.userId,
      userName: user.userName,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logout(id: number) {
    return await this.userService.logout(id);
  }

  async generateAdminAccessToken(user: User, refreshToken: string) {
    const tokenData = await this.userService.tokenConfirm(user.id, refreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        userId: user.userId,
        userName: user.userName,
      },
      { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN },
    );
    return { accessToken };
  }
}
