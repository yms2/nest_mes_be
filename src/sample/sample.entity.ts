// notices/notice.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Sample {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  companyName: string;

  @Column('text')
  writerName: string;

  @Column('text')
  phone: string;

  @Column('text')
  category: string;

  @Column('text')
  email: string;

  @Column('text')
  title: string;

  @Column('text')
  content: string;

  @Column('boolean', { default: false })
  isCounseled: boolean;

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
