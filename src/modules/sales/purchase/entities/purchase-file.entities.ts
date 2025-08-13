import { CustomerInfo } from "@/modules/01_base-info/customer-info/entities/customer-info.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustomerInfo, customer => customer.customerName)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerInfo;

  @Column()
  productName: string;

  @Column('int')
  quantity: number;

  @Column('int')
  unitPrice: number;
}
