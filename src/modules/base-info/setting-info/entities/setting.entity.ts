import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('basecode')
export class BaseCode extends BaseEntity {
    @ApiProperty({ example: 'basecode', description: '기본 코드' })
    @Column({ name: 'base_code', type: 'varchar', length: 50, comment: '기본 코드' })
    baseCode: string;

    @ApiProperty({ example: 'basecode', description: '기본 코드명' })
    @Column({ name: 'base_code_name', type: 'varchar', length: 50, comment: '기본 코드명' })
    baseCodeName: string;

    @ApiProperty({ 
        type: () => [SubCode], 
        description: '서브 코드 목록',
        isArray: true 
    })
    @OneToMany(() => SubCode, (subCode) => subCode.baseCode)
    subCodes: SubCode[];
}
    
@Entity('subcode')
export class SubCode extends BaseEntity {
    @ApiProperty({ example: 1, description: '기본 코드 ID' })
    @Column({ name: 'base_code_id', type: 'int', comment: '기본 코드 ID' })
    baseCodeId: number;

    @ApiProperty({ example: 'subcode', description: '서브 코드' })
    @Column({ name: 'sub_code', type: 'varchar', length: 50, comment: '서브 코드' })
    subCode: string;

    @ApiProperty({ example: 'subcode', description: '서브 코드명' })
    @Column({ name: 'sub_code_name', type: 'varchar', length: 50, comment: '서브 코드명' })
    subCodeName: string;

    @ApiProperty({ example: 'subcode', description: '서브 코드 설명' })
    @Column({ name: 'sub_code_description', type: 'varchar', length: 50, comment: '서브 코드 설명' })
    subCodeDescription: string;

    @ManyToOne(() => BaseCode, (baseCode) => baseCode.subCodes)
    @JoinColumn({ name: 'base_code_id' })
    baseCode: BaseCode;
}
