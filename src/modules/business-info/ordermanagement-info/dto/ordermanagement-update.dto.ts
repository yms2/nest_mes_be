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

<<<<<<< HEAD
    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드', required: false })
=======
    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsString()
    projectCode?: string;

<<<<<<< HEAD
    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름', required: false })
=======
    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsString()
    projectName?: string;

<<<<<<< HEAD
    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전', required: false })
=======
    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsString()
    projectVersion?: string;

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

<<<<<<< HEAD
    @ApiProperty({ example: '2025-01-01', description: '수주 일자', required: false })
=======
    @ApiProperty({ example: '2025-01-01', description: '수주 일자', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsDateString()
    orderDate?: string;

<<<<<<< HEAD
    @ApiProperty({ example: '2025-01-15', description: '납기예정일', required: false })
=======
    @ApiProperty({ example: '2025-01-15', description: '납기예정일', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

<<<<<<< HEAD
    @ApiProperty({ example: 'EST001', description: '견적코드', required: false })
=======
    @ApiProperty({ example: 'EST001', description: '견적코드', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsString()
    estimateCode?: string;

<<<<<<< HEAD
    @ApiProperty({ example: '긴급 주문', description: '비고', required: false })
=======
    @ApiProperty({ example: '긴급 주문', description: '비고', required: true })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    @IsOptional()
    @IsString()
    remark?: string;
}
