import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductInfo } from 'src/modules/base-info/product-info/product_sample/entities/product-info.entity';

import * as controllers from './controllers';
import * as services from './services';
import { InventoryLogsModule } from '../inventory-logs/inventory-logs.module';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, ProductInfo]),
    InventoryLogsModule,
  ],
  controllers: controllerArray,
  providers: [...serviceArray],
  exports: [...serviceArray],
})
export class InventoryManagementModule {}
