import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';

@Entity()
export class Shipping extends BaseEntity {
    @ApiProperty({ example: 'SHP001', description: '출하 코드 (자동 생성)' })
    @Column({ name: 'shipping_code', type: 'varchar', length: 20 ,comment: '출하 코드 (자동 생성)' })
    shippingCode: string;

    @ApiProperty({ example: '2025-01-01', description: '출하 일자' })
    @Column({ name: 'shipping_date', type: 'date' ,comment: '출하 일자' })
    shippingDate: Date;

    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    @Column({ name: 'order_code', type: 'varchar', length: 20 ,comment: '수주 코드' ,nullable: true})
    orderCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20 ,comment: '품목 코드' ,nullable: true})
    productCode: string;

    @ApiProperty({ example: '제품명', description: '품목명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100 ,comment: '품목명' ,nullable: true})
    productName: string;

    @ApiProperty({ example: '개', description: '단위' })
    @Column({ name: 'unit', type: 'varchar', length: 20 ,comment: '단위' ,nullable: true})
    unit: string; 

    @ApiProperty({ example: '100', description: '재고 수량' })
    @Column({ name: 'inventory_quantity', type: 'int' ,comment: '재고 수량' })
    inventoryQuantity: number;

    @ApiProperty({ example: '100', description: '출하 지시 수량' })
    @Column({ name: 'shipping_order_quantity', type: 'int' ,comment: '출하 지시 수량' ,nullable: true})
    shippingOrderQuantity: number;

    @ApiProperty({ example: '지시 완료', description: '상태' })
    @Column({ name: 'shipping_status', type: 'varchar', length: 20 ,comment: '상태' ,nullable: true})
    shippingStatus: string;
    

    @ApiProperty({ example: '100', description: '단가' })
    @Column({ name: 'unit_price', type: 'int' ,comment: '단가' ,nullable: true})
    unitPrice: string;

    @ApiProperty({ example: '100', description: '공급가액' })
    @Column({ name: 'supply_price', type: 'int' ,comment: '공급가액' ,nullable: true})
    supplyPrice: string;

    @ApiProperty({ example: '100', description: '부가세' })
    @Column({ name: 'vat', type: 'int' ,comment: '부가세' ,nullable: true})
    vat: string;

    @ApiProperty({ example: '100', description: '합계' })
    @Column({ name: 'total', type: 'int' ,comment: '합계' ,nullable: true})
    total: string;

    @ApiProperty({ example: 'EMP001', description: '사원 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20 ,comment: '사원 코드' ,nullable: true})
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20 ,comment: '사원 이름' ,nullable: true})
    employeeName: string;    
    
    @ApiProperty({ example: '100', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20 ,comment: '비고' ,nullable: true})
    remark: string;

    // 수주와의 관계
    @ManyToOne(() => OrderManagement, { eager: true })
    @JoinColumn({ name: 'orderCode', referencedColumnName: 'orderCode' })
    orderManagement?: OrderManagement;

}