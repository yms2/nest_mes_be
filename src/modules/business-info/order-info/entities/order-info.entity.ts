import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column } from "typeorm";

@Entity()
export class OrderInfo extends BaseEntity {

    @ApiProperty({ example: 'CUS001', description: '거래처 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 50 ,comment: '거래처 코드' ,nullable: true })
    customerCode: string;

    @ApiProperty({ example: '거래처 명', description: '거래처 명' })
    @Column({ name: 'customer_name', type: 'varchar', length: 50 ,comment: '거래처 명' ,nullable: true })
    customerName: string;

    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    @Column({ name: 'order_management_code', type: 'varchar', length: 50 ,comment: '수주 코드' ,nullable: true })
    orderManagementCode: string;

    @ApiProperty({ example: 'ORD001', description: '발주 코드' })
    @Column({ name: 'order_code', type: 'varchar', length: 50 ,comment: '발주 코드' ,nullable: true })
    orderCode: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 50 ,comment: '프로젝트 코드' ,nullable: true })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 명', description: '프로젝트 명' })
    @Column({ name: 'project_name', type: 'varchar', length: 50 ,comment: '프로젝트 명' ,nullable: true })
    projectName: string;

    @ApiProperty({ example: 'v1.0', description: '버전' })
    @Column({ name: 'project_version', type: 'varchar', length: 50 ,comment: '버전' ,nullable: true })
    projectVersion: string;

    @ApiProperty({ example: '발주명', description: '발주명' })
    @Column({ name: 'order_name', type: 'varchar', length: 50 ,comment: '발주명' ,nullable: true })
    orderName: string;

    @ApiProperty({ example: '발주일', description: '발주일' })
    @Column({ name: 'order_date', type: 'date' ,comment: '발주일' ,nullable: true })
    orderDate: Date;
    
    @ApiProperty({ example: '품목 코드', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 50 ,comment: '품목 코드' ,nullable: true })
    productCode: string;

    @ApiProperty({ example: '품목 명', description: '품목 명' })
    @Column({ name: 'product_name', type: 'varchar', length: 50 ,comment: '품목 명' ,nullable: true })
    productName: string;
    
    @ApiProperty({ example: '사용계획량', description: '사용계획량' })
    @Column({ name: 'use_plan_quantity', type: 'int' ,comment: '사용계획량' ,nullable: true})
    usePlanQuantity: number;

    @ApiProperty({ example: '발주수량', description: '발주수량' })
    @Column({ name: 'order_quantity', type: 'int' ,comment: '발주수량' ,nullable: true})
    orderQuantity: number;

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

    @ApiProperty({ example: '할인금액', description: '할인금액' })
    @Column({ name: 'discount_amount', type: 'int' ,comment: '할인금액' ,nullable: true})
    discountAmount: number;

    @ApiProperty({ example: '총액', description: '총액' })
    @Column({ name: 'total_amount', type: 'int' ,comment: '총액' ,nullable: true})
    totalAmount: number;

    @ApiProperty({ example: '입고예정일', description: '입고예정일' })
    @Column({ name: 'delivery_date', type: 'date' ,comment: '입고예정일' ,nullable: true})
    deliveryDate: Date;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @Column({ name: 'approval_info', type: 'varchar', length: 50 ,comment: '승인정보' ,nullable: true})
    approvalInfo: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 255 ,comment: '비고' ,nullable: true})
    remark: string;

    @ApiProperty({ example: '1', description: 'BOM 레벨' })
    @Column({ name: 'bom_level', type: 'int' ,comment: 'BOM 레벨' ,nullable: true})
    bomLevel: number;

    @ApiProperty({ example: 'PRD001', description: '상위 품목 코드' })
    @Column({ name: 'parent_product_code', type: 'varchar', length: 50 ,comment: '상위 품목 코드' ,nullable: true})
    parentProductCode: string;

    @ApiProperty({ example: '완제품', description: '품목 유형' })
    @Column({ name: 'product_type', type: 'varchar', length: 50 ,comment: '품목 유형' ,nullable: true})
    productType: string;

    @ApiProperty({ example: '원재료', description: '품목 카테고리' })
    @Column({ name: 'product_category', type: 'varchar', length: 50 ,comment: '품목 카테고리' ,nullable: true})
    productCategory: string;

    @ApiProperty({ example: 'kg', description: '발주 단위' })
    @Column({ name: 'product_order_unit', type: 'varchar', length: 50 ,comment: '발주 단위' ,nullable: true})
    productOrderUnit: string;

    @ApiProperty({ example: 'EA', description: '재고 단위' })
    @Column({ name: 'product_inventory_unit', type: 'varchar', length: 50 ,comment: '재고 단위' ,nullable: true})
    productInventoryUnit: string;

    @ApiProperty({ example: '과세', description: '세금 유형' })
    @Column({ name: 'tax_type', type: 'varchar', length: 50 ,comment: '세금 유형' ,nullable: true})
    taxType: string;

    @ApiProperty({ example: '3000', description: '판매 단가' })
    @Column({ name: 'product_price_sale', type: 'int' ,comment: '판매 단가' ,nullable: true})
    productPriceSale: number;

    @ApiProperty({ example: '100', description: '현재 재고 수량' })
    @Column({ name: 'current_inventory_quantity', type: 'int' ,comment: '현재 재고 수량' ,nullable: true})
    currentInventoryQuantity: number;

    @ApiProperty({ example: '정상', description: '재고 상태' })
    @Column({ name: 'inventory_status', type: 'varchar', length: 50 ,comment: '재고 상태' ,nullable: true})
    inventoryStatus: string;

    @ApiProperty({ example: '50', description: '안전 재고' })
    @Column({ name: 'safe_inventory', type: 'int' ,comment: '안전 재고' ,nullable: true})
    safeInventory: number;
    
}