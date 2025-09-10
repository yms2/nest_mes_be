import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EstimateDetail } from './estimate-detail.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity()
export class EstimateManagement extends BaseEntity{
    @Column({ name : 'estimate_code', type: 'varchar', length: 20 })
    estimateCode: string;

    @Column({ name : 'estimate_name', type: 'varchar', length: 100 })
    estimateName: string;

    @Column({ name : 'estimate_date', type: 'date' })
    estimateDate: Date;

    @Column({ name : "estimate_version", type: 'int' })
    estimateVersion: number;

    @Column({ name : 'customer_code', type: 'varchar', length: 20 })
    customerCode: string;

    @Column({ name : 'customer_name', type: 'varchar', length: 20 })
    customerName: string;

    @Column({ name : 'project_code', type: 'varchar', length: 20 })
    projectCode: string;

    @Column({ name : 'project_name', type: 'varchar', length: 20 })
    projectName: string;

    @Column({ name : 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @Column({ name : 'product_name', type: 'varchar', length: 20 })
    productName: string;

    @Column({ name : 'product_quantity', type: 'int' })
    productQuantity: number;

    @Column({ name : 'estimate_status', type: 'varchar', length: 20 })
    estimateStatus: string;

    @Column({ name : 'estimate_price', type: 'int' })
    estimatePrice: number;

    @Column({ name : 'employee_code', type: 'varchar', length: 20 })
    employeeCode: string;

    @Column({ name : 'employee_name', type: 'varchar', length: 20 })
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