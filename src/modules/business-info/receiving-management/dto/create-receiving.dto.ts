import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, MaxLength } from "class-validator";

export class CreateReceivingDto {
    @ApiProperty({ example: '2025-01-01', description: '입고 일자', required: false })
    @IsOptional()
    @IsDateString({}, { message: '입고 일자는 올바른 날짜 형식이어야 합니다.' })
    receivingDate?: string;

    @ApiProperty({ example: 'ORD001_PRD001_1', description: '발주 코드', required: false })
    @IsOptional()
    @IsString({ message: '발주 코드는 문자열이어야 합니다.' })
    @MaxLength(30, { message: '발주 코드는 30자를 초과할 수 없습니다.' })
    orderCode?: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드', required: false })
    @IsOptional()
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '품목 코드는 20자를 초과할 수 없습니다.' })
    productCode?: string;

    @ApiProperty({ example: '품목명', description: '품목 명', required: false })
    @IsOptional()
    @IsString({ message: '품목 명은 문자열이어야 합니다.' })
    @MaxLength(20, { message: '품목 명은 20자를 초과할 수 없습니다.' })
    productName?: string;

    @ApiProperty({ example: 100, description: '입고수량', required: false })
    @IsOptional()
    @IsNumber({}, { message: '입고수량은 숫자여야 합니다.' })
    quantity?: number;

    @ApiProperty({ example: 'CUS001', description: '거래처 코드', required: false })
    @IsOptional()
    @IsString({ message: '거래처 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '거래처 코드는 20자를 초과할 수 없습니다.' })
    customerCode?: string;

    @ApiProperty({ example: '거래처명', description: '거래처 명', required: false })
    @IsOptional()
    @IsString({ message: '거래처 명은 문자열이어야 합니다.' })
    @MaxLength(20, { message: '거래처 명은 20자를 초과할 수 없습니다.' })
    customerName?: string;

    @ApiProperty({ example: 'EA', description: '단위', required: false })
    @IsOptional()
    @IsString({ message: '단위는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '단위는 20자를 초과할 수 없습니다.' })
    unit?: string;

    @ApiProperty({ example: 'WH001', description: '창고 코드', required: false })
    @IsOptional()
    @IsString({ message: '창고 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '창고 코드는 20자를 초과할 수 없습니다.' })
    warehouseCode?: string;
    
    @ApiProperty({ example: '메인창고', description: '창고 명', required: false })
    @IsOptional()
    @IsString({ message: '창고 명은 문자열이어야 합니다.' })
    @MaxLength(20, { message: '창고 명은 20자를 초과할 수 없습니다.' })
    warehouseName?: string;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드', required: false })
    @IsOptional()
    @IsString({ message: 'LOT 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: 'LOT 코드는 20자를 초과할 수 없습니다.' })
    lotCode?: string;

    @ApiProperty({ example: '입고비고', description: '비고', required: false })
    @IsOptional()
    @IsString({ message: '비고는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '비고는 20자를 초과할 수 없습니다.' })
    remark?: string;

    @ApiProperty({ example: '대기', description: '승인상태 (대기/승인/반려)', required: false })
    @IsOptional()
    @IsString({ message: '승인상태는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '승인상태는 20자를 초과할 수 없습니다.' })
    approvalStatus?: string;
}
