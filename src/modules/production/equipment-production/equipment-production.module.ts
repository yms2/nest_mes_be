import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from './entities/production.entity';
import { ProductionDefectQuantity } from './entities/productionDefect.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { BomProcess } from '@/modules/base-info/bom-info/entities/bom-process.entity';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { InventoryLot } from '@/modules/inventory/inventory-management/entities/inventory-lot.entity';
import { Warehouse } from '@/modules/inventory/warehouse/entities/warehouse.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { ProductionStartService } from './services/production-start.service';
import { ProductionEndService } from './services/production-end.service';
import { ProductionResultReadService } from './services/production-result-read.service';
import { ProductionResultDownloadService } from './services/production-result-download.service';
import { ProductionDefectReadService } from './services/production-defect-read.service';
import { ProductionDefectDownloadService } from './services/production-defect-download.service';
import { ProductionStartController } from './controllers/production-start.controller';
import { ProductionCurrentController } from './controllers/production-current.controller';
import { ProductionEndController } from './controllers/production-end.controller';
import { ProductionCompletedController } from './controllers/production-completed.controller';
import { ProductionResultReadController } from './controllers/production-result-read.controller';
import { ProductionResultDownloadController } from './controllers/production-result-download.controller';
import { ProductionDefectReadController } from './controllers/production-defect-read.controller';
import { ProductionDefectDownloadController } from './controllers/production-defect-download.controller';
import { CommonModule } from '@/common/common.module';
import { InventoryLogsModule } from '@/modules/inventory/inventory-logs/inventory-logs.module';
import { LogModule } from '@/modules/log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Production,
      ProductionDefectQuantity,
      ProductionInstruction,
      ProductionPlan,
      BomProcess,
      BomInfo,
      Inventory,
      InventoryLot,
      Warehouse,
      ProductInfo,
    ]),
    CommonModule,
    InventoryLogsModule,
    LogModule,
  ],
  controllers: [
    ProductionStartController,
    ProductionCurrentController,
    ProductionEndController,
    ProductionCompletedController,
    ProductionResultReadController,
    ProductionResultDownloadController,
    ProductionDefectReadController,
    ProductionDefectDownloadController,
  ],
  providers: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
    ProductionResultDownloadService,
    ProductionDefectReadService,
    ProductionDefectDownloadService,
  ],
  exports: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
    ProductionResultDownloadService,
    ProductionDefectReadService,
    ProductionDefectDownloadService,
  ],
})
export class EquipmentProductionModule {}
