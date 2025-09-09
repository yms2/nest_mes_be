import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateOrderManagementDto {

    @ApiProperty({ example: '2025-01-01', description: '수주 일자' })
    @IsNotEmpty()
    @IsDateString()
    orderDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    @IsNotEmpty()
    @IsString()
    customerCode: string;
    
    @ApiProperty({ example: '고객 이름', description: '고객 이름' })
    @IsNotEmpty()
    @IsString()
    customerName: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @IsNotEmpty()
    @IsString()
    projectCode: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    @IsNotEmpty()
    @IsString()
    projectName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @IsNotEmpty()
    @IsString()
    productCode: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름' })
    @IsNotEmpty()
    @IsString()
    productName: string;

    @ApiProperty({ example: '신규/AS', description: '신규/AS' })
    @IsNotEmpty()
    @IsString()
    orderType: string;

    @ApiProperty({ example: 100, description: '수량' })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 100000, description: '단가' })
    @IsNotEmpty()
    @IsNumber()
    unitPrice: number;

    @ApiProperty({ example: 10000000, description: '공급가액' })
    @IsNotEmpty()
    @IsNumber()
    supplyPrice: number;

    @ApiProperty({ example: 1000000, description: '부가세' })
    @IsNotEmpty()
    @IsNumber()
    vat: number;

    @ApiProperty({ example: 11000000, description: '합계' })
    @IsNotEmpty()
    @IsNumber()
    total: number;

    @ApiProperty({ example: '2025-01-01', description: '납기예정일' })
    @IsNotEmpty()
    @IsDateString()
    deliveryDate: Date;

    @ApiProperty({ example: 'EST001', description: '견적코드' })
    @IsOptional()
    @IsString()
    estimateCode?: string;

    @ApiProperty({ example: '비고사항', description: '비고' })
    @IsOptional()
    @IsString()
    remark?: string;
}
