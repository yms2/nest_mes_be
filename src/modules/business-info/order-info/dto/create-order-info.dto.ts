import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateOrderInfoDto {
    @ApiProperty({ example: 'ORD001', description: '발주 코드' })
    @IsString()
    orderCode: string;

    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    @IsString()
    projectCode: string;

    @ApiProperty({ example: '프로젝트명', description: '프로젝트명' })
    @IsString()
    projectName: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    @IsOptional()
    @IsString()
    projectVersion?: string;

    @ApiProperty({ example: '발주명', description: '발주명' })
    @IsString()
    orderName: string;

    @ApiProperty({ example: '2025-01-09', description: '발주일' })
    @IsDateString()
    orderDate: string;

    @ApiProperty({ example: 'CUST001', description: '발주처 코드' })
    @IsString()
    customerCode: string;

    @ApiProperty({ example: 'ABC 회사', description: '발주처명' })
    @IsString()
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    @IsString()
    productCode: string;

    @ApiProperty({ example: '품목명', description: '품목명' })
    @IsString()
    productName: string;

    @ApiProperty({ example: 100, description: '사용계획량' })
    @IsNumber()
    usePlanQuantity: number;

    @ApiProperty({ example: 100, description: '발주수량' })
    @IsNumber()
    orderQuantity: number;

    @ApiProperty({ example: 1000, description: '단가' })
    @IsNumber()
    unitPrice: number;

    @ApiProperty({ example: 100000, description: '공급가액' })
    @IsNumber()
    supplyPrice: number;

    @ApiProperty({ example: 10000, description: '부가세' })
    @IsNumber()
    vat: number;

    @ApiProperty({ example: 110000, description: '합계' })
    @IsNumber()
    total: number;

    @ApiProperty({ example: 0, description: '할인금액' })
    @IsOptional()
    @IsNumber()
    discountAmount?: number;

    @ApiProperty({ example: 110000, description: '총액' })
    @IsNumber()
    totalAmount: number;

    @ApiProperty({ example: '2025-12-31', description: '입고예정일' })
    @IsDateString()
    deliveryDate: string;

    @ApiProperty({ example: '대기', description: '승인정보' })
    @IsOptional()
    @IsString()
    approvalInfo?: string;

    @ApiProperty({ example: '비고', description: '비고' })
    @IsOptional()
    @IsString()
    remark?: string;

    @ApiProperty({ example: 1, description: 'BOM 레벨' })
    @IsOptional()
    @IsNumber()
    bomLevel?: number;

    @ApiProperty({ example: 'PRD000', description: '상위 품목 코드' })
    @IsOptional()
    @IsString()
    parentProductCode?: string;

    @ApiProperty({ example: '완제품', description: '품목 유형' })
    @IsOptional()
    @IsString()
    productType?: string;

    @ApiProperty({ example: '원재료', description: '품목 카테고리' })
    @IsOptional()
    @IsString()
    productCategory?: string;

    @ApiProperty({ example: 'EA', description: '발주 단위' })
    @IsOptional()
    @IsString()
    productOrderUnit?: string;

    @ApiProperty({ example: 'EA', description: '재고 단위' })
    @IsOptional()
    @IsString()
    productInventoryUnit?: string;

    @ApiProperty({ example: '과세', description: '세금 유형' })
    @IsOptional()
    @IsString()
    taxType?: string;

    @ApiProperty({ example: 1200, description: '판매 단가' })
    @IsOptional()
    @IsNumber()
    productPriceSale?: number;

    @ApiProperty({ example: 500, description: '현재 재고 수량' })
    @IsOptional()
    @IsNumber()
    currentInventoryQuantity?: number;

    @ApiProperty({ example: '정상', description: '재고 상태' })
    @IsOptional()
    @IsString()
    inventoryStatus?: string;

    @ApiProperty({ example: 50, description: '안전 재고' })
    @IsOptional()
    @IsNumber()
    safeInventory?: number;
}
