import { Entity, Column} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Inventory extends BaseEntity {

    @ApiProperty({ example: 'INV001', description: '재고 코드' })
    @Column({ name: 'inventory_code', type: 'varchar', length: 20 ,comment: '재고 코드'})
    inventoryCode: string;

    @ApiProperty({ example: '재고 이름', description: '재고 이름' })
    @Column({ name: 'inventory_name', type: 'varchar', length: 20 ,comment: '재고 이름'})
    inventoryName: string;

    @ApiProperty({ example: '품목 타입', description: '품목 타입' })
    @Column({ name: 'inventory_type', type: 'varchar', length: 20 ,comment: '품목 타입'})
    inventoryType: string;

    @ApiProperty({ example: '재고 수량', description: '재고 수량' })
    @Column({ name: 'inventory_quantity', type: 'int' ,comment: '재고 수량'})
    inventoryQuantity: number;

    @ApiProperty({ example: '재고 단위', description: '재고 단위' })
    @Column({ name: 'inventory_unit', type: 'varchar', length: 20 ,comment: '재고 단위'})
    inventoryUnit: string;

    @ApiProperty({ example: '재고 위치', description: '재고 위치' })
    @Column({ name: 'inventory_location', type: 'varchar', length: 20 ,comment: '재고 위치'})
    inventoryLocation: string;

    @ApiProperty({ example: '안전 재고', description: '안전 재고' })
    @Column({ name: 'safe_inventory', type: 'int' ,comment: '안전 재고'})
    safeInventory: number;

    @ApiProperty({ example: '재고 상태', description: '재고 상태' })
    @Column({ name: 'inventory_status', type: 'varchar', length: 20 ,comment: '재고 상태'})
    inventoryStatus: string;
}
