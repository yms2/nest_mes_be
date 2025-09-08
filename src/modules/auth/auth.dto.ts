import { IsNotEmpty, MaxLength, IsNumber, IsOptional, IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../register/create/dto/create.dto';

export class AdminLoginUserDto {
  @ApiProperty({ example: 'admin', description: '사용자 아이디' })
  @IsNotEmpty()
  @MaxLength(255)
  username: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  @IsNotEmpty()
  @MaxLength(255)
  password: string;
}

export class UpdateUserInfoDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'newusername', description: '새 사용자명 (선택사항)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  username?: string;

  @ApiProperty({ example: 'newemail@example.com', description: '새 이메일 (선택사항)', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ example: 'manager', description: '새 권한 (선택사항)', required: false, enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  group_name?: UserRole;

  @ApiProperty({ example: 'newpassword123', description: '새 비밀번호 (선택사항)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(255)
  password?: string;

  @ApiProperty({ example: 'newpassword123', description: '새 비밀번호 확인 (선택사항)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  passwordConfirm?: string;
}
