import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class Receiving extends BaseEntity {
    @ApiProperty({ example: 'RCV001', description: '입고 코드' })
    @Column({ name: 'receiving_code', type: 'varchar', length: 50 ,comment: '입고 코드' ,nullable: true})
    receivingCode: string;

    @ApiProperty({ example: '5025-01-01', description: '입고 일자' })
    @Column({ name: 'receiving_date', type: 'date' ,comment: '입고 일자' ,nullable: true})
    receivingDate: Date;

    @ApiProperty({ example: 'ORD001', description: '발주 코드' })
    @Column({ name: 'order_code', type: 'varchar', length: 50 ,comment: '발주 코드' ,nullable: true})
    orderCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 50 ,comment: '품목 코드' ,nullable: true})
    productCode: string;

    @ApiProperty({ example: 'CUS001', description: '거래처 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 50 ,comment: '거래처 코드' ,nullable: true})
    customerCode: string;

    @ApiProperty({ example: '거래처 명', description: '거래처 명' })
    @Column({ name: 'customer_name', type: 'varchar', length: 50 ,comment: '거래처 명' ,nullable: true})
    customerName: string;

    @ApiProperty({ example: '품목 명', description: '품목 명' })
    @Column({ name: 'product_name', type: 'varchar', length: 50 ,comment: '품목 명' ,nullable: true})
    productName: string;

    @ApiProperty({ example: '단위', description: '단위' })
    @Column({ name: 'unit', type: 'varchar', length: 50 ,comment: '단위' ,nullable: true})
    unit: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 50 ,comment: '프로젝트 코드' ,nullable: true})
    projectCode: string;

    @ApiProperty({ example: '프로젝트 명', description: '프로젝트 명' })
    @Column({ name: 'project_name', type: 'varchar', length: 50 ,comment: '프로젝트 명' ,nullable: true})
    projectName: string;

    @ApiProperty({ example: '100', description: '입고수량' })
    @Column({ name: 'quantity', type: 'int' ,comment: '입고수량' ,nullable: true})
    quantity: number;

    @ApiProperty({ example: '100', description: '미입고수량' })
    @Column({ name: 'unreceived_quantity', type: 'int' ,comment: '미입고수량' ,nullable: true})
    unreceivedQuantity: number;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드' })
    @Column({ name: 'lot_code', type: 'varchar', length: 50 ,comment: 'LOT 코드' ,nullable: true})
    lotCode: string;

    @ApiProperty({ example: '창고 코드', description: '창고 코드' })
    @Column({ name: 'warehouse_code', type: 'varchar', length: 50 ,comment: '창고 코드' ,nullable: true})
    warehouseCode: string;
    
    @ApiProperty({ example: '창고 명', description: '창고 명' })
    @Column({ name: 'warehouse_name', type: 'varchar', length: 50 ,comment: '창고 명' ,nullable: true})
    warehouseName: string;

    @ApiProperty({ example: '단가', description: '단가' })
    @Column({ name: 'unit_price', type: 'int' ,comment: '단가' ,nullable: true})
    unitPrice: number;

    @ApiProperty({ example: '공급가액', description: '공급가액' })
    @Column({ name: 'supply_price', type: 'int' ,comment: '공급가액' ,nullable: true})
    supplyPrice: number;
    
    @ApiProperty({ example: '부가세', description: '부가세' })
    @Column({ name: 'vat', type: 'int' ,comment: '부가세' ,nullable: true})
    vat: number;

    @ApiProperty({ example: '합계', description: '합계' })
    @Column({ name: 'total', type: 'int' ,comment: '합계' ,nullable: true})
    total: number;
    
    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 50 ,comment: '비고' ,nullable: true})
    remark: string;

    @ApiProperty({ example: '승인', description: '승인상태' })
    @Column({ name: 'approval_status', type: 'varchar', length: 50 ,comment: '승인상태' ,default: '대기'})
    approvalStatus: string;
    
}