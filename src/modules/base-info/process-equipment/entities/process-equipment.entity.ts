import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ProcessEquipment extends BaseEntity {

    @ApiProperty({ example: 'PRC001', description: '공정 코드' })
    @Column({ name: 'process_code', type: 'varchar', length: 20, comment: '공정 코드' })
    processCode: string;

    @ApiProperty({ example: 'EQ001', description: '설비 코드' })
    @Column({ name: 'equipment_code', type: 'varchar', length: 20, comment: '설비 코드' })
    equipmentCode: string;

}