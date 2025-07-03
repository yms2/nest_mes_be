import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateRegisterDto {
  @ApiProperty({ example: 'admin', description: '회원 아이디' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: '회원 비밀번호' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'hong@example.com', description: '이메일' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'admin', description: '그룹명' })
  @IsString()
  group_name: string;
}
