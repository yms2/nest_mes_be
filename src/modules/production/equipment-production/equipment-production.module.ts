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
import { ProductionStartController } from './controllers/production-start.controller';
import { ProductionEndController } from './controllers/production-end.controller';
import { ProductionResultReadController } from './controllers/production-result-read.controller';
import { CommonModule } from '@/common/common.module';

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
  ],
  controllers: [
    ProductionStartController,
    ProductionEndController,
    ProductionResultReadController,
  ],
  providers: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
  ],
  exports: [
    ProductionStartService,
    ProductionEndService,
    ProductionResultReadService,
  ],
})
export class EquipmentProductionModule {}
