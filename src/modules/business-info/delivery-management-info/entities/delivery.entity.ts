import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Shipping } from "../../shipping-info/entities/shipping.entity";

@Entity()
export class Delivery extends BaseEntity {
    @ApiProperty({ example: 'DEL001', description: '납품 코드' })
    @Column({ name: 'delivery_code', type: 'varchar', length: 20 })
    deliveryCode: string;

    @ApiProperty({ example: '2025-01-01', description: '납품 일자' })
    @Column({ name: 'delivery_date', type: 'date' })
    deliveryDate: Date;

    @ApiProperty({ example: 'SHP001', description: '출하 코드' })
    @Column({ name: 'shipping_code', type: 'varchar', length: 20 })
    shippingCode: string;

    @ApiProperty({ example: 'CUS001', description: '거래처 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 20 })
    customerCode: string;
    
    @ApiProperty({ example: 'CUS001', description: '거래처 명' })
    @Column({ name: 'customer_name', type: 'varchar', length: 20 })
    customerName: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 명' })
    @Column({ name: 'product_name', type: 'varchar', length: 20 })
    productName: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 20 })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    @Column({ name: 'project_name', type: 'varchar', length: 20 })
    projectName: string;

    @ApiProperty({ example: '100', description: '납품 수량' })
    @Column({ name: 'delivery_quantity', type: 'int' })
    deliveryQuantity: number;

    @ApiProperty({ example: '납품 상태', description: '납품 상태' })
    @Column({ name: 'delivery_status', type: 'varchar', length: 20 })
    deliveryStatus: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20 })
    remark: string;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z', description: '삭제일시' })
    @Column({ name: 'deleted_at', type: 'datetime', nullable: true, comment: '삭제일시' })
    deletedAt?: Date;

    // 외래키 관계는 서비스 레벨에서 처리
    // @ManyToOne(() => Shipping, { eager: true })
    // @JoinColumn({ name: 'shipping_code', referencedColumnName: 'shippingCode' })
    // shipping?: Shipping;
    
}