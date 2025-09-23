import { Controller, Get, Query, Param, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ClaimReadService } from "../services/claim-read.service";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Request } from "express";

@DevAuth()
@ApiTags('AS 클레임 관리')
@Controller('claim')
export class ClaimReadController {
    constructor(
        private readonly claimReadService: ClaimReadService,
    ) {}

    @Get('list')
    @ApiOperation({ 
        summary: '클레임 목록 조회',
        description: '페이징, 검색, 필터링을 지원하는 클레임 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
    @ApiQuery({ name: 'search', required: false, description: '검색어 (클레임코드, 거래처명, 품목명, 프로젝트명, 클레임사유)' })
    @ApiQuery({ name: 'claimStatus', required: false, description: '클레임 상태', enum: ['접수', '처리중', '완료', '취소'] })
    @ApiQuery({ name: 'customerName', required: false, description: '고객명' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
    @ApiResponse({ 
        status: 200, 
        description: '클레임 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '성공 여부' },
                data: {
                    type: 'object',
                    properties: {
                        claims: { 
                            type: 'array', 
                            description: '클레임 목록',
                            items: { $ref: '#/components/schemas/Claim' }
                        },
                        summary: {
                            type: 'object',
                            description: '요약 정보',
                            properties: {
                                totalClaims: { type: 'number', description: '총 클레임 수' },
                                totalQuantity: { type: 'number', description: '총 수량' },
                                totalAmount: { type: 'number', description: '총 금액' },
                                byStatus: {
                                    type: 'object',
                                    properties: {
                                        received: { type: 'number' },
                                        processing: { type: 'number' },
                                        completed: { type: 'number' },
                                        cancelled: { type: 'number' }
                                    }
                                },
                                byPriority: {
                                    type: 'object',
                                    properties: {
                                        high: { type: 'number' },
                                        normal: { type: 'number' },
                                        low: { type: 'number' }
                                    }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                total: { type: 'number', description: '전체 항목 수' },
                                page: { type: 'number', description: '현재 페이지' },
                                limit: { type: 'number', description: '페이지당 항목 수' },
                                totalPages: { type: 'number', description: '전체 페이지 수' }
                            }
                        }
                    }
                }
            }
        }
    })
    async getAllClaims(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('claimStatus') claimStatus?: string,
        @Query('customerName') customerName?: string,
        @Query('productName') productName?: string,
        @Query('projectName') projectName?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Req() req?: Request & { user: { username: string } }
    ) {
        const username = req?.user?.username || 'unknown';
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        
        return await this.claimReadService.getAllClaims(
            pageNum, 
            limitNum, 
            search, 
            claimStatus, 
            customerName,
            productName,
            projectName,
            startDate, 
            endDate, 
            username
        );
    }
}
