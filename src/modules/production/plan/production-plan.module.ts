import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionPlan } from './entities/production-plan.entity';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { CustomerInfo } from '@/modules/base-info/customer-info/entities/customer-info.entity';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import * as controllers from './controllers';
import * as services from './services';
import { LogModule } from '@/modules/log/log.module';
import { CommonModule } from '@/common/common.module';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionPlan,
      BomInfo,
      ProductInfo,
      CustomerInfo,
      OrderManagement,
      Inventory,
    ]),
    CommonModule,
    LogModule,
  ],
  controllers: [
    ...controllerArray,
  ],
  providers: [
    ...serviceArray,
  ],
  exports: [
    ...serviceArray,
  ],
})
export class ProductionPlanModule {}
    