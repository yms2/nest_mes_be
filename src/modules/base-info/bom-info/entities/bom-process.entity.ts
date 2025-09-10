import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class BomProcess extends BaseEntity {
    @ApiProperty({ example: 'PRD001', description: '제품 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @ApiProperty({ example: 1, description: '공정 순서' })
    @Column({ name: 'process_order', type: 'int' })
    processOrder: number;

    @ApiProperty({ example: 'PRC001', description: '공정 코드' })
    @Column({ name: 'process_code', type: 'varchar', length: 20 })
    processCode: string;

    @ApiProperty({ example: '절삭', description: '공정명' })
    @Column({ name: 'process_name', type: 'varchar', length: 20 })
    processName: string;
     
}