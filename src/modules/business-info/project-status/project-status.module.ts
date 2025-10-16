import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectStatusController } from './controllers/project-status.controller';
import { ProjectStatusService } from './services/project-status.service';
import { ProjectStatusExcelController } from './controllers/project-status-excel.controller';
import { ProjectStatusExcelService } from './services/project-status-excel.service';
import { OrderManagement } from '../ordermanagement-info/entities/ordermanagement.entity';
import { OrderMain } from '../order-info/entities/order-main.entity';
import { ProductionPlan } from '../../production/plan/entities/production-plan.entity';
import { Shipping } from '../shipping-info/entities/shipping.entity';
import { Receiving } from '../receiving-management/entities/receiving.entity';
import { Delivery } from '../delivery-management-info/entities/delivery.entity';
import { Claim } from '../../quality/claim/entities/claim.entity';
import { EstimateManagement } from '../estimatemanagement-info/entities/estimatemanagement.entity';
import { EstimateDetail } from '../estimatemanagement-info/entities/estimate-detail.entity';
import { Production } from '../../production/equipment-production/entities/production.entity';
import { ProductionInstruction } from '../../production/instruction/entities/production-instruction.entity';
import { QualityInspection } from '../../quality/inspection/entities/quality-inspection.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderManagement,
            OrderMain,
            ProductionPlan,
            Shipping,
            Receiving,
            Delivery,
            Claim,
            EstimateManagement,
            EstimateDetail,
            Production,
            ProductionInstruction,
            QualityInspection
        ])
    ],
    controllers: [ProjectStatusController, ProjectStatusExcelController],
    providers: [ProjectStatusService, ProjectStatusExcelService],
    exports: [ProjectStatusService, ProjectStatusExcelService]
})
export class ProjectStatusModule {}
