import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString, Min, IsEnum } from 'class-validator';

export class UpdateOrderManagementDto {
    @ApiProperty({ example: 'CUS001', description: '고객 코드', required: false })
    @IsOptional()
    @IsString()
    customerCode?: string;

    @ApiProperty({ example: '고객 이름', description: '고객 이름', required: false })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드', required: false })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름', required: false })
    @IsOptional()
    @IsString()
    projectName?: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드', required: false })
    @IsOptional()
    @IsString()
    productCode?: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름', required: false })
    @IsOptional()
    @IsString()
    productName?: string;

    @ApiProperty({ example: '신규/AS', description: '신규/AS', required: false })
    @IsOptional()
    @IsString()
    orderType?: string;

    @ApiProperty({ example: 100, description: '수량', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;

    @ApiProperty({ example: 1000, description: '단가', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    unitPrice?: number;

    @ApiProperty({ example: 100000, description: '공급가액', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    supplyPrice?: number;

    @ApiProperty({ example: 10000, description: '부가세', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    vat?: number;

    @ApiProperty({ example: 110000, description: '합계', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    total?: number;

    @ApiProperty({ example: '2025-01-01', description: '주문 일자', required: false })
    @IsOptional()
    @IsDateString()
    orderDate?: string;

    @ApiProperty({ example: '2025-01-15', description: '납기예정일', required: false })
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @ApiProperty({ example: 'EST001', description: '견적코드', required: false })
    @IsOptional()
    @IsString()
    estimateCode?: string;

    @ApiProperty({ example: '긴급 주문', description: '비고', required: false })
    @IsOptional()
    @IsString()
    remark?: string;
}
