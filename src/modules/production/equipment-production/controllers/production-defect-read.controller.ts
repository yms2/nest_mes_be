import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ProductionDefectReadService } from '../services/production-defect-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 불량현황 관리')
@Controller('production-defect')
@DevAuth()
export class ProductionDefectReadController {
    constructor(
        private readonly productionDefectReadService: ProductionDefectReadService
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '불량현황 목록 조회', 
        description: '생산 불량현황 목록을 조회합니다. 품목, 거래처, 프로젝트 정보가 포함됩니다. 페이지네이션과 검색 기능을 지원합니다.' 
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiQuery({ name: 'search', required: false, type: String, description: '검색 키워드 (불량코드, 사유, 사원코드, 사원명, 비고)' })
    @ApiResponse({ 
        status: 200, 
        description: '불량현황 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        defects: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    productionDefectCode: { type: 'string', example: 'BD001' },
                                    productionDefectQuantity: { type: 'number', example: 10 },
                                    productionDefectReason: { type: 'string', example: '불량 사유' },
                                    employeeCode: { type: 'string', example: 'EMP001' },
                                    employeeName: { type: 'string', example: '사원 이름' },
                                    remark: { type: 'string', example: '비고' },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    updatedAt: { type: 'string', format: 'date-time' },
                                    // 품목 정보 (평면화)
                                    productCode: { type: 'string', example: 'PRD001' },
                                    productName: { type: 'string', example: '볼펜' },
                                    productType: { type: 'string', example: '완제품' },
                                    productSize: { type: 'string', example: '0.7mm' },
                                    // 생산 정보 (평면화)
                                    productionCode: { type: 'string', example: 'PRO001' },
                                    productionStatus: { type: 'string', example: '생산 완료' },
                                    productionInstructionQuantity: { type: 'number', example: 100 },
                                    productionCompletionQuantity: { type: 'number', example: 90 },
                                    // 거래처 정보 (평면화)
                                    customerCode: { type: 'string', example: 'CUS001' },
                                    customerName: { type: 'string', example: '삼성전자' },
                                    // 프로젝트 정보 (평면화)
                                    projectCode: { type: 'string', example: 'PRJ001' },
                                    projectName: { type: 'string', example: '스마트폰 개발' }
                                }
                            }
                        },
                        total: { type: 'number', example: 25 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 3 }
                    }
                }
            }
        }
    })
    async getAllDefects(
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('search') search?: string
    ) {
        return await this.productionDefectReadService.getAllDefects(
            page || 1, 
            limit || 10, 
            search
        );
    }
}
