import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderInfoService } from '../services/order-info.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { OrderCreateService } from '../services/order-create.service';
    
@DevAuth()
@ApiTags('발주관리')
@Controller('order-info')
export class OrderInfoController {
    constructor(
        private readonly orderInfoService: OrderInfoService,
        private readonly orderCreateService: OrderCreateService,
    ) {}

    @Get('bom-by-order/:orderCode')
    @ApiOperation({ 
        summary: '수주 코드로 BOM 조회',
        description: '수주 코드를 기반으로 BOM을 전개하고 발주 정보를 생성합니다.'
    })
    @ApiParam({ name: 'orderCode', description: '수주 코드', example: 'ORD20250101001' })
    @ApiResponse({ 
        status: 200, 
        description: 'BOM 조회 성공',
        schema: {
            type: 'object',
            properties: {
                orderManagement: { 
                    type: 'object', 
                    description: '수주 정보',
                    properties: {
                        orderCode: { type: 'string', description: '수주 코드' },
                        projectCode: { type: 'string', description: '프로젝트 코드' },
                        projectName: { type: 'string', description: '프로젝트명' },
                        projectVersion: { type: 'string', description: '프로젝트 버전' },
                        productCode: { type: 'string', description: '품목 코드' },
                        productName: { type: 'string', description: '품목명' },
                        quantity: { type: 'number', description: '수량' },
                        deliveryDate: { type: 'string', description: '납기일' }
                    }
                },
                bomItems: { type: 'array', description: 'BOM 아이템 목록' },
                purchaseOrderItems: { type: 'array', description: '발주 아이템 목록' },
                summary: { 
                    type: 'object', 
                    description: '요약 정보',
                    properties: {
                        orderCode: { type: 'string', description: '수주 코드' },
                        projectCode: { type: 'string', description: '프로젝트 코드' },
                        projectName: { type: 'string', description: '프로젝트명' },
                        projectVersion: { type: 'string', description: '프로젝트 버전' },
                        productCode: { type: 'string', description: '품목 코드' },
                        productName: { type: 'string', description: '품목명' },
                        quantity: { type: 'number', description: '수량' },
                        bomItemCount: { type: 'number', description: 'BOM 아이템 수' },
                        purchaseOrderItemCount: { type: 'number', description: '발주 아이템 수' },
                        totalAmount: { type: 'number', description: '총 금액' }
                    }
                }
            }
        }
    })
    async getBomByOrderCode(@Param('orderCode') orderCode: string) {
        return await this.orderInfoService.getBomByOrderCode(orderCode);
    }

