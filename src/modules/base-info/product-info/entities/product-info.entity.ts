import { ApiProperty } from "@nestjs/swagger"
import { Column, Entity } from "typeorm";
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class ProductInfo extends BaseEntity{

  @ApiProperty({ example: 'PRD001', description: '품목 코드 (자동 생성)'})
  @Column({ name:'product_code', type: 'varchar', length: 20, unique: true, comment: '품목 코드 (자동 생성)' })
  productCode: string;

  @ApiProperty({example: '볼펜', description: '품목명'})
  @Column({ name:'product_name', type:'varchar', length: 20, comment: '품목명'})
  productName: string;

  @ApiProperty({example: '원재료', description: '품목구분'})
  @Column({name: 'product_type', type:'varchar', length:10, comment: '품목구분'})
  productType: string;

  @ApiProperty({example: '15', description: '규격'})
  @Column({name: 'product_size', type:'varchar', length:50, comment: '규격',nullable: true })
  productSize: string;

  @ApiProperty({example:'kg', description: '발주단위'})
  @Column({name: 'product_order_unit', type:'varchar', length: 20, comment: '발주단위',nullable: true})
  productOrderUnit: string;

  @ApiProperty({example:'EA', description: '재고단위'})
  @Column({name: 'product_inventory_unit', type:'varchar', length: 20, comment: '재고단위',nullable: true})
  productInventoryUnit: string;

  @ApiProperty({example:'14', description:'수량 당 수량'})
  @Column({name: 'unit_quantity',type: 'varchar', length:10, comment: '수량 당 수량',nullable: true})
  unitQuantity: string;

  @ApiProperty({example:20, description:'안전재고'})
  @Column({name: 'safe_inventory', type: 'varchar', length:10, comment: '안전재고',nullable: true})
  safeInventory: string;

  @ApiProperty({example:20, description:'과세구분'})
  @Column({name: 'tax_type', type: 'varchar', length:10, comment: '과세구분',nullable: true})
  taxType: string;

  @ApiProperty({example:20, description:'단가'})
  @Column({name: 'price', type: 'varchar', length: 10, comment: '단가',nullable: true})
  productPrice: string;

  @ApiProperty({example:'비고내용', description:'비고'})
  @Column({name: 'product_bigo', type: 'varchar', length: 100, comment: '비고',nullable: true})
  productBigo: string;

}