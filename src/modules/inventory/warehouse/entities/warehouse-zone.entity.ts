import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from './warehouse.entity';

@Entity()
export class WarehouseZone extends BaseEntity {
    @ApiProperty({ example: 'ZONE001', description: '구역 코드' })
    @Column({ name: 'zone_code', type: 'varchar', length: 20, comment: '구역 코드' })
    zoneCode: string;

    @ApiProperty({ example: '1구역', description: '구역 이름' })
    @Column({ name: 'zone_name', type: 'varchar', length: 50, comment: '구역 이름' })
    zoneName: string;

    @ApiProperty({ example: '창고 내부 북쪽 구역', description: '구역 설명' })
    @Column({ name: 'zone_description', type: 'varchar', length: 255, comment: '구역 설명', nullable: true })
    zoneDescription: string;

    @ApiProperty({ example: 'ACTIVE', description: '구역 상태' })
    @Column({ name: 'zone_status', type: 'varchar', length: 20, comment: '구역 상태', default: 'ACTIVE' })
    zoneStatus: string;

    @ApiProperty({ example: 1, description: '창고 ID' })
    @Column({ name: 'warehouse_id', type: 'int', comment: '창고 ID' })
    warehouseId: number;

    @ManyToOne(() => Warehouse, warehouse => warehouse.id)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @ApiProperty({ example: '구역 비고', description: '구역 비고' })
    @Column({ name: 'zone_bigo', type: 'varchar', length: 255, comment: '구역 비고', nullable: true })
    zoneBigo: string;
}
