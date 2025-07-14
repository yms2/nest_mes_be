import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class BomInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_product_code', type: 'varchar', length: 20 })
  parentProductCode: string;

  @Column({ name: 'child_product_code', type: 'varchar', length: 20 })
  childProductCode: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'varchar', length: 10 })
  unit: string;
}
