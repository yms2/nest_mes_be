import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class user {
  @ApiProperty({ example: 1, description: '사용자 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'test123', description: '사용자 아이디 (Unique)' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'hashed_password_123', description: '사용자 비밀번호 (해시 저장 권장)' })
  @Column()
  password: string;

  @ApiProperty({ example: 'test@example.com', description: '사용자 이메일 (선택사항)' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ example: 'refresh_token_123', description: '리프레시 토큰' })
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn()
  updatedAt: Date;
}
