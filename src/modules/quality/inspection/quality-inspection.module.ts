import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityInspection } from './entities/quality-inspection.entity';
import { Production } from '@/modules/production/equipment-production/entities/production.entity';
import { LogModule } from '@/modules/log/log.module';
import { QualityInspectionService } from './services/quality-inspection.service';
import { QualityInspectionController } from './controllers/quality-inspection.controller';
import { QualityInspectionDownloadService } from './services/quality-inspection-download.service';
import { QualityInspectionDownloadController } from './controllers/quality-inspection-download.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([QualityInspection, Production]),
        LogModule
    ],
    controllers: [QualityInspectionController, QualityInspectionDownloadController],
    providers: [QualityInspectionService, QualityInspectionDownloadService],
    exports: [QualityInspectionService, QualityInspectionDownloadService],
})
export class QualityInspectionModule {}
