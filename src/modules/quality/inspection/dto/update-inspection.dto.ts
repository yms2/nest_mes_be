import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsIn, IsNumber } from "class-validator";

export class UpdateInspectionDto {
    @ApiProperty({ example: 'CRI001', description: '품질기준 코드' })
    @IsString()
    @IsOptional()
    criteriaCode?: string;

    @ApiProperty({ example: '치수정밀도', description: '품질기준명' })
    @IsString()
    @IsOptional()
    criteriaName?: string;

    @ApiProperty({ example: '치수', description: '품질기준 타입' })
    @IsString()
    @IsOptional()
    criteriaType?: string;

    @ApiProperty({ example: 100, description: '검사 수량' })
    @IsNumber()
    @IsOptional()
    inspectionQuantity?: number;

    @ApiProperty({ example: '2025-01-19', description: '검사일' })
    @IsDateString()
    @IsOptional()
    inspectionDate?: string;

    @ApiProperty({ example: '김검사', description: '검사자' })
    @IsString()
    @IsOptional()
    inspector?: string;

    @ApiProperty({ example: 'PASS', description: '검사결과 (PASS/FAIL)' })
    @IsString()
    @IsIn(['PASS', 'FAIL'])
    @IsOptional()
    inspectionResult?: string;

    @ApiProperty({ example: 'PENDING', description: '검사 상태' })
    @IsString()
    @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    @IsOptional()
    inspectionStatus?: string;

    @ApiProperty({ example: '검사 완료', description: '비고' })
    @IsString()
    @IsOptional()
    remark?: string;
}
