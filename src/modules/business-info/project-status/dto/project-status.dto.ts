import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

// 프로젝트 현황 조회 요청 DTO
export class ProjectStatusQueryDto {
    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드', required: false })
    @IsOptional()
    @IsString()
    projectCode?: string;

    @ApiProperty({ example: '2025-01-01', description: '시작일', required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ example: '2025-12-31', description: '종료일', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

// 수주 정보 DTO
export class OrderManagementInfoDto {
    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    orderCode: string;

    @ApiProperty({ example: '2025-01-01', description: '수주 일자' })
    orderDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    customerCode: string;

    @ApiProperty({ example: '고객 이름', description: '고객 이름' })
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름' })
    productName: string;

    @ApiProperty({ example: '신규/AS', description: '신규/AS' })
    orderType: string;

    @ApiProperty({ example: 100, description: '수량' })
    quantity: number;

    @ApiProperty({ example: '100', description: '단가' })
    unitPrice: string;

    @ApiProperty({ example: '100', description: '공급가액' })
    supplyPrice: string;

    @ApiProperty({ example: '100', description: '부가세' })
    vat: string;

    @ApiProperty({ example: '100', description: '합계' })
    total: string;

    @ApiProperty({ example: '2025-01-01', description: '납기예정일' })
    deliveryDate: Date;

    @ApiProperty({ example: '승인', description: '승인 정보' })
    approvalInfo: string;
}

// 발주 정보 DTO
export class OrderMainInfoDto {
    @ApiProperty({ example: 'ORD001', description: '발주 코드' })
    orderCode: string;

    @ApiProperty({ example: 'CUST001', description: '거래처 코드' })
    customerCode: string;

    @ApiProperty({ example: '삼성전자', description: '거래처명' })
    customerName: string;

    @ApiProperty({ example: '갤럭시 S25 부품 발주', description: '발주명' })
    orderName: string;

    @ApiProperty({ example: '2025-01-15', description: '발주일' })
    orderDate: Date;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '디스플레이 모듈', description: '품목명' })
    productName: string;

    @ApiProperty({ example: 100, description: '발주수량' })
    orderQuantity: number;

    @ApiProperty({ example: 50000, description: '단가' })
    unitPrice: number;

    @ApiProperty({ example: 5000000, description: '공급가액' })
    supplyPrice: number;

    @ApiProperty({ example: 500000, description: '부가세' })
    vat: number;

    @ApiProperty({ example: 5500000, description: '총액' })
    totalAmount: number;

    @ApiProperty({ example: '2025-01-20', description: '입고예정일' })
    deliveryDate: Date;

    @ApiProperty({ example: '승인정보', description: '승인정보' })
    approvalInfo: string;
}

// 생산계획 정보 DTO
export class ProductionPlanInfoDto {
    @ApiProperty({ example: 'PP001', description: '생산 계획 코드' })
    productionPlanCode: string;

    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    orderCode: string;

    @ApiProperty({ example: '2025-01-01', description: '생산 계획 일자' })
    productionPlanDate: Date;

    @ApiProperty({ example: '신규/AS', description: '신규/AS' })
    orderType: string;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    customerCode: string;

    @ApiProperty({ example: '고객 이름', description: '고객 이름' })
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '품목 이름', description: '품목 이름' })
    productName: string;

    @ApiProperty({ example: 100, description: '계획 수량' })
    plannedQuantity: number;

    @ApiProperty({ example: '2025-01-01', description: '계획 시작일' })
    plannedStartDate: Date;

    @ApiProperty({ example: '2025-01-31', description: '계획 완료일' })
    plannedEndDate: Date;
}

// 출하 정보 DTO
export class ShippingInfoDto {
    @ApiProperty({ example: 'SHP001', description: '출하 코드' })
    shippingCode: string;

    @ApiProperty({ example: '2025-01-01', description: '출하 일자' })
    shippingDate: Date;

    @ApiProperty({ example: 'ORD001', description: '수주 코드' })
    orderCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '제품명', description: '품목명' })
    productName: string;

    @ApiProperty({ example: 100, description: '재고 수량' })
    inventoryQuantity: number;

    @ApiProperty({ example: 100, description: '출하 지시 수량' })
    shippingOrderQuantity: number;

    @ApiProperty({ example: '지시 완료', description: '상태' })
    shippingStatus: string;

    @ApiProperty({ example: '100', description: '단가' })
    unitPrice: string;

    @ApiProperty({ example: '100', description: '공급가액' })
    supplyPrice: string;

    @ApiProperty({ example: '100', description: '부가세' })
    vat: string;

    @ApiProperty({ example: '100', description: '합계' })
    total: string;

    @ApiProperty({ example: 'EMP001', description: '사원 코드' })
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    employeeName: string;
}

