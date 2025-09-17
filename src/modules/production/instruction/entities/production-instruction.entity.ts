import { BaseEntity } from "@/common/entities/base.entity";
import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class ProductionInstruction extends BaseEntity {
    @ApiProperty({ example: 'PI001', description: '생산 지시 코드 (자동 생성)' })
    @Column({ name: 'production_instruction_code', type: 'varchar', length: 20, comment: '생산 지시 코드 (자동 생성)' })
    productionInstructionCode: string;

    @ApiProperty({ example: 'PP001', description: '생산 계획 코드' })
    @Column({ name: 'production_plan_code', type: 'varchar', length: 20, comment: '생산 계획 코드' })
    productionPlanCode: string;

    @ApiProperty({ example: '100', description: '생산 지시 수량' })
    @Column({ name: 'production_instruction_quantity', type: 'int', comment: '생산 지시 수량' })
    productionInstructionQuantity: number;

    @ApiProperty({ example: '2025-01-01', description: '생산 시작일' })
    @Column({ name: 'production_start_date', type: 'date', comment: '생산 시작일' })
    productionStartDate: Date;

    @ApiProperty({ example: '2025-01-01', description: '생산 완료일' })
    @Column({ name: 'production_completion_date', type: 'date', comment: '생산 완료일' })
    productionCompletionDate: Date;

    @ApiProperty({ example: 'EMP001', description: '사원 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20, comment: '사원 코드' })
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20, comment: '사원 이름' })
    employeeName: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20, comment: '비고' })
    remark: string;
    
}