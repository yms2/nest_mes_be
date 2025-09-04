import { Controller, Delete, Param, ParseIntPipe, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderManagementDeleteService } from '../services/ordermanagement-delete.service';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { DevOrderManagementAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    user?: {
        username?: string;
        name?: string;
        id?: number;
    };
}

@ApiTags('주문관리')
@Controller('order-management')
export class OrderManagementDeleteController {
    constructor(
        private readonly orderManagementDeleteService: OrderManagementDeleteService,
    ) {}

    @Delete(':id')
    @DevOrderManagementAuth.delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '주문 삭제',
        description: '주문을 완전히 삭제합니다 (세부품목 포함).',
    })
    @ApiParam({ name: 'id', description: '주문 ID', type: Number })
    @ApiResponse({
        status: 200,
        description: '주문 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: '성공 메시지' },
                data: { $ref: '#/components/schemas/OrderManagement' }
            }
        }
    })
    async deleteOrderManagement(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<{ message: string; data: OrderManagement }> {
        const username = req.user?.username || req.user?.name || 'unknown';
        const deletedOrder = await this.orderManagementDeleteService.deleteOrderManagement(id, username);
        
        return {
            message: `주문(ID: ${id})이 성공적으로 삭제되었습니다.`,
            data: deletedOrder
        };
    }

    @Delete('batch')
    @DevOrderManagementAuth.delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '주문 일괄 삭제',
        description: '여러 주문을 일괄 삭제합니다.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: { type: 'array', items: { type: 'number' } },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: '주문 일괄 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: '성공 메시지' },
                data: { type: 'array', items: { $ref: '#/components/schemas/OrderManagement' } },
                count: { type: 'number', description: '삭제된 주문 수' }
            }
        }
    })
    async deleteMultipleOrderManagements(@Body() body: { ids: number[] }, @Req() req: AuthenticatedRequest): Promise<{ message: string; data: OrderManagement[]; count: number }> {
        const username = req.user?.username || req.user?.name || 'unknown';
        const deletedOrders = await this.orderManagementDeleteService.deleteMultipleOrderManagements(body.ids, username);
        
        return {
            message: `${deletedOrders.length}개의 주문이 성공적으로 삭제되었습니다.`,
            data: deletedOrders,
            count: deletedOrders.length
        };
    }
}


