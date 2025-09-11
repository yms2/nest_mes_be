import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class OrderManagement extends BaseEntity {
    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성)' })
    @Column({ name: 'order_code', type: 'varchar', length: 20, unique: true })
    orderCode: string;

    @ApiProperty({ example: '2025-01-01', description: '수주 일자' })
    @Column({ name: 'order_date', type: 'date' })
    orderDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 20 })
    customerCode: string;
    
    @ApiProperty({ example: '고객 이름', description: '고객 이름' })
    @Column({ name: 'customer_name', type: 'varchar', length: 20 })
    customerName: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name : 'project_code', type: 'varchar', length: 20 })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    @Column({ name : 'project_name', type: 'varchar', length: 20 })
    projectName: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    @Column({ name : 'project_version', type: 'varchar', length: 20, nullable: true })
    projectVersion: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @Column({ name : 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름' })
    @Column({ name : 'product_name', type: 'varchar', length: 20 })
    productName: string;

    @ApiProperty({ example: '신규/AS', description: '신규/AS' })
    @Column({ name : 'order_type', type: 'varchar', length: 20 })
    orderType: string;

    @ApiProperty({ example: '100', description: '수량' })
    @Column({ name : 'quantity', type: 'int' })
    quantity: number;

    @ApiProperty({ example: '100', description: '단가' })
    @Column({ name : 'unit_price', type: 'int' })
    unitPrice: string;

    @ApiProperty({ example: '100', description: '공급가액' })
    @Column({ name : 'supply_price', type: 'int' })
    supplyPrice: string;

    @ApiProperty({ example: '100', description: '부가세' })
    @Column({ name : 'vat', type: 'int' })
    vat: string;

    @ApiProperty({ example: '100', description: '합계' })
    @Column({ name : 'total', type: 'int' })
    total: string;

    @ApiProperty({ example: '2025-01-01', description: '납기예정일' })
    @Column({ name : 'delivery_date', type: 'date' })
    deliveryDate: Date;

    @ApiProperty({ example: 'EST001', description: '견적코드' })
    @Column({ name : 'estimate_code', type: 'varchar', length: 20 })
    estimateCode: string;

    @ApiProperty({ example: '100', description: '비고' })
    @Column({ name : 'remark', type: 'varchar', length: 20 })
    remark: string;
    
}