// 입고 정보 DTO
export class ReceivingInfoDto {
    @ApiProperty({ example: 'RCV001', description: '입고 코드' })
    receivingCode: string;

    @ApiProperty({ example: '2025-01-01', description: '입고 일자' })
    receivingDate: Date;

    @ApiProperty({ example: 'ORD001', description: '발주 코드' })
    orderCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: 'CUS001', description: '거래처 코드' })
    customerCode: string;

    @ApiProperty({ example: '거래처 명', description: '거래처 명' })
    customerName: string;

    @ApiProperty({ example: '품목 명', description: '품목 명' })
    productName: string;

    @ApiProperty({ example: 100, description: '입고수량' })
    quantity: number;

    @ApiProperty({ example: 100, description: '미입고수량' })
    unreceivedQuantity: number;

    @ApiProperty({ example: 'LOT001', description: 'LOT 코드' })
    lotCode: string;

    @ApiProperty({ example: '창고 코드', description: '창고 코드' })
    warehouseCode: string;

    @ApiProperty({ example: '창고 명', description: '창고 명' })
    warehouseName: string;

    @ApiProperty({ example: 100, description: '단가' })
    unitPrice: number;

    @ApiProperty({ example: 100, description: '공급가액' })
    supplyPrice: number;

    @ApiProperty({ example: 100, description: '부가세' })
    vat: number;

    @ApiProperty({ example: 100, description: '합계' })
    total: number;

    @ApiProperty({ example: '승인', description: '승인상태' })
    approvalStatus: string;
}

// 납품 정보 DTO
export class DeliveryInfoDto {
    @ApiProperty({ example: 'DEL001', description: '납품 코드' })
    deliveryCode: string;

    @ApiProperty({ example: '2025-01-01', description: '납품 일자' })
    deliveryDate: Date;

    @ApiProperty({ example: 'SHP001', description: '출하 코드' })
    shippingCode: string;

    @ApiProperty({ example: 'CUS001', description: '거래처 코드' })
    customerCode: string;

    @ApiProperty({ example: 'CUS001', description: '거래처 명' })
    customerName: string;

    @ApiProperty({ example: 'PROD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: 'PROD001', description: '품목 명' })
    productName: string;

    @ApiProperty({ example: '신규/AS', description: '수주 유형' })
    orderType: string;

    @ApiProperty({ example: 100, description: '납품 수량' })
    deliveryQuantity: number;

    @ApiProperty({ example: '완료', description: '납품 상태' })
    deliveryStatus: string;
}

// 생산 정보 DTO
export class ProductionInfoDto {
    @ApiProperty({ example: 'PRO001', description: '생산 코드' })
    productionCode: string;

    @ApiProperty({ example: 'PI001', description: '생산 지시 코드' })
    productionInstructionCode: string;

    @ApiProperty({ example: 'PRD001', description: '제품 코드' })
    productCode: string;

    @ApiProperty({ example: '볼펜', description: '제품명' })
    productName: string;

    @ApiProperty({ example: '완제품', description: '제품 구분' })
    productType: string;

    @ApiProperty({ example: '0.7mm', description: '제품 규격' })
    productSize: string;

    @ApiProperty({ example: 100, description: '생산지시수량' })
    productionInstructionQuantity: number;

    @ApiProperty({ example: 10, description: '불량 수량' })
    productionDefectQuantity: number;

    @ApiProperty({ example: 100, description: '생산 완료 수량' })
    productionCompletionQuantity: number;

    @ApiProperty({ example: 'PRC001', description: '공정 코드' })
    productionProcessCode: string;

    @ApiProperty({ example: '절삭', description: '공정명' })
    productionProcessName: string;

    @ApiProperty({ example: '생산 완료', description: '생산 상태' })
    productionStatus: string;

    @ApiProperty({ example: '2025-01-01', description: '생산 시작일' })
    productionStartDate: Date;

    @ApiProperty({ example: '2025-01-01', description: '생산 완료일' })
    productionCompletionDate: Date;

    @ApiProperty({ example: 'EMP001', description: '담당자 코드' })
    employeeCode: string;

    @ApiProperty({ example: '사원 이름', description: '사원 이름' })
    employeeName: string;
}

// 클레임 정보 DTO
export class ClaimInfoDto {
    @ApiProperty({ example: 'CLM001', description: '클레임 코드' })
    claimCode: string;

    @ApiProperty({ example: '2025-01-01', description: '클레임 접수일' })
    claimDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    customerCode: string;

    @ApiProperty({ example: 'ABC 회사', description: '고객명' })
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '제품명', description: '품목명' })
    productName: string;

