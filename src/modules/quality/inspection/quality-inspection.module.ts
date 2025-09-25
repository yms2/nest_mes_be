import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityInspection } from './entities/quality-inspection.entity';
import { Production } from '@/modules/production/equipment-production/entities/production.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { LogModule } from '@/modules/log/log.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { QualityInspectionService } from './services/quality-inspection.service';
import { QualityInspectionController } from './controllers/quality-inspection.controller';
import { QualityInspectionDownloadService } from './services/quality-inspection-download.service';
import { QualityInspectionDownloadController } from './controllers/quality-inspection-download.controller';
import { QualityInspectionApprovalService } from './services/quality-inspection-approval.service';
import { QualityInspectionApprovalController } from './controllers/quality-inspection-approval.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([QualityInspection, Production, Inventory]),
        LogModule,
        NotificationModule
    ],
    controllers: [QualityInspectionController, QualityInspectionDownloadController, QualityInspectionApprovalController],
    providers: [QualityInspectionService, QualityInspectionDownloadService, QualityInspectionApprovalService],
    exports: [QualityInspectionService, QualityInspectionDownloadService, QualityInspectionApprovalService],
})
export class QualityInspectionModule {}
