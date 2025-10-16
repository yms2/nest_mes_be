import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * 월별 클레임 건수 KPI 조회 요청 DTO
 */
export class ClaimCountKpiQueryDto {
    @ApiProperty({ 
        description: '조회 년월 (YYYY-MM 형식)',
        required: false 
    })
    @IsOptional()
    @IsString()
    yearMonth?: string;

    @ApiProperty({ 
        description: '시작일',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ 
        description: '종료일',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ 
        description: '고객 코드',
        required: false 
    })
    @IsOptional()
    @IsString()
    customerCode?: string;

    @ApiProperty({ 
        description: '프로젝트 코드',
        required: false 
    })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ 
        description: '클레임 상태',
        required: false 
    })
    @IsOptional()
    @IsString()
    claimStatus?: string;
}

/**
 * 월별 클레임 건수 KPI 응답 DTO
 */
export class ClaimCountKpiResponseDto {
    @ApiProperty({ description: '년월' })
    yearMonth: string;

    @ApiProperty({ description: '총 클레임 건수' })
    totalClaimCount: number;

    @ApiProperty({ description: '접수 상태 클레임 건수' })
    receivedCount: number;

    @ApiProperty({ description: '처리중 상태 클레임 건수' })
    processingCount: number;

    @ApiProperty({ description: '완료 상태 클레임 건수' })
    completedCount: number;

    @ApiProperty({ description: '취소 상태 클레임 건수' })
    cancelledCount: number;

    @ApiProperty({ description: '총 클레임 금액' })
    totalClaimAmount: number;

    @ApiProperty({ description: '전월 대비 증감률 (%)' })
    monthOverMonthChange: number;

    @ApiProperty({ description: '일평균 클레임 건수' })
    dailyAverageCount: number;
}

/**
 * 클레임 상세 정보 DTO
 */
export class ClaimDetailDto {
    @ApiProperty({ description: '클레임 코드' })
    claimCode: string;

    @ApiProperty({ description: '클레임 접수일' })
    claimDate: Date;

    @ApiProperty({ description: '고객 코드' })
    customerCode: string;

    @ApiProperty({ description: '고객명' })
    customerName: string;

    @ApiProperty({ description: '프로젝트 코드' })
    projectCode: string;

    @ApiProperty({ description: '프로젝트 명' })
    projectName: string;

    @ApiProperty({ description: '품목 코드' })
    productCode: string;

    @ApiProperty({ description: '품목명' })
    productName: string;

    @ApiProperty({ description: '클레임 수량' })
    claimQuantity: number;

    @ApiProperty({ description: '클레임 금액' })
    claimPrice: number;

    @ApiProperty({ description: '클레임 사유' })
    claimReason: string;

    @ApiProperty({ description: '클레임 상태' })
    claimStatus: string;

    @ApiProperty({ description: '담당자명' })
    employeeName: string;

    @ApiProperty({ description: '처리 완료일', required: false })
    completionDate?: Date;
}

/**
 * 클레임 건수 KPI 상세 응답 DTO
 */
export class ClaimCountKpiDetailResponseDto extends ClaimCountKpiResponseDto {
    @ApiProperty({ 
        type: [ClaimDetailDto], 
        description: '클레임 상세 목록' 
    })
    claimDetails: ClaimDetailDto[];
}
