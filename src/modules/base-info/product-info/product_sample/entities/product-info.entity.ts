import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductFile } from './product-file.entity';

@Entity()
export class ProductInfo extends BaseEntity {
  @ApiProperty({ example: 'PRD001', description: '품목 코드 (자동 생성)' })
  @Column({
    name: 'product_code',
    type: 'varchar',
    length: 20,
    unique: true,
    comment: '품목 코드 (자동 생성)',
  })
  productCode: string;

  @ApiProperty({ example: '볼펜', description: '품목명' })
  @Column({ name: 'product_name', type: 'varchar', length: 20, comment: '품목명' })
  productName: string;

  @ApiProperty({ example: '원재료', description: '품목구분' })
  @Column({ name: 'product_type', type: 'varchar', length: 10, comment: '품목구분' })
  productType: string;

  @ApiProperty({ example: '원재료', description: '분류' })
  @Column({ name: 'product_category', type: 'varchar', length: 10, comment: '분류', nullable: true  })
  productCategory: string;

  @ApiProperty({ example: '15', description: '규격1' })
  @Column({ name: 'product_size1', type: 'varchar', length: 50, comment: '규격1', nullable: true })
  productSize1: string;

  @ApiProperty({ example: '15', description: '규격2' })
  @Column({ name: 'product_size2', type: 'varchar', length: 50, comment: '규격2', nullable: true })
  productSize2: string;

  @ApiProperty({ example: '거래처', description: '거래처' })
  @Column({ name: 'customer_code', type: 'varchar', length: 20, comment: '거래처', nullable: true })
  customerCode: string;

  @ApiProperty({ example: 'kg', description: '발주단위' })
  @Column({
    name: 'product_order_unit',
    type: 'varchar',
    length: 20,
    comment: '발주단위',
    nullable: true,
  })
  productOrderUnit: string;

  @ApiProperty({ example: 'EA', description: '재고단위' })
  @Column({
    name: 'product_inventory_unit',
    type: 'varchar',
    length: 20,
    comment: '재고단위',
    nullable: true,
  })
  productInventoryUnit: string;

  @ApiProperty({ example: '14', description: '수량 당 수량' })
  @Column({
    name: 'unit_quantity',
    type: 'varchar',
    length: 10,
    comment: '수량 당 수량',
    nullable: true,
  })
  unitQuantity: string;

  @ApiProperty({ example: 20, description: '안전재고' })
  @Column({
    name: 'safe_inventory',
    type: 'varchar',
    length: 10,
    comment: '안전재고',
    nullable: true,
  })
  safeInventory: string;

  @ApiProperty({ example: '과세', description: '입고/과세' })
  @Column({ name: 'tax_type', type: 'varchar', length: 10, comment: '입고/과세', nullable: true })
  taxType: string;

  @ApiProperty({ example: 20, description: '매입단가' })
  @Column({ name: 'product_price', type: 'varchar', length: 10, comment: '매입단가', nullable: true })
  productPrice: string;

  @ApiProperty({ example: '과세', description: '출고/과세' })
  @Column({ name: 'tax_type_sale', type: 'varchar', length: 10, comment: '출고/과세', nullable: true })
  taxTypeSale: string;

  @ApiProperty({ example: 20, description: '매출단가' })
  @Column({ name: 'product_price_sale', type: 'varchar', length: 10, comment: '매출단가', nullable: true })
  productPriceSale: string;

  @ApiProperty({ example: '홈페이지', description: '홈페이지' })
  @Column({ name: 'product_homepage', type: 'varchar', length: 100, comment: '홈페이지', nullable: true })
  productHomepage: string;

  @ApiProperty({ example: '비고내용', description: '비고' })
  @Column({ name: 'product_bigo', type: 'varchar', length: 100, comment: '비고', nullable: true })
  productBigo: string;

  @ApiProperty({ example: '바코드넘버', description: '바코드넘버' })
  @Column({ name: 'barcode_number', type: 'varchar', length: 100, comment: '바코드넘버', nullable: true })
  barcodeNumber: string;

  @ApiProperty({ example: 'uploads/barcodes/barcode_0000000000001_1234567890.png', description: '바코드 이미지 경로' })
  @Column({ name: 'barcode_image_path', type: 'varchar', length: 255, comment: '바코드 이미지 경로', nullable: true })
  barcodeImagePath: string;

  // 파일 관계
  @OneToMany(() => ProductFile, file => file.product)
  files: ProductFile[];
}