    @ApiProperty({ example: 100, description: '클레임 수량' })
    claimQuantity: number;

    @ApiProperty({ example: '불량', description: '클레임 유형' })
    claimType: string;

    @ApiProperty({ example: '처리중', description: '처리 상태' })
    claimStatus: string;
}

// 견적 정보 DTO
export class EstimateInfoDto {
    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    projectName: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    projectVersion: string;

    @ApiProperty({ example: 'EST001', description: '견적 코드' })
    estimateCode: string;

    @ApiProperty({ example: '견적명', description: '견적명' })
    estimateName: string;

    @ApiProperty({ example: '2025-01-01', description: '견적일' })
    estimateDate: Date;

    @ApiProperty({ example: 'CUS001', description: '고객 코드' })
    customerCode: string;

    @ApiProperty({ example: '고객명', description: '고객명' })
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '품목명', description: '품목명' })
    productName: string;

    @ApiProperty({ example: '규격', description: '품목 규격' })
    itemSpecification?: string;

    @ApiProperty({ example: 100, description: '수량' })
    quantity: number;

    @ApiProperty({ example: 50000, description: '견적가격' })
    estimatePrice: number;

    @ApiProperty({ example: '승인', description: '견적 상태' })
    estimateStatus: string;

    @ApiProperty({ example: '2025-01-01', description: '프로젝트 시작일' })
    projectStartDate?: Date;

    @ApiProperty({ example: '2025-12-31', description: '프로젝트 종료예정일' })
    projectEndDate?: Date;
}

// 프로젝트 현황 응답 DTO (견적 기준)
export class ProjectStatusResponseDto {
    @ApiProperty({ example: 'PRJ001', description: '프로젝트 코드' })
    projectCode: string;

    @ApiProperty({ example: '프로젝트 이름', description: '프로젝트 이름' })
    projectName: string;

    @ApiProperty({ example: 'v1.0', description: '프로젝트 버전' })
    projectVersion: string;

    @ApiProperty({ example: '2025-01-01', description: '견적일 (프로젝트 등록일)' })
    estimateDate: Date;

    @ApiProperty({ example: 'CUS001', description: '업체 코드' })
    customerCode: string;

    @ApiProperty({ example: '삼성전자', description: '업체명' })
    customerName: string;

    @ApiProperty({ example: 'PRD001', description: '품목 코드' })
    productCode: string;

    @ApiProperty({ example: '스마트폰', description: '품목명' })
    productName: string;

    @ApiProperty({ example: '128GB, 블랙', description: '품목 규격' })
    specification?: string;

    @ApiProperty({ example: '2025-01-01', description: '프로젝트 시작일' })
    projectStartDate?: Date | null;

    @ApiProperty({ example: '2025-12-31', description: '프로젝트 종료예정일' })
    projectEndDate?: Date | null;

    @ApiProperty({ example: '2025-01-15', description: '수주일' })
    orderDate?: Date | null;

    @ApiProperty({ example: '2025-01-15', description: '설계도 품목 BOM일 (수주일과 동일)' })
    bomDate?: Date | null;

    @ApiProperty({ example: '2025-01-20', description: '발주일' })
    orderMainDate?: Date | null;

    @ApiProperty({ example: '2025-02-01', description: '입고일' })
    receivingDate?: Date | null;

    @ApiProperty({ example: '2025-02-15', description: '생산계획일' })
    productionPlanDate?: Date | null;

    @ApiProperty({ example: '2025-03-01', description: '생산완료일' })
    productionCompleteDate?: Date | null;

    @ApiProperty({ example: '2025-03-05', description: '품질검사일' })
    qualityInspectionDate?: Date | null;

    @ApiProperty({ example: '2025-03-10', description: '출하지시일' })
    shippingDate?: Date | null;

    @ApiProperty({ example: '2025-03-15', description: '납품일' })
    deliveryDate?: Date | null;
}
