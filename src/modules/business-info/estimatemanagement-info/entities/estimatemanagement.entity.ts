import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EstimateDetail } from './estimate-detail.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity()
export class EstimateManagement extends BaseEntity{
    @Column({ name : 'estimate_code', type: 'varchar', length: 20 })
    estimateCode: string;

    @Column({ name : 'estimate_name', type: 'varchar', length: 100, nullable: true })
    estimateName: string;

    @Column({ name : 'estimate_date', type: 'date', nullable: true })
    estimateDate: Date;

    @Column({ name : "estimate_version", type: 'int', nullable: true })
    estimateVersion: number;

    @Column({ name : 'customer_code', type: 'varchar', length: 20, nullable: true })
    customerCode: string;

    @Column({ name : 'customer_name', type: 'varchar', length: 20, nullable: true })
    customerName: string;

    @Column({ name : 'project_code', type: 'varchar', length: 20, nullable: true })
    projectCode: string;

    @Column({ name : 'project_name', type: 'varchar', length: 20, nullable: true })
    projectName: string;

    @Column({ name : 'product_code', type: 'varchar', length: 20, nullable: true })
    productCode: string;

    @Column({ name : 'product_name', type: 'varchar', length: 20, nullable: true })
    productName: string;

    @Column({ name : 'product_quantity', type: 'int', nullable: true })
    productQuantity: number;

    @Column({ name : 'estimate_status', type: 'varchar', length: 20, nullable: true })
    estimateStatus: string;

    @Column({ name : 'estimate_price', type: 'int', nullable: true })
    estimatePrice: number;

    @Column({ name : 'employee_code', type: 'varchar', length: 20, nullable: true })
    employeeCode: string;

    @Column({ name : 'employee_name', type: 'varchar', length: 20, nullable: true })
    employeeName: string;

    @Column({ name : 'estimate_remark', type: 'varchar', length: 20, nullable: true })
    estimateRemark?: string;

    @Column({name : 'ordermanagement_code', type: 'varchar', length: 20, nullable: true })
    ordermanagementCode?: string;

    @Column({ name : 'terms_of_payment', type: 'varchar', length: 20, nullable: true })
    termsOfPayment?: string;

    // 관계 설정
    @OneToMany(() => EstimateDetail, detail => detail.estimate)
    estimateDetails: EstimateDetail[];
}