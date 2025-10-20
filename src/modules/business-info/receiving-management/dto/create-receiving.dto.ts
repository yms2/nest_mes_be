import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, MaxLength, IsArray } from "class-validator";

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

    @ApiProperty({ example: 5, description: '불량수량', required: false })
    @IsOptional()
    @IsNumber({}, { message: '불량수량은 숫자여야 합니다.' })
    defectQuantity?: number;

    @ApiProperty({ 
        example: [{type: "파손", quantity: 2}, {type: "오염", quantity: 3}], 
        description: '불량 상세 정보 (유형별 수량)', 
        required: false 
    })
    @IsOptional()
    @IsArray({ message: '불량 상세 정보는 배열이어야 합니다.' })
    defectDetails?: Array<{type: string; quantity: number}>;

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

    @ApiProperty({ example: '1구역', description: '창고 구역', required: false })
    @IsOptional()
    @IsString({ message: '창고 구역은 문자열이어야 합니다.' })
    @MaxLength(20, { message: '창고 구역은 20자를 초과할 수 없습니다.' })
    warehouseZone?: string;

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

    @ApiProperty({ example: '2025-01-01', description: '수령일', required: false })
    @IsOptional()
    @IsDateString({}, { message: '수령일은 올바른 날짜 형식이어야 합니다.' })
    receivedDate?: string;

    @ApiProperty({ example: '공급업체명', description: '공급업체', required: false })
    @IsOptional()
    @IsString({ message: '공급업체는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '공급업체는 50자를 초과할 수 없습니다.' })
    supplier?: string;

    @ApiProperty({ example: 'BATCH001', description: '배치번호', required: false })
    @IsOptional()
    @IsString({ message: '배치번호는 문자열이어야 합니다.' })
    @MaxLength(30, { message: '배치번호는 30자를 초과할 수 없습니다.' })
    batchNumber?: string;

    @ApiProperty({ example: 'RCV001', description: '입고 코드 (자동 생성)', required: false })
    @IsOptional()
    @IsString({ message: '입고 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '입고 코드는 50자를 초과할 수 없습니다.' })
    receivingCode?: string;

    @ApiProperty({ example: 'PROJ001', description: '프로젝트 코드', required: false })
    @IsOptional()
    @IsString({ message: '프로젝트 코드는 문자열이어야 합니다.' })
    @MaxLength(50, { message: '프로젝트 코드는 50자를 초과할 수 없습니다.' })
    projectCode?: string;

    @ApiProperty({ example: '프로젝트명', description: '프로젝트명', required: false })
    @IsOptional()
    @IsString({ message: '프로젝트명은 문자열이어야 합니다.' })
    @MaxLength(50, { message: '프로젝트명은 50자를 초과할 수 없습니다.' })
    projectName?: string;

    @ApiProperty({ example: 0, description: '미입고 수량 (자동 계산)', required: false })
    @IsOptional()
    @IsNumber({}, { message: '미입고 수량은 숫자여야 합니다.' })
    unreceivedQuantity?: number;

    @ApiProperty({ example: 1000, description: '단가', required: false })
    @IsOptional()
    @IsNumber({}, { message: '단가는 숫자여야 합니다.' })
    unitPrice?: number;

    @ApiProperty({ example: 100000, description: '공급가액', required: false })
    @IsOptional()
    @IsNumber({}, { message: '공급가액은 숫자여야 합니다.' })
    supplyPrice?: number;

    @ApiProperty({ example: 10000, description: '부가세', required: false })
    @IsOptional()
    @IsNumber({}, { message: '부가세는 숫자여야 합니다.' })
    vat?: number;

    @ApiProperty({ example: 110000, description: '합계', required: false })
    @IsOptional()
    @IsNumber({}, { message: '합계는 숫자여야 합니다.' })
    total?: number;
}
