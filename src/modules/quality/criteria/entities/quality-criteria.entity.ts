import { Column, Entity } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class QualityCriteria extends BaseEntity {
    @ApiProperty({example: 'CRI001', description: '품질기준 코드'})
    @Column({name: 'criteria_code', type: 'varchar', length: 20, nullable: false})
    criteriaCode: string;

    @ApiProperty({example: '품질기준 이름', description: '품질기준 이름'})
    @Column({name: 'criteria_name', type: 'varchar', length: 20, nullable: false})
    criteriaName: string;

    @ApiProperty({example: '품질기준 타입', description: '품질기준 타입'})
    @Column({name: 'criteria_type', type: 'varchar', length: 20, nullable: false})
    criteriaType: string;

    @ApiProperty({example: '품질기준 설명', description: '품질기준 설명'})
    @Column({name: 'criteria_description', type: 'varchar', length: 20, nullable: true})
    criteriaDescription: string;
}

