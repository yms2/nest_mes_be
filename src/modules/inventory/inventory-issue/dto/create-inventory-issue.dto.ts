import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsDateString, MaxLength } from "class-validator";

export class CreateInventoryIssueDto {
    @ApiProperty({ example: '2025-01-15', description: '불출 일자', required: false })
    @IsOptional()
    @IsDateString({}, { message: '불출 일자는 올바른 날짜 형식이어야 합니다.' })
    issueDate?: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드', required: false })
    @IsOptional()
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '품목 코드는 50자를 초과할 수 없습니다.' })
    productCode?: string;

    @ApiProperty({ example: '배터리 팩', description: '품목명', required: false })
    @IsOptional()
    @IsString({ message: '품목명은 문자열이어야 합니다.' })
    @MaxLength(100, { message: '품목명은 100자를 초과할 수 없습니다.' })
    productName?: string;

    @ApiProperty({ example: 'EA', description: '단위', required: false })
    @IsOptional()
    @IsString({ message: '단위는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '단위는 20자를 초과할 수 없습니다.' })
    unit?: string;

    @ApiProperty({ example: 50, description: '불출 수량', required: false })
    @IsOptional()
    @IsNumber({}, { message: '불출 수량은 숫자여야 합니다.' })
    issueQuantity?: number;

    @ApiProperty({ example: 'WH001', description: '창고 코드', required: false })
    @IsOptional()
    @IsString({ message: '창고 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '창고 코드는 50자를 초과할 수 없습니다.' })
    warehouseCode?: string;

    @ApiProperty({ example: '메인창고', description: '창고명', required: false })
    @IsOptional()
    @IsString({ message: '창고명은 문자열이어야 합니다.' })
    @MaxLength(100, { message: '창고명은 100자를 초과할 수 없습니다.' })
    warehouseName?: string;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드', required: false })
    @IsOptional()
    @IsString({ message: 'LOT 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: 'LOT 코드는 50자를 초과할 수 없습니다.' })
    lotCode?: string;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드', required: false })
    @IsOptional()
    @IsString({ message: '담당자 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '담당자 코드는 50자를 초과할 수 없습니다.' })
    employeeCode?: string;

    @ApiProperty({ example: '홍길동', description: '담당자명', required: false })
    @IsOptional()
    @IsString({ message: '담당자명은 문자열이어야 합니다.' })
    @MaxLength(50, { message: '담당자명은 50자를 초과할 수 없습니다.' })
    employeeName?: string;

    @ApiProperty({ example: 'PROJ001', description: '프로젝트 코드', required: false })
    @IsOptional()
    @IsString({ message: '프로젝트 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '프로젝트 코드는 50자를 초과할 수 없습니다.' })
    projectCode?: string;

    @ApiProperty({ example: '프로젝트명', description: '프로젝트명', required: false })
    @IsOptional()
    @IsString({ message: '프로젝트명은 문자열이어야 합니다.' })
    @MaxLength(100, { message: '프로젝트명은 100자를 초과할 수 없습니다.' })
    projectName?: string;

    @ApiProperty({ example: '생산용', description: '불출 사유', required: false })
    @IsOptional()
    @IsString({ message: '불출 사유는 문자열이어야 합니다.' })
    @MaxLength(200, { message: '불출 사유는 200자를 초과할 수 없습니다.' })
    issueReason?: string;

    @ApiProperty({ example: '비고', description: '비고', required: false })
    @IsOptional()
    @IsString({ message: '비고는 문자열이어야 합니다.' })
    @MaxLength(500, { message: '비고는 500자를 초과할 수 없습니다.' })
    remark?: string;

    @ApiProperty({ example: '대기', description: '승인상태 (대기/승인/반려)', required: false })
    @IsOptional()
    @IsString({ message: '승인상태는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '승인상태는 20자를 초과할 수 없습니다.' })
    approvalStatus?: string;

    @ApiProperty({ example: 'ISS001', description: '불출 코드 (자동 생성)', required: false })
    @IsOptional()
    @IsString({ message: '불출 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '불출 코드는 50자를 초과할 수 없습니다.' })
    issueCode?: string;
}
