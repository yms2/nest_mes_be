import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export class CreateRegisterDto {
  @ApiProperty({ example: 'admin', description: '회원 아이디 (영문, 숫자, 언더스코어만 허용)' })
  @IsString()
  @MinLength(4, { message: '아이디는 최소 4자 이상이어야 합니다.' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.' })
  username: string;

  @ApiProperty({ example: 'password123', description: '회원 비밀번호 (최소 8자, 영문+숫자+특수문자 포함)' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, { 
    message: '비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)를 모두 포함해야 합니다.' 
  })
  password: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 확인' })
  @IsString()
  passwordConfirm: string;

  @ApiProperty({ example: 'hong@example.com', description: '이메일 (선택사항)' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: 'admin', 
    description: '그룹명',
    enum: UserRole,
    enumName: 'UserRole'
  })
  @IsEnum(UserRole, { message: '유효한 권한을 선택해주세요.' })
  group_name: UserRole;
}
