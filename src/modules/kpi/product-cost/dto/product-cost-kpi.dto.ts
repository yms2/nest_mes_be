import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';

/**
 * 제품원가 KPI 조회 요청 DTO
 */
export class ProductCostKpiQueryDto {
    @ApiProperty({ 
        example: '2025-01', 
        description: '조회 년월 (YYYY-MM 형식)',
        required: false 
    })
    @IsOptional()
    @IsString()
    yearMonth?: string;

    @ApiProperty({ 
        example: '2025-01-01', 
        description: '시작일',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ 
        example: '2025-01-31', 
        description: '종료일',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ 
        example: 'PRD001', 
        description: '품목 코드',
        required: false 
    })
    @IsOptional()
    @IsString()
    productCode?: string;

    @ApiProperty({ 
        example: '밴딩기', 
        description: '품목명',
        required: false 
    })
    @IsOptional()
    @IsString()
    productName?: string;

    @ApiProperty({ 
        example: 'outsourcing', 
        description: '작업 유형 (outsourcing: 외주, inhouse: 내재화)',
        required: false 
    })
    @IsOptional()
    @IsString()
    workType?: string;
}

/**
 * 제품원가 KPI 응답 DTO
 */
export class ProductCostKpiResponseDto {
    @ApiProperty({ example: '2025-01', description: '년월' })
    yearMonth: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '밴딩기 제어모듈', description: '품목명' })
    productName: string;

    @ApiProperty({ example: 100, description: '월 작업 수량 (개)' })
    monthlyWorkQuantity: number;

    @ApiProperty({ example: 23000, description: '원재료 단가 (원)' })
    rawMaterialCost: number;

    @ApiProperty({ example: 10000, description: '외주 단가 (원)' })
    outsourcingCost: number;

    @ApiProperty({ example: 5000, description: '내재화 단가 (원)' })
    inhouseCost: number;

    @ApiProperty({ example: 3300000, description: '구축 전 총 원가 (원)' })
    beforeImplementationTotalCost: number;

    @ApiProperty({ example: 2800000, description: '구축 후 총 원가 (원)' })
    afterImplementationTotalCost: number;

    @ApiProperty({ example: 500000, description: '월 절감액 (원)' })
    monthlySavingAmount: number;

    @ApiProperty({ example: 15.15, description: '절감률 (%)' })
    savingRate: number;

    @ApiProperty({ example: 6000000, description: '연간 절감 예상액 (원)' })
    annualSavingAmount: number;

    @ApiProperty({ example: 'outsourcing', description: '현재 작업 유형' })
    currentWorkType: string;

    @ApiProperty({ example: '2025-01-15', description: '데이터 기준일' })
    dataDate: Date;
}

/**
 * 제품원가 상세 정보 DTO
 */
export class ProductCostDetailDto {
    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '밴딩기 제어모듈', description: '품목명' })
    productName: string;

    @ApiProperty({ example: '1kHz', description: '품목 규격' })
    specification: string;

    @ApiProperty({ example: 100, description: '월 작업 수량' })
    monthlyWorkQuantity: number;

    @ApiProperty({ example: 23000, description: '원재료 단가' })
    rawMaterialCost: number;

    @ApiProperty({ example: 10000, description: '외주 단가' })
    outsourcingCost: number;

    @ApiProperty({ example: 5000, description: '내재화 단가' })
    inhouseCost: number;

    @ApiProperty({ example: '2025-01-01', description: '적용 시작일' })
    effectiveStartDate: Date;

    @ApiProperty({ example: '2025-12-31', description: '적용 종료일', required: false })
    effectiveEndDate?: Date;

    @ApiProperty({ example: 'Y', description: '활성화 여부' })
    isActive: string;
}

/**
 * 제품원가 KPI 상세 응답 DTO
 */
export class ProductCostKpiDetailResponseDto extends ProductCostKpiResponseDto {
    @ApiProperty({ 
        type: [ProductCostDetailDto], 
        description: '제품원가 상세 목록' 
    })
    productCostDetails: ProductCostDetailDto[];
}

/**
 * 제품원가 절감 효과 요약 DTO
 */
export class ProductCostSavingSummaryDto {
    @ApiProperty({ example: 500000, description: '총 월 절감액 (원)' })
    totalMonthlySaving: number;

    @ApiProperty({ example: 6000000, description: '총 연간 절감액 (원)' })
    totalAnnualSaving: number;

    @ApiProperty({ example: 15.15, description: '평균 절감률 (%)' })
    averageSavingRate: number;

    @ApiProperty({ example: 5, description: '절감 대상 품목 수' })
    targetProductCount: number;

    @ApiProperty({ example: 1000, description: '총 월 작업 수량' })
    totalMonthlyWorkQuantity: number;

    @ApiProperty({ 
        type: [ProductCostKpiResponseDto], 
        description: '품목별 절감 효과 TOP 5' 
    })
    topSavingProducts: ProductCostKpiResponseDto[];
}

/**
 * 제품원가 입력/수정 DTO
 */
export class ProductCostInputDto {
    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @IsString()
    productCode: string;

    @ApiProperty({ example: '밴딩기 제어모듈', description: '품목명' })
    @IsString()
    productName: string;

    @ApiProperty({ example: '1kHz', description: '품목 규격' })
    @IsString()
    specification: string;

    @ApiProperty({ example: 100, description: '월 작업 수량 (개)' })
    @IsNumber()
    @Min(1)
    monthlyWorkQuantity: number;

    @ApiProperty({ example: 23000, description: '원재료 단가 (원)' })
    @IsNumber()
    @Min(0)
    rawMaterialCost: number;

    @ApiProperty({ example: 10000, description: '외주 단가 (원)' })
    @IsNumber()
    @Min(0)
    outsourcingCost: number;

    @ApiProperty({ example: 5000, description: '내재화 단가 (원)' })
    @IsNumber()
    @Min(0)
    inhouseCost: number;

    @ApiProperty({ example: '2025-01-01', description: '적용 시작일' })
    @IsDateString()
    effectiveStartDate: string;

    @ApiProperty({ example: '2025-12-31', description: '적용 종료일', required: false })
    @IsOptional()
    @IsDateString()
    effectiveEndDate?: string;

    @ApiProperty({ example: 'Y', description: '활성화 여부' })
    @IsString()
    isActive: string;
}
