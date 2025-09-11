import { Entity, Column} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Inventory extends BaseEntity {

    @Column({ name: 'inventory_code', type: 'varchar', length: 20 ,comment: '재고 코드'})
    inventoryCode: string;

    @Column({ name: 'inventory_name', type: 'varchar', length: 20 ,comment: '재고 이름'})
    inventoryName: string;

    @Column({ name: 'inventory_type', type: 'varchar', length: 20 ,comment: '품목 타입'})
    inventoryType: string;

    @Column({ name: 'inventory_quantity', type: 'int' ,comment: '재고 수량'})
    inventoryQuantity: number;

    @Column({ name: 'inventory_unit', type: 'varchar', length: 20 ,comment: '재고 단위'})
    inventoryUnit: string;

    @Column({ name: 'inventory_location', type: 'varchar', length: 20 ,comment: '재고 위치'})
    inventoryLocation: string;

    @Column({ name: 'safe_inventory', type: 'int' ,comment: '안전 재고'})
    safeInventory: number;

    @Column({ name: 'inventory_status', type: 'varchar', length: 20 ,comment: '재고 상태'})
    inventoryStatus: string;
}
