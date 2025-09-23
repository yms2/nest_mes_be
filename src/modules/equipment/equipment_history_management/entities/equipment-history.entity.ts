import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity()
export class EquipmentHistory extends BaseEntity {

    @ApiProperty({ example: 'EH001', description: '설비 이력 코드' })
    @Column({ name: 'equipment_history_code', type: 'varchar', length: 20, comment: '설비 이력 코드', nullable: true })
    equipmentHistoryCode: string;

    @ApiProperty({ example: 'EQ001', description: '설비 코드' })
    @Column({ name: 'equipment_code', type: 'varchar', length: 20, comment: '설비 코드' })
    equipmentCode: string;

    @ApiProperty({ example: '설비1', description: '설비 이름' })
    @Column({ name: 'equipment_name', type: 'varchar', length: 20, comment: '설비 이름' })
    equipmentName: string;

    @ApiProperty({ example: '2025-01-01', description: '고장일자' })
    @Column({ name: 'equipment_date', type: 'date', comment: '고장일자' })
    equipmentDate: Date;

    @ApiProperty({ example: '고장내역', description: '고장내역' })
    @Column({ name: 'equipment_history', type: 'varchar', length: 20, comment: '고장내역', nullable: true })
    equipmentHistory: string;

    @ApiProperty({ example: '점검 및 수리', description: '점검 및 수리' })
    @Column({ name: 'equipment_repair', type: 'varchar', length: 20, comment: '점검 및 수리', nullable: true })
    equipmentRepair: string;

    @ApiProperty({ example: '비용', description: '비용' })
    @Column({ name: 'equipment_cost', type: 'int', comment: '비용', nullable: true })
    equipmentCost: number;
    
    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20, comment: '담당자 코드', nullable: true })
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20, comment: '사원 이름', nullable: true })
    employeeName: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 100, comment: '비고', nullable: true })
    remark: string;

}