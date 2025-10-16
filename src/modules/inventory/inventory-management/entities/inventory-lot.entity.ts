import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['lotCode'], { unique: true }) // LOT코드만 유니크 (품목코드 + 날짜 + 시퀀스 조합이므로)
export class InventoryLot extends BaseEntity {
    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 50, comment: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '품목명', description: '품목명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, comment: '품목명' })
    productName: string;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드' })
    @Column({ name: 'lot_code', type: 'varchar', length: 50, comment: 'LOT 코드' })
    lotCode: string;

    @ApiProperty({ example: 100, description: 'LOT별 재고 수량' })
    @Column({ name: 'lot_quantity', type: 'int', comment: 'LOT별 재고 수량', default: 0 })
    lotQuantity: number;

    @ApiProperty({ example: 'EA', description: '단위' })
    @Column({ name: 'unit', type: 'varchar', length: 20, comment: '단위' })
    unit: string;

    @ApiProperty({ example: '창고A', description: '보관 위치' })
    @Column({ name: 'storage_location', type: 'varchar', length: 50, comment: '보관 위치' })
    storageLocation: string;

    @ApiProperty({ example: 'WHS001', description: '창고 코드' })
    @Column({ name: 'warehouse_code', type: 'varchar', length: 20, comment: '창고 코드', nullable: true })
    warehouseCode: string;

    @ApiProperty({ example: '창고1', description: '창고명' })
    @Column({ name: 'warehouse_name', type: 'varchar', length: 50, comment: '창고명', nullable: true })
    warehouseName: string;

    @ApiProperty({ example: '1구역', description: '창고 구역' })
    @Column({ name: 'warehouse_zone', type: 'varchar', length: 50, comment: '창고 구역', nullable: true })
    warehouseZone: string;

    @ApiProperty({ example: '정상', description: 'LOT 상태' })
    @Column({ name: 'lot_status', type: 'varchar', length: 20, comment: 'LOT 상태', default: '정상' })
    lotStatus: string;

    @ApiProperty({ example: '입고처리', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 200, comment: '비고', nullable: true })
    remark: string;

    @ApiProperty({ example: 'RCV001', description: '최초 입고 코드' })
    @Column({ name: 'first_receiving_code', type: 'varchar', length: 50, comment: '최초 입고 코드', nullable: true })
    firstReceivingCode: string;
}
