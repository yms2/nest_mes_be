import { ApiProperty } from "@nestjs/swagger";
<<<<<<< HEAD
import { IsNotEmpty, IsString, IsOptional, MaxLength } from "class-validator";

export class CreateOrderMainDto {
    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성)' })
    @IsNotEmpty({ message: '수주 코드는 필수입니다.' })
    @IsString({ message: '수주 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '수주 코드는 20자를 초과할 수 없습니다.' })
    orderCode: string;
=======
import { IsNotEmpty, IsString, IsOptional, MaxLength, IsNumber, IsDateString } from "class-validator";

export class CreateOrderMainDto {
    @ApiProperty({ example: 'ORD001', description: '수주 코드 (자동 생성 가능)' })
    @IsOptional()
    @IsString({ message: '수주 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '수주 코드는 20자를 초과할 수 없습니다.' })
    orderCode?: string;

    @ApiProperty({ example: 'CUST001', description: '거래처 코드' })
    @IsOptional()
    @IsString({ message: '거래처 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '거래처 코드는 20자를 초과할 수 없습니다.' })
    customerCode?: string;

    @ApiProperty({ example: '삼성전자', description: '거래처명' })
    @IsOptional()
    @IsString({ message: '거래처명은 문자열이어야 합니다.' })
    @MaxLength(50, { message: '거래처명은 50자를 초과할 수 없습니다.' })
    customerName?: string;

    @ApiProperty({ example: 'PROJ001', description: '프로젝트 코드' })
    @IsOptional()
    @IsString({ message: '프로젝트 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '프로젝트 코드는 20자를 초과할 수 없습니다.' })
    projectCode?: string;

    @ApiProperty({ example: '스마트폰 개발', description: '프로젝트명' })
    @IsOptional()
    @IsString({ message: '프로젝트명은 문자열이어야 합니다.' })
    @MaxLength(50, { message: '프로젝트명은 50자를 초과할 수 없습니다.' })
    projectName?: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    @IsOptional()
    @IsString({ message: '프로젝트 버전은 문자열이어야 합니다.' })
    @MaxLength(20, { message: '프로젝트 버전은 20자를 초과할 수 없습니다.' })
    projectVersion?: string;

    @ApiProperty({ example: '갤럭시 S25 부품 발주', description: '발주명' })
    @IsOptional()
    @IsString({ message: '발주명은 문자열이어야 합니다.' })
    @MaxLength(100, { message: '발주명은 100자를 초과할 수 없습니다.' })
    orderName?: string;

    @ApiProperty({ example: '2025-01-15', description: '발주일' })
    @IsOptional()
    @IsDateString({}, { message: '발주일은 올바른 날짜 형식이어야 합니다.' })
    orderDate?: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    @IsOptional()
    @IsString({ message: '품목 코드는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '품목 코드는 20자를 초과할 수 없습니다.' })
    productCode?: string;

    @ApiProperty({ example: '디스플레이 모듈', description: '품목명' })
    @IsOptional()
    @IsString({ message: '품목명은 문자열이어야 합니다.' })
    @MaxLength(100, { message: '품목명은 100자를 초과할 수 없습니다.' })
    productName?: string;

    @ApiProperty({ example: 100, description: '발주수량' })
    @IsOptional()
    @IsNumber({}, { message: '발주수량은 숫자여야 합니다.' })
    orderQuantity?: number;

    @ApiProperty({ example: 50000, description: '단가' })
    @IsOptional()
    @IsNumber({}, { message: '단가는 숫자여야 합니다.' })
    unitPrice?: number;

    @ApiProperty({ example: 5000000, description: '공급가액' })
    @IsOptional()
    @IsNumber({}, { message: '공급가액은 숫자여야 합니다.' })
    supplyPrice?: number;

    @ApiProperty({ example: 500000, description: '부가세' })
    @IsOptional()
    @IsNumber({}, { message: '부가세는 숫자여야 합니다.' })
    vat?: number;

    @ApiProperty({ example: 5500000, description: '총액' })
    @IsOptional()
    @IsNumber({}, { message: '총액은 숫자여야 합니다.' })
    totalAmount?: number;

    @ApiProperty({ example: '2025-01-20', description: '입고예정일' })
    @IsOptional()
    @IsDateString({}, { message: '입고예정일은 올바른 날짜 형식이어야 합니다.' })
    deliveryDate?: string;
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04

    @ApiProperty({ example: '발주비고', description: '발주비고' })
    @IsOptional()
    @IsString({ message: '발주비고는 문자열이어야 합니다.' })
<<<<<<< HEAD
    @MaxLength(20, { message: '발주비고는 20자를 초과할 수 없습니다.' })
=======
    @MaxLength(200, { message: '발주비고는 200자를 초과할 수 없습니다.' })
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
    remark?: string;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    @IsOptional()
    @IsString({ message: '승인정보는 문자열이어야 합니다.' })
    @MaxLength(20, { message: '승인정보는 20자를 초과할 수 없습니다.' })
    approvalInfo?: string;
}
