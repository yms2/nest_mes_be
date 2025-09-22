import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity()
export class Claim extends BaseEntity {
    @ApiProperty({ example: 'CLM001', description: '클레임 코드' })
    @Column({ name: 'claim_code', type: 'varchar', length: 50, unique: true, comment: '클레임 코드' })
    claimCode: string;

    @ApiProperty({ example: '2025-01-01', description: '클레임 접수일' })
    @Column({ name: 'claim_date', type: 'date', comment: '클레임 접수일' })
    claimDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 50, comment: '고객 코드' })
    customerCode: string;
    
    @ApiProperty({ example: 'ABC 회사', description: '고객명' })
    @Column({ name: 'customer_name', type: 'varchar', length: 100, comment: '고객명' })
    customerName: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 50, comment: '프로젝트 코드' })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 명', description: '프로젝트 명' })
    @Column({ name: 'project_name', type: 'varchar', length: 100, comment: '프로젝트 명' })
    projectName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 50, comment: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '제품명', description: '품목명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, comment: '품목명' })
    productName: string;

    @ApiProperty({ example: 100, description: '클레임 수량' })
    @Column({ name: 'claim_quantity', type: 'int', comment: '클레임 수량' })
    claimQuantity: number;

    @ApiProperty({ example: 100000, description: '클레임 금액' })
    @Column({ name: 'claim_price', type: 'decimal', precision: 15, scale: 2, comment: '클레임 금액' })
    claimPrice: number;

    @ApiProperty({ example: '불량품 교체 요청', description: '클레임 사유' })
    @Column({ name: 'claim_reason', type: 'varchar', length: 200, comment: '클레임 사유' })
    claimReason: string;

    @ApiProperty({ example: '접수', description: '클레임 상태 (접수, 처리중, 완료, 취소)' })
    @Column({ 
        name: 'claim_status', 
        type: 'varchar', 
        length: 20,
        default: '접수',
        comment: '클레임 상태' 
    })
    claimStatus: string;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 50, comment: '담당자 코드' })
    employeeCode: string;

    @ApiProperty({ example: '홍길동', description: '담당자명' })
    @Column({ name: 'employee_name', type: 'varchar', length: 50, comment: '담당자명' })
    employeeName: string;

    @ApiProperty({ example: '2025-01-15', description: '처리 완료일' })
    @Column({ name: 'completion_date', type: 'date', nullable: true, comment: '처리 완료일' })
    completionDate?: Date;

    @ApiProperty({ example: '교체 완료', description: '처리 결과' })
    @Column({ name: 'resolution', type: 'text', nullable: true, comment: '처리 결과' })
    resolution?: string;

    @ApiProperty({ example: '추가 비고사항', description: '비고' })
    @Column({ name: 'remark', type: 'text', nullable: true, comment: '비고' })
    remark?: string;

    @ApiProperty({ example: '2025-01-10', description: '예상 완료일' })
    @Column({ name: 'expected_completion_date', type: 'date', nullable: true, comment: '예상 완료일' })
    expectedCompletionDate?: Date;
}