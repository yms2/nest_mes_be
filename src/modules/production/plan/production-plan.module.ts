import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlan } from './entities/production-plan.entity';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { ProductionPlanController } from './controllers/production-plan.controller';
import { BomExplosionController } from './controllers/bom-explosion.controller';
import { DirectProductionPlanController } from './controllers/direct-production-plan.controller';
import { ProductionPlanCreateService } from './services/production-plan-create.service';
import { ProductionPlanReadService } from './services/production-plan-read.service';
import { BomExplosionService } from './services/bom-explosion.service';
import { DirectProductionPlanCreateService } from './services/direct-production-plan-create.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionPlan,
      BomInfo,
      ProductInfo,
      OrderManagement,
      Inventory,
    ]),
  ],
  controllers: [
    ProductionPlanController,
    BomExplosionController,
    DirectProductionPlanController,
  ],
  providers: [
    ProductionPlanCreateService,
    ProductionPlanReadService,
    BomExplosionService,
    DirectProductionPlanCreateService,
  ],
  exports: [
    ProductionPlanCreateService,
    ProductionPlanReadService,
    BomExplosionService,
    DirectProductionPlanCreateService,
  ],
})
export class ProductionPlanModule {}
    