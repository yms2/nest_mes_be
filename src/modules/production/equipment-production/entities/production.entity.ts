import { BaseEntity } from "@/common/entities/base.entity";
import { Entity, Column, OneToMany } from "typeorm";
import { QualityInspection } from "@/modules/quality/inspection/entities/quality-inspection.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Production extends BaseEntity {
    @ApiProperty({ example: 'PRO001', description: '생산 코드' })
    @Column({ name: 'production_code', type: 'varchar', length: 20, comment: '생산 코드' })
    productionCode: string;

    @ApiProperty({ example: 'PI001', description: '생산 지시 코드' })
    @Column({ name: 'production_instruction_code', type: 'varchar', length: 20, comment: '생산 지시 코드' })
    productionInstructionCode: string;


    @ApiProperty({ example: 'PRD001', description: '제품 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20, comment: '제품 코드' })
    productCode: string;

    @ApiProperty({ example: '볼펜', description: '제품명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, comment: '제품명' })
    productName: string;

    @ApiProperty({ example: '완제품', description: '제품 구분' })
    @Column({ name: 'product_type', type: 'varchar', length: 20, comment: '제품 구분' })
    productType: string;

    @ApiProperty({ example: '0.7mm', description: '제품 규격' })
    @Column({ name: 'product_size', type: 'varchar', length: 50, comment: '제품 규격' })
    productSize: string;

    @ApiProperty({ example: '100', description: '생산지시수량' })
    @Column({ name: 'production_instruction_quantity', type: 'int', comment: '생산지시수량' })
    productionInstructionQuantity: number;

    @ApiProperty({ example: 'BD001', description: '생산 불량 코드' })
    @Column({ name: 'production_defect_code', type: 'varchar', length: 20, comment: '생산 불량 코드' })
    productionDefectCode: string;

    @ApiProperty({ example: '10', description: '불량 수량' })
    @Column({ name: 'production_defect_quantity', type: 'int', comment: '불량 수량' })
    productionDefectQuantity: number;

    @ApiProperty({ example: '100', description: '생산 완료 수량' })
    @Column({ name: 'production_completion_quantity', type: 'int', comment: '생산 완료 수량' })
    productionCompletionQuantity: number;

    @ApiProperty({ example: 'PRC001', description: '공정 코드' })
    @Column({ name: 'production_process_code', type: 'varchar', length: 20, comment: '공정 코드' ,nullable: true})
    productionProcessCode: string;
    
    @ApiProperty({ example: '절삭', description: '공정명' })
    @Column({ name: 'production_process_name', type: 'varchar', length: 20, comment: '공정명' ,nullable: true})
    productionProcessName: string;

    @ApiProperty({ example: '생산 완료', description: '생산 상태' })
    @Column({ name: 'production_status', type: 'varchar', length: 20, comment: '생산 상태' })
    productionStatus: string;

    @ApiProperty({ example: '2025-01-01', description: '생산 시작일' })
    @Column({ name: 'production_start_date', type: 'date', comment: '생산 시작일', nullable: true })
    productionStartDate: Date;

    @ApiProperty({ example: '2025-01-01', description: '생산 완료일' })
    @Column({ name: 'production_completion_date', type: 'date', comment: '생산 완료일', nullable: true })
    productionCompletionDate: Date;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20, comment: '담당자 코드' ,nullable: true})
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20, comment: '사원 이름' ,nullable: true})
    employeeName: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 100, comment: '비고' ,nullable: true})
    remark: string;

    // 품질검사 관계
    @OneToMany(() => QualityInspection, inspection => inspection.production)
    qualityInspections: QualityInspection[];

}
