import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
