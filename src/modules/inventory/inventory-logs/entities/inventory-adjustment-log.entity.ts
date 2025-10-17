import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
@Index(['inventoryCode', 'createdAt'])
@Index(['adjustmentType', 'createdAt'])
@Index(['createdBy', 'createdAt'])
export class InventoryAdjustmentLog extends BaseEntity {

  @Column({ name: 'inventory_code', type: 'varchar', length: 50, comment: '재고 코드' })
  inventoryCode: string;

  @Column({ name: 'inventory_name', type: 'varchar', length: 100, comment: '재고명' })
  inventoryName: string;

  @Column({ name: 'adjustment_type', type: 'varchar', length: 20, comment: '조정 유형 (CHANGE, SET, RESET)' })
  adjustmentType: string;

  @Column({ name: 'before_quantity', type: 'int', comment: '조정 전 수량' })
  beforeQuantity: number;

  @Column({ name: 'after_quantity', type: 'int', comment: '조정 후 수량' })
  afterQuantity: number;

  @Column({ name: 'quantity_change', type: 'int', comment: '수량 변경량 (증감)' })
  quantityChange: number;

  @Column({ name: 'adjustment_reason', type: 'varchar', length: 255, nullable: true, comment: '조정 사유' })
  adjustmentReason: string;

  @Column({ name: 'log_status', type: 'varchar', length: 20, default: 'SUCCESS', comment: '로그 상태 (SUCCESS, FAILED)' })
  logStatus: string;

  @Column({ name: 'error_message', type: 'text', nullable: true, comment: '에러 메시지 (실패 시)' })
  errorMessage: string;
}
