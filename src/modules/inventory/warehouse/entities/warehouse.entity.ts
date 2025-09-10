import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Warehouse extends BaseEntity {
    @Column({ name: 'warehouse_code', type: 'varchar', length: 20 ,comment: '창고 코드'})
    warehouseCode: string;

    @Column({ name: 'warehouse_name', type: 'varchar', length: 20 ,comment: '창고 이름'})
    warehouseName: string;

    @Column({ name: 'warehouse_location', type: 'varchar', length: 20 ,comment: '창고 위치'})
    warehouseLocation: string;

    @Column({ name: 'warehouse_bigo', type: 'varchar', length: 255 ,comment: '창고 비고'})
    warehouseBigo: string;

}