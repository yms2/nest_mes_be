import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UnifiedApprovalService } from '../services/unified-approval.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { Request } from 'express';

@DevAuth()
@ApiTags('통합 승인 관리')
@Controller('unified-approval')
export class UnifiedApprovalController {
    constructor(private readonly unifiedApprovalService: UnifiedApprovalService) {}

    @Get('all-pending')
    @ApiOperation({
        summary: '모든 승인 대기 항목 통합 조회',
        description: '발주, 품질검사, 수주 등 모든 승인 대기 항목을 통합하여 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 20)' })
    @ApiResponse({
        status: 200,
        description: '통합 승인 대기 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '통합 승인 대기 목록을 성공적으로 조회했습니다.' },
                data: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            description: '통합 승인 대기 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', description: '항목 ID' },
                                    type: { type: 'string', enum: ['ORDER', 'INSPECTION', 'ORDER_MANAGEMENT'], description: '항목 타입' },
                                    typeName: { type: 'string', description: '항목 타입명' },
                                    code: { type: 'string', description: '코드' },
                                    name: { type: 'string', description: '이름' },
                                    quantity: { type: 'number', description: '수량' },
                                    amount: { type: 'number', description: '금액' },
                                    status: { type: 'string', description: '상태' },
                                    createdBy: { type: 'string', description: '생성자' },
                                    createdAt: { type: 'string', description: '생성일시' },
                                    details: { type: 'object', description: '상세 정보' }
                                }
                            }
                        },
                        statistics: {
                            type: 'object',
                            properties: {
                                total: { type: 'number', description: '전체 항목 수' },
                                orders: { type: 'number', description: '발주 항목 수' },
                                inspections: { type: 'number', description: '품질검사 항목 수' },
                                orderManagement: { type: 'number', description: '수주 항목 수' },
                                byType: {
                                    type: 'object',
                                    properties: {
                                        ORDER: { type: 'number', description: '발주 수' },
                                        INSPECTION: { type: 'number', description: '품질검사 수' },
                                        ORDER_MANAGEMENT: { type: 'number', description: '수주 수' }
                                    }
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
    async getAllPendingApprovals(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.unifiedApprovalService.getAllPendingApprovals(page, limit, username);
    }

    @Get('pending-by-type')
    @ApiOperation({
        summary: '타입별 승인 대기 항목 조회',
        description: '특정 타입의 승인 대기 항목만 조회합니다.'
    })
    @ApiQuery({ 
        name: 'type', 
        required: true, 
        enum: ['ORDER', 'INSPECTION', 'ORDER_MANAGEMENT'], 
        description: '항목 타입' 
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 20)' })
    @ApiResponse({
        status: 200,
        description: '타입별 승인 대기 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'ORDER 승인 대기 목록을 성공적으로 조회했습니다.' },
                data: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            description: '승인 대기 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', description: '항목 ID' },
                                    type: { type: 'string', description: '항목 타입' },
                                    typeName: { type: 'string', description: '항목 타입명' },
                                    code: { type: 'string', description: '코드' },
                                    name: { type: 'string', description: '이름' },
                                    quantity: { type: 'number', description: '수량' },
                                    amount: { type: 'number', description: '금액' },
                                    status: { type: 'string', description: '상태' },
                                    createdBy: { type: 'string', description: '생성자' },
                                    createdAt: { type: 'string', description: '생성일시' },
                                    details: { type: 'object', description: '상세 정보' }
                                }
                            }
                        },
                        type: { type: 'string', description: '항목 타입' },
                        typeName: { type: 'string', description: '항목 타입명' },
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
    async getPendingApprovalsByType(
        @Query('type') type: 'ORDER' | 'INSPECTION' | 'ORDER_MANAGEMENT',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.unifiedApprovalService.getPendingApprovalsByType(type, page, limit, username);
    }
}
