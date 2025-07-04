import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class MainMenus {
  @ApiProperty({ example: 1, description: '메뉴 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'M001', description: '메뉴 ID' })
  @Column({ unique: true })
  menu_id: string;

  @ApiProperty({ example: '기준정보', description: '메뉴명' })
  @Column()
  menu_name: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '생성일시 (자동 생성)' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '수정일시 (자동 생성)' })
  @UpdateDateColumn()
  updatedAt: Date;
}
