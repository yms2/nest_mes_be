import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';
import { Column } from 'typeorm';

export class CreateRegisterDto {
  @ApiProperty({ example: 'admin', description: '회원 아이디' })
  @IsString()
  @Column({ comment: '회원 아이디' })
  username: string;

  @ApiProperty({ example: 'password123', description: '회원 비밀번호' })
  @IsString()
  @Column({ comment: '비밀번호' })
  password: string;

  @ApiProperty({ example: 'hong@example.com', description: '이메일' })
  @IsEmail()
  @Column({ comment: '이메일' })
  email?: string;
}
