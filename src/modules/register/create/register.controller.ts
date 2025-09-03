//회원가입 하는 Controller
import { Body, Controller, Post, HttpCode, HttpStatus, ValidationPipe, UsePipes } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateRegisterDto, UserRole } from './dto/create.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('Register') // Swagger에서 Register 그룹으로 묶기
@Controller('register')
//실제 컨트롤러 클레스 선언 API 엔드포인트로 등록
export class RegisterController {
  //생성자를 만들어서 RegisterService 주입 => RegisterService 클래스를 사용할 수 있게 해줌
  //private readonly 외부에서 접근 불가 / 값 변경 불가;
  constructor(private readonly registerService: RegisterService) {}

  // 회원가입 요청을 처리하는 API 엔드포인트
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true 
  }))
  @ApiOperation({ 
    summary: '회원가입', 
    description: '신규 회원을 등록합니다. 아이디, 비밀번호, 비밀번호 확인, 권한 설정이 필요합니다.' 
  })
  @ApiBody({
    description: '회원가입 정보',
    schema: {
      type: 'object',
      required: ['username', 'password', 'passwordConfirm', 'group_name'],
      properties: {
        username: {
          type: 'string',
          description: '회원 아이디 (영문, 숫자, 언더스코어만 허용, 최소 4자)',
          example: 'testuser',
          minLength: 4,
          pattern: '^[a-zA-Z0-9_]+$'
        },
        password: {
          type: 'string',
          description: '비밀번호 (최소 8자, 영문+숫자+특수문자 포함)',
          example: 'Password123!',
          minLength: 8
        },
        passwordConfirm: {
          type: 'string',
          description: '비밀번호 확인',
          example: 'Password123!'
        },
        email: {
          type: 'string',
          description: '이메일 (선택사항)',
          example: 'test@example.com',
          format: 'email'
        },
        group_name: {
          type: 'string',
          description: '사용자 권한',
          enum: Object.values(UserRole),
          example: UserRole.USER
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '회원가입이 완료되었습니다.' },
        data: {
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
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: '중복된 정보',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '이미 사용중인 아이디입니다.' }
      }
    }
  })
  async create(@Body() createRegisterDto: CreateRegisterDto) {
    try {
      const result = await this.registerService.createUser(createRegisterDto);
      
      return ApiResponseBuilder.success(
        result, 
        '회원가입이 완료되었습니다.'
      );
    } catch (error) {
      // 에러 메시지에 따라 적절한 응답 반환
      if (error.message.includes('비밀번호와 비밀번호 확인이 일치하지 않습니다')) {
        return ApiResponseBuilder.error('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }
      if (error.message.includes('이미 사용중인 아이디입니다')) {
        return ApiResponseBuilder.error('이미 사용중인 아이디입니다.');
      }
      if (error.message.includes('이미 사용중인 이메일입니다')) {
        return ApiResponseBuilder.error('이미 사용중인 이메일입니다.');
      }
      if (error.message.includes('유효하지 않은 권한입니다')) {
        return ApiResponseBuilder.error('유효하지 않은 권한입니다.');
      }
      
      return ApiResponseBuilder.error('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  // 사용 가능한 권한 목록 조회
  @Post('roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '사용 가능한 권한 목록', 
    description: '회원가입 시 선택할 수 있는 권한 목록을 조회합니다.' 
  })
  @ApiResponse({
    status: 200,
    description: '권한 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '권한 목록을 조회했습니다.' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'admin' },
              label: { type: 'string', example: '관리자' },
              description: { type: 'string', example: '모든 권한을 가진 관리자' }
            }
          }
        }
      }
    }
  })
  async getAvailableRoles() {
    const roles = [
      { value: UserRole.ADMIN, label: '관리자', description: '모든 권한을 가진 관리자' },
      { value: UserRole.MANAGER, label: '매니저', description: '제한된 관리 권한을 가진 매니저' },
      { value: UserRole.USER, label: '일반 사용자', description: '기본 사용 권한을 가진 사용자' },
      { value: UserRole.VIEWER, label: '조회자', description: '읽기 전용 권한을 가진 사용자' }
    ];

    return ApiResponseBuilder.success(roles, '권한 목록을 조회했습니다.');
  }
}
