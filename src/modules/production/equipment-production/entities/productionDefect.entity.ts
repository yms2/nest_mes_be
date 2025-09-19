import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";

@Entity()
export class ProductionDefectQuantity extends BaseEntity {

    @ApiProperty({ example: 'BD001', description: '생산 불량 코드' })
    @Column({ name: 'production_defect_code', type: 'varchar', length: 20, comment: '생산 불량 코드' })
    productionDefectCode: string;

    @ApiProperty({ example: '10', description: '생산 불량 수량' })
    @Column({ name: 'production_defect_quantity', type: 'int', comment: '불량 수량' })
    productionDefectQuantity: number;

    @ApiProperty({ example: '불량 사유', description: '불량 사유' })
    @Column({ name: 'production_defect_reason', type: 'varchar', length: 20, comment: '불량 사유' })
    productionDefectReason: string;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @Column({ name: 'employee_code', type: 'varchar', length: 20, comment: '담당자 코드' ,nullable: true})
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    @Column({ name: 'employee_name', type: 'varchar', length: 20, comment: '사원 이름' ,nullable: true})
    employeeName: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @Column({ name: 'remark', type: 'varchar', length: 100, comment: '비고' ,nullable: true})
    remark: string;

}