    @Post('save-purchase-order')
    @ApiOperation({ 
        summary: '발주 아이템 저장',
        description: '생성된 발주 아이템을 데이터베이스에 저장합니다.'
    })
    @ApiBody({
        description: '발주 아이템 목록',
        schema: {
            type: 'object',
            properties: {
                purchaseOrderItems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            customerCode: { type: 'string', description: '거래처 코드' },
                            customerName: { type: 'string', description: '거래처명' },
                            orderCode: { type: 'string', description: '수주 코드' },
                            projectCode: { type: 'string', description: '프로젝트 코드' },
                            projectName: { type: 'string', description: '프로젝트명' },
                            projectVersion: { type: 'string', description: '프로젝트 버전' },
                            orderName: { type: 'string', description: '발주명' },
                            orderDate: { type: 'string', description: '발주일' },
                            productCode: { type: 'string', description: '품목 코드' },
                            productName: { type: 'string', description: '품목명' },
                            usePlanQuantity: { type: 'number', description: '사용계획량' },
                            orderQuantity: { type: 'number', description: '발주수량' },
                            unitPrice: { type: 'number', description: '단가' },
                            supplyPrice: { type: 'number', description: '공급가액' },
                            vat: { type: 'number', description: '부가세' },
                            total: { type: 'number', description: '합계' },
                            discountAmount: { type: 'number', description: '할인금액' },
                            totalAmount: { type: 'number', description: '총액' },
                            deliveryDate: { type: 'string', description: '입고예정일' },
                            approvalInfo: { type: 'string', description: '승인정보' },
                            remark: { type: 'string', description: '비고' },
                            bomLevel: { type: 'number', description: 'BOM 레벨' },
                            parentProductCode: { type: 'string', description: '상위 품목 코드' },
                            productType: { type: 'string', description: '품목 유형' },
                            productCategory: { type: 'string', description: '품목 카테고리' },
                            productOrderUnit: { type: 'string', description: '발주 단위' },
                            productInventoryUnit: { type: 'string', description: '재고 단위' },
                            taxType: { type: 'string', description: '세금 유형' },
                            productPriceSale: { type: 'number', description: '판매 단가' },
                            currentInventoryQuantity: { type: 'number', description: '현재 재고 수량' },
                            inventoryStatus: { type: 'string', description: '재고 상태' },
                            safeInventory: { type: 'number', description: '안전 재고' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: '발주 아이템 저장 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '저장 성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                savedCount: { type: 'number', description: '저장된 아이템 수' },
                orderCode: { type: 'string', description: '수주 코드' },
                projectCode: { type: 'string', description: '프로젝트 코드' },
                projectName: { type: 'string', description: '프로젝트명' },
                savedItems: { type: 'array', description: '저장된 아이템 목록' }
            }
        }
    })
    async savePurchaseOrderItems(@Body() body: { purchaseOrderItems: any[] }) {
        return await this.orderCreateService.savePurchaseOrderItems(body.purchaseOrderItems);
    }

    @Post('create-individual-order')
    @ApiOperation({ 
        summary: '개별 발주 생성',
        description: '개별 발주 정보를 직접 입력하여 발주를 생성합니다.'
    })
    @ApiBody({
        description: '개별 발주 정보',
        schema: {
            type: 'object',
            properties: {
                customerCode: { type: 'string', description: '거래처 코드', example: 'CUST001' },
                customerName: { type: 'string', description: '거래처명', example: '삼성전자' },
                orderCode: { type: 'string', description: '수주 코드 (자동생성 가능)', example: 'ORD20250101001' },
                projectCode: { type: 'string', description: '프로젝트 코드', example: 'PROJ001' },
                projectName: { type: 'string', description: '프로젝트명', example: '스마트폰 개발' },
                projectVersion: { type: 'string', description: '프로젝트 버전', example: 'v1.0' },
                orderName: { type: 'string', description: '발주명', example: '갤럭시 S25 부품 발주' },
                orderDate: { type: 'string', description: '발주일', example: '2025-01-15' },
                productCode: { type: 'string', description: '품목 코드', example: 'PROD001' },
                productName: { type: 'string', description: '품목명', example: '디스플레이 모듈' },
                usePlanQuantity: { type: 'number', description: '사용계획량', example: 100 },
                orderQuantity: { type: 'number', description: '발주수량', example: 100 },
                unitPrice: { type: 'number', description: '단가', example: 50000 },
                supplyPrice: { type: 'number', description: '공급가액', example: 5000000 },
                vat: { type: 'number', description: '부가세', example: 500000 },
                total: { type: 'number', description: '합계', example: 5500000 },
                discountAmount: { type: 'number', description: '할인금액', example: 0 },
                totalAmount: { type: 'number', description: '총액', example: 5500000 },
                deliveryDate: { type: 'string', description: '입고예정일', example: '2025-01-20' },
                approvalInfo: { type: 'string', description: '승인정보', example: '대기' },
                remark: { type: 'string', description: '비고', example: '긴급 발주' }
            },
            required: ['customerCode', 'customerName', 'projectCode', 'projectName', 'orderName', 'orderDate', 'productCode', 'productName', 'orderQuantity', 'unitPrice', 'supplyPrice', 'vat', 'total', 'deliveryDate']
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: '개별 발주 생성 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '생성 성공 여부' },
                message: { type: 'string', description: '결과 메시지' },
                orderInfo: { type: 'object', description: '생성된 발주 정보' }
            }
        }
    })
    async createIndividualOrder(@Body() orderData: any) {
        return await this.orderCreateService.createIndividualOrder(orderData);
    }
}
