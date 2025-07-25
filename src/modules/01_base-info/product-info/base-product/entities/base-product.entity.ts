import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CustomerInfo } from "@/modules/01_base-info/customer-info/entities/customer-info.entity";
@Entity()
export class BaseProduct {
  @ApiProperty({ example: 1, description: "기본 제품 고유 ID (자동 생성)" })
  @PrimaryGeneratedColumn({ comment: "기본 제품 고유 ID (자동 생성)" })
  id: number;

  @ApiProperty({ example: "PROD001", description: "기본 제품 코드 (자동 생성)" })
  @Column({
    name: "product_code",
    type: "varchar",
    length: 20,
    unique: true,
    comment: "기본 제품 코드 (자동 생성)",
  })
  productCode: string;

  @ApiProperty({ example: "기본 제품", description: "기본 제품 명" })
  @Column({ name: "product_name", type: "varchar", length: 100, comment: "기본 제품 명" })
  productName: string;

  @ApiProperty({ example: "PJ", description: "기본 제품 분류"})
  @Column({
    name: "product_category",
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "기본 제품 분류",
  })
  productCategory: string;

  @ApiProperty({ example: "1000", description: "기본 제품 가격" })
  @Column({name: "product_size", type: "varchar", comment: "제품 사이즈", nullable: true })
  productSize: string;

  @ManyToOne(() => CustomerInfo)
  @JoinColumn({ name : 'product_customer_code', referencedColumnName: 'customerCode'})
  customer: CustomerInfo;


  @ApiProperty({ example: "kg", description: "발주단위"})
  @Column({ name: "product_order_unit", type: "varchar", length: 20, comment: "발주단위", nullable: true})
  productOrderUnit: string;

  @ApiProperty({ example: "kg", description: "재고단위"})
  @Column({ name: "product_inventory_unit", type: "varchar", length: 20, comment: "재고단위", nullable: true })
  productInventoryUnit: string;
  
  @ApiProperty({ example: "12", description: "수량당 수량"})
  @Column({ name: "product_quantity_per_quantity", type: "varchar", length: 20, comment: "수량 당 수량", nullable: true })
  productQuantityPerQuantity: string;

  @ApiProperty({ example: "12", description: "안전재고"})
  @Column({ name: "product_safe_inventory", type: "varchar", length: 20, comment: "안전재고" })
  productSafeInventory: string;

  @ApiProperty({ example: "1", description: "입고/과세"})
  @Column({ name: "product_incoming_tax", type: "varchar", length: 20, comment: "입고/과세" , nullable: true})
  productIncomingTax: string;

  @ApiProperty({ example: "1000", description: "매입단가"})
  @Column({ name: "product_incoming_price", type: "varchar", length: 20, comment: "매입단가" , nullable: true})
  productIncomingPrice: string;

  @ApiProperty({ example: "1", description: "출고/과세"})
  @Column({ name: "product_forwarding_tax", type: "varchar", length: 20, comment: "출고/과세" , nullable: true})
  productForwardingTax: string;

  @ApiProperty({ example: "1000", description: "매출단가"})
  @Column({ name: "product_forwarding_price", type: "varchar", length: 20, comment: "매출단가" , nullable: true})
  productForwardingPrice: string;

  @ApiProperty({ example: "homepage.com", description: "기본 제품 홈페이지" })
  @Column({ name : "product_homepage", type: "varchar", length: 255, nullable: true, comment: "기본 제품 홈페이지" })
  productHomepage: string;

  @ApiProperty({ example: "비고내용", description: "비고" })
  @Column({ name : "product_bigo", type: "varchar", length: 255, nullable: true, comment: "기본 제품 홈페이지" })
  productBigo: string;

  @ApiProperty({ example: 'admin', description: '계정 생성자' })
  @Column({ name: 'created_by', type: 'varchar', length: 50, comment: '계정 생성자' })
  createdBy: string;

  @ApiProperty({ example: 'admin', description: '계정 수정자' })
  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 50,
    comment: '계정 수정자',
    nullable: true,
  })
  updatedBy: string;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 생성일시 (자동 생성)' })
  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-02T09:00:00.000Z', description: '계정 수정일시 (자동 생성)' })
  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date;
}