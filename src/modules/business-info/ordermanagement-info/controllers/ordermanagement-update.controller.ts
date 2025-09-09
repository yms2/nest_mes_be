import { Controller, Put, Param, Body, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderManagementUpdateService } from '../services/ordermanagement-update.service';
import { UpdateOrderManagementDto } from '../dto/ordermanagement-update.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('수주관리')
@DevAuth()
@Controller('order-management')
export class OrderManagementUpdateController {
    constructor(
        private readonly orderManagementUpdateService: OrderManagementUpdateService,
    ) {}

    /**
     * ID를 통해 수주 정보를 수정합니다.
     */
    @Put(':id')
    @ApiOperation({ 
        summary: '수주 정보 수정', 
        description: 'ID를 통해 수주 정보를 수정합니다. 수정하고 싶은 필드만 전송하면 됩니다.' 
    })
    @ApiParam({ 
        name: 'id', 
        description: '수정할 수주의 ID', 
        example: 1 
    })
    @ApiBody({ 
        type: UpdateOrderManagementDto,
        description: '수정할 수주 데이터',
        examples: {
            '전체 업데이트': {
                summary: '수주 정보 전체 업데이트',
                value: {
                    customerCode: 'CUS002',
                    customerName: 'LG전자',
                    projectCode: 'PRJ002',
                    projectName: '스마트TV 개발',
                    productCode: 'PRD002',
                    productName: 'OLED TV 55인치',
                    orderType: '수정',
                    quantity: 200,
                    unitPrice: 1500,
                    supplyPrice: 300000,
                    vat: 30000,
                    total: 330000,
                    orderDate: '2025-02-01',
                    deliveryDate: '2025-02-15',
                    estimateCode: 'EST002',
                    remark: '긴급 주문 - 우선 처리'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '수주 정보 수정 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                orderCode: { type: 'string', example: 'ORD001' },
                customerCode: { type: 'string', example: 'CUS001' },
                customerName: { type: 'string', example: '삼성전자' },
                projectCode: { type: 'string', example: 'PRJ001' },
                projectName: { type: 'string', example: '스마트폰 개발' },
                productCode: { type: 'string', example: 'PRD001' },
                productName: { type: 'string', example: '갤럭시 S25' },
                orderType: { type: 'string', example: '신규' },
                quantity: { type: 'number', example: 100 },
                unitPrice: { type: 'string', example: '1000' },
                supplyPrice: { type: 'string', example: '100000' },
                vat: { type: 'string', example: '10000' },
                total: { type: 'string', example: '110000' },
                orderDate: { type: 'string', format: 'date', example: '2025-01-01' },
                deliveryDate: { type: 'string', format: 'date', example: '2025-01-15' },
                estimateCode: { type: 'string', example: 'EST001' },
                remark: { type: 'string', example: '긴급 주문' },
                createdBy: { type: 'string', example: 'admin' },
                updatedBy: { type: 'string', example: 'admin' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: '잘못된 요청 데이터',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: '수량은 0보다 커야 합니다.' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: '수주를 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'ID 1인 수주를 찾을 수 없습니다.' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: '인증되지 않은 사용자',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    async updateOrderManagement(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrderManagementDto: UpdateOrderManagementDto,
        @Request() req: any,
    ) {
        const updatedBy = req.user?.username || 'unknown';
        return await this.orderManagementUpdateService.updateOrderManagement(
            id,
            updateOrderManagementDto,
            updatedBy,
        );
    }
}


