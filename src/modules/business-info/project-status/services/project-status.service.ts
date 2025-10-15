import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    ProjectStatusResponseDto,
    EstimateInfoDto
} from '../dto/project-status.dto';

@Injectable()
export class ProjectStatusService {
    constructor(
        @InjectRepository(OrderManagement)
        private orderManagementRepository: Repository<OrderManagement>,
        @InjectRepository(OrderMain)
        private orderMainRepository: Repository<OrderMain>,
        @InjectRepository(ProductionPlan)
        private productionPlanRepository: Repository<ProductionPlan>,
        @InjectRepository(Shipping)
        private shippingRepository: Repository<Shipping>,
        @InjectRepository(Receiving)
        private receivingRepository: Repository<Receiving>,
        @InjectRepository(Delivery)
        private deliveryRepository: Repository<Delivery>,
        @InjectRepository(Claim)
        private claimRepository: Repository<Claim>,
        @InjectRepository(EstimateManagement)
        private estimateManagementRepository: Repository<EstimateManagement>,
        @InjectRepository(EstimateDetail)
        private estimateDetailRepository: Repository<EstimateDetail>,
        @InjectRepository(Production)
        private productionRepository: Repository<Production>,
        @InjectRepository(ProductionInstruction)
        private productionInstructionRepository: Repository<ProductionInstruction>,
        @InjectRepository(QualityInspection)
        private qualityInspectionRepository: Repository<QualityInspection>,
    ) {}

    /**
     * 프로젝트 현황 조회 (FLAT 구조)
     * @param queryDto 조회 조건
     * @returns 프로젝트 현황 정보
     */
    async getProjectStatus(queryDto: ProjectStatusQueryDto): Promise<ProjectStatusResponseDto[]> {
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
                projectVersion: estimate.projectVersion || '',
                estimateDate: estimate.estimateDate,
                customerCode: estimate.customerCode,
                customerName: estimate.customerName,
                productCode: estimate.productCode,
                productName: estimate.productName,
                specification: estimate.itemSpecification,
                projectStartDate: null,
                projectEndDate: null,
                orderDate: orderDates.length > 0 ? orderDates[0] : null,
                bomDate: orderDates.length > 0 ? orderDates[0] : null, // 수주일과 동일
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

        // 견적일 기준으로 정렬
        return projectStatusList.sort((a, b) => new Date(b.estimateDate).getTime() - new Date(a.estimateDate).getTime());
    }


    /**
     * 견적 상세 정보 조회
     */
    private async getEstimateList(projectCode?: string, startDate?: string, endDate?: string): Promise<EstimateInfoDto[]> {
        const queryBuilder = this.estimateManagementRepository.createQueryBuilder('em')
            .leftJoinAndSelect('em.estimateDetails', 'ed')
            .select([
                'em.projectCode',
                'em.projectName',
                'em.estimateCode',
                'em.estimateName', 
                'em.estimateDate',
                'em.customerCode',
                'em.customerName',
                'em.productCode',
                'em.productName',
                'em.productQuantity',
                'em.estimatePrice',
                'em.estimateStatus',
                'ed.itemSpecification'
            ]);

        if (projectCode) {
            queryBuilder.andWhere('em.projectCode = :projectCode', { projectCode });
        }

        if (startDate) {
            queryBuilder.andWhere('em.estimateDate >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('em.estimateDate <= :endDate', { endDate });
        }

        queryBuilder.orderBy('em.estimateDate', 'DESC');

        const results = await queryBuilder.getMany();

        return results.map(item => ({
            projectCode: item.projectCode,
            projectName: item.projectName,
            projectVersion: '',
            estimateCode: item.estimateCode,
            estimateName: item.estimateName,
            estimateDate: item.estimateDate,
            customerCode: item.customerCode,
            customerName: item.customerName,
            productCode: item.productCode,
            productName: item.productName,
            itemSpecification: item.estimateDetails?.[0]?.itemSpecification,
            quantity: item.productQuantity,
            estimatePrice: item.estimatePrice,
            estimateStatus: item.estimateStatus,
            projectStartDate: undefined,
            projectEndDate: undefined
        }));
    }

    /**
     * 수주 날짜 조회
     */
    private async getOrderDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.orderManagementRepository.createQueryBuilder('om')
            .select(['om.orderDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('om.orderDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.orderDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 발주 날짜 조회
     */
    private async getOrderMainDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.orderMainRepository.createQueryBuilder('om')
            .select(['om.orderDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('om.orderDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.orderDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 생산계획 날짜 조회 (ProductionPlan → OrderManagement → projectCode)
     */
    private async getProductionPlanDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.productionPlanRepository.createQueryBuilder('pp')
            .leftJoin(OrderManagement, 'om', 'pp.orderCode = om.orderCode')
            .select(['pp.productionPlanDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('pp.productionPlanDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.productionPlanDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 출하 날짜 조회
     */
    private async getShippingDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.shippingRepository.createQueryBuilder('s')
            .select(['s.shippingDate'])
            .where('s.projectCode = :projectCode', { projectCode })
            .orderBy('s.shippingDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.shippingDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 입고 날짜 조회 (Receiving → OrderManagement → projectCode)
     */
    private async getReceivingDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.receivingRepository.createQueryBuilder('r')
            .leftJoin(OrderManagement, 'om', 'r.orderCode = om.orderCode')
            .select(['r.receivingDate'])
            .where('om.projectCode = :projectCode', { projectCode })
            .orderBy('r.receivingDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.receivingDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 납품 날짜 조회
     */
    private async getDeliveryDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.deliveryRepository.createQueryBuilder('d')
            .select(['d.deliveryDate'])
            .where('d.projectCode = :projectCode', { projectCode })
            .orderBy('d.deliveryDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.deliveryDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 생산완료일 조회 (Production → ProductionInstruction → ProductionPlan → projectCode)
     */
    private async getProductionCompleteDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.productionRepository.createQueryBuilder('p')
            .leftJoin(ProductionInstruction, 'pi', 'p.productionInstructionCode = pi.productionInstructionCode')
            .leftJoin(ProductionPlan, 'pp', 'pi.productionPlanCode = pp.productionPlanCode')
            .select(['p.productionCompletionDate'])
            .where('pp.projectCode = :projectCode', { projectCode })
            .andWhere('p.productionCompletionDate IS NOT NULL')
            .orderBy('p.productionCompletionDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.productionCompletionDate).filter(date => date !== null && date !== undefined);
    }

    /**
     * 품질검사일 조회 (QualityInspection → Production → ProductionInstruction → ProductionPlan → projectCode)
     */
    private async getQualityInspectionDates(projectCode: string): Promise<Date[]> {
        const queryBuilder = this.qualityInspectionRepository.createQueryBuilder('qi')
            .leftJoin(Production, 'p', 'qi.productionCode = p.productionCode')
            .leftJoin(ProductionInstruction, 'pi', 'p.productionInstructionCode = pi.productionInstructionCode')
            .leftJoin(ProductionPlan, 'pp', 'pi.productionPlanCode = pp.productionPlanCode')
            .select(['qi.inspectionDate'])
            .where('pp.projectCode = :projectCode', { projectCode })
            .orderBy('qi.inspectionDate', 'DESC');

        const results = await queryBuilder.getMany();
        return results.map(item => item.inspectionDate).filter(date => date !== null && date !== undefined);
    }

}
