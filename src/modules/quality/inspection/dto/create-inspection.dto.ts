import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from "class-validator";

export class CreateInspectionDto {
    @ApiProperty({ example: 1, description: '생산 ID' })
    @IsNumber()
    @IsNotEmpty()
    productionId: number;

    @ApiProperty({ example: 'CRI001', description: '품질기준 코드' })
    @IsString()
    @IsNotEmpty()
    criteriaCode: string;

    @ApiProperty({ example: '치수정밀도', description: '품질기준명' })
    @IsString()
    @IsNotEmpty()
    criteriaName: string;

    @ApiProperty({ example: '치수', description: '품질기준 타입' })
    @IsString()
    @IsNotEmpty()
    criteriaType: string;

    @ApiProperty({ example: 100, description: '검사 수량' })
    @IsNumber()
    @IsNotEmpty()
    inspectionQuantity: number;

    @ApiProperty({ example: '2025-01-19', description: '검사일' })
    @IsDateString()
    @IsNotEmpty()
    inspectionDate: string;

    @ApiProperty({ example: '김검사', description: '검사자' })
    @IsString()
    @IsNotEmpty()
    inspector: string;

    @ApiProperty({ example: '검사 요청', description: '비고' })
    @IsString()
    @IsOptional()
    remark?: string;
}
