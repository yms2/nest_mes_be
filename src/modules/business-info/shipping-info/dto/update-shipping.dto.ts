import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShippingDto {
    @ApiProperty({ 
        example: '지시완료', 
        description: '출하 상태',
        required: false
    })
    @IsOptional()
    @IsString()
    shippingStatus?: string;

    @ApiProperty({ 
        example: 50, 
        description: '출하 지시 수량',
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    shippingOrderQuantity?: number;

    @ApiProperty({ 
        example: 'EMP002', 
        description: '사원코드',
        required: false
    })
    @IsOptional()
    @IsString()
    employeeCode?: string;

    @ApiProperty({ 
        example: '김철수', 
        description: '사원명',
        required: false
    })
    @IsOptional()
    @IsString()
    employeeName?: string;

    @ApiProperty({ 
        example: '수정된 비고', 
        description: '비고',
        required: false
    })
    @IsOptional()
    @IsString()
    remark?: string;

    @ApiProperty({ 
        example: '2025-01-10', 
        description: '출하일',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsDateString()
    shippingDate?: string;

    @ApiProperty({ 
        example: 'ORD001', 
        description: '수주코드',
        required: false
    })
    @IsOptional()
    @IsString()
    orderCode?: string;

    @ApiProperty({ 
        example: 'PRJ001', 
        description: '프로젝트코드',
        required: false
    })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ 
        example: '프로젝트명', 
        description: '프로젝트명',
        required: false
    })
    @IsOptional()
    @IsString()
    projectName?: string;
}
