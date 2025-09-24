import { Controller, Get, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderApprovalService } from '../services/order-approval.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { Request } from 'express';

@DevAuth()
@ApiTags('발주관리 승인')
@Controller('order-approval')
export class OrderApprovalController {
    constructor(private readonly orderApprovalService: OrderApprovalService) {}

    @Get('pending')
    @ApiOperation({
        summary: '승인 대기 발주 목록 조회',
        description: '승인 대기 중인 발주 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 20)' })
    @ApiResponse({
        status: 200,
        description: '승인 대기 발주 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '승인 대기 발주 목록을 성공적으로 조회했습니다.' },
                data: {
                    type: 'object',
                    properties: {
                        orders: {
                            type: 'array',
                            description: '승인 대기 발주 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', description: '발주 ID' },
                                    orderCode: { type: 'string', description: '발주 코드' },
                                    productName: { type: 'string', description: '제품명' },
                                    orderQuantity: { type: 'number', description: '발주 수량' },
                                    totalAmount: { type: 'number', description: '총액' },
                                    approvalInfo: { type: 'string', description: '승인 상태' },
                                    createdAt: { type: 'string', description: '생성일시' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number', description: '현재 페이지' },
                                limit: { type: 'number', description: '페이지당 항목 수' },
                                total: { type: 'number', description: '전체 항목 수' },
                                totalPages: { type: 'number', description: '전체 페이지 수' }
                            }
                        }
                    }
                }
            }
        }
    })
    async getPendingOrders(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.orderApprovalService.getPendingOrders(page, limit, username);
    }

    @Patch('approve/:id')
    @ApiOperation({
        summary: '발주 승인',
        description: '특정 발주를 승인 처리합니다. 승인 시 발주 등록자에게 승인 완료 알림이 전송됩니다.'
    })
    @ApiParam({ name: 'id', description: '발주 ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                approver: { type: 'string', description: '승인자명' }
            },
            required: ['approver']
        }
    })
    @ApiResponse({
        status: 200,
        description: '발주 승인 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '발주 승인이 완료되었습니다.' },
                orderInfo: {
                    type: 'object',
                    description: '승인된 발주 정보'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '발주 승인 실패',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: '발주 승인 실패' },
                error: { type: 'string', example: '이미 승인된 발주입니다.' }
            }
        }
    })
    async approveOrder(
        @Param('id') id: string,
        @Body('approver') approver: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.orderApprovalService.approveOrder(parseInt(id), approver, username);
    }

    @Patch('reject/:id')
    @ApiOperation({
        summary: '발주 거부',
        description: '특정 발주를 거부 처리합니다.'
    })
    @ApiParam({ name: 'id', description: '발주 ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                rejector: { type: 'string', description: '거부자명' },
                reason: { type: 'string', description: '거부 사유' }
            },
            required: ['rejector', 'reason']
        }
    })
    @ApiResponse({
        status: 200,
        description: '발주 거부 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '발주 거부가 완료되었습니다.' },
                orderInfo: {
                    type: 'object',
                    description: '거부된 발주 정보'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '발주 거부 실패',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: '발주 거부 실패' },
                error: { type: 'string', example: '이미 승인된 발주는 거부할 수 없습니다.' }
            }
        }
    })
    async rejectOrder(
        @Param('id') id: string,
        @Body('rejector') rejector: string,
        @Body('reason') reason: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.orderApprovalService.rejectOrder(parseInt(id), rejector, reason, username);
    }
}
