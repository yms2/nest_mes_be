import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EstimateManagement } from './estimatemanagement.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity()
export class EstimateDetail extends BaseEntity {

    @Column({ name: 'estimate_id', type: 'int' })
    estimateId: number;

    @Column({ name: 'detail_code', type: 'varchar', length: 20, nullable: true })
    detailCode?: string;

    @Column({ name: 'item_code', type: 'varchar', length: 20, nullable: true })
    itemCode: string;

    @Column({ name: 'item_name', type: 'varchar', length: 100, nullable: true })
    itemName: string;

    @Column({ name: 'item_specification', type: 'varchar', length: 200, nullable: true })
    itemSpecification?: string;

    @Column({ name: 'unit', type: 'varchar', length: 10 , nullable: true})
    unit: string;

    @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, nullable: true })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
    unitPrice: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
    totalPrice: number;

    // 관계 설정
    @ManyToOne(() => EstimateManagement, estimate => estimate.estimateDetails)
    @JoinColumn({ name: 'estimate_id' })
    estimate: EstimateManagement;
}
