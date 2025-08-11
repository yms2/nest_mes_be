import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class ProcessInfo extends BaseEntity {
    @ApiProperty({ example: 'PRC001', description: '공정 코드 (자동 생성)' })
    @Column({ name: 'process_code', type: 'varchar', length: 20, unique: true, comment: '공정 코드' })
    processCode: string;

    @ApiProperty({ example: '공정 명', description: '공정 명' })
    @Column({ name: 'process_name', type: 'varchar', length: 100, comment: '공정 명' })
    processName: string;

    @ApiProperty({ example: '공정 설명', description: '공정 설명' })
    @Column({ name: 'process_description', type: 'varchar', length: 200, comment: '공정 설명', nullable: true })
    description?: string;
}