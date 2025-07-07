import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm';

@Entity('logs')
export class LogEntity {
  @PrimaryGeneratedColumn({comment: '로그 ID (자동 생성)'})
  id: number;

  @Column({name: 'moduleName', length: 50, comment: '모듈 이름 '})
  moduleName: string;

  @Column({name: 'action', length: 50, comment: '액션 이름'})
  action: string;

  @Column({name: 'username', length: 50, comment: '사용자 ID'})
  username: string;

  @CreateDateColumn({name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '생성 일시'})
  createdAt: Date;
}
