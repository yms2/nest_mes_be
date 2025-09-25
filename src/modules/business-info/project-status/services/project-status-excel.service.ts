import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { OrderMain } from '../../order-info/entities/order-main.entity';
import { ProductionPlan } from '../../../production/plan/entities/production-plan.entity';
import { Shipping } from '../../shipping-info/entities/shipping.entity';
import { Receiving } from '../../receiving-management/entities/receiving.entity';
import { Delivery } from '../../delivery-management-info/entities/delivery.entity';
import { Claim } from '../../../quality/claim/entities/claim.entity';
import { EstimateManagement } from '../../estimatemanagement-info/entities/estimatemanagement.entity';
import { EstimateDetail } from '../../estimatemanagement-info/entities/estimate-detail.entity';
import { Production } from '../../../production/equipment-production/entities/production.entity';
import { ProductionInstruction } from '../../../production/instruction/entities/production-instruction.entity';
import { QualityInspection } from '../../../quality/inspection/entities/quality-inspection.entity';
import { 
    ProjectStatusQueryDto, 
    ProjectStatusResponseDto
} from '../dto/project-status.dto';

@Injectable()
export class ProjectStatusExcelService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        @InjectRepository(OrderMain)
        private readonly orderMainRepository: Repository<OrderMain>,
        @InjectRepository(ProductionPlan)
        private readonly productionPlanRepository: Repository<ProductionPlan>,
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(Claim)
        private readonly claimRepository: Repository<Claim>,
        @InjectRepository(EstimateManagement)
        private readonly estimateManagementRepository: Repository<EstimateManagement>,
        @InjectRepository(EstimateDetail)
        private readonly estimateDetailRepository: Repository<EstimateDetail>,
        @InjectRepository(Production)
        private readonly productionRepository: Repository<Production>,
        @InjectRepository(ProductionInstruction)
        private readonly productionInstructionRepository: Repository<ProductionInstruction>,
        @InjectRepository(QualityInspection)
        private readonly qualityInspectionRepository: Repository<QualityInspection>,
    ) {}

    /**
     * 프로젝트 현황 Excel 다운로드
     */
    async exportProjectStatusToExcel(queryDto: ProjectStatusQueryDto): Promise<Buffer> {
        try {
            // 1. 프로젝트 현황 데이터 수집
            const projectStatusList = await this.getProjectStatus(queryDto);

            // 2. Excel 워크북 생성
            const workbook = XLSX.utils.book_new();

            // 3. 프로젝트 현황 시트 생성
            this.createProjectStatusSheet(workbook, projectStatusList);

            // 4. 요약 시트 생성
            this.createSummarySheet(workbook, projectStatusList);

            // 5. Excel 파일 생성
            const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            return excelBuffer;
        } catch (error) {
            throw new Error(`Excel 파일 생성 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 프로젝트 현황 데이터 조회 (기존 로직과 동일)
     */
    private async getProjectStatus(queryDto: ProjectStatusQueryDto): Promise<ProjectStatusResponseDto[]> {
        const { projectCode, startDate, endDate } = queryDto;

        // 견적을 기준으로 프로젝트 정보 조회
        const estimateList = await this.getEstimateList(projectCode, startDate, endDate);

        // 견적이 없는 경우 빈 배열 반환
        if (estimateList.length === 0) {
            return [];
        }

        // 각 프로젝트별로 다른 단계의 날짜들을 조회
        const projectStatusList: ProjectStatusResponseDto[] = [];

        for (const estimate of estimateList) {
            const projectCode = estimate.projectCode;
            
            // 각 단계별 날짜 조회
            const [
                orderDates,
                orderMainDates,
                receivingDates,
                productionPlanDates,
                productionCompleteDates,
                qualityInspectionDates,
                shippingDates,
                deliveryDates
            ] = await Promise.all([
                this.getOrderDates(projectCode),
                this.getOrderMainDates(projectCode),
                this.getReceivingDates(projectCode),
                this.getProductionPlanDates(projectCode),
                this.getProductionCompleteDates(projectCode),
                this.getQualityInspectionDates(projectCode),
                this.getShippingDates(projectCode),
                this.getDeliveryDates(projectCode)
            ]);

            // 프로젝트 현황 객체 생성
            const projectStatus: ProjectStatusResponseDto = {
                projectCode: estimate.projectCode,
                projectName: estimate.projectName,
                projectVersion: '', // 제거됨
                estimateDate: estimate.estimateDate,
                customerCode: estimate.customerCode,
                customerName: estimate.customerName,
                productCode: estimate.productCode,
                productName: estimate.productName,
                specification: '', // EstimateManagement에 없음
                projectStartDate: estimate.projectStartDate,
                projectEndDate: estimate.projectEndDate,
                orderDate: orderDates.length > 0 ? orderDates[0] : null,
                bomDate: null, // EstimateDetail에 없음
                orderMainDate: orderMainDates.length > 0 ? orderMainDates[0] : null,
                receivingDate: receivingDates.length > 0 ? receivingDates[0] : null,
                productionPlanDate: productionPlanDates.length > 0 ? productionPlanDates[0] : null,
                productionCompleteDate: productionCompleteDates.length > 0 ? productionCompleteDates[0] : null,
                qualityInspectionDate: qualityInspectionDates.length > 0 ? qualityInspectionDates[0] : null,
                shippingDate: shippingDates.length > 0 ? shippingDates[0] : null,
                deliveryDate: deliveryDates.length > 0 ? deliveryDates[0] : null
            };

            projectStatusList.push(projectStatus);
        }

        return projectStatusList;
    }

    /**
     * 견적 목록 조회
     */
    private async getEstimateList(projectCode?: string, startDate?: string, endDate?: string): Promise<any[]> {
        const queryBuilder = this.estimateManagementRepository
            .createQueryBuilder('em')
            .leftJoin(EstimateDetail, 'ed', 'em.id = ed.estimateId')
            .select([
                'em.projectCode',
                'em.projectName',
                'em.customerCode',
                'em.customerName',
                'em.productCode',
                'em.productName',
                'em.estimateDate',
                'em.projectStartDate',
                'em.projectEndDate'
            ])
            .orderBy('em.projectCode', 'ASC')
            .addOrderBy('em.estimateDate', 'ASC');

        if (projectCode) {
            queryBuilder.andWhere('em.projectCode = :projectCode', { projectCode });
        }

        if (startDate) {
            queryBuilder.andWhere('em.estimateDate >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('em.estimateDate <= :endDate', { endDate });
        }

        return await queryBuilder.getMany();
    }

    /**
     * 수주일 조회
     */
    private async getOrderDates(projectCode: string): Promise<Date[]> {
        const results = await this.orderManagementRepository
            .createQueryBuilder('om')
            .select(['om.orderDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('om.orderDate', 'ASC')
            .getMany();

        return results.map(item => item.orderDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 발주일 조회
     */
    private async getOrderMainDates(projectCode: string): Promise<Date[]> {
        const results = await this.orderMainRepository
            .createQueryBuilder('ord')
            .leftJoin(OrderManagement, 'om', 'ord.orderCode = om.orderCode')
            .select(['ord.orderDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('ord.orderDate', 'ASC')
            .getMany();

        return results.map(item => item.orderDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 입고일 조회
     */
    private async getReceivingDates(projectCode: string): Promise<Date[]> {
        const results = await this.receivingRepository
            .createQueryBuilder('r')
            .leftJoin(OrderMain, 'ord', 'r.orderCode = ord.orderCode')
            .leftJoin(OrderManagement, 'om', 'ord.orderCode = om.orderCode')
            .select(['r.receivingDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('r.receivingDate', 'ASC')
            .getMany();

        return results.map(item => item.receivingDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 생산계획일 조회
     */
    private async getProductionPlanDates(projectCode: string): Promise<Date[]> {
        const results = await this.productionPlanRepository
            .createQueryBuilder('pp')
            .leftJoin(OrderManagement, 'om', 'pp.orderCode = om.orderCode')
            .select(['pp.productionPlanDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('pp.productionPlanDate', 'ASC')
            .getMany();

        return results.map(item => item.productionPlanDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 생산완료일 조회
     */
    private async getProductionCompleteDates(projectCode: string): Promise<Date[]> {
        const results = await this.productionRepository
            .createQueryBuilder('p')
            .leftJoin(ProductionInstruction, 'pi', 'p.productionInstructionCode = pi.productionInstructionCode')
            .leftJoin(ProductionPlan, 'pp', 'pi.productionPlanCode = pp.productionPlanCode')
            .leftJoin(OrderManagement, 'om', 'pp.orderCode = om.orderCode')
            .select(['p.productionCompletionDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('p.productionCompletionDate', 'ASC')
            .getMany();

        return results.map(item => item.productionCompletionDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 품질검사일 조회
     */
    private async getQualityInspectionDates(projectCode: string): Promise<Date[]> {
        const results = await this.qualityInspectionRepository
            .createQueryBuilder('qi')
            .leftJoin(Production, 'p', 'qi.productionCode = p.productionCode')
            .leftJoin(ProductionInstruction, 'pi', 'p.productionInstructionCode = pi.productionInstructionCode')
            .leftJoin(ProductionPlan, 'pp', 'pi.productionPlanCode = pp.productionPlanCode')
            .leftJoin(OrderManagement, 'om', 'pp.orderCode = om.orderCode')
            .select(['qi.inspectionDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('qi.inspectionDate', 'ASC')
            .getMany();

        return results.map(item => item.inspectionDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 출하일 조회
     */
    private async getShippingDates(projectCode: string): Promise<Date[]> {
        const results = await this.shippingRepository
            .createQueryBuilder('s')
            .leftJoin(OrderManagement, 'om', 's.orderCode = om.orderCode')
            .select(['s.shippingDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('s.shippingDate', 'ASC')
            .getMany();

        return results.map(item => item.shippingDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 납품일 조회
     */
    private async getDeliveryDates(projectCode: string): Promise<Date[]> {
        const results = await this.deliveryRepository
            .createQueryBuilder('d')
            .leftJoin(Shipping, 's', 'd.shippingCode = s.shippingCode')
            .leftJoin(OrderManagement, 'om', 's.orderCode = om.orderCode')
            .select(['d.deliveryDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('d.deliveryDate', 'ASC')
            .getMany();

        return results.map(item => item.deliveryDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 프로젝트 현황 시트 생성
     */
    private createProjectStatusSheet(workbook: XLSX.WorkBook, projectStatusList: ProjectStatusResponseDto[]): void {
        const projectData = projectStatusList.map(item => ({
            '프로젝트코드': item.projectCode,
            '프로젝트명': item.projectName,
            '고객명': item.customerName,
            '품목명': item.productName,
            '규격': item.specification,
            '견적일': item.estimateDate ? new Date(item.estimateDate).toLocaleDateString() : '',
            '프로젝트시작일': item.projectStartDate ? new Date(item.projectStartDate).toLocaleDateString() : '',
            '프로젝트종료일': item.projectEndDate ? new Date(item.projectEndDate).toLocaleDateString() : '',
            '수주일': item.orderDate ? new Date(item.orderDate).toLocaleDateString() : '',
            '설계일': item.bomDate ? new Date(item.bomDate).toLocaleDateString() : '',
            '발주일': item.orderMainDate ? new Date(item.orderMainDate).toLocaleDateString() : '',
            '입고일': item.receivingDate ? new Date(item.receivingDate).toLocaleDateString() : '',
            '생산계획일': item.productionPlanDate ? new Date(item.productionPlanDate).toLocaleDateString() : '',
            '생산완료일': item.productionCompleteDate ? new Date(item.productionCompleteDate).toLocaleDateString() : '',
            '품질검사일': item.qualityInspectionDate ? new Date(item.qualityInspectionDate).toLocaleDateString() : '',
            '출하일': item.shippingDate ? new Date(item.shippingDate).toLocaleDateString() : '',
            '납품일': item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(projectData);
        
        // 컬럼 너비 설정
        worksheet['!cols'] = [
            { width: 15 }, // 프로젝트코드
            { width: 20 }, // 프로젝트명
            { width: 15 }, // 고객명
            { width: 20 }, // 품목명
            { width: 25 }, // 규격
            { width: 12 }, // 견적일
            { width: 12 }, // 프로젝트시작일
            { width: 12 }, // 프로젝트종료일
            { width: 12 }, // 수주일
            { width: 12 }, // 설계일
            { width: 12 }, // 발주일
            { width: 12 }, // 입고일
            { width: 12 }, // 생산계획일
            { width: 12 }, // 생산완료일
            { width: 12 }, // 품질검사일
            { width: 12 }, // 출하일
            { width: 12 }  // 납품일
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, '프로젝트현황');
    }

    /**
     * 요약 시트 생성
     */
    private createSummarySheet(workbook: XLSX.WorkBook, projectStatusList: ProjectStatusResponseDto[]): void {
        const now = new Date();
        
        // 프로젝트별 진행률 계산
        const projectMap = new Map<string, any>();
        
        projectStatusList.forEach(item => {
            if (!projectMap.has(item.projectCode)) {
                projectMap.set(item.projectCode, {
                    projectCode: item.projectCode,
                    projectName: item.projectName,
                    customerName: item.customerName,
                    productName: item.productName,
                    steps: {
                        estimate: !!item.estimateDate,
                        order: !!item.orderDate,
                        bom: !!item.bomDate,
                        orderMain: !!item.orderMainDate,
                        receiving: !!item.receivingDate,
                        productionPlan: !!item.productionPlanDate,
                        productionComplete: !!item.productionCompleteDate,
                        qualityInspection: !!item.qualityInspectionDate,
                        shipping: !!item.shippingDate,
                        delivery: !!item.deliveryDate,
                        claim: false // 클레임 정보 제거
                    }
                });
            }
        });

        // 진행률 계산
        const projects = Array.from(projectMap.values()).map(project => {
            const completedSteps = Object.values(project.steps).filter(completed => completed).length;
            const totalSteps = Object.keys(project.steps).length;
            const progress = Math.round((completedSteps / totalSteps) * 100);
            
            return {
                ...project,
                completedSteps,
                totalSteps,
                progress
            };
        });

        // 요약 데이터 생성
        const summaryData = [
            ['프로젝트 현황 요약 보고서', ''],
            ['보고서 생성일', now.toLocaleDateString()],
            ['', ''],
            ['=== 전체 현황 ===', ''],
            ['총 프로젝트 수', projects.length],
            ['완료된 프로젝트', projects.filter(p => p.progress === 100).length],
            ['진행 중인 프로젝트', projects.filter(p => p.progress > 0 && p.progress < 100).length],
            ['시작 전 프로젝트', projects.filter(p => p.progress === 0).length],
            ['평균 진행률', projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) + '%' : '0%'],
            ['', ''],
            ['=== 단계별 완료 현황 ===', ''],
            ['견적 완료', projects.filter(p => p.steps.estimate).length],
            ['수주 완료', projects.filter(p => p.steps.order).length],
            ['설계 완료', projects.filter(p => p.steps.bom).length],
            ['발주 완료', projects.filter(p => p.steps.orderMain).length],
            ['입고 완료', projects.filter(p => p.steps.receiving).length],
            ['생산계획 완료', projects.filter(p => p.steps.productionPlan).length],
            ['생산완료', projects.filter(p => p.steps.productionComplete).length],
            ['품질검사 완료', projects.filter(p => p.steps.qualityInspection).length],
            ['출하 완료', projects.filter(p => p.steps.shipping).length],
            ['납품 완료', projects.filter(p => p.steps.delivery).length],
            ['', ''],
            ['=== 프로젝트별 상세 현황 ===', ''],
            ['프로젝트코드', '프로젝트명', '고객명', '품목명', '완료단계', '전체단계', '진행률'],
            ...projects.map(p => [
                p.projectCode,
                p.projectName,
                p.customerName,
                p.productName,
                p.completedSteps,
                p.totalSteps,
                p.progress + '%'
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
        
        // 컬럼 너비 설정
        worksheet['!cols'] = [
            { width: 25 },
            { width: 20 },
            { width: 15 },
            { width: 20 },
            { width: 15 },
            { width: 10 },
            { width: 10 },
            { width: 10 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, '요약현황');
    }
}
