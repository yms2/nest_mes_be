import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ProcessInfo {
    @ApiProperty({ example: 1, description: '공정 고유 ID (자동 생성)' })
    @PrimaryGeneratedColumn({ comment: '공정 고유 ID (자동 생성)' })
    id: number;

    @ApiProperty({ example: '공정 코드', description: '공정 코드' })
    @Column({ name: 'process_code', type: 'varchar', length: 20, unique: true, comment: '공정 코드' })
    processCode: string;

    @ApiProperty({ example: '공정 명', description: '공정 명' })
    @Column({ name: 'process_name', type: 'varchar', length: 100, comment: '공정 명' })
    processName: string;

    @ApiProperty({ example: '공정 설명', description: '공정 설명' })
    @Column({ name: 'process_description', type: 'varchar', length: 200, comment: '공정 설명' })
    processDescription: string;

    @ApiProperty({ example: 'admin', description: '계정 생성자' })
    @Column({ name: 'created_by', type: 'varchar', length: 50, comment: '계정 생성자' })
    createdBy: string;

    @ApiProperty({ example: 'admin', description: '계정 수정자' })
    @Column({ name: 'updated_by', type: 'varchar', length: 50, comment: '계정 수정자' })
    updatedBy: string;

    @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
    @CreateDateColumn({ comment: '생성일시' })
    createdAt: Date;

    @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
    @UpdateDateColumn({ comment: '수정일시' })
    updatedAt: Date;
}