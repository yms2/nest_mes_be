import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './change-pasesword/change-password.dto';
import { AdminLoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import { RegisterService } from '../register/create/register.service';
import { user } from '../register/create/entity/create.entity';
import { logService } from '../log/Services/log.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: RegisterService,
    private readonly logService: logService, // Assuming LogService is imported correctly
  ) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인', description: '관리자 로그인을 수행합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그인 되었습니다.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '로그인 되었습니다.' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        permissions: {
          type: 'object',
          properties: {
            main_menu: { type: 'string', example: 'admin,user,settings' },
            sub_menu: { type: 'string', example: 'dashboard,profile,logs' },
            all_grant: { type: 'string', example: 'read,write,delete' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 로그인 정보입니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '올바르지 않은 아이디 또는 비밀번호입니다.' },
      },
    },
  })
  async adminLogin(
    @Body() adminLoginUserDto: AdminLoginUserDto,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    const { username, password } = adminLoginUserDto;
    console.log('로그인 시도:', username);
    
    const userWithoutPassword = await this.authService.validateAdmin(username, password);
    if (!userWithoutPassword) {
      console.log('로그인 실패: 사용자 검증 실패');
      try {
        await this.logService.createSimpleLog({
          moduleName: '계정관리',
          action: 'LOGIN_FAIL',
          username,
        });
      } catch (error) {
        console.error('로그인 실패 로그 생성 중 에러:', error);
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '올바르지 않은 아이디 또는 비밀번호입니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    
    console.log('사용자 검증 성공:', userWithoutPassword.username);
    const tokens = await this.authService.login(userWithoutPassword);
    console.log('토큰 생성 완료:', {
      accessToken: tokens.accessToken ? '토큰 존재' : '토큰 없음',
      refreshToken: tokens.refreshToken ? '토큰 존재' : '토큰 없음'
    });

    try {
      await this.logService.createSimpleLog({
        moduleName: '계정관리',
        action: 'LOGIN',
        username,
      });
    } catch (error) {
      console.error('로그인 성공 로그 생성 중 에러:', error);
    }

    const response = {
      message: '로그인 되었습니다.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
    
    console.log('로그인 응답:', {
      message: response.message,
      accessToken: response.accessToken ? '토큰 존재' : '토큰 없음',
      refreshToken: response.refreshToken ? '토큰 존재' : '토큰 없음'
    });
    
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '관리자 로그아웃', description: '관리자 로그아웃을 수행합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '로그아웃 되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '토큰이 제공되지 않았습니다.' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
  })
  async logout(@Req() req: Request & { user: { id: number; username: string } }) {
    console.log('로그아웃 요청 - 사용자 정보:', req.user);
    console.log('로그아웃 요청 - 헤더:', req.headers);
    
    try {
      await this.authService.logout(req.user.id);

      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '계정관리',
        action: 'LOGOUT',
        username: req.user.username,
      });

      console.log('로그아웃 성공:', req.user.username);
      return { message: '로그아웃 되었습니다.' };
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);

      // 로그아웃은 성공했지만 로그 생성에 실패한 경우에도 로그아웃은 완료된 것으로 처리
      return { message: '로그아웃 되었습니다.' };
    }
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
      message: '비밀번호 변경되었습니다.',
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
          message: '토큰 검증 되었습니다.',
        };
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '사용자 정보 조회 실패했습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '토큰 검증 실패했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
