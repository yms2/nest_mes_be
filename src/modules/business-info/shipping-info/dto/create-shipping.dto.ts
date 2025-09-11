import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateShippingDto {
    @ApiProperty({ 
        example: 'ORD20250109001', 
        description: '수주코드',
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    orderCode: string;

    @ApiProperty({ 
        example: 100, 
        description: '출하 지시 수량',
        required: true 
    })
    @IsNumber()
    @Min(0)
    shippingOrderQuantity: number;

    @ApiProperty({ 
        example: 'EMP001', 
        description: '사원코드',
        required: false 
    })
    @IsString()
    @IsOptional()
    employeeCode?: string;

    @ApiProperty({ 
        example: '홍길동', 
        description: '사원명',
        required: false 
    })
    @IsString()
    @IsOptional()
    employeeName?: string;

    @ApiProperty({ 
        example: '긴급 출하', 
        description: '비고',
        required: false 
    })
    @IsString()
    @IsOptional()
    remark?: string;
}
