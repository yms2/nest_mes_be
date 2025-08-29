import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class OrderManagement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_code', type: 'varchar', length: 20 })
    orderCode: string;

    @Column({ name: 'order_date', type: 'date' })
    orderDate: Date;

    @Column({ name: 'customer_code', type: 'varchar', length: 20 })
    customerCode: string;
    
    @Column({ name: 'customer_name', type: 'varchar', length: 20 })
    customerName: string;

    @Column({ name : 'project_code', type: 'varchar', length: 20 })
    projectCode: string;

    @Column({ name : 'project_name', type: 'varchar', length: 20 })
    projectName: string;

    @Column({ name : 'product_code', type: 'varchar', length: 20 })
    productCode: string;

    @Column({ name : 'product_name', type: 'varchar', length: 20 })
    productName: string;

    

}