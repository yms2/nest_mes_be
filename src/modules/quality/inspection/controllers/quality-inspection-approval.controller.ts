import { Controller, Get, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { QualityInspectionApprovalService } from '../services/quality-inspection-approval.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { Request } from 'express';

@DevAuth()
@ApiTags('품질검사관리 승인')
@Controller('quality-inspection-approval')
export class QualityInspectionApprovalController {
    constructor(private readonly qualityInspectionApprovalService: QualityInspectionApprovalService) {}

    @Get('pending')
    @ApiOperation({
        summary: '승인 대기 품질검사 목록 조회',
        description: '승인 대기 중인 품질검사 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 20)' })
    @ApiResponse({
        status: 200,
        description: '승인 대기 품질검사 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '승인 대기 품질검사 목록을 성공적으로 조회했습니다.' },
                data: {
                    type: 'object',
                    properties: {
                        inspections: {
                            type: 'array',
                            description: '승인 대기 품질검사 목록',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', description: '품질검사 ID' },
                                    inspectionCode: { type: 'string', description: '검사 코드' },
                                    productName: { type: 'string', description: '제품명' },
                                    inspectionQuantity: { type: 'number', description: '검사 수량' },
                                    inspectionStatus: { type: 'string', description: '검사 상태' },
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
    async getPendingInspections(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityInspectionApprovalService.getPendingInspections(page, limit, username);
    }

    @Patch('approve/:id')
    @ApiOperation({
        summary: '품질검사 승인',
        description: '특정 품질검사를 승인 처리합니다. 승인 시 검사 등록자에게 승인 완료 알림이 전송되고 재고에 반영됩니다.'
    })
    @ApiParam({ name: 'id', description: '품질검사 ID' })
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
        description: '품질검사 승인 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '품질검사 승인이 완료되었습니다.' },
                inspection: {
                    type: 'object',
                    description: '승인된 품질검사 정보'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '품질검사 승인 실패',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: '품질검사 승인 실패' },
                error: { type: 'string', example: '승인 대기 중인 품질검사만 승인할 수 있습니다.' }
            }
        }
    })
    async approveInspection(
        @Param('id') id: string,
        @Body('approver') approver: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityInspectionApprovalService.approveInspection(parseInt(id), approver, username);
    }

    @Patch('reject/:id')
    @ApiOperation({
        summary: '품질검사 거부',
        description: '특정 품질검사를 거부 처리합니다.'
    })
    @ApiParam({ name: 'id', description: '품질검사 ID' })
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
        description: '품질검사 거부 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '품질검사 거부가 완료되었습니다.' },
                inspection: {
                    type: 'object',
                    description: '거부된 품질검사 정보'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '품질검사 거부 실패',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: '품질검사 거부 실패' },
                error: { type: 'string', example: '승인 대기 중인 품질검사만 거부할 수 있습니다.' }
            }
        }
    })
    async rejectInspection(
        @Param('id') id: string,
        @Body('rejector') rejector: string,
        @Body('reason') reason: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityInspectionApprovalService.rejectInspection(parseInt(id), rejector, reason, username);
    }
}
