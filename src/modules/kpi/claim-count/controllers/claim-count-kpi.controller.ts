import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from '@/common/decorators/permission.decorator';
import { ClaimCountKpiService } from '../services/claim-count-kpi.service';
import { ClaimCountKpiQueryDto, ClaimCountKpiResponseDto, ClaimCountKpiDetailResponseDto } from '../dto/claim-count-kpi.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('KPI - 클레임 건수')
@Controller('kpi/claim-count')
@DevAuth()
export class ClaimCountKpiController {
    constructor(
        private readonly claimCountKpiService: ClaimCountKpiService,
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '월별 클레임 건수 KPI 조회',
        description: '월별 클레임 건수 통계를 조회합니다. 년월, 고객사, 프로젝트, 상태별로 필터링 가능합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '월별 클레임 건수 KPI 조회 성공',
        type: [ClaimCountKpiResponseDto]
    })
    @RequirePermission('claimCountKpi', 'read')
    async getClaimCountKpi(@Query() queryDto: ClaimCountKpiQueryDto): Promise<ClaimCountKpiResponseDto[]> {
        return await this.claimCountKpiService.getClaimCountKpi(queryDto);
    }

    @Get('detail')
    @ApiOperation({ 
        summary: '월별 클레임 건수 KPI 상세 조회',
        description: '월별 클레임 건수 통계와 함께 클레임 상세 목록을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '월별 클레임 건수 KPI 상세 조회 성공',
        type: [ClaimCountKpiDetailResponseDto]
    })
    @RequirePermission('claimCountKpi', 'read')
    async getClaimCountKpiDetail(@Query() queryDto: ClaimCountKpiQueryDto): Promise<ClaimCountKpiDetailResponseDto[]> {
        return await this.claimCountKpiService.getClaimCountKpiDetail(queryDto);
    }

    @Get('summary')
    @ApiOperation({ 
        summary: '클레임 건수 통계 요약 조회',
        description: '전체 클레임 통계, 월평균, 상위 고객사/프로젝트 정보를 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '클레임 건수 통계 요약 조회 성공',
        schema: {
            type: 'object',
            properties: {
                totalClaims: { type: 'number', description: '총 클레임 건수' },
                totalAmount: { type: 'number', description: '총 클레임 금액' },
                averagePerMonth: { type: 'number', description: '월평균 클레임 건수' },
                topCustomer: { 
                    type: 'array', 
                    items: {
                        type: 'object',
                        properties: {
                            customerName: { type: 'string', description: '고객사명' },
                            claimCount: { type: 'number', description: '클레임 건수' }
                        }
                    },
                    description: '상위 고객사 TOP 5'
                },
                topProject: { 
                    type: 'array', 
                    items: {
                        type: 'object',
                        properties: {
                            projectName: { type: 'string', description: '프로젝트명' },
                            claimCount: { type: 'number', description: '클레임 건수' }
                        }
                    },
                    description: '상위 프로젝트 TOP 5'
                }
            }
        }
    })
    @RequirePermission('claimCountKpi', 'read')
    async getClaimCountSummary(@Query() queryDto: ClaimCountKpiQueryDto) {
        return await this.claimCountKpiService.getClaimCountSummary(queryDto);
    }
}
