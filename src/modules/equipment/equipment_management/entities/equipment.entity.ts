import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Equipment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'equipment_code', type: 'varchar', length: 255 })
    equipmentCode: string;

    @Column({ name: 'equipment_name', type: 'varchar', length: 255 })
    equipmentName: string;

    @Column({ name : 'equipment_model', type: 'varchar', length: 255 })
    equipmentModel: string;

    @Column({ name : 'equipment_purchase_place', type: 'varchar', length: 255 })
    equipmentPurchasePlace: string;

    @Column({ name : 'equipment_purchase_date', type: 'date' })
    equipmentPurchaseDate: Date;

    @Column({ name : 'equipment_purchase_price', type: 'int' })
    equipmentPurchasePrice: number;

    @Column({ name : 'equipment_history', type: 'varchar', length: 255 })
    equipmentHistory: string;

    @Column({ name : 'equipment_worker', type: 'varchar', length: 255 })
    equipmentWorker: string;
    
}