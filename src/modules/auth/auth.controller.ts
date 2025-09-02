import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiCookieAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ChangePasswordDto } from './change-pasesword/change-password.dto';
import { AdminLoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import { RegisterService } from '../register/create/register.service';
import { user } from '../register/create/entity/create.entity';
import { logService } from '../log/Services/log.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateRegisterDto, UserRole } from '../register/create/dto/create.dto';

interface JwtPayload {
  id: number;
  username: string;
  email: string;
  group_name: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService, // Assuming JwtService is imported correctly
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: RegisterService,
    private readonly logService: logService, // Assuming logService is imported correctly
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
    const userWithoutPassword = await this.authService.validateAdmin(username, password);
    if (!userWithoutPassword) {
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
    const tokens = await this.authService.login(userWithoutPassword);

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
    try {
      await this.authService.logout(req.user.id);

      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '계정관리',
        action: 'LOGOUT',
        username: req.user.username,
      });

      return { message: '로그아웃 되었습니다.' };
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
      // 로그아웃은 성공했지만 로그 생성에 실패한 경우에도 로그아웃은 완료된 것으로 처리
      return { message: '로그아웃 되었습니다.' };
    }
  }

  @Post('refresh-token')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: '리프레시 토큰으로 액세스 토큰 재발급' })
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'] || this.extractTokenFromHeader(req);

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 제공되지 않았습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findById(payload.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('리프레시 토큰이 일치하지 않습니다.');
      }

      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          group_name: payload.group_name,
        },
        { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') },
      );

      const newRefreshToken = this.jwtService.sign(
        {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          group_name: payload.group_name,
        },
        {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
      await this.userService.updateRefreshToken(user.id, newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
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

  // 아이디 중복확인
  @Get('check-username')
  @ApiOperation({ 
    summary: '아이디 중복확인', 
    description: '입력한 아이디의 사용 가능 여부를 확인합니다.' 
  })
  @ApiQuery({ 
    name: 'username', 
    description: '확인할 아이디', 
    example: 'testuser',
    required: true 
  })
  @ApiResponse({
    status: 200,
    description: '아이디 중복확인 성공',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
        message: { type: 'string', example: '사용 가능한 아이디입니다.' }
      }
    }
  })
  async checkUsername(@Query('username') username: string) {
    try {
      const result = await this.authService.checkUsernameAvailability(username);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '아이디 중복확인 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 사용자 정보 업데이트 (아이디, 이메일, 그룹 수정)
  @Post('update-user-info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: '사용자 정보 업데이트', 
    description: '사용자의 아이디, 이메일, 그룹을 수정합니다.' 
  })
  @ApiBody({
    type: CreateRegisterDto,
    description: '사용자 정보 업데이트 요청 데이터',
    examples: {
      '예시 1': {
        value: {
          username: 'newusername',
          email: 'newemail@example.com',
          group_name: 'manager'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '사용자 정보가 성공적으로 업데이트되었습니다.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            username: { type: 'string', example: 'newusername' },
            email: { type: 'string', example: 'newemail@example.com' },
            group_name: { type: 'string', example: 'manager' },
            updatedAt: { type: 'string', example: '2025-01-27T10:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '유효하지 않은 권한입니다.' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: '중복된 정보',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: '이미 사용중인 아이디입니다.' }
      }
    }
  })
  async updateUserInfo(
    @Req() req: Request & { user: { id: number; username: string } },
    @Body() updateData: { username?: string; email?: string; group_name?: UserRole }
  ) {
    try {
      const result = await this.authService.updateUserInfo(req.user.id, updateData);
      
      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '계정관리',
        action: 'UPDATE_USER_INFO',
        username: req.user.username,
      });

      return {
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        data: result
      };
    } catch (error) {
      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '계정관리',
        action: 'UPDATE_USER_INFO_FAIL',
        username: req.user.username,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '사용자 정보 업데이트 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 사용자 정보 계정 조회 (ID로 조회)
  @Get('get-user-info-by-id/:id')
  @ApiOperation({ 
    summary: '사용자 정보 계정 조회 (ID)', 
    description: '사용자의 ID로 사용자 정보를 조회합니다.' 
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        username: { type: 'string', example: 'testuser' },
        email: { type: 'string', example: 'test@example.com' },
        group_name: { type: 'string', example: 'user' },
        createdAt: { type: 'string', example: '2025-01-27T10:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-01-27T10:00:00.000Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '사용자를 찾을 수 없습니다.' }
      }
    }
  })
  async getUserInfoById(@Param('id') id: number) {
    try {
      const result = await this.authService.getUserInfoById(id);
      if (!result) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: '사용자를 찾을 수 없습니다.',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '사용자 정보 조회 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ 이 부분이 빠져 있었던 거예요!
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      return undefined;
    }

    return token;
  }
}
