import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'admin', description: '사용자 아이디' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: '현재 비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'new_password_123', description: '새 비밀번호' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
