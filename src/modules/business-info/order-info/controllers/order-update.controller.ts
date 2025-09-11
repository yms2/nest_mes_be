import { Body, Controller, Put, Patch, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrderUpdateService } from '../services/order-update.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { UpdateOrderInfoDto } from '../dto/update-order-info.dto';

@DevAuth()
@ApiTags('발주관리')
@Controller('order-update')
export class OrderUpdateController {
    constructor(private readonly orderUpdateService: OrderUpdateService) {}

    @Put('update/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: '발주 정보 수정',
        description: '발주 정보를 수정합니다. customer_code와 customer_name을 포함하여 수정할 수 있습니다. 수량 변경 시 가격이 자동으로 재계산됩니다.'
    })
    @ApiParam({ name: 'id', description: '발주 ID', example: 1 })
    @ApiBody({ type: UpdateOrderInfoDto })
    @ApiResponse({ 
        status: 200, 
        description: '발주 정보 수정 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '발주 정보가 성공적으로 수정되었습니다.' },
                orderInfo: { type: 'object', description: '수정된 발주 정보' }
            }
        }
    })
    async updateOrderInfo(
        @Param('id') id: number, 
        @Body() updateOrderInfoDto: UpdateOrderInfoDto, 
        @Req() req: any
    ) {
        const username = req.user?.username || 'system';
        return await this.orderUpdateService.updateOrderInfo(id, updateOrderInfoDto, username);
    }

    @Put('update-multiple-purchase-orders')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: '발주 아이템 일괄 수정',
        description: '여러 발주 아이템을 일괄적으로 수정합니다.'
    })
    @ApiBody({
        description: '수정할 발주 아이템 목록',
        schema: {
            type: 'object',
            properties: {
                updateItems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', description: '발주 아이템 ID', example: 1 },
                            data: { 
                                type: 'object', 
                                description: '수정할 데이터',
                                properties: {
                                    customerCode: { type: 'string', description: '거래처 코드' },
                                    customerName: { type: 'string', description: '거래처명' },
                                    orderName: { type: 'string', description: '발주명' },
                                    orderDate: { type: 'string', description: '발주일' },
                                    orderQuantity: { type: 'number', description: '발주수량 (변경 시 가격 자동 재계산)' },
                                    unitPrice: { type: 'number', description: '단가' },
                                    deliveryDate: { type: 'string', description: '입고예정일' },
                                    approvalInfo: { type: 'string', description: '승인정보 (대기/승인/반려)' },
                                    remark: { type: 'string', description: '비고' },
                                    projectCode: { type: 'string', description: '프로젝트 코드' },
                                    projectName: { type: 'string', description: '프로젝트명' },
                                    projectVersion: { type: 'string', description: '프로젝트 버전' },
                                    productCode: { type: 'string', description: '품목 코드' },
                                    productName: { type: 'string', description: '품목명' },
                                    usePlanQuantity: { type: 'number', description: '사용계획량' },
                                    supplyPrice: { type: 'number', description: '공급가액' },
                                    vat: { type: 'number', description: '부가세' },
                                    total: { type: 'number', description: '합계' },
                                    discountAmount: { type: 'number', description: '할인금액' },
                                    totalAmount: { type: 'number', description: '총액' },
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
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '발주 아이템 일괄 수정 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '발주 아이템 일괄 수정 완료: 성공 2개, 실패 0개' },
                updatedItems: { type: 'array', description: '수정된 발주 아이템 목록' },
                failedItems: { type: 'array', description: '수정 실패한 아이템 목록' },
                successCount: { type: 'number', example: 2 },
                failCount: { type: 'number', example: 0 }
            }
        }
    })
    async updateMultiplePurchaseOrderItems(
        @Body() body: { updateItems: Array<{id: number, data: any}> }, 
        @Req() req: any
    ) {
        const username = req.user?.username || 'system';
        return await this.orderUpdateService.updateMultiplePurchaseOrderItems(body.updateItems, username);
    }
}
