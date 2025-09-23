import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from './entities/production.entity';
import { ProductionDefectQuantity } from './entities/productionDefect.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { BomProcess } from '@/modules/base-info/bom-info/entities/bom-process.entity';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { ProductionStartService } from './services/production-start.service';
import { ProductionEndService } from './services/production-end.service';
import { ProductionResultReadService } from './services/production-result-read.service';
import { ProductionResultDownloadService } from './services/production-result-download.service';
<<<<<<< HEAD
=======
import { ProductionDefectReadService } from './services/production-defect-read.service';
import { ProductionDefectDownloadService } from './services/production-defect-download.service';
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
import { ProductionStartController } from './controllers/production-start.controller';
import { ProductionEndController } from './controllers/production-end.controller';
import { ProductionResultReadController } from './controllers/production-result-read.controller';
import { ProductionResultDownloadController } from './controllers/production-result-download.controller';
<<<<<<< HEAD
import { CommonModule } from '@/common/common.module';
import { InventoryLogsModule } from '@/modules/inventory/inventory-logs/inventory-logs.module';
=======
import { ProductionDefectReadController } from './controllers/production-defect-read.controller';
import { ProductionDefectDownloadController } from './controllers/production-defect-download.controller';
import { CommonModule } from '@/common/common.module';
import { InventoryLogsModule } from '@/modules/inventory/inventory-logs/inventory-logs.module';
import { LogModule } from '@/modules/log/log.module';
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04

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
    ]),
    CommonModule,
    InventoryLogsModule,
<<<<<<< HEAD
=======
    LogModule,
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
  ],
  controllers: [
    ProductionStartController,
    ProductionEndController,
    ProductionResultReadController,
    ProductionResultDownloadController,
<<<<<<< HEAD
=======
    ProductionDefectReadController,
    ProductionDefectDownloadController,
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
  ],
  providers: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
    ProductionResultDownloadService,
<<<<<<< HEAD
=======
    ProductionDefectReadService,
    ProductionDefectDownloadService,
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
  ],
  exports: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
    ProductionResultDownloadService,
<<<<<<< HEAD
=======
    ProductionDefectReadService,
    ProductionDefectDownloadService,
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
  ],
})
export class EquipmentProductionModule {}
