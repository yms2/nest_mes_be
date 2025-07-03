import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class authoritymanages {
  @ApiProperty({ example: 1, description: '권한 고유 ID (자동 생성)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'all_grant', description: '권한 전체 권한' })
  @Column()
  all_grant: string;

  @ApiProperty({ example: 'admin', description: '그룹명' })
  @Column()
  group_name: string;

  @ApiProperty({ example: 'admin', description: '메뉴명' })
  @Column({ type: 'text' })
  main_menu: string;

  @ApiProperty({ example: 'admin', description: '서브 메뉴명' })
  @Column({ type: 'text' })
  sub_menu: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn()
  updatedAt: Date;
}
