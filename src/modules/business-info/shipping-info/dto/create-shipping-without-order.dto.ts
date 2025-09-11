import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateShippingWithoutOrderDto {
    @ApiProperty({ 
        example: '2025-01-15', 
        description: '출하 일자',
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    shippingDate: string;

    @ApiProperty({ 
        example: 100, 
        description: '재고 수량',
        required: true 
    })
    @IsNumber()
    @Min(0)
    inventoryQuantity: number;

    @ApiProperty({ 
        example: 50, 
        description: '출하 지시 수량',
        required: true 
    })
    @IsNumber()
    @Min(0)
    shippingOrderQuantity: number;

    @ApiProperty({ 
        example: '지시 완료', 
        description: '출하 상태',
        required: false 
    })
    @IsString()
    @IsOptional()
    shippingStatus?: string;

    @ApiProperty({ 
        example: 100000, 
        description: '공급가액',
        required: false 
    })
    @IsNumber()
    @IsOptional()
    supplyPrice?: number;

    @ApiProperty({ 
        example: 10000, 
        description: '부가세',
        required: false 
    })
    @IsNumber()
    @IsOptional()
    vat?: number;

    @ApiProperty({ 
        example: 110000, 
        description: '합계',
        required: false 
    })
    @IsNumber()
    @IsOptional()
    total?: number;

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
