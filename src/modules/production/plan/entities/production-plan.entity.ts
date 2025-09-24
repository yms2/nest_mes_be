import { BaseEntity } from "@/common/entities/base.entity";
import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class ProductionPlan extends BaseEntity {
    @ApiProperty({ example: 'PP001', description: '생산 계획 코드 (자동 생성)' })
    @Column({ name: 'production_plan_code', type: 'varchar', length: 20, comment: '생산 계획 코드 (자동 생성)' })
    productionPlanCode: string;

    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    @Column({ name: 'order_code', type: 'varchar', length: 20, comment: '수주 코드' ,nullable: true})
    orderCode: string;

    @ApiProperty({ example: '2025-01-01', description: '생산 계획 일자' })
    @Column({ name: 'production_plan_date', type: 'date', comment: '생산 계획 일자' })
    productionPlanDate: Date;

    @ApiProperty({ example: '신규/AS', description: '신규/AS' })
    @Column({ name: 'order_type', type: 'varchar', length: 20, comment: '신규/AS' ,nullable: true})
    orderType: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @Column({ name: 'project_code', type: 'varchar', length: 20, comment: '프로젝트 코드' ,nullable: true})
    projectCode: string;
    
    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    @Column({ name: 'project_name', type: 'varchar', length: 20, comment: '프로젝트 이름' ,nullable: true})
    projectName: string;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    @Column({ name: 'customer_code', type: 'varchar', length: 20, comment: '고객 코드' ,nullable: true})
    customerCode: string;

    @ApiProperty({ example: '고객 이름', description: '고객 이름' })
    @Column({ name: 'customer_name', type: 'varchar', length: 20, comment: '고객 이름' ,nullable: true})
    customerName: string;
    
    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @Column({ name: 'product_code', type: 'varchar', length: 20, comment: '품목 코드' ,nullable: true})
    productCode: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름' })
    @Column({ name: 'product_name', type: 'varchar', length: 20, comment: '품목 이름' ,nullable: true})
    productName: string;

    @ApiProperty({ example: '구분', description: '구분' })
    @Column({ name: 'product_type', type: 'varchar', length: 20, comment: '구분' ,nullable: true})
    productType: string;

    @ApiProperty({ example: '규격', description: '규격' })
    @Column({ name: 'product_size', type: 'varchar', length: 20, comment: '규격' ,nullable: true})
    productSize: string;

    @ApiProperty({ example: '재고수량', description: '재고수량' })
    @Column({ name: 'product_stock', type: 'int', comment: '재고수량' ,nullable: true})
    productStock: number;

    @ApiProperty({ example: '생산계획수량', description: '생산계획수량' })
    @Column({ name: 'production_plan_quantity', type: 'int', comment: '생산계획수량' ,nullable: true})
    productionPlanQuantity: number;

    @ApiProperty({ example: '예상 재고수량', description: '예상 재고수량' })
    @Column({ name: 'expected_product_stock', type: 'int', comment: '예상 재고수량' ,nullable: true})
    expectedProductStock: number;

    @ApiProperty({ example: '예상 시작일', description: '예상 시작일' })
    @Column({ name: 'expected_start_date', type: 'date', comment: '예상 시작일' ,nullable: true})
    expectedStartDate: Date;

    @ApiProperty({ example: '예상 완료일', description: '예상 완료일' })
    @Column({ name: 'expected_completion_date', type: 'date', comment: '예상 완료일' ,nullable: true})
    expectedCompletionDate: Date;
    
    @ApiProperty({ example: '담당자', description: '담당자' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20, comment: '담당자' ,nullable: true})
    employeeCode: string;

    @ApiProperty({ example: '담당자 이름', description: '담당자 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20, comment: '담당자 이름' ,nullable: true})
    employeeName: string;
    
    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20, comment: '비고' ,nullable: true})
    remark: string;
}