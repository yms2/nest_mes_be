import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';

export class UpdateDeliveryDto {
    @ApiProperty({
        example: '2025-01-15',
        description: '납품일',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품일은 문자열이어야 합니다.' })
    deliveryDate?: string;

    @ApiProperty({
        example: 'CUS001',
        description: '거래처 코드',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '거래처 코드는 문자열이어야 합니다.' })
    customerCode?: string;

    @ApiProperty({
        example: '거래처명',
        description: '거래처명',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '거래처명은 문자열이어야 합니다.' })
    customerName?: string;

    @ApiProperty({
        example: 'PROD001',
        description: '품목 코드',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    productCode?: string;

    @ApiProperty({
        example: '품목명',
        description: '품목명',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '품목명은 문자열이어야 합니다.' })
    productName?: string;

    @ApiProperty({
        example: 'PRJ001',
        description: '프로젝트 코드',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '프로젝트 코드는 문자열이어야 합니다.' })
    projectCode?: string;

    @ApiProperty({
        example: '프로젝트명',
        description: '프로젝트명',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '프로젝트명은 문자열이어야 합니다.' })
    projectName?: string;

    @ApiProperty({
        example: '신규/AS',
        description: '수주 유형',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '수주 유형은 문자열이어야 합니다.' })
    orderType?: string;

    @ApiProperty({
        example: 50,
        description: '납품 수량',
        required: false,
    })
    @IsOptional()
    @IsNumber({}, { message: '납품 수량은 숫자여야 합니다.' })
    @Min(1, { message: '납품 수량은 1 이상이어야 합니다.' })
    deliveryQuantity?: number;

    @ApiProperty({
        example: '납품완료',
        description: '납품 상태',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품 상태는 문자열이어야 합니다.' })
    deliveryStatus?: string;

    @ApiProperty({
        example: '비고',
        description: '비고',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '비고는 문자열이어야 합니다.' })
    remark?: string;
}
