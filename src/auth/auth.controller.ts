import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminLoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async adminLogin(
    @Body() adminLoginUserDto: AdminLoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, password } = adminLoginUserDto;
    const userWithoutPassword = await this.authService.validateAdmin(userId, password);

    if (!userWithoutPassword) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid credentials' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.login(userWithoutPassword);
  }

  @Post('logout')
  async logout(@Req() req: Request & { headers: { authorization: string }; user: User }) {
    await this.authService.logout(req.user.id);
    return { message: 'logout success' };
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request & { headers: { authorization: string }; user: User }) {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.generateAdminAccessToken(req.user, token);
  }

  @Post('change-password')
  async changePassword(
    @Body('userId') userId: string,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userWithoutPassword = await this.userService.validateUserPassword(userId, password);
    if (!userWithoutPassword) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
    return this.userService.changePassword(userWithoutPassword.id, newPassword);
  }
}
