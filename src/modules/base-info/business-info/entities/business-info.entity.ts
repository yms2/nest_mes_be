import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class businessInfo {
  @ApiProperty({ example: 1, description: '사용자 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'BPLC001', description: '사업자 코드' })
  @Column()
  business_code: string;

  @ApiProperty({ example: '현대자동차', description: '사업장명' })
  @Column()
  business_name: string;

  @ApiProperty({ example: '674-30-01715', description: '사업자 번호' })
  @Column()
  business_number: string;

  @ApiProperty({ example: '김대호', description: '사업장 담당자' })
  @Column()
  business_ceo: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn()
  updatedAt: Date;
}
