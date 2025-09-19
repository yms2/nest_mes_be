import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Warehouse extends BaseEntity {
    @ApiProperty({ example: 'WHS001', description: '창고 코드' })
    @Column({ name: 'warehouse_code', type: 'varchar', length: 20 ,comment: '창고 코드'})
    warehouseCode: string;

    @ApiProperty({ example: '창고1', description: '창고 이름' })
    @Column({ name: 'warehouse_name', type: 'varchar', length: 20 ,comment: '창고 이름'})
    warehouseName: string;

    @ApiProperty({ example: '창고1', description: '창고 위치' })
    @Column({ name: 'warehouse_location', type: 'varchar', length: 20 ,comment: '창고 위치', nullable: true })
    warehouseLocation: string;

    @ApiProperty({ example: '창고1', description: '창고 비고' })
    @Column({ name: 'warehouse_bigo', type: 'varchar', length: 255 ,comment: '창고 비고', nullable: true })
    warehouseBigo: string;

}