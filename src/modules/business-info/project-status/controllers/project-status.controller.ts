import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProjectStatusService } from '../services/project-status.service';
import { ProjectStatusQueryDto, ProjectStatusResponseDto } from '../dto/project-status.dto';
import { RequirePermission } from '@/common/decorators/permission.decorator';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('프로젝트 현황')
@Controller('project-status')
@DevAuth()
export class ProjectStatusController {
    constructor(
        private readonly projectStatusService: ProjectStatusService
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '프로젝트 현황 조회', 
        description: '프로젝트 코드별로 수주, 발주, 생산계획, 출하, 입고, 납품, 생산, 클레임 정보를 통합 조회합니다.' 
    })
    @ApiResponse({ 
        status: 200, 
        description: '프로젝트 현황 조회 성공',
        type: [ProjectStatusResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: '잘못된 요청 파라미터' 
    })
    @ApiResponse({ 
        status: 401, 
        description: '인증되지 않은 사용자' 
    })
    @ApiResponse({ 
        status: 403, 
        description: '권한이 없는 사용자' 
    })
    @ApiQuery({ 
        name: 'projectCode', 
        required: false, 
        description: '프로젝트 코드',
        example: 'PRJ001'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        description: '시작일 (YYYY-MM-DD)',
        example: '2025-01-01'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        description: '종료일 (YYYY-MM-DD)',
        example: '2025-12-31'
    })
    @RequirePermission('프로젝트 현황', 'read')
    async getProjectStatus(
        @Query() queryDto: ProjectStatusQueryDto
    ): Promise<ProjectStatusResponseDto[]> {
        return await this.projectStatusService.getProjectStatus(queryDto);
    }

    // @Get('summary')
    // @ApiOperation({ 
    //     summary: '프로젝트 현황 요약', 
    //     description: '프로젝트별 단계별 진행 현황을 조회합니다.' 
    // })
    // @ApiResponse({ 
    //     status: 200, 
    //     description: '프로젝트 현황 요약 조회 성공'
    // })
    // @ApiQuery({ 
    //     name: 'projectCode', 
    //     required: false, 
    //     description: '프로젝트 코드',
    //     example: 'PRJ001'
    // })
    // @ApiQuery({ 
    //     name: 'startDate', 
    //     required: false, 
    //     description: '시작일 (YYYY-MM-DD)',
    //     example: '2025-01-01'
    // })
    // @ApiQuery({ 
    //     name: 'endDate', 
    //     required: false, 
    //     description: '종료일 (YYYY-MM-DD)',
    //     example: '2025-12-31'
    // })
    // @RequirePermission('프로젝트 현황', 'read')
    // async getProjectStatusSummary(
    //     @Query() queryDto: ProjectStatusQueryDto
    // ): Promise<any> {
    //     const projectStatusList = await this.projectStatusService.getProjectStatus(queryDto);
        
    //     // 프로젝트별 단계별 진행 현황 생성
    //     const projectMap = new Map<string, any>();
        
    //     projectStatusList.forEach(item => {
    //         if (!projectMap.has(item.projectCode)) {
    //             projectMap.set(item.projectCode, {
    //                 projectCode: item.projectCode,
    //                 projectName: item.projectName,
    //                 projectVersion: item.projectVersion,
    //                 customerName: item.customerName,
    //                 productName: item.productName,
    //                 specification: item.specification,
    //                 estimateDate: item.estimateDate,
    //                 projectStartDate: item.projectStartDate,
    //                 projectEndDate: item.projectEndDate,
    //                 progress: {
    //                     order: { completed: !!item.orderDate, date: item.orderDate },
    //                     bom: { completed: !!item.bomDate, date: item.bomDate },
    //                     orderMain: { completed: !!item.orderMainDate, date: item.orderMainDate },
    //                     receiving: { completed: !!item.receivingDate, date: item.receivingDate },
    //                     productionPlan: { completed: !!item.productionPlanDate, date: item.productionPlanDate },
    //                     productionComplete: { completed: !!item.productionCompleteDate, date: item.productionCompleteDate },
    //                     qualityInspection: { completed: !!item.qualityInspectionDate, date: item.qualityInspectionDate },
    //                     shipping: { completed: !!item.shippingDate, date: item.shippingDate },
    //                     delivery: { completed: !!item.deliveryDate, date: item.deliveryDate }
    //                 }
    //             });
    //         }
    //     });

    //     return {
    //         totalRecords: projectStatusList.length,
    //         totalProjects: projectMap.size,
    //         projects: Array.from(projectMap.values())
    //     };
    // }
}
