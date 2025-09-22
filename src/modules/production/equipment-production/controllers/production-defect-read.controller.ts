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
                                    relatedInfo: {
                                        type: 'object',
                                        properties: {
                                            product: {
                                                type: 'object',
                                                properties: {
                                                    productCode: { type: 'string', example: 'PRD001' },
                                                    productName: { type: 'string', example: '볼펜' },
                                                    productType: { type: 'string', example: '완제품' },
                                                    productSize: { type: 'string', example: '0.7mm' }
                                                }
                                            },
                                            customer: {
                                                type: 'object',
                                                properties: {
                                                    customerCode: { type: 'string', example: 'CUS001' },
                                                    customerName: { type: 'string', example: '삼성전자' }
                                                }
                                            },
                                            project: {
                                                type: 'object',
                                                properties: {
                                                    projectCode: { type: 'string', example: 'PRJ001' },
                                                    projectName: { type: 'string', example: '스마트폰 개발' }
                                                }
                                            },
                                            production: {
                                                type: 'object',
                                                properties: {
                                                    productionCode: { type: 'string', example: 'PRO001' },
                                                    productionStatus: { type: 'string', example: '생산 완료' },
                                                    productionInstructionQuantity: { type: 'number', example: 100 },
                                                    productionCompletionQuantity: { type: 'number', example: 90 }
                                                }
                                            }
                                        }
                                    }
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

    @Get('statistics')
    @ApiOperation({ 
        summary: '불량현황 통계 조회', 
        description: '전체 불량 수량, 사원별 통계, 불량 사유별 통계를 조회합니다.' 
    })
    @ApiResponse({ 
        status: 200, 
        description: '불량현황 통계 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        totalDefectQuantity: { type: 'number', example: 150 },
                        employeeStatistics: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    employeeCode: { type: 'string', example: 'EMP001' },
                                    employeeName: { type: 'string', example: '홍길동' },
                                    totalQuantity: { type: 'string', example: '50' },
                                    defectCount: { type: 'string', example: '5' }
                                }
                            }
                        },
                        reasonStatistics: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    reason: { type: 'string', example: '재료 불량' },
                                    totalQuantity: { type: 'string', example: '30' },
                                    defectCount: { type: 'string', example: '3' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getDefectStatistics() {
        return await this.productionDefectReadService.getDefectStatistics();
    }

    @Get('employee/:employeeCode')
    @ApiOperation({ 
        summary: '사원별 불량현황 조회', 
        description: '특정 사원의 불량현황을 조회합니다.' 
    })
    @ApiParam({ name: 'employeeCode', description: '사원 코드', example: 'EMP001' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiResponse({ 
        status: 200, 
        description: '사원별 불량현황 조회 성공',
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
                                    remark: { type: 'string', example: '비고' }
                                }
                            }
                        },
                        total: { type: 'number', example: 5 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 1 },
                        employeeCode: { type: 'string', example: 'EMP001' }
                    }
                }
            }
        }
    })
    async getDefectsByEmployee(
        @Param('employeeCode') employeeCode: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
    ) {
        return await this.productionDefectReadService.getDefectsByEmployee(
            employeeCode, 
            page || 1, 
            limit || 10
        );
    }

    @Get(':productionDefectCode')
    @ApiOperation({ 
        summary: '불량현황 상세 조회', 
        description: '불량 코드로 특정 불량현황의 상세 정보를 조회합니다.' 
    })
    @ApiParam({ name: 'productionDefectCode', description: '생산 불량 코드', example: 'BD001' })
    @ApiResponse({ 
        status: 200, 
        description: '불량현황 상세 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
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
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    async getDefectByCode(@Param('productionDefectCode') productionDefectCode: string) {
        return await this.productionDefectReadService.getDefectByCode(productionDefectCode);
    }

    @Get('with-related-info/:productionDefectCode')
    @ApiOperation({ 
        summary: '불량현황 관련 정보 조회', 
        description: '불량 코드로 관련 생산정보, 품목정보, 프로젝트정보, 거래처정보를 모두 조회합니다.' 
    })
    @ApiParam({ name: 'productionDefectCode', description: '생산 불량 코드', example: 'BD001' })
    @ApiResponse({ 
        status: 200, 
        description: '불량현황 관련 정보 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        defect: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                productionDefectCode: { type: 'string', example: 'BD001' },
                                productionDefectQuantity: { type: 'number', example: 10 },
                                productionDefectReason: { type: 'string', example: '불량 사유' },
                                employeeCode: { type: 'string', example: 'EMP001' },
                                employeeName: { type: 'string', example: '사원 이름' },
                                remark: { type: 'string', example: '비고' }
                            }
                        },
                        relatedInfo: {
                            type: 'object',
                            properties: {
                                production: {
                                    type: 'object',
                                    properties: {
                                        productionCode: { type: 'string', example: 'PRO001' },
                                        productCode: { type: 'string', example: 'PRD001' },
                                        productName: { type: 'string', example: '볼펜' },
                                        productType: { type: 'string', example: '완제품' },
                                        productSize: { type: 'string', example: '0.7mm' },
                                        productionStatus: { type: 'string', example: '생산 완료' }
                                    }
                                },
                                productionPlan: {
                                    type: 'object',
                                    properties: {
                                        projectCode: { type: 'string', example: 'PRJ001' },
                                        projectName: { type: 'string', example: '프로젝트 이름' },
                                        customerCode: { type: 'string', example: 'CUS001' },
                                        customerName: { type: 'string', example: '고객 이름' },
                                        orderType: { type: 'string', example: '신규' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getDefectWithRelatedInfo(@Param('productionDefectCode') productionDefectCode: string) {
        return await this.productionDefectReadService.getDefectWithRelatedInfo(productionDefectCode);
    }

    @Get('production/:productionCode')
    @ApiOperation({ 
        summary: '생산코드별 관련 정보 조회', 
        description: '생산 코드로 관련 불량정보, 품목정보, 프로젝트정보, 거래처정보를 모두 조회합니다.' 
    })
    @ApiParam({ name: 'productionCode', description: '생산 코드', example: 'PRO001' })
    @ApiResponse({ 
        status: 200, 
        description: '생산코드별 관련 정보 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        production: {
                            type: 'object',
                            properties: {
                                productionCode: { type: 'string', example: 'PRO001' },
                                productCode: { type: 'string', example: 'PRD001' },
                                productName: { type: 'string', example: '볼펜' },
                                productType: { type: 'string', example: '완제품' },
                                productionStatus: { type: 'string', example: '생산 완료' }
                            }
                        },
                        defects: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productionDefectCode: { type: 'string', example: 'BD001' },
                                    productionDefectQuantity: { type: 'number', example: 10 },
                                    productionDefectReason: { type: 'string', example: '불량 사유' }
                                }
                            }
                        },
                        productionPlan: {
                            type: 'object',
                            properties: {
                                projectCode: { type: 'string', example: 'PRJ001' },
                                projectName: { type: 'string', example: '프로젝트 이름' },
                                customerCode: { type: 'string', example: 'CUS001' },
                                customerName: { type: 'string', example: '고객 이름' }
                            }
                        }
                    }
                }
            }
        }
    })
    async getProductionWithRelatedInfo(@Param('productionCode') productionCode: string) {
        return await this.productionDefectReadService.getProductionWithRelatedInfo(productionCode);
    }

    @Get('project/:projectCode')
    @ApiOperation({ 
        summary: '프로젝트별 불량현황 조회', 
        description: '프로젝트 코드로 해당 프로젝트의 모든 불량현황을 조회합니다.' 
    })
    @ApiParam({ name: 'projectCode', description: '프로젝트 코드', example: 'PRJ001' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiResponse({ 
        status: 200, 
        description: '프로젝트별 불량현황 조회 성공',
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
                                    productionDefectCode: { type: 'string', example: 'BD001' },
                                    productionDefectQuantity: { type: 'number', example: 10 },
                                    productionDefectReason: { type: 'string', example: '불량 사유' },
                                    employeeCode: { type: 'string', example: 'EMP001' },
                                    employeeName: { type: 'string', example: '사원 이름' }
                                }
                            }
                        },
                        total: { type: 'number', example: 5 },
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        totalPages: { type: 'number', example: 1 },
                        projectCode: { type: 'string', example: 'PRJ001' }
                    }
                }
            }
        }
    })
    async getDefectsByProject(
        @Param('projectCode') projectCode: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
    ) {
        return await this.productionDefectReadService.getDefectsByProject(
            projectCode, 
            page || 1, 
            limit || 10
        );
    }
}
