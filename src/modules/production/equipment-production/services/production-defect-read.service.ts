import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionDefectQuantity } from '../entities/productionDefect.entity';
import { Production } from '../entities/production.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { logService } from '@/modules/log/Services/log.service';

@Injectable()
export class ProductionDefectReadService {
    constructor(
        @InjectRepository(ProductionDefectQuantity)
        private readonly productionDefectRepository: Repository<ProductionDefectQuantity>,
        @InjectRepository(Production)
        private readonly productionRepository: Repository<Production>,
        @InjectRepository(ProductionPlan)
        private readonly productionPlanRepository: Repository<ProductionPlan>,
        @InjectRepository(ProductionInstruction)
        private readonly productionInstructionRepository: Repository<ProductionInstruction>,
        private readonly logService: logService,
    ) {}

    /**
     * 모든 불량현황을 조회합니다. (품목, 거래처, 프로젝트 정보 포함)
     */
    async getAllDefects(page: number = 1, limit: number = 10, search?: string) {
        try {
            const queryBuilder = this.productionDefectRepository.createQueryBuilder('defect');

            // 검색 조건
            if (search) {
                queryBuilder.andWhere(
                    '(defect.productionDefectCode LIKE :search OR ' +
                    'defect.productionDefectReason LIKE :search OR ' +
                    'defect.employeeCode LIKE :search OR ' +
                    'defect.employeeName LIKE :search OR ' +
                    'defect.remark LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // 정렬 (최신순)
            queryBuilder.orderBy('defect.createdAt', 'DESC');

            // 페이지네이션
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);

            // 조회
            const [defects, total] = await queryBuilder.getManyAndCount();

            // 각 불량현황에 대해 관련 정보 조회
            const defectsWithRelatedInfo = await Promise.all(
                defects.map(async (defect) => {
                    // 관련 생산 정보 조회
                    const production = await this.productionRepository.findOne({
                        where: { productionDefectCode: defect.productionDefectCode }
                    });

                    let relatedInfo: any = null;
                    if (production) {
                        // 생산 지시 코드로 생산 계획 정보 조회
                        const productionPlan = await this.productionPlanRepository.findOne({
                            where: { productionPlanCode: production.productionInstructionCode }
                        });

                        relatedInfo = {
                            product: {
                                productCode: production.productCode,
                                productName: production.productName,
                                productType: production.productType,
                                productSize: production.productSize
                            },
                            customer: productionPlan ? {
                                customerCode: productionPlan.customerCode,
                                customerName: productionPlan.customerName
                            } : null,
                            project: productionPlan ? {
                                projectCode: productionPlan.projectCode,
                                projectName: productionPlan.projectName
                            } : null,
                            production: {
                                productionCode: production.productionCode,
                                productionStatus: production.productionStatus,
                                productionInstructionQuantity: production.productionInstructionQuantity,
                                productionCompletionQuantity: production.productionCompletionQuantity
                            }
                        };
                    }

                    return {
                        ...defect,
                        relatedInfo
                    };
                })
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: '전체',
                details: `불량현황 ${total}건 조회 완료 (페이지: ${page}, 검색: ${search || '없음'})`
            });

            return {
                success: true,
                data: {
                    defects: defectsWithRelatedInfo,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: '전체',
                details: `불량현황 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 불량 코드로 특정 불량현황을 조회합니다.
     */
    async getDefectByCode(productionDefectCode: string) {
        try {
            const defect = await this.productionDefectRepository.findOne({
                where: { productionDefectCode }
            });

            if (!defect) {
                throw new Error(`불량 코드 '${productionDefectCode}'에 해당하는 데이터를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: productionDefectCode,
                details: `불량현황 상세 조회 완료: ${productionDefectCode}`
            });

            return {
                success: true,
                data: defect
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: productionDefectCode,
                details: `불량현황 상세 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 사원별 불량현황을 조회합니다.
     */
    async getDefectsByEmployee(employeeCode: string, page: number = 1, limit: number = 10) {
        try {
            const queryBuilder = this.productionDefectRepository.createQueryBuilder('defect');

            queryBuilder.where('defect.employeeCode = :employeeCode', { employeeCode });

            // 정렬 (최신순)
            queryBuilder.orderBy('defect.createdAt', 'DESC');

            // 페이지네이션
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);

            // 조회
            const [defects, total] = await queryBuilder.getManyAndCount();

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: employeeCode,
                details: `사원별 불량현황 조회 완료: ${employeeCode} (${total}건)`
            });

            return {
                success: true,
                data: {
                    defects,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    employeeCode
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: employeeCode,
                details: `사원별 불량현황 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 불량현황 통계를 조회합니다.
     */
    async getDefectStatistics() {
        try {
            // 전체 불량 수량 합계
            const totalDefectQuantity = await this.productionDefectRepository
                .createQueryBuilder('defect')
                .select('SUM(defect.productionDefectQuantity)', 'total')
                .getRawOne();

            // 사원별 불량 수량 통계
            const employeeStats = await this.productionDefectRepository
                .createQueryBuilder('defect')
                .select([
                    'defect.employeeCode as employeeCode',
                    'defect.employeeName as employeeName',
                    'SUM(defect.productionDefectQuantity) as totalQuantity',
                    'COUNT(*) as defectCount'
                ])
                .where('defect.employeeCode IS NOT NULL')
                .groupBy('defect.employeeCode, defect.employeeName')
                .orderBy('totalQuantity', 'DESC')
                .getRawMany();

            // 불량 사유별 통계
            const reasonStats = await this.productionDefectRepository
                .createQueryBuilder('defect')
                .select([
                    'defect.productionDefectReason as reason',
                    'SUM(defect.productionDefectQuantity) as totalQuantity',
                    'COUNT(*) as defectCount'
                ])
                .groupBy('defect.productionDefectReason')
                .orderBy('totalQuantity', 'DESC')
                .getRawMany();

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 통계',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: '통계',
                details: `불량현황 통계 조회 완료`
            });

            return {
                success: true,
                data: {
                    totalDefectQuantity: parseInt(totalDefectQuantity.total) || 0,
                    employeeStatistics: employeeStats,
                    reasonStatistics: reasonStats
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 통계',
                action: 'READ_FAILED',
                username: 'system',
                targetId: '통계',
                details: `불량현황 통계 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 불량코드로 관련 생산정보와 프로젝트/거래처 정보를 조회합니다.
     */
    async getDefectWithRelatedInfo(productionDefectCode: string) {
        try {
            // 불량 정보 조회
            const defect = await this.productionDefectRepository.findOne({
                where: { productionDefectCode }
            });

            if (!defect) {
                throw new Error(`불량 코드 '${productionDefectCode}'에 해당하는 데이터를 찾을 수 없습니다.`);
            }

            // 관련 생산 정보 조회
            const production = await this.productionRepository.findOne({
                where: { productionDefectCode }
            });

            let relatedInfo: any = null;
            if (production) {
                // 생산 지시 코드로 생산 계획 정보 조회
                const productionPlan = await this.productionPlanRepository.findOne({
                    where: { productionPlanCode: production.productionInstructionCode }
                });

                relatedInfo = {
                    production: {
                        productionCode: production.productionCode,
                        productCode: production.productCode,
                        productName: production.productName,
                        productType: production.productType,
                        productSize: production.productSize,
                        productionInstructionQuantity: production.productionInstructionQuantity,
                        productionCompletionQuantity: production.productionCompletionQuantity,
                        productionProcessCode: production.productionProcessCode,
                        productionProcessName: production.productionProcessName,
                        productionStatus: production.productionStatus,
                        productionStartDate: production.productionStartDate,
                        productionCompletionDate: production.productionCompletionDate
                    },
                    productionPlan: productionPlan ? {
                        productionPlanCode: productionPlan.productionPlanCode,
                        projectCode: productionPlan.projectCode,
                        projectName: productionPlan.projectName,
                        customerCode: productionPlan.customerCode,
                        customerName: productionPlan.customerName,
                        orderType: productionPlan.orderType,
                        expectedStartDate: productionPlan.expectedStartDate,
                        expectedCompletionDate: productionPlan.expectedCompletionDate
                    } : null
                };
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 상세 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: productionDefectCode,
                details: `불량현황 관련 정보 조회 완료: ${productionDefectCode}`
            });

            return {
                success: true,
                data: {
                    defect,
                    relatedInfo
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '불량현황 상세 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: productionDefectCode,
                details: `불량현황 관련 정보 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 생산코드로 관련 불량정보와 프로젝트/거래처 정보를 조회합니다.
     */
    async getProductionWithRelatedInfo(productionCode: string) {
        try {
            // 생산 정보 조회
            const production = await this.productionRepository.findOne({
                where: { productionCode }
            });

            if (!production) {
                throw new Error(`생산 코드 '${productionCode}'에 해당하는 데이터를 찾을 수 없습니다.`);
            }

            // 관련 불량 정보 조회
            const defects = await this.productionDefectRepository.find({
                where: { productionDefectCode: production.productionDefectCode }
            });

            // 생산 지시 코드로 생산 계획 정보 조회
            const productionPlan = await this.productionPlanRepository.findOne({
                where: { productionPlanCode: production.productionInstructionCode }
            });

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산현황 상세 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: productionCode,
                details: `생산현황 관련 정보 조회 완료: ${productionCode}`
            });

            return {
                success: true,
                data: {
                    production,
                    defects,
                    productionPlan: productionPlan ? {
                        productionPlanCode: productionPlan.productionPlanCode,
                        projectCode: productionPlan.projectCode,
                        projectName: productionPlan.projectName,
                        customerCode: productionPlan.customerCode,
                        customerName: productionPlan.customerName,
                        orderType: productionPlan.orderType,
                        expectedStartDate: productionPlan.expectedStartDate,
                        expectedCompletionDate: productionPlan.expectedCompletionDate
                    } : null
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산현황 상세 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: productionCode,
                details: `생산현황 관련 정보 조회 실패: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 프로젝트별 불량현황을 조회합니다.
     */
    async getDefectsByProject(projectCode: string, page: number = 1, limit: number = 10) {
        try {
            // 프로젝트 코드로 생산 계획 조회
            const productionPlans = await this.productionPlanRepository.find({
                where: { projectCode },
                select: ['productionPlanCode']
            });

            if (productionPlans.length === 0) {
                return {
                    success: true,
                    data: {
                        defects: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                        projectCode
                    }
                };
            }

            const planCodes = productionPlans.map(plan => plan.productionPlanCode);

            // 해당 생산 계획들로 생산 정보 조회
            const productions = await this.productionRepository.find({
                where: planCodes.map(code => ({ productionInstructionCode: code })),
                select: ['productionDefectCode']
            });

            if (productions.length === 0) {
                return {
                    success: true,
                    data: {
                        defects: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                        projectCode
                    }
                };
            }

            const defectCodes = productions.map(prod => prod.productionDefectCode).filter(code => code);

            // 불량 정보 조회
            const queryBuilder = this.productionDefectRepository.createQueryBuilder('defect');
            
            if (defectCodes.length > 0) {
                queryBuilder.where('defect.productionDefectCode IN (:...defectCodes)', { defectCodes });
            } else {
                queryBuilder.where('1 = 0'); // 결과가 없도록 설정
            }

            // 정렬 (최신순)
            queryBuilder.orderBy('defect.createdAt', 'DESC');

            // 페이지네이션
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);

            // 조회
            const [defects, total] = await queryBuilder.getManyAndCount();

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '프로젝트별 불량현황 조회',
                action: 'READ_SUCCESS',
                username: 'system',
                targetId: projectCode,
                details: `프로젝트별 불량현황 조회 완료: ${projectCode} (${total}건)`
            });

            return {
                success: true,
                data: {
                    defects,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    projectCode
                }
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '프로젝트별 불량현황 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: projectCode,
                details: `프로젝트별 불량현황 조회 실패: ${error.message}`
            });

            throw error;
        }
    }
}
