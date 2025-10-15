import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity()
export class InventoryIssue extends BaseEntity {
    @ApiProperty({ example: 'ISS001', description: '불출 코드' })
    @Column({ name: 'issue_code', type: 'varchar', length: 50, comment: '불출 코드', nullable: true })
    issueCode: string;

    @ApiProperty({ example: '2025-01-15', description: '불출 일자' })
    @Column({ name: 'issue_date', type: 'date', comment: '불출 일자', nullable: true })
    issueDate: Date;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 50, comment: '품목 코드', nullable: true })
    productCode: string;

    @ApiProperty({ example: '배터리 팩', description: '품목명' })
    @Column({ name: 'product_name', type: 'varchar', length: 100, comment: '품목명', nullable: true })
    productName: string;

    @ApiProperty({ example: 'EA', description: '단위' })
    @Column({ name: 'unit', type: 'varchar', length: 20, comment: '단위', nullable: true })
    unit: string;

    @ApiProperty({ example: 50, description: '불출 수량' })
    @Column({ name: 'issue_quantity', type: 'int', comment: '불출 수량', nullable: true })
    issueQuantity: number;

    @ApiProperty({ example: 'WH001', description: '창고 코드' })
    @Column({ name: 'warehouse_code', type: 'varchar', length: 50, comment: '창고 코드', nullable: true })
    warehouseCode: string;

    @ApiProperty({ example: '메인창고', description: '창고명' })
    @Column({ name: 'warehouse_name', type: 'varchar', length: 100, comment: '창고명', nullable: true })
    warehouseName: string;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드' })
    @Column({ name: 'lot_code', type: 'varchar', length: 50, comment: 'LOT 코드', nullable: true })
    lotCode: string;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 50, comment: '담당자 코드', nullable: true })
    employeeCode: string;

    @ApiProperty({ example: '홍길동', description: '담당자명' })
    @Column({ name: 'employee_name', type: 'varchar', length: 50, comment: '담당자명', nullable: true })
    employeeName: string;

    @ApiProperty({ example: 'PROJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 50, comment: '프로젝트 코드', nullable: true })
    projectCode: string;

    @ApiProperty({ example: '프로젝트명', description: '프로젝트명' })
    @Column({ name: 'project_name', type: 'varchar', length: 100, comment: '프로젝트명', nullable: true })
    projectName: string;

    @ApiProperty({ example: '생산용', description: '불출 사유' })
    @Column({ name: 'issue_reason', type: 'varchar', length: 200, comment: '불출 사유', nullable: true })
    issueReason: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 500, comment: '비고', nullable: true })
    remark: string;

    @ApiProperty({ example: '대기', description: '승인상태' })
    @Column({ name: 'approval_status', type: 'varchar', length: 20, comment: '승인상태', default: '대기' })
    approvalStatus: string;
}
