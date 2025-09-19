import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column } from "typeorm";

@Entity()
export class OrderMain extends BaseEntity {

    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성)' })
    @Column({ name: 'order_code', type: 'varchar', length: 20, unique: true })
    orderCode: string;

    @ApiProperty({ example: '발주비고', description: '발주비고' })
    @Column({ name: 'remark', type: 'varchar', length: 20 })
    remark: string;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @Column({ name: 'approval_info', type: 'varchar', length: 20 })
    approvalInfo: string;
}
