import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Production } from "@/modules/production/equipment-production/entities/production.entity";

@Entity()
export class QualityInspection extends BaseEntity {
    @ApiProperty({ example: 'QI001', description: '품질검사 코드' })
    @Column({ name: 'inspection_code', type: 'varchar', length: 20, nullable: false, unique: true, comment: '품질검사 코드' })
    inspectionCode: string;

    @ApiProperty({ example: 1, description: '생산 ID' })
    @Column({ name: 'production_id', type: 'int', nullable: false, comment: '생산 ID' })
    productionId: number;

    @ApiProperty({ example: 'PRO001', description: '생산 코드' })
    @Column({ name: 'production_code', type: 'varchar', length: 20, nullable: false, comment: '생산 코드' })
    productionCode: string;

    @ApiProperty({ example: '제품A', description: '제품명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, nullable: false, comment: '제품명' })
    productName: string;

    @ApiProperty({ example: 100, description: '검사 수량' })
    @Column({ name: 'inspection_quantity', type: 'int', nullable: false, comment: '검사 수량' })
    inspectionQuantity: number;

    @ApiProperty({ example: 'CRI001', description: '품질기준 코드' })
    @Column({ name: 'criteria_code', type: 'varchar', length: 20, nullable: false, comment: '품질기준 코드' })
    criteriaCode: string;

    @ApiProperty({ example: '치수정밀도', description: '품질기준명' })
    @Column({ name: 'criteria_name', type: 'varchar', length: 100, nullable: false, comment: '품질기준명' })
    criteriaName: string;

    @ApiProperty({ example: '치수', description: '품질기준 타입' })
    @Column({ name: 'criteria_type', type: 'varchar', length: 50, nullable: false, comment: '품질기준 타입' })
    criteriaType: string;

    @ApiProperty({ example: '2025-01-19', description: '검사일' })
    @Column({ name: 'inspection_date', type: 'date', nullable: false, comment: '검사일' })
    inspectionDate: Date;

    @ApiProperty({ example: '김검사', description: '검사자' })
    @Column({ name: 'inspector', type: 'varchar', length: 50, nullable: false, comment: '검사자' })
    inspector: string;

    @ApiProperty({ example: 'PASS', description: '검사결과 (PASS/FAIL)' })
    @Column({ name: 'inspection_result', type: 'varchar', length: 10, nullable: true, comment: '검사결과' })
    inspectionResult: string;

    @ApiProperty({ example: 'PENDING', description: '검사 상태' })
    @Column({ name: 'inspection_status', type: 'varchar', length: 20, nullable: false, default: 'PENDING', comment: '검사 상태' })
    inspectionStatus: string;

    @ApiProperty({ example: '검사 완료', description: '비고' })
    @Column({ name: 'remark', type: 'text', nullable: true, comment: '비고' })
    remark: string;

    @ApiProperty({ example: 'admin', description: '승인자' })
    @Column({ name: 'approved_by', type: 'varchar', length: 50, nullable: true, comment: '승인자' })
    approvedBy: string;

    @ApiProperty({ example: '2025-01-19T10:00:00Z', description: '승인일시' })
    @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '승인일시' })
    approvedAt: Date;

    @ApiProperty({ example: 'admin', description: '거부자' })
    @Column({ name: 'rejected_by', type: 'varchar', length: 50, nullable: true, comment: '거부자' })
    rejectedBy: string;

    @ApiProperty({ example: '2025-01-19T10:00:00Z', description: '거부일시' })
    @Column({ name: 'rejected_at', type: 'datetime', nullable: true, comment: '거부일시' })
    rejectedAt: Date;

    @ApiProperty({ example: '품질 기준 미달', description: '거부 사유' })
    @Column({ name: 'rejection_reason', type: 'text', nullable: true, comment: '거부 사유' })
    rejectionReason: string;

    @ApiProperty({ example: 'PRD001', description: '제품 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20, nullable: true, comment: '제품 코드' })
    productCode: string;

    // 관계 설정
    @ManyToOne(() => Production)
    @JoinColumn({ name: 'production_id' })
    production: Production;
}
