import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column } from "typeorm";

@Entity()
export class OrderMain extends BaseEntity {

    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성)' })
    @Column({ name: 'order_code', type: 'varchar', length: 20, unique: true })
    orderCode: string;

<<<<<<< HEAD
    @ApiProperty({ example: '발주비고', description: '발주비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20 })
    remark: string;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @Column({ name: 'approval_info', type: 'varchar', length: 20 })
=======
    @ApiProperty({ example: 'CUST001', description: '거래처 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 20, nullable: true })
    customerCode?: string;

    @ApiProperty({ example: '삼성전자', description: '거래처명' })
    @Column({ name: 'customer_name', type: 'varchar', length: 50, nullable: true })
    customerName?: string;

    @ApiProperty({ example: 'PROJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 20, nullable: true })
    projectCode?: string;

    @ApiProperty({ example: '스마트폰 개발', description: '프로젝트명' })
    @Column({ name: 'project_name', type: 'varchar', length: 50, nullable: true })
    projectName?: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    @Column({ name: 'project_version', type: 'varchar', length: 20, nullable: true })
    projectVersion?: string;

    @ApiProperty({ example: '갤럭시 S25 부품 발주', description: '발주명' })
    @Column({ name: 'order_name', type: 'varchar', length: 100, nullable: true })
    orderName?: string;

    @ApiProperty({ example: '2025-01-15', description: '발주일' })
    @Column({ name: 'order_date', type: 'date', nullable: true })
    orderDate?: Date;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20, nullable: true })
    productCode?: string;

    @ApiProperty({ example: '디스플레이 모듈', description: '품목명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, nullable: true })
    productName?: string;

    @ApiProperty({ example: 100, description: '발주수량' })
    @Column({ name: 'order_quantity', type: 'int', nullable: true })
    orderQuantity?: number;

    @ApiProperty({ example: 50000, description: '단가' })
    @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
    unitPrice?: number;

    @ApiProperty({ example: 5000000, description: '공급가액' })
    @Column({ name: 'supply_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
    supplyPrice?: number;

    @ApiProperty({ example: 500000, description: '부가세' })
    @Column({ name: 'vat', type: 'decimal', precision: 15, scale: 2, nullable: true })
    vat?: number;

    @ApiProperty({ example: 5500000, description: '총액' })
    @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
    totalAmount?: number;

    @ApiProperty({ example: '2025-01-20', description: '입고예정일' })
    @Column({ name: 'delivery_date', type: 'date', nullable: true })
    deliveryDate?: Date;

    @ApiProperty({ example: '발주비고', description: '발주비고' })
    @Column({ name: 'remark', type: 'varchar', length: 200, nullable: true })
    remark?: string;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @Column({ name: 'approval_info', type: 'varchar', length: 20, default: '대기' })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    approvalInfo: string;
}
