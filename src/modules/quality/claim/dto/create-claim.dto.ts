import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsPositive } from "class-validator";

export class CreateClaimDto {
    @ApiProperty({ example: 'CLM001', description: '클레임 코드 (자동 생성 시 생략 가능)' })
    @IsOptional()
    @IsString()
    claimCode?: string;

    @ApiProperty({ example: '2025-01-01', description: '클레임 접수일' })
    @IsNotEmpty()
    @IsDateString()
    claimDate: string;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    @IsNotEmpty()
    @IsString()
    customerCode: string;
    
    @ApiProperty({ example: 'ABC 회사', description: '고객명' })
    @IsNotEmpty()
    @IsString()
    customerName: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @IsNotEmpty()
    @IsString()
    projectCode: string;

    @ApiProperty({ example: '프로젝트 명', description: '프로젝트 명' })
    @IsNotEmpty()
    @IsString()
    projectName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @IsNotEmpty()
    @IsString()
    productCode: string;

    @ApiProperty({ example: '제품명', description: '품목명' })
    @IsNotEmpty()
    @IsString()
    productName: string;

    @ApiProperty({ example: 100, description: '클레임 수량' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    claimQuantity: number;

    @ApiProperty({ example: 100000, description: '클레임 금액' })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    claimPrice: number;

    @ApiProperty({ example: '불량품 교체 요청', description: '클레임 사유' })
    @IsNotEmpty()
    @IsString()
    claimReason: string;


    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    @IsNotEmpty()
    @IsString()
    employeeCode: string;

    @ApiProperty({ example: '홍길동', description: '담당자명' })
    @IsNotEmpty()
    @IsString()
    employeeName: string;

    @ApiProperty({ example: '2025-01-10', description: '예상 완료일' })
    @IsOptional()
    @IsDateString()
    expectedCompletionDate?: string;

    @ApiProperty({ example: '추가 비고사항', description: '비고' })
    @IsOptional()
    @IsString()
    remark?: string;
}
