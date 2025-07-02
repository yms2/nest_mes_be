// notices/notice.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Qna {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  title: string;

  @Column('text')
  content: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  reply: string;

  @Column('boolean', { default: false })
  isReplied: boolean;

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
