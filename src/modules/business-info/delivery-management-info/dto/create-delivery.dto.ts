import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateDeliveryFromShippingDto {
    @ApiProperty({
        example: 'SHP20250909001',
        description: '출하코드',
        required: true,
    })
    @IsString({ message: '출하코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '출하코드는 필수입니다.' })
    shippingCode: string;

    @ApiProperty({
        example: 50,
        description: '납품 수량',
        required: true,
    })
    @IsNumber({}, { message: '납품 수량은 숫자여야 합니다.' })
    @IsNotEmpty({ message: '납품 수량은 필수입니다.' })
    @Min(1, { message: '납품 수량은 1 이상이어야 합니다.' })
    deliveryQuantity: number;

    @ApiProperty({
        example: '2025-01-15',
        description: '납품일',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품일은 문자열이어야 합니다.' })
    @IsDateString({}, { message: '납품일은 유효한 날짜 형식이어야 합니다.' })
    deliveryDate?: string;

    @ApiProperty({
        example: '납품완료',
        description: '납품 상태',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품 상태는 문자열이어야 합니다.' })
    deliveryStatus?: string;

    @ApiProperty({
        example: '긴급 납품',
        description: '비고',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '비고는 문자열이어야 합니다.' })
    remark?: string;
}

export class CreateDeliveryWithoutShippingDto {
    @ApiProperty({
        example: 'CUS001',
        description: '거래처 코드',
        required: true,
    })
    @IsString({ message: '거래처 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '거래처 코드는 필수입니다.' })
    customerCode: string;

    @ApiProperty({
        example: '고객사',
        description: '거래처 명',
        required: true,
    })
    @IsString({ message: '거래처 명은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '거래처 명은 필수입니다.' })
    customerName: string;

    @ApiProperty({
        example: 'PRD001',
        description: '품목 코드',
        required: true,
    })
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '품목 코드는 필수입니다.' })
    productCode: string;

    @ApiProperty({
        example: '제품명',
        description: '품목 명',
        required: true,
    })
    @IsString({ message: '품목 명은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '품목 명은 필수입니다.' })
    productName: string;

    @ApiProperty({
        example: 'PRJ001',
        description: '프로젝트 코드',
        required: true,
    })
    @IsString({ message: '프로젝트 코드는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '프로젝트 코드는 필수입니다.' })
    projectCode: string;

    @ApiProperty({
        example: '프로젝트명',
        description: '프로젝트 명',
        required: true,
    })
    @IsString({ message: '프로젝트 명은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '프로젝트 명은 필수입니다.' })
    projectName: string;

    @ApiProperty({
        example: 50,
        description: '납품 수량',
        required: true,
    })
    @IsNumber({}, { message: '납품 수량은 숫자여야 합니다.' })
    @IsNotEmpty({ message: '납품 수량은 필수입니다.' })
    @Min(1, { message: '납품 수량은 1 이상이어야 합니다.' })
    deliveryQuantity: number;

    @ApiProperty({
        example: '2025-01-15',
        description: '납품일',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품일은 문자열이어야 합니다.' })
    @IsDateString({}, { message: '납품일은 유효한 날짜 형식이어야 합니다.' })
    deliveryDate?: string;

    @ApiProperty({
        example: '납품완료',
        description: '납품 상태',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '납품 상태는 문자열이어야 합니다.' })
    deliveryStatus?: string;

    @ApiProperty({
        example: '긴급 납품',
        description: '비고',
        required: false,
    })
    @IsOptional()
    @IsString({ message: '비고는 문자열이어야 합니다.' })
    remark?: string;
}
