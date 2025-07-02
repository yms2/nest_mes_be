// notices/notice.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // @CreateDateColumn({
  //   type: 'timestamptz',
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  // createdAt: Date;

  // @UpdateDateColumn({
  //   type: 'timestamptz',
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  updatedAt: Date;
}
