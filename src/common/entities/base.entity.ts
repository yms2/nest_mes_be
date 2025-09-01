import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({ example: 1, description: '품목 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn({ comment: '품목 고유 ID (자동 생성)' })
  id: number;

  @ApiProperty({ example: 'admin', description: '생성자' })
  @Column({ name: 'created_by', type: 'varchar', length: 50, comment: '생성자', nullable: true })
  createdBy?: string;

  @ApiProperty({ example: 'admin', description: '수정자' })
  @Column({ name: 'updated_by', type: 'varchar', length: 50, comment: '수정자', nullable: true })
  updatedBy?: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '생성일시 (자동 생성)' })
  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '수정일시 (자동 생성)' })
  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date;
}
