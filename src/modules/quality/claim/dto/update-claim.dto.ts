import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, IsPositive } from "class-validator";

export class UpdateClaimDto {
    @ApiProperty({ example: '2025-01-20', description: '클레임 접수일', required: false })
    @IsOptional()
    @IsDateString()
    claimDate?: string;

    @ApiProperty({ example: 'CUS002', description: '고객 코드', required: false })
    @IsOptional()
    @IsString()
    customerCode?: string;
    
    @ApiProperty({ example: 'XYZ 회사', description: '고객명', required: false })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiProperty({ example: 'PRJ002', description: '프로젝트 코드', required: false })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ example: '프로젝트 B', description: '프로젝트 명', required: false })
    @IsOptional()
    @IsString()
    projectName?: string;

    @ApiProperty({ example: 'PRD002', description: '품목 코드', required: false })
    @IsOptional()
    @IsString()
    productCode?: string;

    @ApiProperty({ example: '제품 B', description: '품목명', required: false })
    @IsOptional()
    @IsString()
    productName?: string;

    @ApiProperty({ example: 20, description: '클레임 수량', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    claimQuantity?: number;

    @ApiProperty({ example: 200000, description: '클레임 금액', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    claimPrice?: number;

    @ApiProperty({ example: '수정된 클레임 사유', description: '클레임 사유', required: false })
    @IsOptional()
    @IsString()
    claimReason?: string;

    @ApiProperty({ example: '처리중', description: '클레임 상태', enum: ['접수', '처리중', '완료', '취소'], required: false })
    @IsOptional()
    @IsEnum(['접수', '처리중', '완료', '취소'])
    claimStatus?: string;

    @ApiProperty({ example: 'EMP002', description: '담당자 코드', required: false })
    @IsOptional()
    @IsString()
    employeeCode?: string;

    @ApiProperty({ example: '김철수', description: '담당자명', required: false })
    @IsOptional()
    @IsString()
    employeeName?: string;

    @ApiProperty({ example: '2025-01-15', description: '처리 완료일', required: false })
    @IsOptional()
    @IsDateString()
    completionDate?: string;

    @ApiProperty({ example: '교체 완료', description: '처리 결과', required: false })
    @IsOptional()
    @IsString()
    resolution?: string;

    @ApiProperty({ example: '2025-01-30', description: '예상 완료일', required: false })
    @IsOptional()
    @IsDateString()
    expectedCompletionDate?: string;

    @ApiProperty({ example: '수정된 비고사항', description: '비고', required: false })
    @IsOptional()
    @IsString()
    remark?: string;
}
