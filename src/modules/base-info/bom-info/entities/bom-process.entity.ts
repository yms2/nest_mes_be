import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BomProcess extends BaseEntity {
    @Column({ name: 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @Column({ name: 'process_order', type: 'int' })
    processOrder: number;

    @Column({ name: 'process_code', type: 'varchar', length: 20 })
    processCode: string;

    @Column({ name: 'process_name', type: 'varchar', length: 20 })
    processName: string;
     
}