import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordDto } from './change-pasesword/change-password.dto';
import { AdminLoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import { RegisterService } from '../register/create/register.service';
import { user } from '../register/create/entity/create.entity';
import { GroupPermissionService } from './GroupPermission/GroupPermission.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: RegisterService,
    private readonly groupPermissionService: GroupPermissionService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인', description: '관리자 로그인을 수행합니다.' })
  async adminLogin(
    @Body() adminLoginUserDto: AdminLoginUserDto,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const { username, password } = adminLoginUserDto;
    const userWithoutPassword = await this.authService.validateAdmin(username, password);
    if (!userWithoutPassword) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '올바르지 않은 아이디 또는 비밀번호입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const tokens = await this.authService.login(userWithoutPassword);

    return {
      message: '로그인 성공',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: '관리자 로그아웃', description: '관리자 로그아웃을 수행합니다.' })
  async logout(@Req() req: Request & { headers: { authorization: string }; user: user }) {
    await this.authService.logout(req.user.id);
    return { message: 'logout success' };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '리프레시 토큰 생성', description: '리프레시 토큰을 생성합니다.' })
  async refreshToken(@Req() req: Request & { headers: { authorization: string }; user: user }) {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
    const token = authHeader.split(' ')[1];
    return this.authService.generateAdminAccessToken(req.user, token);
  }

  @Post('change-password')
  @ApiOperation({ summary: '비밀번호 변경', description: '비밀번호를 변경합니다.' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const { username, password, newPassword } = changePasswordDto;
    // 1. 비밀번호가 같은 경우 체크
    if (password === newPassword) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // 2. 기존 비밀번호 확인
    const userWithoutPassword = await this.userService.validateUserPassword(username, password);
    if (!userWithoutPassword) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '올바르지 않은 비밀번호입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // 3. 비밀번호 변경
    const result = await this.userService.changePassword(userWithoutPassword.id, newPassword);
    return {
      message: '비밀번호 변경 성공',
      result: result,
    };
  }

  @Get('check-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '토큰 검증',
    description: '토큰의 유효성을 검증하고 사용자 정보를 반환합니다.',
  })
  async checkToken(@Req() req: Request & { user: Record<string, unknown> }) {
    try {
      const user = await this.userService.findByUsername(req.user.username as string);

      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: passwordField, ...userWithoutPassword } = user;
        return {
          result: true,
          data: userWithoutPassword,
          message: '토큰 검증 성공',
        };
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '사용자 정보 조회 실패',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '토큰 검증 실패',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('groupauthority/:group_name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '그룹 권한 조회',
    description: '특정 그룹의 권한 정보를 조회합니다.',
  })
  async getGroupAuthority(
    @Req() req: Request & { user: Record<string, unknown> },
    @Param('group_name') groupName: string,
  ) {
    try {
      const permissions = await this.groupPermissionService.getPermissionsByGroup(groupName);

      return {
        result: true,
        message: '그룹 권한 조회 성공',
        data: permissions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '그룹 권한 조회 실패',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '그룹 권한 조회 실패',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
